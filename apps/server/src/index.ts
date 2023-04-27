import { TRPCError, initTRPC } from '@trpc/server'
import argon2 from 'argon2'
import { z } from 'zod'
import { db } from './database'
import { cronBackup } from './crons/backup'
import { runScript } from './utils'
import { type Context } from './context'
import jwt from 'jsonwebtoken'

const { JWT_SECRET } = process.env

if (JWT_SECRET === undefined) {
  throw new Error('JWT_SECRET must be set')
}

export const t = initTRPC.context<Context>().create()

export const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (ctx.user?.id === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return await next({
    ctx: {
      user: ctx.user
    }
  })
})

const router = t.router
const publicProcedure = t.procedure
const authedProcedure = publicProcedure.use(isAuthed)

export const appRouter = router({
  userCreate: publicProcedure
    .input(
      z.object({
        name: z.string().regex(/^[a-z][-a-z0-9_]*\$?$/),
        password: z.string(),
        sshKey: z.string()
      })
    )
    .mutation(async (req) => {
      const userExists = (await db
        .selectFrom('user')
        .select('id')
        .where('name', '=', req.input.name)
        .executeTakeFirst())
        ?.id !== undefined

      if (userExists) {
        throw new TRPCError({ code: 'CONFLICT' })
      }

      runScript('create_user', [
        req.input.name,
        req.input.password,
        req.input.sshKey
      ])

      runScript('create_database', [
        req.input.name,
        req.input.password,
        req.input.name.replace(/-/g, '_')
      ])

      const result = await db
        .insertInto('user')
        .values({
          name: req.input.name,
          password: await argon2.hash(req.input.password)
        })
        .executeTakeFirstOrThrow()

      return { id: Number(result.insertId) }
    }),
  userLogin: publicProcedure
    .input(z.object({
      name: z.string(),
      password: z.string()
    }))
    .query(async (req) => {
      const user = await db
        .selectFrom('user')
        .select(['id', 'password'])
        .where('name', '=', req.input.name)
        .executeTakeFirst()

      if (user === undefined) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      if (!await argon2.verify(user.password, req.input.password)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }

      return {
        token: jwt.sign({ id: user.id }, JWT_SECRET)
      }
    }),
  userStorage: authedProcedure
    .query(async ({ ctx }) => {
      const user = await db
        .selectFrom('user')
        .select(['name'])
        .where('id', '=', ctx.user.id)
        .executeTakeFirstOrThrow()

      const used = runScript('get_user_storage_used', [user.name])
      const available = runScript('get_user_storage_available', [user.name])

      return {
        storage: {
          used: parseInt(used),
          available: parseInt(available)
        }
      }
    }),
  userSshKey: authedProcedure
    .query(async ({ ctx }) => {
      const user = await db
        .selectFrom('user')
        .select(['name'])
        .where('id', '=', ctx.user.id)
        .executeTakeFirstOrThrow()

      const sshKey = runScript('get_user_ssh_key', [user.name])

      return {
        sshKey
      }
    }),
  userWebsites: authedProcedure
    .query(async ({ ctx }) => {
      const websites = await db
        .selectFrom('website')
        .select(['id', 'domain', 'access_path'])
        .where('user_id', '=', ctx.user.id)
        .execute()

      return {
        websites: websites.map((website) => ({
          id: Number(website.id),
          domain: website.domain,
          accessPath: website.access_path
        }))
      }
    }),
  addWebsite: authedProcedure
    .input(z.object({
      domain: z.string().regex(/^(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}$/),
      accessPath: z.string().regex(/^(\/[\w-]+)+$/)
    }))
    .mutation(async ({ input, ctx }) => {
      const websiteExists = (await db
        .selectFrom('website')
        .select('id')
        .where('domain', '=', input.domain)
        .executeTakeFirst())
        ?.id !== undefined

      if (websiteExists) {
        throw new TRPCError({ code: 'CONFLICT' })
      }

      const result = await db
        .insertInto('website')
        .values({
          domain: input.domain,
          access_path: input.accessPath,
          user_id: Number(ctx.user?.id)
        })
        .executeTakeFirstOrThrow()

      return { id: Number(result.insertId) }
    }),
  userBackups: authedProcedure
    .query(async ({ ctx }) => {
      const user = await db
        .selectFrom('user')
        .select(['name'])
        .where('id', '=', ctx.user.id)
        .executeTakeFirstOrThrow()

      const backups = runScript('get_user_backups', [user.name]).trim()

      return {
        backups: backups.split('\n').flatMap((backupTimestamp) => {
          if (backupTimestamp === '' || Number(backupTimestamp) === 0) {
            return []
          }

          return [{
            timestamp: Number(backupTimestamp)
          }]
        })
      }
    }),
  createBackup: authedProcedure
    .mutation(async ({ ctx }) => {
      const user = await db
        .selectFrom('user')
        .select(['name'])
        .where('id', '=', ctx.user.id)
        .executeTakeFirstOrThrow()

      runScript('create_backup', [user.name])
    }),
  restoreBackup: authedProcedure
    .input(z.object({
      timestamp: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db
        .selectFrom('user')
        .select(['name'])
        .where('id', '=', ctx.user.id)
        .executeTakeFirstOrThrow()

      runScript('restore_backup', [
        user.name,
        input.timestamp.toString()
      ])
    })
})

export type AppRouter = typeof appRouter

cronBackup.run()

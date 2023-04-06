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
  userStorage: publicProcedure
    .input(z.string().regex(/^[a-z][-a-z0-9_]*\$?$/))
    .query(async ({ input }) => {
      const used = runScript('get_user_storage_used', [input])
      const available = runScript('get_user_storage_available', [input])

      return {
        storage: {
          used: parseInt(used),
          available: parseInt(available)
        }
      }
    })
})

export type AppRouter = typeof appRouter

cronBackup.run()

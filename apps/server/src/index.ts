import { initTRPC } from '@trpc/server'
import argon2 from 'argon2'
import { z } from 'zod'
import { db } from './database'
import argon2 from 'argon2'
import { cronBackup } from './crons/backup'
import { runScript } from './utils'

const t = initTRPC.create()

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
      runScript('create_user', [
        req.input.name,
        req.input.password,
        req.input.sshKey
      ])
      const result = await db
        .insertInto('user')
        .values({
          name: req.input.name,
          password: await argon2.hash(req.input.password),
        })
        .executeTakeFirstOrThrow()

      return { id: Number(result.insertId) }
    }),
  userStorage: publicProcedure
    .input(z.string().regex(/^[a-z][-a-z0-9_]*\$?$/))
    .query(async ({ input }) => {
      const used = runScript('get_user_storage_used', [input])
      const available = runScript('get_user_storage_available', [input])

      return {
        storage: {
          used: parseInt(used),
          available: parseInt(available),
        },
      }
    }),
})

export type AppRouter = typeof appRouter

cronBackup.run()

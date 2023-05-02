import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import argon2 from 'argon2'
import { publicProcedure } from '../trpc'
import { db } from '../database'
import { runScript } from '../utils'

export const userCreate = publicProcedure
  .input(
    z.object({
      name: z.string().regex(/^[a-z][-a-z0-9_]*\$?$/),
      password: z.string(),
      sshKey: z.string()
    })
  )
  .mutation(async req => {
    const userExists =
      (
        await db
          .selectFrom('user')
          .select('id')
          .where('name', '=', req.input.name)
          .executeTakeFirst()
      )?.id !== undefined

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
  })

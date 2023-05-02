import { z } from 'zod'
import { authedProcedure } from '../trpc'
import { db } from '../database'
import argon2 from 'argon2'
import { TRPCError } from '@trpc/server'
import { runScript } from '../utils'

export const changePassword = authedProcedure
  .input(z.object({
    oldPassword: z.string(),
    newPassword: z.string()
  }))
  .mutation(async ({ input, ctx }) => {
    const user = await db
      .selectFrom('user')
      .select(['id', 'password', 'name'])
      .where('id', '=', ctx.user.id)
      .executeTakeFirstOrThrow()

    if (!await argon2.verify(user.password, input.oldPassword)) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    await db
      .updateTable('user')
      .set({
        password: await argon2.hash(input.newPassword)
      })
      .where('id', '=', user.id)
      .execute()

    runScript('change_user_password', [user.name, input.newPassword])
    runScript('change_user_db_password', [user.name, input.newPassword])
  })

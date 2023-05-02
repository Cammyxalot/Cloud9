import { z } from 'zod'
import { db } from '../database'
import { runScript } from '../utils'
import { authedProcedure } from '../trpc'

export const createDatabase = authedProcedure
  .input(z.object({
    name: z.string()
  }))
  .mutation(async ({ input, ctx }) => {
    const user = await db
      .selectFrom('user')
      .select(['name'])
      .where('id', '=', ctx.user.id)
      .executeTakeFirstOrThrow()

    runScript('create_database', [
      user.name,
      input.name,
      input.name.replace(/-/g, '_')
    ])
  })

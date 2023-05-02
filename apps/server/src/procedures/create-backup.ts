import { db } from '../database'
import { authedProcedure } from '../trpc'
import { runScript } from '../utils'

export const createBackup = authedProcedure
  .mutation(async ({ ctx }) => {
    const user = await db
      .selectFrom('user')
      .select(['name'])
      .where('id', '=', ctx.user.id)
      .executeTakeFirstOrThrow()

    runScript('create_backup', [user.name])
  })

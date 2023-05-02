import { z } from 'zod'
import { authedProcedure } from '../trpc'
import { db } from '../database'
import { runScript } from '../utils'

export const restoreBackup = authedProcedure
  .input(
    z.object({
      timestamp: z.number()
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await db
      .selectFrom('user')
      .select(['name'])
      .where('id', '=', ctx.user.id)
      .executeTakeFirstOrThrow()

    runScript('restore_backup', [user.name, input.timestamp.toString()])
  })

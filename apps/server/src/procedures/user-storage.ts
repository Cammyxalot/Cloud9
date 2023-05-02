import { authedProcedure } from '../trpc'
import { db } from '../database'
import { runScript } from '../utils'

export const userStorage = authedProcedure
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
  })

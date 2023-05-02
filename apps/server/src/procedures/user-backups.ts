import { db } from '../database'
import { authedProcedure } from '../trpc'
import { runScript } from '../utils'

export const userBackups = authedProcedure
  .query(async ({ ctx }) => {
    const user = await db
      .selectFrom('user')
      .select(['name'])
      .where('id', '=', ctx.user.id)
      .executeTakeFirstOrThrow()

    const backups = runScript('get_user_backups', [user.name]).trim()

    return {
      backups: backups.split('\n').flatMap(backupTimestamp => {
        if (backupTimestamp === '' || Number(backupTimestamp) === 0) {
          return []
        }

        return [
          {
            timestamp: Number(backupTimestamp)
          }]
      })
    }
  })

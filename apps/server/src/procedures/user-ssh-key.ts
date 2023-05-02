import { db } from '../database'
import { authedProcedure } from '../trpc'
import { runScript } from '../utils'

export const userSshKey = authedProcedure
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
  })

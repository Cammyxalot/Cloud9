import { db } from '../database'
import { authedProcedure } from '../trpc'
import { runScript } from '../utils'

export const userDatabases = authedProcedure
  .query(async ({ ctx }) => {
    const user = await db
      .selectFrom('user')
      .select(['name'])
      .where('id', '=', ctx.user.id)
      .executeTakeFirstOrThrow()

    const databasesName = runScript('get_user_databases_name', [user.name]).trim().split(' ')
    const databasesSize = runScript('get_user_databases_size', [user.name]).trim().split(' ').reduce<Array<{ name: string, size: number }>>((acc, cur, i) => {
      if (i % 2 === 0) {
        acc.push({
          name: cur,
          size: 0
        })
      } else {
        acc[acc.length - 1].size = parseFloat(cur)
      }

      return acc
    }, [])

    return {
      databases: databasesName.flatMap((databaseName) => {
        if (databaseName === '') {
          return []
        }

        const databaseSize = databasesSize.find((databaseSize) => databaseSize.name === databaseName)?.size

        return [{
          name: databaseName,
          size: databaseSize !== undefined ? databaseSize : 0
        }]
      })
    }
  })

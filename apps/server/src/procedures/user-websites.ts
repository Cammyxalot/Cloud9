import { db } from '../database'
import { authedProcedure } from '../trpc'

export const userWebsites = authedProcedure
  .query(async ({ ctx }) => {
    const websites = await db
      .selectFrom('website')
      .select(['id', 'domain', 'access_path'])
      .where('user_id', '=', ctx.user.id)
      .execute()

    return {
      websites: websites.map(website => ({
        id: Number(website.id),
        domain: website.domain,
        accessPath: website.access_path
      }))
    }
  })

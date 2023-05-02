import fs from 'fs'
import { z } from 'zod'
import { authedProcedure } from '../trpc'
import { db } from '../database'

export const downloadBackup = authedProcedure
  .input(z.object({
    timestamp: z.number()
  }))
  .query(async ({ input, ctx }) => {
    const user = await db
      .selectFrom('user')
      .select(['name'])
      .where('id', '=', ctx.user.id)
      .executeTakeFirstOrThrow()

    const data = fs.readFileSync(`/data/backups/${input.timestamp.toString()}/${user.name ?? ''}.tar.gz`)

    return {
      data: data.toString('base64')
    }
  })

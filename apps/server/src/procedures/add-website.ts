import { z } from 'zod'
import { authedProcedure } from '../trpc'
import { db } from '../database'
import { TRPCError } from '@trpc/server'

export const addWebsite = authedProcedure
  .input(
    z.object({
      domain: z
        .string()
        .regex(/^(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}$/),
      accessPath: z.string().regex(/^(\/[\w-]+)+$/)
    })
  )
  .mutation(async ({ input, ctx }) => {
    const websiteExists =
      (
        await db
          .selectFrom('website')
          .select('id')
          .where('domain', '=', input.domain)
          .executeTakeFirst()
      )?.id !== undefined

    if (websiteExists) {
      throw new TRPCError({ code: 'CONFLICT' })
    }

    const result = await db
      .insertInto('website')
      .values({
        domain: input.domain,
        access_path: input.accessPath,
        user_id: Number(ctx.user?.id)
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId) }
  })

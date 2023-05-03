import { TRPCError, initTRPC } from '@trpc/server'
import { type Context } from './context'

export const t = initTRPC.context<Context>().create()

const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (ctx.user?.id === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return await next({
    ctx: {
      user: ctx.user
    }
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const authedProcedure = publicProcedure.use(isAuthed)

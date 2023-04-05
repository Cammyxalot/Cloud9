import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import {
  type CreateWSSContextFnOptions
} from '@trpc/server/adapters/ws'

export function createContext (
  opts: CreateHTTPContextOptions | CreateWSSContextFnOptions
) {
  return {}
}
export type Context = inferAsyncReturnType<typeof createContext>

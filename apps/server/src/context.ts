import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateHTTPContextOptions } from '@trpc/server/adapters/standalone'
import {
  type CreateWSSContextFnOptions
} from '@trpc/server/adapters/ws'
import { decodeAndVerifyJwtToken } from './utils'

export const createContext = async (
  { req, res }: CreateHTTPContextOptions | CreateWSSContextFnOptions
) => {
  async function getUserFromHeader () {
    if (req.headers.authorization !== undefined) {
      const user = await decodeAndVerifyJwtToken(
        req.headers.authorization.split(' ')[1]
      )
      return user
    }
    return null
  }
  const user = await getUserFromHeader()

  return {
    user
  }
}
export type Context = inferAsyncReturnType<typeof createContext>

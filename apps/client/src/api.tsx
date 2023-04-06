import type { AppRouter } from '@cloud9/server'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.API_URL,
      headers () {
        const token = localStorage.getItem('token')
        return token !== null ? { authorization: `Bearer ${token}` } : {}
      }
    })
  ]
})

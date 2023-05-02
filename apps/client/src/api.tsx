import type { AppRouter } from '@cloud9/server'
import { splitLink } from '@trpc/client/links/splitLink'
import { createTRPCProxyClient, httpBatchLink, createWSClient, wsLink } from '@trpc/client'

export const wsClient = createWSClient({
  url: process.env.API_URL.replace(/^http/, 'ws')
})

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    splitLink({
      condition (op) {
        return op.type === 'subscription'
      },
      true: wsLink({
        client: wsClient
      }),
      false: httpBatchLink({
        url: process.env.API_URL,
        headers () {
          const token = localStorage.getItem('token')
          return token !== null ? { authorization: `Bearer ${token}` } : {}
        }
      })
    })
  ]
})

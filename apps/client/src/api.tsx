// import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import type { AppRouter } from '@cloud9/server'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/react-query'
// import { QueryClient } from '@tanstack/react-query'

// const queryClient = new QueryClient()

// export const api = createTRPCReact<AppRouter>({})

// const apiClient = api.createClient({
//   links: [
//     httpBatchLink({
//       url: process.env.API_URL
//     })
//   ]
// })

// export const ApiProvider = ({ children }: { children: React.ReactNode }) =>
//   <api.Provider client={apiClient} queryClient={queryClient}>
//     {children}
//   </api.Provider>

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: process.env.API_URL
    })
  ]
})

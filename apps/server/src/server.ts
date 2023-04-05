import {
  createHTTPServer
} from '@trpc/server/adapters/standalone'
import {
  applyWSSHandler
} from '@trpc/server/adapters/ws'
import { WebSocketServer } from 'ws'

import { type AppRouter, appRouter } from '.'
import { createContext } from './context'

// http server
const { server, listen } = createHTTPServer({
  router: appRouter,
  createContext
})

const wss = new WebSocketServer({ server })
applyWSSHandler<AppRouter>({
  wss,
  router: appRouter,
  createContext
})

listen(2022)

import { cronBackup } from './crons/backup'
import { cronSystemMetrics } from './crons/system-metrics'
import { router } from './trpc'
import * as procedures from './procedures'

const { JWT_SECRET } = process.env

if (JWT_SECRET === undefined) {
  throw new Error('JWT_SECRET must be set')
}

export const appRouter = router(procedures)

export type AppRouter = typeof appRouter

cronBackup.run()
cronSystemMetrics.run()

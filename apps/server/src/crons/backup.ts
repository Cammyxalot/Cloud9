import cron from 'node-cron'

import { runScript } from '../utils'

export const cronBackup = {
  run: () => {
    cron.schedule('0 0 * * *', () => {
      runScript('create_backup')
    })
  }
}

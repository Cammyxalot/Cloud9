import cron from 'node-cron'
import { redis } from '../redis'
import osu from 'node-os-utils'

export const cronSystemMetrics = {
  run: () => {
    cron.schedule('* * * * *', () => {
      void osu.cpu.usage()
        .then(cpuPercentage => {
          void redis.addTimeseriesData('cpu_usage', cpuPercentage)
        })

      void osu.mem.info()
        .then(({ totalMemMb, usedMemMb }) => {
          void redis.addTimeseriesData('memory_usage', usedMemMb / totalMemMb * 100)
        })

      void osu.drive.info('/')
        .then(({ totalGb, usedGb }) => {
          void redis.addTimeseriesData('disk_usage', Number(usedGb) / Number(totalGb) * 100)
        })
    })
  }
}

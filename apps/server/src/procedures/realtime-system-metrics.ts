import { publicProcedure } from '../trpc'
import { observable } from '@trpc/server/observable'
import cron from 'node-cron'
import { redis } from '../redis'
import EventEmitter from 'events'

interface Stats {
  cpu: Record<number, number>
  memory: Record<number, number>
  disk: Record<number, number>
}

const eventEmitter = new EventEmitter()

const formatStats = (stats: Record<'cpuUsage' | 'memoryUsage' | 'diskUsage', Array<{ timestamp: number, value: number }>>) => {
  const { cpuUsage, memoryUsage, diskUsage } = stats

  return {
    stats: {
      cpu: cpuUsage !== null
        ? redis.utils.timeseriesToRecord(cpuUsage)
        : {},
      memory: memoryUsage !== null
        ? redis.utils.timeseriesToRecord(memoryUsage)
        : {},
      disk: diskUsage !== null
        ? redis.utils.timeseriesToRecord(diskUsage)
        : {}
    }
  }
}

const getCurrentStats = async () => {
  const cpuUsage = await redis.getLastTimeseriesData('cpu_usage')
  const memoryUsage = await redis.getLastTimeseriesData('memory_usage')
  const diskUsage = await redis.getLastTimeseriesData('disk_usage')

  eventEmitter.emit('stats', formatStats({
    cpuUsage: cpuUsage !== null ? [cpuUsage] : [],
    memoryUsage: memoryUsage !== null ? [memoryUsage] : [],
    diskUsage: diskUsage !== null ? [diskUsage] : []
  }))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const task = cron.schedule('* * * * *', getCurrentStats)
void getCurrentStats()

// TODO: Use SSE instead of websocket to allow authentication
// Should wait for https://github.com/trpc/trpc/issues/544
// Last status of the issue (26 Apr 2023) mentions that a PR will be opened next week
export const realtimeSystemMetrics = publicProcedure
  .subscription(() => {
    return observable<{ stats: Stats }>((emit) => {
      void Promise.all([
        redis.getTimeseriesData('cpu_usage'),
        redis.getTimeseriesData('memory_usage'),
        redis.getTimeseriesData('disk_usage')
      ])
        .then(([cpuUsage, memoryUsage, diskUsage]) => {
          emit.next(formatStats({ cpuUsage, memoryUsage, diskUsage }))
        })

      const listener = (stats: { stats: Stats }) => {
        emit.next(stats)
      }

      eventEmitter.on('stats', listener)

      return () => {
        eventEmitter.off('stats', listener)
      }
    })
  })

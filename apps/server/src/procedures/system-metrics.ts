import { authedProcedure } from '../trpc'
import { runScript } from '../utils'

export const systemMetrics = authedProcedure
  .query(async () => {
    const cpu = runScript('get_cpu_stats').trim()
    const memory = runScript('get_memory_stats').trim()
    const disk = runScript('get_disk_stats').trim()

    const [diskUsed, diskAvailable] = disk
      .split(/\n/)[1]
      .split(/\s+/)
      .slice(2, 4)
      .map(n => Number(n.substring(0, n.length - 1)) * 1024)
    const [memoryUsage, memoryTotal] = memory
      .split('/')
      .map(n => Number(n.substring(0, n.length - 2)))

    const [cpuNumber, cpuUsage] = cpu.split(/\n/).map(Number)

    return {
      stats: {
        disk: {
          used: diskUsed,
          available: diskAvailable,
          total: diskUsed + diskAvailable
        },
        memory: {
          usage: memoryUsage,
          total: memoryTotal
        },
        cpu: {
          number: cpuNumber,
          usage: cpuUsage
        }
      }
    }
  })

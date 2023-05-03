import { createClient } from 'redis'
import { TimeSeriesDuplicatePolicies, TimeSeriesEncoding } from '@redis/time-series'

type RedisClient = Awaited<ReturnType<typeof createClient>>
type TimeseriesKey = 'cpu_usage' | 'memory_usage' | 'disk_usage'

const oneWeek = 604800000
const TIMESERIES_RETENTION = oneWeek

class Redis {
  private readonly client: Promise<RedisClient> = (async () => {
    const { REDIS_PASSWORD, REDIS_HOST, REDIS_DOCKER_PORT } = process.env

    if (REDIS_PASSWORD === undefined || REDIS_HOST === undefined || REDIS_DOCKER_PORT === undefined) {
      throw new Error('REDIS_PASSWORD, REDIS_HOST, REDIS_DOCKER_PORT must be set')
    }

    const client = createClient({
      url: `redis://default:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_DOCKER_PORT}`
    })

    client.on('error', err => { console.log('Redis Client Error', err) })

    await client.connect()

    await this.createTimeseries(client, 'cpu_usage', { type: 'cpu' })
    await this.createTimeseries(client, 'memory_usage', { type: 'memory' })
    await this.createTimeseries(client, 'disk_usage', { type: 'disk' })

    return client
  })()

  public async getClient (): Promise<RedisClient> {
    return await this.client
  }

  public async createTimeseries (client: Awaited<typeof this.client>, key: TimeseriesKey, labels: Record<string, string> = {}) {
    if (await client.exists(key) !== 1) {
      const created = await client.ts.create(key, {
        DUPLICATE_POLICY: TimeSeriesDuplicatePolicies.BLOCK,
        ENCODING: TimeSeriesEncoding.UNCOMPRESSED,
        RETENTION: TIMESERIES_RETENTION,
        LABELS: labels
      })

      if (created !== 'OK') {
        throw new Error('Error creating timeseries')
      }
    }
  }

  public async addTimeseriesData (
    key: TimeseriesKey,
    value: number,
    labels: Record<string, string> = {},
    timestamp: number = Date.now()
  ) {
    const client = await this.getClient()
    await client.ts.add(key, timestamp, value, { LABELS: labels })
  }

  public async getTimeseriesData (
    key: TimeseriesKey,
    fromTimestamp: string | Date | number = '-',
    toTimestamp: string | Date | number = '+'
  ) {
    const client = await this.getClient()
    return await client.ts.range(key, fromTimestamp, toTimestamp)
  }

  public async getLastTimeseriesData (key: TimeseriesKey) {
    const client = await this.getClient()
    return await client.ts.get(key)
  }

  public utils = {
    timeseriesToRecord: (timeseries: Array<{ timestamp: number, value: number }>): Record<number, number> => {
      return timeseries.reduce<Record<number, number>>((acc, cur) => {
        acc[cur.timestamp] = cur.value
        return acc
      }, {})
    }
  }
}

export const redis = new Redis()

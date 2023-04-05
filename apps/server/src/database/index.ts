import { createPool } from 'mysql2'
import { Kysely, MysqlDialect } from 'kysely'

import { type DB } from './generated'

const { DB_NAME, DB_HOST, DB_DOCKER_PORT, DB_ROOT_PASSWORD } = process.env

if (DB_NAME === undefined || DB_HOST === undefined || DB_DOCKER_PORT === undefined || DB_ROOT_PASSWORD === undefined) {
  throw new Error('DB_NAME, DB_HOST, DB_DOCKER_PORT and DB_ROOT_PASSWORD must be set')
}

export const db = new Kysely<DB>({
  dialect: new MysqlDialect({
    pool: createPool({
      database: DB_NAME,
      host: DB_HOST,
      port: Number(DB_DOCKER_PORT),
      user: 'root',
      password: DB_ROOT_PASSWORD
    })
  })
})

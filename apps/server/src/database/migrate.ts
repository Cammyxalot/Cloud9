import * as path from 'path'
import { promises as fs } from 'fs'
import { spawnSync } from 'child_process'
import { Migrator, FileMigrationProvider } from 'kysely'
import { db } from '.'

const { DB_NAME, DB_HOST, DB_DOCKER_PORT, DB_ROOT_PASSWORD } = process.env

if (DB_NAME === undefined || DB_HOST === undefined || DB_DOCKER_PORT === undefined || DB_ROOT_PASSWORD === undefined) {
  throw new Error('DB_NAME, DB_HOST, DB_DOCKER_PORT and DB_ROOT_PASSWORD must be set')
}

const migrateToLatest = async () => {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations')
    })
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.log(error)
      throw new Error(`failed to execute migration "${it.migrationName}" (${it.direction})`)
    }
  })

  if (error !== undefined) {
    throw new Error(String(error))
  }

  await db.destroy()

  process.env.DATABASE_URL = `mysql://root:${DB_ROOT_PASSWORD}@${DB_HOST}:${DB_DOCKER_PORT}/${DB_NAME}`
  const codegenRes = spawnSync('kysely-codegen', ['--out-file', path.join(__dirname, '..', '..', 'src', 'database', 'generated.d.ts')], {
    encoding: 'utf-8'
  })

  if (codegenRes.status !== 0) {
    throw new Error(codegenRes.stderr)
  }

  console.log('done')
}

migrateToLatest()
  .catch((error) => {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  })

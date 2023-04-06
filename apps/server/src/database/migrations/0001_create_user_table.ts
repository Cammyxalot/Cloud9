import { type Kysely } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'integer', (column) => column.autoIncrement().primaryKey())
    .addColumn('name', 'varchar(255)', (column) => column.notNull())
    .addColumn('password', 'varchar(255)', (column) => column.notNull())
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema
    .dropTable('user')
    .execute()
}

import { type Kysely } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('website')
    .addColumn('id', 'integer', (column) => column.autoIncrement().primaryKey())
    .addColumn('domain', 'varchar(255)', (column) => column.notNull())
    .addColumn('access_path', 'varchar(255)', (column) => column.notNull())
    .addColumn('user_id', 'integer', (column) => column.references('user.id').notNull())
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema
    .dropTable('website')
    .execute()
}

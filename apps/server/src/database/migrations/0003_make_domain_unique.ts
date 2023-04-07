import { type Kysely } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('website')
    .addUniqueConstraint('website_domain_unique', ['domain'])
    .execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('website')
    .dropConstraint('website_domain_unique')
    .execute()
}

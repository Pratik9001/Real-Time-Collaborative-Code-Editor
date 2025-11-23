import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('document_versions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.integer('version_number').notNullable();
    table.text('content').notNullable();
    table.string('change_summary').nullable();
    table.boolean('is_manual').defaultTo(false);
    table.timestamps(true, true);

    // Unique constraint for document + version
    table.unique(['document_id', 'version_number']);

    // Indexes
    table.index(['document_id']);
    table.index(['version_number']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('document_versions');
}
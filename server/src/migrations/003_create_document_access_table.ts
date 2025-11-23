import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('document_access', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('permission', ['owner', 'editor', 'viewer']).notNullable();
    table.timestamps(true, true);

    // Unique constraint to prevent duplicate access entries
    table.unique(['document_id', 'user_id']);

    // Indexes
    table.index(['document_id']);
    table.index(['user_id']);
    table.index(['permission']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('document_access');
}
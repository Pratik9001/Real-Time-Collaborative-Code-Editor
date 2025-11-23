import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('operations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('document_id').notNullable().references('id').inTable('documents').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('operation_type', ['insert', 'delete', 'retain']).notNullable();
    table.json('operation_data').notNullable();
    table.integer('document_version').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index(['document_id']);
    table.index(['user_id']);
    table.index(['document_version']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('operations');
}
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('content').defaultTo('');
    table.string('language').defaultTo('javascript');
    table.string('share_token').unique().nullable();
    table.boolean('is_public').defaultTo(false);
    table.json('tags').defaultTo('[]');
    table.timestamp('last_accessed').nullable();
    table.timestamps(true, true);

    // Indexes
    table.index(['owner_id']);
    table.index(['share_token']);
    table.index(['is_public']);
    table.index(['created_at']);
    table.index(['updated_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('documents');
}
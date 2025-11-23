import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('username').unique().notNullable();
    table.string('display_name');
    table.text('bio');
    table.string('avatar_url');
    table.json('preferences').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('email_verified_at').nullable();
    table.timestamps(true, true);

    // Indexes
    table.index(['email']);
    table.index(['username']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
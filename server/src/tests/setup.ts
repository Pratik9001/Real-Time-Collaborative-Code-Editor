import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import knex from '../config/database';

// Test database configuration
process.env.DB_NAME = 'collaborative_editor_test';

beforeAll(async () => {
  // Ensure test database exists and run migrations
  try {
    await knex.migrate.latest();
  } catch (error) {
    console.error('Test setup failed:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Clean up test database
  try {
    await knex.destroy();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

beforeEach(async () => {
  // Clean up database before each test
  const tables = [
    'operations',
    'document_versions',
    'document_access',
    'documents',
    'users'
  ];

  for (const table of tables) {
    await knex(table).del();
  }
});

afterEach(async () => {
  // Additional cleanup after each test if needed
});
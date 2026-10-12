import { defineConfig } from 'vitest/config'

// Test isolation guardrail: unit/integration suites must NEVER touch the dev or
// production (Supabase) database. DATABASE_URL is pinned to the local ihm_test
// DB before any module imports prisma, so test wipe calls (user.deleteMany()
// etc.) can only ever affect the isolated test database.
const TEST_DB_URL =
  'postgresql://postgres:postgres@localhost:5432/ihm_test?schema=public'

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    testTimeout: 25000,
    hookTimeout: 25000,
    env: {
      NODE_ENV: 'test',
      DATA_STORE: 'memory',
      DATABASE_URL: TEST_DB_URL,
      TEST_DATABASE_URL: TEST_DB_URL,
    },
  },
})
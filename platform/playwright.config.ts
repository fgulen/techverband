import { defineConfig } from '@playwright/test';

// NEXT_PUBLIC_* is inlined at build time, so each environment gets its own build and server.
export const TEST_AUTH = { username: 'ww-test', password: 'e2e-geheim' };

const server = (port: number, env: Record<string, string>, distDir: string) => ({
  command: `npx next build && npx next start -p ${port}`,
  port,
  reuseExistingServer: !process.env.CI,
  timeout: 300_000,
  env: { ...env, NEXT_DIST_DIR: distDir },
});

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  projects: [
    {
      name: 'test-env',
      testMatch: /.*\.test-env\.spec\.ts/,
      use: { baseURL: 'http://localhost:3100', httpCredentials: TEST_AUTH },
    },
    {
      name: 'prod-env',
      testMatch: /.*\.prod-env\.spec\.ts/,
      use: { baseURL: 'http://localhost:3200' },
    },
  ],
  webServer: [
    server(3100, { NEXT_PUBLIC_APP_ENV: 'test', BASIC_AUTH_USER: TEST_AUTH.username, BASIC_AUTH_PASSWORD: TEST_AUTH.password }, '.next-test'),
    server(3200, { NEXT_PUBLIC_APP_ENV: 'production' }, '.next-prod'),
  ],
});

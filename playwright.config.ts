import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:3108', browserName: 'chromium', trace: 'retain-on-failure' },
  reporter: [['list']],
  webServer: { command: 'npx next start --hostname 127.0.0.1 --port 3108', url: 'http://127.0.0.1:3108', env: { SEEYESYES_TEST_ROUTES: '1' }, reuseExistingServer: false, timeout: 30000 },
});

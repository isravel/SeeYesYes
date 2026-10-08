import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:3107', browserName: 'chromium', trace: 'retain-on-failure' },
  reporter: [['list']],
  webServer: { command: 'npm run start -- --hostname 127.0.0.1 --port 3107', url: 'http://127.0.0.1:3107', reuseExistingServer: false, timeout: 30000 },
});

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './api-tests',
  testMatch: '**/*.api.spec.js',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://simple-tool-rental-api.click',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'retain-on-failure',
  },
});

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    // Exclude end-to-end Playwright tests from Vitest to avoid importing
    // `@playwright/test` into the unit test runner which causes runtime errors.
    exclude: ['tests/e2e/**']
  }
})

import path from 'node:path'
import { defineConfig } from 'vitest/config'
import { cloudflareTest } from '@cloudflare/vitest-pool-workers'

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: path.join(import.meta.dirname, 'wrangler.jsonc') },
      main: path.join(import.meta.dirname, 'src/index.ts'),
      // Fake bindings for tests only — production secrets stay in the
      // Cloudflare dashboard and are never read into the repository.
      miniflare: {
        bindings: {
          SUPABASE_URL: 'https://supabase.test',
          SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
          ALLOWED_ORIGINS: 'http://localhost:5173,https://seiya058904.github.io',
        },
      },
    }),
  ],
  test: {
    include: ['test/**/*.test.ts'],
  },
})

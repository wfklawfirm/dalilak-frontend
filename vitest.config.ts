import { defineConfig } from 'vitest/config'

// Big Track 4: minimal Vitest setup for pure-logic unit tests under lib/.
// No React/DOM rendering is tested yet (that would need @testing-library/react
// + jsdom, a bigger addition) -- this first suite covers real, pure business
// logic in lib/ that has no React or Next.js runtime dependency, so plain
// Node environment is enough and keeps the setup dependency-light.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', '.next', '.git'],
  },
})

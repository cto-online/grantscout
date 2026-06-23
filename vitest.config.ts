// Backend test runner config. Kept as a plain object (no `vitest/config`
// import) so it loads regardless of how vitest is hoisted in the workspace.
// The console has its own vitest config; exclude it here so `npm test` at the
// root doesn't try to run the aliased/JSX frontend tests.
export default {
  test: {
    include: ['test/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['console/**', 'node_modules/**', 'dist/**'],
  },
}

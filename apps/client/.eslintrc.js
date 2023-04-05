module.exports = {
  extends: ['@cloud9'],
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['vite.config.ts', '**/dist/**/*', '**/node_modules/**/*']
}

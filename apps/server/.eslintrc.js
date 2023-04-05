module.exports = {
  extends: ['@cloud9'],
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['**/dist/**/*', '**/node_modules/**/*']
}

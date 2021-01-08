module.exports = {
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest'
  },
  moduleFileExtensions: ['js', 'ts'],
  collectCoverageFrom: [
    "!**/node_modules/**",
    "src/**",
    "!src/dashboard-public/**/*",
    "!src/types/**",
    "!src/index.ts"
],
  bail: true,
  verbose: true
}

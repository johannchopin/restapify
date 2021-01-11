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
  coverageReporters: ["html", "lcov"],
  bail: true,
  verbose: true
}

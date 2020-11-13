module.exports = {
  rootDir: 'test',
  transform: {
    '^.+\\.js?$': 'babel-jest',
    '^.+\\.ts?$': 'ts-jest'
  },
  moduleFileExtensions: ['js', 'ts'],
  bail: false,
  verbose: true
}

const path = require('path')
const { startServer } = require('../../src/cli/run/startServer.ts')

startServer({
  rootDir: path.resolve(__dirname, '../api')
})

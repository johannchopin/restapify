import * as path from 'path'
import Restapify from '../src/index'

const mockedApi = new Restapify({
  rootDir: path.resolve(__dirname, './api')
})
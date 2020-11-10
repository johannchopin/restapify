import * as path from 'path'
import Restapify from '../src/index'

const mockedApi = new Restapify({
  entryFolder: path.resolve(__dirname, './api')
})
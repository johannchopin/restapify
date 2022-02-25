import Restapify from '../Restapify'
import inquirer from 'inquirer'

const prompt = inquirer.createPromptModule()

const ACTIONS = [
  {
    key: 'localize',
    value: 'update localize'
  },
  {
    key: 'state',
    value: 'update route\'s state'
  }
]

export const renderActions = (rpfy: Restapify): void => {
  console.log(rpfy.port)

  prompt([{
    type: 'list',
    name: 'actions',
    choices: [ACTIONS[0], ACTIONS[1]]
  }]).then(value => {
    console.log(value)
  })
}

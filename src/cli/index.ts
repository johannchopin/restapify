import * as arg from 'arg'

export const cli = (cliArgs: string[]): void => {
  const args = arg({
    // Types
    '--help': Boolean,
    '-h': '--help',

    '--port': Number,
    '-p': '--port',

    '--root': String,
    '-r': '--root'
  }, { argv: cliArgs })

  console.log(args)
}

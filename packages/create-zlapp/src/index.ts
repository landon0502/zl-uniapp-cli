import { Command } from 'commander'
import { registerCreateCommand } from './commands/create.js'

const program = new Command()

program
  .name('create-zluni-app')
  .description('快速创建 uni-app 项目')
  .version('1.0.0')

registerCreateCommand(program)

program.parse()

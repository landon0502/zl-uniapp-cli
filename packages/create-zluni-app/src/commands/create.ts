import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { Command } from 'commander'
import inquirer from 'inquirer'
import { promptCreateOptions } from '../prompts/create.js'
import { replaceProjectName } from '@zl-uniapp-cli/shared'
import { downloadTemplate } from '../utils/download.js'
import type { CreateOptions, PartialCreateOptions } from '../constants.js'

export async function executeCreate(
  options: CreateOptions,
  targetDir: string,
): Promise<void> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), '.create-zluni-app-'))

  let cleanedUp = false
  const cleanup = () => {
    if (!cleanedUp) {
      cleanedUp = true
      fs.rmSync(tempDir, { recursive: true, force: true })
      process.exit(1)
    }
  }
  process.on('SIGINT', cleanup)

  try {
    await downloadTemplate(options.template, tempDir)
    await replaceProjectName(tempDir, options.name)

    try {
      fs.renameSync(tempDir, targetDir)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('EXDEV')) {
        fs.cpSync(tempDir, targetDir, { recursive: true })
        fs.rmSync(tempDir, { recursive: true, force: true })
      } else {
        throw err
      }
    }
  } catch (err) {
    fs.rmSync(tempDir, { recursive: true, force: true })
    throw err
  } finally {
    process.removeListener('SIGINT', cleanup)
  }
}

export function registerCreateCommand(program: Command): void {
  program
    .command('create [name]')
    .description('创建新项目')
    .option('-t, --template <name>', '模板名称')
    .option('-p, --pm <pm>', '包管理器 (pnpm|npm|yarn)')
    .action(async (name: string | undefined, cmdOptions: Record<string, string | undefined>) => {
      try {
        const partial: PartialCreateOptions = {
          name,
          template: cmdOptions.template,
          pm: cmdOptions.pm as 'pnpm' | 'npm' | 'yarn' | undefined,
        }
        const options = await promptCreateOptions(partial)

        const targetDir = path.resolve(process.cwd(), options.name)

        if (fs.existsSync(targetDir)) {
          const answers = await inquirer.prompt<{ overwrite: boolean }>([
            {
              type: 'confirm',
              name: 'overwrite',
              message: `目录 ${options.name} 已存在，是否覆盖？`,
              default: false,
            },
          ])
          if (!answers.overwrite) {
            console.log('已取消创建')
            return
          }
          fs.rmSync(targetDir, { recursive: true, force: true })
        }

        await executeCreate(options, targetDir)

        console.log('')
        console.log('✅ 项目创建成功！')
        console.log('')
        console.log(`  cd ${options.name}`)
        console.log(`  ${options.pm} install`)
        console.log('')
      } catch (err) {
        if (err instanceof Error) {
          console.error(`❌ 创建失败: ${err.message}`)
        } else {
          console.error('❌ 创建失败: 未知错误')
        }
        process.exit(1)
      }
    })
}

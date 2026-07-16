import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import type { Command } from 'commander'
import inquirer from 'inquirer'
import { promptCreateOptions } from '../prompts/create.js'
import { copyTemplate } from '../core/copier.js'
import { replaceProjectName } from '../core/replacer.js'
import { TEMPLATES_DIR } from '../constants.js'
import type { CreateOptions, PartialCreateOptions } from '../constants.js'

export async function executeCreate(
  options: CreateOptions,
  targetDir: string,
): Promise<void> {
  const templateDir = path.join(TEMPLATES_DIR, options.template)

  // Step 4: 复制到临时目录
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), '.create-app-'))

  // 注册 SIGINT 清理
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
    // 复制模板到临时目录
    await copyTemplate(templateDir, tempDir)

    // Step 5: 替换 package.json 的 name 字段
    await replaceProjectName(tempDir, options.name)

    // Step 6: 原子性重命名（临时目录 → 目标目录）
    try {
      fs.renameSync(tempDir, targetDir)
    } catch (err: unknown) {
      // renameSync 跨设备失败时回退为 copy + remove
      if (
        err instanceof Error &&
        err.message.includes('EXDEV')
      ) {
        fs.cpSync(tempDir, targetDir, { recursive: true })
        fs.rmSync(tempDir, { recursive: true, force: true })
      } else {
        throw err
      }
    }
  } catch (err) {
    // 出错时清理临时目录
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
        // Step 1-2: 参数解析 + 交互补充
        const partial: PartialCreateOptions = {
          name,
          template: cmdOptions.template,
          pm: cmdOptions.pm as 'pnpm' | 'npm' | 'yarn' | undefined,
        }
        const options = await promptCreateOptions(partial)

        const targetDir = path.resolve(process.cwd(), options.name)

        // Step 3: 前置检查 — 目标目录是否存在
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

        // Step 4-6: 执行创建
        await executeCreate(options, targetDir)

        // Step 7: 输出结果
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

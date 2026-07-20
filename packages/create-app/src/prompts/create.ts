import inquirer from 'inquirer'
import { discoverTemplates } from '@zl-uniapp-cli/shared'
import { KEBAB_CASE_REGEX, DEFAULT_PM, TEMPLATES_DIR } from '../constants.js'
import type { CreateOptions, PartialCreateOptions, PackageManager } from '../constants.js'

export async function promptCreateOptions(
  partial: PartialCreateOptions,
): Promise<CreateOptions> {
  let name = partial.name
  let template = partial.template
  let pm = partial.pm

  if (!name) {
    const answers = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: '项目名称:',
        validate: (input: string) => {
          if (!input.trim()) return '项目名称不能为空'
          if (!KEBAB_CASE_REGEX.test(input)) {
            return '项目名称必须为 kebab-case 格式（如 my-app, uni-vue3）'
          }
          return true
        },
      },
    ])
    name = answers.name
  } else if (!KEBAB_CASE_REGEX.test(name)) {
    const answers = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: `项目名称 "${name}" 不合法，请输入 kebab-case 格式的名称:`,
        default: name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''),
        validate: (input: string) => {
          if (!input.trim()) return '项目名称不能为空'
          if (!KEBAB_CASE_REGEX.test(input)) {
            return '项目名称必须为 kebab-case 格式（如 my-app, uni-vue3）'
          }
          return true
        },
      },
    ])
    name = answers.name
  }

  if (!template) {
    const templates = await discoverTemplates(TEMPLATES_DIR)

    if (templates.length === 1) {
      template = templates[0].name
    } else if (templates.length > 1) {
      const answers = await inquirer.prompt<{ template: string }>([
        {
          type: 'select',
          name: 'template',
          message: '选择模板:',
          choices: templates.map((t) => ({ name: t.name, value: t.name })),
        },
      ])
      template = answers.template
    } else {
      throw new Error('未找到可用模板')
    }
  }

  if (!pm) {
    const answers = await inquirer.prompt<{ pm: PackageManager }>([
      {
        type: 'select',
        name: 'pm',
        message: '选择包管理器:',
        choices: ['pnpm', 'npm', 'yarn'],
        default: DEFAULT_PM,
      },
    ])
    pm = answers.pm
  }

  return { name, template, pm }
}

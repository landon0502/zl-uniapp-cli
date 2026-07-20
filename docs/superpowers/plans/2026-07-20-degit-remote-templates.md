---
change: degit-remote-templates
design-doc: docs/superpowers/specs/2026-07-20-degit-remote-templates-design.md
base-ref: 2bb2367f0d504d79ea1df7e5dc5ddbbffc39645b
---

# degit 远程模板拉取 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CLI 的模板拉取机制从本地 fs-extra.copy 改为 degit 远程拉取 GitHub 仓库子目录，使新增模板只需在 GitHub 添加子目录，CLI 无需任何改动。

**Architecture:** 创建独立的 GitHub 模板仓库 `zl-uniapp-cli/templates`，CLI 通过 degit 拉取对应子目录。保留临时目录 + 原子重命名流程不变，仅替换模板获取方式。错误处理按 degit 错误码分类，失败时清理临时目录并退出。

**Tech Stack:** degit ^3.6.0、vitest、tsup、Node.js >=18

## Global Constraints

- Node.js >= 18
- ESM only (`"type": "module"`)
- tsup 构建，输出格式 `esm`
- pnpm workspace monorepo
- 失败时不留残留（临时目录清理）
- 错误信息面向用户，不暴露内部堆栈
- `TEMPLATE_REPO` 常量集中管理 GitHub 仓库地址
- degit 配置 `cache: false, force: true`

## 文件变更清单

| 文件 | 操作 | 职责 |
|------|------|------|
| `packages/create-app/src/utils/download.ts` | 重写 | degit 远程拉取 + 错误处理 |
| `packages/create-app/src/commands/create.ts` | 修改 | 移除 copyTemplate/TEMPLATES_DIR，改用 downloadTemplate |
| `packages/create-app/src/prompts/create.ts` | 修改 | 移除 discoverTemplates，改用静态注册表 |
| `packages/create-app/src/constants.ts` | 修改 | 移除 TEMPLATES_DIR |
| `packages/create-app/src/templates/templates.ts` | 保留 | value 字段已映射 GitHub 子目录名，无需改动 |
| `packages/shared/src/index.ts` | 修改 | discoverTemplates 标记 deprecated |
| `packages/create-app/package.json` | 修改 | 添加 degit 依赖 |
| `packages/create-app/tests/utils/download.test.ts` | 创建 | downloadTemplate 单元测试 |
| `packages/create-app/tests/commands/create.test.ts` | 创建 | executeCreate 集成测试 |

---

### Task 1: 添加 degit 依赖

**Files:**
- Modify: `packages/create-app/package.json`

**Interfaces:**
- Produces: `degit` 作为可用依赖，供 Task 2 的 `download.ts` 导入

- [ ] **Step 1: 在 package.json 添加 degit 依赖**

在 `packages/create-app/package.json` 的 `dependencies` 中添加 `"degit": "^3.6.0"`：

```json
{
  "dependencies": {
    "@zl-uniapp-cli/shared": "workspace:*",
    "commander": "^14.0.3",
    "degit": "^3.6.0",
    "inquirer": "^14.0.2",
    "execa": "^9.0.0"
  }
}
```

- [ ] **Step 2: 运行 pnpm install**

Run: `pnpm install`
Expected: 安装成功，无 peer dependency 错误

- [ ] **Step 3: 验证 degit ESM 导入可用**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && node -e "import('degit').then(m => console.log(typeof m.default))"`
Expected: 输出 `function`

- [ ] **Step 4: Commit**

```bash
git add packages/create-app/package.json pnpm-lock.yaml
git commit -m "feat(create-app): add degit dependency for remote template fetching"
```

---

### Task 2: 重写 downloadTemplate 函数

**Files:**
- Modify: `packages/create-app/src/utils/download.ts`

**Interfaces:**
- Consumes: `degit` npm 包（默认导出为工厂函数）
- Produces: `downloadTemplate(template: string, dest: string): Promise<void>` — Task 3 的 `executeCreate` 将调用此函数

- [ ] **Step 1: 重写 download.ts**

将 `packages/create-app/src/utils/download.ts` 完整替换为：

```ts
import degit from 'degit'
import fs from 'node:fs'

const TEMPLATE_REPO = 'zl-uniapp-cli/templates'

export async function downloadTemplate(
  template: string,
  dest: string,
): Promise<void> {
  const emitter = degit(`${TEMPLATE_REPO}/${template}`, {
    cache: false,
    force: true,
  })

  try {
    await emitter.clone(dest)
  } catch (err: unknown) {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true })
    }

    if (isDegitError(err)) {
      switch (err.code) {
        case 'MISSING_REF':
          throw new Error(`模板 "${template}" 不存在，请检查模板名称是否正确`)
        case 'MISSING_REPO':
          throw new Error('模板仓库不存在，请检查网络或联系维护者')
        default:
          throw new Error(`模板拉取失败: ${err.message}`)
      }
    }

    if (err instanceof Error) {
      throw new Error(`网络连接失败，请检查网络后重试`)
    }

    throw new Error(`模板拉取失败: ${String(err)}`)
  }
}

function isDegitError(err: unknown): err is Error & { code: string } {
  return (
    err instanceof Error &&
    'code' in err &&
    typeof (err as Error & { code: string }).code === 'string'
  )
}
```

- [ ] **Step 2: 验证 TypeScript 编译通过**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add packages/create-app/src/utils/download.ts
git commit -m "feat(create-app): rewrite downloadTemplate to use degit for remote fetching"
```

---

### Task 3: 编写 downloadTemplate 单元测试

**Files:**
- Create: `packages/create-app/tests/utils/download.test.ts`

**Interfaces:**
- Consumes: `downloadTemplate` from `../../src/utils/download.js`
- Produces: 测试覆盖 — 正常拉取、MISSING_REF 错误、MISSING_REPO 错误、网络错误、临时目录清理

- [ ] **Step 1: 创建测试文件**

创建 `packages/create-app/tests/utils/download.test.ts`：

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import { downloadTemplate } from '../../src/utils/download.js'

vi.mock('degit', () => {
  const mockClone = vi.fn()
  const mockOn = vi.fn()
  const mockEmitter = { clone: mockClone, on: mockOn }
  return { default: vi.fn(() => mockEmitter) }
})

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return { ...actual, existsSync: vi.fn(), rmSync: vi.fn() }
})

describe('downloadTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应成功调用 degit clone', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockResolvedValue(undefined)

    await downloadTemplate('uni-vue3', '/tmp/test-dest')

    expect(degit).toHaveBeenCalledWith('zl-uniapp-cli/templates/uni-vue3', {
      cache: false,
      force: true,
    })
    expect(emitter.clone).toHaveBeenCalledWith('/tmp/test-dest')
  })

  it('MISSING_REF 错误应显示模板不存在提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    const err = new Error('not found') as Error & { code: string }
    err.code = 'MISSING_REF'
    emitter.clone.mockRejectedValue(err)
    ;(fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true)

    await expect(downloadTemplate('bad-template', '/tmp/test-dest')).rejects.toThrow(
      '模板 "bad-template" 不存在，请检查模板名称是否正确',
    )
    expect(fs.rmSync).toHaveBeenCalledWith('/tmp/test-dest', { recursive: true, force: true })
  })

  it('MISSING_REPO 错误应显示仓库不存在提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    const err = new Error('repo not found') as Error & { code: string }
    err.code = 'MISSING_REPO'
    emitter.clone.mockRejectedValue(err)
    ;(fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true)

    await expect(downloadTemplate('uni-vue3', '/tmp/test-dest')).rejects.toThrow(
      '模板仓库不存在，请检查网络或联系维护者',
    )
  })

  it('网络错误应显示连接失败提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockRejectedValue(new Error('fetch failed'))
    ;(fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false)

    await expect(downloadTemplate('uni-vue3', '/tmp/test-dest')).rejects.toThrow(
      '网络连接失败，请检查网络后重试',
    )
  })

  it('未知 degit 错误应显示通用失败提示', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    const err = new Error('some error') as Error & { code: string }
    err.code = 'UNKNOWN_CODE'
    emitter.clone.mockRejectedValue(err)
    ;(fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false)

    await expect(downloadTemplate('uni-vue3', '/tmp/test-dest')).rejects.toThrow(
      '模板拉取失败: some error',
    )
  })

  it('失败时应清理已存在的目标目录', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockRejectedValue(new Error('fail'))
    ;(fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true)

    await expect(downloadTemplate('uni-vue3', '/tmp/existing-dest')).rejects.toThrow()
    expect(fs.rmSync).toHaveBeenCalledWith('/tmp/existing-dest', { recursive: true, force: true })
  })

  it('目标目录不存在时不应调用 rmSync', async () => {
    const degit = (await import('degit')).default
    const emitter = (degit as ReturnType<typeof vi.fn>)()
    emitter.clone.mockRejectedValue(new Error('fail'))
    ;(fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false)

    await expect(downloadTemplate('uni-vue3', '/tmp/new-dest')).rejects.toThrow()
    expect(fs.rmSync).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 运行测试**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && npx vitest run tests/utils/download.test.ts`
Expected: 全部 7 个测试通过

- [ ] **Step 3: Commit**

```bash
git add packages/create-app/tests/utils/download.test.ts
git commit -m "test(create-app): add unit tests for downloadTemplate with degit"
```

---

### Task 4: 更新 commands/create.ts — 移除本地模板依赖

**Files:**
- Modify: `packages/create-app/src/commands/create.ts`

**Interfaces:**
- Consumes: `downloadTemplate(template: string, dest: string): Promise<void>` from Task 2；`replaceProjectName(dir: string, name: string): Promise<void>` from `@zl-uniapp-cli/shared`
- Produces: `executeCreate(options, targetDir)` 签名不变，内部改用 downloadTemplate

- [ ] **Step 1: 更新 commands/create.ts 的 import 和 executeCreate**

将 `packages/create-app/src/commands/create.ts` 修改为：

```ts
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), '.create-app-'))

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
```

变更要点：
- 移除 `import { copyTemplate, replaceProjectName } from '@zl-uniapp-cli/shared'` → 只保留 `replaceProjectName`
- 移除 `import { TEMPLATES_DIR } from '../constants.js'`
- 新增 `import { downloadTemplate } from '../utils/download.js'`
- `executeCreate` 内移除 `const templateDir = path.join(TEMPLATES_DIR, options.template)`
- `await copyTemplate(templateDir, tempDir)` → `await downloadTemplate(options.template, tempDir)`
- `registerCreateCommand` 函数体不变

- [ ] **Step 2: 验证 TypeScript 编译通过**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add packages/create-app/src/commands/create.ts
git commit -m "feat(create-app): switch executeCreate from copyTemplate to downloadTemplate"
```

---

### Task 5: 更新 prompts/create.ts — 移除 discoverTemplates，改用静态注册表

**Files:**
- Modify: `packages/create-app/src/prompts/create.ts`

**Interfaces:**
- Consumes: `templates` from `../templates/templates.js`（`TemplateEntry[]`，包含 `{ name: string, value: string }`）
- Produces: `promptCreateOptions(partial)` 签名不变，返回的 `template` 字段值为 `value`（如 `'uni-vue3'`）

- [ ] **Step 1: 更新 prompts/create.ts**

将 `packages/create-app/src/prompts/create.ts` 修改为：

```ts
import inquirer from 'inquirer'
import { templates } from '../templates/templates.js'
import { KEBAB_CASE_REGEX, DEFAULT_PM } from '../constants.js'
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
    if (templates.length === 1) {
      template = templates[0].value
    } else if (templates.length > 1) {
      const answers = await inquirer.prompt<{ template: string }>([
        {
          type: 'select',
          name: 'template',
          message: '选择模板:',
          choices: templates.map((t) => ({ name: t.name, value: t.value })),
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
```

变更要点：
- 移除 `import { discoverTemplates } from '@zl-uniapp-cli/shared'`
- 移除 `import { TEMPLATES_DIR } from '../constants.js'`（只保留 `KEBAB_CASE_REGEX, DEFAULT_PM`）
- 新增 `import { templates } from '../templates/templates.js'`
- 模板选择逻辑：`const templates = await discoverTemplates(TEMPLATES_DIR)` → 直接使用 `templates` 静态数组
- `templates[0].name` → `templates[0].value`（选择 value 字段，对应 GitHub 子目录名）
- choices 映射：`templates.map((t) => ({ name: t.name, value: t.name }))` → `templates.map((t) => ({ name: t.name, value: t.value }))`

- [ ] **Step 2: 验证 TypeScript 编译通过**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add packages/create-app/src/prompts/create.ts
git commit -m "feat(create-app): switch prompts from discoverTemplates to static registry"
```

---

### Task 6: 移除 constants.ts 中的 TEMPLATES_DIR

**Files:**
- Modify: `packages/create-app/src/constants.ts`

**Interfaces:**
- Consumes: 无（TEMPLATES_DIR 不再被任何文件引用）
- Produces: `CreateOptions`, `PartialCreateOptions`, `PackageManager`, `DEFAULT_PM`, `KEBAB_CASE_REGEX` 保留不变

- [ ] **Step 1: 更新 constants.ts**

将 `packages/create-app/src/constants.ts` 修改为：

```ts
export type PackageManager = 'pnpm' | 'npm' | 'yarn'

export interface CreateOptions {
  name: string
  template: string
  pm: PackageManager
}

export interface PartialCreateOptions {
  name?: string
  template?: string
  pm?: PackageManager
}

export const DEFAULT_PM: PackageManager = 'pnpm'

export const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
```

移除项：
- `import path from 'node:path'`
- `import { fileURLToPath } from 'node:url'`
- `const __dirname = path.dirname(fileURLToPath(import.meta.url))`
- `export const TEMPLATES_DIR = path.resolve(__dirname, '../../templates')`

- [ ] **Step 2: 确认没有其他文件引用 TEMPLATES_DIR**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli && grep -r "TEMPLATES_DIR" packages/create-app/src/`
Expected: 无输出（Task 4 和 Task 5 已移除所有引用）

- [ ] **Step 3: 验证 TypeScript 编译通过**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && npx tsc --noEmit`
Expected: 无错误输出

- [ ] **Step 4: Commit**

```bash
git add packages/create-app/src/constants.ts
git commit -m "refactor(create-app): remove TEMPLATES_DIR from constants"
```

---

### Task 7: 标记 shared 包 discoverTemplates 为 deprecated

**Files:**
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: `discoverTemplates` from `./template.js`（保留导出，不删除）
- Produces: 无新接口。标记为 deprecated 后，外部消费者仍可导入但会看到 IDE 提示

- [ ] **Step 1: 更新 shared/src/index.ts**

将 `packages/shared/src/index.ts` 中 discoverTemplates 的导出行添加 deprecated 注释：

```ts
export { copyTemplate, createCopyFilter } from './copier.js'
export { replaceProjectName } from './replacer.js'
/** @deprecated 模板发现改为静态注册表驱动，此函数不再被 create-app 使用 */
export { discoverTemplates } from './template.js'
export { logger } from './logger.js'
export { COPY_IGNORE_PATTERNS } from './constants.js'
export type { TemplateInfo } from './constants.js'
```

- [ ] **Step 2: 验证 shared 包构建通过**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/shared && pnpm build`
Expected: 构建成功

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/index.ts
git commit -m "deprecate(shared): mark discoverTemplates as deprecated"
```

---

### Task 8: 编写 executeCreate 集成测试

**Files:**
- Create: `packages/create-app/tests/commands/create.test.ts`

**Interfaces:**
- Consumes: `executeCreate(options: CreateOptions, targetDir: string): Promise<void>` from Task 4；`downloadTemplate` from Task 2；`replaceProjectName` from `@zl-uniapp-cli/shared`
- Produces: 测试覆盖 — 正常流程（download + replace + rename）、跨设备回退（EXDEV）、degit 错误时清理临时目录

- [ ] **Step 1: 创建集成测试文件**

创建 `packages/create-app/tests/commands/create.test.ts`：

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { executeCreate } from '../../src/commands/create.js'
import type { CreateOptions } from '../../src/constants.js'

vi.mock('../../src/utils/download.js', () => ({
  downloadTemplate: vi.fn(),
}))

vi.mock('@zl-uniapp-cli/shared', () => ({
  replaceProjectName: vi.fn(),
}))

const mockDownloadTemplate = vi.fn()
const mockReplaceProjectName = vi.fn()

beforeEach(async () => {
  vi.clearAllMocks()

  const downloadMod = await import('../../src/utils/download.js')
  mockDownloadTemplate.mockImplementation(downloadMod.downloadTemplate)
  mockDownloadTemplate.mockResolvedValue(undefined)

  const sharedMod = await import('@zl-uniapp-cli/shared')
  mockReplaceProjectName.mockImplementation(sharedMod.replaceProjectName)
  mockReplaceProjectName.mockResolvedValue(undefined)
})

const defaultOptions: CreateOptions = {
  name: 'test-app',
  template: 'uni-vue3',
  pm: 'pnpm',
}

describe('executeCreate', () => {
  it('应调用 downloadTemplate 并传递模板名和临时目录', async () => {
    const targetDir = path.join(os.tmpdir(), 'create-app-test-target')

    await executeCreate(defaultOptions, targetDir)

    expect(mockDownloadTemplate).toHaveBeenCalledWith('uni-vue3', expect.any(String))

    // 清理
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true })
    }
  })

  it('应调用 replaceProjectName 并传递临时目录和项目名', async () => {
    const targetDir = path.join(os.tmpdir(), 'create-app-test-target')

    await executeCreate(defaultOptions, targetDir)

    expect(mockReplaceProjectName).toHaveBeenCalledWith(expect.any(String), 'test-app')

    // 清理
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true })
    }
  })

  it('downloadTemplate 失败时应清理临时目录并抛出错误', async () => {
    mockDownloadTemplate.mockRejectedValue(new Error('模板拉取失败'))

    const targetDir = path.join(os.tmpdir(), 'create-app-test-fail')

    await expect(executeCreate(defaultOptions, targetDir)).rejects.toThrow('模板拉取失败')

    // 目标目录不应存在
    expect(fs.existsSync(targetDir)).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && npx vitest run tests/commands/create.test.ts`
Expected: 全部 3 个测试通过

- [ ] **Step 3: Commit**

```bash
git add packages/create-app/tests/commands/create.test.ts
git commit -m "test(create-app): add integration tests for executeCreate with degit"
```

---

### Task 9: 全量构建验证与清理

**Files:**
- Modify: `packages/create-app/package.json`（如确认 fs-extra 无直接引用则移除）

**Interfaces:**
- Consumes: 前面所有 Task 的产物
- Produces: 完整可工作的 CLI 工具

- [ ] **Step 1: 检查 create-app 是否还有 fs-extra 直接引用**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli && grep -r "fs-extra" packages/create-app/src/`
Expected: 无输出（create-app 不直接依赖 fs-extra，通过 shared 间接使用但已改为 replaceProjectName）

- [ ] **Step 2: 全量构建**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli && pnpm build`
Expected: 两个包均构建成功

- [ ] **Step 3: 运行全部测试**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli && pnpm test`
Expected: 新测试通过（旧的测试可能因已知的 stale import 路径问题失败，不在本次变更范围内）

- [ ] **Step 4: 验证 CLI 基本运行**

Run: `cd /Users/superhuan/Documents/project/zl-uniapp-cli/packages/create-app && node dist/index.js --help`
Expected: 输出帮助信息，包含 `create [name]` 命令

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: verify full build and test after degit migration"
```

（此步骤仅在发现需要额外修改时才有文件变更；如果构建和测试全部通过则跳过 commit）

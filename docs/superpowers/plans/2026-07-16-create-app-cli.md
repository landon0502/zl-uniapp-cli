---
change: create-app-cli
design-doc: docs/superpowers/specs/2026-07-16-create-app-cli-design.md
base-ref: HEAD
archived-with: 2026-07-17-create-app-cli
---

# create-app CLI 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 `create-app` CLI 命令，从 `templates/` 目录复制模板生成新项目，支持交互式问答和命令行参数两种配置方式。

**Architecture:** Commander 注册 CLI 命令和参数，Inquirer 补充缺失的交互式输入。核心流程为"参数解析 → 交互补充 → 前置检查 → 临时目录复制 → 元信息替换 → 原子性重命名"。使用 fs-extra 的 copy + filter 回调实现忽略列表，临时目录 + renameSync 保证原子性。

**Tech Stack:** TypeScript (ESM only), Commander v14, Inquirer v14, fs-extra v11, tsup (构建), tsx (开发), vitest (测试), Node.js >= 18

## Global Constraints

- `package.json` 必须声明 `"type": "module"` — 纯 ESM 方案
- `engines` 声明 `"node": ">=18"`
- `tsup` 仅输出 ESM 格式：`--format esm`
- `bin/index.js` 使用 `import` 引用 `../dist/index.js`
- 项目名必须匹配 kebab-case：`/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`
- 忽略列表固定为：`.svn`、`node_modules`、`.DS_Store`、`package-lock.json`
- 默认包管理器为 `pnpm`
- `renameSync` 跨设备失败时回退为 copy + remove

---

## 文件结构

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 修改 | `package.json` | 添加 type:module、engines、devDependencies |
| 修改 | `tsconfig.json` | 调整 module 为 NodeNext、target 为 ES2022 |
| 修改 | `bin/index.ts` → `bin/index.js` | ESM shebang 入口 |
| 创建 | `src/constants.ts` | 忽略列表、默认值、路径常量 |
| 创建 | `src/core/template.ts` | 模板发现：扫描 templates/ 目录 |
| 创建 | `src/core/copier.ts` | 模板复制：fs-extra.copy + filter |
| 创建 | `src/core/replacer.ts` | 元信息替换：package.json name |
| 创建 | `src/prompts/create.ts` | Inquirer 交互：项目名/模板/包管理器 |
| 创建 | `src/commands/create.ts` | create 命令：参数定义 + 流程编排 |
| 创建 | `src/index.ts` | CLI 入口：注册 Commander 程序和命令 |
| 创建 | `vitest.config.ts` | vitest 配置 |
| 创建 | `tests/constants.test.ts` | constants 单元测试 |
| 创建 | `tests/core/template.test.ts` | template 发现单元测试 |
| 创建 | `tests/core/copier.test.ts` | copier 单元测试 |
| 创建 | `tests/core/replacer.test.ts` | replacer 单元测试 |
| 创建 | `tests/prompts/create.test.ts` | prompts 单元测试 |
| 创建 | `tests/commands/create.test.ts` | create 命令集成测试 |
| 创建 | `tests/e2e/create.test.ts` | 端到端集成测试 |

---

### Task 1: 项目基础设施 — ESM 迁移与依赖配置

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `bin/index.ts` → rename to `bin/index.js`
- Create: `vitest.config.ts`
- Create: `src/index.ts` (占位)
- Test: `package.json` (验证 build/dev/test 脚本可执行)

**Interfaces:**
- Consumes: 无（首个任务）
- Produces: ESM 构建管线可运行；`vitest` 可执行测试；`PKG_ROOT` / `TEMPLATES_DIR` 常量路径（后续任务通过 `constants.ts` 引用）

- [x] **Step 1: 修改 `package.json`，添加 ESM 声明和 devDependencies**

将 `package.json` 替换为以下内容：

```json
{
  "name": "w-uni-cli",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "create-app": "./bin/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm",
    "dev": "tsx src/index.ts",
    "test": "vitest run"
  },
  "engines": {
    "node": ">=18"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "commander": "^14.0.3",
    "fs-extra": "^11.3.6",
    "inquirer": "^14.0.2"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^22.0.0",
    "@types/fs-extra": "^11.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [x] **Step 2: 修改 `tsconfig.json`，适配 ESM**

将 `tsconfig.json` 的 `compilerOptions` 中以下字段修改：

- `target` → `"ES2022"`
- `module` → `"NodeNext"`
- `moduleResolution` → `"NodeNext"`

保留其他已有配置不变。

- [x] **Step 3: 将 `bin/index.ts` 重命名为 `bin/index.js` 并更新内容**

删除 `bin/index.ts`，创建 `bin/index.js`：

```javascript
#!/usr/bin/env node
import '../dist/index.js'
```

- [x] **Step 4: 创建 `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
  },
})
```

- [x] **Step 5: 创建最小 `src/index.ts` 占位**

```typescript
console.log('create-app')
```

- [x] **Step 6: 安装依赖并验证构建**

运行: `npm install`
预期: 依赖安装成功

运行: `npm run build`
预期: 构建成功，`dist/index.js` 生成

运行: `npm run dev`
预期: 终端输出 `create-app`

运行: `npm run test`
预期: vitest 运行（无测试文件，显示 no test files found）

- [x] **Step 7: Commit**

```bash
git add package.json package-lock.json tsconfig.json bin/index.js bin/index.ts vitest.config.ts src/index.ts
git commit -m "feat: initialize ESM project infrastructure with tsup, vitest, and dev dependencies"
```

---

### Task 2: 常量与类型定义

**Files:**
- Create: `src/constants.ts`
- Test: `tests/constants.test.ts`

**Interfaces:**
- Consumes: 无
- Produces:
  - `COPY_IGNORE_PATTERNS: readonly string[]` — 忽略列表
  - `DEFAULT_PM: 'pnpm'` — 默认包管理器
  - `PKG_ROOT: string` — CLI 包根目录绝对路径
  - `TEMPLATES_DIR: string` — templates 目录绝对路径
  - `KEBAB_CASE_REGEX: RegExp` — 项目名校验正则
  - `type CreateOptions` — 完整创建选项 { name, template, pm }
  - `type PartialCreateOptions` — 部分创建选项 { name?, template?, pm? }
  - `type TemplateInfo` — 模板信息 { name, path }
  - `type PackageManager: 'pnpm' | 'npm' | 'yarn'`

- [x] **Step 1: 编写 `src/constants.ts` 失败测试**

创建 `tests/constants.test.ts`：

```typescript
import { describe, it, expect } from 'vitest'
import {
  COPY_IGNORE_PATTERNS,
  DEFAULT_PM,
  KEBAB_CASE_REGEX,
  PKG_ROOT,
  TEMPLATES_DIR,
} from '../src/constants.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

describe('constants', () => {
  it('COPY_IGNORE_PATTERNS 应包含必需的忽略项', () => {
    expect(COPY_IGNORE_PATTERNS).toContain('.svn')
    expect(COPY_IGNORE_PATTERNS).toContain('node_modules')
    expect(COPY_IGNORE_PATTERNS).toContain('.DS_Store')
    expect(COPY_IGNORE_PATTERNS).toContain('package-lock.json')
  })

  it('DEFAULT_PM 应为 pnpm', () => {
    expect(DEFAULT_PM).toBe('pnpm')
  })

  it('KEBAB_CASE_REGEX 应匹配合法 kebab-case 项目名', () => {
    expect(KEBAB_CASE_REGEX.test('my-app')).toBe(true)
    expect(KEBAB_CASE_REGEX.test('uni-vue3')).toBe(true)
    expect(KEBAB_CASE_REGEX.test('hello-world123')).toBe(true)
    expect(KEBAB_CASE_REGEX.test('a')).toBe(true)
  })

  it('KEBAB_CASE_REGEX 应拒绝非法项目名', () => {
    expect(KEBAB_CASE_REGEX.test('My-App')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('my_app')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('my app')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('-start')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('123app')).toBe(false)
    expect(KEBAB_CASE_REGEX.test('')).toBe(false)
  })

  it('PKG_ROOT 应指向包根目录', () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const expected = path.resolve(__dirname, '../')
    expect(PKG_ROOT).toBe(expected)
  })

  it('TEMPLATES_DIR 应指向 templates 子目录', () => {
    expect(TEMPLATES_DIR).toBe(path.join(PKG_ROOT, 'templates'))
  })

  it('TEMPLATES_DIR 目录应存在', () => {
    expect(fs.existsSync(TEMPLATES_DIR)).toBe(true)
  })
})
```

- [x] **Step 2: 运行测试，确认失败**

运行: `npx vitest run tests/constants.test.ts`
预期: FAIL — 模块 `../src/constants.js` 不存在

- [x] **Step 3: 实现 `src/constants.ts`**

```typescript
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

export interface TemplateInfo {
  name: string
  path: string
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const PKG_ROOT = path.resolve(__dirname, '../')

export const TEMPLATES_DIR = path.join(PKG_ROOT, 'templates')

export const COPY_IGNORE_PATTERNS = [
  '.svn',
  'node_modules',
  '.DS_Store',
  'package-lock.json',
] as const

export const DEFAULT_PM: PackageManager = 'pnpm'

export const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
```

- [x] **Step 4: 运行测试，确认通过**

运行: `npx vitest run tests/constants.test.ts`
预期: PASS — 所有 7 个测试用例通过

- [x] **Step 5: Commit**

```bash
git add src/constants.ts tests/constants.test.ts
git commit -m "feat: add constants, types, and path configuration for create-app CLI"
```

---

### Task 3: 模板发现 — `core/template.ts`

**Files:**
- Create: `src/core/template.ts`
- Test: `tests/core/template.test.ts`

**Interfaces:**
- Consumes: `TEMPLATES_DIR` from `constants.ts`
- Produces: `discoverTemplates(templatesDir?: string): Promise<TemplateInfo[]>` — 返回可用模板列表

- [x] **Step 1: 编写 `src/core/template.ts` 失败测试**

创建 `tests/core/template.test.ts`：

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { discoverTemplates } from '../../src/core/template.js'

describe('discoverTemplates', () => {
  it('应发现 templates/ 目录下的直接子目录作为模板', async () => {
    const templates = await discoverTemplates()
    expect(templates.length).toBeGreaterThan(0)
    expect(templates[0]).toHaveProperty('name')
    expect(templates[0]).toHaveProperty('path')
  })

  it('应发现 uni-vue3 模板', async () => {
    const templates = await discoverTemplates()
    const uniVue3 = templates.find((t) => t.name === 'uni-vue3')
    expect(uniVue3).toBeDefined()
    expect(uniVue3!.path).toContain('templates/uni-vue3')
  })

  it('空目录应返回空数组', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-templates-'))
    try {
      const result = await discoverTemplates(tmpDir)
      expect(result).toEqual([])
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })

  it('应忽略非目录文件', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-templates-'))
    try {
      fs.writeFileSync(path.join(tmpDir, 'readme.md'), 'hello')
      fs.mkdirSync(path.join(tmpDir, 'real-template'))
      const result = await discoverTemplates(tmpDir)
      expect(result).toEqual([
        { name: 'real-template', path: path.join(tmpDir, 'real-template') },
      ])
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
})
```

- [x] **Step 2: 运行测试，确认失败**

运行: `npx vitest run tests/core/template.test.ts`
预期: FAIL — 模块 `../../src/core/template.js` 不存在

- [x] **Step 3: 创建 `src/core/` 目录并实现 `src/core/template.ts`**

```typescript
import fs from 'node:fs'
import path from 'node:path'
import { TEMPLATES_DIR } from '../constants.js'
import type { TemplateInfo } from '../constants.js'

export async function discoverTemplates(
  templatesDir: string = TEMPLATES_DIR,
): Promise<TemplateInfo[]> {
  const entries = await fs.promises.readdir(templatesDir, {
    withFileTypes: true,
  })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: path.join(templatesDir, entry.name),
    }))
}
```

- [x] **Step 4: 运行测试，确认通过**

运行: `npx vitest run tests/core/template.test.ts`
预期: PASS — 所有 4 个测试用例通过

- [x] **Step 5: Commit**

```bash
git add src/core/template.ts tests/core/template.test.ts
git commit -m "feat: implement template discovery with directory scanning"
```

---

### Task 4: 模板复制 — `core/copier.ts`

**Files:**
- Create: `src/core/copier.ts`
- Test: `tests/core/copier.test.ts`

**Interfaces:**
- Consumes: `COPY_IGNORE_PATTERNS` from `constants.ts`
- Produces: `copyTemplate(src: string, dest: string): Promise<void>` — 复制模板到目标目录，过滤忽略文件；`createCopyFilter(ignoreList: readonly string[]): (src: string) => boolean` — 创建过滤函数

- [x] **Step 1: 编写 `src/core/copier.ts` 失败测试**

创建 `tests/core/copier.test.ts`：

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { copyTemplate, createCopyFilter } from '../../src/core/copier.js'
import { COPY_IGNORE_PATTERNS } from '../../src/constants.js'

describe('createCopyFilter', () => {
  it('应排除忽略列表中的文件和目录', () => {
    const filter = createCopyFilter(COPY_IGNORE_PATTERNS)
    expect(filter('/some/path/node_modules')).toBe(false)
    expect(filter('/some/path/.svn')).toBe(false)
    expect(filter('/some/path/.DS_Store')).toBe(false)
    expect(filter('/some/path/package-lock.json')).toBe(false)
  })

  it('应允许忽略列表之外的文件和目录', () => {
    const filter = createCopyFilter(COPY_IGNORE_PATTERNS)
    expect(filter('/some/path/src')).toBe(true)
    expect(filter('/some/path/package.json')).toBe(true)
    expect(filter('/some/path/index.html')).toBe(true)
  })
})

describe('copyTemplate', () => {
  let srcDir: string
  let destDir: string

  beforeEach(() => {
    srcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copier-src-'))
    destDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copier-dest-'))
  })

  afterEach(() => {
    fs.rmSync(srcDir, { recursive: true, force: true })
    fs.rmSync(destDir, { recursive: true, force: true })
  })

  it('应复制所有非忽略文件', async () => {
    fs.writeFileSync(path.join(srcDir, 'package.json'), '{"name": "test"}')
    fs.mkdirSync(path.join(srcDir, 'src'))
    fs.writeFileSync(path.join(srcDir, 'src/index.js'), 'console.log("hi")')

    await copyTemplate(srcDir, destDir)

    expect(fs.existsSync(path.join(destDir, 'package.json'))).toBe(true)
    expect(fs.existsSync(path.join(destDir, 'src/index.js'))).toBe(true)
  })

  it('应排除忽略列表中的目录和文件', async () => {
    fs.writeFileSync(path.join(srcDir, 'package.json'), '{}')
    fs.mkdirSync(path.join(srcDir, 'node_modules'))
    fs.writeFileSync(
      path.join(srcDir, 'node_modules/pkg.js'),
      'should not copy',
    )
    fs.mkdirSync(path.join(srcDir, '.svn'))
    fs.writeFileSync(path.join(srcDir, '.svn/entries'), 'should not copy')
    fs.writeFileSync(path.join(srcDir, '.DS_Store'), 'should not copy')
    fs.writeFileSync(path.join(srcDir, 'package-lock.json'), '{}')

    await copyTemplate(srcDir, destDir)

    expect(fs.existsSync(path.join(destDir, 'node_modules'))).toBe(false)
    expect(fs.existsSync(path.join(destDir, '.svn'))).toBe(false)
    expect(fs.existsSync(path.join(destDir, '.DS_Store'))).toBe(false)
    expect(
      fs.existsSync(path.join(destDir, 'package-lock.json')),
    ).toBe(false)
    expect(fs.existsSync(path.join(destDir, 'package.json'))).toBe(true)
  })
})
```

- [x] **Step 2: 运行测试，确认失败**

运行: `npx vitest run tests/core/copier.test.ts`
预期: FAIL — 模块 `../../src/core/copier.js` 不存在

- [x] **Step 3: 实现 `src/core/copier.ts`**

```typescript
import path from 'node:path'
import fse from 'fs-extra'
import { COPY_IGNORE_PATTERNS } from '../constants.js'

export function createCopyFilter(
  ignoreList: readonly string[],
): (src: string) => boolean {
  return (src: string) => {
    const basename = path.basename(src)
    return !ignoreList.includes(basename)
  }
}

export async function copyTemplate(
  src: string,
  dest: string,
): Promise<void> {
  const filter = createCopyFilter(COPY_IGNORE_PATTERNS)
  await fse.copy(src, dest, { filter })
}
```

- [x] **Step 4: 运行测试，确认通过**

运行: `npx vitest run tests/core/copier.test.ts`
预期: PASS — 所有 4 个测试用例通过

- [x] **Step 5: Commit**

```bash
git add src/core/copier.ts tests/core/copier.test.ts
git commit -m "feat: implement template copying with ignore list filter"
```

---

### Task 5: 元信息替换 — `core/replacer.ts`

**Files:**
- Create: `src/core/replacer.ts`
- Test: `tests/core/replacer.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: `replaceProjectName(dir: string, name: string): Promise<void>` — 读取目录下 package.json，替换 name 字段并写回

- [x] **Step 1: 编写 `src/core/replacer.ts` 失败测试**

创建 `tests/core/replacer.test.ts`：

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { replaceProjectName } from '../../src/core/replacer.js'

describe('replaceProjectName', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'replacer-test-'))
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('应替换 package.json 的 name 字段', async () => {
    const pkgPath = path.join(tempDir, 'package.json')
    fs.writeFileSync(pkgPath, JSON.stringify({ name: 'old-name', version: '1.0.0' }))

    await replaceProjectName(tempDir, 'my-new-app')

    const content = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(content.name).toBe('my-new-app')
    expect(content.version).toBe('1.0.0')
  })

  it('不应修改 package.json 中的其他字段', async () => {
    const pkgPath = path.join(tempDir, 'package.json')
    const original = {
      name: 'template-name',
      version: '0.0.0',
      scripts: { dev: 'uni' },
      dependencies: { vue: '^3.0.0' },
    }
    fs.writeFileSync(pkgPath, JSON.stringify(original))

    await replaceProjectName(tempDir, 'new-project')

    const content = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(content.name).toBe('new-project')
    expect(content.version).toBe('0.0.0')
    expect(content.scripts).toEqual({ dev: 'uni' })
    expect(content.dependencies).toEqual({ vue: '^3.0.0' })
  })

  it('当 package.json 不存在时应抛出错误', async () => {
    await expect(replaceProjectName(tempDir, 'my-app')).rejects.toThrow()
  })
})
```

- [x] **Step 2: 运行测试，确认失败**

运行: `npx vitest run tests/core/replacer.test.ts`
预期: FAIL — 模块 `../../src/core/replacer.js` 不存在

- [x] **Step 3: 实现 `src/core/replacer.ts`**

```typescript
import fs from 'node:fs'
import path from 'node:path'

export async function replaceProjectName(
  dir: string,
  name: string,
): Promise<void> {
  const pkgPath = path.join(dir, 'package.json')
  const content = await fs.promises.readFile(pkgPath, 'utf-8')
  const pkg = JSON.parse(content)
  pkg.name = name
  await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}
```

- [x] **Step 4: 运行测试，确认通过**

运行: `npx vitest run tests/core/replacer.test.ts`
预期: PASS — 所有 3 个测试用例通过

- [x] **Step 5: Commit**

```bash
git add src/core/replacer.ts tests/core/replacer.test.ts
git commit -m "feat: implement package.json name replacement"
```

---

### Task 6: 交互式问答 — `prompts/create.ts`

**Files:**
- Create: `src/prompts/create.ts`
- Test: `tests/prompts/create.test.ts`

**Interfaces:**
- Consumes: `KEBAB_CASE_REGEX`, `DEFAULT_PM` from `constants.ts`；`discoverTemplates()` from `core/template.ts`；`PartialCreateOptions`, `PackageManager`, `CreateOptions` from `constants.ts`
- Produces: `promptCreateOptions(partial: PartialCreateOptions): Promise<CreateOptions>` — 收集用户输入，填充缺失字段

- [x] **Step 1: 编写 `src/prompts/create.ts` 失败测试**

创建 `tests/prompts/create.test.ts`：

```typescript
import { describe, it, expect, vi } from 'vitest'
import { promptCreateOptions } from '../../src/prompts/create.js'
import type { PartialCreateOptions } from '../../src/constants.js'

// Mock inquirer
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}))

// Mock template discovery
vi.mock('../../src/core/template.js', () => ({
  discoverTemplates: vi.fn().mockResolvedValue([
    { name: 'uni-vue3', path: '/fake/templates/uni-vue3' },
    { name: 'uni-react', path: '/fake/templates/uni-react' },
  ]),
}))

import inquirer from 'inquirer'

describe('promptCreateOptions', () => {
  it('当所有参数已提供时，应跳过所有交互', async () => {
    const input: PartialCreateOptions = {
      name: 'my-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result).toEqual({
      name: 'my-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    })
    expect(inquirer.default.prompt).not.toHaveBeenCalled()
  })

  it('当项目名缺失时，应提示输入', async () => {
    vi.mocked(inquirer.default.prompt).mockResolvedValueOnce({
      name: 'my-app',
    })
    const input: PartialCreateOptions = {
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result.name).toBe('my-app')
  })

  it('当项目名不合法时，应提示重新输入', async () => {
    vi.mocked(inquirer.default.prompt)
      .mockResolvedValueOnce({ name: 'My App' })
      .mockResolvedValueOnce({ name: 'my-app' })
    const input: PartialCreateOptions = {
      name: 'My App',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result.name).toBe('my-app')
  })

  it('当模板缺失时，应提示选择', async () => {
    vi.mocked(inquirer.default.prompt).mockResolvedValueOnce({
      template: 'uni-vue3',
    })
    const input: PartialCreateOptions = {
      name: 'my-app',
      pm: 'pnpm',
    }
    const result = await promptCreateOptions(input)
    expect(result.template).toBe('uni-vue3')
  })

  it('当包管理器缺失时，应提示选择', async () => {
    vi.mocked(inquirer.default.prompt).mockResolvedValueOnce({ pm: 'pnpm' })
    const input: PartialCreateOptions = {
      name: 'my-app',
      template: 'uni-vue3',
    }
    const result = await promptCreateOptions(input)
    expect(result.pm).toBe('pnpm')
  })

  it('仅一个模板时应跳过模板选择', async () => {
    const { discoverTemplates } = await import('../../src/core/template.js')
    vi.mocked(discoverTemplates).mockResolvedValueOnce([
      { name: 'uni-vue3', path: '/fake/templates/uni-vue3' },
    ])
    vi.mocked(inquirer.default.prompt).mockResolvedValueOnce({ pm: 'pnpm' })
    const input: PartialCreateOptions = {
      name: 'my-app',
    }
    const result = await promptCreateOptions(input)
    expect(result.template).toBe('uni-vue3')
  })
})
```

- [x] **Step 2: 运行测试，确认失败**

运行: `npx vitest run tests/prompts/create.test.ts`
预期: FAIL — 模块 `../../src/prompts/create.js` 不存在

- [x] **Step 3: 实现 `src/prompts/create.ts`**

```typescript
import inquirer from 'inquirer'
import { KEBAB_CASE_REGEX, DEFAULT_PM } from '../constants.js'
import { discoverTemplates } from '../core/template.js'
import type { CreateOptions, PartialCreateOptions, PackageManager } from '../constants.js'

export async function promptCreateOptions(
  partial: PartialCreateOptions,
): Promise<CreateOptions> {
  let name = partial.name
  let template = partial.template
  let pm = partial.pm

  // Step 1: 交互补充项目名
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
    // 命令行传入的名称不合法，重新输入
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

  // Step 2: 交互补充模板选择
  if (!template) {
    const templates = await discoverTemplates()

    if (templates.length === 1) {
      template = templates[0].name
    } else if (templates.length > 1) {
      const answers = await inquirer.prompt<{ template: string }>([
        {
          type: 'list',
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

  // Step 3: 交互补充包管理器
  if (!pm) {
    const answers = await inquirer.prompt<{ pm: PackageManager }>([
      {
        type: 'list',
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

- [x] **Step 4: 运行测试，确认通过**

运行: `npx vitest run tests/prompts/create.test.ts`
预期: PASS — 所有 6 个测试用例通过

- [x] **Step 5: Commit**

```bash
git add src/prompts/create.ts tests/prompts/create.test.ts
git commit -m "feat: implement interactive prompts with inquirer"
```

---

### Task 7: create 命令 — `commands/create.ts`

**Files:**
- Create: `src/commands/create.ts`
- Test: `tests/commands/create.test.ts`

**Interfaces:**
- Consumes: `promptCreateOptions()` from `prompts/create.ts`；`copyTemplate()` from `core/copier.ts`；`replaceProjectName()` from `core/replacer.ts`；`discoverTemplates()` from `core/template.ts`；`TEMPLATES_DIR`, `CreateOptions`, `PartialCreateOptions` from `constants.ts`
- Produces: `registerCreateCommand(program: Command): void` — 注册 create 命令；`executeCreate(options: CreateOptions, targetDir: string): Promise<void>` — 执行创建流程（供测试直接调用）

- [x] **Step 1: 编写 `src/commands/create.ts` 失败测试**

创建 `tests/commands/create.test.ts`：

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { executeCreate } from '../../src/commands/create.js'
import type { CreateOptions } from '../../src/constants.js'

// Mock prompts
vi.mock('../../src/prompts/create.js', () => ({
  promptCreateOptions: vi.fn().mockResolvedValue({
    name: 'test-app',
    template: 'uni-vue3',
    pm: 'pnpm',
  }),
}))

// Mock copier
vi.mock('../../src/core/copier.js', () => ({
  copyTemplate: vi.fn().mockResolvedValue(undefined),
}))

// Mock replacer
vi.mock('../../src/core/replacer.js', () => ({
  replaceProjectName: vi.fn().mockResolvedValue(undefined),
}))

// Mock template discovery
vi.mock('../../src/core/template.js', () => ({
  discoverTemplates: vi.fn().mockResolvedValue([
    { name: 'uni-vue3', path: '/fake/templates/uni-vue3' },
  ]),
}))

describe('executeCreate', () => {
  let tempTargetDir: string

  beforeEach(() => {
    tempTargetDir = path.join(
      os.tmpdir(),
      `test-create-${Date.now()}`,
    )
  })

  afterEach(() => {
    if (fs.existsSync(tempTargetDir)) {
      fs.rmSync(tempTargetDir, { recursive: true, force: true })
    }
  })

  it('应调用 copyTemplate 并传递正确的参数', async () => {
    const options: CreateOptions = {
      name: 'test-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }

    fs.mkdirSync(tempTargetDir, { recursive: true })
    await executeCreate(options, tempTargetDir)

    const { copyTemplate } = await import('../../src/core/copier.js')
    expect(copyTemplate).toHaveBeenCalled()
  })

  it('应调用 replaceProjectName 替换项目名', async () => {
    const options: CreateOptions = {
      name: 'test-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }

    fs.mkdirSync(tempTargetDir, { recursive: true })
    await executeCreate(options, tempTargetDir)

    const { replaceProjectName } = await import('../../src/core/replacer.js')
    expect(replaceProjectName).toHaveBeenCalledWith(
      expect.any(String),
      'test-app',
    )
  })
})
```

- [x] **Step 2: 运行测试，确认失败**

运行: `npx vitest run tests/commands/create.test.ts`
预期: FAIL — 模块 `../../src/commands/create.js` 不存在

- [x] **Step 3: 实现 `src/commands/create.ts`**

```typescript
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
```

- [x] **Step 4: 运行测试，确认通过**

运行: `npx vitest run tests/commands/create.test.ts`
预期: PASS — 所有 2 个测试用例通过

- [x] **Step 5: Commit**

```bash
git add src/commands/create.ts tests/commands/create.test.ts
git commit -m "feat: implement create command with flow orchestration and atomic rename"
```

---

### Task 8: CLI 入口 — `index.ts`

**Files:**
- Modify: `src/index.ts` (替换占位内容)

**Interfaces:**
- Consumes: `registerCreateCommand()` from `commands/create.ts`
- Produces: CLI 程序入口

- [x] **Step 1: 替换 `src/index.ts` 为正式 CLI 入口**

```typescript
import { Command } from 'commander'
import { registerCreateCommand } from './commands/create.js'

const program = new Command()

program
  .name('create-app')
  .description('快速创建 uni-app 项目')
  .version('1.0.0')

registerCreateCommand(program)

program.parse()
```

- [x] **Step 2: 运行构建，确认无错误**

运行: `npm run build`
预期: 构建成功，`dist/index.js` 生成

- [x] **Step 3: 运行 CLI 帮助，确认命令注册成功**

运行: `node dist/index.js --help`
预期: 输出包含 `create [name]` 命令

运行: `node dist/index.js create --help`
预期: 输出包含 `-t, --template` 和 `-p, --pm` 选项

- [x] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire up CLI entry point with commander program and create command"
```

---

### Task 9: 集成验证 — 端到端测试

**Files:**
- Create: `tests/e2e/create.test.ts`

**Interfaces:**
- Consumes: 完整 CLI 流程
- Produces: 集成测试验证

- [x] **Step 1: 编写端到端测试**

创建 `tests/e2e/create.test.ts`：

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { executeCreate } from '../../src/commands/create.js'
import type { CreateOptions } from '../../src/constants.js'

describe('create CLI 集成测试', () => {
  let tempOutputDir: string

  beforeEach(() => {
    tempOutputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-create-'))
  })

  afterEach(() => {
    fs.rmSync(tempOutputDir, { recursive: true, force: true })
  })

  it('应完整创建项目：复制 → 替换 name → 目录结构完整', async () => {
    const options: CreateOptions = {
      name: 'my-test-app',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'my-test-app')

    await executeCreate(options, targetDir)

    // 验证目标目录存在
    expect(fs.existsSync(targetDir)).toBe(true)

    // 验证 package.json 存在且 name 已替换
    const pkgPath = path.join(targetDir, 'package.json')
    expect(fs.existsSync(pkgPath)).toBe(true)
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    expect(pkg.name).toBe('my-test-app')

    // 验证关键目录/文件存在
    expect(fs.existsSync(path.join(targetDir, 'src'))).toBe(true)
    expect(fs.existsSync(path.join(targetDir, 'index.html'))).toBe(true)
  })

  it('应排除忽略列表中的文件和目录', async () => {
    const options: CreateOptions = {
      name: 'ignore-test',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'ignore-test')

    await executeCreate(options, targetDir)

    // 验证忽略项未被复制
    expect(fs.existsSync(path.join(targetDir, 'node_modules'))).toBe(false)
    expect(fs.existsSync(path.join(targetDir, '.svn'))).toBe(false)
    expect(fs.existsSync(path.join(targetDir, '.DS_Store'))).toBe(false)
    expect(
      fs.existsSync(path.join(targetDir, 'package-lock.json')),
    ).toBe(false)
  })

  it('应保留 package.json 中除 name 外的所有字段', async () => {
    const options: CreateOptions = {
      name: 'field-preserve-test',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'field-preserve-test')

    await executeCreate(options, targetDir)

    const pkg = JSON.parse(
      fs.readFileSync(path.join(targetDir, 'package.json'), 'utf-8'),
    )
    expect(pkg.name).toBe('field-preserve-test')
    expect(pkg.version).toBeDefined()
    expect(pkg.scripts).toBeDefined()
    expect(pkg.dependencies).toBeDefined()
    expect(pkg.devDependencies).toBeDefined()
  })

  it('目标目录已存在时 executeCreate 应抛出错误', async () => {
    const options: CreateOptions = {
      name: 'existing-dir',
      template: 'uni-vue3',
      pm: 'pnpm',
    }
    const targetDir = path.join(tempOutputDir, 'existing-dir')
    fs.mkdirSync(targetDir)
    fs.writeFileSync(path.join(targetDir, 'existing-file.txt'), 'old')

    // executeCreate 会直接 rename，如果目标已存在会抛错
    await expect(executeCreate(options, targetDir)).rejects.toThrow()
  })
})
```

- [x] **Step 2: 运行端到端测试，确认通过**

运行: `npx vitest run tests/e2e/create.test.ts`
预期: PASS — 所有 4 个测试用例通过

- [x] **Step 3: 运行全部测试，确认无回归**

运行: `npm run test`
预期: 所有测试通过

- [x] **Step 4: 手动验证 CLI 交互体验**

运行: `npm run dev`
预期: 显示 create-app 帮助信息

运行: `npm run dev -- create --help`
预期: 显示 create 命令的选项说明

运行: `npm run dev -- create my-test-project --template uni-vue3 --pm pnpm`
预期: 项目创建成功，输出成功消息和后续步骤

验证生成的项目:
运行: `ls my-test-project/ && cat my-test-project/package.json | head -3`
预期: 目录结构完整，package.json name 为 "my-test-project"

清理: `rm -rf my-test-project`

- [x] **Step 5: Commit**

```bash
git add tests/e2e/create.test.ts
git commit -m "test: add end-to-end integration tests for create command"
```

---

### Task 10: 最终构建与清理

**Files:**
- Verify: 构建产物

**Interfaces:**
- Consumes: 所有前序任务
- Produces: 可分发的 CLI 工具

- [x] **Step 1: 运行完整构建**

运行: `npm run build`
预期: 构建成功，无错误

- [x] **Step 2: 验证构建产物**

运行: `node dist/index.js --help`
预期: 显示 create-app 帮助信息

运行: `node dist/index.js create --help`
预期: 显示 create 命令选项

- [x] **Step 3: 运行全部测试**

运行: `npm run test`
预期: 所有测试通过，无跳过、无失败

- [x] **Step 4: 验证 bin 入口**

运行: `node bin/index.js --help`
预期: 显示 create-app 帮助信息（与 dist 产物一致）

- [x] **Step 5: Final Commit**

```bash
git add -A
git commit -m "chore: verify final build and clean up"
```

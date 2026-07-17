---
comet_change: monorepo-cli-restructure
role: technical-design
canonical_spec: openspec
---

# Monorepo CLI 重构技术设计

## 1. 概述

将 `zl-uniapp-cli` 单包项目重构为 pnpm Monorepo 架构 `wh-templates`，CLI 重命名为 `create-app`，模板与 CLI 解耦，共享工具抽取为 `@wh-templates/shared` 包。

采用渐进式迁移策略：骨架 → shared → CLI → 模板 → 测试 → 清理，每步可独立验证。

## 2. 目录结构

```
wh-templates/
├── packages/
│   ├── create-app/                 # CLI 包
│   │   ├── bin/
│   │   │   └── index.js            # #!/usr/bin/env node
│   │   ├── src/
│   │   │   ├── index.ts            # Commander 注册
│   │   │   ├── constants.ts        # 类型 + TEMPLATES_DIR
│   │   │   ├── commands/
│   │   │   │   └── create.ts       # create 命令
│   │   │   ├── prompts/
│   │   │   │   └── create.ts       # 交互提示
│   │   │   ├── templates/
│   │   │   │   └── templates.ts    # 模板配置中心
│   │   │   └── utils/
│   │   │       ├── download.ts     # 模板复制
│   │   │       └── install.ts      # 依赖安装
│   │   ├── tests/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   └── shared/                     # 共享工具包
│       ├── src/
│       │   ├── index.ts            # 统一导出
│       │   ├── copier.ts           # 模板复制
│       │   ├── replacer.ts         # 项目名替换
│       │   ├── template.ts         # 模板发现
│       │   └── logger.ts           # 日志工具
│       ├── tests/
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
├── templates/                      # 模板目录（不纳入 workspace）
│   └── uniapp-base/                # 原 uni-vue3
├── pnpm-workspace.yaml
├── package.json                    # 根 package.json
├── eslint.config.mjs
├── prettier.config.mjs
└── .gitignore
```

## 3. 包配置

### 3.1 根 package.json

```json
{
  "name": "wh-templates",
  "private": true,
  "packageManager": "pnpm@10",
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm --filter create-app dev",
    "test": "pnpm -r test"
  }
}
```

### 3.2 pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
```

### 3.3 create-app/package.json

```json
{
  "name": "create-app",
  "version": "1.0.0",
  "type": "module",
  "bin": { "create-app": "./dist/index.js" },
  "main": "dist/index.js",
  "scripts": {
    "build": "tsup src/index.ts --format esm",
    "dev": "tsx src/index.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "@wh-templates/shared": "workspace:*",
    "commander": "^14.0.3",
    "inquirer": "^14.0.2",
    "execa": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.8.0",
    "vitest": "^3.0.0"
  }
}
```

### 3.4 @wh-templates/shared/package.json

```json
{
  "name": "@wh-templates/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "exports": { ".": "./dist/index.js" },
  "scripts": {
    "build": "tsup src/index.ts --format esm",
    "test": "vitest run"
  },
  "dependencies": {
    "fs-extra": "^11.3.6"
  },
  "devDependencies": {
    "@types/fs-extra": "^11.0.0",
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.8.0",
    "vitest": "^3.0.0"
  }
}
```

## 4. 核心模块设计

### 4.1 模板配置中心（templates.ts）

静态注册表，不动态扫描文件系统。`value` 直接映射到 `templates/<value>/` 目录名。

```ts
export interface TemplateEntry {
  name: string    // 显示名称（如 "UniApp 基础版"）
  value: string   // 标识符 kebab-case（如 "uniapp-base"）
}

export const templates: TemplateEntry[] = [
  { name: 'UniApp 基础版', value: 'uniapp-base' },
]
```

后续远程模板中心可扩展此接口，增加 `source`、`version` 等字段。

### 4.2 依赖安装（install.ts）

使用 execa 调用用户选择的包管理器。安装失败时显示错误信息，不删除项目目录。

```ts
import { execa } from 'execa'
import type { PackageManager } from '../constants.js'

export async function installDependencies(
  dir: string,
  pm: PackageManager,
): Promise<void> {
  try {
    await execa(pm, ['install'], { cwd: dir, stdio: 'inherit' })
  } catch (error) {
    console.error(`\n❌ 依赖安装失败，请手动运行: cd ${dir} && ${pm} install\n`)
    throw error
  }
}
```

### 4.3 日志工具（logger.ts）

```ts
export const logger = {
  info: (msg: string) => console.log(`\n${msg}\n`),
  success: (msg: string) => console.log(`\n✅ ${msg}\n`),
  error: (msg: string) => console.error(`\n❌ ${msg}\n`),
  step: (msg: string) => console.log(`  ${msg}`),
}
```

### 4.4 TEMPLATES_DIR 路径计算

开发时模板在仓库根 `templates/` 目录，CLI 在 `packages/create-app/`，需要向上两级：

```ts
const __dirname = path.dirname(fileURLToPath(import.meta.url))
// 开发时：packages/create-app/dist/ → ../../templates/
export const TEMPLATES_DIR = path.resolve(__dirname, '../../templates')
```

发布策略后续在 `remote-template-center` change 中统一处理。

### 4.5 create 命令流程

```
create-app [name]
    │
    ├─ 1. 解析命令行参数（name, --template, --pm, --no-install）
    │
    ├─ 2. 交互补充缺失参数
    │     ├─ 项目名称（kebab-case 校验）
    │     ├─ 模板选择（从 templates 注册表）
    │     └─ 包管理器选择
    │
    ├─ 3. 前置检查（目标目录是否存在）
    │
    ├─ 4. 复制模板到临时目录（shared.copyTemplate）
    │
    ├─ 5. 替换 package.json name（shared.replaceProjectName）
    │
    ├─ 6. 原子性重命名（临时目录 → 目标目录）
    │
    ├─ 7. 安装依赖（install.ts，除非 --no-install）
    │
    └─ 8. 输出成功信息
```

### 4.6 shared 包导出

```ts
// packages/shared/src/index.ts
export { copyTemplate, createCopyFilter } from './copier.js'
export { replaceProjectName } from './replacer.js'
export { discoverTemplates } from './template.js'
export { logger } from './logger.js'

// 类型导出
export type { TemplateInfo } from './template.js'
```

CLI 通过 `import { copyTemplate, replaceProjectName } from '@wh-templates/shared'` 引用。

## 5. 迁移步骤

### Step 1: Monorepo 骨架

1. 创建 `pnpm-workspace.yaml`
2. 创建根 `package.json`
3. 创建 `packages/create-app/package.json`
4. 创建 `packages/shared/package.json`
5. 为两个包创建 `tsconfig.json`
6. 运行 `pnpm install` 验证 workspace 链接

### Step 2: shared 包迁移

1. 创建 `packages/shared/src/` 目录
2. 迁移 `src/core/copier.ts` → `packages/shared/src/copier.ts`
3. 迁移 `src/core/replacer.ts` → `packages/shared/src/replacer.ts`
4. 迁移 `src/core/template.ts` → `packages/shared/src/template.ts`
5. 新增 `packages/shared/src/logger.ts`
6. 创建 `packages/shared/src/index.ts` 统一导出
7. 配置 tsup 构建，验证通过

### Step 3: create-app 包迁移

1. 创建 `packages/create-app/src/` 目录结构
2. 迁移 `constants.ts`，更新 TEMPLATES_DIR 为 `../../templates`
3. 迁移 `commands/create.ts`，更新 import 路径
4. 迁移 `prompts/create.ts`，更新 import 路径
5. 新增 `templates/templates.ts`（模板配置中心）
6. 新增 `utils/download.ts`（调用 shared.copyTemplate）
7. 新增 `utils/install.ts`（execa 依赖安装）
8. 重写 `index.ts`（create-app 入口）
9. 创建 `bin/index.js`
10. 配置 tsup 构建，验证通过

### Step 4: 模板迁移

1. `git mv templates/uni-vue3 templates/uniapp-base`
2. 验证模板路径在 CLI 中正确解析

### Step 5: 测试迁移

1. 迁移 shared 相关测试到 `packages/shared/tests/`
2. 迁移 CLI 相关测试到 `packages/create-app/tests/`
3. 更新所有 import 路径
4. 为两个包分别配置 vitest
5. 验证 `pnpm test` 全部通过

### Step 6: 清理与验证

1. 删除根目录旧文件（src/、tests/、bin/）
2. 更新 `.gitignore`
3. 更新 eslint/prettier 配置适配 Monorepo
4. 端到端验证

## 6. 测试策略

### shared 包测试

| 测试文件 | 测试内容 |
|---------|---------|
| `copier.test.ts` | 模板复制 + 忽略过滤 |
| `replacer.test.ts` | package.json name 替换 |
| `template.test.ts` | 模板发现（传入 mock 目录） |
| `logger.test.ts` | 日志输出格式 |

### create-app 包测试

| 测试文件 | 测试内容 |
|---------|---------|
| `constants.test.ts` | TEMPLATES_DIR 路径计算 |
| `prompts/create.test.ts` | 交互提示逻辑 |
| `commands/create.test.ts` | create 命令完整流程 |
| `e2e/create.test.ts` | 端到端：实际创建项目 |

### 测试迁移要点

- import 路径从 `../core/xxx.js` 改为 `@wh-templates/shared`
- 测试中的模板路径 fixture 需适配新目录结构
- vitest 配置每个包独立，resolve alias 处理 workspace 引用

## 7. 风险与缓解

| 风险 | 缓解 |
|------|------|
| TEMPLATES_DIR 开发/发布路径不同 | 先硬编码开发路径 `../../templates`，发布策略后续定 |
| pnpm workspace 链接异常 | 本地验证通过即可，CI 后续配置 |
| 模板重命名影响 git 历史 | 使用 `git mv` 保留历史 |
| execa v9 API 变化 | 使用最新稳定版，参考官方文档 |
| fs-extra 从 CLI 移到 shared 后测试 mock 需调整 | 通过 shared 包导出接口 mock |
| shared 包过度抽象 | 只抽取明确被复用的工具，不提前抽象 |

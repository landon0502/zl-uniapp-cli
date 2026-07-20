---
change: monorepo-cli-restructure
design-doc: docs/superpowers/specs/2026-07-17-monorepo-cli-restructure-design.md
base-ref: 7e264bd4fa75c5f76d9d994731be0a64613423b7
---

# Monorepo CLI 重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `zl-uniapp-cli` 单包项目重构为 pnpm Monorepo `zl-uniapp-cli`，CLI 重命名为 `create-app`，模板与 CLI 解耦，共享工具抽取为 `@zl-uniapp-cli/shared` 包。

**Architecture:** pnpm workspace 管理 2 个 packages（create-app + shared），模板目录独立于 workspace。CLI 通过 `@zl-uniapp-cli/shared` 引用共享工具（copier、replacer、template、logger），新增模板配置中心（templates.ts）和依赖安装功能（execa）。

**Tech Stack:** TypeScript (ESM only), Commander v14, Inquirer v14, fs-extra v11, execa v9, tsup (构建), tsx (开发), vitest (测试), pnpm workspace, Node.js >= 18

## Global Constraints

- 所有 `package.json` 必须声明 `"type": "module"` — 纯 ESM 方案
- `engines` 声明 `"node": ">=18"`
- `tsup` 仅输出 ESM 格式：`--format esm`
- `bin/index.js` 使用 `import` 引用 `../dist/index.js`
- 项目名必须匹配 kebab-case：`/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`
- 忽略列表固定为：`.svn`、`node_modules`、`.DS_Store`、`package-lock.json`
- 默认包管理器为 `pnpm`
- `renameSync` 跨设备失败时回退为 copy + remove
- TEMPLATES_DIR 开发时使用 `../../templates`（相对 dist/ 向上两级）

---

## Phase 1: Monorepo 骨架搭建

### Step 1.1: 创建 pnpm-workspace.yaml

- [ ] 创建 `pnpm-workspace.yaml`，内容：
```yaml
packages:
  - "packages/*"
```

### Step 1.2: 创建根 package.json

- [ ] 将现有 `package.json` 替换为 Monorepo 根配置：
```json
{
  "name": "zl-uniapp-cli",
  "private": true,
  "packageManager": "pnpm@10",
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm --filter create-app dev",
    "test": "pnpm -r test"
  }
}
```

### Step 1.3: 创建 packages/create-app/package.json

- [ ] 创建 `packages/create-app/package.json`：
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
  "engines": { "node": ">=18" },
  "dependencies": {
    "@zl-uniapp-cli/shared": "workspace:*",
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

### Step 1.4: 创建 packages/shared/package.json

- [ ] 创建 `packages/shared/package.json`：
```json
{
  "name": "@zl-uniapp-cli/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "exports": { ".": "./dist/index.js" },
  "scripts": {
    "build": "tsup src/index.ts --format esm",
    "test": "vitest run"
  },
  "engines": { "node": ">=18" },
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

### Step 1.5: 创建各包 tsconfig.json

- [ ] 创建 `packages/create-app/tsconfig.json`（从根 tsconfig.json 复制核心配置，调整 include 为 `src/`）
- [ ] 创建 `packages/shared/tsconfig.json`（同上）

### Step 1.6: 安装依赖验证 workspace

- [ ] 删除根目录 `node_modules/`、`package-lock.json`
- [ ] 运行 `pnpm install`，验证 workspace 链接正确（`ls node_modules/@zl-uniapp-cli/shared` 应指向 `packages/shared`）

---

## Phase 2: shared 包迁移

### Step 2.1: 创建目录结构

- [ ] 创建 `packages/shared/src/` 目录

### Step 2.2: 迁移 copier.ts

- [ ] 将 `src/core/copier.ts` 复制到 `packages/shared/src/copier.ts`
- [ ] 更新 import：`'../constants.js'` → 从本地 `constants.ts` 导入

### Step 2.3: 迁移 replacer.ts

- [ ] 将 `src/core/replacer.ts` 复制到 `packages/shared/src/replacer.ts`（无 import 变更）

### Step 2.4: 迁移 template.ts

- [ ] 将 `src/core/template.ts` 复制到 `packages/shared/src/template.ts`
- [ ] 移除对 `TEMPLATES_DIR` 的 import，改为纯函数接受 `templatesDir` 参数（已如此设计）

### Step 2.5: 新增 constants.ts

- [ ] 创建 `packages/shared/src/constants.ts`，导出 `COPY_IGNORE_PATTERNS` 和 `TemplateInfo` 类型

### Step 2.6: 新增 logger.ts

- [ ] 创建 `packages/shared/src/logger.ts`

### Step 2.7: 创建 index.ts 统一导出

- [ ] 创建 `packages/shared/src/index.ts`，导出所有工具和类型

### Step 2.8: 验证 shared 构建

- [ ] 运行 `pnpm --filter @zl-uniapp-cli/shared build`，确认构建成功

---

## Phase 3: create-app 包迁移

### Step 3.1: 创建目录结构

- [ ] 创建 `packages/create-app/src/commands/`、`prompts/`、`templates/`、`utils/` 目录

### Step 3.2: 迁移 constants.ts

- [ ] 将 `src/constants.ts` 复制到 `packages/create-app/src/constants.ts`
- [ ] 更新 `TEMPLATES_DIR` 为 `path.resolve(__dirname, '../../templates')`
- [ ] 移除 `COPY_IGNORE_PATTERNS`（从 shared 导入）

### Step 3.3: 迁移 commands/create.ts

- [ ] 将 `src/commands/create.ts` 复制到 `packages/create-app/src/commands/create.ts`
- [ ] 更新 import：core 模块 → `@zl-uniapp-cli/shared`

### Step 3.4: 迁移 prompts/create.ts

- [ ] 将 `src/prompts/create.ts` 复制到 `packages/create-app/src/prompts/create.ts`
- [ ] 更新 import：core/template → `@zl-uniapp-cli/shared`

### Step 3.5: 新增模板配置中心

- [ ] 创建 `packages/create-app/src/templates/templates.ts`

### Step 3.6: 新增 download.ts

- [ ] 创建 `packages/create-app/src/utils/download.ts`

### Step 3.7: 新增 install.ts

- [ ] 创建 `packages/create-app/src/utils/install.ts`

### Step 3.8: 重写 index.ts

- [ ] 将 `src/index.ts` 复制到 `packages/create-app/src/index.ts`
- [ ] 更新 program name 为 `'create-app'`

### Step 3.9: 创建 bin/index.js

- [ ] 创建 `packages/create-app/bin/index.js`

### Step 3.10: 验证 create-app 构建

- [ ] 运行 `pnpm --filter create-app build`，确认构建成功

---

## Phase 4: 模板迁移

### Step 4.1: 重命名模板目录

- [ ] 运行 `git mv templates/uni-vue3 templates/uniapp-base`

### Step 4.2: 验证模板路径

- [ ] 验证 TEMPLATES_DIR 路径解析正确

---

## Phase 5: 测试迁移

### Step 5.1: 迁移 shared 测试

- [ ] 迁移 copier/replacer/template 测试到 `packages/shared/tests/`
- [ ] 更新 import 路径和模板名

### Step 5.2: 迁移 create-app 测试

- [ ] 迁移 constants/prompts/commands/e2e 测试到 `packages/create-app/tests/`
- [ ] 更新 import 路径和 mock 路径

### Step 5.3: 配置 vitest

- [ ] 创建 `packages/shared/vitest.config.ts`
- [ ] 创建 `packages/create-app/vitest.config.ts`

### Step 5.4: 验证测试通过

- [ ] 运行 `pnpm test`，确认所有测试通过

---

## Phase 6: 清理与验证

### Step 6.1: 删除旧文件

- [ ] 删除根目录 `src/`、`tests/`、`bin/`、`dist/`、`vitest.config.ts`

### Step 6.2: 更新 .gitignore

- [ ] 添加 `packages/*/dist/`、`packages/*/.tsbuildinfo`

### Step 6.3: 更新 eslint/prettier 配置

- [ ] 适配 Monorepo（如需）

### Step 6.4: 端到端验证

- [ ] `pnpm build` 成功
- [ ] `pnpm test` 通过
- [ ] `node packages/create-app/dist/index.js --help` 可用

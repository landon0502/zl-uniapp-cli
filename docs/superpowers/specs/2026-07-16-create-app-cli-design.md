---
comet_change: create-app-cli
role: technical-design
canonical_spec: openspec
---

# create-app CLI 技术设计

## 1. 概述

本文档是 `create-app-cli` change 的深度技术设计，基于 OpenSpec 产物（proposal.md、design.md、specs/cli-scaffold/spec.md）进行实现层面的细化。

**核心目标**：实现一个 `create-app` CLI 命令，从 `templates/` 目录原样复制模板生成新项目，支持交互式问答和命令行参数两种配置方式。

## 2. 架构

### 2.1 项目结构

```
w-uni-cli/
├── package.json              # type: "module", bin, dependencies
├── tsconfig.json             # TypeScript 配置
├── bin/
│   └── index.js              # shebang + ESM 入口引用
├── src/
│   ├── index.ts              # CLI 入口：注册 Commander 程序和命令
│   ├── commands/
│   │   └── create.ts         # create 命令：参数定义 + 流程编排
│   ├── prompts/
│   │   └── create.ts         # Inquirer 交互：项目名/模板/包管理器
│   ├── core/
│   │   ├── copier.ts         # 模板复制：fs-extra.copy + filter
│   │   ├── replacer.ts       # 元信息替换：package.json name
│   │   └── template.ts       # 模板发现：扫描 templates/ 目录
│   └── constants.ts          # 忽略列表、默认值、路径常量
├── templates/
│   └── uni-vue3/             # 模板项目（现有）
└── dist/                     # 构建产物（tsup 输出）
```

### 2.2 模块职责

| 模块 | 职责 | 对外接口 |
|------|------|---------|
| `index.ts` | 注册 Commander 程序和命令 | — |
| `commands/create.ts` | 解析参数 → 补充交互 → 调用 core → 输出结果 | `registerCreateCommand(program)` |
| `prompts/create.ts` | 收集用户输入（项目名/模板/包管理器） | `promptCreateOptions(partial)` |
| `core/copier.ts` | 复制模板到临时目录，filter 排除忽略文件 | `copyTemplate(src, dest)` |
| `core/replacer.ts` | 替换 package.json 的 name 字段 | `replaceProjectName(dir, name)` |
| `core/template.ts` | 发现可用模板列表 | `discoverTemplates()` |
| `constants.ts` | 忽略列表、默认包管理器等 | 导出常量 |

### 2.3 数据类型

```typescript
interface CreateOptions {
  name: string                          // 项目名称 (kebab-case)
  template: string                      // 模板名称 (如 "uni-vue3")
  pm: 'pnpm' | 'npm' | 'yarn'          // 包管理器
}

interface TemplateInfo {
  name: string                          // 模板目录名
  path: string                          // 模板绝对路径
  description?: string                  // 模板描述（预留扩展）
}
```

## 3. 核心流程

```
Step 1: 参数解析
  Commander 解析: [project-name] --template <name> --pm <pm>
  输出: PartialOptions { name?, template?, pm? }

Step 2: 交互补充
  Inquirer 填充缺失参数
  - name: input + kebab-case 校验（不合法时重新输入）
  - template: select（单模板时跳过）
  - pm: select [pnpm, npm, yarn]
  输出: FullOptions { name, template, pm }

Step 3: 前置检查
  - 目标目录是否存在？→ confirm 覆盖/退出
  - 模板目录是否存在？→ 错误退出

Step 4: 模板复制
  copier.copyTemplate(templateDir, tempDir)
  - fs-extra.copy + filter 回调排除忽略文件
  - 复制到临时目录 .create-app-tmp-<random>

Step 5: 元信息替换
  replacer.replaceProjectName(tempDir, projectName)
  - 读取 package.json → 修改 name → 写回

Step 6: 原子性重命名
  fs.renameSync(tempDir, targetDir)
  - 临时目录 → 目标项目目录

Step 7: 输出结果
  ✅ 项目创建成功！
  cd <name> && <pm> install
```

## 4. 关键技术决策

### 4.1 ESM 模块系统

**决策**：纯 ESM 方案。

**配置**：
- `package.json` 添加 `"type": "module"`
- `tsup` 仅输出 ESM 格式：`tsup src/index.ts --format esm`
- `bin/index.js` 使用 `import` 引用 `../dist/index.js`
- `engines` 声明 `"node": ">=18"`

**理由**：Inquirer v14 是纯 ESM 包，CJS 无法 require 它。纯 ESM 是最干净的解决方案，避免 bundle 内联或降级。

### 4.2 参数 + 交互混合模式

**决策**：支持命令行参数直接指定，未指定的参数走交互式问答。

**Commander 选项定义**：
```typescript
program
  .command('create [name]')
  .option('-t, --template <name>', '模板名称')
  .option('-p, --pm <pm>', '包管理器 (pnpm|npm|yarn)')
  .action(async (name, options) => {
    // name 和 options 中的值可能为 undefined
    // 交给 prompts 层补充
  })
```

**交互逻辑**：`prompts/create.ts` 接收 `PartialOptions`，仅对缺失字段发起 Inquirer 问答。

### 4.3 模板路径解析

**决策**：模板路径相对于 CLI 包根目录。

```typescript
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = path.resolve(__dirname, '../../')
const TEMPLATES_DIR = path.join(PKG_ROOT, 'templates')
```

**模板发现**：`core/template.ts` 扫描 `TEMPLATES_DIR` 下的直接子目录，每个子目录即为一个模板。

### 4.4 忽略列表

**决策**：黑名单模式，使用 `fs-extra.copy` 的 `filter` 回调。

```typescript
// constants.ts
export const COPY_IGNORE_PATTERNS = [
  '.svn',
  'node_modules',
  '.DS_Store',
  'package-lock.json',
] as const

// core/copier.ts
function createCopyFilter(ignoreList: readonly string[]) {
  return (src: string) => {
    const basename = path.basename(src)
    return !ignoreList.includes(basename)
  }
}
```

**注意**：`filter` 回调对目录和文件都会调用。目录被排除时，其下所有子内容自动跳过。

### 4.5 临时目录与原子性

**决策**：先复制到临时目录，成功后 `renameSync` 重命名为目标目录。

```typescript
import { mkdtempSync, renameSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

const tempDir = mkdtempSync(path.join(tmpdir(), '.create-app-'))
// ... 复制和替换操作 ...
renameSync(tempDir, targetDir)
```

**中断清理**：SIGINT 信号监听器在 Step 4-6 期间生效，触发时 `rmSync(tempDir, { recursive: true, force: true })`。

### 4.6 项目名校验

```typescript
const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/
// 合法: my-app, uni-vue3, hello-world123
// 非法: My-App, my_app, my app, -start, 123app
```

## 5. package.json 变更

```jsonc
{
  "name": "w-uni-cli",
  "version": "1.0.0",
  "type": "module",                    // 新增：ESM 声明
  "bin": {
    "create-app": "./bin/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm",  // 修改：仅 ESM
    "dev": "tsx src/index.ts"
  },
  "engines": {                         // 新增
    "node": ">=18"
  },
  "dependencies": {
    "commander": "^14.0.3",
    "fs-extra": "^11.3.6",
    "inquirer": "^14.0.2"
  },
  "devDependencies": {                 // 新增
    "typescript": "^5.8.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "@types/node": "^22.0.0",
    "vitest": "^3.0.0"
  }
}
```

## 6. 测试策略

| 测试类型 | 范围 | 工具 |
|---------|------|------|
| 单元测试 | copier filter、replacer、template 发现、name 校验 | vitest |
| 集成测试 | 完整 create 流程（临时目录 → 复制 → 替换 → 重命名） | vitest + os.tmpdir() |
| 手动验证 | CLI 交互体验、中断清理、目录已存在处理 | 手动运行 |

**关键测试用例**：

1. **正常创建**：运行 create → 目录结构完整 + name 替换正确
2. **忽略文件排除**：`.svn/`、`node_modules/`、`.DS_Store`、`package-lock.json` 不存在
3. **项目名不合法**：输入 "My App" → 提示重新输入
4. **目标目录已存在**：提示覆盖/取消
5. **Ctrl+C 中断**：临时目录被清理，无残留
6. **单模板跳过**：仅一个模板时不显示选择
7. **命令行参数模式**：`create-app my-app --template uni-vue3 --pm pnpm` 跳过交互

## 7. 风险与缓解

| 风险 | 缓解 |
|------|------|
| ESM only → 旧版 Node.js 不兼容 | `engines` 声明 `node >= 18`，运行时检查 |
| 黑名单忽略 → 新增无关文件可能被复制 | 后续可切换为白名单或 `.templateignore` 文件 |
| 大型模板复制耗时 | 排除 `node_modules` 后文件数从 600+ 降至 ~50 |
| `renameSync` 跨设备失败（tmpdir 和目标在不同分区） | 回退策略：先 copy 再 remove，而非 rename |
| Inquirer v14 API 变更 | 锁定 `^14.0.2` 版本范围 |

## 8. Spec Patch

在 `specs/cli-scaffold/spec.md` 的 `交互式项目创建` 需求中补充验收场景：

```markdown
#### Scenario: 通过命令行参数直接指定所有配置
- **WHEN** 用户运行 `create-app my-app --template uni-vue3 --pm pnpm`
- **THEN** CLI 跳过交互式问答，直接使用命令行参数创建项目

#### Scenario: 部分参数通过命令行指定
- **WHEN** 用户运行 `create-app my-app --pm pnpm`（未指定 template）
- **THEN** CLI 仅提示选择模板，其他参数使用命令行值
```

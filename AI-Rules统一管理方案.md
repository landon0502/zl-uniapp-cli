# AI Rules 统一管理方案

> 在脚手架模板中统一存放 AI 编码工具的 rule 文件，通过 postinstall 脚本自动分发到各工具的 rules 目录，解决跨平台和团队协作问题。

---

## 1. 背景与目标

### 1.1 现状

- 团队使用不同的 AI 编码工具：Claude Code、Cursor、Windsurf 等
- 各工具读取 rules 的目录不同（`.claude/rules/`、`.cursor/rules/`、`.windsurf/rules/`）
- 目前模板项目中没有任何 AI 编码规范配置，新项目缺少 AI 辅助约定

### 1.2 核心问题

脚手架只在 `create` 时执行一次，但团队协作的日常操作是 `git clone` + `pnpm install`。如果 rules 的分发依赖手动操作或软链接：

- **Mac 用户创建的项目 → Windows 同事 clone → 软链接失效**
- **新成员 clone 项目 → 没有 _rules/ 到平台目录的链接**
- **换电脑/重装系统 → 链接丢失，需手动重建**

因此需要一个**每次 `pnpm install` 自动触发**的机制来保证 rules 始终正确分发。

### 1.3 目标

- Rule 内容**只维护一份**（单一事实源），避免多份副本不同步
- 项目创建时**自动配置**，用户无需手动操作
- `git clone` + `pnpm install` 后**自动生效**，无需额外步骤
- 支持**多平台多选**，一个项目可同时配置多个 AI 工具
- **跨平台兼容**，macOS / Linux / Windows 均可正常工作

---

## 2. 方案概述

### 2.1 核心机制：`_rules/` + `postinstall` 脚本

```
单一事实源：_rules/*.md          ← 团队维护，提交到 Git
        ↓
postinstall 脚本（自动触发）     ← pnpm install 时自动执行
        ↓
分发到各 AI 工具目录             ← 软链接（优先）或复制（降级）
```

**关键设计：**

| 触发时机 | 执行者 | 说明 |
|---------|--------|------|
| `create-zluni-app create` | 脚手架 | 首次创建项目时，生成 `_rules/` + 配置 `postinstall` |
| `pnpm install` / `npm install` | postinstall 钩子 | 每次 install 自动重建 rules 链接/复制 |
| 手动 `pnpm setup-ai-rules` | 开发者 | 需要手动重建时（如切换 AI 工具） |

### 2.2 为什么用 postinstall

| 方案 | git clone 后是否自动生效 | 额外操作 | 跨平台 |
|------|------------------------|---------|--------|
| ~~仅脚手架创建时链接~~ | ❌ | 需手动重建 | ⚠️ |
| ~~.gitattributes + Git 钩子~~ | ❌ | 配置复杂 | ❌ |
| **postinstall 脚本** | ✅ | 无（install 即触发） | ✅ |
| ~~husky pre-commit~~ | ❌ | 只在 commit 时触发 | ✅ |

postinstall 是 npm 生命周期钩子，`pnpm install` / `npm install` / `yarn install` 都会自动执行，完美覆盖"新成员 clone 后安装依赖"的场景。

---

## 3. 目录结构设计

### 3.1 模板中的结构

```
templates/uni-vue3/
├── _rules/                              # Rule 源文件（唯一维护点）
│   ├── project-conventions.md           # 项目架构约定
│   ├── api-patterns.md                  # API / 请求模式
│   ├── component-patterns.md            # 组件编写模式
│   └── coding-style.md                  # 编码风格
├── scripts/
│   └── setup-ai-rules.js                # postinstall 执行脚本
├── CLAUDE.md                            # Claude Code 入口文件
├── .ai-tools.json                       # AI 工具配置（记录用户选择了哪些工具）
├── .gitignore
└── ...
```

### 3.2 创建后的项目结构（以选择 Claude Code + Cursor 为例）

**macOS / Linux（软链接方式）：**

```
my-app/
├── _rules/                              # Rule 源文件（提交到 Git）
│   ├── project-conventions.md
│   ├── api-patterns.md
│   ├── component-patterns.md
│   └── coding-style.md
├── scripts/
│   └── setup-ai-rules.js                # 分发脚本（提交到 Git）
├── .ai-tools.json                       # AI 工具配置（提交到 Git）
├── CLAUDE.md                            # 入口文件（提交到 Git）
├── .claude/
│   └── rules/                           # 软链接目录（.gitignore 忽略）
│       ├── project-conventions.md → ../../../_rules/project-conventions.md
│       └── ...
├── .cursor/
│   └── rules/                           # 软链接目录（.gitignore 忽略）
│       ├── project-conventions.md → ../../../_rules/project-conventions.md
│       └── ...
└── ...
```

**Windows（复制降级方式）：**

```
my-app/
├── _rules/                              # Rule 源文件（提交到 Git）
│   └── ...
├── scripts/
│   └── setup-ai-rules.js
├── .ai-tools.json
├── CLAUDE.md
├── .claude/
│   └── rules/                           # 复制的文件（.gitignore 忽略）
│       ├── project-conventions.md       # 内容副本
│       └── ...
└── ...
```

---

## 4. `.ai-tools.json` 配置文件

用于记录项目选择了哪些 AI 工具，`postinstall` 脚本据此决定分发到哪些目录。

```jsonc
{
  // 选择了哪些 AI 工具
  "tools": ["claude", "cursor"],

  // _rules 源目录（相对于项目根目录）
  "rulesDir": "_rules",

  // 各工具的 rules 目标目录映射
  "platforms": {
    "claude": { "dir": ".claude/rules", "entryFile": "CLAUDE.md" },
    "cursor": { "dir": ".cursor/rules" },
    "windsurf": { "dir": ".windsurf/rules" }
  }
}
```

**为什么用配置文件而不是硬编码：**

- 团队成员只需修改 `.ai-tools.json` 的 `tools` 字段，然后运行 `pnpm setup-ai-rules` 即可切换 AI 工具
- 新增 AI 工具时只需在 `platforms` 中加一条映射
- 配置文件提交到 Git，全团队共享同一份 AI 工具选择

---

## 5. `scripts/setup-ai-rules.js` 脚本设计

### 5.1 核心逻辑

```
读取 .ai-tools.json
    ↓
获取 tools 列表和 platforms 映射
    ↓
遍历 _rules/ 目录下的所有 .md 文件
    ↓
对每个选中的 AI 工具：
    ├── 检查目标目录是否存在，不存在则创建
    ├── 尝试创建软链接（macOS/Linux）
    │   └── 失败 → 降级为文件复制
    └── Windows → 尝试创建符号链接
        └── 失败 → 降级为文件复制
```

### 5.2 脚本伪代码

```javascript
#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const ROOT = path.resolve(import.meta.dirname, '..')
const CONFIG_PATH = path.join(ROOT, '.ai-tools.json')

function main() {
  // 1. 读取配置
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log('ℹ 未找到 .ai-tools.json，跳过 AI rules 配置')
    return
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  const { tools, rulesDir, platforms } = config

  // 2. 读取 _rules/ 下所有 .md 文件
  const rulesPath = path.join(ROOT, rulesDir)
  if (!fs.existsSync(rulesPath)) {
    console.log(`ℹ 未找到 ${rulesDir}/ 目录，跳过`)
    return
  }
  const ruleFiles = fs.readdirSync(rulesPath).filter(f => f.endsWith('.md'))

  // 3. 对每个选中的工具分发 rules
  for (const tool of tools) {
    const platform = platforms[tool]
    if (!platform) {
      console.warn(`⚠ 未知 AI 工具: ${tool}`)
      continue
    }

    const targetDir = path.join(ROOT, platform.dir)
    fs.mkdirSync(targetDir, { recursive: true })

    for (const file of ruleFiles) {
      const src = path.join(rulesPath, file)
      const dest = path.join(targetDir, file)

      // 清理旧的链接/文件
      if (fs.existsSync(dest) || fs.lstatSync(dest, { throwIfNoEntry: false })) {
        fs.rmSync(dest, { force: true })
      }

      // 尝试软链接，失败则复制
      try {
        const relativePath = path.relative(targetDir, src)
        fs.symlinkSync(relativePath, dest, 'file')
        console.log(`  🔗 ${platform.dir}/${file} → ${rulesDir}/${file}`)
      } catch {
        fs.cpSync(src, dest)
        console.log(`  📄 ${platform.dir}/${file} (复制)`)
      }
    }
  }

  console.log('✔ AI rules 配置完成')
}

main()
```

### 5.3 Windows 兼容

| 场景 | 方案 | 说明 |
|------|------|------|
| Windows + 开发者模式 | `fs.symlinkSync(relativePath, dest, 'file')` | 正常创建符号链接 |
| Windows + 管理员权限 | 同上 | 正常创建符号链接 |
| Windows + 普通权限 | `fs.cpSync(src, dest)` | 降级为文件复制 |

**关键改进**：使用**相对路径**创建软链接（而非绝对路径），这样即使项目目录移动，链接仍然有效。

---

## 6. 各 AI 工具 Rules 目录映射

| AI 工具 | Rules 目录 | 入口文件 | `.ai-tools.json` 中的 key |
|---------|-----------|---------|--------------------------|
| Claude Code | `.claude/rules/` | `CLAUDE.md`（项目根目录） | `claude` |
| Cursor | `.cursor/rules/` | 无独立入口文件 | `cursor` |
| Windsurf | `.windsurf/rules/` | 无独立入口文件 | `windsurf` |

> **注意**：各工具的 rules 目录结构和加载机制可能随版本更新变化，需定期确认。新增工具只需在 `.ai-tools.json` 的 `platforms` 中添加映射即可。

---

## 7. 交互设计

### 7.1 新增 AI 平台选择步骤

在现有交互流程（项目名 → 模板 → 包管理器）之后，新增一步：

```
? 选择 AI 编码工具: (多选，空格选中，回车确认)
 ◯ Claude Code
 ◯ Cursor
 ◯ Windsurf
❯◉ 跳过（不配置）
```

- **多选**：用户可同时选择多个工具
- **默认**：不选中任何工具（避免对不需要的用户造成干扰）
- **跳过选项**：明确表示不配置，跳过 rules 分发步骤

### 7.2 完整交互流程

```
? 项目名称: my-app
? 选择模板: UniApp 基础版
? 选择包管理器: pnpm
? 选择 AI 编码工具: Claude Code, Cursor    ← 新增

⠋ 正在拉取模板 uni-vue3...
✔ 模板拉取完成
✔ 配置 AI 编码工具 rules (Claude Code, Cursor)    ← 新增

✅ 项目创建成功！

  cd my-app
  pnpm install
```

### 7.3 命令行选项扩展

```bash
create-zluni-app create [name] [options]

# 新增选项
--ai-tools <tools>    -a    指定 AI 编码工具（逗号分隔），跳过交互选择
                         可选值: claude,cursor,windsurf,none
```

示例：

```bash
# 指定 Claude Code
npx create-zluni-app create my-app -a claude

# 指定多个工具
npx create-zluni-app create my-app -a claude,cursor

# 不配置 AI 工具
npx create-zluni-app create my-app -a none
```

---

## 8. Git 策略

### 8.1 `.gitignore` 配置

```gitignore
# AI 工具 rules 分发目录（由 postinstall 自动生成，内容来自 _rules/）
.claude/rules/
.cursor/rules/
.windsurf/rules/
```

### 8.2 提交策略

| 目录/文件 | 是否提交 | 原因 |
|-----------|---------|------|
| `_rules/*.md` | ✅ 提交 | 单一事实源，团队共享 |
| `scripts/setup-ai-rules.js` | ✅ 提交 | postinstall 执行脚本 |
| `.ai-tools.json` | ✅ 提交 | AI 工具配置，团队共享 |
| `CLAUDE.md` | ✅ 提交 | Claude Code 入口文件 |
| `.claude/rules/` | ❌ 忽略 | 软链接/复制产物，可自动重建 |
| `.cursor/rules/` | ❌ 忽略 | 同上 |
| `.windsurf/rules/` | ❌ 忽略 | 同上 |

### 8.3 团队协作流程

```
新成员入职 / 换电脑
    ↓
git clone <项目>
    ↓
pnpm install
    ↓ postinstall 自动执行
setup-ai-rules.js 读取 .ai-tools.json
    ↓
自动创建 .claude/rules/ → 软链接/复制到 _rules/
    ↓
AI 编码工具立即可用 ✅
```

**切换 AI 工具：**

```
编辑 .ai-tools.json → tools 字段增加/删除工具
    ↓
pnpm setup-ai-rules    ← 手动触发，或下次 pnpm install 自动触发
    ↓
新的 rules 目录自动创建 ✅
```

---

## 9. `package.json` 配置

创建项目后，脚手架在 `package.json` 中注入以下内容：

```jsonc
{
  "scripts": {
    // 已有脚本 ...
    "postinstall": "node scripts/setup-ai-rules.js",
    "setup-ai-rules": "node scripts/setup-ai-rules.js"
  }
}
```

- `postinstall`：`pnpm install` 后自动执行，保证 rules 始终同步
- `setup-ai-rules`：手动触发入口，用于切换 AI 工具后重建 rules

> **注意**：如果项目已有 `postinstall` 脚本（如 husky），需追加而非覆盖：
> `"postinstall": "husky && node scripts/setup-ai-rules.js"`

---

## 10. Rule 文件内容规划

### 10.1 `project-conventions.md` — 项目架构约定

规划内容：

- 目录结构约定（api / composables / components / store / utils 的职责边界）
- 页面配置约定（pages.mjs 声明式配置，不要手动改 pages.json）
- 文件命名约定（composable 以 `use` 开头、组件 PascalCase 等）
- 导入路径约定（`@/` 别名指向 `src/`）

### 10.2 `api-patterns.md` — API / 请求模式

规划内容：

- 请求封装用法（`uni.$uv.http` + 拦截器）
- API 文件组织方式（`src/api/` 下按模块分文件）
- 环境切换机制（`VITE_REQUEST_ENV` + `DevEnv` 组件）
- 请求/响应拦截器约定
- 错误处理模式

### 10.3 `component-patterns.md` — 组件编写模式

规划内容：

- PageContainer 用法（统一页面结构）
- composable 使用模式（从 `@/composables` 统一导入）
- uv-ui 组件使用约定
- 组件文件结构（index.vue + props.js + context.js）
- easycom 自动注册机制

### 10.4 `coding-style.md` — 编码风格

规划内容：

- Vue 3 Composition API 风格（setup + script）
- UnoCSS 原子类使用约定
- SCSS 变量使用（主题变量、uv-ui 变量）
- 条件编译写法（`#ifdef` / `#ifndef`）

### 10.5 `CLAUDE.md` — Claude Code 入口文件

精简版，只包含项目级行为指南（10-20 行），引导 Claude Code 读取 rules：

```markdown
# CLAUDE.md

## 项目约定

本项目为 uni-app Vue3 项目，详细编码规范请参考 `.claude/rules/` 下的 rule 文件。

关键约定：
- 不要手动修改 `src/pages.json`，它由 `src/config/pages.mjs` 自动生成
- API 接口统一放在 `src/api/` 下，使用 `uni.$uv.http` 封装
- 组合式函数统一从 `@/composables` 导入
- 使用 uv-ui 组件库（uni_modules 集成），不要引入其他 UI 库
- 使用 UnoCSS 原子类（presetUni 预设），不要写冗余的自定义 CSS
```

---

## 11. 改动清单

### 11.1 模板改动

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `templates/uni-vue3/_rules/project-conventions.md` | 项目架构约定 rule |
| 新增 | `templates/uni-vue3/_rules/api-patterns.md` | API / 请求模式 rule |
| 新增 | `templates/uni-vue3/_rules/component-patterns.md` | 组件编写模式 rule |
| 新增 | `templates/uni-vue3/_rules/coding-style.md` | 编码风格 rule |
| 新增 | `templates/uni-vue3/scripts/setup-ai-rules.js` | postinstall 分发脚本 |
| 新增 | `templates/uni-vue3/CLAUDE.md` | Claude Code 入口文件 |
| 新增 | `templates/uni-vue3/.ai-tools.json` | AI 工具配置 |
| 修改 | `templates/uni-vue3/.gitignore` | 忽略各平台 rules 目录 |
| 修改 | `templates/uni-vue3/package.json` | 注入 postinstall 和 setup-ai-rules 脚本 |

### 11.2 CLI 改动

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `packages/create-zluni-app/src/constants.ts` | 新增 `AICodeTool` 类型和 `AI_TOOLS` 常量 |
| 修改 | `packages/create-zluni-app/src/prompts/create.ts` | 新增 AI 工具多选交互 |
| 修改 | `packages/create-zluni-app/src/commands/create.ts` | 创建项目后生成 `.ai-tools.json`，执行 rules 分发 |
| 修改 | `packages/create-zluni-app/src/templates/templates.ts` | 无需改动（_rules/ 和 scripts/ 随模板一起拉取） |

### 11.3 共享包改动

无。rules 分发逻辑完全在模板的 `scripts/setup-ai-rules.js` 中，不依赖 shared 包。

---

## 12. 待确认事项

### 12.1 `_rules/` 目录命名

- 当前方案：`_rules/`（下划线前缀表示"内部/基础设施"）
- 备选方案：`ai-rules/`、`.ai-rules/`（隐藏目录）、`docs/ai-rules/`
- 需确认：是否希望 `_rules/` 在 IDE 文件树中显眼可见

### 12.2 是否需要 CLAUDE.md

- Claude Code 会自动读取项目根目录的 `CLAUDE.md`
- 其他工具（Cursor、Windsurf）没有类似的入口文件机制
- 需确认：是否只为 Claude Code 生成 `CLAUDE.md`，还是也生成其他工具的入口文件

### 12.3 Rule 文件粒度

- 当前方案：4 个 rule 文件（project-conventions / api-patterns / component-patterns / coding-style）
- 备选方案：1 个合并文件、或更细粒度拆分（如按功能模块拆分）
- 需确认：粒度是否合适，是否需要增减

### 12.4 是否支持后续添加/切换 AI 工具

- 项目创建后，如果用户想新增或更换 AI 工具
- 当前方案：编辑 `.ai-tools.json` + 运行 `pnpm setup-ai-rules`
- 备选方案：提供 `create-zluni-app config-ai` 命令
- 需确认：是否需要独立的 CLI 命令，还是手动编辑配置文件即可

### 12.5 degit 拉取时 `_rules/` 和 `scripts/` 是否会被过滤

- 当前 `COPY_IGNORE_PATTERNS` 为 `['.svn', 'node_modules', '.DS_Store', 'package-lock.json']`
- `_rules/` 和 `scripts/` 不在忽略列表中，会被正常拉取
- 但 degit 从 GitHub 拉取时可能受 `.gitignore` 影响
- 需确认：确保模板仓库的 `.gitignore` 不会忽略 `_rules/` 和 `scripts/`

### 12.6 是否需要为不同工具定制不同的 rule 内容

- 当前方案：所有工具共享同一份 rule 内容
- 备选方案：`_rules/` 下按工具分子目录，如 `_rules/claude/`、`_rules/cursor/`
- 需确认：各工具的 rule 语法/能力是否有差异，是否需要定制

### 12.7 postinstall 与已有 postinstall 的兼容

- 如果项目已有 `postinstall`（如 husky），脚手架需要追加而非覆盖
- 需确认：模板中是否已有 `postinstall`，如果有需处理合并逻辑

### 12.8 是否需要 CI 环境下跳过

- CI 环境（GitHub Actions 等）不需要配置 AI rules
- 可通过环境变量判断：`if [ -n "$CI" ]; then exit 0; fi`
- 需确认：是否需要在 CI 环境下跳过 postinstall

---

## 13. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Windows 软链接权限不足 | rules 无法以链接方式分发 | 自动降级为文件复制 |
| Git 跨平台软链接损坏 | Windows 用户 checkout 后链接失效 | .gitignore 忽略链接目录，postinstall 自动重建 |
| degit 不保留符号链接 | 模板中的预建链接丢失 | 不在模板中预建链接，由 postinstall 动态创建 |
| Rule 内容过时 | AI 生成代码不符合最新约定 | 定期 review `_rules/`，随架构演进更新 |
| AI 工具 rules 机制变更 | 目录结构或加载方式变化 | 修改 `.ai-tools.json` 的 `platforms` 映射即可 |
| postinstall 被禁用 | 用户使用 `--ignore-scripts` 安装 | 提供 `pnpm setup-ai-rules` 手动触发入口 |
| CI 环境执行 postinstall | 无意义地创建链接 | 脚本中检测 `$CI` 环境变量，跳过执行 |

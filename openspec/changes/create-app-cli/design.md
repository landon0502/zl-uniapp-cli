## Context

当前项目 `w-uni-cli` 是一个空壳 CLI 仓库，`package.json` 已声明 `bin: "create-app"` 和依赖 `commander`、`fs-extra`、`inquirer`，但 `src/` 目录不存在，`bin/index.ts` 仅有 shebang。`templates/uni-vue3/` 目录包含一个完整的 uni-app Vue3 项目模板，但其中混有 `.svn/`、`node_modules/`、`.DS_Store` 等不应复制到新项目的文件。

团队需要从模板快速生成新项目，当前流程是手动复制 + 清理，效率低且易出错。

## Goals / Non-Goals

**Goals:**
- 实现 `create-app` CLI 命令，交互式引导用户创建项目
- 从 `templates/` 目录原样复制模板到目标目录，自动排除无关文件
- 替换 `package.json` 的 `name` 字段为用户输入的项目名
- 架构预留多模板扩展能力
- 目标目录已存在时安全处理（提示覆盖/取消）
- 用户中断时清理已生成文件

**Non-Goals:**
- 不做功能模块可配置裁剪（不做选装 Pinia/Mock 等）
- 不做模板引擎渲染（不用 EJS/Handlebars）
- 不做 npm 发布（仅本地使用）
- 不做后置操作（不自动 git init / pnpm install）
- 不做远端模板拉取

## Decisions

### D1: 技术栈 — TypeScript + tsup 构建

**选择**：TypeScript 编写源码，tsup 打包为 ESM + CJS 双格式。

**理由**：
- `package.json` 已配置 `tsup src/index.ts --format esm,cjs`，保持一致
- TypeScript 提供类型安全，CLI 工具适合强类型
- tsup 零配置打包，适合 CLI 场景

**备选**：纯 JavaScript（无需构建步骤，但缺乏类型安全）

### D2: CLI 框架 — Commander.js

**选择**：使用已有的 `commander` 依赖。

**理由**：
- `package.json` 已声明 `commander` 依赖
- Commander 是 Node.js CLI 最成熟的框架，文档完善
- 支持子命令、选项、交互式提示

### D3: 交互式问答 — Inquirer.js

**选择**：使用已有的 `inquirer` 依赖。

**理由**：
- `package.json` 已声明 `inquirer` 依赖
- Inquirer v14 支持 ESM，提供 input/select/confirm 等交互类型
- 适合 3-4 个问题的最小交互场景

### D4: 模板复制策略 — fs-extra 递归拷贝 + 忽略列表

**选择**：使用 `fs-extra.copy()` 配合 `filter` 选项实现忽略列表。

**理由**：
- `fs-extra` 已在依赖中，其 `copy` 方法支持 `filter` 回调
- 无需引入额外依赖（如 `glob`、`cpy` 等）
- filter 回调可精确控制哪些文件/目录被排除

**忽略列表**：
```
.svn/
node_modules/
.DS_Store
package-lock.json
.svn
```

**备选**：使用 `glob` 匹配 + 逐文件拷贝（更灵活但更复杂，当前场景不需要）

### D5: 项目结构 — 模块化分层

**选择**：按职责拆分模块，而非单文件实现。

```
src/
├── index.ts          # CLI 入口，注册命令
├── commands/
│   └── create.ts     # create-app 命令定义与流程编排
├── prompts/
│   └── create.ts     # 交互式问答逻辑
├── core/
│   ├── copier.ts     # 模板复制（含忽略列表）
│   └── replacer.ts   # 元信息替换（package.json name）
└── utils/
    └── fs.ts         # 文件系统工具函数
```

**理由**：
- 职责清晰，便于测试和维护
- 预留多模板扩展：`copier.ts` 接收模板路径参数，无需修改核心逻辑
- 交互与逻辑分离：`prompts/` 只负责收集输入，`commands/` 负责编排流程

### D6: 中断清理 — 临时目录 + 原子性替换

**选择**：先复制到临时目录，完成后重命名为目标目录。

**理由**：
- 避免部分复制后中断导致目标目录处于不一致状态
- 重命名是原子操作，保证要么完整要么不存在
- Ctrl+C 时只需删除临时目录

**备选**：直接复制到目标目录 + 中断时清理（简单但可能残留部分文件）

### D7: package.json name 替换 — JSON 读写

**选择**：读取 `package.json`，修改 `name` 字段，写回文件。

**理由**：
- 仅替换 `name` 一个字段，JSON 读写最简单直接
- 保持 JSON 格式化（2 空格缩进）
- 不需要正则替换或模板引擎

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|---------|
| 模板目录包含意外文件（如新增的构建产物）被复制到新项目 | 忽略列表采用黑名单模式，默认复制所有文件，仅排除已知无关项。后续可切换为白名单模式 |
| Inquirer v14 ESM 兼容性问题 | tsup 打包为 CJS 格式时，`bin/index.js` 引用 CJS 入口，避免 ESM 兼容问题 |
| 大型模板（含 uni_modules 600+ 子目录）复制耗时 | 复制前显示进度提示；filter 回调中排除 `node_modules` 可大幅减少文件数 |
| 项目名不合法（含空格、特殊字符等） | 输入时校验项目名格式（kebab-case），不合法时提示重新输入 |

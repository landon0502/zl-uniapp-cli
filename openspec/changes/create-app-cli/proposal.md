## Why

团队使用 uni-app Vue3 开发多个小程序项目，每次新建项目都需要手动复制现有项目模板、清理业务代码、修改项目名称，流程繁琐且容易遗漏。需要一个 CLI 脚手架工具 `create-app`，一键从 `templates/` 目录生成标准化项目，统一团队项目结构，降低项目初始化成本。

## What Changes

- 新增 `create-app` CLI 命令，支持交互式创建 uni-app 项目
- 从 `templates/` 目录下的模板原样复制生成新项目
- 交互式问答：项目名称、模板选择、包管理器选择（3-4 个问题）
- 复制时自动排除 `.svn/`、`node_modules/`、`.DS_Store`、`package-lock.json` 等无关文件
- 自动替换 `package.json` 中的 `name` 字段为用户输入的项目名
- 目标目录已存在时提示用户确认覆盖或取消
- 用户中断（Ctrl+C）时清理已生成的部分文件
- 架构预留多模板扩展能力（`templates/` 目录可放置多个模板）

## Capabilities

### New Capabilities

- `cli-scaffold`: CLI 脚手架核心能力——交互式问答、模板复制、文件忽略、元信息替换、中断清理

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **新增代码**：`src/` 目录下的 CLI 实现代码（入口、命令定义、交互逻辑、模板复制逻辑）
- **修改文件**：`bin/index.ts`（从空 shebang 改为引用编译后的入口）、`package.json`（补充 devDependencies）
- **依赖变更**：已有 `commander`、`fs-extra`、`inquirer`；可能需要新增 `glob`（文件匹配）等
- **模板目录**：`templates/` 目录结构不变，但 CLI 需要约定模板目录的命名和结构规范

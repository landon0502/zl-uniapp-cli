## Why

当前项目 `zl-uniapp-cli` 是单包结构，CLI 代码与模板紧耦合在同一仓库中。随着模板数量增长（计划支持 UniApp、React、Next.js、AI Agent 等多框架模板），单包架构面临以下问题：

1. **模板更新需重新发布 CLI** — 模板内嵌在 CLI 包中，任何模板变更都必须重新发布 CLI
2. **无法独立管理模板版本** — 所有模板与 CLI 共享同一版本号
3. **项目命名与品牌不符** — 当前 `zl-uniapp-cli` / `create-zl-app` 需统一为 `create-app`
4. **缺乏共享工具包** — 模板复制、项目名替换等工具逻辑无法被其他包复用

需要重构为 Monorepo 架构，实现 CLI 与模板解耦，为后续远程模板中心和多框架模板扩展奠定基础。

## What Changes

- **BREAKING**: CLI 命令从 `create-app` / `create-zl-app` 重命名为 `create-app`
- **BREAKING**: 项目从单包 `zl-uniapp-cli` 重构为 pnpm Monorepo（`wh-templates`）
- 新增 `packages/create-app` — 脚手架 CLI 包
- 新增 `packages/shared` — 公共工具包（模板复制、项目名替换、模板发现等）
- 模板目录从 `templates/` 顶层保留，`uni-vue3` 迁移为 `uniapp-base`
- 新增模板配置中心（`templates.ts`），支持模板元数据管理
- 新增依赖安装功能（使用 `execa` 调用 pnpm/npm/yarn install）
- 新增日志工具（`logger.ts`）
- 配置 `pnpm-workspace.yaml`，packages 目录纳入 workspace

## Capabilities

### New Capabilities
- `monorepo-workspace`: pnpm Monorepo workspace 配置与包管理
- `template-config-center`: 模板配置中心，管理模板元数据与注册表
- `dep-install`: 项目创建后自动安装依赖

### Modified Capabilities
- `cli-scaffold`: CLI 命令重命名为 `create-app`，交互流程增加依赖安装步骤，模板发现逻辑从文件系统扫描改为配置中心驱动

## Impact

- **代码结构**: 整个项目目录重组，src/ → packages/create-app/src/ + packages/shared/src/
- **构建流程**: 从单 tsup 构建改为 pnpm 递归构建
- **依赖**: 新增 `execa`（依赖安装），`commander`/`inquirer`/`fs-extra` 迁移至 create-app 包
- **测试**: 测试文件迁移至对应包内，路径引用需更新
- **发布**: CLI 包名从 `zl-uniapp-cli` 变为 `create-app`，npm bin 从 `create-zl-app` 变为 `create-app`
- **模板路径**: 开发时模板通过相对路径 `../../templates/` 访问，发布时模板打包进 CLI

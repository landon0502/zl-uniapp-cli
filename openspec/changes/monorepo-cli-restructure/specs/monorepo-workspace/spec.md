## ADDED Requirements

### Requirement: pnpm workspace 配置

项目根目录 SHALL 包含 `pnpm-workspace.yaml` 文件，声明 `packages/*` 为 workspace 成员。

#### Scenario: pnpm 识别 workspace 结构
- **WHEN** 在项目根目录运行 `pnpm install`
- **THEN** pnpm 识别 `packages/create-app` 和 `packages/shared` 为 workspace 成员
- **THEN** workspace 包之间可通过包名互相引用

### Requirement: 根 package.json 配置

项目根目录 SHALL 包含 `package.json`，配置如下：
- `name`: `wh-templates`
- `private`: `true`
- `packageManager`: `pnpm@10`
- `scripts.build`: `pnpm -r build`
- `scripts.dev`: `pnpm --filter create-app dev`

#### Scenario: 根目录构建所有包
- **WHEN** 在项目根目录运行 `pnpm build`
- **THEN** pnpm 递归构建所有 workspace 成员包

#### Scenario: 根目录启动开发模式
- **WHEN** 在项目根目录运行 `pnpm dev`
- **THEN** 仅启动 `create-app` 包的开发模式

### Requirement: create-app 包结构

`packages/create-app` SHALL 是一个独立的 npm 包，包含：
- `package.json`：name 为 `create-app`，bin 为 `create-app`
- `src/`：CLI 源码（commands、prompts、utils）
- `tsconfig.json`：TypeScript 配置
- 依赖 `shared` workspace 包

#### Scenario: create-app 包可独立构建
- **WHEN** 在 `packages/create-app` 目录运行 `pnpm build`
- **THEN** tsup 成功构建，输出到 `dist/` 目录

### Requirement: shared 包结构

`packages/shared` SHALL 是一个独立的 npm 包，包含：
- `package.json`：name 为 `@wh-templates/shared`
- `src/`：共享工具源码（copier、replacer、template、logger）
- `tsconfig.json`：TypeScript 配置
- 导出所有工具函数

#### Scenario: shared 包可被 create-app 引用
- **WHEN** `create-app` 包中 `import { copyTemplate } from '@wh-templates/shared'`
- **THEN** 编译和运行时均能正确解析到 `shared` 包的导出

### Requirement: 模板目录不纳入 workspace

`templates/` 目录 SHALL NOT 纳入 pnpm workspace 管理。模板目录作为独立数据目录存在，不被当作 npm 包处理。

#### Scenario: pnpm install 不处理模板目录
- **WHEN** 在项目根目录运行 `pnpm install`
- **THEN** pnpm 不尝试安装 `templates/uniapp-base` 中的依赖

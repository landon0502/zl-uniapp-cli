# cli-scaffold Specification

## Purpose
TBD - created by archiving change create-app-cli. Update Purpose after archive.
## Requirements
### Requirement: 交互式项目创建

CLI SHALL 在用户运行 `create-app` 命令时，通过交互式问答收集以下信息：
1. 项目名称（必填，kebab-case 格式）
2. 模板选择（从 `templates/` 目录中可用的模板列表选择）
3. 包管理器选择（pnpm / npm / yarn）

#### Scenario: 用户正常完成交互式创建
- **WHEN** 用户运行 `create-app` 命令
- **THEN** CLI 依次提示输入项目名称、选择模板、选择包管理器
- **THEN** 收集完毕后开始生成项目

#### Scenario: 项目名称不合法
- **WHEN** 用户输入的项目名称不符合 kebab-case 格式（含空格、大写字母、特殊字符）
- **THEN** CLI 提示项目名称格式错误，要求重新输入

#### Scenario: 模板目录为空
- **WHEN** `templates/` 目录下没有任何模板
- **THEN** CLI 显示错误信息"没有可用的模板"并退出

#### Scenario: 通过命令行参数直接指定所有配置
- **WHEN** 用户运行 `create-app my-app --template uni-vue3 --pm pnpm`
- **THEN** CLI 跳过交互式问答，直接使用命令行参数创建项目

#### Scenario: 部分参数通过命令行指定
- **WHEN** 用户运行 `create-app my-app --pm pnpm`（未指定 template）
- **THEN** CLI 仅提示选择模板，其他参数使用命令行值

### Requirement: 模板原样复制

CLI SHALL 将用户选择的模板目录内容原样复制到目标项目目录，同时自动排除以下文件和目录：
- `.svn/`（SVN 版本控制目录）
- `node_modules/`（依赖目录）
- `.DS_Store`（macOS 系统文件）
- `package-lock.json`（锁文件）

#### Scenario: 正常复制模板
- **WHEN** 用户选择 `uni-vue3` 模板并确认项目名称为 `my-app`
- **THEN** CLI 将 `templates/uni-vue3/` 下的所有文件（排除忽略列表）复制到 `./my-app/` 目录
- **THEN** `.svn/`、`node_modules/`、`.DS_Store`、`package-lock.json` 不存在于目标目录中

#### Scenario: 大型模板复制进度
- **WHEN** 模板复制开始
- **THEN** CLI 显示"正在生成项目..."提示信息

### Requirement: 项目名称替换

CLI SHALL 将生成的项目中 `package.json` 的 `name` 字段替换为用户输入的项目名称。

#### Scenario: 替换 package.json name 字段
- **WHEN** 模板复制完成
- **THEN** 目标项目 `package.json` 中的 `name` 字段值被替换为用户输入的项目名
- **THEN** `package.json` 的其他字段保持模板原值不变

### Requirement: 目标目录已存在处理

CLI SHALL 在目标目录已存在时提示用户选择操作方式。

#### Scenario: 目标目录已存在
- **WHEN** 用户指定的项目目录已存在
- **THEN** CLI 提示"目录已存在，是否覆盖？"
- **THEN** 用户选择"否"时，CLI 退出不执行任何操作
- **THEN** 用户选择"是"时，CLI 先删除已有目录再重新生成

### Requirement: 中断清理

CLI SHALL 在用户中断操作（Ctrl+C）时清理已生成的临时文件，确保不残留不完整的项目目录。

#### Scenario: 用户在复制过程中按 Ctrl+C
- **WHEN** 用户在模板复制过程中按下 Ctrl+C
- **THEN** CLI 删除已生成的临时目录
- **THEN** 目标项目目录不存在（不会残留部分文件）

### Requirement: 多模板架构预留

CLI SHALL 从 `templates/` 目录动态发现可用模板，支持未来扩展更多模板而无需修改核心代码。

#### Scenario: 单模板场景
- **WHEN** `templates/` 目录下仅有一个模板（如 `uni-vue3`）
- **THEN** CLI 跳过模板选择步骤，直接使用该模板

#### Scenario: 多模板场景
- **WHEN** `templates/` 目录下有多个模板（如 `uni-vue3`、`uni-vue2`）
- **THEN** CLI 显示模板列表供用户选择


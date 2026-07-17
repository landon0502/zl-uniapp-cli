## ADDED Requirements

### Requirement: 自动安装依赖

CLI SHALL 在项目创建完成后自动安装依赖，使用用户选择的包管理器（pnpm/npm/yarn）。

#### Scenario: 使用 pnpm 安装依赖
- **WHEN** 用户选择 pnpm 作为包管理器且项目创建完成
- **THEN** CLI 在项目目录下执行 `pnpm install`
- **THEN** 安装过程实时显示输出

#### Scenario: 使用 npm 安装依赖
- **WHEN** 用户选择 npm 作为包管理器且项目创建完成
- **THEN** CLI 在项目目录下执行 `npm install`

#### Scenario: 使用 yarn 安装依赖
- **WHEN** 用户选择 yarn 作为包管理器且项目创建完成
- **THEN** CLI 在项目目录下执行 `yarn install`

### Requirement: 安装失败处理

CLI SHALL 在依赖安装失败时显示错误信息，但不删除已生成的项目目录。

#### Scenario: 依赖安装失败
- **WHEN** 依赖安装过程中发生错误（如网络不可用）
- **THEN** CLI 显示安装失败的错误信息
- **THEN** 项目目录保持不变（已复制的模板文件不删除）
- **THEN** CLI 提示用户可手动执行安装命令

### Requirement: 跳过安装选项

CLI SHALL 支持 `--no-install` 参数跳过依赖安装步骤。

#### Scenario: 用户选择跳过安装
- **WHEN** 用户运行 `create-app my-app --no-install`
- **THEN** CLI 创建项目后不执行依赖安装
- **THEN** CLI 提示用户手动运行安装命令

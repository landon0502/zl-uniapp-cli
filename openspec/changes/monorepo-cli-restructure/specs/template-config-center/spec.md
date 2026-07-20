## ADDED Requirements

### Requirement: 模板注册表

CLI SHALL 维护一个模板注册表（`templates.ts`），每个模板条目包含：
- `name`：模板显示名称（如 "UniApp 基础版"）
- `value`：模板标识符（kebab-case，如 `uniapp-base`）

#### Scenario: 注册表包含 uniapp-base 模板
- **WHEN** 查看模板注册表
- **THEN** 注册表中包含 `{ name: 'UniApp 基础版', value: 'uniapp-base' }` 条目

### Requirement: 交互式模板选择

CLI SHALL 通过 inquirer 的 select 类型让用户从模板注册表中选择模板，显示 `name`，返回 `value`。

#### Scenario: 多模板选择
- **WHEN** 用户运行 `create-app` 且模板注册表有多个模板
- **THEN** CLI 显示所有模板的 `name` 列表供用户选择
- **THEN** 用户选择后返回对应的 `value`

#### Scenario: 单模板自动选择
- **WHEN** 模板注册表只有一个模板
- **THEN** CLI 跳过选择步骤，自动使用该模板

### Requirement: 命令行参数指定模板

CLI SHALL 支持 `--template <value>` 参数直接指定模板，跳过交互选择。

#### Scenario: 通过命令行指定模板
- **WHEN** 用户运行 `create-app my-app --template uniapp-base`
- **THEN** CLI 跳过模板选择步骤，直接使用 `uniapp-base` 模板

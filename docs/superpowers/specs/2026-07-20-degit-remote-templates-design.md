---
comet_change: degit-remote-templates
role: technical-design
canonical_spec: openspec
---

# degit 远程模板拉取技术设计

## 1. 概述

将 CLI 的模板拉取机制从本地 `fs-extra.copy` 改为 degit 远程拉取 GitHub 仓库子目录。模板独立存放在 `zl-uniapp-cli/templates` 仓库，新增模板只需在 GitHub 添加子目录，CLI 无需任何改动。

采用临时目录 + 原子重命名流程，与当前架构一致，确保失败时不留残留。

## 2. 数据流

```
用户输入 (name, --template, --pm)
      │
      ▼
prompts/create.ts
├─ 从 templates.ts 静态注册表获取模板列表
├─ 交互补充缺失参数
└─ 返回 CreateOptions { name, template, pm }
      │
      ▼
commands/create.ts  ── executeCreate()
│
├─ 1. 检查目标目录是否存在
│
├─ 2. degit 拉取到临时目录
│     downloadTemplate('uni-vue3', tempDir)
│       └─ degit('zl-uniapp-cli/templates/uni-vue3').clone(tempDir)
│
├─ 3. 替换项目名
│     replaceProjectName(tempDir, name)
│
├─ 4. 原子重命名
│     renameSync(tempDir, targetDir)
│     └─ 跨设备回退: cpSync + rmSync
│
├─ 5. 安装依赖
│     installDependencies(targetDir, pm)
│
└─ 6. 输出成功信息
```

## 3. 模块变更

### 3.1 utils/download.ts — 重写

```ts
import degit from 'degit'

const TEMPLATE_REPO = 'zl-uniapp-cli/templates'

export async function downloadTemplate(
  template: string,
  dest: string,
): Promise<void> {
  const emitter = degit(`${TEMPLATE_REPO}/${template}`, {
    cache: false,
    force: true,
  })
  await emitter.clone(dest)
}
```

- `TEMPLATE_REPO` 常量集中管理 GitHub 仓库地址
- `cache: false` 避免本地缓存导致模板更新不及时
- `force: true` 允许覆盖已存在的临时目录
- 函数签名不变，对 `create.ts` 透明

### 3.2 templates.ts — 注册表格式

`value` 字段语义从本地目录名变为 GitHub 子目录名，实际值不变：

```ts
export const templates: TemplateEntry[] = [
  { name: 'UniApp 基础版', value: 'uni-vue3' },
]
```

### 3.3 prompts/create.ts — 移除 discoverTemplates

```ts
// 变更前
import { discoverTemplates } from '@zl-uniapp-cli/shared'
import { TEMPLATES_DIR } from '../constants.js'
const templates = await discoverTemplates(TEMPLATES_DIR)

// 变更后
import { templates } from '../templates/templates.js'
// 直接使用 templates 静态注册表
```

### 3.4 constants.ts — 移除 TEMPLATES_DIR

移除 `TEMPLATES_DIR` 常量及其 `__dirname` 计算。其余常量（`PackageManager`、`CreateOptions`、`DEFAULT_PM`、`KEBAB_CASE_REGEX`）保留。

### 3.5 commands/create.ts — 适配新流程

```ts
// 变更前
import { copyTemplate, replaceProjectName } from '@zl-uniapp-cli/shared'
import { TEMPLATES_DIR } from '../constants.js'
const templateDir = path.join(TEMPLATES_DIR, options.template)
await copyTemplate(templateDir, tempDir)

// 变更后
import { replaceProjectName } from '@zl-uniapp-cli/shared'
import { downloadTemplate } from '../utils/download.js'
await downloadTemplate(options.template, tempDir)
```

### 3.6 shared/src/index.ts — discoverTemplates 处置

保留导出但标记 deprecated：

```ts
/** @deprecated 模板发现改为静态注册表驱动，此函数不再被 create-app 使用 */
export { discoverTemplates } from './template.js'
```

## 4. 错误处理

degit 错误对象带有 `code` 字段，按类型分类处理：

| degit 错误码 | 含义 | 用户提示 |
|-------------|------|---------|
| `MISSING_REF` | 仓库/分支/子目录不存在 | `模板 "<name>" 不存在，请检查模板名称是否正确` |
| `MISSING_REPO` | 仓库不存在 | `模板仓库不存在，请检查网络或联系维护者` |
| 无 code（网络错误） | 网络不可达 | `网络连接失败，请检查网络后重试` |
| 其他 | 未知错误 | `模板拉取失败: <err.message>` |

错误处理流程：

```
degit.clone(tempDir) 失败
      │
      ▼
  捕获错误，按 code 分类
      │
      ▼
  显示友好错误信息
      │
      ▼
  清理临时目录（fs.rmSync tempDir）
      │
      ▼
  process.exit(1) — 不创建目标目录
```

## 5. 依赖变更

| 包 | 新增 | 移除 |
|----|------|------|
| create-app | `degit@^3.6.0` | — |

`fs-extra` 保留在 shared 包中（`copyTemplate` 仍使用），create-app 本身不直接依赖 `fs-extra`。

## 6. 测试策略

| 测试类型 | 覆盖内容 | 方式 |
|---------|---------|------|
| 单元测试 | `downloadTemplate()` 正常调用 | `vi.mock('degit')` 模拟成功 clone |
| 单元测试 | `downloadTemplate()` 错误处理 | mock degit 抛出 `MISSING_REF`/`MISSING_REPO`/网络错误 |
| 单元测试 | `prompts/create.ts` 模板列表 | 验证从 templates.ts 读取而非 discoverTemplates |
| 集成测试 | 完整 create 流程 | mock degit + 验证 tempDir→rename 流程 |
| E2E 测试 | 实际拉取 GitHub 模板 | 需网络，CI 中可选 |

## 7. 迁移步骤

1. 创建 `zl-uniapp-cli/templates` GitHub 仓库，将 `uni-vue3` 推送为子目录
2. 验证 `npx degit zl-uniapp-cli/templates/uni-vue3` 可成功拉取
3. 在 create-app 包添加 `degit` 依赖
4. 重写 `utils/download.ts`
5. 更新 `prompts/create.ts`（移除 discoverTemplates）
6. 更新 `commands/create.ts`（移除 copyTemplate/TEMPLATES_DIR）
7. 移除 `constants.ts` 中 TEMPLATES_DIR
8. 标记 shared 包 `discoverTemplates` 为 deprecated
9. 验证构建和测试通过
10. 端到端验证后删除本地 `templates/` 目录

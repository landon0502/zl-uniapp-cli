## Context

当前 `zl-uniapp-cli` 是一个单包 Node.js CLI 项目，使用 commander + inquirer + fs-extra 构建。项目结构为扁平单包：

```
w-uni-cli/
├── bin/index.js
├── src/          (CLI 源码)
├── templates/    (内嵌模板)
├── tests/        (测试)
└── package.json  (单包 zl-uniapp-cli)
```

核心逻辑：`commands/create.ts` → `prompts/create.ts` → `core/copier.ts` + `core/replacer.ts` + `core/template.ts`

需要重构为 pnpm Monorepo，将 CLI 和共享工具拆为独立包，模板目录独立管理。

## Goals / Non-Goals

**Goals:**
- 建立 pnpm Monorepo workspace 结构
- CLI 重命名为 `create-app`，支持 `npx create-app`
- 模板与 CLI 解耦，模板更新不影响 CLI 发布
- 共享工具抽取为 `shared` 包，支持跨包复用
- 现有 `uni-vue3` 模板迁移为 `uniapp-base`
- 新增模板配置中心，支持模板元数据管理
- 新增依赖安装功能
- 现有测试迁移并通过

**Non-Goals:**
- 远程模板拉取（GitHub API）— 后续 change
- 新增 react-admin、next-admin、ai-agent-web 模板 — 后续 change
- CI/CD 配置、自动发布流程
- 模板版本管理、企业模板中心

## Decisions

### D1: Monorepo 工具选择 — pnpm workspace

**选择**: pnpm workspace（不引入 turborepo/nx）

**理由**:
- 项目规模小（2 个 packages + templates），不需要构建编排
- pnpm workspace 原生支持，零额外依赖
- 与现有 `DEFAULT_PM: pnpm` 偏好一致
- 后续如需构建编排，可渐进引入 turborepo

**替代方案**:
- turborepo: 过度工程化，当前规模不需要
- lerna: 已过时，维护活跃度低
- yarn workspace: 与团队 pnpm 偏好不符

### D2: 包拆分策略

**选择**: 2 个 packages + 独立 templates 目录

```
wh-templates/
├── packages/
│   ├── create-app/    # CLI 包（commander + inquirer）
│   └── shared/           # 共享工具（copier + replacer + template + logger）
├── templates/            # 模板目录（不在 packages 内，不作为 npm 包）
├── pnpm-workspace.yaml
└── package.json
```

**理由**:
- `templates/` 不纳入 workspace — 模板不是 npm 包，不需要被 pnpm 管理
- `shared` 包抽取 copier/replacer/template/logger — 这些是纯工具函数，可被 CLI 和未来其他包复用
- CLI 包保持精简，只包含命令注册和交互逻辑

**替代方案**:
- 模板作为 npm 包: 过度设计，模板不需要独立版本和发布
- 不拆 shared: 当前只有 CLI 一个消费者，但后续 remote-template-center 也需要 copier/replacer

### D3: 模板发现策略 — 配置中心驱动

**选择**: 从文件系统扫描改为配置中心（`templates.ts` 静态注册表）

**理由**:
- 文件系统扫描无法提供模板中文名、描述等元数据
- 配置中心支持模板分类、排序、描述
- 为后续远程模板中心预留扩展点（配置中心可改为远程获取）

**替代方案**:
- 继续文件系统扫描: 无法支持元数据，扩展性差
- JSON 配置文件: 增加文件管理复杂度，不如代码内配置灵活

### D4: 模板路径策略

**选择**: 开发时相对路径 `../../templates/`，发布时模板打包进 CLI

**理由**:
- 开发阶段模板在仓库内，相对路径最简单
- npm 发布时通过 `package.json files` 字段将 templates 目录打包
- 后续远程模板中心实现后，本地模板作为 fallback

**替代方案**:
- 模板独立 npm 包: 增加发布复杂度，当前不需要
- 环境变量配置模板路径: 过度灵活，增加调试难度

### D5: 依赖安装 — execa

**选择**: 使用 `execa` 调用用户选择的包管理器安装依赖

**理由**:
- execa 是 Node.js 执行外部命令的最佳实践库
- 支持 stdio: 'inherit' 实时显示安装进度
- 比 child_process.exec 更安全、更易用

**替代方案**:
- 不安装依赖: 用户体验差，需手动安装
- 使用 npm API: 复杂且不稳定

### D6: 项目命名

**选择**: 仓库名 `wh-templates`，CLI 包名 `create-app`

**理由**:
- `create-*` 是 Node.js 脚手架的命名惯例（create-react-app、create-vite）
- `wh-templates` 体现仓库定位（模板中心），不局限于 CLI

## Risks / Trade-offs

- **[风险] 模板打包进 CLI 导致包体积大** → 当前 uniapp-base 约 979 文件，gzip 后可控；后续远程模板中心可解决
- **[风险] Monorepo 迁移可能破坏现有 CI/CD** → 当前无 CI/CD，风险为零
- **[权衡] 配置中心 vs 文件系统扫描** → 配置中心牺牲了自动发现能力，但换来元数据支持和更好的扩展性
- **[风险] shared 包过度抽象** → 当前只抽取明确被复用的工具，不提前抽象

## Migration Plan

1. 创建 Monorepo 骨架（pnpm-workspace.yaml + 根 package.json）
2. 创建 packages/create-app 和 packages/shared 目录结构
3. 迁移源码：src/ → packages/create-app/src/ + packages/shared/src/
4. 迁移模板：templates/uni-vue3 → templates/uniapp-base
5. 迁移测试：tests/ → packages/create-app/tests/ + packages/shared/tests/
6. 更新所有 import 路径和构建配置
7. 验证 `pnpm build` 和 `pnpm test` 通过
8. 清理旧文件（根目录 src/、tests/、bin/）

## Open Questions

- 无（需求澄清阶段已确认）

## 1. Monorepo 骨架搭建

- [ ] 1.1 创建 `pnpm-workspace.yaml`，声明 `packages/*` 为 workspace 成员
- [ ] 1.2 创建根 `package.json`（name: zl-uniapp-cli, private: true, packageManager: pnpm@10, scripts: build/dev）
- [ ] 1.3 创建 `packages/create-app/package.json`（name: create-app, bin, 依赖 shared + commander + inquirer + execa）
- [ ] 1.4 创建 `packages/shared/package.json`（name: @zl-uniapp-cli/shared, 导出配置）
- [ ] 1.5 为两个包分别创建 `tsconfig.json`（继承根配置或独立配置）
- [ ] 1.6 运行 `pnpm install` 验证 workspace 链接正确

## 2. shared 包迁移

- [ ] 2.1 创建 `packages/shared/src/` 目录结构
- [ ] 2.2 迁移 `src/core/copier.ts` → `packages/shared/src/copier.ts`，更新 import 路径
- [ ] 2.3 迁移 `src/core/replacer.ts` → `packages/shared/src/replacer.ts`，更新 import 路径
- [ ] 2.4 迁移 `src/core/template.ts` → `packages/shared/src/template.ts`，更新 import 路径
- [ ] 2.5 新增 `packages/shared/src/logger.ts`（日志工具）
- [ ] 2.6 创建 `packages/shared/src/index.ts` 统一导出所有工具
- [ ] 2.7 配置 shared 包构建（tsup），验证 `pnpm --filter @zl-uniapp-cli/shared build` 通过

## 3. create-app 包迁移

- [ ] 3.1 创建 `packages/create-app/src/` 目录结构（commands/、prompts/、utils/、templates/）
- [ ] 3.2 迁移 `src/constants.ts` → `packages/create-app/src/constants.ts`，更新 TEMPLATES_DIR 路径为 `../../templates`
- [ ] 3.3 迁移 `src/commands/create.ts` → `packages/create-app/src/commands/create.ts`，更新 import 路径
- [ ] 3.4 迁移 `src/prompts/create.ts` → `packages/create-app/src/prompts/create.ts`，更新 import 路径
- [ ] 3.5 新增 `packages/create-app/src/templates/templates.ts`（模板配置中心）
- [ ] 3.6 新增 `packages/create-app/src/utils/download.ts`（模板复制，调用 shared.copyTemplate）
- [ ] 3.7 新增 `packages/create-app/src/utils/install.ts`（依赖安装，使用 execa）
- [ ] 3.8 重写 `packages/create-app/src/index.ts`（create-app 入口，整合完整流程）
- [ ] 3.9 创建 `packages/create-app/bin/index.js`（CLI 入口脚本）
- [ ] 3.10 配置 create-app 构建（tsup），验证 `pnpm --filter create-app build` 通过

## 4. 模板迁移

- [ ] 4.1 将 `templates/uni-vue3/` 重命名为 `templates/uniapp-base/`
- [ ] 4.2 验证模板路径在 CLI 中正确解析

## 5. 测试迁移

- [ ] 5.1 迁移 `tests/core/copier.test.ts` → `packages/shared/tests/copier.test.ts`
- [ ] 5.2 迁移 `tests/core/replacer.test.ts` → `packages/shared/tests/replacer.test.ts`
- [ ] 5.3 迁移 `tests/core/template.test.ts` → `packages/shared/tests/template.test.ts`
- [ ] 5.4 迁移 `tests/constants.test.ts` → `packages/create-app/tests/constants.test.ts`
- [ ] 5.5 迁移 `tests/prompts/create.test.ts` → `packages/create-app/tests/prompts/create.test.ts`
- [ ] 5.6 迁移 `tests/commands/create.test.ts` → `packages/create-app/tests/commands/create.test.ts`
- [ ] 5.7 迁移 `tests/e2e/create.test.ts` → `packages/create-app/tests/e2e/create.test.ts`
- [ ] 5.8 更新所有测试的 import 路径
- [ ] 5.9 为两个包分别配置 vitest
- [ ] 5.10 验证 `pnpm test` 全部通过

## 6. 清理与验证

- [ ] 6.1 删除根目录旧文件（src/、tests/、bin/、旧 package.json 中的 src 相关配置）
- [ ] 6.2 更新根目录 `.gitignore`（添加 packages/*/dist/ 等）
- [ ] 6.3 更新根目录 `eslint.config.mjs` 和 `prettier.config.mjs` 适配 Monorepo
- [ ] 6.4 端到端验证：`npx create-app` 交互式创建项目成功
- [ ] 6.5 端到端验证：创建的项目 package.json name 字段正确
- [ ] 6.6 端到端验证：依赖安装自动执行

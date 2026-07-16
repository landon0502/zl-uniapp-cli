## 1. 项目基础设施

- [x] 1.1 创建 `src/` 目录结构：`src/index.ts`、`src/commands/`、`src/prompts/`、`src/core/`、`src/utils/`
- [x] 1.2 补充 `package.json` 的 devDependencies：`typescript`、`tsup`、`tsx`、`@types/node`
- [x] 1.3 更新 `bin/index.ts` 引用编译后的 CJS 入口（`../dist/index.cjs`）
- [x] 1.4 验证 `npm run build` 和 `npm run dev` 可正常执行

## 2. CLI 入口与命令注册

- [x] 2.1 实现 `src/index.ts`：注册 `create-app` 命令，解析命令行参数（项目名可选位置参数）
- [x] 2.2 实现 `src/commands/create.ts`：编排创建流程（问答 → 复制 → 替换 → 完成）

## 3. 交互式问答

- [x] 3.1 实现 `src/prompts/create.ts`：项目名称输入（含 kebab-case 格式校验）
- [x] 3.2 实现 `src/prompts/create.ts`：模板选择（动态扫描 `templates/` 目录，单模板时跳过）
- [x] 3.3 实现 `src/prompts/create.ts`：包管理器选择（pnpm / npm / yarn）

## 4. 模板复制核心

- [x] 4.1 实现 `src/core/copier.ts`：使用 `fs-extra.copy()` + filter 回调实现忽略列表
- [x] 4.2 定义忽略列表常量：`.svn/`、`node_modules/`、`.DS_Store`、`package-lock.json`
- [x] 4.3 实现临时目录策略：先复制到临时目录，完成后重命名为目标目录

## 5. 元信息替换

- [x] 5.1 实现 `src/core/replacer.ts`：读取 `package.json`，替换 `name` 字段，写回文件

## 6. 安全与中断处理

- [x] 6.1 实现目标目录已存在检测：提示用户确认覆盖或取消
- [x] 6.2 实现 Ctrl+C 中断处理：注册 SIGINT 信号监听，清理临时目录

## 7. 集成与验证

- [x] 7.1 端到端测试：运行 `create-app` → 输入项目名 → 选择模板 → 验证生成目录结构完整
- [x] 7.2 验证忽略列表：确认 `.svn/`、`node_modules/`、`.DS_Store`、`package-lock.json` 未被复制
- [x] 7.3 验证 name 替换：确认生成项目的 `package.json` 的 `name` 字段为用户输入值
- [x] 7.4 验证中断清理：Ctrl+C 后确认无残留目录
- [x] 7.5 验证目标目录已存在场景：确认提示覆盖/取消逻辑正确

# zl-uniapp-cli

快速创建 uni-app Vue3 项目的脚手架工具。

## 特性

- 🚀 一行命令创建项目，交互式引导配置
- 📦 基于 degit 从 GitHub 远程拉取模板，无需本地克隆
- 🎨 内置 UniApp Vue3 基础模板，集成 uv-ui 组件库、UnoCSS、Pinia 等
- 🔧 支持 pnpm / npm / yarn 多种包管理器
- ✅ 项目名称 kebab-case 格式校验
- 🛡️ 目录已存在时覆盖确认

## 快速开始

```bash
# 使用 npx（推荐）
npx create-zluni-app create my-app

# 或全局安装后使用
npm install -g create-zluni-app
create-zluni-app create my-app
```

创建过程会交互式引导你完成以下配置：

1. **项目名称** — kebab-case 格式（如 `my-app`、`uni-vue3`）
2. **选择模板** — 当前提供 `UniApp 基础版`（uni-vue3）
3. **包管理器** — pnpm（默认）/ npm / yarn

创建成功后：

```bash
cd my-app
pnpm install
```

## 命令行选项

```bash
create-zluni-app create [name] [options]
```

| 选项 | 简写 | 说明 |
|------|------|------|
| `--template <name>` | `-t` | 指定模板名称，跳过模板选择交互 |
| `--pm <pm>` | `-p` | 指定包管理器（pnpm / npm / yarn），跳过选择交互 |

示例：

```bash
# 指定项目名和模板，跳过交互
npx create-zluni-app create my-app -t uni-vue3 -p pnpm
```

## 可用模板

| 模板名称 | 标识 | 说明 |
|----------|------|------|
| UniApp 基础版 | `uni-vue3` | Vue3 + Pinia + uv-ui + UnoCSS + Vite，详见 [templates/uni-vue3/README.md](templates/uni-vue3/README.md) |

## 项目结构

本项目采用 pnpm monorepo 架构：

```
zl-uniapp-cli/
├── packages/
│   ├── create-zluni-app/     # CLI 主包
│   │   ├── bin/index.js      # CLI 入口
│   │   └── src/
│   │       ├── commands/     # 命令实现（create）
│   │       ├── prompts/      # 交互式提示
│   │       ├── templates/    # 模板注册表
│   │       └── utils/        # 工具函数（download、install）
│   └── shared/               # 共享工具包
│       └── src/
│           ├── copier.ts     # 模板复制
│           ├── replacer.ts   # 项目名替换
│           ├── logger.ts     # 日志工具
│           └── constants.ts  # 共享常量
├── templates/
│   └── uni-vue3/             # UniApp Vue3 模板项目
├── tests/                    # 测试用例
├── pnpm-workspace.yaml
└── package.json
```

## 开发

### 环境要求

- Node.js >= 18
- pnpm >= 9

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式运行 CLI
pnpm dev create my-test-app

# 构建
pnpm build

# 运行测试
pnpm test
```

### 工作流程

CLI 创建项目的核心流程：

1. 解析命令行参数（项目名、模板、包管理器）
2. 交互式补全未提供的选项
3. 使用 [degit](https://github.com/Rich-Harris/degit) 从 GitHub 仓库 `landon0502/zl-uniapp-cli/templates` 拉取指定模板
4. 替换模板 `package.json` 中的 `name` 字段为用户指定的项目名
5. 将临时目录移动到目标目录（跨设备时自动回退为复制+删除）
6. 输出后续操作提示

## 技术栈

| 类别 | 技术 |
|------|------|
| CLI 框架 | [Commander.js](https://github.com/tj/commander.js) |
| 交互提示 | [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) |
| 模板下载 | [degit](https://github.com/Rich-Harris/degit) |
| 进程执行 | [execa](https://github.com/sindresorhus/execa) |
| 构建 | [tsup](https://github.com/egoist/tsup) |
| 测试 | [Vitest](https://vitest.dev/) |
| 包管理 | pnpm workspace |

## License

ISC

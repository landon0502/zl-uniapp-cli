# zlapp-cli 脚手架使用文档

快速创建 uni-app Vue3 项目的命令行脚手架工具

## 1. 概述

`zlapp-cli` 是一个基于 Node.js 的命令行脚手架工具，用于快速创建 uni-app Vue3 项目。它通过交互式引导帮助开发者完成项目初始化，自动从远程仓库拉取项目模板，并完成项目名称替换等配置工作。

**核心能力：**

- 一行命令创建项目，交互式引导配置
- 基于 degit 从 GitHub 远程拉取模板，无需本地克隆
- ora 进度动画，模板拉取过程可视化
- 内置 UniApp Vue3 基础模板，集成 uv-ui 组件库、UnoCSS、Pinia 等
- 项目名称 kebab-case 格式校验
- 目录已存在时覆盖确认

## 2. 环境准备

在使用脚手架之前，请确保本地开发环境满足以下要求：

| 工具 | 最低版本 | 安装方式 | 验证命令 |
|------|---------|---------|---------|
| Node.js | >= 18 | [官网下载](https://nodejs.org/) 或 nvm | node -v |
| npm | 随 Node.js 附带 | 随 Node.js 安装 | npm -v |
| Git | 任意稳定版 | [官网下载](https://git-scm.com/) | git --version |

**推荐**：使用 nvm 管理 Node.js 版本，避免权限问题和版本切换困难。

## 3. 快速创建项目

### 3.1 使用 npx（推荐）

无需全局安装，直接使用 npx 运行：

```
npx @zlskuniapp/zlapp-cli create my-app
```

### 3.2 全局安装后使用

```
# 全局安装
npm install -g @zlskuniapp/zlapp-cli

# 创建项目
zlapp-cli create my-app
```

### 3.3 交互式引导

运行创建命令后，脚手架会逐步引导你完成以下配置：

**第一步：输入项目名称**

```
? 项目名称: my-app
```

- 项目名称必须为 **kebab-case** 格式（如 `my-app`、`scms-mobile`、`order-system`）
- 不合法的名称会提示重新输入，并自动提供修正建议

**第二步：选择模板**

```
? 选择模板: (Use arrow keys)
> UniApp 基础版
```

- 当前提供 `UniApp 基础版`（uni-vue3）模板
- 如果只有一个模板，会自动选择，跳过此步骤

**第三步：确认创建**

```
- 正在拉取模板 uni-vue3...
OK 模板拉取完成

 项目创建成功！

  cd my-app
  npm install
```

### 3.4 完整流程

```
# 1. 创建项目
npx @zlskuniapp/zlapp-cli create my-app

# 2. 进入项目目录
cd my-app

# 3. 安装依赖
npm install

# 4. 启动开发
npm run dev:h5          # H5 开发
npm run dev:mp-weixin   # 微信小程序开发
```

## 4. 命令行参数详解

### 4.1 基本语法

```
zlapp-cli create [name] [options]
```

### 4.2 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| name | 否 | 项目名称，kebab-case 格式。不提供时交互式输入 |

### 4.3 选项说明

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| --template &lt;name&gt; | -t | 交互选择 | 指定模板名称，跳过模板选择交互 |

### 4.4 使用示例

```
# 交互式创建（逐步引导）
npx @zlskuniapp/zlapp-cli create

# 指定项目名，其余交互
npx @zlskuniapp/zlapp-cli create my-app

# 全部指定，跳过所有交互
npx @zlskuniapp/zlapp-cli create my-app -t uni-vue3

# 仅指定模板
npx @zlskuniapp/zlapp-cli create my-app -t uni-vue3
```

### 4.5 目录覆盖

如果目标目录已存在，脚手架会提示确认：

```
? 目录 my-app 已存在，是否覆盖？ (y/N)
```

- 输入 `y` 覆盖已有目录
- 输入 `N` 或直接回车取消创建

## 5. 创建流程说明

脚手架创建项目的内部流程如下：

```
用户执行命令
    |
解析命令行参数（项目名、模板）
    |
交互式补全未提供的选项
    |
校验项目名称格式（kebab-case）
    |
检查目标目录是否已存在 -> 已存在则提示覆盖确认
    |
使用 degit 从 GitHub 仓库拉取模板
  仓库地址：landon0502/zl-uniapp-cli/templates/{模板名}
    |
替换模板 package.json 中的 name 字段为用户指定的项目名
    |
将临时目录移动到目标目录
  （跨设备时自动回退为复制+删除）
    |
输出成功提示和后续操作指引
```

**错误处理：**

| 错误场景 | 提示信息 |
|---------|---------|
| 模板不存在 | 模板 "xxx" 不存在，请检查模板名称是否正确 |
| 仓库不存在 | 模板仓库不存在，请检查网络或联系维护者 |
| 网络异常 | 网络连接失败，请检查网络后重试 |
| 项目名不合法 | 提示输入 kebab-case 格式名称，并提供自动修正建议 |

## 6. 模板项目说明

通过脚手架创建的项目基于 `uni-vue3` 模板，模板项目的详细说明（技术栈、目录结构、开发命令、环境变量、架构设计、自定义 Hooks、业务组件、工具函数、常见开发场景、FAQ 等）请参阅 [templates/uni-vue3/README.md](templates/uni-vue3/README.md)。

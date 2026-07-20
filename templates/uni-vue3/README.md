# UniApp Vue3 基础模板

基于 Vue3 + Vite + Pinia + uv-ui + UnoCSS 的 uni-app 项目模板，支持 H5、微信小程序、支付宝小程序、App 等多端开发。

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | 3.5.x |
| 构建工具 | Vite | 5.2.8 |
| 状态管理 | Pinia | ^3.0.3 |
| UI 组件库 | uv-ui | ^1.1.20（uni_modules 集成） |
| 原子化 CSS | UnoCSS | 66.7.5 |
| CSS 预处理 | Sass | 1.26.0 |
| 工具库 | lodash | ^4.17.21 |
| 日期处理 | dayjs | ^1.11.18 |
| 图表 | ECharts | ^6.0.0 |
| 分页列表 | z-paging | ^2.8.8 |
| 国际化 | vue-i18n | 9.14.4 |
| 代码规范 | ESLint + Prettier | - |
| 单元测试 | Vitest | ^3.2.4 |
| Mock | better-mock | ^0.3.7 |

## 项目结构

```
src/
├── api/                    # API 接口
│   ├── common.js           # 公共接口（OSS、地址、地图、升级检测）
│   ├── test.js             # 测试接口
│   └── user.js             # 用户接口（登录、用户信息）
├── auth/                   # 认证
│   └── user.js             # 登录状态判断
├── components/             # 业务组件
│   ├── AddressSelect/      # 地址选择
│   ├── Badge/              # 徽标
│   ├── Card/               # 卡片
│   ├── Charts/             # ECharts 图表封装
│   ├── DatetimePicker/     # 日期时间选择
│   ├── DevEnv/             # 开发环境切换
│   ├── Empty/              # 空状态
│   ├── MarkMap/             # 地图标记
│   ├── NavBar/             # 导航栏
│   ├── NIcon/              # 图标
│   ├── PageContainer/      # 页面容器（核心组件）
│   ├── ScrollPaging/       # 滚动分页
│   ├── Tabbar/             # 底部标签栏
│   ├── TagInput/           # 标签输入
│   ├── Upload/             # 文件上传
│   ├── Waterfall/          # 瀑布流
│   └── WithPopup/          # 弹窗容器
├── composables/            # 组合式函数
│   ├── app/                # 应用级
│   │   ├── useInitApp.js   # 应用初始化
│   │   ├── usePageTrack.js # 页面追踪
│   │   ├── useProgramUpdate.js # 小程序更新检测
│   │   └── useTheme.js     # 主题管理
│   ├── auth/               # 认证级
│   │   ├── useAuthInvoke.js     # 认证后执行
│   │   └── useUserLoadedInvoke.js # 用户加载后执行
│   ├── component/          # 组件级
│   │   └── useMapContext.js # 地图上下文
│   ├── hooks/              # 通用 Hooks
│   │   ├── useDebounceFn.js # 防抖函数
│   │   ├── useCountdown.js  # 倒计时
│   │   ├── useGeolocation.js # 定位
│   │   ├── useInterval.js   # 定时器
│   │   ├── useNetworkStatus.js # 网络状态
│   │   ├── useRequest.js    # 请求封装
│   │   ├── useRouter.js     # 路由封装
│   │   ├── useScreenInfo.js # 屏幕信息
│   │   ├── useStorage.js    # 本地存储
│   │   └── ...              # 更多 Hooks
│   ├── nvue/               # nvue 专用
│   │   └── useBindingx.js  # Bindingx 动画
│   └── shared/             # 共享工具
│       └── tryOnScopeDispose.js
├── config/                 # 配置
│   ├── index.js            # 请求配置 + 环境变量解析
│   └── pages.mjs           # 页面映射配置（生成 pages.json）
├── contants/               # 常量
│   └── index.js            # APP_NAME、isDev、地图 key 等
├── mock/                   # Mock 数据（仅 H5 和小程序端生效）
│   ├── api/                # Mock 接口定义
│   │   ├── common.js
│   │   └── user.js
│   ├── index.js            # Mock 入口
│   ├── mock.js             # better-mock 适配层
│   └── setupMock.js        # Mock 初始化
├── pages/                  # 页面
│   ├── app-load/           # APP 启动加载页
│   ├── index/              # 首页
│   ├── login/              # 登录页
│   ├── tools/clipper/      # 图片裁剪
│   └── user/               # 个人中心
├── router/                 # 路由
│   ├── index.js            # 路由初始化 + 认证拦截
│   └── whiteList.js        # 白名单配置
├── static/                 # 静态资源
│   └── iconfont/           # 图标字体
├── store/                  # Pinia 状态管理
│   ├── modules/
│   │   ├── app.js          # 应用状态（环境切换等）
│   │   └── user.js         # 用户状态（登录/登出/用户信息）
│   └── index.js
├── style/                  # 样式
│   ├── index.js            # 主题切换入口
│   ├── theme.scss          # 主题主文件
│   ├── theme-vue.scss      # Vue 页面主题
│   ├── theme-nvue.scss     # NVue 页面主题
│   └── theme-vars.js       # 主题变量（blue/green/yellow）
├── uni_modules/            # uni-app 插件模块
│   ├── uv-ui-tools/        # uv-ui 工具库
│   ├── uv-button/          # 按钮组件
│   ├── uv-form/            # 表单组件
│   ├── uv-navbar/          # 导航栏
│   ├── uv-popup/           # 弹出层
│   ├── ...                 # 60+ uv-ui 组件
│   ├── z-paging/           # 分页列表
│   ├── lime-echart/        # ECharts 图表
│   ├── lime-clipper/       # 图片裁剪
│   └── w-router/           # 路由库
├── utils/                  # 工具函数
│   ├── request/            # 请求封装
│   │   ├── index.js        # 请求初始化
│   │   ├── interceptor.js  # 请求/响应拦截器
│   │   └── code.js         # 状态码处理
│   ├── Storage.js          # 本地存储封装
│   ├── bus.js              # 事件总线
│   ├── filter.js           # 过滤器
│   ├── is.js               # 环境判断工具
│   ├── map-tools.js        # 地图工具
│   ├── sys.js              # 系统工具
│   ├── uploadFile.js       # 文件上传
│   ├── utils.js            # 通用工具
│   ├── UUID.js             # UUID 生成
│   ├── validate.js         # 表单验证
│   ├── Bindingx.js         # Bindingx 动画
│   └── analytics/          # 数据分析
├── App.vue                 # 应用入口组件
├── main.js                 # 应用入口
├── manifest.json           # uni-app 应用配置
├── pages.json              # 页面路由配置
├── uni.scss                # 全局 SCSS 变量
└── uv.config.js            # uv-ui 主题配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9

### 安装依赖

```bash
pnpm install
```

> 项目配置了 `.npmrc` 使用国内镜像源 `registry=https://registry.npmmirror.com/`

### 开发

```bash
# H5 开发
pnpm dev:h5

# 微信小程序开发
pnpm dev:mp-weixin

# 支付宝小程序
pnpm dev:mp-alipay
```

### 构建

```bash
# H5 构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin
```

### 其他命令

```bash
# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 运行单元测试
pnpm test

# 测试覆盖率
pnpm coverage
```

## 多平台支持

项目支持以下平台的开发和构建：

| 平台 | 开发命令 | 构建命令 |
|------|---------|---------|
| H5 | `pnpm dev:h5` | `pnpm build:h5` |
| 微信小程序 | `pnpm dev:mp-weixin` | `pnpm build:mp-weixin` |
| 支付宝小程序 | `pnpm dev:mp-alipay` | `pnpm build:mp-alipay` |
| 百度小程序 | `pnpm dev:mp-baidu` | `pnpm build:mp-baidu` |
| 京东小程序 | `pnpm dev:mp-jd` | `pnpm build:mp-jd` |
| 快手小程序 | `pnpm dev:mp-kuaishou` | `pnpm build:mp-kuaishou` |
| 飞书小程序 | `pnpm dev:mp-lark` | `pnpm build:mp-lark` |
| QQ 小程序 | `pnpm dev:mp-qq` | `pnpm build:mp-qq` |
| 头条小程序 | `pnpm dev:mp-toutiao` | `pnpm build:mp-toutiao` |
| 鸿蒙元服务 | `pnpm dev:mp-harmony` | `pnpm build:mp-harmony` |
| 小红书小程序 | `pnpm dev:mp-xhs` | `pnpm build:mp-xhs` |

## 环境变量

项目使用 Vite 环境变量，配置文件位于项目根目录：

| 文件 | 说明 |
|------|------|
| `.env` | 通用环境变量（所有环境共享） |
| `.env.development` | 开发环境，默认 `VITE_REQUEST_ENV='fat'` |
| `.env.production` | 生产环境，默认 `VITE_REQUEST_ENV='pro'` |

### 关键环境变量

| 变量名 | 说明 |
|--------|------|
| `VITE_APP_NAME` | 应用名称 |
| `VITE_APP_PROJECT_CODE` | 项目编码 |
| `VITE_REQUEST_FLAG` | 请求 BaseURL 环境标识（用于自动识别 BaseURL 配置） |
| `VITE_REQUEST_BASEURL_*` | 各环境 API 地址，命名格式为 `VITE_REQUEST_BASEURL_${环境名}` |
| `VITE_REQUEST_ENV` | 当前请求环境（dev/sim/sit/pre/uat/pet/fat/pro） |
| `VITE_AMAP_KEY` | 高德地图 Key |
| `VITE_UPLOAD_URL` | OSS 上传地址 |
| `VITE_APP_DAU_REPORT_URL` | 日活上报地址 |

### 添加新环境

1. 在 `.env` 中添加 `VITE_REQUEST_BASEURL_${环境名}` 变量
2. 在开发/生产环境文件中设置 `VITE_REQUEST_ENV` 指向对应环境

## 架构设计

### 路由与认证

项目使用 `w-router`（uni_modules 集成）实现路由拦截：

- **白名单机制**：`src/router/whiteList.js` 配置无需登录的页面路径，支持字符串和正则匹配
- **认证拦截**：非白名单页面访问时自动校验登录状态，未登录跳转登录页
- **登录判断**：通过 `Storage` 检查 `Authorization` 字段

### 请求封装

基于 uv-ui 的 `uni.$uv.http` 封装：

- **初始化**：`src/utils/request/index.js` 中调用 `initRequest()` 配置 BaseURL 和拦截器
- **环境切换**：通过 Pinia store 的 `devEnv` 字段动态切换 API 环境
- **拦截器**：`src/utils/request/interceptor.js` 处理请求头注入、响应状态码处理
- **H5 代理**：开发模式下通过 `vite.dev.js` 配置代理转发

### 页面配置

采用 `pages.mjs` + Vite 插件自动生成 `pages.json` 的方式管理页面路由：

- `src/config/pages.mjs` — 声明式页面配置
- `config/plugins/pages-json-generator.js` — Vite 插件，构建时自动生成 `pages.json`

### 状态管理

使用 Pinia 管理全局状态：

- **app store**：开发环境切换、应用级状态
- **user store**：用户登录/登出、用户信息管理

### 主题系统

支持多主题切换（blue/green/yellow）：

- `src/style/theme-vars.js` — 主题变量定义
- `src/style/index.js` — 主题切换逻辑
- `src/uv.config.js` — uv-ui 组件主题配置
- `uno.config.js` — UnoCSS 主题色绑定 uv-ui CSS 变量

### Mock 数据

开发模式下自动启用 Mock（仅 H5 和小程序端，APP 端通过条件编译排除）：

- `src/mock/mock.js` — better-mock 适配层，兼容 H5 和微信小程序
- `src/mock/api/` — 各模块 Mock 接口定义
- 新增 Mock：在 `src/mock/api/` 下新建文件，并在 `src/mock/index.js` 中注册

## 自定义 Hooks

项目内置了丰富的组合式函数，统一从 `@/composables` 导入：

### 通用 Hooks

| Hook | 说明 |
|------|------|
| `useDebounceFn` | 防抖函数 |
| `useToggle` | 布尔值切换 |
| `useInterval` / `useIntervalFn` | 定时器 |
| `useCountdown` | 倒计时 |
| `useRouter` | 路由跳转封装 |
| `useRequest` | 请求封装 |
| `useStorage` | 本地存储响应式封装 |
| `useScreenInfo` | 屏幕尺寸信息 |
| `useNodeBounding` | 节点布局信息 |
| `useNetworkStatus` | 网络状态监听 |
| `useGeolocation` | 定位功能 |
| `useNow` | 实时时间 |
| `useMounted` | 挂载状态 |
| `useSupported` | 功能支持检测 |
| `useRafFn` | requestAnimationFrame 封装 |
| `useDelayRef` | 延迟响应式引用 |
| `refDebounced` | 防抖响应式引用 |

### 应用级 Hooks

| Hook | 说明 |
|------|------|
| `useInitApp` | 应用初始化 |
| `useTheme` | 主题管理 |
| `useProgramUpdate` | 小程序更新检测 |
| `usePageTrack` | 页面埋点追踪 |

### 认证级 Hooks

| Hook | 说明 |
|------|------|
| `useAuthInvoke` | 登录后执行 |
| `useUserLoadedInvoke` | 用户数据加载后执行 |

## 业务组件

| 组件 | 说明 |
|------|------|
| `PageContainer` | 页面容器，统一页面结构和加载状态 |
| `NavBar` | 自定义导航栏 |
| `Tabbar` | 自定义底部标签栏 |
| `ScrollPaging` | 滚动分页列表 |
| `Upload` | 文件上传 |
| `Charts` | ECharts 图表封装 |
| `AddressSelect` | 地址选择器 |
| `DatetimePicker` | 日期时间选择器 |
| `Empty` | 空状态展示 |
| `DevEnv` | 开发环境切换（仅开发模式） |
| `MarkMap` | 地图标记 |
| `Waterfall` | 瀑布流布局 |
| `WithPopup` | 弹窗容器 |
| `TagInput` | 标签输入 |
| `Badge` | 徽标 |
| `Card` | 卡片 |
| `NIcon` | 图标 |

## Vite 配置

项目采用分环境 Vite 配置：

| 文件 | 说明 |
|------|------|
| `config/vite.base.js` | 基础配置（插件、路径别名） |
| `config/vite.dev.js` | 开发配置（代理、sourcemap） |
| `config/vite.pro.js` | 生产配置（terser 压缩、去除 console） |

### 开发代理

开发模式下自动配置 API 代理（`vite.dev.js`）：

- `/zl` → 代理到当前 `VITE_REQUEST_ENV` 对应的 API 地址
- `/mock` → 代理到 YApi Mock 服务
- `/v3/geocode/regeo`、`/v3/config/district` → 代理到高德地图 API

## 测试

```bash
# 运行单元测试
pnpm test

# 查看覆盖率
pnpm coverage
```

测试配置位于 `vitest.config.js`，使用 jsdom 环境，路径别名 `@` 指向 `src/`。

## 代码规范

- **ESLint** — 配置文件 `eslint.config.mjs`，集成 Vue 和 Prettier 插件
- **Prettier** — 配置文件 `prettier.config.mjs`
- **UnoCSS** — 配置文件 `uno.config.js`，使用 `@uni-helper/unocss-preset-uni` 适配 uni-app

## 新增页面

1. 在 `src/pages/` 下创建页面目录和 `.vue` 文件
2. 在 `src/config/pages.mjs` 中添加页面配置
3. 构建时会自动生成 `pages.json`，无需手动修改

## License

ISC

# UniApp Vue3 基础模板

基于 Vue3 + Vite + Pinia + uv-ui + UnoCSS 的 uni-app 项目模板，支持 H5、微信小程序、支付宝小程序、App 等多端开发。

## 1. 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Vue | 3.5.x | 使用 Composition API |
| 跨端框架 | uni-app | 3.0.0-alpha | 支持 H5 / 小程序 / App 多端 |
| 构建工具 | Vite | 5.2.8 | 快速开发构建 |
| 状态管理 | Pinia | ^3.0.3 | Vue3 官方推荐状态管理 |
| UI 组件库 | uv-ui | ^1.1.20 | uni_modules 集成，60+ 组件 |
| 原子化 CSS | UnoCSS | 66.7.5 | 使用 presetUni 适配 uni-app |
| CSS 预处理 | Sass | 1.26.0 | SCSS 样式编写 |
| 工具库 | lodash | ^4.17.21 | 通用工具函数 |
| 日期处理 | dayjs | ^1.11.18 | 轻量日期库 |
| 图表 | ECharts | ^6.0.0 | 数据可视化 |
| 分页列表 | z-paging | ^2.8.8 | 下拉刷新 + 触底加载 |
| 国际化 | vue-i18n | 9.14.4 | 多语言支持 |
| 精度计算 | decimal.js | ^10.6.0 | 高精度数值运算 |
| 路由 | w-router | - | uni_modules 集成，支持拦截器 |
| 代码规范 | ESLint + Prettier | - | 代码风格统一 |
| 单元测试 | Vitest | ^3.2.4 | Vite 原生测试框架 |
| Mock | better-mock | ^0.3.7 | 开发环境接口模拟 |

## 2. 项目目录结构

```
项目根目录/
|-- .env                          # 通用环境变量
|-- .env.development              # 开发环境变量
|-- .env.production               # 生产环境变量
|-- .npmrc                        # npm 镜像源配置
|-- config/                       # Vite 配置
|   |-- plugins/
|   |   |-- pages-json-generator.js  # 自动生成 pages.json 的 Vite 插件
|   |-- vite.base.js              # 基础配置
|   |-- vite.dev.js               # 开发配置（代理）
|   |-- vite.pro.js               # 生产配置（压缩）
|-- eslint.config.mjs             # ESLint 配置
|-- index.html                    # HTML 入口
|-- package.json                  # 项目依赖
|-- prettier.config.mjs           # Prettier 配置
|-- uno.config.js                 # UnoCSS 配置
|-- vite.config.js                # Vite 入口（按环境加载）
|-- vitest.config.js              # 测试配置
|-- src/                          # 源码目录
    |-- api/                      # API 接口定义
    |   |-- common.js             # 公共接口（OSS Token、地址、地图、升级检测）
    |   |-- test.js               # 测试接口
    |   |-- user.js               # 用户接口（登录、用户信息）
    |-- auth/                     # 认证模块
    |   |-- user.js               # 登录状态判断
    |-- components/               # 业务组件
    |   |-- AddressSelect/        # 地址选择器
    |   |-- Badge/                # 徽标
    |   |-- Card/                 # 卡片
    |   |-- Charts/               # ECharts 图表封装
    |   |-- DatetimePicker/       # 日期时间选择
    |   |-- DevEnv/               # 开发环境切换
    |   |-- Empty/                # 空状态
    |   |-- MarkMap/              # 地图标记
    |   |-- NavBar/               # 自定义导航栏
    |   |-- NIcon/                # 图标
    |   |-- PageContainer/        # 页面容器（核心组件）
    |   |-- ScrollPaging/         # 滚动分页
    |   |-- Tabbar/               # 底部标签栏
    |   |-- TagInput/             # 标签输入
    |   |-- Upload/               # 文件上传
    |   |-- Waterfall/            # 瀑布流
    |   |-- WithPopup/            # 弹窗容器
    |-- composables/              # 组合式函数（Hooks）
    |   |-- app/                  # 应用级（初始化、主题、更新检测、埋点）
    |   |-- auth/                 # 认证级（登录后执行、用户加载后执行）
    |   |-- component/            # 组件级（地图上下文）
    |   |-- hooks/                # 通用 Hooks（30+）
    |   |-- nvue/                 # NVue 专用（BindingX 动画）
    |   |-- shared/               # 共享工具
    |   |-- index.js              # 统一导出
    |-- config/                   # 应用配置
    |   |-- index.js              # 请求配置 + 环境变量解析
    |   |-- pages.mjs             # 页面映射配置
    |-- contants/                 # 常量定义
    |   |-- index.js
    |-- mock/                     # Mock 数据
    |   |-- api/                  # Mock 接口定义
    |   |-- index.js              # Mock 入口
    |   |-- mock.js               # better-mock 适配层
    |   |-- setupMock.js          # Mock 初始化
    |-- pages/                    # 页面
    |   |-- app-load/             # APP 启动加载页
    |   |-- index/                # 首页
    |   |-- login/                # 登录页
    |   |-- tools/clipper/        # 图片裁剪
    |   |-- user/                 # 个人中心
    |-- router/                   # 路由
    |   |-- index.js              # 路由初始化 + 认证拦截
    |   |-- whiteList.js          # 白名单配置
    |-- static/                   # 静态资源
    |   |-- iconfont/             # 图标字体
    |-- store/                    # Pinia 状态管理
    |   |-- modules/
    |   |   |-- app.js            # 应用状态
    |   |   |-- user.js           # 用户状态
    |   |-- index.js
    |-- style/                    # 样式
    |   |-- index.js              # 主题切换入口
    |   |-- theme.scss            # 主题主文件
    |   |-- theme-vue.scss        # Vue 页面主题
    |   |-- theme-nvue.scss       # NVue 页面主题
    |   |-- theme-vars.js         # 主题变量（blue/green/yellow）
    |-- uni_modules/              # uni-app 插件模块
    |   |-- uv-ui-tools/          # uv-ui 工具库
    |   |-- uv-button/ 至 uv-upload/ # 60+ uv-ui 组件
    |   |-- z-paging/             # 分页列表
    |   |-- lime-echart/          # ECharts 图表
    |   |-- lime-clipper/         # 图片裁剪
    |   |-- w-router/             # 路由库
    |-- utils/                    # 工具函数
    |   |-- request/              # 请求封装
    |   |   |-- index.js          # 请求初始化
    |   |   |-- interceptor.js    # 请求/响应拦截器
    |   |   |-- code.js           # 状态码处理
    |   |-- analytics/            # 数据分析/埋点
    |   |-- Storage.js            # 本地存储封装
    |   |-- bus.js                # 事件总线
    |   |-- filter.js             # 防抖过滤器
    |   |-- is.js                 # 环境判断
    |   |-- map-tools.js          # 地图工具
    |   |-- sys.js                # 系统信息
    |   |-- uploadFile.js         # OSS 文件上传
    |   |-- utils.js              # 通用工具
    |   |-- UUID.js               # UUID 生成
    |   |-- validate.js           # 表单验证
    |   |-- Bindingx.js           # BindingX 动画
    |-- App.vue                   # 应用入口组件
    |-- main.js                   # 应用入口
    |-- manifest.json             # uni-app 应用配置
    |-- pages.json                # 页面路由配置（自动生成）
    |-- uni.scss                  # 全局 SCSS 变量
    |-- uv.config.js              # uv-ui 主题配置
```

## 3. 开发与构建命令

### 日常开发命令

| 命令 | 说明 |
|------|------|
| npm install | 安装依赖 |
| npm dev:h5 | H5 开发模式 |
| npm dev:mp-weixin | 微信小程序开发模式 |
| npm build:h5 | H5 生产构建 |
| npm build:mp-weixin | 微信小程序生产构建 |
| npm format | Prettier 代码格式化 |
| npm lint | ESLint 代码检查 |
| npm lint:fix | ESLint 自动修复 |
| npm test | 运行单元测试 |
| npm coverage | 测试覆盖率报告 |

### 全平台命令一览

| 平台 | 开发命令 | 构建命令 |
|------|---------|---------|
| H5 | npm dev:h5 | npm build:h5 |
| 微信小程序 | npm dev:mp-weixin | npm build:mp-weixin |
| 支付宝小程序 | npm dev:mp-alipay | npm build:mp-alipay |
| 百度小程序 | npm dev:mp-baidu | npm build:mp-baidu |
| 京东小程序 | npm dev:mp-jd | npm build:mp-jd |
| 快手小程序 | npm dev:mp-kuaishou | npm build:mp-kuaishou |
| 飞书小程序 | npm dev:mp-lark | npm build:mp-lark |
| QQ 小程序 | npm dev:mp-qq | npm build:mp-qq |
| 头条小程序 | npm dev:mp-toutiao | npm build:mp-toutiao |
| 鸿蒙元服务 | npm dev:mp-harmony | npm build:mp-harmony |
| 小红书小程序 | npm dev:mp-xhs | npm build:mp-xhs |

> **提示**：微信小程序开发时，构建产物在 `dist/dev/mp-weixin` 目录，需在微信开发者工具中导入该目录。

## 4. 环境变量配置

### 环境变量文件

| 文件 | 说明 | 何时生效 |
|------|------|---------|
| .env | 通用环境变量 | 所有环境 |
| .env.development | 开发环境变量 | npm dev:* 时 |
| .env.production | 生产环境变量 | npm build:* 时 |

### 关键环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| VITE_APP_NAME | 应用名称 | SCMS助手 |
| VITE_APP_PROJECT_CODE | 项目编码 | scmsv5at |
| VITE_REQUEST_FLAG | 请求 BaseURL 标识前缀 | REQUEST_BASEURL |
| VITE_REQUEST_BASEURL_DEV | 开发环境 API 地址 | https://xxxdev.xxx.com/ |
| VITE_REQUEST_BASEURL_FAT | FAT 环境 API 地址 | https://xxxfat.xxx.com/ |
| VITE_REQUEST_BASEURL_SIT | SIT 环境 API 地址 | https://xxxsit.xxx.com/ |
| VITE_REQUEST_BASEURL_UAT | UAT 环境 API 地址 | https://xxxuat.xxx.com/ |
| VITE_REQUEST_BASEURL_PRE | 预发环境 API 地址 | https://xxxpre.xxx.com/ |
| VITE_REQUEST_BASEURL_PRO | 生产环境 API 地址 | https://xxxstapp.xxx.com/ |
| VITE_REQUEST_ENV | 当前使用的环境 | fat / pro |
| VITE_AMAP_KEY | 高德地图 Key | - |
| VITE_UPLOAD_URL | OSS 上传地址 | - |
| VITE_APP_DAU_REPORT_URL | 日活上报地址 | - |

### 环境切换机制

项目通过 `VITE_REQUEST_ENV` 变量控制当前请求环境：

1. `.env` 中定义所有环境的 BaseURL（`VITE_REQUEST_BASEURL_*`）
2. `.env.development` 设置 `VITE_REQUEST_ENV='fat'`（开发默认走 FAT）
3. `.env.production` 设置 `VITE_REQUEST_ENV='pro'`（生产走 PRO）
4. `src/config/index.js` 中的 `getEnvBaseUrls()` 自动解析所有 BaseURL
5. H5 开发模式下可通过 `DevEnv` 组件动态切换环境

### 添加新环境

如需新增一个环境（如 `stg`）：

1. 在 `.env` 中添加：`VITE_REQUEST_BASEURL_STG = 'https://xxxstg.xxx.com/'`
2. 在 `.env.development` 中修改：`VITE_REQUEST_ENV='stg'`（如需默认走该环境）

## 5. 架构设计

### 路由与认证

```
用户访问页面
    |
w-router 路由拦截器
    |
检查是否在白名单中 ---> 是 -> 放行
    v 否
检查登录状态（Storage 中的 Authorization）
    |
已登录 -> 放行    未登录 -> 跳转登录页
```

- **路由库**：`w-router`（uni_modules 集成），支持拦截器机制
- **白名单**：`src/router/whiteList.js`，支持字符串和正则匹配
- **登录判断**：`src/auth/user.js`，通过 `Storage.getItem('Authorization')` 判断

### 请求封装

```
业务代码调用 API
    |
uni.$uv.http（uv-ui 请求库）
    |
请求拦截器：注入 Authorization / 时间戳 / 版本号 / YApi Mock 标识
    |
发送请求（BaseURL 由 Pinia store 的 devEnv 动态决定）
    |
响应拦截器：状态码处理 / 401 自动跳转登录 / 错误消息提示
    |
返回业务数据
```

- **初始化**：`src/utils/request/index.js` -> `initRequest()`
- **拦截器**：`src/utils/request/interceptor.js`
- **状态码**：`src/utils/request/code.js`（HTTP 200/401，业务码 '1' = 成功）
- **H5 代理**：开发模式通过 `config/vite.dev.js` 配置代理转发

### 页面配置

采用声明式配置 + Vite 插件自动生成的方式：

```
src/config/pages.mjs（声明式配置）
    |
config/plugins/pages-json-generator.js（Vite 插件）
    |
src/pages.json（自动生成，无需手动修改）
```

- 支持条件编译（`#ifdef APP` 等条件编译）
- 文件变更时自动重新生成
- MD5 哈希缓存，避免无变更时重复写入

### 状态管理

使用 Pinia 管理全局状态：

| Store | 文件 | 说明 |
|-------|------|------|
| useAppStore | src/store/modules/app.js | 开发环境切换、应用主题、初始化页面 URL |
| useUserStore | src/store/modules/user.js | 用户登录/登出、用户信息、Token 管理 |

### 主题系统

支持多主题切换（blue / green / yellow），默认 green：

| 文件 | 说明 |
|------|------|
| src/style/theme-vars.js | 三套主题变量定义 |
| src/style/index.js | 主题切换逻辑（H5 用 CSS 变量，APP 用 webview evalJS） |
| src/uv.config.js | uv-ui 组件主题颜色配置 |
| uno.config.js | UnoCSS 主题色绑定 uv-ui CSS 变量 |

### Mock 数据

开发模式下自动启用 Mock（仅 H5 和小程序端，APP 端通过条件编译排除）：

| 文件 | 说明 |
|------|------|
| src/mock/mock.js | better-mock 适配层，兼容 H5 和微信小程序 |
| src/mock/api/ | 各模块 Mock 接口定义 |
| src/mock/index.js | Mock 入口，注册所有 Mock 模块 |

**新增 Mock 接口：**

1. 在 `src/mock/api/` 下新建文件（如 `order.js`）
2. 在文件中定义 Mock 规则
3. 在 `src/mock/index.js` 中导入并调用

## 6. 自定义 Hooks

项目内置了丰富的组合式函数，统一从 `@/composables` 导入：

```
import { useRequest, useRouter, useToggle } from '@/composables'
```

### 通用 Hooks

| Hook | 说明 | 典型用法 |
|------|------|---------|
| useDebounceFn | 防抖函数 | 搜索输入防抖 |
| useToggle | 布尔值切换 | 弹窗显示/隐藏 |
| useInterval | 定时器（自动清理） | 轮询数据 |
| useIntervalFn | 定时器函数 | 定时刷新 |
| useCountdown | 倒计时 | 验证码倒计时 |
| useRouter | 路由跳转封装 | 页面跳转 |
| useRequest | 请求封装（含分页） | 列表数据请求 |
| useStorage | 本地存储响应式封装 | 缓存用户偏好 |
| useScreenInfo | 屏幕尺寸信息 | 响应式布局 |
| useNodeBounding | 节点布局信息 | 元素尺寸监听 |
| useNetworkStatus | 网络状态监听 | 离线提示 |
| useGeolocation | 定位功能 | 获取当前位置 |
| useNow | 实时时间 | 时钟显示 |
| useMounted | 挂载状态 | 安全操作 DOM |
| useSupported | 功能支持检测 | API 兼容性检查 |
| useRafFn | requestAnimationFrame | 动画帧循环 |
| useDelayRef | 延迟响应式引用 | 延迟赋值 |
| refDebounced | 防抖响应式引用 | 输入值防抖 |
| useMergeModelValue | 合并 modelValue | 组件 v-model 封装 |
| useDynamicSlots | 动态插槽 | 条件渲染插槽 |
| usePageStore | 页面级存储 | 页面间数据传递 |
| useInvokeLoading | 带加载状态的调用 | 异步操作 loading |
| useDefineInvoke | 条件执行 | 满足条件后执行 |
| useMountedInvoke | 挂载后执行 | 初始化数据加载 |

### 应用级 Hooks

| Hook | 说明 | 典型用法 |
|------|------|---------|
| useInitApp | 应用初始化 | H5 端入口初始化（用户信息、日活、更新检测） |
| useTheme | 主题管理 | 切换/获取当前主题 |
| useProgramUpdate | 小程序更新检测 | 检测新版本并提示更新 |
| usePageTrack | 页面埋点追踪 | 自动上报页面访问 |

### 认证级 Hooks

| Hook | 说明 | 典型用法 |
|------|------|---------|
| useAuthInvoke | 登录后执行 | 需登录才能进行的操作，未登录弹窗提示 |
| useUserLoadedInvoke | 用户数据加载后执行 | 依赖用户信息的初始化 |

## 7. 业务组件

| 组件 | 说明 | 核心功能 |
|------|------|---------|
| PageContainer | 页面容器（核心组件） | 统一页面结构，集成 NavBar、骨架屏、Footer、Modal、DevEnv、主题、页面追踪 |
| ScrollPaging | 滚动分页 | 基于 z-paging，下拉刷新 + 触底加载 + 空状态 |
| Tabbar | 底部标签栏 | 自定义 TabBar，基于 uv-tabbar |
| NavBar | 自定义导航栏 | 基于_uv-navbar，支持菜单按钮避让 |
| Upload | 文件上传 | OSS 上传，支持图片/文件 |
| Charts | ECharts 图表 | 基于 lime-echart 封装 |
| AddressSelect | 地址选择器 | 省市区三级联动 |
| DatetimePicker | 日期时间选择 | 基于_uv-datetime-picker |
| Empty | 空状态 | 统一空状态展示 |
| DevEnv | 开发环境切换 | 仅开发模式显示，动态切换 API 环境 |
| MarkMap | 地图标记 | 地图标注展示 |
| Waterfall | 瀑布流 | 瀑布流布局 |
| WithPopup | 弹窗容器 | 通用弹窗封装，含 Header/Footer |
| TagInput | 标签输入 | 标签化输入 |
| Badge | 徽标 | 数字/红点徽标 |
| Card | 卡片 | 通用卡片容器 |
| NIcon | 图标 | 统一图标组件 |

## 8. 工具函数

| 模块 | 文件 | 说明 |
|------|------|------|
| 请求封装 | utils/request/ | 基于 uv-ui http 的请求封装，含拦截器和状态码处理 |
| 本地存储 | utils/Storage.js | UniStorage 类，封装 uni storage API，支持事件监听 |
| 事件总线 | utils/bus.js | EventBus，支持 on/off/emit/once/has/clear |
| 环境判断 | utils/is.js | isDevelopment / isProduction / isNvue / isTabBarPath 等 |
| 地图工具 | utils/map-tools.js | 坐标转换（WGS84<->GCJ02<->BD09）、距离计算 |
| 系统信息 | utils/sys.js | 菜单按钮布局、窗口信息 |
| 文件上传 | utils/uploadFile.js | OSS 文件上传（获取签名 -> 上传 -> 返回 URL） |
| 通用工具 | utils/utils.js | 30+ 工具函数（手机号加密、树操作、Base64 转换、安全 JSON 解析等） |
| UUID | utils/UUID.js | UUID 生成（v4 / randomString / timeBased） |
| 表单验证 | utils/validate.js | 15+ 验证函数（手机号 / URL / 邮箱 / IP / 身份证号 / IP 等） |
| 防抖过滤 | utils/filter.js | createFilterWrapper / debounceFilter |
| BindingX | utils/Bindingx.js | BindingX 动画类（手势/定时/滚动动画 |
| 数据分析 | utils/analytics/ | 埋点追踪器、日活上报、页面名称映射 |

## 9. 常见开发场景

### 9.1 新增页面

1. 在 `src/pages/` 下创建页面目录和 `.vue` 文件：

```
mkdir -p src/pages/order
touch src/pages/order/index.vue
```

2. 在 `src/config/pages.mjs` 中添加页面配置：

```
export const pageMap = [
  // ... 已有页面
  {
    path: 'pages/order/index',
    style: {
      navigationBarTitleText: '订单详情',
      navigationStyle: 'custom'
    }
  }
]
```

3. 构建时会自动生成 `pages.json`，无需手动修改

### 9.2 新增 API 接口

1. 在 `src/api/` 下新建或编辑接口文件：

```
// src/api/order.js
export const fetchOrderList = (params) =>
  uni.$uv.http.post('/zl/order/list', params)

export const fetchOrderDetail = (id) =>
  uni.$uv.http.post('/zl/order/detail', { id })
```

2. 在页面中使用：

```
import { fetchOrderList } from '@/api/order'

const { data, loading, refresh } = useRequest(fetchOrderList, { params: { page: 1 } })
```

### 9.3 新增 Pinia Store

1. 在 `src/store/modules/` 下新建 store 文件：

```
// src/store/modules/order.js
import { defineStore } from 'pinia'

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null
  }),
  actions: {
    setCurrentOrder(order) {
      this.currentOrder = order
    }
  }
})
```

2. 在 `src/store/index.js` 中导出：

```
export * from './modules/order.js'
```

### 9.4 新增业务组件

1. 在 `src/components/` 下创建组件目录：

```
mkdir -p src/components/OrderCard
touch src/components/OrderCard/index.vue
touch src/components/OrderCard/props.js
```

2. 编写组件代码，使用 uv-ui 组件库和 UnoCSS 原子类

3. 在页面中直接使用（easycom 自动注册）

### 9.5 新增 Mock 接口

1. 在 `src/mock/api/` 下新建 Mock 文件：

```
// src/mock/api/order.js
import Mock from '../mock'

export default function orderMock() {
  Mock.mock('/zl/order/list', 'post', {
    code: '1',
    data: {
      list: [...],
      total: 100
    }
  })
}
```

2. 在 `src/mock/index.js` 中注册：

```
import orderMock from './api/order'

export default function mock() {
  if (isDevelopment()) {
    // ... 已有注册已有 mock
    orderMock()
  }
}
```

### 9.6 配置路由白名单

编辑 `src/router/whiteList.js`：

```
export default [
  /\/pages\/error\/.+/gi,    // 正则匹配
  '/pages/login/index',       // 字符串精确匹配
  '/pages/order/preview'      // 新增白名单页面
]
```

### 9.7 切换主题

```
import { useTheme } from '@/composables'

const { setTheme, getCurrentTheme } = useTheme()

// 切换到蓝色主题
setTheme('blue')

// 获取当前主题
const current = getCurrentTheme() // 'blue' | 'green' | 'yellow'
```

## 10. 常见问题（FAQ）

### Q: 创建项目时提示"网络连接失败"

**A:** 脚手架通过 degit 从 GitHub 拉取模板，需要网络能访问 GitHub。解决方案：

1. 检查网络连接
2. 配置 Git 代理：`git config --global http.proxy http://proxy-server:port`
3. 使用 VPN 或加速器

### Q: 创建项目后 npm install 报错

**A:** 可能原因及解决方案：

1. **Node.js 版本过低**：确保 Node.js >= 18，运行 `node -v` 检查
2. **网络问题**：项目已配置 `.npmrc` 使用国内镜像源，如仍失败可尝试 `npm install --registry=https://registry.npmmirror.com/`

### Q: 微信小程序开发时如何调试

**A:**

1. 运行 `npm dev:mp-weixin`
2. 打开微信开发者工具
3. 导入项目目录：`dist/dev/mp-weixin`
4. 在微信开发者工具中进行调试

### Q: 如何切换 API 环境

**A:** 有两种方式：

1. **修改环境变量**：修改 `.env.development` 中的 `VITE_REQUEST_ENV` 值
2. **运行时切换**：H5 开发模式下，点击 `DevEnv` 组件动态切换（仅开发模式可见）

### Q: pages.json 被自动覆盖了

**A:** `pages.json` 是由 Vite 插件根据 `src/config/pages.mjs` 自动生成的，**不要手动修改**。如需调整页面配置，请修改 `src/config/pages.mjs`。

### Q: 如何新增 uv-ui 组件

**A:** uv-ui 组件通过 uni_modules 集成，已包含 60+ 常用组件。如需新增：

1. 从 [uv-ui 官网](https://www.uvui.cn/) 下载所需组件
2. 将组件目录放入 `src/uni_modules/` 下
3. 组件会自动注册，直接在页面中使用即可

### Q: UnoCSS 类名在小程序端不生效

**A:** 确保使用的是 `@uni-helper/unocss-preset-uni` 预设（已在 `uno.config.js` 中配置），该预设专门适配了 uni-app 小程序端的限制。部分在小程序端不支持的写法请参考 [unocss-preset-uni 文档](https://github.com/unocss/unocss)。

### Q: 如何关闭 Mock

**A:** Mock 仅在开发模式且非 APP 端生效。如需关闭：

1. 注释 `src/main.js` 中的 `mock()` 调用
2. 或删除 `src/mock/api/` 下对应的 Mock 文件

### Q: 项目名称格式要求

**A:** 项目名称必须为 **kebab-case** 格式，规则如下：

- 只能包含小写字母、数字和连字符（`-`）
- 必须以小写字母开头
- 连字符不能连续出现
- 不能以连字符结尾

合法示例：`my-app`、`scms-mobile`、`order-system-v2`

不合法示例：`MyApp`、`my_app`、`-my-app`、`my--app`

**文档维护**：如发现文档内容与实际不符，请联系脚手架维护者更新。

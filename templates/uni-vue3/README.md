# 供应链Microapps项目说明

相关技术uniapp、vue@^3.5.20、pinia@^3.0.3、lodash@^4.17.21、vite@5.2.8、uv-ui@^1.1.20、sass

node版本支持：

```json
	"engines": {
		"node": ">=18",
		"pnpm": ">=9"
	}
```

该项目优先支持App、微信小程序，[uniapp官方文档](https://uniapp.dcloud.net.cn/)，[微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html)

## 项目结构

```
./
├─.env.local							环境变量，配置当前接口开发环境，生产打包需手动调整
├─.prettierignore						prettier忽略设置
├─eslint.config.mjs						eslint配置，里面有常用配置都有注释，文档地址（https://eslint.org/docs/latest/rules/）
├─index.html							vite入口文件
├─jsconfig.json							jsconfig.json项目js配置文件
├─package.json							package.json 依赖文件
├─prettier.config.mjs					prettier配置文件，文档地址（https://prettier.io/）
├─vite.config.js						vite配置文件，引用config下的配置，文档地址（https://cn.vitejs.dev/guide/）
├─src									开发目录
|  ├─App.vue							应用配置，用来配置App全局样式以及监听
|  ├─main.js							Vue初始化入口文件
|  ├─manifest.json						配置应用名称、appid、logo、版本等打包信息
|  ├─pages.json							配置页面路由、导航条、选项卡等页面类信息
|  ├─uv.config.js						uv-ui全局配置（https://www.uvui.cn/components/common.html）
|  ├─uni.scss							内置的常用样式变量，三方组件主题变量引入
|  ├─utils								通用封装函数目录
|  |   ├─is.js							常用的类型判断函数
|  |   ├─utils.js						常用封装函数
|  |   ├─validate.js					字符串正则校验
|  |   ├─request						统一request封装，使用luch-request（https://www.quanzhan.co/luch-request/guide/3.x/）
|  |   |    ├─index.js					request统一导出文件
|  |   |    └interceptor.js				请求拦截器
|  |   ├─Router							统一路由封装，在原基础上新增全局拦截器处理逻辑
|  |   |   ├─Intercept.js				路由拦截器处理逻辑
|  |   |   └index.js					项目路由跳转二次封装
|  ├─style								通用样式文件目录
|  |   └theme.scss						uvui主题scss
|  ├─store								pinia共享数据管理（https://pinia.web3doc.top/introduction.html）
|  ├─static								uniapp 资源存放目录，注意事项（https://uniapp.dcloud.net.cn/tutorial/project.html#static）
|  ├─router								路由业务封装（自定义全局路由拦截器等）
|  ├─pages								业务页面文件存放的目录
|  ├─hooks								vue3 hooks存放目录
|  ├─config								项目配置文件，包含请求地址的一些配置
|  ├─components							组件封装
|  |     ├─PageContainer				页面通用容器
|  ├─assets								自定义资源存放目录
|  ├─api								接口管理目录
├─config								vite配置项目录
├─__test__								单元测试，文档地址（https://vitest.zhcndoc.com/config/）
```

## 开发工具配置

推荐使用vscode开发 [下载地址](https://code.visualstudio.com/)

开发是建议创建.vscode来配置该项目编辑器配置。实例：

./.vscode/settings.json

```json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"prettier.configPath": "./prettier.config.mjs"
}
```

vscode需要安装的插件：eslint、prettier-eslint、prettier-vscode

```json
{
	"recommendations": [
		"dbaeumer.vscode-eslint",
		"rvest.vs-code-prettier-eslint",
		"esbenp.prettier-vscode"
	]
}
```

这是以vscode添加配置项，如果不是vscode请自行配置，已统一代码规范。

## 格式化script

npm start启动项目，将项目中dist/build/mp-weixin导入至微信开发者工具。vscode保存时即可按指定代码规则进行格式化，其他工具如果没配置可通过`npm run lint`检测代码规范性，通过执行`npm run lint:fix`或者`npm run format`将代码进行格式化。

## UI组件库

组件库文档 [ uv-ui](https://www.uvui.cn/)

## 主题配置

主题配置通过修改@/style/theme.scss变量进行控制，除app外可通过uv.config.js配置各组件默认样式配置进行调整，但需要注意uv.config.js 在app上无效，官方文档有提示，需要单独进行配置，全局扩展scss样式可在style中进行声明。

## uv.config.js

该配置项作用于uv-ui配置项，具体配置请[查看](https://www.uvui.cn/components/setting.html)，在APP中Props配置无效。

## 路由

@/router/index.js

路由跳转对uv-ui跳转进行了二次封装，扩展了全局拦截器，登录校验、全局权限校验可在这编写，具备拦截器请使用`intercept`[配置项](https://www.uvui.cn/js/route.html)使用方式如下：

```js
import Router from '@/utils/Router'
const router = new Router()

// 封装拦截器1
function loginIntercept(context, next) {
	console.log('这里是拦截器1')
	// 调用next，进入下一个拦截器，如果为最后一个拦截器，则触发回调
	next()
}

// 封装拦截器2
function authIntercept(_, next) {
	console.log('这里是拦截器2')
	next()
}

// 这里添加路由拦截器
router.interceptor.use(loginIntercept).use(authIntercept)

export default router
```

可通过`router.interceptor.use`添加多个拦截器。

## 网络

请求使用的uv-ui中集成的[luch-request](https://www.quanzhan.co/luch-request/)库，具体使用方式可查看[文档](https://www.uvui.cn/js/http.html)

## 共享数据管理Pinia

项目使用Pinia来创建共享数据管理，通过模块化对数据进行分割，在@/store中创建声明，具体使用请查看[官方文档](https://pinia.web3doc.top/introduction.html)

## 单元测试

项目集成了vitest支持对js函数进行单元测试，具体使用方式请查看[官方文档](https://vitest.zhcndoc.com/guide/why.html)，运行`npm run test`运行，通过运行`npm run coverage`可查看测试覆盖率。

```js
// 一个简单的实例
import { expect, describe, it } from 'vitest'
import { isEmpty } from 'lodash'
describe('test utils', () => {
	it('这是一个单元测试案例', () => {
		let res1 = isEmpty({})
		let res2 = isEmpty([])
		expect([res1, res2]).toEqual([true, true])
	})
})
```

输出结果：

```
stdout | __test__/case.test.js > test utils > 这是一个单元测试案例
 ✓ __test__/te.test.js (1 test) 2ms
   ✓ test utils > test isEmpty util 2ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  18:43:57
   Duration  685ms (transform 18ms, setup 57ms, collect 23ms, tests 2ms, environment 342ms, prepare 50ms)
```

##

### 简单使用

```js
import router from '@/router'

// 简单使用
router.to({url: '/pages/xxx/xxx'}) // 常规跳转
router.back({url: '/pages/xxx/xxx'}) // 返回
router.redirect({url: '/pages/xxx/xxx'}) // 重定向
router.tab({url: '/pages/xxx/xxx'}) // 跳转tabbar页面
router.launch({url: '/pages/xxx/xxx'}) // 关闭所有页面 跳转当前页
```

### router参数 params

```js
// 跳转带入参数params
router.to({ url: '/pages/xxx/xxx', params: 带入的数据 })

// 可通过useRouter获取，或者在onLoad中获取
const {params} = useRouter()

onLoad((options)=>{
    ....获取路由参数
})

// back中页可带入参数
router.back({ params: 带入的数据 })
// 获取back传的参数
// 在跳转时，通过events.onBack事件获取
router.to({
    url: '跳转的页面地址'，
    events:{
		onBack(params){
    		// 获取router.back 带入的参数
		}
	}
})
```

### router 带入数据data

```js
// 跳转带入参数data, router.tab, router.redirect, router.launch 中都能使用
router.to({
    url: '跳转的页面地址'，
    data: 带入的数据
})

// 可通过useRouter获取，或者在useRouter 返回的 onRouteData 中获取
const {data, onRouteData} = useRouter()

onRouteData((data)=>{
    ....获取路由数据
})

```

### 拦截器

通过router.interceptor.use可以使用自定义拦截器，全局生效

```js
import { isRegExp, isString } from 'lodash'
import whiteList from './whiteList'
import Router from '@/utils/Router'
import { useUserStore } from '@/store/modules/user'
const router = new Router()

/**
 * 白名单校验
 * @param {string} url 跳转路由地址
 * @returns
 */
export function validateWhiteList(url) {
	return whiteList.some((whiteUrlRule) => {
		if (isString(whiteUrlRule)) {
			return whiteUrlRule === url
		}
		if (isRegExp(whiteUrlRule)) {
			return whiteUrlRule.test(url)
		}
		return false
	})
}

function authIntercept({ router, options }, next) {
	if (validateWhiteList(options?.url)) {
		return next()
	}
	// 调用next，进入下一个拦截器，如果为最后一个拦截器，则触发回调
	if (options.isAuth && !useUserStore().isLogin) {
		return router.to({
			url: '/pages/login/index'
		})
	}

	next()
}

// 这里添加路由拦截器
router.interceptor.use(authIntercept)

export default router

```

### 调用时拦截

```js
router.to({
    url: '/pages/marketing/index',
    params: {
        layoutConfigId: linkValue
    },
    // 自定义调用时拦截，如果验证不通过则无法进行跳转
    async intercept(options, next) {
        let res = await fetchEnableMarketingPage({ pageidlist: [linkValue] })
        if (res.data?.includes?.(linkValue)) {
            next()
        } else {
            showToast({
                message: '页面未启用，请联系管理员进行配置！'
            })
        }
    }
})
```

### options.backOpenedPage 

```js
router.to({
    url: 'xxxxxx',
    backOpenedPage: true, // 如何当前页面已经打开 则返回到已打开页面，没有则进行跳转
})
```




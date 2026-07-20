import { isRegExp, isString } from 'lodash'
import whiteList from './whiteList'
import { Router } from '@/uni_modules/w-router'
import { isLogin } from '@/auth/user'
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
	if (!isLogin()) {
		return router.launch({
			url: '/pages/login/index'
		})
	}
	next()
}

// 这里添加路由拦截器
router.interceptor.use(authIntercept)

export default router

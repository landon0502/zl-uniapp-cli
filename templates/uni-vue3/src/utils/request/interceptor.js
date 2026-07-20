import { useUserStore } from '@/store/modules/user'
import { httpCodes, responseCodes } from './code'
import { validURL } from '@/utils/validate'
import { urls } from '@/config'
import { isDev } from '@/contants'
import { cloneDeep, isError, isUndefined } from 'lodash'
import router from '@/router'
/**
 * 错误请求消息处理
 * @param {*} respose
 * @returns
 */
function errorResponseMessageHandler(respose) {
	const { config, data } = respose
	const customConfig = config.custom ?? {}
	// 如果不存在错误消息
	if (!data.errorMsg) {
		return
	}
	/**
	 * 通用提示
	 * 所有sucess !== '1'的响应体都会走这里，如何后端返回的错误消息体存在差异需自行处理
	 */
	const showMessage =
		(customConfig.useMessage || isUndefined(customConfig.useMessage)) && data.errorMsg
	if (showMessage) {
		uni.showToast({ title: data.errorMsg, icon: 'none' })
	}
}

/**
 * 请求错误处理
 */
async function httpResponeErrorHandler(error) {
	if (isError(error)) {
		return Promise.reject(error)
	}
	const customConfig = error.config?.custom ?? {}
	// 请求状态!==200
	if (error.statusCode !== 200) {
		uni.showToast({
			title: '网络错误，请检查网络连接',
			icon: 'none'
		})
		return Promise.reject(error)
	}
	if (customConfig.raw_response) {
		return error
	}
	// 处理响应错误
	const { data } = error
	if (data.success === '1') {
		return error
	}

	if (data) {
		errorResponseMessageHandler(error)
		return Promise.reject(data)
	}
	return Promise.reject(error)
}
// 格式化请求地址，添加和去除/
function formatePath(path) {
	let returnPath = path
	if (!returnPath) return ''
	if (!returnPath.startsWith('/') && !validURL(returnPath)) {
		returnPath = '/' + returnPath
	}
	if (path.endsWith('/')) {
		returnPath = returnPath.slice(0, -1)
	}
	return returnPath
}

/**
 * 获取请求的地址, 判断开发者模式是否走的yapi
 * @param {*} config
 * @returns
 */
function requestConfigHandler(config) {
	config = cloneDeep(config)
	const custom = config.custom ?? {}

	if (config.url.startsWith('/mock/')) {
		config.baseURL = ''
	}
	let baseUrl = urls[custom.baseKey]
	/**
	 *  如果开发中存在YAPI_MOCK_ID 且设置了import.meta.env.VITE_YAPI_BASEURL
	 *  如果环境为yapi 或者config中存在YAPI_MOCK_ID 则使用yapi接口
	 */
	// 补全yapi地址
	if (import.meta.env.VITE_REQUEST_ENV === 'yapi' || custom.YAPI_MOCK_ID || custom.USE_YAPI) {
		config.url = [
			baseUrl ?? (isDev ? '' : import.meta.env.VITE_REQUEST_BASEURL_YAPI),
			'/mock/',
			custom.YAPI_MOCK_ID || import.meta.env.VITE_DEFAULT_YAPI_MOCK_ID,
			config.url
		]
			.filter(Boolean)
			.map(formatePath)
			.join('')
	}

	if (baseUrl && baseUrl !== config.baseURL) {
		config.baseURL = baseUrl
	}

	// 处理代理前缀，如果存在 config.proxyPrefixKey, 生产环境需去掉
	if (custom.proxyPrefixKey) {
		if (isDev) {
			config.url = [
				config.url.startsWith(custom.proxyPrefixKey) ? '' : custom.proxyPrefixKey,
				config.url
			]
				.map(formatePath)
				.join('')
		}
	}
	// 如果是第三方接口，在开发中使用proxy代理，这里将baseUrl重置为空，生产环境直接使用
	// #ifdef H5
	if (isDev && custom.raw_response) {
		config.baseURL = ''
	}
	// #endif
	return config
}

/**
 * 请求拦截器
 * @param {*} config
 * @returns
 */
function request(config) {
	config.data = config.data ?? {}
	config.data['_t'] = Date.now()
	config = requestConfigHandler(config)
	// #ifdef APP
	plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
		config.data['app_version'] = widgetInfo.version
	})
	// #endif
	config.header['auth'] = uni.getStorageSync('Authorization') || ''
	return config
}

/**
 * 响应拦截器
 * @param {*} res
 * @returns
 */
function response(res) {
	const customConfig = res.config?.custom ?? {}
	if (customConfig.raw_response) {
		return res
	}

	const userStore = useUserStore()
	if (res.statusCode === httpCodes.SUCCESS && res.data) {
		if (res.data.success === responseCodes.SUCCESS) {
			return res.data
		}

		switch (res.data.errorCode) {
			case 401:
				// 未授权，跳转到登录页
				// toLogin();
				break
			case 100001:
				// token 过期
				userStore.clearUserInfo()
				// 登录过期 跳转登录页
				return router.launch({
					url: '/pages/login/index'
				})
			default:
				// 请求错误, 服务业务错误
				uni.showToast({ title: res.errorMsg, icon: 'none' })
		}
		httpResponeErrorHandler(res)
		return Promise.reject(res.data)
	} else if (res.statusCode === httpCodes.UNAUTHORIZED) {
		userStore.clearUserInfo()
		return Promise.reject(res.data)
	}
	return Promise.reject(res.data)
}

export default {
	request,
	response: [
		response,
		(err) => {
			return httpResponeErrorHandler(err)
		}
	]
}

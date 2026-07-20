import RouterIntercept from './Intercept'
import UvRouter from '@/uni_modules/uv-ui-tools/libs/util/route'
import { getHistoryPage, pages } from '@/uni_modules/uv-ui-tools/libs/function'
import { isNull, isUndefined, findLastIndex, isEmpty, isFunction } from 'lodash'
import { getPageId } from '../utils'
import { isTabBarPath, isUndef } from '../is'
import RouteDataPipeline from './RouteDataPipeline'
import RouterEvents from './RouterEvents'
export const onRouteParamsEventKey = 'onRouteParams'
export const onRouteDataEventKey = 'onRouteData'
/**
 * 返回事件，可获取返回页面带入的参数
 */
export const onRouteParamsOnBackEvtKey = 'onBack'

const uvRoute = new UvRouter().route

/**
 * 路由统一处理
 * @typedef {{onBackPress: Function}} RouteOptions
 */
export default class Router {
	interceptor = new RouterIntercept()
	routerEvents = new RouterEvents()
	dataPipeline = new RouteDataPipeline()
	constructor() {
		uni.addInterceptor('navigateBack', {
			invoke: () => {
				this.dataPipeline.remove(this.addRootPath(getHistoryPage(0).route))
			}
		})
	}
	// 判断url前面是否有"/"，如果没有则加上，否则无法跳转
	addRootPath(url) {
		if (isUndef(url)) return ''
		return url[0] === '/' ? url : `/${url}`
	}
	getNavigatorUrl(fullUrl) {
		if (isUndef(fullUrl)) return ''
		return fullUrl.split('?')[0]
	}
	/**
	 * 获取路由event bus 事件名
	 * @param {*} eventName
	 * @param {*} url
	 * @returns
	 */
	getUniEventNameByRouterUrl = (eventName, url) => {
		return `${eventName}[${this.addRootPath(url)}]`
	}
	/**
	 * getOpenerEventChannel处理
	 */
	onRouteChannelHandler({ url, data, params }) {
		const instance = getHistoryPage(0)
		if (!instance) return
		let channal = instance.getOpenerEventChannel()
		if (!isUndefined(params) && !isNull(params)) {
			if (url && isTabBarPath(url)) {
				uni.$emit(this.getUniEventNameByRouterUrl(onRouteParamsEventKey, url), params)
			} else {
				channal?.emit?.(onRouteParamsEventKey, params)
			}
		}
		if (!isUndefined(data) && !isNull(data)) {
			if (url && isTabBarPath(url)) {
				uni.$emit(this.getUniEventNameByRouterUrl(onRouteDataEventKey, url), data)
			} else {
				channal?.emit?.(onRouteDataEventKey, data)
			}
		}
	}
	/**
	 * 处理onRouteParams事件
	 * @param {*} options
	 */
	routeHandler(options) {
		this.onRouteChannelHandler(options)
		uvRoute(options)
	}
	/**
	 * 处理事件监听
	 */
	addRouterParamsEvent(options) {
		let events = options.events
		Reflect.deleteProperty(options, 'events')
		if (isEmpty(events)) {
			return
		}
		this.routerEvents.add(getPageId(), events)
	}
	/**
	 * 处理data 缓存
	 */
	handleRouterDataCache({ navUrl, params, data, type, delta, backOpenedPage }) {
		// 路由行为是tab、launch时，清除所有缓存
		if (['tab', 'launch'].includes(type)) {
			this.dataPipeline.clear()
		}
		const from = getHistoryPage(0)
		/**
		 * 清除卸载页面的数据缓存
		 */
		// 路由行为是redirec、back时 清除当前页面缓存
		if (type === 'redirect' && this.dataPipeline.has(this.addRootPath(from?.route))) {
			this.dataPipeline.remove(this.addRootPath(from?.route))
		}
		if (type === 'back') {
			let removeCacheIds = pages()
				.slice(-delta)
				.map((item) => this.addRootPath(item.route))
			removeCacheIds.forEach((id) => {
				this.dataPipeline.remove(id)
			})
		}
		if (type !== 'back') {
			let historys = pages()
			let index = findLastIndex(historys, ({ route }) => this.addRootPath(route) === navUrl)
			if (backOpenedPage && index > -1) {
				return
			}
			// 注册即将去的页面数据缓存上下文
			this.dataPipeline.create({
				from: this.addRootPath(from?.route),
				to: navUrl,
				params: params,
				data: data
			})
		}
	}
	/**
	 * 路由统一处理
	 * @param {RouteOptions} options
	 */
	route(options) {
		let url = this.addRootPath(this.getNavigatorUrl(options.url))
		this.handleRouterDataCache({ ...options, navUrl: url })
		// 返回最后一个已打开的页面
		if (options.backOpenedPage) {
			let historys = pages(),
				len = historys.length
			let index = findLastIndex(historys, ({ route }) => this.addRootPath(route) === url)
			// 如果该页面已打开，则进行返回
			if (index > -1 && len > 1) {
				let delta = len - index - 1
				if (delta > 0) {
					this.back({
						...options,
						delta
					})
					return this
				}
			}
		}
		let customIntercept = options.intercept
		Reflect.deleteProperty(options, 'intercept')
		// 进行路由拦截
		this.interceptor.execute({
			context: {
				router: this,
				options: { ...options, url },
				from: getHistoryPage(0)
			},
			// 可通过函数进行判断
			notIntercept: isFunction(options?.notIntercept)
				? options.notIntercept()
				: options?.notIntercept,
			// 自定义路由拦截
			customIntercept,
			// 通过拦截 执行跳转
			finalHandler: () => {
				this.routeHandler(options)
			}
		})
		return this
	}
	/**
	 * 获取data缓存
	 */
	getPrevRouterDataCache() {
		let currentPage = getHistoryPage()
		if (!currentPage) return null
		return this.dataPipeline.get(this.addRootPath(currentPage.route))
	}
	/**
	 * @param {RouteOptions} options
	 */
	to(options) {
		this.addRouterParamsEvent(options)
		this.route({
			...options,
			type: 'to'
		})
	}
	/**
	 * @param {RouteOptions} options
	 */
	redirect(options) {
		this.addRouterParamsEvent(options)
		this.route({
			...options,
			type: 'redirect'
		})
	}
	/**
	 * @param {RouteOptions} options
	 */
	tab(options) {
		this.route({
			...options,
			type: 'tab'
		})
	}
	/**
	 * @param {RouteOptions} options
	 */
	launch(options) {
		this.route({
			...options,
			type: 'launch'
		})
	}
	/**
	 * @param {RouteOptions} options
	 */
	back(options = {}) {
		let delta = options?.delta ?? 1
		let backPage = getHistoryPage(-delta)
		this.routeHandler({
			notIntercept: true,
			...options,
			type: 'back',
			success: () => {
				options?.success?.()

				if (options.params) {
					this.routerEvents.invoke(getPageId(backPage), onRouteParamsOnBackEvtKey, options.params)
				}
			}
		})
	}
}

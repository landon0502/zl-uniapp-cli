import { isFunction } from 'lodash'

/**
 * 路由拦截器（仿洋葱模式）
 */
export default class RouterIntercept {
	constructor() {
		this.interceptors = []
	}
	/**
	 * 添加拦截器
	 * @param {function} intercept
	 * @returns
	 */
	use(intercept) {
		if (typeof intercept !== 'function') {
			throw new Error('Middleware must be a function!')
		}
		this.interceptors.push(intercept)
		return this // 支持链式调用
	}

	/**
	 * 执行所有拦截器
	 * @param {object} context 路由参数和实例
	 * @param {function} finalHandler 所有拦截器通过后的回调
	 * @param {boolean} notIntercept 不进行拦截
	 * @returns
	 */
	async execute({ context, finalHandler, notIntercept, customIntercept }) {
		// 不进行拦截
		if (notIntercept) {
			return finalHandler(context)
		}
		const interceptors = this.interceptors.slice() // 复制一份
		let index = 0
		if (isFunction(customIntercept)) {
			interceptors.unshift(customIntercept)
		}
		// 递归执行拦截器的核心函数
		const dispatch = async (i) => {
			if (i < index) {
				throw new Error('next() called multiple times')
			}

			index = i

			let fn = interceptors[i]
			if (i === interceptors.length) {
				fn = finalHandler // 最后一个执行最终的处理器
			}
			if (!fn) {
				return
			}

			// 执行拦截器，并传入 context 和 next 函数
			// next 函数就是 dispatch(i + 1)，即调用下一个中间件
			return fn(context, dispatch.bind(null, i + 1))
		}

		// 从第一个拦截器开始执行
		return dispatch(0)
	}
}

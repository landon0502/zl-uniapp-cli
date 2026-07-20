/**
 * ScrollPaging 组件事件上下文
 * 提供事件总线和事件处理机制
 */
import { EventBus } from '@/utils/bus'
import { noop } from 'lodash'

/** 加载事件 */
export const ON_LOAD = 'onLoad'
/** 刷新事件 */
export const ON_REFRESH = 'onRefresh'
/** 滑动到底部事件 */
export const ON_SCROLL_TOLOWER = 'onScrollToLower'
/** 加载更多事件 */
export const ON_LOAD_MORE = 'onLoadMore'

/** 刷新状态配置 */
export const defaultRefreshStatusTextConfig = {
	allow: '松开立即刷新',
	not: '继续下拉刷新',
	complete: '刷新完成',
	fail: '请求失败'
}

/**
 * 获取事件名称
 * @param {string} event - 事件类型
 * @param {string} key - 组件唯一标识
 * @returns {Object} 事件名称对象
 */
function getEventNames(event, key) {
	return {
		event: event + '_' + key, // 触发事件名称
		endEvent: event + '__cap' + '_' + key // 结束事件名称
	}
}

/**
 * 分页组件钩子事件类
 * 用于处理组件间的事件通信
 */
export class HooksEvents {
	events = new EventBus()

	/**
	 * 构造函数
	 * @param {Object} options - 配置选项
	 * @param {EventBus} options.events - 事件总线实例
	 */
	constructor(options) {
		if (options.events) {
			this.events = options.events
		}
	}

	/**
	 * 触发一个事件，接受一个相应回调
	 * @param {Object} params - 参数
	 * @param {string} params.key - 组件唯一标识
	 * @param {string} params.eventName - 事件名称
	 * @param {Function} params.callback - 回调函数
	 * @param {Function} params.onError - 错误处理函数
	 */
	trigger({ key, eventName, callback = noop, onError = noop }) {
		const { event, endEvent } = getEventNames(eventName, key)

		// 监听结束事件
		this.events.$once(endEvent, async (...args) => {
			try {
				await callback(...args)
			} catch (error) {
				onError(error)
			}
		})

		// 触发事件
		this.events.$emit(event)
	}

	/**
	 * 捕获一个事件，并在callback执行完成后响应回去
	 * @param {Object} params - 参数
	 * @param {string} params.key - 组件唯一标识
	 * @param {string} params.eventName - 事件名称
	 * @param {Function} params.callback - 回调函数
	 * @param {Function} params.predicate - 条件函数
	 * @param {Function} params.onError - 错误处理函数
	 */
	async cap({
		key,
		eventName,
		callback = noop,
		predicate = () => Promise.resolve(true),
		onError = noop
	}) {
		const { event, endEvent } = getEventNames(eventName, key)

		// 监听事件
		this.events.$on(event, async (params) => {
			try {
				// 检查是否允许执行
				let isAllow = await predicate()
				if (isAllow) {
					// 执行回调并触发结束事件
					let res = await callback(params)
					this.events.$emit(endEvent, res)
				}
			} catch (error) {
				onError(error)
			}
		})
	}

	/**
	 * 清除当前组件所有监听事件
	 * @param {string} key - 组件唯一标识
	 */
	clear(key) {
		if (!key) return

		// 清除刷新事件
		let refreshEvent = getEventNames(ON_REFRESH, key)
		this.events.$off(refreshEvent.event)
		this.events.$off(refreshEvent.endEvent)

		// 清除滚动到底部事件
		let scrollTolowerEvent = getEventNames(ON_SCROLL_TOLOWER, key)
		this.events.$off(scrollTolowerEvent.event)
		this.events.$off(scrollTolowerEvent.endEvent)

		// 清除加载更多事件
		let loadMoreEvent = getEventNames(ON_LOAD_MORE, key)
		this.events.$off(loadMoreEvent.event)
		this.events.$off(loadMoreEvent.endEvent)
	}
}

/** 滚动分页钩子事件实例 */
export const scrollPagingHooksEvents = new HooksEvents({ events: new EventBus() })

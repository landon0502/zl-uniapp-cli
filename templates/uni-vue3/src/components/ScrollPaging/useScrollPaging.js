/**
 * 滚动分页组合式 API
 * 用于处理 ScrollPaging 组件的逻辑
 */
import { unref, ref, watchEffect } from 'vue'
import { useDebounceFn, useDefineInvoke, useMergeModelValue, useToggle } from '@/composables'
import {
	ON_LOAD,
	ON_LOAD_MORE,
	ON_REFRESH,
	ON_SCROLL_TOLOWER,
	scrollPagingHooksEvents
} from './context'
import { sleep } from '@/uni_modules/uv-ui-tools/libs/function'
import { isUndef } from '@/utils/is'

/**
 * 滚动分页组合式 API
 * @param {Ref<HTMLElement>} target - 目标组件引用
 * @param {Object} options - 配置选项
 * @param {Function} options.onRefresh - 刷新回调
 * @param {Function} options.onScrolltolower - 滚动到底部回调
 * @param {Function} options.onLoad - 加载回调
 * @param {Function} options.onLoadMore - 加载更多回调
 * @param {Ref<boolean>} options.notMore - 是否没有更多数据
 * @param {Ref<Array>} options.data - 数据
 * @returns {Object} 分页操作方法
 */
export default function useScrollPaging(target, options = {}) {
	const [isLoadMore, toggleLoadMoreState] = useToggle(false)
	const { onRefresh, onScrolltolower, onLoad, onLoadMore, notMore, data: pagedData } = options
	const invoke = useDefineInvoke(() => target.value)
	const data = useMergeModelValue(() => unref(pagedData), {
		defaultValue: []
	})
	const completedFlag = ref(false)

	/**
	 * 设置没有更多数据状态
	 * @returns {Promise} 操作结果
	 */
	const nomore = async () => {
		await sleep(100)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).nomore(), { success: resolve, fail: reject })
		})
	}

	/**
	 * 加载数据
	 * @returns {Promise} 操作结果
	 */
	const load = async () => {
		await sleep(100)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).load(), { success: resolve, fail: reject })
		})
	}

	/**
	 * 刷新数据
	 * @returns {Promise} 操作结果
	 */
	const refresh = async () => {
		await sleep(100)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).refresh(), { success: resolve, fail: reject })
		})
	}

	/**
	 * 完成数据加载
	 * @param {Array} list - 数据列表
	 * @param {Object} options - 配置选项
	 * @returns {Promise} 操作结果
	 */
	const complete = async (list = unref(data), options) => {
		completedFlag.value = true
		if (isUndef(options?.notMore)) {
			options = Object.assign({}, options ?? {}, { notMore: unref(notMore) })
		}
		await sleep(50)
		return new Promise((resolve, reject) => {
			invoke(() => unref(target).complete(list, options), {
				success: resolve,
				fail: reject
			})
			completedFlag.value = false
		})
	}

	/**
	 * 设置强制显示空状态
	 * @param {Array} list - 数据列表
	 * @param {Object} options - 配置选项
	 * @returns {Promise} 操作结果
	 */
	const setForceShowEmptyStatus = (list = unref(data), options) => {
		return new Promise((resolve, reject) => {
			invoke(
				() => {
					return unref(target).setForceShowEmptyStatus(list, options)
				},
				{
					success: resolve,
					fail: reject
				}
			)
		})
	}

	/**
	 * 清除副作用
	 */
	const distory = () => {
		scrollPagingHooksEvents.clear(unref(target).scrollKey)
	}

	/**
	 * 自动完成处理
	 */
	const autoCompleteHandler = async () => {
		if (!completedFlag.value) {
			await complete()
		}
	}

	/**
	 * 初始化事件
	 */
	const initEvent = () => {
		distory()

		// 加载事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_LOAD,
			callback: async () => {
				await onLoad?.()
				await autoCompleteHandler()
			},
			onError() {
				return new Promise((resolve, reject) => {
					invoke(() => unref(target).onLoadError(), {
						success: resolve,
						fail: reject
					})
				})
			}
		})

		// 刷新事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_REFRESH,
			callback: async () => {
				await onRefresh?.()
				await autoCompleteHandler()
			},
			onError() {
				return new Promise((resolve, reject) => {
					invoke(() => unref(target).refreshErrorHandler('刷新失败'), {
						success: resolve,
						fail: reject
					})
				})
			}
		})

		// 滚动到底部事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_SCROLL_TOLOWER,
			callback: () => {
				return onScrolltolower?.()
			},
			predicate: () => {
				return !isLoadMore.value
			}
		})

		// 防抖处理加载更多
		const [loadMore] = useDebounceFn(async (params) => {
			try {
				toggleLoadMoreState(true)
				await onLoadMore?.(params)
				await autoCompleteHandler()
			} finally {
				toggleLoadMoreState(false)
			}
		}, 300)

		// 加载更多事件
		scrollPagingHooksEvents.cap({
			key: unref(target).scrollKey,
			eventName: ON_LOAD_MORE,
			callback: loadMore,
			predicate: () => {
				return !isLoadMore.value
			},
			onError() {
				return new Promise((resolve, reject) => {
					invoke(() => unref(target).loadmoreErrorHandler('加载更多失败'), {
						success: resolve,
						fail: reject
					})
				})
			}
		})
	}

	// 监听目标组件变化，初始化事件
	watchEffect(() => {
		if (target.value?.scrollKey) {
			invoke(initEvent)
		}
	})

	return {
		load,
		nomore,
		refresh,
		complete,
		data,
		distory,
		setForceShowEmptyStatus
	}
}

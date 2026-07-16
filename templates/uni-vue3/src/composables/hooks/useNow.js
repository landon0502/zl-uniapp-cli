import useIntervalFn from './useIntervalFn'
import { shallowRef } from 'vue'
import useRafFn from './useRafFn'

/**
 * 获取默认的调度器
 * @param {Object} options - 配置选项
 * @returns {Function} - 调度器函数
 */
function getDefaultScheduler(options) {
	if ('interval' in options || 'immediate' in options) {
		// #ifdef APP
		return (fn) => useIntervalFn(fn, interval, options)
		// #endif
		// #ifndef APP
		const { interval = 'requestAnimationFrame', immediate = true } = options

		return interval === 'requestAnimationFrame'
			? (fn) => useRafFn(fn, { immediate })
			: (fn) => useIntervalFn(fn, interval, options)
		// #endif
	}

	return useIntervalFn
}

/**
 * 创建一个响应式的当前日期实例
 *
 * @param {Object} [options={}] - 配置选项
 * @param {boolean} [options.controls=false] - 是否暴露控制方法
 * @param {Function} [options.scheduler] - 自定义调度器函数
 * @param {number|string} [options.interval='requestAnimationFrame'] - 更新间隔，'requestAnimationFrame' 表示使用 RAF
 * @param {boolean} [options.immediate=true] - 是否立即开始更新
 * @returns {Ref<Date>|Object} - 当 controls 为 false 时返回日期 ref，否则返回包含日期和控制方法的对象
 * @returns {Ref<Date>} returns.now - 当前日期
 * @returns {Function} returns.pause - 暂停更新
 * @returns {Function} returns.resume - 恢复更新
 * @returns {Ref<boolean>} returns.isActive - 是否正在更新
 *
 * @example
 * // 基本用法
 * const now = useNow()
 *
 * // 带控制方法的用法
 * const { now, pause, resume, isActive } = useNow({ controls: true })
 *
 * // 自定义更新间隔
 * const now = useNow({ interval: 1000 }) // 每秒更新一次
 *
 * // 使用 requestAnimationFrame
 * const now = useNow({ interval: 'requestAnimationFrame' }) // 每帧更新
 */
export default function useNow(options = {}) {
	const { controls: exposeControls = false, scheduler = getDefaultScheduler(options) } = options

	// 存储当前日期
	const now = shallowRef(new Date())

	// 更新日期的函数
	const update = () => (now.value = new Date())

	// 使用调度器更新日期
	const controls = scheduler(update)

	// 根据是否需要暴露控制方法返回不同的结果
	if (exposeControls) {
		return {
			now,
			...controls
		}
	}
	return now
}

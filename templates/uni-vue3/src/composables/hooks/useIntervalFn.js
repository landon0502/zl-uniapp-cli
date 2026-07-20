import { isRef, shallowReadonly, shallowRef, toValue, watch } from 'vue'
import { tryOnScopeDispose } from '../'

/**
 * 创建一个带有控制方法的 setInterval 包装器
 *
 * @param {Function} cb - 要执行的回调函数
 * @param {number|Ref<number>|Function} [interval=1000] - 时间间隔（毫秒）
 * @param {Object} [options={}] - 配置选项
 * @param {boolean} [options.immediate=true] - 是否立即开始执行
 * @param {boolean} [options.immediateCallback=false] - 是否在开始时立即执行回调
 * @returns {Object} - 包含控制方法的对象
 * @returns {Ref<boolean>} returns.isActive - 是否正在执行
 * @returns {Function} returns.pause - 暂停执行
 * @returns {Function} returns.resume - 恢复执行
 *
 * @example
 * // 基本用法
 * const { isActive, pause, resume } = useIntervalFn(() => {
 *   console.log('Interval executed!')
 * }, 1000)
 *
 * // 带选项的用法
 * const { isActive, pause, resume } = useIntervalFn(() => {
 *   console.log('Interval executed!')
 * }, 1000, {
 *   immediate: false, // 不立即开始
 *   immediateCallback: true // 开始时立即执行一次
 * })
 *
 * // 响应式时间间隔
 * const interval = ref(1000)
 * const { isActive, pause, resume } = useIntervalFn(() => {
 *   console.log('Interval executed!')
 * }, interval)
 *
 * // 手动控制
 * pause() // 暂停执行
 * resume() // 恢复执行
 */
export default function useIntervalFn(cb, interval = 1000, options = {}) {
	const { immediate = true, immediateCallback = false } = options

	// 存储定时器 ID
	let timer = null
	// 执行状态
	const isActive = shallowRef(false)

	/**
	 * 清理定时器
	 */
	function clean() {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	}

	/**
	 * 暂停执行
	 */
	function pause() {
		isActive.value = false
		clean()
	}

	/**
	 * 恢复执行
	 */
	function resume() {
		// 获取时间间隔值
		const intervalValue = toValue(interval)
		// 如果时间间隔小于等于 0，则不执行
		if (intervalValue <= 0) return

		// 设置为活跃状态
		isActive.value = true

		// 如果需要立即执行回调
		if (immediateCallback) cb()

		// 清理之前的定时器
		clean()

		// 如果仍然是活跃状态，则创建新的定时器
		if (isActive.value) timer = setInterval(cb, intervalValue)
	}

	// 如果需要立即开始执行
	if (immediate) resume()

	// 如果时间间隔是响应式的或函数，则监听其变化
	if (isRef(interval) || typeof interval === 'function') {
		const stopWatch = watch(interval, () => {
			// 当时间间隔变化时，如果当前是活跃状态，则重新开始
			if (isActive.value) resume()
		})
		// 在作用域销毁时停止监听
		tryOnScopeDispose(stopWatch)
	}

	// 在作用域销毁时暂停执行
	tryOnScopeDispose(pause)

	// 返回控制对象
	return {
		isActive: shallowReadonly(isActive), // 只读的执行状态
		pause, // 暂停方法
		resume // 恢复方法
	}
}

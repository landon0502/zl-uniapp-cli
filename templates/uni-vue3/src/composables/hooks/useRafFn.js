import tryOnScopeDispose from '../shared/tryOnScopeDispose'
import { computed, readonly, shallowRef, toValue } from 'vue'

/**
 * 在每个 requestAnimationFrame 调用函数，带有暂停和恢复控制
 *
 * @param {Function} fn - 要执行的函数，接收 { delta, timestamp } 参数
 * @param {Object} [options={}] - 配置选项
 * @param {boolean} [options.immediate=true] - 是否立即开始执行
 * @param {number|null} [options.fpsLimit=null] - FPS 限制，null 表示无限制
 * @param {Object} [options.global=window] - 全局对象，用于调用 requestAnimationFrame
 * @param {boolean} [options.once=false] - 是否只执行一次
 * @returns {Object} - 控制对象
 * @returns {Ref<boolean>} returns.isActive - 是否正在执行
 * @returns {Function} returns.pause - 暂停执行
 * @returns {Function} returns.resume - 恢复执行
 *
 * @example
 * // 基本用法
 * const { isActive, pause, resume } = useRafFn(({ delta, timestamp }) => {
 *   console.log('Frame:', timestamp, 'Delta:', delta)
 * })
 *
 * // 带 FPS 限制
 * const { isActive, pause, resume } = useRafFn(({ delta, timestamp }) => {
 *   console.log('Frame:', timestamp)
 * }, {
 *   fpsLimit: 60 // 限制为 60 FPS
 * })
 *
 * // 只执行一次
 * const { isActive, resume } = useRafFn(({ delta, timestamp }) => {
 *   console.log('只执行一次')
 * }, {
 *   immediate: false,
 *   once: true
 * })
 *
 * // 手动控制
 * resume() // 开始执行
 * pause() // 暂停执行
 */
export default function useRafFn(fn, options = {}) {
	const { immediate = true, fpsLimit = null, global = window, once = false } = options

	// 执行状态
	const isActive = shallowRef(false)
	// 计算 FPS 限制对应的时间间隔
	const intervalLimit = computed(() => {
		const limit = toValue(fpsLimit)
		return limit ? 1000 / limit : null
	})
	// 上一帧的时间戳
	let previousFrameTimestamp = 0
	// requestAnimationFrame 的 ID
	let rafId = null

	/**
	 * 动画循环函数
	 * @param {number} timestamp - 时间戳
	 */
	function loop(timestamp) {
		if (!isActive.value || !global) return

		if (!previousFrameTimestamp) previousFrameTimestamp = timestamp

		const delta = timestamp - previousFrameTimestamp

		// 检查是否达到 FPS 限制
		if (intervalLimit.value && delta < intervalLimit.value) {
			rafId = global.requestAnimationFrame(loop)
			return
		}

		previousFrameTimestamp = timestamp
		// 执行回调函数
		fn({ delta, timestamp })
		// 如果只执行一次，则停止
		if (once) {
			isActive.value = false
			rafId = null
			return
		}
		// 继续下一帧
		rafId = window.requestAnimationFrame(loop)
	}

	/**
	 * 恢复执行
	 */
	function resume() {
		if (!isActive.value && window) {
			isActive.value = true
			previousFrameTimestamp = 0
			rafId = window.requestAnimationFrame(loop)
		}
	}

	/**
	 * 暂停执行
	 */
	function pause() {
		isActive.value = false
		if (rafId !== null && window) {
			window.cancelAnimationFrame(rafId)
			rafId = null
		}
	}

	// 如果需要立即执行
	if (immediate) resume()

	// 在作用域销毁时暂停
	tryOnScopeDispose(pause)

	// 返回控制对象
	return {
		isActive: readonly(isActive),
		pause,
		resume
	}
}

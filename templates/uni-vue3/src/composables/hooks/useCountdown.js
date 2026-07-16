import useIntervalFn from './useIntervalFn'
import { ref, toValue } from 'vue'

/**
 * 创建一个倒计时器
 *
 * @param {number|Ref<number>} initialCountdown - 初始倒计时秒数
 * @param {Object} [options={}] - 配置选项
 * @param {number} [options.interval=1000] - 倒计时间隔（毫秒）
 * @param {boolean} [options.immediate=false] - 是否立即开始倒计时
 * @param {Function} [options.onTick] - 每次倒计时 tick 时的回调函数
 * @param {Function} [options.onComplete] - 倒计时完成时的回调函数
 * @returns {Object} - 倒计时控制器
 * @returns {Ref<number>} returns.remaining - 剩余倒计时秒数
 * @returns {Function} returns.reset - 重置倒计时
 * @returns {Function} returns.stop - 停止并重置倒计时
 * @returns {Function} returns.start - 开始或重新开始倒计时
 * @returns {Function} returns.pause - 暂停倒计时
 * @returns {Function} returns.resume - 恢复倒计时
 * @returns {Ref<boolean>} returns.isActive - 倒计时是否活跃
 *
 * @example
 * // 基本用法
 * const { remaining, start, pause, reset } = useCountdown(60)
 *
 * // 带回调的用法
 * const { remaining, start } = useCountdown(10, {
 *   onTick: () => console.log('Tick!'),
 *   onComplete: () => console.log('Countdown finished!')
 * })
 *
 * // 自定义间隔
 * const { remaining, start } = useCountdown(60, {
 *   interval: 500 // 每500毫秒更新一次
 * })
 */
export default function useCountdown(initialCountdown, options) {
	// 存储剩余倒计时秒数的响应式变量
	const remaining = ref(toValue(initialCountdown))

	// 创建一个区间函数控制器，用于管理倒计时
	const intervalController = useIntervalFn(
		() => {
			// 每次 tick 减少 1 秒
			const value = remaining.value - 1
			// 确保值不会小于 0
			remaining.value = value < 0 ? 0 : value
			// 调用 tick 回调
			options?.onTick?.()
			// 当倒计时结束时
			if (remaining.value <= 0) {
				// 暂停倒计时
				intervalController.pause()
				// 调用完成回调
				options?.onComplete?.()
			}
		},
		// 倒计时间隔，默认为 1000 毫秒
		options?.interval ?? 1000,
		// 配置是否立即执行
		{ immediate: options?.immediate ?? false }
	)

	/**
	 * 重置倒计时
	 * @param {number|Ref<number>} [countdown] - 新的倒计时秒数，不传则使用初始值
	 */
	const reset = (countdown) => {
		remaining.value = toValue(countdown) ?? toValue(initialCountdown)
	}

	/**
	 * 停止并重置倒计时
	 */
	const stop = () => {
		// 暂停倒计时
		intervalController.pause()
		// 重置倒计时
		reset()
	}

	/**
	 * 恢复倒计时
	 */
	const resume = () => {
		// 只有当倒计时不活跃且剩余时间大于 0 时才恢复
		if (!intervalController.isActive.value) {
			if (remaining.value > 0) {
				intervalController.resume()
			}
		}
	}

	/**
	 * 开始或重新开始倒计时
	 * @param {number|Ref<number>} [countdown] - 新的倒计时秒数，不传则使用初始值
	 */
	const start = (countdown) => {
		// 重置倒计时
		reset(countdown)
		// 开始倒计时
		intervalController.resume()
	}

	// 返回倒计时控制器对象
	return {
		remaining,
		reset,
		stop,
		start,
		pause: intervalController.pause,
		resume,
		isActive: intervalController.isActive
	}
}

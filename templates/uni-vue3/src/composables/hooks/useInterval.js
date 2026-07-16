import { shallowReadonly, shallowRef } from 'vue'
import useIntervalFn from './useIntervalFn'

/**
 * 创建一个响应式计数器，在每个时间间隔递增
 *
 * @param {number} [interval=1000] - 时间间隔（毫秒）
 * @param {Object} [options={}] - 配置选项
 * @param {boolean} [options.controls=false] - 是否暴露控制方法
 * @param {boolean} [options.immediate=true] - 是否立即开始计数
 * @param {Function} [options.callback] - 每次计数时的回调函数
 * @returns {Ref<number>|Object} - 当 controls 为 false 时返回计数器 ref，否则返回包含计数器和控制方法的对象
 * @returns {Ref<number>} returns.counter - 计数器值
 * @returns {Function} returns.reset - 重置计数器
 * @returns {Function} returns.pause - 暂停计数
 * @returns {Function} returns.resume - 恢复计数
 * @returns {Ref<boolean>} returns.isActive - 是否正在计数
 *
 * @example
 * // 基本用法
 * const counter = useInterval(1000) // 每秒递增
 *
 * // 带回调的用法
 * const counter = useInterval(1000, {
 *   callback: (count) => {
 *     console.log('当前计数:', count)
 *   }
 * })
 *
 * // 带控制方法的用法
 * const { counter, reset, pause, resume, isActive } = useInterval(1000, {
 *   controls: true
 * })
 *
 * // 手动控制
 * reset() // 重置计数器
 * pause() // 暂停计数
 * resume() // 恢复计数
 */
export default function useInterval(interval = 1000, options = {}) {
	const { controls: exposeControls = false, immediate = true, callback } = options

	// 创建计数器 ref
	const counter = shallowRef(0)

	// 更新计数器的函数
	const update = () => (counter.value += 1)

	// 重置计数器的函数
	const reset = () => {
		counter.value = 0
	}

	// 创建定时器控制对象
	const controls = useIntervalFn(
		// 如果提供了回调函数，则在更新计数器后调用回调
		callback
			? () => {
					update()
					callback(counter.value)
				}
			: update, // 否则只更新计数器
		interval, // 时间间隔
		{ immediate } // 是否立即开始
	)

	// 根据是否需要暴露控制方法返回不同的结果
	if (exposeControls) {
		return {
			counter: shallowReadonly(counter), // 只读的计数器
			reset, // 重置方法
			...controls // 控制方法（pause, resume, isActive）
		}
	}

	// 直接返回只读的计数器
	return shallowReadonly(counter)
}

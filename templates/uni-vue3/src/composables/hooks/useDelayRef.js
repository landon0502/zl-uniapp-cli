import { noop } from 'lodash'
import { customRef, toValue } from 'vue'

/**
 * 创建一个带有延迟设置功能的 ref
 *
 * @param {any|Ref} initialValue - 初始值
 * @param {Object} [options={}] - 配置选项
 * @param {number} [options.delay=300] - 延迟时间（毫秒）
 * @param {Function} [options.ignoreFilter=() => true] - 过滤函数，返回 true 时不延迟设置
 * @param {Function} [options.get=noop] - 获取值时的回调函数
 * @param {Function} [options.set=noop] - 设置值时的回调函数
 * @param {Function} [options.onBeforeSet=noop] - 设置值前的回调函数
 * @returns {Ref} - 带有延迟设置功能的 ref
 *
 * @example
 * // 基本用法
 * const delayedRef = useDelayRef('initial')
 *
 * // 带延迟时间
 * const delayedRef = useDelayRef('initial', {
 *   delay: 500 // 500毫秒延迟
 * })
 *
 * // 带过滤函数
 * const delayedRef = useDelayRef('initial', {
 *   // 只有当值长度大于3时才延迟
 *   ignoreFilter: (value) => value.length <= 3
 * })
 *
 * // 带回调函数
 * const delayedRef = useDelayRef('initial', {
 *   get: (value) => console.log('Getting:', value),
 *   set: (value) => console.log('Setting:', value),
 *   onBeforeSet: (value) => console.log('Before setting:', value)
 * })
 */
export default function useDelayRef(initialValue, options = {}) {
	const {
		delay = 300, // 延迟时间，默认300毫秒
		ignoreFilter = () => true, // 过滤函数，默认返回true（不延迟）
		get = noop, // 获取值时的回调
		set = noop, // 设置值时的回调
		onBeforeSet = noop // 设置值前的回调
	} = options

	// 存储当前值
	let value = toValue(initialValue)
	// 存储定时器
	let timer = null

	// 创建自定义 ref
	return customRef((track, trigger) => {
		return {
			/**
			 * 获取值
			 * @returns {any} - 当前值
			 */
			get() {
				// 跟踪依赖
				track()
				// 调用获取值的回调
				get(value)
				// 返回当前值
				return value
			},
			/**
			 * 设置值
			 * @param {any} newValue - 新值
			 */
			set(newValue) {
				// 调用设置值前的回调
				onBeforeSet(newValue)
				// 调用设置值的回调
				set(newValue)
				// 检查是否需要延迟
				if (ignoreFilter(newValue)) {
					// 不需要延迟，立即设置值
					value = newValue
					// 触发依赖更新
					trigger()
				} else {
					// 清除之前的定时器
					clearTimeout(timer)
					// 创建新的定时器，延迟设置值
					timer = setTimeout(() => {
						value = newValue
						// 触发依赖更新
						trigger()
					}, delay)
				}
			}
		}
	})
}

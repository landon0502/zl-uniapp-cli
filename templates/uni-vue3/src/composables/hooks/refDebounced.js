import { ref as deepRef, shallowReadonly, toValue, watch } from 'vue'
import useDebounceFn from './useDebounceFn'
import { isFunction, omit } from 'lodash'

/**
 * 创建一个带有防抖功能的 ref
 *
 * @param {Ref|any} value - 原始的响应式值或普通值
 * @param {number} [ms=200] - 防抖延迟时间（毫秒）
 * @param {Object} [options={}] - 配置选项
 * @param {Function} [options.delayUpdateRule] - 控制是否需要防抖的规则函数
 * @param {boolean} [options.immediate=false] - 是否立即执行
 * @param {boolean} [options.leading=false] - 是否在延迟开始前执行
 * @param {boolean} [options.trailing=true] - 是否在延迟结束后执行
 * @returns {Ref} - 一个只读的防抖 ref
 *
 * @example
 * // 基本用法
 * const searchQuery = ref('')
 * const debouncedQuery = refDebounced(searchQuery, 300)
 *
 * // 带延迟规则
 * const inputValue = ref('')
 * const debouncedValue = refDebounced(inputValue, 300, {
 *   delayUpdateRule: (value) => value.length > 2 // 只有当长度大于2时才防抖
 * })
 */
export default function refDebounced(value, ms = 200, options = {}) {
	// 创建一个深度响应式的 ref 来存储防抖后的值
	const debounced = deepRef(toValue(value))

	// 创建一个防抖函数用于更新 debounced 值
	const [updater] = useDebounceFn(
		() => {
			// 将原始 ref 的值赋给 debounced ref
			debounced.value = value.value
		},
		ms,
		// 移除 delayUpdateRule 选项，因为它只用于当前函数
		omit(options, ['delayUpdateRule'])
	)

	// 监听原始值的变化
	watch(value, (newValue) => {
		// 检查是否需要应用防抖规则
		if (
			// 如果没有提供 delayUpdateRule 函数
			!isFunction(options.delayUpdateRule) ||
			// 或者提供了函数且返回 true（需要防抖）
			(isFunction(options.delayUpdateRule) && options.delayUpdateRule(newValue))
		) {
			// 调用防抖函数
			updater()
		} else {
			// 不需要防抖，直接更新值
			debounced.value = newValue
		}
	})

	// 返回一个只读的 debounced ref
	return shallowReadonly(debounced)
}

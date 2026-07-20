import { isRef, shallowRef, toValue } from 'vue'

/**
 * 创建一个带有切换功能的布尔值 ref
 *
 * @param {boolean|Ref<boolean>} [initialValue=false] - 初始值
 * @param {Object} [options={}] - 配置选项
 * @param {any} [options.truthyValue=true] - 真值
 * @param {any} [options.falsyValue=false] - 假值
 * @returns {Array|Function} - 当 initialValue 是 ref 时返回切换函数，否则返回 [ref, 切换函数]
 * @returns {Ref<boolean>} returns[0] - 布尔值 ref
 * @returns {Function} returns[1] - 切换函数
 *
 * @example
 * // 基本用法
 * const [value, toggle] = useToggle(false)
 *
 * // 切换值
 * toggle() // true
 * toggle() // false
 *
 * // 直接设置值
 * toggle(true) // true
 * toggle(false) // false
 *
 * // 自定义真值和假值
 * const [value, toggle] = useToggle('off', {
 *   truthyValue: 'on',
 *   falsyValue: 'off'
 * })
 *
 * toggle() // 'on'
 * toggle() // 'off'
 *
 * // 使用 ref 作为初始值
 * const initialValue = ref(false)
 * const toggle = useToggle(initialValue)
 *
 * toggle() // 会更新 initialValue
 */
export default function useToggle(initialValue = false, options = {}) {
	const { truthyValue = true, falsyValue = false } = options

	// 检查初始值是否是 ref
	const valueIsRef = isRef(initialValue)
	// 创建一个浅响应式的 ref
	const _value = shallowRef(initialValue)

	/**
	 * 切换值
	 * @param {boolean} [value] - 可选，直接设置值
	 * @returns {boolean} - 切换后的值
	 */
	function toggle(value) {
		// 如果提供了参数，则直接设置值
		if (arguments.length) {
			_value.value = value
			return _value.value
		}
		// 否则切换值
		const truthy = toValue(truthyValue)
		_value.value = _value.value === truthy ? toValue(falsyValue) : truthy
		return _value.value
	}

	// 如果初始值是 ref，只返回切换函数
	if (valueIsRef) return toggle
	// 否则返回 [ref, 切换函数]
	return [_value, toggle]
}

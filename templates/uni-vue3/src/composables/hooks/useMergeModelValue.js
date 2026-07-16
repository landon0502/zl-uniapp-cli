import { isObject, isUndefined } from 'lodash'
import { customRef, toValue, watch } from 'vue'
import useDelayRef from './useDelayRef'

/**
 * 合并 modelValue，解决组件中可控和不可控两种情况
 *
 * @param {Ref|any} modelValue - 组件的 modelValue
 * @param {Object} [options={}] - 配置选项
 * @param {any} [options.defaultValue] - 默认值，当 modelValue 为空时使用
 * @param {Function} [options.get] - 获取值时触发的回调函数
 * @param {Function} [options.set] - 设置值时触发的回调函数
 * @param {Function} [options.onBeforeSet] - 每次设置值前触发的回调函数
 * @param {Function} [options.ignoreDelayFilter=() => true] - 忽略延迟的过滤函数
 * @param {number} [options.delay=0] - 延迟时间（毫秒）
 * @param {boolean} [options.deep=false] - 是否深度监听 modelValue 的变化
 * @param {boolean} [options.onceWatch=false] - 是否只监听一次 modelValue 的变化
 * @returns {Ref} - 合并后的响应式值
 *
 * @example
 * // 基本用法
 * const props = defineProps({
 *   modelValue: {
 *     type: String,
 *     default: ''
 *   }
 * })
 * const emit = defineEmits(['update:modelValue'])
 *
 * const value = useMergeModelValue(props.modelValue, {
 *   set: (val) => emit('update:modelValue', val)
 * })
 *
 * // 带默认值的用法
 * const value = useMergeModelValue(props.modelValue, {
 *   defaultValue: 'default',
 *   set: (val) => emit('update:modelValue', val)
 * })
 *
 * // 带延迟的用法
 * const value = useMergeModelValue(props.modelValue, {
 *   delay: 300,
 *   ignoreDelayFilter: (val) => val.length <= 2,
 *   set: (val) => emit('update:modelValue', val)
 * })
 */
export default function useMergeModelValue(modelValue, options = {}) {
	if (!isUndefined(options) && !isObject(options))
		throw new Error(`The options parameter should be an object, currently an ${typeof options}!`)
	const { ignoreDelayFilter = () => true, delay = 0 } = options
	const _value = useDelayRef(toValue(modelValue) ?? options?.defaultValue, {
		ignoreFilter: ignoreDelayFilter,
		delay
	})
	watch(
		() => toValue(modelValue),
		(newVal) => {
			options?.onBeforeSet?.(newVal)
			_value.value = newVal
		},
		{ deep: options?.deep, once: options?.onceWatch }
	)

	return customRef((track, trigger) => {
		return {
			get() {
				track()
				options?.get?.(_value.value)
				return _value.value
			},
			set(newValue) {
				options.onBeforeSet?.(newValue)
				_value.value = newValue
				trigger()
				options?.set?.(_value.value)
			}
		}
	})
}

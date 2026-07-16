import { noop } from 'lodash'
import useDefineInvoke from './useDefineInvoke'
import { onMounted, ref } from 'vue'

/**
 * 创建一个函数，当组件挂载后才执行回调
 *
 * @returns {Function} - 一个函数，调用时会在组件挂载后执行传入的回调
 *
 * @example
 * // 基本用法
 * const mountedInvoke = useMountedInvoke()
 *
 * // 调用函数，会在组件挂载后执行回调
 * mountedInvoke(() => {
 *   console.log('组件已挂载，执行回调')
 * })
 *
 * // 多次调用
 * mountedInvoke(() => {
 *   console.log('第一个回调')
 * })
 *
 * mountedInvoke(() => {
 *   console.log('第二个回调')
 * })
 */
export default function useMountedInvoke() {
	// 存储组件的挂载状态
	const isMounted = ref(false)

	// 创建一个条件执行函数，当 isMounted 为 true 时执行回调
	const invoke = useDefineInvoke(isMounted)

	// 在组件挂载时设置 isMounted 为 true
	onMounted(() => {
		isMounted.value = true
	})

	// 返回一个函数，调用时会在组件挂载后执行传入的回调
	return (cb = noop) => {
		invoke(() => cb())
	}
}

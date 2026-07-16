import { isPromise } from '@/utils/is'
import { ref } from 'vue'

/**
 * 为函数调用添加加载状态
 *
 * @param {Function} fn - 要执行的函数
 * @returns {Object} - 包含执行函数和加载状态的对象
 * @returns {Function} returns.run - 执行函数的方法
 * @returns {Ref<boolean>} returns.loading - 加载状态
 *
 * @example
 * // 基本用法
 * const { run, loading } = useInvokeLoading(async () => {
 *   // 异步操作
 *   await new Promise(resolve => setTimeout(resolve, 1000))
 *   return 'success'
 * })
 *
 * // 执行函数
 * const result = await run()
 *
 * // 在模板中使用加载状态
 * <template>
 *   <button @click="run" :disabled="loading">
 *     {{ loading ? '加载中...' : '执行' }}
 *   </button>
 * </template>
 *
 * // 带参数的用法
 * const { run, loading } = useInvokeLoading(async (id) => {
 *   const response = await fetch(`/api/item/${id}`)
 *   return response.json()
 * })
 *
 * // 执行带参数的函数
 * const item = await run(123)
 */
export default function useInvokeLoading(fn) {
	// 加载状态
	const loading = ref(false)

	/**
	 * 执行函数并管理加载状态
	 * @param {...any} args - 传递给函数的参数
	 * @returns {any} - 函数的返回值
	 */
	const run = (...args) => {
		// 设置加载状态为 true
		loading.value = true
		// 执行函数
		let res = fn(...args)
		// 检查返回值是否为 Promise
		if (isPromise(res)) {
			// 如果是 Promise，在 finally 中设置加载状态为 false
			res.finally(() => {
				loading.value = false
			})
		} else {
			// 如果不是 Promise，直接设置加载状态为 false
			loading.value = false
		}
		// 返回函数的返回值
		return res
	}

	// 返回执行函数和加载状态
	return { run, loading }
}

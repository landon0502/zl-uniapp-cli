import { getCurrentScope, onScopeDispose } from 'vue'

/**
 * 在 effect scope 生命周期内调用 onScopeDispose()，如果不在则不做任何操作
 *
 * @param {Function} fn - 清理函数
 * @returns {boolean} - 是否成功注册了清理函数
 *
 * @example
 * // 基本用法
 * import tryOnScopeDispose from '@/composables/shared/tryOnScopeDispose'
 *
 * export default {
 *   setup() {
 *     // 创建一个定时器
 *     const timer = setInterval(() => {
 *       console.log('Hello')
 *     }, 1000)
 *
 *     // 注册清理函数
 *     tryOnScopeDispose(() => {
 *       clearInterval(timer)
 *     })
 *   }
 * }
 *
 * // 在自定义 hook 中使用
 * import tryOnScopeDispose from '@/composables/shared/tryOnScopeDispose'
 *
 * export function useTimer(callback, interval) {
 *   const timer = setInterval(callback, interval)
 *
 *   tryOnScopeDispose(() => {
 *     clearInterval(timer)
 *   })
 *
 *   return {
 *     timer
 *   }
 * }
 */
export default function tryOnScopeDispose(fn) {
	// 检查是否在 effect scope 中
	if (getCurrentScope()) {
		// 注册清理函数
		onScopeDispose(fn)
		return true
	}
	// 不在 effect scope 中，返回 false
	return false
}

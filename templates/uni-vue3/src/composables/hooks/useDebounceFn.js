import { noop } from 'lodash'
import { createFilterWrapper, debounceFilter } from '@/utils/filter'

/**
 * 创建一个带有防抖功能的函数
 *
 * @param {Function} [fn=noop] - 需要防抖执行的函数
 * @param {number} [ms=200] - 防抖延迟时间（毫秒），对于事件回调，通常使用 100-250 毫秒
 * @param {Object} [options={}] - 防抖选项
 * @param {boolean} [options.immediate=false] - 是否在延迟开始前立即执行函数
 * @param {boolean} [options.leading=false] - 是否在延迟开始前执行函数
 * @param {boolean} [options.trailing=true] - 是否在延迟结束后执行函数
 * @returns {Array} - 返回一个数组，包含防抖函数和取消函数
 * @returns {Function} returns[0] - 防抖处理后的函数
 * @returns {Function} returns[1] - 取消防抖的函数
 *
 * @example
 * // 基本用法
 * const [debouncedFn, cancel] = useDebounceFn(() => {
 *   console.log('Debounced!')
 * }, 300)
 *
 * // 带选项的用法
 * const [debouncedFn, cancel] = useDebounceFn(() => {
 *   console.log('Debounced!')
 * }, 300, {
 *   immediate: true, // 立即执行
 *   trailing: false // 不在延迟结束后执行
 * })
 *
 * // 取消防抖
 * cancel()
 */
export default function useDebounceFn(fn = noop, ms = 200, options = {}) {
	// 从 debounceFilter 获取过滤函数和取消函数
	let { filter, cancel } = debounceFilter(ms, options)
	// 创建并返回防抖函数和取消函数
	return [createFilterWrapper(filter, fn), cancel]
}

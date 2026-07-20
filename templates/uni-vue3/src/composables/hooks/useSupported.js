import { computed } from 'vue'
import useMounted from './useMounted'
import { isFunction } from 'lodash'

/**
 * 检查某个功能是否被支持
 *
 * @param {string|Function} check - 检查函数或要检查的功能名称
 * @returns {ComputedRef<boolean>} - 功能是否被支持的响应式值
 *
 * @example
 * // 检查 API 是否支持
 * const isGetLocationSupported = useSupported('getLocation')
 *
 * // 使用函数检查
 * const isFeatureSupported = useSupported(() => {
 *   return typeof window !== 'undefined' && 'someFeature' in window
 * })
 *
 * // 在模板中使用
 * <template>
 *   <div v-if="isGetLocationSupported">
 *     支持地理位置功能
 *   </div>
 *   <div v-else>
 *     不支持地理位置功能
 *   </div>
 * </template>
 */
export default function useSupported(check) {
	// 获取组件挂载状态
	const isMounted = useMounted()

	// 计算功能是否被支持
	return computed(() => {
		// 触发 ref 以确保响应式更新
		isMounted.value
		// 如果 check 是函数，则执行函数并返回结果
		if (isFunction(check)) {
			return check()
		}
		// 否则使用 uni.canIUse 检查功能是否支持
		return uni.canIUse(check)
	})
}

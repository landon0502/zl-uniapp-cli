import { setTheme } from '@/style'
import { computed, watch } from 'vue'
import { useMountedInvoke } from '@/composables'
import themes from '@/style/theme-vars'

/**
 * 主题相关的 hook
 *
 * @returns {Object} - 主题相关的状态
 * @returns {ComputedRef<Object>} returns.themeCSSVar - 主题 CSS 变量
 *
 * @example
 * // 在组件中使用
 * import useTheme from '@/composables/app/useTheme'
 *
 * export default {
 *   setup() {
 *     const { themeCSSVar } = useTheme()
 *
 *     return {
 *       themeCSSVar
 *     }
 *   }
 * }
 */
export default function useTheme() {
	// 组件挂载后执行的函数
	const mountedInvoke = useMountedInvoke()

	/**
	 * 主题名称
	 */
	const themeName = computed(() => {
		return 'green'
	})

	/**
	 * 主题 CSS 变量
	 */
	const themeCSSVar = computed(() => {
		return Object.entries(themes[themeName.value] ?? {}).reduce((acc, [key, color]) => {
			return {
				...acc,
				[`--${key}`]: color
			}
		}, {})
	})

	// 监听主题名称变化
	watch(
		themeName,
		(newVal) => {
			mountedInvoke(() => {
				if (newVal) {
					setTheme(newVal)
					getApp().globalData.theme = newVal
				}
			})
		},
		{
			immediate: true
		}
	)

	// 返回主题 CSS 变量
	return {
		themeCSSVar
	}
}

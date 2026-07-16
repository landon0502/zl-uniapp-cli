/**
 * 监听网络状态变化，当网络断开时显示提示
 *
 * @example
 * // 在组件中使用
 * import useNetworkStatus from '@/composables/hooks/useNetworkStatus'
 *
 * export default {
 *   setup() {
 *     // 初始化网络状态监听
 *     useNetworkStatus()
 *
 *     return {}
 *   }
 * }
 *
 * // 当网络断开时，会自动显示 "网络异常，请检查网络" 的提示
 */
export default function useNetworkStatus() {
	// 监听网络状态变化
	uni.onNetworkStatusChange(function (res) {
		// 当网络断开时
		if (!res.isConnected) {
			// 显示网络异常提示
			uni.showToast({
				title: '网络异常，请检查网络',
				icon: 'none'
			})
		}
	})
}

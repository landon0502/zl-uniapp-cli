import { onShow } from '@dcloudio/uni-app'
import { analytics } from '@/utils/analytics/AnalyticsTracker'
import { getHistoryPage } from '@/uni_modules/uv-ui-tools/libs/function'

/**
 * 上一个路由路径
 */
let lastRoute = ''

/**
 * 更新上一个路由路径
 * @param {string} route - 路由路径
 */
function updateRoute(route) {
	lastRoute = route
}

/**
 * 获取上一个路由路径
 * @returns {string} - 上一个路由路径
 */
function getLastRoute() {
	return lastRoute
}

/**
 * 页面访问跟踪的 hook
 *
 * @example
 * // 在页面组件中使用
 * import usePageTrack from '@/composables/app/usePageTrack'
 *
 * export default {
 *   setup() {
 *     usePageTrack()
 *   }
 * }
 */
export default function usePageTrack() {
	/**
	 * 跟踪页面进入
	 */
	function trackEnter() {
		// 获取当前页面信息
		const curPage = getHistoryPage()
		if (!curPage) return
		// 上报页面访问数据
		analytics.trackPageView({
			urlPath: curPage.route,
			referrer: getLastRoute(),
			extraInfo: curPage.options
		})
		// 更新上一个路由路径
		updateRoute(curPage.route)
	}

	// 页面显示时触发跟踪
	onShow(trackEnter)
}

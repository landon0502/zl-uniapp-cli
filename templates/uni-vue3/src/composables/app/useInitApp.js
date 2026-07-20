import { useUserStore, useAppStore } from '@/store'
import { useProgramUpdate, useToggle } from '@/composables'
import { onLaunch, onShow } from '@dcloudio/uni-app'
import router from '@/router'
import { isTabBarPath } from '@/utils/is'
import Dau from '@/utils/analytics/Dau'
import { nextTick } from 'vue'

/**
 * 应用初始化相关的 hook
 *
 * @returns {Object} - 应用初始化相关的状态
 * @returns {Ref<boolean>} returns.loading - 初始化加载状态
 *
 * @example
 * // 在 App.vue 中使用
 * import useInitApp from '@/composables/app/useInitApp'
 *
 * export default {
 *   setup() {
 *     const { loading } = useInitApp()
 *
 *     return {
 *       loading
 *     }
 *   }
 * }
 */
export default function useInitApp() {
	// 加载状态
	const [loading, setLoading] = useToggle(true)
	// 用户 store
	const userStore = useUserStore()
	// 应用 store
	const appStore = useAppStore()
	// 日活上报实例
	const dau = new Dau()

	/**
	 * 初始化用户信息
	 */
	const initUser = async () => {
		try {
			setLoading(true)
			// 并行获取用户信息和当前店铺代码
			await Promise.all([userStore.getUserInfo()])
			// #ifdef APP
			await nextTick()
			router[isTabBarPath(appStore.appInitedPageUrl) ? 'tab' : 'launch']({
				url: appStore.appInitedPageUrl
			})
			// #endif
		} catch {
			router.launch({
				url: '/pages/login/index'
			})
		} finally {
			setLoading(false)
		}
	}

	// 应用显示时触发
	onShow(() => {
		// #ifdef APP
		dau.reportDailyActive() // app中上报日活
		// #endif
		// 初始化用户信息
		initUser()
		// 检查应用更新
		useProgramUpdate({
			immutable: true
		})
	})

	// // 页面加载时触发
	// onLoad(() => {
	// 	initUser()
	// 	useProgramUpdate({
	// 		immutable: true
	// 	})
	// })

	// #ifdef H5
	// H5 平台应用启动时触发
	onLaunch(() => {
		initUser()
	})
	// #endif

	// 返回加载状态
	return {
		loading
	}
}

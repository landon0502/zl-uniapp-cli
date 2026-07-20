import router from '@/router'
import { onRouteParamsEventKey } from '@/uni_modules/w-router'
import { getHistoryPage, pages } from '@/uni_modules/uv-ui-tools/libs/function'
import { onLoad } from '@dcloudio/uni-app'
import { noop } from 'lodash'
import { computed, ref } from 'vue'
import useMountedInvoke from './useMountedInvoke'
import { isTabBarPath } from '@/utils/is'

/**
 * 路由相关的 hook，提供路由状态和事件处理
 *
 * @returns {Object} - 路由相关的状态和方法
 * @returns {Object} returns.router - 路由实例
 * @returns {Ref<Object>} returns.currentPage - 当前页面实例
 * @returns {Ref<Array>} returns.loadedPages - 已加载的页面列表
 * @returns {Ref<number>} returns.current - 当前页面在已加载页面列表中的索引
 * @returns {Ref<Object>} returns.params - 路由参数
 * @returns {Ref<Object>} returns.data - 路由数据
 * @returns {Function} returns.onRouteParams - 监听路由参数事件
 * @returns {Function} returns.onRouteData - 监听路由数据事件
 *
 * @example
 * // 基本用法
 * const { router, currentPage, params, data } = useRouter()
 *
 * // 监听路由参数事件
 * onRouteParams((params) => {
 *   console.log('路由参数:', params)
 * })
 *
 * // 使用路由实例
 * router.push('/pages/user/index')
 * router.back()
 */
export default function () {
	// 创建挂载后执行的函数
	const mountedInvoke = useMountedInvoke()

	// 路由参数
	const params = ref({})
	// 路由数据
	const routerData = ref(router.getPrevRouterDataCache()?.data)
	// 当前页面实例
	const currentPage = ref(getHistoryPage())
	// 已加载的页面列表
	const loadedPages = ref(pages())
	// 当前页面在已加载页面列表中的索引
	const current = computed(() => {
		return loadedPages.value.findIndex((page) => currentPage.value === page)
	})

	/**
	 * 监听路由参数事件
	 * @param {Function} [callback=noop] - 回调函数
	 */
	const onRouteParams = (callback = noop) => {
		mountedInvoke(() => {
			const channal = getHistoryPage().getOpenerEventChannel()
			// 在 tabbar 页面中使用 uni 事件，否则使用 channel 事件
			if (isTabBarPath(getHistoryPage().route)) {
				uni.$on(
					router.getUniEventNameByRouterUrl(onRouteParamsEventKey, currentPage.value.route),
					callback
				)
			} else {
				channal.on(onRouteParamsEventKey, callback)
			}
		})
	}

	// 页面加载时获取路由参数
	onLoad((options) => {
		params.value = options
	})

	// 返回路由相关的状态和方法
	return {
		router,
		currentPage,
		loadedPages,
		current,
		params,
		data: routerData,
		onRouteParams
	}
}

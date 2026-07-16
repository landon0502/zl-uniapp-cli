import { computed, ref } from 'vue'
import { getMenuButtonBoundingClientRect, getWindowInfo } from '@/utils/sys'
import { onResize, onShow } from '@dcloudio/uni-app'

/**
 * 获取屏幕信息的 hook
 *
 * @returns {ComputedRef<Object>} - 屏幕信息对象
 * @returns {number} returns.tabbarFixedHeight - 固定的 tabbar 高度
 * @returns {number} returns.navbarFixedHeight - 固定的 navbar 高度
 * @returns {number} returns.statusBarHeight - 状态栏高度
 * @returns {number} returns.navbarHegiht - navbar 总高度（固定高度 + 状态栏高度）
 * @returns {number} returns.safeAreaInsetBottom - 底部安全区域高度
 * @returns {number} returns.safeAreaInsetTop - 顶部安全区域高度
 * @returns {number} returns.tabbarHeight - tabbar 总高度（固定高度 + 底部安全区域高度）
 * @returns {number} returns.safeWidth - 屏幕宽度
 * @returns {number} returns.screenHeight - 屏幕高度
 * @returns {Object} returns.menuBtnRect - 菜单按钮的位置和大小信息
 * @returns {number} returns.windowWidth - 窗口宽度
 * @returns {number} returns.windowHeight - 窗口高度
 * @returns {Object} returns.safeArea - 安全区域信息
 * @returns {number} returns.pageContentHeight - 内容区高度
 * @returns {number} returns.safeAreaHeight - 安全区内容高度
 *
 * @example
 * // 基本用法
 * const screenInfo = useScreenInfo()
 *
 * // 在模板中使用
 * <template>
 *   <div :style="{ height: `${screenInfo.pageContentHeight}px` }">
 *     内容区域
 *   </div>
 * </template>
 *
 * // 在逻辑中使用
 * console.log('屏幕高度:', screenInfo.screenHeight)
 * console.log('状态栏高度:', screenInfo.statusBarHeight)
 * console.log('导航栏高度:', screenInfo.navbarHegiht)
 * console.log('TabBar高度:', screenInfo.tabbarHeight)
 */
export default function useScreenInfo() {
	// 固定的导航栏高度
	const navbarFixedHeight = 44
	// 固定的 tabbar 高度
	const tabbarFixedHeight = 50
	// 窗口信息
	const windowInfo = ref(getWindowInfo())

	// 计算屏幕信息
	let info = computed(() => {
		const {
			screenHeight,
			screenWidth,
			statusBarHeight,
			safeAreaInsets,
			windowWidth,
			windowHeight,
			safeArea
		} = windowInfo.value

		let data = {
			tabbarFixedHeight,
			navbarFixedHeight,
			statusBarHeight,
			navbarHegiht: navbarFixedHeight + statusBarHeight,
			safeAreaInsetBottom: safeAreaInsets.bottom,
			safeAreaInsetTop: safeAreaInsets.top,
			tabbarHeight: tabbarFixedHeight + safeAreaInsets.bottom,
			safeWidth: screenWidth,
			screenHeight,
			menuBtnRect: getMenuButtonBoundingClientRect(),
			windowWidth,
			windowHeight,
			safeArea
		}
		// 内容区高度
		data.pageContentHeight = screenHeight - data.navbarHegiht
		// 安全区内容高度
		data.safeAreaHeight = screenHeight - data.statusBarHeight - data.safeAreaInsetBottom
		return data
	})
	const update = () => {
		windowInfo.value = getWindowInfo()
	}
	// #ifndef H5
	// 在非 H5 环境下监听窗口大小变化和页面显示
	onResize(update)
	onShow(update)
	// #endif

	// #ifdef H5
	// 在 H5 环境下监听窗口大小变化
	window.addEventListener('resize', () => {
		windowInfo.value = getWindowInfo()
	})
	// #endif

	// 返回屏幕信息
	return info
}

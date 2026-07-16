import { pick } from 'lodash'

/**
 * 获取小程序胶囊按钮信息
 */
export function getMenuButtonBoundingClientRect() {
	// #ifdef APP || H5 || MP-LARK
	return {}
	// #endif
	return uni.canIUse('getMenuButtonBoundingClientRect') ? uni.getMenuButtonBoundingClientRect() : {}
}

/**
 * 获取屏幕尺寸
 */
export function getWindowInfo() {
	if (uni.canIUse('getWindowInfo')) {
		return uni.getWindowInfo()
	}
	let sys = uni.getSystemInfoSync()

	return pick(sys, [
		'pixelRatio',
		'safeArea',
		'safeAreaInsets',
		'screenHeight',
		'screenTop',
		'screenWidth',
		'statusBarHeight',
		'windowBottom',
		'windowHeight',
		'windowTop',
		'windowWidth'
	])
}
/**
 * plus.runtime.getProperty Api
 * @returns
 */
export function plusRuntimeGetProperty() {
	// #ifdef APP-PLUS
	return new Promise((resolve) => {
		plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
			resolve(wgtinfo)
		})
	})
	// #endif
}

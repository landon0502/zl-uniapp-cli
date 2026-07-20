import router from '@/router'
import { isUndefined, isNull, isObject, isFunction } from 'lodash'
import { globalConfig } from '@/config/pages'
/**
 * 是否是开发环境
 */
export function isDevelopment() {
	return import.meta.env.DEV
}

/**
 * 是否是生成环境
 */
export function isProduction() {
	return import.meta.env.PRO
}

/**
 * 是否为null 或者 undefined
 */
export function isUndef(value) {
	return isUndefined(value) || isNull(value)
}

/**
 * 是否是透明颜色
 * @param {string} color
 * @returns
 */
export function isTransparent(color) {
	if (!color) return true

	const colorStr = color.toLowerCase().trim()

	// 1. 检查 transparent 关键字
	if (colorStr === 'transparent') return true

	// 2. 检查 rgba 格式
	if (colorStr.startsWith('rgba')) {
		const rgbaMatch = colorStr.match(
			/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
		)
		if (rgbaMatch) {
			const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
			return alpha === 0
		}
	}

	// 3. 检查 hsla 格式
	if (colorStr.startsWith('hsla')) {
		const hslaMatch = colorStr.match(
			/hsla?\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)/
		)
		if (hslaMatch) {
			const alpha = hslaMatch[4] ? parseFloat(hslaMatch[4]) : 1
			return alpha === 0
		}
	}

	// 4. 检查 HEX 带透明度格式
	if (colorStr.startsWith('#')) {
		// #RRGGBBAA
		if (colorStr.length === 9) {
			const alphaHex = colorStr.slice(7, 9)
			const alpha = parseInt(alphaHex, 16) / 255
			return alpha === 0
		} else if (colorStr.length === 5) {
			// #RGBA
			const alphaHex = colorStr.slice(4, 5)
			const alpha = parseInt(alphaHex + alphaHex, 16) / 255
			return alpha === 0
		}
	}

	// 5. 检查 CSS 变量或其他格式
	return false
}

/**
 * 是否时tabBar页面
 */
export function isTabBarPath(path) {
	const tabbarPaths = globalConfig.tabBar.list
	return tabbarPaths.some((item) => router.addRootPath(item.pagePath) === router.addRootPath(path))
}

/**
 * 是否时promise
 * @param {*} val
 * @returns
 */
export function isPromise(val) {
	return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

/**
 * 判断是否为nvue
 * @returns
 */
export function isNvue() {
	return typeof weex !== 'undefined'
}

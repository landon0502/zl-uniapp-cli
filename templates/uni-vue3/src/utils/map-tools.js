import Decimal from 'decimal.js'
import { isUndef } from './is'
/**
 * 工具函数（判断中国大陆）
 * @param {*} lat
 * @param {*} lng
 * @returns
 */
export function outOfChina(lat, lng) {
	return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271
}

const PI = Math.PI
const a = 6378245.0
// eslint-disable-next-line no-loss-of-precision
const ee = 0.00669342162296594323

function transformLat(x, y) {
	let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
	ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
	ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0
	ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0
	return ret
}

function transformLng(x, y) {
	let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
	ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0
	ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0
	ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0
	return ret
}
/**
 * WGS84 → GCJ-02（最常用）
 */
export function wgs84ToGcj02(lat, lng) {
	if (outOfChina(lat, lng)) return { lat, lng }

	const dLat = transformLat(lng - 105.0, lat - 35.0)
	const dLng = transformLng(lng - 105.0, lat - 35.0)
	const radLat = (lat / 180.0) * PI

	let magic = Math.sin(radLat)
	magic = 1 - ee * magic * magic
	const sqrtMagic = Math.sqrt(magic)

	const mgLat = lat + (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * PI)
	const mgLng = lng + (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * PI)

	return { lat: mgLat, lng: mgLng }
}

/**
 * GCJ-02 → BD-09（百度用）
 * @param {*} lat
 * @param {*} lng
 * @returns
 */
export function gcj02ToBd09(lat, lng) {
	const x = lng
	const y = lat
	const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * PI)
	const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * PI)
	return {
		lat: z * Math.sin(theta) + 0.006,
		lng: z * Math.cos(theta) + 0.0065
	}
}

/**
 * 计算两个经纬度之间的距离
 * @param {number} lat1 纬度1
 * @param {number} lng1 经度1
 * @param {number} lat2 纬度2
 * @param {number} lng2 经度2
 * @param {number} radius 地球半径，默认 6378137 米
 * @returns {number} 距离（米）
 */
export function getDistance(location, target, radius = 6378137, precision = 2) {
	const toRad = (deg) => (deg * Math.PI) / 180
	if (isUndef(target) || isUndef(location)) return null
	const radLat1 = toRad(location.latitude)
	const radLat2 = toRad(target.latitude)
	const deltaLat = radLat1 - radLat2
	const deltaLng = toRad(location.longitude - target.longitude)

	const a =
		Math.sin(deltaLat / 2) ** 2 +
		Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLng / 2) ** 2

	const c = 2 * Math.asin(Math.sqrt(a))
	return new Decimal(radius).mul(c).toDecimalPlaces(precision).toNumber()
}

/**
 * 可以根据距离数值 动态判断单位：
 * 小于 1000 m → 用 m
 * 大于等于 1000 m → 转为 km
 * @param {*} distance
 * @returns
 */
export function formatDistance(distance) {
	if (!distance && distance !== 0) return ''

	if (distance < 1000) {
		return `${Math.round(distance)}m`
	}

	return `${(distance / 1000).toFixed(2)}km`
}

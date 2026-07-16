export const requestConfig = {
	baseUrl: '', // 请求的根域名
	// 默认的请求头
	header: {},
	method: 'POST',
	// 设置为json，返回后uni.request会对数据进行一次JSON.parse
	dataType: 'json',
	// 此参数无需处理，因为5+和支付宝小程序不支持，默认为text即可
	responseType: 'text',
	loadingTime: 800 // 在此时间内，请求还没回来的话，就显示加载中动画，单位ms
}

/**
 * 获取环境变量中的baseUrls
 * 环境变量中定义baseUrl请以BASEURL为结尾
 */
export function getEnvBaseUrls() {
	let baseUrls = {}
	const apiEnvPrefix = import.meta.env.VITE_REQUEST_FLAG
	const sliceEnvKey = (key) => key.replace(`VITE_${apiEnvPrefix}_`, '').toLocaleLowerCase()
	Object.entries(import.meta.env).forEach(([key, baseUrl]) => {
		if (key.includes(apiEnvPrefix)) {
			baseUrls[sliceEnvKey(key)] = baseUrl
		}
	})

	return baseUrls
}

export const urls = getEnvBaseUrls()

/**
 * 默认上传配置
 */
export const defaultUploadPayload = {
	syscode: 'SCMSV5AT_app',
	menupath: '/scmsv5at_app',
	businesstype: 'scmsv5at_app',
	validdate: '999',
	describe: '供应链助手'
}

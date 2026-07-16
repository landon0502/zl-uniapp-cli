/**
 * 获取oss token
 */
export function fetchOssToken(params) {
	return uni.$uv.http.post('/zl.bs.sc.oss.manage.common.postobjectpolicy.v5/1.0.0/action', params, {
		custom: {
			useMessage: true
		}
	})
}

// 获取详细地址信息
export function getAddressDetail({ latitude, longitude }) {
	return uni.$uv.http.get('/v3/geocode/regeo', {
		params: {
			location: `${longitude},${latitude}`,
			key: import.meta.env.VITE_AMAP_KEY,
			extensions: 'all' // 必须设置该参数以获取详细的行政区划信息
		},
		custom: {
			raw_response: true,
			baseKey: 'map',
			proxyPrefixKey: '/v3/geocode/regeo'
		}
	})
}

/**
 * 获取区县下属街道列表
 * @doc https://amap.apifox.cn/api-14621407
 */
export function getStreetsMaps(params) {
	return uni.$uv.http.get('/v3/config/district', {
		params: {
			output: 'JSON',
			extensions: 'base',
			...params,
			key: import.meta.env.VITE_AMAP_KEY
		},
		custom: {
			raw_response: true,
			baseKey: 'map'
		}
	})
}

/**
 * 获取区县下属街道列表
 */
export function getStreetsByDistrict({ districtCode }) {
	return uni.$uv.http.get('https://apis.map.qq.com/ws/district/v1/getchildren', {
		params: {
			id: districtCode,
			key: import.meta.env.VITE_QQ_MAP_KEY
		},
		custom: {
			raw_response: true
		}
	})
}

/**
 * 获取app更新详情
 */
export function fetchUpgradeDetection(params) {
	return uni.$uv.http.get('/zl.bs.chmsv5.yxAppManager.upgradeDetection.v5/1.0.0/action', {
		params
	})
}

/**
 * 获取当前运营平台的shopcode
 */
export const fetchCurrentShopCode = () =>
	uni.$uv.http.post('/zl.bs.sc.web.getShopCode.v5/1.0.0/action')

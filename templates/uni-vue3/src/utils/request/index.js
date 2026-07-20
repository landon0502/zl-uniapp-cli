import { isDev } from '@/contants'
import interceptor from './interceptor'
import { urls, requestConfig } from '@/config'
import { useAppStore } from '@/store'
export function initRequest() {
	const requestEnv = useAppStore().devEnv
	uni.$uv.http.setConfig((config) => {
		/* config 为默认全局配置*/
		// #ifdef H5
		config.baseURL = isDev ? '' : (urls[requestEnv] ?? '') /* 根域名 */
		// #endif
		// #ifndef H5
		config.baseURL = urls[requestEnv] ?? '' /* 根域名 */
		// #endif

		return { ...requestConfig, ...config }
	})
	uni.$uv.http.interceptors.request.use(interceptor.request)
	uni.$uv.http.interceptors.response.use(...interceptor.response)
}

import { mergeConfig, defineConfig, loadEnv } from 'vite'
import baseConfig from './vite.base'
function getProxy() {
	const env = loadEnv('development', process.cwd())
	function getEnvBaseUrls() {
		let baseUrls = {}
		const apiEnvPrefix = env.VITE_REQUEST_FLAG
		const sliceEnvKey = (key) => key.replace(`VITE_${apiEnvPrefix}_`, '').toLocaleLowerCase()
		Object.entries(env).forEach(([key, baseUrl]) => {
			if (key.includes(apiEnvPrefix)) {
				baseUrls[sliceEnvKey(key)] = baseUrl
			}
		})

		return baseUrls
	}

	const urls = getEnvBaseUrls()
	return {
		'/mock': {
			target: urls.yapi,
			changeOrigin: true,
			pathRewrite: {}
		},
		'/zl': {
			target: urls[env.VITE_REQUEST_ENV],
			changeOrigin: true,
			pathRewrite: {}
		},
		'/v3/geocode/regeo': {
			target: urls.map,
			changeOrigin: true
		},
		'/v3/config/district': {
			target: urls.map,
			changeOrigin: true
		}
	}
}

export default defineConfig(async (...args) => {
	let baseConf = await baseConfig(...args)
	return mergeConfig(baseConf, {
		build: {
			target: 'es6', // 根据你需要兼容的浏览器版本进行调整:cite[2]
			sourcemap: !['app-harmony', 'app'].includes(process.env.UNI_PLATFORM) // app端启用sourcemap
		},
		server: {
			host: true,
			proxy: getProxy()
		}
	})
})

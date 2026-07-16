import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './vite.base'
export default defineConfig(async (...args) => {
	let baseConf = await baseConfig(...args)
	return mergeConfig(baseConf, {
		build: {
			target: 'es6', // 根据你需要兼容的浏览器版本进行调整:cite[2]
			sourcemap: false,
			minify: 'terser',
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true
				}
			}
		}
	})
})

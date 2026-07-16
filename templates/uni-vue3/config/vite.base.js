import uni from '@dcloudio/vite-plugin-uni'
import eslintPlugin from 'vite-plugin-eslint' // 导入插件
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import pagesJsonGenerator from './plugins/pages-json-generator'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
	const UnoCSS = (await import('unocss/vite')).default
	const __filename = fileURLToPath(path.dirname(import.meta.url))
	const __dirname = path.dirname(__filename)
	return {
		envPrefix: 'VITE_',
		// 其他配置...
		define: {
			// 可以将环境变量定义为全局常量（注意序列化）
		},
		plugins: [
			pagesJsonGenerator({
				mapPath: 'src/config/pages.mjs',
				mode
			}),
			uni(),
			vueJsx({
				// options are passed on to @vitejs/plugin-vue-jsx
			}),
			UnoCSS({
				configFile: path.resolve(__dirname, './uno.config.js')
			}),
			eslintPlugin({
				include: ['src/**/*.js', 'src/**/*.vue', 'src/**/*.jsx'], // 检查的文件类型
				cache: false // 可根据需要启用缓存
			})
		],
		build: {
			target: 'es6' // 根据你需要兼容的浏览器版本进行调整:cite[2]
		}
	}
})

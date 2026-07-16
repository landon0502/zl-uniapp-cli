import * as Pinia from 'pinia'
import { defineThemeConfig } from './uv.config'
import { createSSRApp } from 'vue'
import App from './App.vue'
import uvUI from '@/uni_modules/uv-ui-tools'
import { initRequest } from '@/utils/request'
import { useNetworkStatus } from '@/composables'
// #ifndef APP
import mock from './mock'
// #endif
import 'virtual:uno.css'

const { createPinia } = Pinia
export function createApp() {
	const app = createSSRApp(App)
	app.use(uvUI)
	app.use(createPinia())
	defineThemeConfig()
	initRequest()
	useNetworkStatus()
	// #ifndef APP
	mock()
	// #endif
	return {
		app,
		Pinia
	}
}

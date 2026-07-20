import { defineStore } from 'pinia'
import { isDev } from '@/contants'
import Storage from '@/utils/Storage'
import router from '@/router'

const appStorage = new Storage()
const envStorageKey = '__CURRENT_DEV_ENV__'
export const useAppStore = defineStore('app', {
	state: () => ({
		devEnv:
			isDev || import.meta.env.VITE_REQUEST_ENV !== 'pro'
				? appStorage.getItem(envStorageKey) || import.meta.env.VITE_REQUEST_ENV
				: import.meta.env.VITE_REQUEST_ENV
	}),
	getters: {
		appTheme() {
			return 'green'
		},
		isDev() {
			return isDev
		},
		appInitedPageUrl() {
			return '/pages/index/index'
		}
	},
	actions: {
		setDevEnv(env) {
			appStorage.setItem(envStorageKey, env)
			this.devEnv = env
			router.launch({
				url: '/pages/login/index'
			})
		}
	}
})

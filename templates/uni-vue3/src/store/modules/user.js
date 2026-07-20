import { defineStore } from 'pinia'
import { login, getUser } from '@/api/user'
import Storage from '@/utils/Storage'
import router from '@/router'
const storage = new Storage()

export const useUserStore = defineStore('user', {
	state: () => ({
		userData: {},
		token: storage.getItem('Authorization')
	}),
	getters: {
		isLogin(state) {
			return !!state.token
		}
	},
	actions: {
		/**
		 * 设置token
		 * @param {*} token
		 */
		setToken(token) {
			this.token = token
			storage.setItem('Authorization', token)
		},

		// 登录
		async login(params) {
			let res = await login(params)
			this.setToken(res.data.token)
			await this.getUserInfo()
			return res
		},
		// 登出
		async loginOut() {
			this.clearUserInfo()
		},
		// 获取用户信息
		async getUserInfo() {
			if (!this.isLogin) {
				router.launch({
					url: '/pages/login/index'
				})
				return Promise.reject('未登录')
			}
			let res = await getUser()
			this.userData = res.data
			getApp().globalData.userinfo = this.userData
		},
		// 清除用户信息
		clearUserInfo() {
			this.userData = {}
			this.selectedRole = 0
			this.setToken(null)
			// 🌟 清空本地缓存
			getApp().globalData.userinfo = null
		}
	}
})

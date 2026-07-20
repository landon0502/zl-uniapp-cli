import { useDefineInvoke } from '@/composables'
import { useUserStore } from '@/store'
import { isEmpty, isFunction } from 'lodash'

/**
 * 用户数据加载完成后执行回调的 hook
 *
 * @returns {Function} - 返回一个函数，当用户数据加载完成后执行回调
 *
 * @example
 * // 基本用法
 * import useUserLoadedInvoke from '@/composables/auth/useUserLoadedInvoke'
 *
 * export default {
 *   setup() {
 *     const userLoadedInvoke = useUserLoadedInvoke()
 *
 *     // 当用户数据加载完成后执行
 *     userLoadedInvoke(async (userData) => {
 *       // 这里可以使用 userData
 *       await api.fetchUserSettings(userData.userId)
 *     })
 *   }
 * }
 */
export default function useUserLoadedInvoke() {
	// 用户 store
	const userStore = useUserStore()
	// 创建条件执行函数，当用户数据不为空时执行
	const userInvoke = useDefineInvoke(() => !isEmpty(userStore.userData))

	/**
	 * 当用户数据加载完成后执行回调
	 * @param {Function} callback - 用户数据加载完成后要执行的函数
	 * @returns {Promise<void>} - 执行结果
	 */
	return async (callback) => {
		return userInvoke(async () => {
			// 检查回调是否是函数
			if (!isFunction(callback)) return
			// 执行回调，传入用户数据
			await callback(userStore.userData)
		})
	}
}

import { useUserStore } from '@/store'
import { noop } from 'lodash'
import usePageContext from '@/components/PageContainer/usePageContext'
import router from '@/router'

/**
 * 登录鉴权调用封装的 hook
 *
 * @returns {Function} - 返回高阶函数，可包装任意需要登录才能执行的逻辑
 *
 * @example
 * // 基本用法
 * import useAuthInvoke from '@/composables/auth/useAuthInvoke'
 *
 * export default {
 *   setup() {
 *     const authInvoke = useAuthInvoke()
 *
 *     // 包装需要登录的函数
 *     const handleSubmit = authInvoke(async (formData, userData) => {
 *       // 这里可以使用 userData
 *       await api.submitForm(formData)
 *     })
 *
 *     // 带自定义提示信息
 *     const handleDelete = authInvoke(async () => {
 *       await api.deleteItem()
 *     }, {
 *       message: '删除操作需要登录，请先登录'
 *     })
 *
 *     return {
 *       handleSubmit,
 *       handleDelete
 *     }
 *   }
 * }
 */
export default function useAuthInvoke() {
	// 获取页面模态框上下文
	const { getPageModalCtx } = usePageContext()
	// 用户 store
	const store = useUserStore()

	/**
	 * 包装器：执行前鉴权
	 * @param {Function} callback - 登录后要执行的函数
	 * @param {Object} [options={}] - 配置选项
	 * @param {string} [options.message='您还未登录，请先登录后再操作'] - 未登录时提示信息
	 * @returns {Function} - 包装后的函数
	 */
	return (callback = noop, options = {}) => {
		const { message = '您还未登录，请先登录后再操作' } = options

		/**
		 * 执行函数（带鉴权）
		 * @param {...any} args - 传递给回调函数的参数
		 * @returns {Promise<any>} - 回调函数的返回值
		 */
		return async (...args) => {
			const modalCtx = getPageModalCtx()
			// 如果未登录，弹出提示并跳转登录
			if (!store.isLogin) {
				modalCtx.open({
					title: '提示',
					content: message,
					showConfirmButton: true,
					showCancelButton: true,
					confirmColor: 'var(--uv-red-color)',
					confirmText: '去登录',
					onConfirm() {
						router.launch({
							url: '/pages/login/index'
						})
					}
				})
				return Promise.reject('您还未登录，请先登录后再操作')
			}

			// 登录状态下执行回调，传入用户数据
			return callback(...args, store.userData)
		}
	}
}

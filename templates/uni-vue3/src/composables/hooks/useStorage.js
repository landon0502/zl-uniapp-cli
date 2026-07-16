import { ref } from 'vue'
import Storage from '@/utils/Storage'
import { noop } from 'lodash'

/**
 * 存储相关的 hook，提供响应式的存储操作
 *
 * @param {string} key - 存储的键名
 * @param {Object} [options={}] - 配置选项
 * @param {any} [options.defaultValue] - 默认值，当存储中不存在该键时使用
 * @param {boolean} [options.listenStorageChange=false] - 是否监听存储变化
 * @param {Function} [options.onChange=noop] - 存储变化时的回调
 * @param {Function} [options.onError=noop] - 存储错误时的回调
 * @param {Function} [options.onRemove=noop] - 存储被移除时的回调
 * @param {Function} [options.onClear=noop] - 存储被清空时的回调
 * @returns {Object} - 存储相关的状态和方法
 * @returns {Ref} returns.data - 存储的值（响应式）
 * @returns {Object} returns.storage - 存储实例
 * @returns {Function} returns.setItem - 设置存储值的方法
 * @returns {Function} returns.getItem - 获取存储值的方法
 *
 * @example
 * // 基本用法
 * const { data, setItem, getItem } = useStorage('userInfo')
 *
 * // 带默认值
 * const { data } = useStorage('userInfo', {
 *   defaultValue: { name: '默认用户' }
 * })
 *
 * // 带回调
 * const { data } = useStorage('userInfo', {
 *   listenStorageChange: true,
 *   onChange: (value) => {
 *     console.log('存储变化:', value)
 *   },
 *   onError: (error) => {
 *     console.error('存储错误:', error)
 *   }
 * })
 *
 * // 设置值
 * setItem({ name: '张三', age: 25 })
 *
 * // 获取值
 * const value = getItem()
 */
export default function useStorage(key, options = {}) {
	// 创建存储实例
	const storage = new Storage()
	// 存储的值（响应式）
	const storageValue = ref(storage.getItem(key) || options.defaultValue)
	// 解构配置选项
	const {
		listenStorageChange = false,
		onChange = noop,
		onError = noop,
		onRemove = noop,
		onClear = noop
	} = options ?? {}

	// 监听存储变化
	storage.listener('change', (value) => {
		if (key === value.key) {
			storageValue.value = value.data
			if (listenStorageChange) {
				onChange(value)
			}
		}
	})

	// 监听存储错误
	storage.listener('error', (error) => {
		onError(error)
	})

	// 监听存储移除
	storage.listener('remove', (e) => {
		onRemove(e)
	})

	// 监听存储清空
	storage.listener('clear', (e) => {
		onClear(e)
	})

	// 返回存储相关的状态和方法
	return {
		data: storageValue,
		storage,
		setItem(value, options) {
			return storage.setItem(key, value, options)
		},
		getItem(options) {
			return storage.getItem(key, options)
		}
	}
}

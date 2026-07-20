import { getHistoryPage } from '@/uni_modules/uv-ui-tools/libs/function'
import { isNull, isObject, isUndefined } from 'lodash'
import { toValue, reactive } from 'vue'

/**
 * 创建页面级别的存储对象
 * @param {Object} [page] - 页面实例，默认获取当前页面
 * @returns {Object} - 页面存储对象
 */
function createPageStore(page) {
	const currentPage = page ?? getHistoryPage()
	const store = currentPage._currentPageStores ?? {}
	if (isUndefined(currentPage._currentPageStores)) {
		currentPage._currentPageStores = store
	}
	return store
}

/**
 * 页面级数据仓库，只在当前页面生效
 *
 * @param {string} storeKey - 存储的键名
 * @returns {Object} - 页面存储操作方法
 * @returns {Function} returns.setStoreItem - 设置存储项
 * @returns {Function} returns.getStoreItem - 获取存储项
 * @returns {Function} returns.removeStoreItem - 删除存储项
 * @returns {Function} returns.getStore - 获取整个存储对象
 * @returns {Function} returns.clearStore - 清空存储
 * @returns {Function} returns.setStore - 设置整个存储对象
 *
 * @example
 * // 基本用法
 * const { setStoreItem, getStoreItem, removeStoreItem } = usePageStore('userInfo')
 *
 * // 设置值
 * setStoreItem('name', '张三')
 * setStoreItem('age', 25)
 *
 * // 获取值
 * const name = getStoreItem('name') // '张三'
 * const age = getStoreItem('age') // 25
 *
 * // 删除值
 * removeStoreItem('age')
 *
 * // 设置整个存储对象
 * setStore({ name: '李四', age: 30 })
 *
 * // 获取整个存储对象
 * const store = getStore() // { name: '李四', age: 30 }
 *
 * // 清空存储
 * clearStore()
 */
export default function usePageStore(storeKey) {
	const curPage = getHistoryPage()

	/**
	 * 初始化页面存储
	 * @returns {Object} - 页面存储对象
	 */
	const initPageStore = () => {
		const store = createPageStore(curPage)
		if (isUndefined(store[storeKey])) {
			store[storeKey] = reactive({})
		}
		return store
	}

	// 初始化页面存储
	initPageStore()

	/**
	 * 设置存储项
	 * @param {string} key - 存储键名
	 * @param {any} value - 存储值
	 */
	const setStoreItem = (key, value) => {
		const currentStore = getStore()
		currentStore[key] = value
	}

	/**
	 * 获取存储项
	 * @param {string} key - 存储键名
	 * @returns {any} - 存储值
	 */
	const getStoreItem = (key) => {
		const currentStore = getStore()
		return currentStore[key]
	}

	/**
	 * 删除存储项
	 * @param {string} key - 存储键名
	 */
	const removeStoreItem = (key) => {
		const currentStore = getStore()
		Reflect.deleteProperty(currentStore, key)
	}

	/**
	 * 设置整个存储对象
	 * @param {Object} value - 存储对象
	 * @throws {Error} - 当 value 不是对象时抛出错误
	 */
	const setStore = (value) => {
		if (isUndefined(value) || isNull(value)) {
			return
		}
		if (!isObject(value)) {
			throw new Error('The "store" must be an object.')
		}
		Object.entries(value).forEach(([key, value]) => {
			setStoreItem(key, value)
		})
	}

	/**
	 * 获取整个存储对象
	 * @param {string} [key=storeKey] - 存储键名
	 * @returns {Object} - 存储对象
	 */
	const getStore = (key = storeKey) => {
		const store = createPageStore(curPage)
		if (isUndefined(store[key])) {
			initPageStore()
		}
		return toValue(store[key])
	}

	/**
	 * 清空存储
	 */
	const clearStore = () => {
		const currentStore = getStore()
		Object.entries(currentStore).forEach(([key]) => {
			Reflect.deleteProperty(currentStore, key)
		})
	}

	// 返回存储操作方法
	return {
		setStoreItem,
		getStoreItem,
		removeStoreItem,
		getStore,
		clearStore,
		setStore
	}
}

import { noop, pick } from 'lodash'
import { EventBus } from '@/utils/bus'

/**
 * 统一处理uni storage
 */
export class UniStorage {
	storage = new EventBus()
	uniStorageNativeMethods = {
		setStorage: uni.setStorage.bind(uni),
		setStorageSync: uni.setStorageSync.bind(uni),
		getStorage: uni.getStorage.bind(uni),
		getStorageSync: uni.getStorageSync.bind(uni),
		getStorageInfo: uni.getStorageInfo.bind(uni),
		getStorageInfoSync: uni.getStorageInfoSync.bind(uni),
		removeStorage: uni.removeStorage.bind(uni),
		removeStorageSync: uni.removeStorageSync.bind(uni),
		clearStorage: uni.clearStorage.bind(uni),
		clearStorageSync: uni.clearStorageSync.bind(uni)
	}

	/**
	 * storage 统一回调处理
	 * @param {*} param0
	 * @returns
	 */
	storageCallbackHandler(
		name,
		{ resolve, reject, success = noop, fail = noop, complete = noop, data, key }
	) {
		return {
			success: (e) => {
				success(e)
				this.listenerEventHandler(name, {
					data,
					key
				})
				resolve({
					success: true,
					data,
					key
				})
			},
			fail: (error) => {
				fail(error)
				this.onErrorHandler(name, { data, key, error })
				reject({
					success: false,
					error
				})
			},
			complete
		}
	}
	/**
	 * 使用promise
	 * @param {*} storageMethod
	 * @returns
	 */
	withPromise(name, storageMethod = noop) {
		return (options = {}) => {
			return new Promise((resolve, reject) => {
				storageMethod({
					...pick(options, ['key', 'data']),
					...this.storageCallbackHandler(name, { resolve, reject, ...options })
				})
			})
		}
	}

	/**
	 * 事件监听
	 */
	listenerEventHandler(name, data) {
		if (['setStorage', 'setStorageSync'].includes(name)) {
			this.storage.$emit('change', data)
		}
		if (['removeStorage', 'removeStorageSync'].includes(name)) {
			this.storage.$emit('remove', data)
		}
		if (['clearStorage', 'clearStorageSync'].includes(name)) {
			this.storage.$emit('clear', data)
		}
	}

	/**
	 * 处理error 事件
	 */
	onErrorHandler(name, error) {
		this.storage.$emit('error', {
			method: name,
			error
		})
	}

	/**
	 * 缓存监听，主要监听数据变更change, 数据清除clear, 数据删除remove
	 * @param {*} eventName
	 * @param {*} callback
	 */
	listener(eventName, callback = noop) {
		this.storage.$on(eventName, callback)
	}
	/**
	 * 将异步的操作转为promise
	 */
	convertsAsyncStorageToPromise() {
		Object.entries(this.uniStorageNativeMethods).forEach(([method, storageAction]) => {
			if (method.endsWith('Sync')) {
				this[method] = ({ key, data }) => {
					try {
						let res = storageAction.apply(uni, [key, data])
						this.listenerEventHandler(method, { res, key, data })
						return res
					} catch (error) {
						throw new Error(error)
					}
				}
			} else {
				this[method] = this.withPromise(method, storageAction.bind(uni))
			}
		})
	}
	constructor() {
		this.convertsAsyncStorageToPromise()
	}
}

const defaultOptions = {
	isAsync: false
}

export default class Storage extends UniStorage {
	constructor(options = {}) {
		super()
		const { execType = 'sync' } = options
		this.execType = execType
	}

	/**
	 * 设置值
	 * @param {string} key 存储的key
	 * @param { Object | Array | String | Number | Boolean | Date } data 存储的值
	 * @param {*} options
	 * @returns
	 */
	setItem(key, data, options = defaultOptions) {
		if (!key) {
			throw new Error('The parameter "key" must exist.')
		}

		if (options.isAsync) {
			return this.setStorage({ key, data, ...options })
		}
		this.setStorageSync({ key, data, ...options })
	}
	getItem(key, options = defaultOptions) {
		if (options.isAsync) {
			return this.getStorage({ key, ...options })
		}
		return this.getStorageSync({ key, ...options })
	}
	clear(key, options = defaultOptions) {
		if (options.isAsync) {
			return key ? this.removeStorage({ key, ...options }) : this.clearStorage(options)
		}

		return key ? this.removeStorageSync(key) : this.clearStorageSync(options)
	}
	getInfo(options = defaultOptions) {
		if (options.isAsync) {
			return this.getStorageInfo(options)
		}
		return this.getStorageInfoSync(options)
	}
}

// export const appStorage = new Storage()

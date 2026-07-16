/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */

import tryOnScopeDispose from '../shared/tryOnScopeDispose'
import { ref, onUnmounted, shallowRef } from 'vue'
import useSupported from './useSupported'
import { noop } from 'lodash'
import { uniPromisify, checkLocationPermission } from '@/utils/utils'

// 默认的位置类型
const defaultLocationType = 'gcj02'
// 是否显示权限弹窗的标志
let isShowModal = false

/**
 * 响应式地理定位 API
 *
 * @param {Object} [options={}] - 配置选项
 * @param {boolean} [options.immediate=true] - 是否立即获取位置
 * @param {boolean} [options.watcher=false] - 是否开启位置监听
 * @param {Object} [options.locationOptions={type: 'gcj02'}] - 定位选项
 * @param {string} [options.locationOptions.type='gcj02'] - 位置类型，可选值：wgs84、gcj02、bd09
 * @param {Function} [options.onUpdate=noop] - 位置更新时的回调函数
 * @param {Function} [options.onError] - 错误时的回调函数
 * @param {boolean} [options.showPermissionModal=true] - 是否显示权限提示弹窗
 * @returns {Object} - 地理定位相关的响应式对象和方法
 * @returns {Ref<boolean>} returns.isSupported - 是否支持地理定位
 * @returns {Ref<Object>} returns.coords - 位置坐标
 * @returns {Ref<Error|null>} returns.error - 错误信息
 * @returns {Ref<boolean>} returns.loading - 是否正在加载
 * @returns {Function} returns.resume - 开始获取位置
 * @returns {Function} returns.pause - 暂停获取位置
 * @returns {Function} returns.destory - 销毁位置监听
 *
 * @example
 * // 基本用法
 * const { coords, loading, error, resume } = useGeolocation()
 *
 * // 带选项的用法
 * const { coords, resume } = useGeolocation({
 *   immediate: false, // 不立即获取
 *   watcher: true, // 开启位置监听
 *   locationOptions: {
 *     type: 'wgs84' // 使用 WGS84 坐标系
 *   },
 *   onUpdate: (position) => {
 *     console.log('位置更新:', position)
 *   },
 *   onError: (err) => {
 *     console.error('获取位置失败:', err)
 *   }
 * })
 *
 * // 手动触发获取位置
 * resume()
 */
export default function useGeolocation(options = {}) {
	const {
		immediate = true, // 是否立即获取位置
		watcher, // 是否开启位置监听
		locationOptions = {
			type: defaultLocationType // 默认使用 gcj02 坐标系
		},
		onUpdate = noop, // 位置更新时的回调
		showPermissionModal = true // 是否显示权限提示弹窗
	} = options

	// 检查是否支持 getLocation API
	const isSupported = useSupported('getLocation')
	// 加载状态
	const loading = ref(false)
	// 错误信息
	const error = shallowRef(null)
	// 位置坐标
	const coords = ref({
		latitude: null, // 纬度
		longitude: null // 经度
	})

	/**
	 * 更新位置信息
	 * @param {Object} position - 位置信息
	 */
	function updatePosition(position) {
		coords.value = position
		error.value = null
		onUpdate(position)
	}

	/**
	 * 错误处理函数
	 * @param {Error} err - 错误信息
	 */
	function errorHandler(err) {
		error.value = err
		options?.onError?.(err)
	}

	/**
	 * 开始获取位置
	 * @returns {Promise<Object>} - 位置信息
	 */
	async function resume() {
		error.value = null
		loading.value = true

		// 检查是否支持地理定位
		if (!isSupported.value) return

		// 请求位置权限
		if (uni.canIUse('authorize')) {
			await uniPromisify('authorize')({
				scope: 'scope.userLocation'
			})
		}

		try {
			// 检查位置权限
			const result = await checkLocationPermission()

			// 如果没有权限且需要显示弹窗
			if (!result.granted && showPermissionModal && !isShowModal) {
				isShowModal = true
				uni.showModal({
					title: '无法获取你的位置信息',
					content: '请在设置中打开定位服务，允许App使用定位服务',
					success(res) {
						if (res.confirm) {
							// #ifdef APP
							// 在 App 环境下打开权限设置
							uni.openAppAuthorizeSetting()
							// #endif
						}
					},
					complete() {
						isShowModal = false
					}
				})
				errorHandler(result)
				return
			}

			// 获取位置信息
			let res = await uniPromisify('getLocation')({
				type: locationOptions.type || defaultLocationType,
				...locationOptions
			})

			// 更新位置
			updatePosition(res)
			// 调用成功回调
			locationOptions.success?.(res)
			return Promise.resolve(res)
		} catch (error) {
			// 调用失败回调
			locationOptions.fail?.(error)
			errorHandler(error)
			return Promise.reject(error)
		} finally {
			// 结束加载状态
			loading.value = false
		}
	}

	// 如果设置了立即获取，则立即执行
	if (immediate) resume()

	/**
	 * 暂停获取位置
	 */
	function pause() {
		if (watcher) {
			// 开启位置更新
			uni.startLocationUpdate({
				success: () => console.log('开启应用接收位置消息成功'),
				fail: errorHandler,
				complete: () => console.log('调用开启应用接收位置消息 API 完成')
			})
			// 监听位置变化
			uni.onLocationChange(updatePosition)
			// 监听位置变化错误
			uni.onLocationChangeError(errorHandler)
		}
	}

	/**
	 * 销毁位置监听
	 */
	const destory = () => {
		if (watcher) {
			// 移除位置变化监听
			uni.offLocationChange(updatePosition)
			// 移除位置变化错误监听
			uni.offLocationChangeError(errorHandler)
			// 停止位置更新
			uni.stopLocationUpdate()
		}
	}

	// 在作用域销毁时暂停
	tryOnScopeDispose(() => {
		pause()
	})

	// 在组件卸载时销毁
	onUnmounted(destory)

	// 返回地理定位相关的对象和方法
	return {
		isSupported,
		coords,
		error,
		loading,
		resume,
		pause,
		destory
	}
}

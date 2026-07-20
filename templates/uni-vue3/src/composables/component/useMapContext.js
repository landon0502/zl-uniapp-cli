import { getCurrentInstance, shallowRef, unref, onMounted, watchEffect, nextTick } from 'vue'
import { useDebounceFn, useDefineInvoke, useMountedInvoke } from '@/composables'
import { isEmpty, noop } from 'lodash'
import { safeToNumber } from '@/utils/utils'

/**
 * 地图上下文管理的 hook
 *
 * @param {string|Ref<string>} id - 地图组件的 id
 * @param {Object} [options={}] - 配置选项
 * @param {Array} [options.markers=[]] - 地图标记数组
 * @param {Function} [options.callback=noop] - 地图初始化完成后的回调
 * @returns {Object} - 地图相关的状态和方法
 * @returns {Ref} returns.mapContext - 地图上下文
 * @returns {Function} returns.updateMerkers - 更新地图标记的方法
 * @returns {Function} returns.includePoints - 将所有标记点缩放至屏幕中的方法
 *
 * @example
 * // 基本用法
 * import useMapContext from '@/composables/component/useMapContext'
 *
 * export default {
 *   setup() {
 *     const { mapContext, updateMerkers, includePoints } = useMapContext('mapId', {
 *       markers: [
 *         {
 *           id: '1',
 *           latitude: 39.9042,
 *           longitude: 116.4074,
 *           title: '北京'
 *         }
 *       ],
 *       callback: () => {
 *         console.log('地图初始化完成')
 *       }
 *     })
 *
 *     // 手动更新标记
 *     const handleUpdateMarkers = () => {
 *       updateMerkers([
 *         {
 *           id: '1',
 *           latitude: 39.9042,
 *           longitude: 116.4074,
 *           title: '北京'
 *         },
 *         {
 *           id: '2',
 *           latitude: 31.2304,
 *           longitude: 121.4737,
 *           title: '上海'
 *         }
 *       ])
 *     }
 *
 *     // 将所有标记点缩放至屏幕中
 *     const handleIncludePoints = () => {
 *       includePoints()
 *     }
 *
 *     return {
 *       handleUpdateMarkers,
 *       handleIncludePoints
 *     }
 *   }
 * }
 */
export default function useMapContext(id, options = {}) {
	const { markers, callback = noop } = options
	// 地图上下文
	const mapContext = shallowRef()
	// 创建条件执行函数，当地图 id 存在时执行
	const invoke = useDefineInvoke(() => !isEmpty(unref(id)))
	// 组件挂载后执行的函数
	const mountedInvoke = useMountedInvoke()

	// 组件挂载时初始化地图上下文
	onMounted(() => {
		const instance = getCurrentInstance()
		invoke(() => {
			// 创建地图上下文
			mapContext.value = uni.createMapContext(id, instance.proxy)
			// 执行回调
			callback()
		})
	})

	/**
	 * 更新地图标记
	 * @param {Array} [markers=[]] - 标记数组
	 * @param {boolean} [includePoints=false] - 是否将所有标记点缩放至屏幕中
	 */
	const updateMerkers = async (markers = [], includePoints = false) => {
		if (isEmpty(mapContext.value)) return
		// 移除旧标记
		mapContext.value.removeMarkers({
			markerIds: markers.map((item) => safeToNumber(item.id))
		})
		// 添加新标记
		mapContext.value.addMarkers({
			markers,
			clear: true
		})
		// 将所有标记点缩放至屏幕中
		if (includePoints && !isEmpty(markers)) {
			await nextTick()
			mapContext.value.includePoints({
				points: markers,
				padding: [80, 80, 80, 80]
			})
		}
	}

	// 创建防抖函数，避免频繁更新标记
	const [runUpdateMerkes] = useDebounceFn((markers = []) => {
		mountedInvoke(updateMerkers(markers, false))
	})

	// 监听标记变化，自动更新
	watchEffect(() => {
		runUpdateMerkes(unref(markers))
	})

	// 返回地图相关的状态和方法
	return {
		mapContext,
		updateMerkers,
		// 将所有坐标点缩放至屏幕中
		includePoints() {
			mountedInvoke(updateMerkers(unref(markers), true))
		}
	}
}

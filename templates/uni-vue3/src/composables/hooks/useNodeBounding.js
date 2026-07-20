import { merge, noop } from 'lodash'
import { ref, onMounted, getCurrentInstance, onUnmounted, shallowRef } from 'vue'
import { queryNodeRect } from '@/utils/utils'

/**
 * 查询节点信息并可选地监听节点变化
 *
 * @param {Object} options - 配置选项
 * @param {string} options.selector - 节点选择器
 * @param {boolean} [options.isObserver=true] - 是否创建节点观察者
 * @param {Function} [options.onNodeRectUpdate=noop] - 节点信息更新时的回调函数
 * @param {Object} [options.observeOptions] - 观察者配置选项
 * @returns {Object} - 包含节点信息和操作方法的对象
 * @returns {Ref<Object|null>} returns.nodeRect - 节点的位置和大小信息
 * @returns {Function} returns.queryNode - 查询节点信息的方法
 * @returns {Function} returns.disconnect - 停止监听的方法
 * @returns {Ref<Object|null>} returns.observer - 节点观察者实例
 * @returns {Function} returns.initObserver - 初始化观察者的方法
 *
 * @example
 * // 基本用法
 * const { nodeRect, queryNode } = useNodeBounding({
 *   selector: '.target-element'
 * })
 *
 * // 带回调的用法
 * const { nodeRect } = useNodeBounding({
 *   selector: '.target-element',
 *   onNodeRectUpdate: (rect) => {
 *     console.log('节点信息更新:', rect)
 *   }
 * })
 *
 * // 手动查询节点
 * const { queryNode } = useNodeBounding({
 *   selector: '.target-element',
 *   isObserver: false // 不创建观察者
 * })
 *
 * // 手动查询
 * const rect = await queryNode()
 */
export default function useNodeBounding({
	selector,
	isObserver = true,
	onNodeRectUpdate = noop,
	observeOptions
}) {
	// 获取当前小程序页面实例
	const instance = getCurrentInstance()
	// 存储观察者实例
	const observer = shallowRef()
	// 存储节点信息
	const nodeRect = ref()
	// 合并观察者配置选项
	const mergeObserveOptions = merge(
		{
			// #ifdef MP-WEIXIN
			nativeMode: true,
			// #endif
			observeAll: true
		},
		observeOptions ?? {}
	)

	/**
	 * 查询节点信息
	 * @returns {Promise<Object>} - 节点的位置和大小信息
	 */
	const queryNode = async () => {
		let res = await queryNodeRect(selector)
		nodeRect.value = res
		return res
	}

	/**
	 * 初始化节点观察者
	 */
	const initObserver = async () => {
		// 先停止之前的监听
		disconnect()
		// 查询节点信息
		let res = await queryNode()
		// 执行查询并创建监听器
		if (res) {
			// 创建监听器
			observer.value = uni.createIntersectionObserver(instance.proxy, mergeObserveOptions)
			observer.value
				.relativeToViewport({ top: 0 })
				.observe(selector, async ({ boundingClientRect }) => {
					nodeRect.value = boundingClientRect
					onNodeRectUpdate(boundingClientRect)
				})
		}
	}

	/**
	 * 停止监听
	 */
	const disconnect = () => {
		observer.value?.disconnect()
	}

	// 在组件挂载时初始化观察者
	onMounted(() => {
		if (isObserver) initObserver()
	})

	// 在组件卸载时停止监听
	onUnmounted(() => {
		disconnect()
	})

	// 返回节点信息和操作方法
	return { nodeRect, queryNode, disconnect, observer, initObserver }
}

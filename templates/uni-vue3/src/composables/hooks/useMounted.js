import { getCurrentInstance, onMounted, shallowRef } from 'vue'

/**
 * 获取组件的挂载状态
 *
 * @returns {Ref<boolean>} - 组件的挂载状态，true 表示已挂载，false 表示未挂载
 *
 * @example
 * // 基本用法
 * const isMounted = useMounted()
 *
 * // 在模板中使用
 * <template>
 *   <div>
 *     {{ isMounted ? '已挂载' : '未挂载' }}
 *   </div>
 * </template>
 *
 * // 在逻辑中使用
 * watch(isMounted, (mounted) => {
 *   if (mounted) {
 *     // 组件已挂载，执行初始化操作
 *     console.log('组件已挂载')
 *   }
 * })
 */
export default function useMounted() {
	// 存储组件的挂载状态
	const isMounted = shallowRef(false)

	// 获取当前组件实例
	const instance = getCurrentInstance()
	if (instance) {
		// 在组件挂载时设置状态为 true
		onMounted(() => {
			isMounted.value = true
		}, instance)
	}

	// 返回挂载状态的 ref
	return isMounted
}

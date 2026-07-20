import { useSlots, computed } from 'vue'
import { isEmpty } from 'lodash'

/**
 * 父组件插槽的唯一标识
 * @type {Symbol}
 */
export const parentComponentKey = Symbol('parent_slot_component_key')

/**
 * 获取动态插槽信息
 *
 * @param {Object} [options={}] - 配置选项
 * @param {Array<string>} [options.slotNames=[]] - 要过滤的插槽名称列表，为空则包含所有插槽
 * @returns {Object} - 包含动态插槽信息的对象
 * @returns {Ref<Array>} returns.slots - 可以渲染的插槽列表
 *
 * @example
 * // 基本用法
 * const { slots } = useDynamicSlotKeys()
 *
 * // 过滤特定插槽
 * const { slots } = useDynamicSlotKeys({
 *   slotNames: ['header', 'footer']
 * })
 *
 * // 在模板中使用
 * <template>
 *   <div>
 *     <component
 *       v-for="slot in slots"
 *       :key="slot.name"
 *       :is="slot.render"
 *     />
 *   </div>
 * </template>
 */
export default function useDynamicSlotKeys(options) {
	// 从选项中获取插槽名称列表，默认为空数组
	const { slotNames = [] } = options ?? {}
	// 获取所有插槽
	const slots = useSlots()

	/**
	 * 过滤可以使用的插槽
	 * @param {Object} slot - 插槽对象
	 * @returns {boolean} - 是否可以使用
	 */
	const filterCanuseSlotName = (slot) => {
		// 检查是否在指定的插槽名称列表中，或者列表为空，并且插槽可以渲染
		return (isEmpty(slotNames) || slotNames.includes(slot.name)) && slot.isRender
	}

	/**
	 * 生成可以渲染的插槽信息
	 * @param {Object} param - 参数对象
	 * @param {string} param.name - 插槽名称
	 * @param {Function} param.render - 插槽渲染函数
	 * @returns {Object} - 包含插槽信息的对象
	 */
	function genCanRenderSlot({ name, render }) {
		// 创建插槽信息对象
		let renderSlot = {
			name, // 插槽名称
			render, // 渲染函数
			isRender: false // 是否可以渲染
		}

		// 在微信小程序环境中
		// #ifdef MP-WEIXIN
		renderSlot.isRender = render
		// #endif

		// 在非微信小程序环境中
		// #ifndef MP-WEIXIN
		renderSlot.isRender = !isEmpty(render())
		// #endif

		return renderSlot
	}

	/**
	 * 计算可以渲染的动态插槽列表
	 */
	const dynamicSlots = computed(() => {
		return (
			Object.entries(slots)
				// 将插槽转换为包含渲染信息的对象
				.reduce((acc, [slotName, render]) => {
					return [...acc, genCanRenderSlot({ name: slotName, render })]
				}, [])
				// 过滤可以使用的插槽
				.filter(filterCanuseSlotName)
		)
	})

	// 返回动态插槽信息
	return { slots: dynamicSlots }
}

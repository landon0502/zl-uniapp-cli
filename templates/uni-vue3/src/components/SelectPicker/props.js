import props from '@/uni_modules/uv-picker/components/uv-picker/props'

export default {
	props: {
		...props,
		/**
		 * 选择项
		 */
		options: Array,
		/**
		 * label取值key
		 */
		keyName: {
			type: String,
			default: 'name'
		},
		/**
		 * value取值key
		 */
		keyValue: {
			type: String,
			default: 'value'
		},
		/**
		 * 动态加载数据
		 */
		loadData: Function,
		/**
		 * 数据绑定
		 */
		modelValue: Array,
		/**
		 * 禁用
		 */
		disabled: Boolean
	}
}

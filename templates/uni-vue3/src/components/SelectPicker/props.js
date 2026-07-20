export default {
	props: {
		/**
		 * 选择项
		 */
		list: Array,
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
		modelValue: [Array, String, Number],
		/**
		 * 禁用
		 */
		disabled: Boolean,
		/**
		 * 标题
		 */
		title: String,
		/**
		 * 显示提交按钮
		 */
		showConfirmButton: Boolean,
		/**
		 * 显示取消按钮
		 */
		showCancelButton: Boolean,
		/**
		 * 是否是多选
		 */
		multiple: Boolean,
		/**
		 * 自定义样式
		 */
		customStyle: Object
	}
}

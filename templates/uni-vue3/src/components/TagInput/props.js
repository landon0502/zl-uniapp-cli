import uvInputProps from '@/uni_modules/uv-input/components/uv-input/props'
export default {
	props: {
		...uvInputProps.props,
		// 双向绑定值
		modelValue: String,
		// 自定义输出框样式
		customInputStyle: uvInputProps.props.customStyle,
		// 是否显示清除
		closable: {
			type: Boolean,
			default: true
		}
	}
}

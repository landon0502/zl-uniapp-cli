import datetimeProps from '@/uni_modules/uv-datetime-picker/components/uv-datetime-picker/props'
export default {
	props: {
		...datetimeProps.props,
		format: String,
		confirmBtnProps: Object,
		cancelBtnProps: Object,
		// 取消按钮文本
		cancelText: {
			type: String,
			default: '取消'
		},
		// 确认按钮文本
		okText: {
			type: String,
			default: '确定'
		},
		// 时间选择器标题
		title: {
			type: String,
			default: '请选择日期'
		},
		// 圆角
		round: {
			type: [Number, String],
			default: 16
		},
		// 每列中可见选项的数量
		visibleItemCount: {
			type: Number,
			default: 7
		},
		customStyle: Object
	}
}

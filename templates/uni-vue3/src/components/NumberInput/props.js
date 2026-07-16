import uvInputProps from '@/uni_modules/uv-input/components/uv-input/props.js'
export default {
	props: {
		...uvInputProps.props,
		type: {
			type: String,
			default: 'Number'
		},
		limit: {
			type: Number,
			default: 4
		},
		max: {
			type: Number
		},
		isComplete: {
			// 是否需要补齐
			type: Boolean,
			default: true
		}
	}
}

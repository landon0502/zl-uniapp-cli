import props from '@/uni_modules/uv-upload/components/uv-upload/props.js'
import { defaultUploadPayload } from '@/config'
export default {
	props: {
		...props.props,
		// 绑定值
		modelValue: Array,
		// 上传配置
		uploadPayload: {
			type: Object,
			default: () => defaultUploadPayload
		},
		size: {
			type: Number,
			default: 100
		},
		hideUploadBtn: Boolean,
		maxCount: {
			type: Number
		}
	}
}

import uvInputProps from '@/uni_modules/uv-input/components/uv-input/props'
export default {
	props: {
		...uvInputProps.props,
		confirmType: {
			type: String,
			default: 'search'
		},
		// 自定义外部样式
		customStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		// 自定义搜索外部样式
		customBtnStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		// 占位样式
		placeholderStyle: {
			type: [String, Object],
			default() {
				return 'color:#00000042;font-size:14px'
			}
		},
		// 是否可清空内容
		clearable: {
			type: Boolean,
			default: true
		},
		// 输入框样式
		customInputStyle: uvInputProps.props.customStyle,
		// input 输入框类型,仅支持input与tagInput
		inputType: {
			validator(value) {
				return ['input', 'tags'].includes(value)
			},
			default: 'input'
		},
		// 滚动热词
		hotWords: Array,
		// 滚动热词 Swiper 配置项，与uniapp swiper组件一致
		hotWordsSwiperProps: {
			type: Object,
			default() {
				return {
					disableTouch: true
				}
			}
		},
		// 使用当前热词
		useCurrentHotWord: {
			type: Boolean,
			default: true
		},
		// 显示搜索按钮
		showBtn: {
			type: Boolean,
			default: true
		},
		// 图标颜色
		iconColor: {
			type: String,
			default: 'rgba(0, 0, 0, 0.26)'
		},
		// tagInput 是否显示tag关闭按钮、
		tagClosable: {
			type: Boolean,
			default: true
		}
	}
}

export default {
	/**
	 * 密码值
	 */
	value: {
		type: String,
		default: null,
	},
	modelValue:{
		type: String,
		default: null
	},
	/**
	 * 输入框下方文字提示
	 */
	info: {
		type: String,
		default: null,
	},
	/**
	 * 输入框下方错误提示
	 */
	errorInfo: {
		type: String,
		default: null,
	},
	/**
	 * 密码最大长度 6
	 */
	length: {
		type: Number,
		default: 6
	},
	/**
	 * 输入框格子之间的间距，如 20px 20rpx，默认单位为px
	 */
	gutter: {
		type: [String, Number],
		default: '20rpx'
	},
	/**
	 * 是否隐藏密码内容
	 */
	mask: {
		type: Boolean,
		default: true
	},
	/**
	 * 是否已聚焦，聚焦时会显示光标
	 */
	focused: {
		type: Boolean,
		default: false
	},
	/**
	 * 是否使用下划线模式
	 */
	line: {
		type: Boolean,
		default: false
	},
	/**
	 * 线条宽度
	 */
	lineWidth: {
		type: String,
		default: null,
	},
	/**
	 * 描边色
	 */
	borderColor:{
		type: String,
		default: null
	},
	/**
	 * 格子尺寸
	 */
	width:{
		type: String,
		default: null
	},
	height:{
		type: String,
		default: null
	},
	radius: {
		type: String,
		default: null,
	},
	/**
	 * 字体大小
	 */
	fontSize:{
		type: String,
		default: null
	},
	/**
	 * 激活色
	 */
	activeBgColor:{
		type: String,
		default: null
	},
	activeBorderColor:{
		type: String,
		default: null
	},
	borderWidth:{
		type: String,
		default: null
	},
	color:{
		type: String,
		default: null
	},
	/**
	 * 格子背景色
	 */
	bgColor:{
		type: String,
		default: null
	},
	/**
	 * 光标色
	 */
	cursorColor:{
		type: String,
		default: null
	},
	/**
	 * 禁用系统键盘
	 */
	disabledKeyboard: {
		type: Boolean,
		default: false
	},
	/**
	 * 是否禁止输入.
	 */
	disabledDot: {
		type: Boolean,
		default: true
	},
	insertAt:{
		type: Object
	},
	lastElementStyle:{
		type: String,
		default: null
	},
	lastElementPlaceholder:{
		type: String,
		default: null
	},
	lastElementPlaceholderStyle:{
		type: String,
		default: null
	},
	
	
	type:{
		type: String,
		default: 'text'
	},
}
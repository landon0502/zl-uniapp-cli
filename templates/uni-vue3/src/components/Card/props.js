export default {
	props: {
		/**
		 * 自定义容器样式
		 */
		customStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * header 图标
		 */
		icon: String,
		/**
		 * header 图标大小
		 */
		iconSize: {
			type: [Number, String],
			default: 20
		},
		/**
		 * header 图标颜色
		 */
		iconColor: String,
		/**
		 * header 图标宽度
		 */
		iconWidth: [Number, String],
		/**
		 * header 图标高度
		 */
		iconHeight: [Number, String],
		/**
		 * header 图标 image mode
		 */
		iconImageMode: String,
		/**
		 * 自定义Head样式
		 */
		customHeadStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 自定义content样式
		 */
		customContentStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 自定义footer样式
		 */
		customFooterStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 标题内容
		 */
		title: String,
		/**
		 * 标题样式
		 */
		customTitleStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 标题显示行数
		 */
		titleLines: {
			type: Number,
			default: 1
		},
		/**
		 * 标题是否加粗
		 */
		titleBold: {
			type: [Boolean, Number],
			default: true
		},
		/**
		 * 标题颜色
		 */
		titleColor: {
			type: String,
			default: '#303133'
		},
		/**
		 * 标题字体大小
		 */
		titleSize: {
			type: String,
			default: '14px'
		},
		/**
		 * 显示header
		 */
		showHeader: {
			type: Boolean,
			default: true
		},
		/**
		 * 显示header 底部边框
		 */
		showHeadLine: Boolean,
		/**
		 * 标题行高
		 */
		titleLineHeight: Number
	}
}

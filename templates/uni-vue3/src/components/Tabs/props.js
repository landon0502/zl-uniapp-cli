import tabsProps from '@/uni_modules/uv-tabs/components/uv-tabs/props'

export default {
	props: {
		...tabsProps.props,
		// 更多选项样式
		moreItemStyle: Object,
		// 自定义组件外部样式
		customStyle: Object,
		// 是否显示更多按钮
		showMoreBtn: Boolean,
		// Tabs bar高度
		tabsHeight: {
			type: [String, Number]
		},
		// sticky top距离顶部
		stickyTop: {
			type: [String, Number],
			default: 0
		},
		// 是否启用吸附定位
		sticky: Boolean,
		// 定位层级
		zIndex: {
			type: Number,
			default: 10
		},
		// 双向绑定值
		modelValue: [String, Number],
		// 绑定list中对应的value字段名
		keyValue: {
			type: String,
			default: 'value'
		},
		// 组件内容区样式
		customContentStyle: {
			type: [Object, String],
			default() {
				return {}
			}
		},
		// more style
		customMoreStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		// tabs style
		customTabsStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		// 是否显示tabs下方分割线
		showTabsBottomLine: Boolean,
		// 设置tabs背景
		tabsBg: {
			type: String,
			default: 'transparent'
		},
		// 显示更多时隐藏tab
		moreShowedHideTabs: {
			type: Boolean,
			default: true
		},
		// 更多按钮是否显示左侧阴影
		showRightBtnLeftShadow: {
			type: Boolean,
			default: true
		}
	}
}

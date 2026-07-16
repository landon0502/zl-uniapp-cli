/**
 * ScrollPaging 组件属性配置
 */
export default {
	props: {
		/**
		 * 是否启用刷新
		 */
		refresherEnabled: {
			type: Boolean,
			default: true
		},

		/**
		 * 只需要刷新功能
		 */
		refreshonly: {
			type: Boolean,
			default: false
		},

		/**
		 * 是否启用加载更多
		 */
		loadmoreEnable: {
			type: Boolean,
			default: true
		},

		/**
		 * 是否显示加载状态
		 */
		loading: Boolean,

		/**
		 * loading区高度
		 */
		loadingHeight: {
			type: [Number],
			default: 80
		},

		/**
		 * 是否启用空数据状态
		 */
		emptyEnable: {
			type: Boolean,
			default: true
		},

		/**
		 * 下拉刷新阀值
		 */
		refresherThreshold: {
			type: Number,
			default: 100
		},

		/**
		 * 下拉刷新状态显示高度
		 */
		refreshHeight: {
			type: Number,
			default: 60
		},

		/**
		 * 自定义样式
		 */
		customStyle: {
			type: Object,
			default() {
				return {}
			}
		},

		/**
		 * 绑定数据
		 */
		data: Array,

		/**
		 * 每页数据量
		 */
		pageSize: {
			type: Number,
			default: 1
		},

		/**
		 * 数据总数量
		 */
		pageTotal: {
			type: Number
		},

		/**
		 * 空数据状态props 与 uv-empty props一致
		 */
		emptyProps: {
			type: Object,
			default() {
				return {}
			}
		},

		/**
		 * 自定义空状态容器样式
		 */
		customEmptyStyle: Object,

		/**
		 * 加载更多样式
		 */
		loadmoreStyle: {
			type: Object,
			default() {
				return {}
			}
		},

		/**
		 * 禁用空状态
		 */
		emptyDisabled: Boolean,

		/**
		 * 刷新时各状态内容
		 */
		refreshStatusTextConfig: {
			type: Object,
			default: () => ({})
		},

		/**
		 * 同scroll-view show-scrollbar
		 */
		showScrollbar: {
			type: Boolean,
			default: true
		},

		/**
		 * 初始化时是否执行load
		 */
		initLoad: {
			type: Boolean,
			default: false
		},

		/**
		 * 设置固定的自定义下拉刷新区域高度
		 */
		refresherFixedBacHeight: {
			type: Number,
			default: 0
		}
	}
}

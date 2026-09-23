export default {
	props: {
		// 留出底部安全区
		safeAreaInsetBottom: {
			type: Boolean,
			default: true
		},
		// 定位层级
		zIndex: {
			type: Number,
			default: 11
		},
		// 是否fixed定位
		fixed: {
			type: Boolean,
			default: false
		}
	}
}

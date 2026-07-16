import uvNavbarProps from '@/uni_modules/uv-navbar/components/uv-navbar/props'
export const popupFooterProps = {
	props: {
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
		// 取消按钮props 与uv-button props一直
		cancelBtnProps: {
			type: Object,
			default: () => ({})
		},
		// 确认按钮props 与uv-button props一直
		confirmBtnProps: {
			type: Object,
			default: () => ({})
		},
		// 是否显示取消按钮
		showCancelBtn: {
			type: Boolean,
			default: true
		},
		// 是否显示确认按钮
		showConfirmBtn: {
			type: Boolean,
			default: true
		},
		// 是否显示底部上边框
		footerTopBorder: {
			type: Boolean,
			default: true
		},
		// 底部按钮主题
		buttonTheme: {
			validator(v) {
				return ['group', 'button'].includes(v)
			},
			default: 'group'
		},
		// 上边框颜色
		footerBorderColor: String,
		// footer 样式
		footerStyle: {
			type: Object,
			defualt: () => ({})
		},
		// btn group style
		buttonGroupStyle: {
			type: Object,
			defualt: () => ({})
		}
	}
}

export const popupHeaderProps = {
	props: {
		...uvNavbarProps.props,
		safeAreaInsetTop: {
			type: Boolean,
			default: false
		},
		// 弹窗顶部导航栏左侧图标
		leftIcon: {
			type: String,
			default: ''
		},
		// 是否固定
		fixed: Boolean,
		// 是否显示头部边框
		headBorder: {
			type: Boolean,
			default: false
		},
		// 是否显示关闭按钮
		showCloseIcon: {
			type: Boolean,
			default: true
		},
		navbarHeight: {
			type: Number
		},
		rightIconSize: {
			type: Number,
			default: 24
		},
		titleStyle: {
			type: uvNavbarProps.props.titleStyle.type,
			default: {
				fontSize: '16px',
				fontWeight: '600',
				color: '#1D2129'
			}
		}
	}
}
export const uvPopupProps = {
	props: {
		// 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
		// message: 消息提示 ; dialog : 对话框
		mode: {
			type: String,
			default: 'center'
		},
		// 动画时长，单位ms
		duration: {
			type: [String, Number],
			default: 300
		},
		// 层级
		zIndex: {
			type: [String, Number],
			default: 997
		},
		// 弹窗背景色
		bgColor: {
			type: String,
			default: '#ffffff'
		},
		// 是否留出安全区域
		safeArea: {
			type: Boolean,
			default: true
		},
		// 是否显示遮罩
		overlay: {
			type: Boolean,
			default: true
		},
		// 点击遮罩是否关闭弹窗
		closeOnClickOverlay: {
			type: Boolean,
			default: true
		},
		// 遮罩的透明度，0-1之间
		overlayOpacity: {
			type: [Number, String],
			default: 0.4
		},
		// 自定义遮罩的样式
		overlayStyle: {
			type: [Object, String],
			default: ''
		},
		// 是否为iPhoneX留出底部安全距离
		safeAreaInsetBottom: {
			type: Boolean,
			default: true
		},
		// 是否留出顶部安全距离（状态栏高度）
		safeAreaInsetTop: {
			type: Boolean,
			default: false
		},
		// 是否显示关闭图标
		closeable: {
			type: Boolean,
			default: false
		},
		// 自定义关闭图标位置，top-left为左上角，top-right为右上角，bottom-left为左下角，bottom-right为右下角
		closeIconPos: {
			type: String,
			default: 'top-right'
		},
		// mode=center，也即中部弹出时，是否使用缩放模式
		zoom: {
			type: Boolean,
			default: true
		},
		// 弹窗圆角
		round: {
			type: [Number, String],
			default: 0
		},
		// 是否显示底部
		header: {
			type: Boolean,
			default: true
		},
		// 是否显示顶部
		footer: {
			type: Boolean,
			default: true
		},
		// 自定义样式
		customStyle: {
			type: Object
		},
		...uni.$uv?.props?.popup
	}
}

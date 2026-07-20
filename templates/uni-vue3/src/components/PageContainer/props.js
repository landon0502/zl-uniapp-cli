import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
export default {
	props: {
		/**
		 * 导航栏配置
		 */
		navBarProps: {
			type: Object,
			default() {
				return {
					placeholder: true,
					fixed: true,
					autoBack: true
				}
			}
		},
		/**
		 * 是否显示导航栏
		 */
		showNavBar: {
			type: Boolean,
			default: true
		},
		/**
		 * 是否留出底部安全区
		 */
		safeAreaInsetBottom: {
			type: Boolean,
			default: true
		},
		/**
		 * 是否显示底部
		 */
		footer: {
			type: Boolean,
			default: true
		},
		/**
		 * 是否填充全屏
		 */
		fullscreen: {
			type: Boolean,
			default: false
		},
		/**
		 * 内容区样式
		 */
		contentStyle: {
			type: Object,
			default() {
				return {
					padding: addUnit(12, 'px')
				}
			}
		},
		/**
		 * 容器样式
		 */
		customStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 页面top extra
		 */
		topExtraStyle: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 页面顶部是否启用吸顶
		 */
		topExtraSticky: Boolean,
		/**
		 * 页面顶部吸顶配置
		 */
		topExtraStickyProps: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 是否使用骨架屏
		 */
		useSkeletons: Boolean,
		/**
		 * footer样式
		 */
		footerStyle: {
			type: Object,
			default() {
				return {
					background: 'var(--uv-white-color)'
				}
			}
		},
		/**
		 * 固定fixed
		 */
		footerFixed: Boolean,
		/**
		 * footer 固定占位
		 */
		footerPlaceholder: {
			type: Boolean,
			default: true
		},
		/**
		 * 骨架屏配置
		 */
		skeletonsProps: {
			type: Object,
			default() {
				return {}
			}
		},
		/**
		 * 固定高度为内容高度
		 */
		fixedContentHeight: Boolean,
		/**
		 * 显示骨架屏时是否渲染内容
		 */
		showSeletonsRenderContent: {
			type: Boolean,
			default: true
		}
	}
}

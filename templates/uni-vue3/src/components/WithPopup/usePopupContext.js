/**
 * 弹窗上下文组合式 API
 * 用于在子组件中与 WithPopup 组件通信
 */
import { inject, onUnmounted } from 'vue'
import {
	provideNames,
	eventHookControlKeyName,
	hookNames,
	childrenComponentEvents
} from './context'
import { isFunction, noop } from 'lodash'

/**
 * 弹窗上下文组合式 API
 * @param {Object} options - 配置选项
 * @param {string} options.key - 组件唯一标识
 * @returns {Object} 弹窗操作方法和事件监听器
 */
export default function usePopupContext({ key }) {
	// 注入组件方法，提供默认值
	const popupCancel = inject(provideNames.POPUP_CANCEL, noop)
	const popupClose = inject(provideNames.POPUP_CLOSE, noop)
	const popupConfirm = inject(provideNames.POPUP_CONFIRM, noop)
	const popupOnConfirm = inject(provideNames.ON_CONFIRM, noop)
	const setFooterConfig = inject(provideNames.SET_FOOTER_CONFIG, noop)
	const eventController = inject(eventHookControlKeyName, {})

	/**
	 * 注册弹窗事件钩子
	 * @param {Symbol} eventName - 事件名称
	 * @param {Function} callback - 事件回调函数
	 */
	const registerEventHooks = (eventName, callback) => {
		if (isFunction(callback)) {
			eventController[key] = eventController[key] || {}
			eventController[key][eventName] = callback
		}
	}

	/**
	 * 弹出事件监听器
	 */
	const listener = {
		/**
		 * 弹窗打开时
		 * @param {Function} callback - 回调函数
		 */
		onOpen: (callback) => registerEventHooks(hookNames.ON_POPUP_OPEN, callback),

		/**
		 * 弹窗关闭时
		 * @param {Function} callback - 回调函数
		 */
		onClose: (callback) => registerEventHooks(hookNames.ON_POPUP_CLOSE, callback),

		/**
		 * 弹窗关闭前
		 * @param {Function} callback - 回调函数
		 */
		onPopupBeforeClose: (callback) => registerEventHooks(hookNames.ON_POPUP_BEFORE_CLOSE, callback),

		/**
		 * 点击取消时
		 * @param {Function} callback - 回调函数
		 */
		onPopupCancel: (callback) => registerEventHooks(hookNames.ON_POPUP_CANCEL, callback),

		/**
		 * 取消前
		 * @param {Function} callback - 回调函数
		 */
		onPopupBeforeCancel: (callback) =>
			registerEventHooks(hookNames.ON_POPUP_BEFORE_CANCEL, callback),

		/**
		 * 点击确认时
		 * @param {Function} callback - 回调函数
		 */
		onPopupConfirm: (callback) => registerEventHooks(hookNames.ON_POPUP_CONFIRM, callback),

		/**
		 * 确认前
		 * @param {Function} callback - 回调函数
		 */
		onPopupBeforeConfirm: (callback) =>
			registerEventHooks(hookNames.ON_POPUP_BEFORE_CONFIRM, callback),

		/**
		 * 确认前校验，返回false时不可关闭
		 * @param {Function} callback - 回调函数
		 */
		onPopupBeforeConfirmValidate: (callback) =>
			registerEventHooks(hookNames.ON_POPUP_BEFORE_CONFIRM_VALIDATE, callback)
	}

	// 组件卸载时清除事件
	onUnmounted(() => {
		// 只清除当前 key 下的事件
		delete eventController[key]
		uni.$emit(childrenComponentEvents.ON_UNLOAD, { key })
	})

	/**
	 * 初始化
	 */
	function init() {
		uni.$emit(childrenComponentEvents.ON_LOAD, { key })
	}

	// 初始化
	init()

	return {
		popupCancel, // 取消弹窗
		popupClose, // 关闭弹窗
		popupConfirm, // 确认弹窗
		popupOnConfirm, // 确认回调
		setFooterConfig, // 设置底部配置
		listener // 事件监听器
	}
}

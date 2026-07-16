/**
 * 组件内部钩子
 */
export const hookNames = {
	/**单框打开时*/
	ON_POPUP_OPEN: Symbol('onPopupOpen'),
	/**弹框关闭时*/
	ON_POPUP_CLOSE: Symbol('onPopupClose'),
	/**弹框关闭时*/
	ON_POPUP_BEFORE_CLOSE: Symbol('onPopupBeforeClose'),
	/**弹框取消时*/
	ON_POPUP_CANCEL: Symbol('onPopupCancel'),
	/**弹框取消前*/
	ON_POPUP_BEFORE_CANCEL: Symbol('onPopupBeforeCancel'),
	/**弹框确定时 */
	ON_POPUP_CONFIRM: Symbol('onPopupConfirm'),
	/**弹框确认前*/
	ON_POPUP_BEFORE_CONFIRM: Symbol('onPopupBeforeConfirm'),
	/**弹窗确认前校验 */
	ON_POPUP_BEFORE_CONFIRM_VALIDATE: Symbol('onPopupBeforeConfirmValidate')
}
/**
 * 事件控制器
 */
export const eventHookControlKeyName = Symbol('popup_event_hooks')
/**
 * 子组件 onLoad/onUnload 通知事件
 */
export const childrenComponentEvents = {
	ON_LOAD: 'childComponentOnLoad',
	ON_UNLOAD: 'childrenComponentUnload'
}
/**
 * 注入组件的方法
 */
export const provideNames = {
	/**取消弹框 */
	POPUP_CANCEL: Symbol('popupCancel'),
	/**关闭弹框 */
	POPUP_CLOSE: Symbol('popupClose'),
	/**弹框确认 */
	POPUP_CONFIRM: Symbol('popupConfirm'),
	/**确认弹框钩子，由外部调用时传入 */
	ON_CONFIRM: Symbol('onConfirm'),
	/**设置确认按钮禁用状态 */
	SET_FOOTER_CONFIG: Symbol('setConfirmConfig')
}

/**
 * 包装组件中的返回值
 * @param {any} value - 返回值
 * @param {Object} ctx - 上下文对象
 * @returns {Object} - 返回包装后的对象
 * @throws {Error} - 如果组件没有绑定 key 则抛出错误
 */
export function decorateCtxConfirmValue(value, ctx) {
	const key = ctx?.$vnode?.key
	if (!key) {
		throw new Error('组件未绑定 key，无法包装返回值')
	}
	return {
		[key]: value
	}
}

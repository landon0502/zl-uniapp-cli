<template>
	<!-- 弹出层组件 -->
	<uv-popup
		ref="popupRef"
		v-bind="mergePopupProps"
		@change="onPopupChange"
		:customStyle="popupStyle"
	>
		<view class="popup flex flex-col w-full flex-1">
			<!-- 头部区域 -->
			<view class="popup-head" v-if="mergePopupProps.header">
				<slot name="header">
					<PopupHeader v-bind="mergeHeaderProps" @close="close" />
				</slot>
			</view>

			<!-- 内容区域 -->
			<view class="popup-content flex-1 flex flex-col min-h-0">
				<slot name="default" :extraData="popupExtraData"></slot>
			</view>

			<!-- 底部区域 -->
			<view class="z-border-top popup-bottom" v-if="mergePopupProps.footer">
				<slot name="bottom" :cancel="handleCancel" :confirm="handleConfirm">
					<PopupFooter
						v-bind="mergeFooterProps"
						@cancel="handleCancel"
						@confirm="handleConfirm"
						ref="bottomBarRef"
					/>
				</slot>
			</view>
		</view>
	</uv-popup>
</template>
<script setup name="WithPopup">
import { computed, reactive, ref, provide, nextTick } from 'vue'
import { getComponentProps } from './utils'
import PopupFooter from './PopupFooter.vue'
import PopupHeader from './PopupHeader.vue'
import { popupFooterProps, popupHeaderProps, uvPopupProps } from './props'
import { isFunction, isUndefined } from 'lodash'
import {
	hookNames,
	provideNames,
	eventHookControlKeyName,
	childrenComponentEvents
} from './context'
import { noop } from 'lodash'
import { isEmpty } from 'lodash'
import { addStyle } from '@/uni_modules/uv-ui-tools/libs/function'
import { merge } from 'lodash'
import { cloneDeep } from 'lodash'

// 定义组件选项
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true,
		dynamicSlots: true // 启用动态 slot
	}
	// #endif
})

// 组件引用
const popupRef = ref()
// 弹窗额外数据
const popupExtraData = ref()
// 弹窗属性
const popupProps = ref()
// 头部属性
const headerProps = ref()
// 底部属性
const footerProps = ref()
// 底部栏引用
const bottomBarRef = ref()
// 底部配置
const footerConfig = ref({})
// 弹窗可见性
const visible = ref(false)
// 组件加载状态
const componentLoaded = reactive({})
// 事件回调
const events = reactive({
	onCancel: noop,
	onConfirm: noop,
	onClose: noop
})
// 弹窗事件
const popupEvents = reactive({})

// 定义组件事件
const emit = defineEmits({
	open: true, // 弹窗打开
	cancel: true, // 取消
	close: true, // 关闭
	confirm: true // 确认
})

// 提供组件方法
provide(provideNames.POPUP_CANCEL, handleCancel)
provide(provideNames.POPUP_CLOSE, close)
provide(provideNames.POPUP_CONFIRM, handleConfirm)
provide(provideNames.ON_CONFIRM, (res) => events.onConfirm(res))
provide(provideNames.SET_FOOTER_CONFIG, setFooterConfig)
provide(eventHookControlKeyName, popupEvents)

// 定义组件属性
const props = defineProps({
	...uvPopupProps.props,
	...popupHeaderProps.props,
	...popupFooterProps.props
})

// 合并头部属性
const mergeHeaderProps = computed(() => {
	const config = {
		...getComponentProps(props, popupHeaderProps.props),
		...headerProps.value,
		safeAreaInsetTop: false
	}
	return {
		...config,
		height: config.navbarHeight
	}
})

// 合并底部属性
const mergeFooterProps = computed(() => {
	let mergeConfig = cloneDeep({
		...getComponentProps(props, popupFooterProps.props),
		...footerProps.value
	})
	if (!isEmpty(footerConfig.value)) {
		mergeConfig = merge(mergeConfig, footerConfig.value)
	}
	return mergeConfig
})

// 合并弹窗属性
const mergePopupProps = computed(() => {
	return {
		...getComponentProps(props, uvPopupProps.props),
		...popupProps.value
	}
})

// 弹窗样式
const popupStyle = computed(() => {
	return {
		display: 'flex',
		flexDirection: 'column',
		...addStyle(props.customStyle),
		...addStyle(mergePopupProps.value.customStyle)
	}
})

/**
 * 调用内部钩子
 * @param {Object} data - 数据
 * @param {Symbol} name - 钩子名称
 * @param {string} key - 组件key
 * @returns {Object} 钩子执行结果
 */
async function invokeInnerHook(data = {}, name, key) {
	// 在子组件实例里面找出对应的钩子函数
	let hooks = { ...popupEvents }
	// 如果hooks为空，则不进行校验
	if (isEmpty(hooks) && name === hookNames.ON_POPUP_BEFORE_CONFIRM_VALIDATE) {
		return [true]
	}
	// 获取所有钩子
	let currentHooks = Object.entries(hooks).reduce((curHooks, [componentKey, hook]) => {
		// 如果为声明校验，默认设置一个
		if (isUndefined(hook[name]) && name === hookNames.ON_POPUP_BEFORE_CONFIRM_VALIDATE) {
			hook[name] = () => true
		}
		return isUndefined(hook[name]) ? curHooks : { ...curHooks, [componentKey]: hook[name] }
	}, {})
	// 组装成任务
	let hookTasks = Object.entries(currentHooks)
		.filter(([hookKey]) => isUndefined(key) || key === hookKey)
		.map(async ([hookKey, hook]) => {
			let params = data[hookKey]
			let res = await hook(params)
			return {
				[hookKey]: res
			}
		})
	let taskRes = await Promise.all(hookTasks)
	return taskRes.reduce((acc, current) => {
		return { ...acc, ...current }
	}, {})
}

/**
 * 关闭弹框
 */
async function close() {
	await invokeInnerHook(void 0, hookNames.ON_POPUP_BEFORE_CLOSE)
	popupRef.value.close()
}

/**
 * 弹窗打开事件
 * @param {string} key - 组件key
 */
async function onPopupOpen(key) {
	emit('open')
	await invokeInnerHook(popupExtraData.value, hookNames.ON_POPUP_OPEN, key)
}

/**
 * 弹窗关闭事件
 */
async function onPopupClose() {
	emit('close')
	await invokeInnerHook(void 0, hookNames.ON_POPUP_CLOSE)
}

/**
 * 底部提交loading
 * @param {boolean} loading - 是否显示加载
 */
function setBottomLoading(loading = false) {
	if (bottomBarRef.value) {
		bottomBarRef.value.setLoading(loading)
	}
}

/**
 * 取消操作
 */
async function handleCancel() {
	await invokeInnerHook(void 0, hookNames.ON_POPUP_BEFORE_CANCEL)
	emit('cancel')
	events.onCancel()
	close()
	await invokeInnerHook(void 0, hookNames.ON_POPUP_CANCEL)
}

/**
 * 弹框确认前校验
 * @returns {boolean} 是否校验通过
 */
async function onConfirmBeforeValidate() {
	let vali = await invokeInnerHook(popupExtraData.value, hookNames.ON_POPUP_BEFORE_CONFIRM_VALIDATE)
	return Object.values(vali).filter((res) => res).length > 0
}

/**
 * 确认操作
 * @param {Object} event - 事件对象
 */
async function handleConfirm(event = {}) {
	let { data } = event
	try {
		setBottomLoading(true)
		let vali = await onConfirmBeforeValidate()
		if (!vali) {
			setBottomLoading(false)
			return
		}
		let res = await invokeInnerHook(popupExtraData.value, hookNames.ON_POPUP_BEFORE_CONFIRM)
		await events.onConfirm(data ?? res)
		emit('confirm', data ?? res)
		await invokeInnerHook(popupExtraData.value, hookNames.ON_POPUP_CONFIRM)
		close()
	} finally {
		setBottomLoading(false)
	}
}

/**
 * 打开弹窗
 * @param {Object} options - 配置选项
 * @param {Object} options.data - 额外数据
 */
function open(options = {}) {
	const { data, ...args } = options
	popupExtraData.value = data
	footerConfig.value = null
	popupProps.value = getComponentProps(args, uvPopupProps.props)
	headerProps.value = getComponentProps(args, popupHeaderProps.props)
	footerProps.value = getComponentProps(args, popupFooterProps.props)
	if (isFunction(args.onCancel)) {
		events.onCancel = args.onCancel
	}
	if (isFunction(args.onConfirm)) {
		events.onConfirm = args.onConfirm
	}
	if (isFunction(args.onClose)) {
		events.onClose = args.onClose
	}
	nextTick().then(() => {
		popupRef.value.open()
	})
}

/**
 * 弹窗状态变化事件
 * @param {Object} e - 事件对象
 */
function onPopupChange(e) {
	visible.value = e.show
	if (!e.show) {
		onPopupClose()
	}
	// #ifdef MP-WEIXIN
	// 微信小程序popup未弹出也会进行渲染流程，导致childrenComponentLoadEvent事件提前触发
	if (e.show) {
		onPopupOpen()
	}
	// #endif
}

/**
 * 注册总线事件
 */
function onBusEvent() {
	uni.$on(childrenComponentEvents.ON_LOAD, ({ key }) => {
		// #ifndef MP-WEIXIN
		// h5 下需要popup弹出才会进入渲染，与微信小程序不一致
		if (visible.value && !componentLoaded[key]) {
			nextTick().then(() => {
				onPopupOpen(key)
			})
		}
		// #endif
		componentLoaded[key] = true
	})
	uni.$on(childrenComponentEvents.ON_UNLOAD, ({ key }) => {
		componentLoaded[key] = false
	})
}

/**
 * 设置底部配置
 * @param {Object} config - 配置
 */
function setFooterConfig(config) {
	footerConfig.value = config
}

// 注册总线事件
onBusEvent()

// 暴露组件方法
defineExpose({
	open,
	confirm: handleConfirm
})
</script>

<template>
	<!-- 弹窗头部 -->
	<uv-navbar
		v-bind="props"
		:safeAreaInsetTop="false"
		:border="headBorder"
		:autoBack="false"
		@leftClick="handleClose"
		:fixed="false"
	>
		<!-- 右侧关闭按钮 -->
		<template #right v-if="props.showCloseIcon">
			<NIcon
				name="close-line"
				color="var(--uv-main-color)"
				:size="props.rightIconSize"
				style="margin-right: 18rpx"
				@click="handleClose"
			/>
		</template>
	</uv-navbar>
</template>

<script setup name="PopupHeader">
import { popupHeaderProps } from './props'
import NIcon from '../NIcon'

// 定义组件选项
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true
	}
	// #endif
})

// 定义组件属性
const props = defineProps(popupHeaderProps.props)

// 定义组件事件
const emit = defineEmits({
	close: true // 关闭事件
})

/**
 * 处理关闭点击
 */
function handleClose() {
	emit('close')
}
</script>

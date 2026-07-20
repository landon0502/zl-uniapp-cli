<template>
	<!-- 弹窗底部栏 -->
	<view class="bottom-bar" :style="props.footerStyle">
		<!-- 顶部边框 -->
		<uv-line v-if="props.footerTopBorder" :color="props.footerBorderColor" />

		<!-- 按钮主题：独立按钮 -->
		<view class="p-24rpx" v-if="props.buttonTheme === 'button'">
			<uv-row gutter="16">
				<uv-col :span="12 / btnColumn" v-if="props.showCancelBtn">
					<view>
						<uv-button v-bind="cancelBtnProps" type="info" @click="handleCancel">
							{{ cancelText }}
						</uv-button>
					</view>
				</uv-col>
				<uv-col :span="12 / btnColumn" v-if="props.showConfirmBtn">
					<view>
						<uv-button
							type="primary"
							v-bind="confirmBtnProps"
							@click="handleConfirm"
							:loading="loading"
						>
							{{ okText }}
						</uv-button>
					</view>
				</uv-col>
			</uv-row>
		</view>

		<!-- 按钮主题：组合按钮 -->
		<view class="flex flex-row items-center justify-center py-24rpx" v-else>
			<view
				class="w-4/5 flex flex-row justify-center rounded-16rpx overflow-hidden"
				:style="props.buttonGroupStyle"
			>
				<view class="flex-1" v-if="props.showCancelBtn">
					<uv-button
						type="info"
						@click="handleCancel"
						:custom-style="{
							border: 0,
							background: 'var(--uv-primary-light)',
							width: '100%',
							borderRadius: 0,
							height: '44px'
						}"
						:customTextStyle="{
							color: 'var(--uv-primary)',
							fontSize: '16px'
						}"
						:text="cancelText"
						v-bind="cancelBtnProps"
					>
					</uv-button>
				</view>
				<view class="flex-1" v-if="props.showConfirmBtn">
					<uv-button
						type="primary"
						@click="handleConfirm"
						:loading="loading"
						:custom-style="{
							border: 0,
							background: 'var(--uv-primary)',
							width: '100%',
							borderRadius: 0,
							height: '44px'
						}"
						:custom-text-style="{
							color: 'var(--uv-white-color)',
							fontSize: '16px'
						}"
						:text="okText"
						v-bind="confirmBtnProps"
					>
					</uv-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup name="PopupFooter">
import { computed, ref } from 'vue'
import { popupFooterProps } from './props'

// 定义组件属性
const props = defineProps(popupFooterProps.props)
// 加载状态
const loading = ref(false)

// 计算按钮列数
const btnColumn = computed(() => {
	if (!props.showCancelBtn || !props.showConfirmBtn) {
		return 1
	}
	return 2
})

// 定义组件事件
const emit = defineEmits({
	cancel: true, // 取消事件
	confirm: true // 确认事件
})

/**
 * 处理取消点击
 */
function handleCancel() {
	emit('cancel')
}

/**
 * 处理确认点击
 */
function handleConfirm() {
	emit('confirm')
}

/**
 * 设置加载状态
 * @param {boolean} v - 是否显示加载
 */
function setLoading(v) {
	loading.value = v
}

// 暴露组件方法
defineExpose({
	setLoading
})
</script>

<style scoped lang="scss">
.bottom-bar {
	width: 100%;
	box-sizing: border-box;
}
</style>

<template>
	<uv-datetime-picker
		ref="datetimePickerRef"
		v-bind="props"
		:model-value="mergeValue"
		@update:modelValue="updateValue"
		@confirm="eventHandler('confirm', $event)"
		@cancel="eventHandler('cancel', $event)"
		@close="eventHandler('close', $event)"
	>
		<template #toolbar>
			<view
				:style="{
					borderTopLeftRadius: addUnit(props.round, 'px'),
					borderTopRightRadius: addUnit(props.round, 'px'),
					overflow: 'hidden'
				}"
			>
				<Navbar :fixed="false" :auth-back="false" :left-icon="''" :safeAreaInsetTop="false">
					<template #center>
						<view class="w-full h-full flex-center">
							<text class="font-size-16px font-600 text-#1D2129">{{ props.title }}</text>
						</view>
					</template>
					<template #right>
						<view @click="datetimePickerRef.getPickerCtx().close()">
							<NIcon name="close-line" :size="24" color="#000000" />
						</view>
					</template>
				</Navbar>
			</view>
		</template>
		<template #footer>
			<slot name="footer">
				<uv-line color="#E5E5E5" />
				<view class="flex flex-row items-center justify-center p-24rpx">
					<view class="w-4/5 flex flex-row justify-center rounded-16rpx overflow-hidden flex-1">
						<view class="flex-1">
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
								:text="props.cancelText"
								v-bind="props.cancelBtnProps"
							>
							</uv-button>
						</view>
						<view class="flex-1">
							<uv-button
								type="primary"
								@click="handleConfirm"
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
								:text="props.okText"
								v-bind="props.confirmBtnProps"
							>
							</uv-button>
						</view>
					</view>
				</view>
			</slot>
		</template>
	</uv-datetime-picker>
	<view v-if="$slots.default" @click="open" :style="props.customStyle">
		<slot :value="dayjs(mergeValue).isValid() ? dayjs(mergeValue).format(format) : void 0"></slot>
	</view>
</template>
<script setup>
import { computed, shallowRef } from 'vue'
import Navbar from '../NavBar'
import NIcon from '../NIcon'
import datetimeProps from './props'
import { useMergeModelValue } from '@/composables'
import dayjs from 'dayjs'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function'
const props = defineProps(datetimeProps.props)
const emit = defineEmits({
	'update:modelValue': true,
	change: true,
	confirm: true,
	cancel: true,
	close: true
})
/**
 * 组件实例
 */
const datetimePickerRef = shallowRef()

/**
 * 组件变量
 */
const mergeValue = useMergeModelValue(
	() => {
		if (dayjs(props.modelValue).isValid()) {
			return dayjs(props.modelValue).valueOf()
		}
		return void 0
	},
	{
		set(v) {
			emit('update:modelValue', dayjs(v).format(format.value))
		}
	}
)

const format = computed(() => {
	if (props.format) return props.format
	if (props.mode === 'datetime') {
		return 'YYYY-MM-DD HH:mm:ss'
	} else if (props.mode === 'date') {
		return 'YYYY-MM-DD'
	} else if (props.mode === 'time') {
		return 'HH:mm'
	} else if (props.mode === 'year-month') {
		return 'YYYY-MM'
	} else if (props.mode === 'year') {
		return 'YYYY'
	}
	return ''
})

const eventHandler = (name, v) => {
	emit(name, v)
}

const handleCancel = () => {
	datetimePickerRef.value?.getPickerCtx()?.cancel()
}
const handleConfirm = () => {
	datetimePickerRef.value?.getPickerCtx()?.confirm()
}
const updateValue = (v) => {
	mergeValue.value = v
}

const open = () => {
	datetimePickerRef.value.open()
}
defineExpose({
	open
})
</script>
<style lang="scss" scoped></style>

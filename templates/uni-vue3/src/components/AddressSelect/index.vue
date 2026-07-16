<template>
	<WithPopup ref="popupRef">
		<Plane :level="props.level" />
	</WithPopup>
	<view v-if="$slots.default" @click="open">
		<slot></slot>
	</view>
</template>
<script setup>
import { shallowRef } from 'vue'
import WithPopup from '../WithPopup'
import Plane from './Plane.vue'
import { useMergeModelValue } from '@/composables'
import { ADDRESS_SELECT_PUPOP_KEY } from './context'

const props = defineProps({
	modelValue: Array,
	level: {
		validator(v) {
			return ['province', 'city', 'district', 'street'].includes(v)
		},
		default: 'street'
	},
	disabled: Boolean
})

const emit = defineEmits({
	'update:modelValue': true,
	change: true,
	confirm: true,
	close: true
})
/**
 * 组件实例
 */
const popupRef = shallowRef()

/**
 * 组件变量
 */
const mergeValue = useMergeModelValue(() => props.modelValue || [], {
	defaultValue: [],
	set(v) {
		emit('update:modelValue', v)
		emit('change', v)
	}
})

const open = () => {
	if (props.disabled) return
	popupRef.value.open({
		mode: 'bottom',
		title: '选择地区',
		round: 16,
		buttonTheme: 'group',
		titleStyle: {
			fontWeight: 'bold'
		},
		data: {
			[ADDRESS_SELECT_PUPOP_KEY]: [...mergeValue.value]
		},
		onConfirm(res) {
			mergeValue.value = [...res[ADDRESS_SELECT_PUPOP_KEY]]
			emit('confirm', mergeValue.value)
		},
		onCancel() {
			emit('cancel')
		},
		onClose() {
			emit('close')
		}
	})
}

defineExpose({
	open
})
</script>
<style lang="scss" scoped></style>

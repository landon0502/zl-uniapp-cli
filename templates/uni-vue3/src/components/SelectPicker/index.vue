<template>
	<WithPopup ref="popupRef">
		<uv-line color="#E7E7E7" />
		<Plane />
	</WithPopup>
	<view v-if="$slots.default" @click="open" class="w-full" :style="props.customStyle">
		<slot :selected="selected"></slot>
	</view>
</template>
<script setup>
import { computed, shallowRef, ref } from 'vue'
import WithPopup from '../WithPopup'
import Plane from './Plane.vue'
import selectProps from './props'
import { useMergeModelValue } from '@/composables'
import { SELECT_PUPOP_KEY } from './context'
import { isEmpty } from 'lodash'

const props = defineProps(selectProps.props)

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
const mergeValue = useMergeModelValue(() => props.modelValue, {
	set(v) {
		emit('update:modelValue', v)
		emit('change', v)
	}
})
const curConfig = ref({})
const selectPlaneConfig = computed(() => {
	return {
		modelValue: mergeValue.value,
		list: props.list,
		keyValue: props.keyValue,
		keyName: props.keyName,
		multiple: props.multiple,
		...curConfig.value
	}
})

const selected = computed(() => {
	if (isEmpty(selectPlaneConfig.value.list)) return null
	if (selectPlaneConfig.value.multiple) {
		return selectPlaneConfig.value.list
			.filter(
				(item) =>
					Array.isArray(mergeValue.value) &&
					mergeValue.value.includes(item[selectPlaneConfig.value.keyValue])
			)
			.map((item) => ({
				[selectPlaneConfig.value.keyValue]: item[selectPlaneConfig.value.keyValue],
				[selectPlaneConfig.value.keyName]: item[selectPlaneConfig.value.keyName]
			}))
	}
	let cur = selectPlaneConfig.value.list.find(
		(item) => item[selectPlaneConfig.value.keyValue] === mergeValue.value
	)
	return (
		cur && {
			[selectPlaneConfig.value.keyValue]: cur[selectPlaneConfig.value.keyValue],
			[selectPlaneConfig.value.keyName]: cur[selectPlaneConfig.value.keyName]
		}
	)
})

const open = (options = {}) => {
	if (props.disabled) return
	const showCancelBtn = options.showCancelButton || props.showCancelButton
	const showConfirmBtn =
		options.showConfirmButton || props.showConfirmButton || options.multiple || props.multiple

	const popupData = {
		modelValue: mergeValue.value,
		list: options.list || props.list,
		keyValue: options.keyValue || props.keyValue,
		keyName: options.keyName || props.keyName,
		immediateChangeData: !showConfirmBtn,
		multiple: options.multiple || props.multiple
	}

	curConfig.value = popupData
	popupRef.value.open({
		mode: 'bottom',
		title: options.title || props.title,
		footer: showConfirmBtn || showConfirmBtn,
		showCancelBtn,
		showConfirmBtn,
		round: 16,
		buttonTheme: 'group',
		titleStyle: {
			fontWeight: 'bold'
		},
		data: {
			[SELECT_PUPOP_KEY]: popupData
		},
		onConfirm(res) {
			mergeValue.value = popupData.multiple ? res[SELECT_PUPOP_KEY] : res[SELECT_PUPOP_KEY]?.[0]
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
	open,
	selected
})
</script>
<style lang="scss" scoped></style>

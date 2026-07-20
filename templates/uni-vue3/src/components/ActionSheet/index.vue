<template>
	<uv-action-sheet ref="actionSheet" v-bind="props" @select="select" @close="close">
	</uv-action-sheet>
	<view @click="open" :style="props.customStyle">
		<slot :selected="selected"></slot>
	</view>
</template>
<script setup>
import { shallowRef } from 'vue'
import actionSheetProps from '@/uni_modules/uv-action-sheet/components/uv-action-sheet/props'
import { useMergeModelValue } from '@/composables'
const props = defineProps({
	...actionSheetProps.props,
	round: {
		type: Number,
		default: 16
	},
	customStyle: Object,
	modelValue: [String, Number],
	keyValue: {
		type: String,
		default: 'value'
	}
})

const emit = defineEmits({
	close: true,
	select: true
})

const actionSheet = shallowRef()

const selected = useMergeModelValue(
	() => props.actions.find((item) => item[props.keyValue] === props.modelValue),
	{
		set(v) {
			emit('update:modelValue', v[props.keyValue])
		}
	}
)

const open = () => {
	actionSheet.value.open()
}
const select = (e) => {
	selected.value = e
	emit('select', e)
}
const close = () => {
	emit('close')
}
</script>

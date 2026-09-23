<template>
	<view>
		<uv-picker
			ref="pickerRef"
			v-bind="props"
			:columns="columns"
			:keyName="props.keyName"
			@confirm="onConfirm"
			@change="onChange"
			@cancel="onCancel"
			@close="onClose"
		></uv-picker>
		<view @click="openPicker">
			<slot></slot>
		</view>
	</view>
</template>
<script setup>
import { computed, shallowRef } from 'vue'
import pickerProps from './props'
import { useMergeModelValue, useDefineInvoke } from '@/composables'
import { isEmpty, isFunction } from 'lodash'
import { getTreeDepth } from '@/utils/utils'

const props = defineProps(pickerProps.props)
const emit = defineEmits({
	'update:modelValue': true,
	change: true,
	confirm: true,
	cancel: true,
	close: true
})

const pickerRef = shallowRef()
const invoke = useDefineInvoke(() => pickerRef.value && !isEmpty(props.modelValue))
const mergeValue = useMergeModelValue(() => props.modelValue)

const optionsDepth = computed(() => getTreeDepth(props.options, 'children', 0))

const getColumnsByColIndex = (columnIndex, record) => {
	if (!record || columnIndex >= optionsDepth.value) {
		return []
	}

	let list = new Array(optionsDepth.value - columnIndex).fill([])
	let currentChildren = record.children
	let currentColIndex = 0
	while (currentColIndex <= optionsDepth.value - columnIndex && currentChildren) {
		list[currentColIndex] = currentChildren
		currentChildren = list[currentColIndex][0].children
		currentColIndex++
	}
	return list
}

const columns = useMergeModelValue(
	() => {
		if (isEmpty(props.options)) {
			return []
		}
		return getColumnsByColIndex(-1, { children: props.options })
	},
	{
		defaultValue: []
	}
)

const openPicker = () => {
	if (props.disabled) {
		return
	}
	pickerRef.value.open()
}

const onConfirm = (e) => {
	let value = e.value.filter(Boolean).map((item) => item[props.keyValue])

	if (isEmpty(value)) {
		mergeValue.value = columns.value.map(([first]) => {
			return first?.[props.keyValue]
		})
	} else {
		mergeValue.value = value
	}
	emit('update:modelValue', mergeValue.value)
	emit('confirm', mergeValue.value)
}

const onChange = async (e) => {
	const { columnIndex, index, indexs } = e
	const currentColRecord = columns.value?.[columnIndex]?.[index]
	if (isFunction(props.loadData)) {
		let data = await props.loadData()
		if (!isEmpty(data)) {
			columns.value[columnIndex + 1] = data
		}
	} else if (optionsDepth.value > columnIndex && currentColRecord) {
		columns.value.splice(
			columnIndex + 1,
			optionsDepth.value - columnIndex,
			...getColumnsByColIndex(columnIndex, currentColRecord)
		)
	}

	if (indexs.length > columns.value.length) {
		pickerRef.value.setIndexs(indexs.slice(0, columns.value.length), true)
	} else {
		pickerRef.value.setIndexs(
			new Array(columns.value.length).fill(0).map((v, index) => {
				return indexs[index] ?? v
			}),
			true
		)
	}

	let value = e.value.filter(Boolean).map((item) => item[props.keyValue])
	mergeValue.value = value
	emit('change', value, e)
}

const onCancel = () => {
	emit('cancel')
}
const onClose = () => {
	emit('close')
}

const initIndexs = () => {
	if (isEmpty(mergeValue.value)) {
		return
	}
	let indexs = []
	mergeValue.value.forEach((v, index) => {
		let i = columns.value[index].findIndex((item) => item[props.keyValue] === v)
		indexs.push(i)
	})
	pickerRef.value.setIndexs(indexs, true)
}
invoke(initIndexs)

defineExpose({
	open: openPicker
})
</script>
<style lang="scss" scoped></style>

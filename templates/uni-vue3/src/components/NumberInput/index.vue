<template>
	<uv-input ref="inputRef" @blur="blur" v-bind="props" />
</template>

<script setup>
import { shallowRef } from 'vue'
import uvInputProps from './props.js'
const emit = defineEmits(['update:modelValue', 'blur'])
const props = defineProps(uvInputProps.props)

const inputRef = shallowRef(null)

function limitDecimal(value) {
	if (props.limitDecimal) return props.limitDecimal(value)
	// const decimalPattern = new RegExp(`^(\\d+)\\.(\\d{${props.limit}}).*$`)
	let val = value
		.replace(/[^\d.]/g, '') // 只保留数字和小数点
		.replace(/\.{2,}/g, '.') // 多个小数点变一个
		.replace('.', '$#$')
		.replace(/\./g, '')
		.replace('$#$', '.')

	if (props.limit === 0) {
		// 只保留整数部分，丢弃小数点和后面的所有内容
		return val.replace(/\..*$/, '') || '0'
	}
	val = val.replace(new RegExp(`^(\\d+)\\.(\\d{${props.limit}}).*$`), '$1.$2')
	return props.isComplete
		? val
				.replace(new RegExp(`^(\\d+)\\.(\\d{1,${props.limit - 1}})$`), (match, int, dec) => {
					// 不足 props.limit 位，补0
					return `${int}.${dec.padEnd(props.limit, '0')}`
				})
				.replace(/^(\d+)$/, (match, int) => {
					// 整数，补小数点 + props.limit 个0
					return `${int}.${'0'.repeat(props.limit)}`
				})
		: val
}
const blur = async (e) => {
	if (e === '' && props.modelValue === e) return // 未输入过值，仅仅失焦时，不做处理
	let value = limitDecimal(e?.toString?.() ?? '0')
	if (props.max && value > props.max) {
		value = props.max
	}
	inputRef.value.onInput({
		detail: {
			value
		}
	})
	emit('update:modelValue', value)
	emit('blur', value)
}
</script>

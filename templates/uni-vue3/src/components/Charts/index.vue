<template>
	<view :style="props.customStyle">
		<l-echart ref="chartRef" @finished="initChart"></l-echart>
	</view>
</template>
<script setup>
import { shallowRef, watch } from 'vue'
import * as echarts from 'echarts'
import { useMergeModelValue, useDebounceFn, useDefineInvoke } from '@/composables'
import { isEmpty, isFunction } from 'lodash'
import chartsProps from '@/uni_modules/lime-echart/components/l-echart/props'
const props = defineProps({
	...chartsProps,
	customStyle: Object,
	options: {
		type: Object,
		default() {
			return {}
		}
	},
	init: Function
})
const mergeOptions = useMergeModelValue(() => props.options, {
	defaultValue: {}
})

const chartRef = shallowRef(),
	chartCtx = shallowRef()
const renderInvoke = useDefineInvoke(() => !isEmpty(chartRef.value))
const [initChart] = useDebounceFn(async () => {
	if (isFunction(props.init)) {
		return props.init(chartRef.value)
	}
	if (!chartRef.value || isEmpty(mergeOptions.value)) return
	try {
		if (isEmpty(chartCtx.value)) chartCtx.value = await chartRef.value.init(echarts)
		chartRef.value.setOption(mergeOptions.value)
	} catch (error) {
		console.error('图表初始化失败:', error)
	}
}, 200)
watch(
	[mergeOptions],
	() => {
		renderInvoke(initChart)
	},
	{ deep: true, flush: 'post' }
)

defineExpose({
	context: chartCtx
})
</script>

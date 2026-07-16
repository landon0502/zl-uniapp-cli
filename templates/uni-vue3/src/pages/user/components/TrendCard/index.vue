<template>
	<Card title="周期趋势">
		<template #head-right>
			<view class="w-280rpx chart-tabs">
				<Tabs
					:list="[
						{
							name: '近30天',
							value: 30
						},
						{
							name: '近7天',
							value: 7
						}
					]"
					keyName="name"
					keyValue="value"
					:scrollable="false"
					:lineHeight="0"
					:customTabsStyle="{ gap: '24rpx' }"
					:itemStyle="{
						height: '56rpx',
						borderRadius: '8rpx',
						flexShrink: 0,
						width: '126rpx'
					}"
					:inactiveStyle="{
						color: 'var(--uv-gray-color)',
						fontSize: '12px',
						whiteSpace: 'nowrap'
					}"
					:activeStyle="{
						color: 'var(--uv-primary)',
						fontSize: '12px',
						whiteSpace: 'nowrap'
					}"
					:value="dateType"
					@change="chartTabChange"
				/>
			</view>
		</template>
		<template #content>
			<view class="w-full h-240px">
				<Charts
					:options="options"
					:custom-style="{ width: '100%', height: '240px' }"
					ref="chartsRef"
				/>
			</view>
		</template>
	</Card>
</template>
<script setup>
import { computed, ref, shallowRef } from 'vue'
import Card from '@/components/Card'
import dayjs from 'dayjs'
import Tabs from '@/components/Tabs'
import * as echarts from 'echarts'
import Charts from '@/components/Charts'
import useServices from '../../useServices'
const props = defineProps({
	id: String
})

const dateType = ref(30)
const chartsRef = shallowRef()
const { myPeriodOrderTrendControl } = useServices()
const { data: trendData } = myPeriodOrderTrendControl
const options = computed(() => {
	let categories = [],
		series = []

	let serieItem = {
		name: '下单金额(元)',
		data: [],
		type: 'line',
		symbol: 'none', // 关键配置
		smooth: true,
		lineStyle: {
			color: '#3D7EFF',
			width: 2
		},
		areaStyle: {
			color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				{
					offset: 0,
					color: 'rgba(61, 126, 255, 0.3)'
				},
				{
					offset: 1,
					color: 'rgba(61, 126, 255, 0.05)'
				}
			])
		}
	}
	let lineSerieItem = {
		...serieItem,
		name: '下单客户数(家)',
		data: [],
		lineStyle: {
			color: '#30A056',
			width: 2
		},
		areaStyle: {
			color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
				{
					offset: 0,
					color: 'rgba(48, 160, 86, 0.3)'
				},
				{
					offset: 1,
					color: 'rgba(48, 160, 86, 0.05)'
				}
			])
		}
	}

	let dates = []
	let { startTime, endTime } = getTimeParams(dateType.value)
	let currentTime = dayjs(startTime)
	while (!currentTime.isAfter(endTime, 'day')) {
		dates.push(currentTime)
		currentTime = currentTime.add(1, 'day')
	}
	dates.forEach((d) => {
		let dayAmount = trendData.value?.find?.((item) => d.isSame(item.date, 'day'))
		categories.push(`${d.format('YYYY')}\n${dayjs(d).format('M-DD')}`)
		serieItem.data.push(Number(dayAmount?.amount ?? 0))
		lineSerieItem.data.push(Number(dayAmount?.customernum ?? 0))
	})
	series.push(serieItem)
	series.push(lineSerieItem)
	return {
		animation: false,
		color: ['#3D7EFF', '#30A056'],
		legend: {
			show: true,
			data: ['下单金额(元)', '下单客户数(家)'],
			top: 0,
			left: 0
		},
		tooltip: {
			trigger: 'axis',
			borderWidth: 0,
			borderColor: 'rgba(0,0,0,0)'
		},
		grid: {
			top: 30,
			left: 0,
			right: 0,
			bottom: 0
		},
		xAxis: {
			type: 'category',
			data: categories,
			axisLabel: {
				fontSize: 10
			},
			boundaryGap: false // 关键
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				fontSize: 10,
				show: false
			},
			show: true,
			splitLine: {
				lineStyle: {
					type: 'dashed'
				}
			}
		},
		series
	}
})
/**
 * 切换列表状态
 */
const getTimeParams = (type) => {
	return {
		startTime: dayjs().subtract(type, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
		endTime: dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
	}
}
const chartTabChange = async (e) => {
	try {
		dateType.value = e.value
		chartsRef.value.context.showLoading()
		await init()
	} finally {
		chartsRef.value.context.hideLoading()
	}
}

const init = async () => {
	myPeriodOrderTrendControl.run({
		employeeId: props.id,
		...getTimeParams(dateType.value)
	})
}

defineExpose({
	load: init
})
</script>
<style lang="scss" scoped>
:deep(.uv-steps--column) {
	.uv-steps-item__line {
		background: #00000042 !important;
	}
}
.chart-tabs {
	:deep(.uv-tabs__wrapper__nav) {
		gap: 20rpx;
	}
	:deep(.uv-tabs__wrapper__nav__item) {
		background: #f7f8fa;
	}
	:deep(.uv-tabs__wrapper__nav__item__active) {
		background: var(--uv-primary-light);
	}
}
</style>

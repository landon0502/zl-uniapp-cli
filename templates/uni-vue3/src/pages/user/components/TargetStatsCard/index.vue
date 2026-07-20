<template>
	<Card title="目标达成" titleSize="16px">
		<template #head-right>
			<view class="w-400rpx flex-horizontal items-center gap-16rpx">
				<view
					v-for="item in detaFilterOpts"
					:key="item.value"
					class="w-96rpx h-56rpx bg-#F7F7F9 rounded-8rpx flex-center"
					:class="{ 'date-filter__active': selectedDateType === item.value }"
					@click="changeDateType(item.value)"
				>
					<text class="font-size-12px line-height-20px text-#00000099 date-type-text">{{
						item.name
					}}</text>
				</view>
			</view>
		</template>
		<template #content>
			<view class="flex-horizontal gap-24rpx pt-24rpx">
				<view class="flex-1 flex-vertical gap-16rpx mr-12rpx">
					<text class="font-size-14px text-lightgray">{{ statsConfig.priceText }}</text>
					<text class="font-size-20px font-bold text-black">{{ statsConfig.price }}</text>

					<view class="flex-vertical" v-if="!isEmpty(statsConfig.priceOverStats)">
						<view
							v-for="(item, index) in statsConfig.priceOverStats"
							:key="index"
							class="flex-horizontal justify-between"
						>
							<text class="font-size-12px text-lightgray line-height-20px">{{ item.name }}</text>
							<text
								class="font-size-12px text-red line-height-20px"
								:style="{ color: item.value > 0 ? '#30A056' : '#F53F3F' }"
								>{{ item.value > 0 ? '+' : '' }}{{ item.value }}%</text
							>
						</view>
					</view>
				</view>
				<view class="min-h-full">
					<uv-line direction="col" :color="'#E7E7E7'" />
				</view>

				<view class="flex-1 flex-vertical gap-16rpx">
					<text class="font-size-14px text-lightgray">{{ statsConfig.customerCountText }}</text>
					<text class="font-size-20px font-bold text-black">{{ statsConfig.customerCount }}</text>
					<view class="flex-vertical" v-if="!isEmpty(statsConfig.customerCountOverStats)">
						<view
							v-for="(item, index) in statsConfig.customerCountOverStats"
							:key="index"
							class="flex-horizontal justify-between"
						>
							<text class="font-size-12px text-lightgray line-height-20px">{{ item.name }}</text>
							<text
								class="font-size-12px text-red line-height-20px"
								:style="{
									color: item.value > 0 ? '#30A056' : '#F53F3F'
								}"
								>{{ item.value > 0 ? '+' : '' }}{{ item.value }}%</text
							>
						</view>
					</view>
				</view>
			</view>
		</template>
	</Card>
</template>
<script setup>
import Card from '@/components/Card'
import { isEmpty } from 'lodash'
import { computed, ref, unref } from 'vue'
import useServices from '../../useServices'
import dayjs from 'dayjs'
const { goalAttainmentControl } = useServices()
const props = defineProps({
	id: String
})
const detaFilterOpts = [
	{
		name: '本月',
		value: 'month'
	},
	{ name: '本周', value: 'week' },
	{
		name: '昨日',
		value: 'yesterday'
	},
	{
		name: '今日',
		value: 'today'
	}
]
const selectedDateType = ref('today')
const { data: goalData } = goalAttainmentControl

const statsConfig = computed(() => {
	const selected = unref(detaFilterOpts).find((item) => item.value === selectedDateType.value)
	const priceText = `${selected.name}下单金额（元）`
	const customerCountText = `${selected.name}下单客户数（家）`

	return {
		priceText: priceText,
		customerCountText: customerCountText,
		price: goalData.value?.amount ?? '--',
		customerCount: goalData.value?.customernum ?? '--',
		...{
			month: {
				priceOverStats: [
					{
						name: '较上月',
						value: goalData.value?.amountrate ?? '--'
					}
				],
				customerCountOverStats: [
					{
						name: '较上月',
						value: goalData.value?.customerrate ?? '--'
					}
				]
			},
			week: {
				priceOverStats: [
					{
						name: '较上周',
						value: goalData.value?.amountrate ?? '--'
					}
				],
				customerCountOverStats: [
					{
						name: '较上周',
						value: goalData.value?.customerrate ?? '--'
					}
				]
			},
			yesterday: {},
			today: {
				priceOverStats: [
					{
						name: '较昨日',
						value: goalData.value?.amountrate ?? '--'
					},
					{
						name: '较上周同期',
						value: goalData.value?.alwsamedayrate ?? '--'
					}
				],
				customerCountOverStats: [
					{
						name: '较昨日',
						value: goalData.value?.customerrate ?? '--'
					},
					{
						name: '较上周同期',
						value: goalData.value?.clwsamedayrate ?? '--'
					}
				]
			}
		}[selectedDateType.value]
	}
})
/**
 * 切换列表状态
 */
const getTimeParams = (type) => {
	if (type === 'today') {
		return {
			startTime: dayjs().startOf('D').format('YYYY-MM-DD HH:mm:ss'),
			endTime: dayjs().endOf('D').format('YYYY-MM-DD HH:mm:ss')
		}
	}
	if (type === 'yesterday') {
		return {
			startTime: dayjs().subtract(1, 'd').startOf('D').format('YYYY-MM-DD HH:mm:ss'),
			endTime: dayjs().subtract(1, 'd').endOf('D').format('YYYY-MM-DD HH:mm:ss')
		}
	}
	return {
		startTime: dayjs().startOf(type).format('YYYY-MM-DD HH:mm:ss'),
		endTime: dayjs().endOf(type).format('YYYY-MM-DD HH:mm:ss')
	}
}
const changeDateType = (value) => {
	selectedDateType.value = value
	init()
}

const init = async () => {
	await goalAttainmentControl.run({
		employeeId: props.id,
		dateType: { today: 1, yesterday: 2, week: 3, month: 4 }[selectedDateType.value],
		...getTimeParams(selectedDateType.value)
	})
}

defineExpose({
	load: init
})
</script>
<style lang="scss" scoped>
.date-filter__active {
	background: $uv-primary-light;
	.date-type-text {
		color: $uv-primary;
	}
}
</style>

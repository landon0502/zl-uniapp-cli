<template>
	<Card
		:show-header="false"
		:custom-content-style="{ padding: '40rpx 50rpx' }"
		:custom-style="{ padding: 0 }"
	>
		<template #content>
			<view>
				<uv-grid :col="3" :border="false">
					<uv-grid-item v-for="(item, index) in numStatics" :key="index">
						<view class="flex-vertical items-center gap-10rpx">
							<text class="font-size-24px font-700 text-black line-height-22px">{{
								item.value
							}}</text>
							<text class="font-size-14px text-lightgray line-height-22px">{{ item.name }}</text>
						</view>
					</uv-grid-item>
				</uv-grid>
				<view class="mt-40rpx" v-if="props.showBtn">
					<uv-button
						text="去执行"
						@click="router.tab({ url: 'pages/tasks/index' })"
						type="primary"
						:custom-style="{
							borderRadius: '8px',
							height: '34px'
						}"
						:custom-text-style="{ fontSize: '14px' }"
					></uv-button>
				</view>
			</view>
		</template>
	</Card>
</template>
<script setup>
import { computed } from 'vue'
import Card from '@/components/Card'
import router from '@/router'
const props = defineProps({
	data: Object,
	showBtn: Boolean
})

/**
 * 数字面板统计
 */
const numStatics = computed(() => {
	return [
		{
			name: '今日拜访',
			value: props.data?.visitednum || 0
		},
		{
			name: '拜访下单',
			value: props.data?.ordernum || 0
		},
		{
			name: '线索添加',
			value: props.data?.cluenum || 0
		}
	]
})
</script>
<style lang="scss" scoped></style>

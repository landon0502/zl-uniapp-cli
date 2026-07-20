<template>
	<Card
		:show-header="false"
		:custom-content-style="{ padding: '32rpx' }"
		:custom-style="{ padding: 0 }"
	>
		<template #content>
			<uv-grid :col="5" :border="false">
				<uv-grid-item>
					<view class="flex-vertical items-center" @click="clickHander()">
						<NIcon :name="clueIcon" :size="40" />
						<text class="font-size-12px text-black line-height-20px">客户线索</text>
					</view>
				</uv-grid-item>
			</uv-grid>
		</template>
	</Card>
</template>
<script setup>
import Card from '@/components/Card'
import clueIcon from '@/assets/images/clue-icon.png'
import NIcon from '@/components/NIcon'
import router from '@/router'

const props = defineProps({
	userId: String
})

const clickHander = () => {
	router.to({
		url: 'pages/purchaser/clues/index',
		params: {
			userId: props.userId
		}
	})
}
</script>
<style lang="scss" scoped></style>

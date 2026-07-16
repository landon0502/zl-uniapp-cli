<template>
	<view class="card" :style="customStyle" @click="onClick">
		<!-- Header -->
		<view class="card-header" v-if="showHeader">
			<slot name="head">
				<view class="card-head-row" :style="customHeadStyle">
					<!-- title -->
					<slot name="title">
						<view class="card-title">
							<view v-if="icon">
								<uv-icon
									:name="icon"
									:size="iconSize"
									:color="iconColor"
									:width="iconWidth"
									:height="iconHeight"
									:imgMode="iconImageMode"
								/>
							</view>

							<uv-text
								:text="title"
								:lines="titleLines"
								:bold="titleBold"
								:color="titleColor"
								:size="titleSize"
								:lineHeight="titleLineHeight"
							/>
						</view>
					</slot>

					<view class="card-head-right">
						<slot name="head-right" />
					</view>
				</view>
			</slot>

			<view class="card-line" v-if="showHeadLine">
				<uv-line />
			</view>
		</view>

		<!-- Content -->
		<view class="card-content" :style="customContentStyle">
			<slot name="content" />
		</view>

		<!-- Footer -->
		<view class="card-footer" :style="customFooterStyle">
			<slot name="footer" />
		</view>
	</view>
</template>

<script setup>
import cardProps from './props'
defineProps(cardProps.props)
const emit = defineEmits({ click: true })
const onClick = () => {
	emit('click')
}
</script>

<style>
.card {
	display: flex;
	flex: 1;
	background-color: #ffffff;
	border-radius: 16rpx;
	flex-direction: column;
	padding-top: 24rpx;
	padding-bottom: 24rpx;
}

.card-header {
	padding-left: 24rpx;
	padding-right: 24rpx;
}

.card-head-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	flex-wrap: nowrap;
	margin-bottom: 24rpx;
}

.card-title {
	display: flex;
	flex-direction: row;
	align-items: center;
	overflow: hidden;
	/* #ifdef APP-NVUE */
	width: 550rpx;
	/* #endif */
}

.card-line {
	margin-top: 24rpx;
}

.card-content {
	display: flex;
	flex-direction: column;
	padding-left: 24rpx;
	padding-right: 24rpx;
}

.card-footer {
	display: flex;
	flex-direction: column;
	padding-left: 24rpx;
	padding-right: 24rpx;
}
</style>

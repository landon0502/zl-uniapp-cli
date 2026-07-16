<template>
	<view class="p-24rpx flex-vertical pt-32rpx p-60rpx">
		<view class="flex-center mt-32rpx">
			<text class="font-size-16px text-black">我的邀请码</text>
		</view>
		<view class="flex-vertical gap-32rpx mt-32rpx">
			<uv-loading-icon timing-function="linear" v-if="loading"></uv-loading-icon>
			<view class="flex-vertical gap-8rpx" v-for="item in data" :key="item.code">
				<text class="font-size-14px text-gray line-height-22px">{{ item.name }}</text>
				<view
					class="flex-horizontal items-center gap-4px justify-between h-80rpx bg-#F7F8FA px-24rpx rounded-8rpx mt-8rpx"
				>
					<text class="font-size-16px text-gray line-height-24px">邀请码：{{ item.code }}</text>
					<NIcon
						name="file-copy"
						:size="16"
						color="var(--uv-primary)"
						@click="copyText(item.code)"
					/>
				</view>
			</view>
			<uv-empty v-if="!loading && isEmpty(data)" :text="'还没有邀请码！！！'" :icon="emptyImage" />
		</view>
	</view>
</template>
<script setup>
import NIcon from '@/components/NIcon'
import useServices from '../../useServices'
import usePopupContext from '@/components/WithPopup/usePopupContext'
import { isEmpty } from 'lodash'
import emptyImage from '@/assets/images/no-data.png'

const props = defineProps({
	userid: String
})
const { inviteCodeControl } = useServices()
const { listener } = usePopupContext({ key: 'invite-code' })

const { data, loading } = inviteCodeControl

function copyText(text) {
	if (!text) return

	uni.setClipboardData({
		data: String(text),
		success() {
			uni.showToast({
				title: '复制成功',
				icon: 'none'
			})
		}
	})
}

const getCode = async () => {
	await inviteCodeControl.run({
		employeeId: props.userid
	})
}
listener.onOpen(() => {
	getCode()
})
</script>
<style lang="scss" scoped></style>

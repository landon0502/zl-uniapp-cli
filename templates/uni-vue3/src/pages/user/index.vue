<template>
	<PageContainer
		:nav-bar-props="{ bgColor: 'transparent', autoBack: false, title: '个人中心' }"
		:custom-style="{
			backgroundImage: `url(${bdBg})`,
			backgroundSize: '100% 590rpx',
			backgroundRepeat: 'no-repeat',
			backgroundColor: '#F1F3F7'
		}"
		:content-style="{ padding: 0 }"
		show-nav-bar
		footer
		:safeAreaInsetBottom="false"
		fixedContentHeight
		:showSeletonsRenderContent="false"
	>
		<ScrollPaging refreshonly ref="pagingRef">
			<view class="w-full flex-vertical gap-24rpx p-24rpx box-border"> 个人中心 </view>
		</ScrollPaging>

		<template #footer>
			<Tabbar />
		</template>
	</PageContainer>
</template>
<script setup>
import PageContainer from '@/components/PageContainer'
import Tabbar from '@/components/Tabbar'
import { shallowRef } from 'vue'
import bdBg from '@/assets/images/bd-bg.png'
import ScrollPaging from '@/components/ScrollPaging'
import useScrollPaging from '@/components/ScrollPaging/useScrollPaging'
import { useMergeModelValue, useDefineInvoke } from '@/composables'
import { useUserStore } from '@/store'
import { isEmpty } from 'lodash'
import { onReady } from '@dcloudio/uni-app'

const userStore = useUserStore()
/**
 * 组件实例
 */
const pagingRef = shallowRef()

const currentUser = useMergeModelValue(() => {
	if (isEmpty(userStore.userData)) return null
	return {
		id: userStore.userData.id,
		name: userStore.userData.name
	}
})

const userDefineInvoke = useDefineInvoke(() => !isEmpty(currentUser.value))

useScrollPaging(pagingRef, {
	async onLoad() {
		await init()
	},
	async onRefresh() {
		await userDefineInvoke(init)
	}
})

const init = async () => {
	await userStore.getUserInfo()
}
onReady(() => {
	userDefineInvoke(init)
})
</script>
<style lang="scss" scoped></style>

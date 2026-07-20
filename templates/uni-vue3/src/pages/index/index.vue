<template>
	<PageContainer
		:nav-bar-props="{ bgColor: 'transparent', autoBack: false, title: '首页' }"
		:custom-style="{
			backgroundSize: '140% 860rpx',
			backgroundRepeat: 'no-repeat',
			backgroundColor: '#27C1A5'
		}"
		show-nav-bar
		footer
		:safeAreaInsetBottom="false"
		fixedContentHeight
		useSkeletons
		:contentStyle="{ padding: 0, background: '#f8f8f8' }"
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
import usePageContext from '@/components/PageContainer/usePageContext'
import Tabbar from '@/components/Tabbar'
import createSkeletons from './skeletons'
import ScrollPaging from '@/components/ScrollPaging'
import useScrollPaging from '@/components/ScrollPaging/useScrollPaging'
import { onReady } from '@dcloudio/uni-app'
import { shallowRef } from 'vue'

const { skeletons } = usePageContext()

/**
 * 组件实例
 */
const pagingRef = shallowRef()

useScrollPaging(pagingRef, {
	async onLoad() {
		await init()
	},
	async onRefresh() {
		await init()
	}
})

const init = async () => {}
onReady(async () => {
	try {
		skeletons.show(createSkeletons)
		await init()
	} finally {
		skeletons.hide()
	}
})
</script>

<style scoped lang="scss">
.line-one {
	font-weight: 500;
	width: 560rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.top-box {
	position: relative;
	overflow: hidden;
	.top-bg {
		position: absolute;
		width: 100%;
		z-index: 0;
		top: 0;
	}
	.top-extra-bg {
		position: inherit;
		z-index: 1;
	}
}
.nav-bg {
	width: 100%;
	height: 88rpx;
	vertical-align: top;
	object-fit: contain;
}
.nav-bg-main {
	width: 100%;
	height: 562rpx;
	object-fit: contain;
	vertical-align: top;
}
.nav-bar-custom {
	padding: 0 26rpx;
	box-sizing: border-box;
	font-size: 32rpx;
	font-weight: bold;
	color: #fff;
	background: transparent;
	height: 48px;
}
.ScrollPaging {
	padding: 32rpx 24rpx 0;
	box-sizing: border-box;
	background-color: #f8f8f8;
}
.nav-order-tab {
	width: 100%;
	height: 44rpx;
	background-color: #fff;
	border-top-left-radius: 32rpx;
	border-top-right-radius: 32rpx;
}
</style>

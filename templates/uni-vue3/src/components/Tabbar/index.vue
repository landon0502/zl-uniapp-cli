<template>
	<view class="app-tabbar bg-#FFF overflow-hidden" :style="{ height: addUnit(tabbarHeight, 'px') }">
		<uv-tabbar
			:value="activeIndex"
			@change="changeTabbar"
			:safeAreaInsetBottom="safeAreaInsetBottom"
			placeholder
			:zIndex="zIndex"
			:fixed="props.fixed"
			:activeColor="'var(--uv-primary)'"
			:inactiveColor="'var(--uv-main-color)'"
		>
			<uv-tabbar-item
				v-for="tab in tabbarPages"
				:key="tab.url"
				:dot="tab.dot"
				:text="tab.name"
				:badge="tab.badge"
			>
				<template #inactive-icon>
					<NIcon :name="tab.icon" :size="24" :color="'var(--uv-main-color)'"></NIcon>
				</template>
				<template #active-icon>
					<NIcon :name="tab.activeIcon" :size="24" :color="'var(--uv-primary)'"></NIcon>
				</template>
			</uv-tabbar-item>
		</uv-tabbar>
	</view>
</template>
<script setup name="Tabbar">
import { computed } from 'vue'
import { useRouter, useScreenInfo } from '@/composables'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
import TabbarProps from './props'
import NIcon from '../NIcon'
import { isTabBarPath } from '@/utils/is'
import userBlueIcon from '@/assets/images/user-blue-icon.png'
import userLineIcon from '@/assets/images/user-icon.png'
import purHomeLine from '@/assets/images/pur-home-line.png'
import purHomeFill from '@/assets/images/pur-home-fill.png'

const { router, currentPage } = useRouter()

defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true
	}
	// #endif
})
const props = defineProps(TabbarProps.props)

const tabbarPages = computed(() => {
	return [
		{
			url: '/pages/index/index',
			icon: purHomeLine,
			activeIcon: purHomeFill,
			dot: false,
			name: '首页',
			show: () => {
				return true
			}
		},

		{
			url: '/pages/user/index',
			icon: userLineIcon,
			activeIcon: userBlueIcon,
			dot: false,
			name: '我的',
			show: () => {
				return true
			}
		}
	].filter((item) => item.show())
})
const activeIndex = computed(() => {
	return tabbarPages.value.findIndex(
		(item) => item.url === router.addRootPath(currentPage.value.route)
	)
})

const screen = useScreenInfo()
const tabbarHeight = computed(() => {
	if (props.safeAreaInsetBottom) {
		return screen.value.tabbarHeight
	}
	return screen.value.tabbarFixedHeight
})

const changeTabbar = (index) => {
	let url = tabbarPages.value[index]?.url
	router.tab({
		url
	})
}

if (isTabBarPath(router.addRootPath(currentPage.value.route))) {
	// 隐藏tabbar
	uni.hideTabBar()
}
</script>
<style scoped lang="scss">
.app-tabbar {
	:deep(.uv-border-top) {
		box-sizing: border-box;
		height: 50px;
	}
	:deep(.uv-tabbar) {
		height: 50px;
	}
	:deep(.uv-badge) {
		top: -5px !important;
		right: calc(50% - 8px) !important;
		transform: translateX(50%);
	}
}
</style>

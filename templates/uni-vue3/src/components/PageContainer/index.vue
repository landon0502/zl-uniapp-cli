<template>
	<view class="page-container flex flex-col" :style="[layoutStyles, themeCSSVar]">
		<view clas="page-nav-bar" v-if="props.showNavBar || $slots.navBar">
			<slot name="navBar">
				<NavBar
					v-bind="navBarMergeProps"
					@leftClick="handleNavBarClick.left"
					@rightClick="handleNavBarClick.right"
				>
					<!-- #ifdef MP-WEIXIN -->
					<template v-for="value in navSlots" :key="value.name" :slot="getNavSlotName(value.name)">
						<slot :name="value.name"></slot>
					</template>
					<!-- #endif -->
					<!-- #ifndef MP-WEIXIN -->
					<template v-for="value in navSlots" :key="value.name" #[getNavSlotName(value.name)]>
						<slot :name="value.name"></slot>
					</template>
					<!-- #endif -->
				</NavBar>
			</slot>
		</view>
		<uv-sticky
			:disabled="!topExtraSticky"
			:customNavHeight="screenInfo.navbarHegiht"
			v-bind="props.topExtraStickyProps"
		>
			<view class="page-top-extra" v-if="$slots['top-extra']" :style="props.topExtraStyle">
				<slot name="top-extra"></slot>
			</view>
		</uv-sticky>

		<view class="pos-relative box-border flex-1" id="page-content-layout">
			<slot name="skeletons" v-if="showSkeleton">
				<view
					class="overflow-hidden pos-absolute bottom-0 top-0 left-0 right-0"
					v-if="!isEmpty(getStore().skeletons)"
				>
					<uv-skeletons
						v-bind="props.skeletonsProps"
						:loading="showSkeleton"
						:skeleton="getStore().skeletons"
						animate
					/>
				</view>
			</slot>

			<view class="page-content" v-if="isRenderContent" :style="contentStyle">
				<slot name="default"></slot>
			</view>
		</view>
		<view
			class="page-footer flex-shrink-0"
			v-if="props.footer"
			:style="{
				flexShrink: 0,
				...props.footerStyle,
				height: addUnit(footerNodeRect?.height, 'px')
			}"
		>
			<view
				class="z-15 bg-white"
				:class="{ 'footer-fixed': props.footerFixed }"
				id="page-container_footer_content"
				:style="
					pick(props.footerStyle, [
						'background',
						'backgroundColor',
						'background-color',
						'background-image'
					])
				"
			>
				<slot name="footer"></slot>
				<uv-safe-bottom v-if="safeAreaInsetBottom"></uv-safe-bottom>
			</view>
		</view>

		<!-- 统一页面确认传处理 -->
		<uv-modal
			v-for="(config, index) in modalConfig"
			:key="index"
			:ref="(ctx) => addModalRef(ctx, config)"
			v-bind="config"
		></uv-modal>
		<slot name="page-extra"></slot>
		<!-- #ifndef H5 -->
		<DevEnv v-if="showDevBtn" />
		<!-- #endif -->
		<uv-toast ref="toastRef"></uv-toast>
	</view>
</template>
<script setup name="PageContainer">
import NavBar from '@/components/NavBar'
import pageProps from './props'
// #ifndef H5
import DevEnv from '../DevEnv'
// #endif
import {
	useRouter,
	useDynamicSlotKeys,
	useScreenInfo,
	useNodeBounding,
	usePageStore,
	useTheme,
	usePageTrack
} from '@/composables'
import { computed, watch } from 'vue'
import usePageModal from './usePageModal'
import { PAGE_CTX_KEY } from './context'
import { isDev } from '@/contants'
import { isEmpty, pick } from 'lodash'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
import { isTabBarPath } from '@/utils/is'

/**
 * hooks
 */
const { current, currentPage } = useRouter()
const screenInfo = useScreenInfo()
const navBarDefaultProps = pageProps.props.navBarProps.default()
const slotPrefix = 'nav-'
const { slots: navSlots } = useDynamicSlotKeys({
	slotNames: ['left', 'right', 'center'].map((name) => [slotPrefix, name].join(''))
})
const { themeCSSVar } = useTheme()
const showDevBtn = computed(() => {
	return isDev || import.meta.env.VITE_REQUEST_ENV !== 'pro'
})
usePageTrack()
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true,
		dynamicSlots: true // 启用动态 slot
	}
	// #endif
})
const emit = defineEmits({
	leftClick: true,
	rightClick: true
})
const props = defineProps(pageProps.props)
const { setStore, getStore } = usePageStore(PAGE_CTX_KEY)
const { modalConfig, addModalRef, ...modal } = usePageModal()

// 优化后的导航栏属性计算
const navBarMergeProps = computed(() => {
	let leftIcon = ''
	if (!isTabBarPath(currentPage.value.route)) {
		if (current.value > 0) {
			leftIcon = 'arrow-left'
		} else {
			leftIcon = 'home'
		}
	}

	const navBarProps = {
		...navBarDefaultProps,
		leftIcon,
		placeholder: true,
		indexPath: '/pages/index/index',
		leftIconSize: 24,
		...props.navBarProps
	}
	return navBarProps
})

// 显示骨架屏
const showSkeleton = computed(() => {
	return (props.skeletonsProps?.loading || getStore().showSkeletons) && props.useSkeletons
})

const contentStyle = computed(() => {
	const style = { ...pageProps.props.contentStyle.default(), ...props.contentStyle }

	if (props.fixedContentHeight) {
		Object.assign(style, { position: 'absolute', bottom: 0, left: 0, top: 0, right: 0 })
	}
	if (showSkeleton.value) {
		Object.assign(style, {
			// height: 0,
			overflow: 'hidden',
			opacity: 0,
			position: 'absolute'
		})
	}
	return style
})

// 是否渲染内容区
const isRenderContent = computed(() => {
	return props.showSeletonsRenderContent || !showSkeleton.value || !props.useSkeletons
})

// 事件处理
const handleNavBarClick = {
	left: () => emit('leftClick'),
	right: () => emit('rightClick')
}

// 样式计算
const layoutStyles = computed(() => {
	const { windowWidth, windowHeight } = screenInfo.value
	const baseStyle = {
		minWidth: addUnit(windowWidth, 'px'),
		minHeight: addUnit(windowHeight, 'px')
	}

	if (props.fullscreen) {
		return {
			...baseStyle,
			width: addUnit(windowWidth, 'px'),
			height: addUnit(windowHeight, 'px'),
			...props.customStyle
		}
	}

	return {
		...baseStyle,
		...props.customStyle
	}
})

// 导航栏插槽名称处理
const getNavSlotName = (name) => name.replace(slotPrefix, '')
const { nodeRect: footerNodeRect, queryNode: footerContentQueryNode } = useNodeBounding({
	selector: '#page-container_footer_content',
	isObserver: props.footer
})

const { nodeRect: contentNodeRect, queryNode: pageContentLayoutQueryNode } = useNodeBounding({
	selector: '#page-content-layout'
})
const updatePageLayoutResize = async () => {
	await uni.$uv.sleep(200)
	await footerContentQueryNode()
	await pageContentLayoutQueryNode()
}

watch(
	() => props.footer,
	(newValue, oldValue) => {
		if (newValue !== oldValue) {
			updatePageLayoutResize()
		}
	}
)

setStore({
	isLoad: true,
	showSkeletons: true,
	skeletons: [],
	updatePageLayoutResize
})

// 暴露API
defineExpose({
	modal,
	footerNodeRect,
	contentNodeRect,
	updatePageLayoutResize
})
</script>
<style scoped lang="scss">
.page-container {
	.footer-fixed {
		position: fixed;
		left: 0;
		bottom: 0;
		width: 100%;
	}
}
</style>

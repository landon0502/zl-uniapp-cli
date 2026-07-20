<template>
	<view class="app-nav-bar" :style="contentStyle">
		<uv-navbar v-bind="props" @left-click="emit('leftClick')" @right-click="emit('rightClick')">
			<template #left>
				<slot name="left"></slot>
			</template>
			<!-- template添加style是由于uniapp编译问题 -->
			<template #center style="width: 100%">
				<slot name="center" style="width: 100%"></slot>
			</template>

			<template #right>
				<slot name="right"></slot>
			</template>
		</uv-navbar>
		<uv-line v-if="props.showBottomLine"></uv-line>
	</view>
</template>
<script setup name="NavBar">
import { computed } from 'vue'
import navBarProps from './props'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
import { useScreenInfo } from '@/composables'
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true,
		dynamicSlots: true // 启用动态 slot
	}
	// #endif
})

const props = defineProps(navBarProps.props)
const emit = defineEmits({
	leftClick: true,
	rightClick: true
})
const screenInfo = useScreenInfo()

// 内容区样式
const contentStyle = computed(() => {
	let w = addUnit(
		props.avoidMenuButton ? screenInfo.value.menuBtnRect.left : screenInfo.value.screenWidth,
		'px'
	)
	return {
		'--nav-bar-width': w,
		'--nav-bar-bgcolor': props.bgColor
	}
})
</script>

<style scoped lang="scss"></style>

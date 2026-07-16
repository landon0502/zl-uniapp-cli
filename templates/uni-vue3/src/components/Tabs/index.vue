<template>
	<view class="w-full flex flex-col" :style="props.customStyle">
		<view :style="tabsStyle" class="w-full z-4">
			<view class="w-full">
				<view
					class="w-full"
					:class="{ 'hide-tabs': showMore && props.moreShowedHideTabs }"
					id="tabs-header-bar"
				>
					<uv-tabs
						v-bind="{
							...props,
							customStyle: props.customTabsStyle
						}"
						:list="tabsList"
						:current="current"
						@change="onChange"
						ref="uvTabsRef"
					>
						<template #right :style="{ height: '100%' }">
							<slot name="right"></slot>
							<view
								@click.stop="showMoreView"
								class="h-full"
								:class="{ 'tabs-right': props.showRightBtnLeftShadow }"
								v-if="props.showMoreBtn"
							>
								<view class="w-36px flex flex-col justify-center items-center h-full">
									<uv-icon
										:name="showMore ? 'arrow-up' : 'arrow-down'"
										size="12"
										bold
										color="#999999"
									></uv-icon>
								</view>
							</view>
						</template>
					</uv-tabs>
					<uv-line v-if="props.showTabsBottomLine"></uv-line>
				</view>
				<slot name="tabs-extra" :toggleMaskHandler="toggleMaskHandler"></slot>
			</view>
			<view
				class="pos-absolute w-full"
				:style="{
					top: addUnit(tabsNodeRect.height, 'px'),
					zIndex: props.zIndex + 1
				}"
				v-if="showMore"
			>
				<view
					class="w-full rounded-b-16px max-h-400rpx min-h-260rpx bg-#FFFFFF overflow-auto box-border"
					:style="addStyle(props.customMoreStyle)"
				>
					<uv-grid :col="3">
						<uv-grid-item v-for="(item, index) in tabsList" :key="index">
							<view class="py-12rpx flex w-18/20">
								<view
									:style="props.moreItemStyle"
									class="px-8rpx rounded-24px bg-#F2F3F5 flex flex-row items-center justify-center overflow-hidden w-full box-border"
									:class="{
										'tabs-more-active': current === index
									}"
									@click="onChange({ index, ...item })"
								>
									<text
										class="text-#666666 font-size-12px line-height-24px line-clamp-1 w-full text-align-center tabs-more-text"
									>
										{{ item[props.keyName] }}
									</text>
								</view>
							</view>
						</uv-grid-item>
					</uv-grid>
				</view>
			</view>
		</view>
		<view class="tabs-content pos-relative w-full flex-1" :style="props.customContentStyle">
			<view
				class="pos-absolute w-full z-9 bg-#00000080 h-full top-0"
				v-if="showMask"
				@click="clickMask"
			>
			</view>
			<slot></slot>
		</view>
	</view>
</template>
<script setup name="Tabs">
import { computed, onMounted, ref, toRefs } from 'vue'
import tabsDefineProps from './props'
import { useMergeModelValue, useToggle, useNodeBounding, useDefineInvoke } from '@/composables'
import { addStyle, addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared',
		multipleSlots: true
	}
	// #endif
})
const props = defineProps(tabsDefineProps.props)
const emit = defineEmits({
	'update:modelValue': true,
	change: true
})

const showMask = ref(false)
const uvTabsRef = ref()
const setLineLeftInvoke = useDefineInvoke(() => !!uvTabsRef.value)
const { modelValue, list: tabsList } = toRefs(props)
const tabsStyle = computed(() => {
	return addStyle({
		position: props.sticky ? 'sticky' : 'relative',
		zIndex: props.zIndex,
		top: addUnit(props.stickyTop, 'px'),
		background: props.tabsBg,
		height: props.tabsHeight
	})
})

const mergeValue = useMergeModelValue(modelValue, {
	set(v) {
		emit('update:modelValue', v)
	}
})
const current = computed(() => {
	if (!props.keyValue) {
		return mergeValue.value
	}
	let index = tabsList.value.findIndex((item) => item[props.keyValue] === mergeValue.value)
	return index < 0 ? void 0 : index
})
const [showMore, toggleShowMore] = useToggle(false)

const toggleMaskHandler = (show) => {
	showMask.value = show ?? !showMask.value
}

const showMoreView = () => {
	toggleShowMore()
	toggleMaskHandler()
}

const onChange = (e) => {
	let val = ''
	if (!props.keyValue) {
		val = e.index
	} else {
		let curItem = tabsList.value[e.index]
		val = curItem[props.keyValue]
	}
	if (mergeValue.value === val) return
	mergeValue.value = val
	toggleShowMore(false)
	toggleMaskHandler(false)
	emit('change', e)
}

const { nodeRect: tabsNodeRect } = useNodeBounding({
	selector: '#tabs-header-bar',
	isObserver: true,
	onNodeRectUpdate(boundingClientRect) {
		// 监听tabs是否可见，如果可见执行uv-tabs的resize方法重新计算tab item宽度
		if (boundingClientRect.height > 0) {
			uvTabsRef.value.resize()
		}
	}
})

const clickMask = () => {
	toggleShowMore(false)
	toggleMaskHandler()
	uni.$emit('click-tabs-mask')
}

onMounted(() => {
	setLineLeftInvoke(() => {
		uvTabsRef.value.setLineLeft()
	})
})

defineExpose({
	resizeTabs() {
		setLineLeftInvoke(() => {
			uvTabsRef.value.init()
		})
	}
})
</script>
<style lang="scss" scoped>
.tabs-right {
	box-shadow: -4px 0 6px -4px rgba(0, 0, 0, 0.2);
}
.tabs-more-active {
	background: #e5eff7;
	.tabs-more-text {
		color: var(--uv-primary);
		font-weight: bold;
	}
}
.hide-tabs {
	:deep(.uv-tabs__wrapper__nav) {
		display: none;
	}
	:deep(.uv-tabs__wrapper) {
		height: 100%;
	}
}
</style>

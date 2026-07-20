<template>
	<view class="w-full">
		<uv-waterfall
			v-bind="props"
			:modelValue="mergeValue"
			:column-count="columnCount"
			ref="waterfallRef"
			@update:modelValue="updateModelValue"
			@changeList="onChangeList"
			@clear="(e) => emit('clear', e)"
			@finish="(e) => emit('finish', e)"
			@remove="(e) => emit('remove', e)"
			@scrolltolower="(e) => emit('scrolltolower', e)"
		>
			<!-- #ifdef MP-WEIXIN -->
			<template v-for="col in renderColumn" :key="col.name" :slot="col.name">
				<view class="flex flex-col gap-12px">
					<view v-for="item in columnData[col.name]" :key="item[idKey]">
						<slot :item="item" name="item"></slot>
					</view>
				</view>
			</template>
			<!-- #endif -->
			<!-- #ifndef MP-WEIXIN -->
			<template v-for="col in renderColumn" :key="col.name" #[col.name]>
				<view class="flex flex-col gap-12px">
					<template v-for="item in columnData[col.name]" :key="item[idKey]">
						<slot :item="item" name="item"></slot>
					</template>
				</view>
			</template>
			<!-- #endif -->
		</uv-waterfall>
		<uv-load-more v-if="!disableLoading" v-bind="loadmoreProps" :status="loadingStatus" />
	</view>
</template>
<script setup name="Waterfall">
import { computed, reactive, ref } from 'vue'
import useMergeModelValue from '@/composables/hooks/useMergeModelValue'
import { isEmpty } from 'lodash'
import uvWaterfallProps from '@climblee/uv-ui/components/uv-waterfall/props.js'
const columnData = reactive({})
const waterfallRef = ref()
const props = defineProps({
	...uvWaterfallProps.props,
	/**
	 * 渲染的值
	 */
	modelValue: {
		type: Array,
		default: () => []
	},
	/**
	 * 需要渲染多少列
	 */
	columnCount: {
		type: Number,
		default: 2
	},
	loading: Boolean,
	/**
	 * 加载更多props
	 */
	loadmoreProps: {
		type: Object,
		default: () => ({})
	},
	/**
	 * 禁用加载更多
	 */
	disableLoading: Boolean
})
defineOptions({
	options: {
		multipleSlots: true,
		dynamicSlots: true,
		slot: true
	}
})
const emit = defineEmits({
	changeList: true,
	'update:modelValue': true,
	finish: true,
	clear: true,
	remove: true,
	scrolltolower: true
})

const loadingStatus = computed(() => {
	if (props.loadmoreProps?.status) {
		return props.loadmoreProps?.status
	}
	if (!props.loading) return 'nomore'
	let dataIsEmpty = Object.values(columnData).every(isEmpty)
	return dataIsEmpty && props.loading ? 'loading' : 'loadmore'
})

const mergeValue = useMergeModelValue(() => props.modelValue, {
	defaultValue: props.modelValue,
	set(value) {
		updateModelValue(value)
	},
	onBeforeSet() {
		clearColumnData()
	}
})

/**
 * 需要渲染多少列
 */
const renderColumn = computed(() => {
	return new Array(props.columnCount).fill({ slotName: 'list' }).map((item, index) => {
		return {
			name: item.slotName + (index + 1)
		}
	})
})
/**
 * 瀑布流列表 数据变化
 */
function onChangeList(e) {
	const { name, value } = e
	emit('changeList', e)
	let list = columnData[name]
	if (isEmpty(list)) {
		list = []
	}
	list.push(value)
	columnData[name] = list
}

/**
 * 清除columnData中的数据
 */
function clearColumnData() {
	waterfallRef.value?.clear?.()
	Object.keys(columnData)?.forEach?.((key) => {
		columnData[key] = []
	})
}

/**
 * 更新数据
 */
function updateModelValue(value) {
	emit('update:modelValue', value)
}

defineExpose({
	clearColumnData
})
</script>

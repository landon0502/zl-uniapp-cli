<template>
	<view class="w-full h-full" :style="customStyle">
		<!-- 分页组件 -->
		<z-paging
			ref="pagingRef"
			refresher-only
			:fixed="false"
			:auto-full-height="false"
			:refresher-fixed-bac-height="props.refresherFixedBacHeight"
			:refresher-enabled="props.refresherEnabled"
			:refresher-threshold="props.refresherThreshold"
			show-refresher-when-reload
			:paging-style="{ width: '100%', height: '100%' }"
			height="100%"
			width="100%"
			paging-class="paging-scroll"
			@refresherStatusChange="onRefresherStatusChange"
			@scrolltolower="onScrolltolower"
			@scroll="onScroll"
		>
			<view class="w-full scroll-paging">
				<!-- 加载中状态 -->
				<view
					class="w-full overflow-hidden transition-all transition-duration-100"
					:style="{ height: loadingStatus ? addUnit(props.loadingHeight, 'px') : '0px' }"
				>
					<slot name="loading" :status="loadingStatus">
						<view
							class="w-full flex justify-center items-center"
							:style="{ height: addUnit(props.loadingHeight, 'px') }"
						>
							<uv-loading-icon text="加载中" textSize="30rpx" :size="20"></uv-loading-icon>
						</view>
					</slot>
				</view>

				<!-- 内容区域 -->
				<view class="scroll-view-content">
					<slot name="default"></slot>
				</view>

				<!-- 空数据状态 -->
				<view
					class="scroll-view-empty w-full flex justify-center items-center mt-160rpx"
					v-if="showEmpty"
				>
					<slot name="empty">
						<Empty />
					</slot>
				</view>

				<!-- 加载更多 -->
				<template v-if="showLoadmore">
					<view class="load-more-view" :style="loadmoreStyle">
						<slot name="loadmore">
							<view class="w-full h-44px flex justify-center items-center">
								<uv-load-more
									:status="moreLoadingStatus"
									:loadmoreText="loadStatusText.loadmoreEnd"
								/>
							</view>
						</slot>
					</view>
				</template>
			</view>
		</z-paging>
	</view>
</template>
<script name="ScrollPaging" setup>
import { useToggle, useMergeModelValue } from '@/composables'
import { computed, reactive, ref, shallowRef, toRef } from 'vue'
import {
	ON_LOAD,
	ON_LOAD_MORE,
	ON_REFRESH,
	ON_SCROLL_TOLOWER,
	scrollPagingHooksEvents
} from './context'
import { isEmpty, isUndefined, isArray } from 'lodash'
import scrollPagingProps from './props'
import { genUuid } from '@/utils/utils'
import Empty from '../Empty'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function'

// #ifdef MP-WEIXIN
defineOptions({
	styleIsolation: 'shared',
	multipleSlots: true,
	dynamicSlots: true // 启用动态 slot
})
// #endif

const props = defineProps(scrollPagingProps.props)

// 定义组件事件
const emit = defineEmits({
	scroll: true, // 滚动事件
	refresherpulling: true, // 下拉刷新中
	refresherrefresh: true, // 下拉刷新触发
	refresherrestore: true, // 下拉刷新恢复
	refresherabort: true, // 下拉刷新终止
	scrolltolower: true, // 滚动到底部
	loadmore: true // 加载更多
})

// 分页组件引用
const pagingRef = shallowRef()
// 生成唯一的key作为useScrollPaging 标记
const scrollKey = genUuid()
// 上拉加载状态
const moreLoadingStatus = ref('loadmore')
// 是否显示loading
const loadingStatus = useMergeModelValue(() => props.loading, {
	defaultValue: false,
	ignoreDelayFilter: (v) => v === true,
	delay: 100
})

// 刷新结束显示文本
const loadStatusText = reactive({
	loadmoreEnd: void 0
})
// 是否刷新失败
const isRefreshFail = ref(false)
// 是否强制显示空数据状态
const forceShowEmpty = ref(false)
// 空数据状态
const [emptyDataStatus, setEmptyDataStatus] = useToggle(false)
// 当前绑定数据
const data = toRef(props, 'data')
const mergeData = useMergeModelValue(data, {
	defaultValue: []
})

// 是否在刷新
const [refreshing, setRefreshStatus] = useToggle()

/**
 * 是否显示空状态
 */
const showEmpty = computed(() => {
	return (
		((emptyDataStatus.value || (isEmpty(mergeData.value) && !refreshing.value)) &&
			props.emptyEnable &&
			!props.refreshonly &&
			!props.emptyDisabled &&
			!loadingStatus.value) ||
		forceShowEmpty.value
	)
})

/**
 * 是否显示加载更多状态
 */
const showLoadmore = computed(() => {
	return (
		!refreshing.value &&
		!showEmpty.value &&
		props.loadmoreEnable &&
		!props.refreshonly &&
		mergeData.value.length >= (props.pageSize ?? 0)
	)
})

/**
 * 设置强制显示空状态
 * @param {boolean} v - 是否强制显示空状态
 */
const setForceShowEmptyStatus = (v) => (forceShowEmpty.value = v)

/**
 * 执行刷新操作
 */
const runRefresh = async () => {
	// 重置状态
	loadStatusText.loadmoreEnd = void 0
	isRefreshFail.value = false
	setEmptyDataStatus(false)
	setForceShowEmptyStatus(false)
	moreLoadingStatus.value = 'loadmore'
	setRefreshStatus(true)

	// 触发刷新事件
	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_REFRESH,
		callback: async () => {
			// 当仅使用刷新功能时在这里手动触发
			await refreshEnd()
		},
		onError() {
			refreshEnd()
		}
	})
}

/**
 * 手动触发刷新
 */
const refresh = async () => {
	if (!props.refresherEnabled) {
		return
	}
	// 重置状态
	loadStatusText.loadmoreEnd = void 0
	isRefreshFail.value = false
	setEmptyDataStatus(false)
	setForceShowEmptyStatus(false)
	moreLoadingStatus.value = 'loadmore'
	setRefreshStatus(true)

	// 调用分页组件的刷新方法
	pagingRef.value.refresh()
}

/**
 * 刷新状态改变处理
 * @param {string} e - 刷新状态
 */
const onRefresherStatusChange = (e) => {
	if (e === 'loading') {
		runRefresh()
	}
}

/**
 * 刷新结束
 */
const refreshEnd = async () => {
	setRefreshStatus(false)
	pagingRef.value.endRefresh()
	loadStatusText.loadmoreEnd = void 0
	isRefreshFail.value = false
}

/**
 * 完成数据加载并更新状态
 * @param {Array} data - 加载的数据
 * @param {Object} options - 配置选项
 * @param {number} options.pageTotal - 总数据量
 * @param {number} options.pageSize - 每页数据量
 * @param {boolean} options.notMore - 是否没有更多数据
 */
const complete = async (data = [], options = {}) => {
	const { pageTotal = props.pageTotal, pageSize = props.pageSize, notMore } = options

	// 更新数据
	if (isArray(data)) {
		mergeData.value = data
	}

	// 更新空数据状态
	setEmptyDataStatus(isEmpty(mergeData.value) && !props.refreshonly)

	// 检查是否没有更多数据
	if (
		(!isUndefined(pageTotal) && mergeData.value.length === pageTotal) ||
		(!isUndefined(pageSize) && data.length < pageSize) ||
		(isEmpty(data) && !isEmpty(mergeData.value)) ||
		notMore
	) {
		completeByNoMore()
	} else {
		moreLoadingStatus.value = 'loadmore'
	}
}

/**
 * 设置没有更多数据状态
 */
const completeByNoMore = async () => {
	if (props.refreshonly) {
		return
	}
	moreLoadingStatus.value = 'nomore'
}

/**
 * 清除所有状态
 */
const clearState = () => {
	moreLoadingStatus.value = 'loadmore'
	loadStatusText.loadmoreEnd = void 0
	setRefreshStatus(false)
	setForceShowEmptyStatus(false)
}

/**
 * 滚动至底部触发
 */
const onScrolltolower = () => {
	emit('scrolltolower')

	// 触发滚动到底部事件
	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_SCROLL_TOLOWER
	})

	// 检查是否可以加载更多
	if (moreLoadingStatus.value !== 'loadmore' || props.refreshonly) {
		return
	}

	// 触发加载更多事件
	emit('loadmore')
	moreLoadingStatus.value = 'loading'

	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_LOAD_MORE,
		callback: () => {
			// 当仅使用触底加载功能时在这里手动触发
			// completeByNoMore()
		},
		onError() {
			clearState()
		}
	})
}

/**
 * 滚动监听
 * @param {Object} e - 滚动事件对象
 */
const onScroll = (e) => {
	emit('scroll', e)
}

/**
 * 加载数据
 */
const runLoad = async () => {
	// 重置数据和状态
	mergeData.value = []
	clearState()
	loadingStatus.value = true

	// 触发加载事件
	scrollPagingHooksEvents.trigger({
		key: scrollKey,
		eventName: ON_LOAD,
		callback: async () => {
			// 当仅使用刷新功能时在这里手动触发
			loadingStatus.value = false
		},
		onError() {
			loadingStatus.value = false
		}
	})
}

// 暴露组件方法
defineExpose({
	load: runLoad,
	refresh: () => {
		refresh()
	},
	complete,
	nomore: completeByNoMore,
	clearState,
	setForceShowEmptyStatus,
	moreLoadingStatus,
	loadingStatus,
	scrollKey,

	/**
	 * 加载失败处理
	 */
	onLoadError() {
		loadingStatus.value = false
	},

	/**
	 * 刷新失败处理
	 * @param {string} text - 错误提示文本
	 */
	refreshErrorHandler(text) {
		if (text) {
			uni.showToast({ title: text, icon: 'none' })
		}
		isRefreshFail.value = true
		refreshEnd()
	},

	/**
	 * 加载更多失败处理
	 * @param {string} text - 错误提示文本
	 */
	loadmoreErrorHandler(text) {
		loadStatusText.loadmoreEnd = text
		moreLoadingStatus.value = 'loadmore'
		clearState()
	}
})
</script>
<style scoped lang="scss">
.hide-scroll-bar {
	&::-webkit-scrollbar {
		width: 0;
		height: 0;
		display: none;
		background: transparent;
		color: transparent;
	}
}
</style>

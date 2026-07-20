<template>
	<view class="list-container">
		<view class="list-input">
			<SearchBar
				@search="handleSearch"
				:placeholder="inputPlaceholder"
				v-model="keywords"
				:clearable="false"
				:custom-style="{
					background: '#F7F8FA',
					width: 'inherit'
				}"
			/>
		</view>
		<ScrollPaging
			ref="pagingRef"
			class="scroll-con"
			:emptyDisabled="emptyDisabled"
			:refresherEnabled="isEnablePaging"
		>
			<view class="list">
				<view
					v-for="item in list"
					:key="item[replaceFields.id]"
					@click="handleClick(item)"
					class="list-item"
					:class="active === item[replaceFields.id] && 'active'"
				>
					<text>{{ item[replaceFields.label] }}</text>
					<image :src="CheckedIcon" mode="scaleToFill" />
				</view>
			</view>
		</ScrollPaging>
		<template v-if="showFooter">
			<view class="btn-con flex-center">
				<text class="btn flex-center cancel" @click="handleCancel">重置</text>
				<text class="btn flex-center submit" @click="handleSubmit">确定</text>
			</view>
		</template>
	</view>
</template>

<script setup>
import SearchBar from '@/components/SearchBar'
import ScrollPaging from '@/components/ScrollPaging/index.vue'
import usePopupContext from '@/components/WithPopup/usePopupContext'
import useScrollPaging from '@/components/ScrollPaging/useScrollPaging'
import { ref, computed } from 'vue'
import { useRequest } from '@/composables'
import CheckedIcon from '@/assets/images/check-icon.png'

const props = defineProps({
	getDataControl: {
		type: Function,
		default: null
	},
	params: {
		type: Object,
		default: () => {
			return {}
		}
	},
	inputPlaceholder: {
		type: String,
		default: ''
	},
	active: {
		type: [String, Number],
		default: ''
	},
	searchKey: {
		type: String,
		default: 'supplierName'
	},
	frontFilter: {
		// 前端筛选
		type: Boolean,
		default: false
	},
	isEnablePaging: {
		// 是否分页
		type: Boolean,
		default: true
	},
	dealData: {
		type: Function,
		default: null
	},
	replaceFields: {
		type: Object,
		default: () => {
			return {
				id: 'id',
				label: 'supplierName'
			}
		}
	},
	resultKey: {
		type: String,
		default: 'list'
	},
	showFooter: {
		type: Boolean,
		default: true
	},
	options: {
		// 前端自己的数据
		type: Array,
		default: () => []
	}
})
const emit = defineEmits(['change', 'update:active'])

const { listener } = usePopupContext({ key: 'pageselectshow' })

const {
	run,
	pagedData,
	data: resultData,
	noMoreData,
	resetPage,
	nextPage
} = useRequest(props.getDataControl, {
	enablePaging: props.isEnablePaging
})

// 获取最终的数据
const getresultData = (resultData) => {
	if (props.options?.length > 0) {
		return props.options
	}
	let keys = props.resultKey.split('.')
	return keys.reduce((acc, cur) => {
		if (!cur) return Array.isArray(acc) ? acc : []
		if (Object.prototype.hasOwnProperty.call(acc, cur)) {
			return acc[cur]
		}
		return Array.isArray(acc) ? acc : []
	}, resultData.value || {})
}

const list = computed(() => {
	let resData = getresultData(resultData)
	const data =
		typeof props.dealData === 'function'
			? props.dealData(props.enablePaging ? pagedData.value : resData)
			: props.enablePaging
				? pagedData.value
				: resData
	if (props.frontFilter) {
		return data.filter((item) => item[props.replaceFields.label].includes(keywords.value))
	}
	return data
})

const emptyDisabled = ref(false)
const keywords = ref('')
const pagingRef = ref(null)

const { complete, load } = useScrollPaging(pagingRef, {
	async onLoad() {
		if (props.options?.length > 0) {
			emptyDisabled.value = true
			return
		}
		await getData()
	},
	async onRefresh() {
		await resetPage()
		complete(pagedData.value, { notMore: noMoreData.value })
	},
	async onLoadMore() {
		await nextPage()
		complete(pagedData.value, { notMore: noMoreData.value })
	}
})
listener.onOpen(load) // 弹窗打开时触发

const handleSearch = () => {
	if (props.options?.length > 0) return
	load()
}

const handleClick = (item) => {
	if (props.active === item[props.replaceFields.id]) return
	emit('update:active', item[props.replaceFields.id])
	!props.showFooter && emit('change', item)
}

const handleCancel = () => {
	emit('update:active', '')
	emit('change', {})
}

const handleSubmit = () => {
	let item = list.value.find((item) => item[props.replaceFields.id] === props.active)
	emit('update:active', item[props.replaceFields.id])
	emit('change', item)
}

const getData = async () => {
	pagedData.value = []
	await run(
		{
			[props.searchKey]: keywords.value || undefined, //供应商名称/关键字
			...props.params
		},
		props.enablePaging ? { pagingParams: { page: 1 } } : undefined
	)
	if (!props.enablePaging && pagedData.value.length === 0) {
		emptyDisabled.value = true
	}
	complete(pagedData.value, { notMore: noMoreData.value })
}
</script>

<style lang="scss" scoped>
.list-container {
	height: 700rpx;
	display: flex;
	flex-direction: column;
	.list-input {
		padding: 0 24rpx 24rpx;
		border-bottom: 1px solid #e7e7e7;
	}
	.scroll-con {
		flex: 1;
	}
	.list {
		overflow: hidden;
		padding: 0 24rpx;
		.list-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx 0;
			border-bottom: 1px solid rgba(231, 231, 231, 0.5);
			text {
				font-size: 32rpx;
				font-style: normal;
				font-weight: 400;
				color: #1d2129;
			}
			image {
				visibility: hidden;
				flex-shrink: 0;
				width: 48rpx;
				height: 48rpx;
			}
		}
		.active {
			text {
				font-weight: 600;
				color: #27c1a5;
			}
			image {
				visibility: visible;
			}
		}
	}
	.btn-con {
		padding: 20rpx 24rpx;
		overflow: hidden;
		.btn {
			flex: 1;
			font-size: 28rpx;
			font-weight: 400;
			line-height: 44rpx;
			padding: 18rpx 0;
		}
		.cancel {
			background: #e2f3f0;
			color: #27c1a5;
			border-radius: 16rpx 0 0 16rpx;
		}
		.submit {
			background: #27c1a5;
			color: #fff;
			border-radius: 0 16rpx 16rpx 0;
		}
	}
}
</style>

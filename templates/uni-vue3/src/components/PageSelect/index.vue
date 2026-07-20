<template>
	<view
		v-if="$slots.selectContainer"
		class="w-100%"
		:class="disabled && 'disabled-btn'"
		@click="handleChoose"
	>
		<slot name="selectContainer"></slot>
	</view>
	<view v-else class="page-select-con" :class="disabled && 'disabled-btn'">
		<view class="tab-item" @click="handleChoose">
			<text>{{ value[replaceFields.label] || title }}</text>
			<uv-icon v-if="!disabled" name="arrow-down" color="#000" size="14"></uv-icon>
		</view>
	</view>
	<WithPopup ref="popupRef">
		<List
			ref="listRef"
			:getDataControl="getDataControl"
			v-model:active="active"
			@change="handleChange"
			:params="params"
			:frontFilter="frontFilter"
			:isEnablePaging="isEnablePaging"
			:dealData="dealData"
			:inputPlaceholder="inputPlaceholder"
			:replaceFields="replaceFields"
			:resultKey="resultKey"
			:showFooter="showFooter"
			:options="options"
		/>
	</WithPopup>
</template>

<script setup>
import { shallowRef, ref, watch } from 'vue'
import WithPopup from '../WithPopup'
import List from './list'
const emit = defineEmits(['change', 'update:value'])
const props = defineProps({
	title: {
		type: String,
		default: '选择供应商'
	},
	inputPlaceholder: {
		type: String,
		default: '输入关键字搜索供应商'
	},
	getDataControl: {
		type: Function,
		default: null
	},
	isEnablePaging: {
		// 是否分页
		type: Boolean,
		default: true
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
	params: {
		type: Object,
		default: () => {
			return {}
		}
	},
	value: {
		type: Object,
		default: () => {
			return {}
		}
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
	disabled: {
		type: Boolean,
		default: false
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
const popupRef = shallowRef(null)
const active = ref('')
const listRef = ref(null)

watch(
	() => props.value,
	(val) => {
		if (!active.value) active.value = val[props.replaceFields.id]
	},
	{
		deep: true,
		immediate: true
	}
)
const handleChange = (item) => {
	emit('update:value', item)
	emit('change', item)
	popupRef.value.confirm()
}
const handleChoose = () => {
	if (props.disabled) return
	popupRef.value.open({
		mode: 'bottom',
		footer: false,
		title: props.title,
		navbarHeight: 56,
		round: 16,
		data: {
			pageselectshow: true
		}
	})
}
</script>

<style lang="scss" scoped>
.page-select-con {
	.tab-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		color: #000;
		border-radius: 8rpx;
		transition: all 0.2s ease;
		// 点击按压反馈
		&:active {
			background-color: #e9ebef;
		}
		text {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}
.disabled-btn {
	// background-color: rgb(245, 247, 250);
}
</style>

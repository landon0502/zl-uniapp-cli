<template>
	<view class="flex flex-row justify-between items-center gap-8rpx" :style="props.customStyle">
		<view
			v-for="(opt, index) in options"
			:key="index"
			class="flex flex-row flex-1 justify-center items-center h-48rpx gap-12rpx"
			:class="{ 'goods-filter__active': mergeValue.value === opt.value }"
			@click="onSelect(opt)"
			:style="props.customItemStyle"
		>
			<text
				class="text-color-#666 font-400 goods-filter-text whitespace-nowrap"
				:style="[textStyle, mergeValue.value === opt.value && activeTextStyle]"
				>{{ opt.name }}</text
			>
			<view v-if="opt.enableSort" class="flex flex-col items-center justify-center h-48rpx">
				<uv-icon
					name="arrow-up-fill"
					:size="6"
					:color="
						mergeValue.value === opt.value && mergeValue.sort === asc
							? 'var(--uv-primary)'
							: 'var(--uv-info)'
					"
				></uv-icon>
				<uv-icon
					name="arrow-down-fill"
					:size="6"
					:color="
						mergeValue.value === opt.value && mergeValue.sort === desc
							? 'var(--uv-primary-color)'
							: 'var(--uv-info)'
					"
				></uv-icon>
			</view>
		</view>
		<slot name="right"></slot>
	</view>
</template>
<script setup>
import { useMergeModelValue } from '@/composables'
const asc = 'asc',
	desc = 'desc'
const props = defineProps({
	options: {
		type: Array,
		default() {
			return []
		}
	},
	modelValue: {
		type: Object,
		default() {
			return {}
		}
	},
	textStyle: {
		type: Object,
		default() {
			return {
				fontSize: '28rpx'
			}
		}
	},
	activeTextStyle: {
		type: Object,
		default() {
			return {
				fontSize: '32rpx'
			}
		}
	},
	customItemStyle: {
		type: Object
	},
	customStyle: {
		type: Object
	}
})
const mergeValue = useMergeModelValue(() => props.modelValue, {
	defaultValue: {},
	set(value) {
		emit('update:modelValue', value)
	}
})
const emit = defineEmits({
	'update:modelValue': true,
	change: true
})

const onSelect = (e) => {
	let modelValue = mergeValue.value
	if (e.value === modelValue.value && !e.enableSort) {
		return
	}
	if (e.enableSort) {
		if (!modelValue.sort || modelValue.value !== e.value) {
			modelValue.sort = asc
		} else {
			modelValue.sort = modelValue.sort === desc ? asc : desc
		}
	} else {
		modelValue.sort = void 0
	}
	modelValue.value = e.value
	emit('change', modelValue)
}
</script>
<style lang="scss" scoped>
.goods-filter__active {
	.goods-filter-text {
		font-weight: bold;
		color: var(--uv-main-color);
	}
}
</style>

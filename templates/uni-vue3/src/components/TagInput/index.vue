<template>
	<view class="h-32px box-border tag-input w-full" :style="props.customInputStyle">
		<view class="pos-relative w-full h-full flex items-center">
			<uv-input
				:value="mergeValue"
				v-bind="{ ...props, customStyle: {} }"
				:model-value="mergeValue"
				focus
				v-if="isFocus"
				class="w-full"
				@input="onInput"
				@confirm="onConfirm"
				@blur="onBlur"
				@focus="onFocus"
				@clear="onClear"
				@keyboardheightchange="onKeyboardheightchange"
			/>
			<view
				class="flex flex-row pos-absolute z-2 gap-8rpx w-full h-24px"
				@click="showInput"
				v-if="!isFocus"
			>
				<view
					v-for="(text, index) in tags"
					:key="index"
					class="bg-#F2F3F5 rounded-full flex flex-row items-center gap-2px px-16rpx py-4rpx"
				>
					<view class="max-w-400rpx overflow-hidden">
						<text class="font-size-14px text-[var(--uv-text-color)] line-clamp-1">{{ text }}</text>
					</view>
					<uv-icon
						name="close"
						bold
						color="#333"
						:size="10"
						@click="removeTag"
						v-if="props.closable"
					></uv-icon>
				</view>
			</view>
			<view class="placeholder h-full flex-center" v-if="!isFocus && !mergeValue">
				<text :style="props.placeholderStyle" class="font-size-14px">{{ props.placeholder }}</text>
			</view>
		</view>
	</view>
</template>
<script setup name="TagInput">
import TagInputProps from './props'
import { useMergeModelValue, useToggle } from '@/composables'
import { computed } from 'vue'
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared'
	}
	// #endif
})
const props = defineProps(TagInputProps.props)
const mergeValue = useMergeModelValue(() => props.modelValue, {
	defaultValue: '',
	set(v) {
		emit('update:modelValue', v)
		emit('change', v)
	}
})
const tags = computed(() => {
	return mergeValue.value.split(',').filter(Boolean)
})

const [isFocus, foucsToggle] = useToggle(false)

function onInput(e) {
	mergeValue.value = e
	emit('input', e)
}

function showInput() {
	if (props.disabled) {
		return
	}
	foucsToggle(true)
}

const emit = defineEmits({
	input: true,
	search: true,
	confirm: true,
	blur: true,
	focus: true,
	clear: true,
	click: true,
	clickIcon: true,
	'update:modelValue': true,
	keyboardheightchange: true
})

function onConfirm(...args) {
	emit('confirm', ...args)
}

function onBlur(...args) {
	emit('blur', ...args)
	setTimeout(() => {
		foucsToggle(false)
	}, 40)
}

function onFocus(...args) {
	emit('focus', ...args)
}

function onClear(...args) {
	mergeValue.value = ''
	emit('clear', ...args)
}

function onKeyboardheightchange(...args) {
	emit('keyboardheightchange', ...args)
}

function removeTag(index) {
	if (props.disabled) return
	let copy = [...tags.value]
	copy.splice(index, 1)
	mergeValue.value = copy.join(',')
}
</script>
<style scoped lang="scss">
.tag-input {
	:deep(.uv-input__content__prefix-icon),
	:deep(.uv-input__content__subfix-icon) {
		display: none;
	}
}
</style>

<template>
	<scroll-view scroll-y class="w-full" :style="{ maxHeight: height }">
		<view v-for="(item, index) in options" :key="item[keyConfig.keyValue]">
			<view
				class="flex-horizontal items-center justify-between px-24rpx h-96rpx"
				:class="{ 'select-item__active': value.includes(item[keyConfig.keyValue]) }"
				@click="selectRow(item, index)"
			>
				<text class="select-item-text">{{ item[keyConfig.keyName] }}</text>
				<view v-if="value.includes(item[keyConfig.keyValue])">
					<NIcon name="check-line" :size="24" color="var(--uv-primary)" />
				</view>
			</view>
			<uv-line v-if="options.length - 1 > index" color="#E7E7E7" />
		</view>
		<view v-if="isEmpty(options)" class="p-24rpx">
			<Empty :width="100" />
		</view>
	</scroll-view>
</template>
<script setup>
import { computed, reactive, ref, toValue } from 'vue'
import { SELECT_PUPOP_KEY } from './context'
import usePopupContext from '@/components/WithPopup/usePopupContext'
import selectPickerProps from './props'
import NIcon from '../NIcon'
import { isArray, isEmpty } from 'lodash'
import Empty from '@/components/Empty'
import { useScreenInfo } from '@/composables'
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function'

const emit = defineEmits({
	select: true
})

const { listener, popupConfirm } = usePopupContext({ key: SELECT_PUPOP_KEY })
const screen = useScreenInfo()
const options = ref([])
const keyConfig = reactive({
	keyValue: selectPickerProps.props.keyValue.default,
	keyName: selectPickerProps.props.keyName.default
})
const value = ref([])
const immediateChangeDataStatus = ref(false)
const enableMultiple = ref(false)

const height = computed(() => {
	return addUnit(screen.value.pageContentHeight - screen.value.tabbarFixedHeight, 'px')
})

const getInitValue = (value, multiple = enableMultiple.value) => {
	if (multiple) {
		return isArray(value) ? value : []
	}
	return [value]
}

listener.onOpen(
	({
		list,
		keyValue = selectPickerProps.props.keyValue.default,
		keyName = selectPickerProps.props.keyName.default,
		modelValue,
		immediateChangeData,
		multiple
	}) => {
		options.value = list
		Object.assign(keyConfig, { keyName, keyValue })
		value.value = getInitValue(modelValue, multiple)
		immediateChangeDataStatus.value = immediateChangeData
		enableMultiple.value = multiple
	}
)

listener.onPopupBeforeConfirm(() => {
	return value.value
})

const updateValue = (selected) => {
	let selecteds = value.value
	let selectedValue = selected[keyConfig.keyValue]
	if (enableMultiple.value) {
		let index = selecteds.findIndex((v) => v === selectedValue)
		if (index > -1) {
			return selecteds.splice(index, 1)
		}
		selecteds.push(selectedValue)
	} else {
		selecteds = [selectedValue]
	}
	value.value = selecteds
}

const selectRow = (selected, index) => {
	updateValue(selected)
	emit('select', { value: toValue(value), selected, index })
	if (immediateChangeDataStatus.value) {
		popupConfirm()
	}
}
</script>
<style lang="scss" scoped>
.select-item__active {
	.select-item-text {
		color: $uv-primary;
	}
}
</style>

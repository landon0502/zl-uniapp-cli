<template>
	<view>
		<LFabBtn
			v-model:offset="offset"
			axis="xy"
			magnetic="x"
			:gap="6"
			@custom-click="onClick"
			@change="onOffsetChange"
		>
			{{ appStore.devEnv }}
		</LFabBtn>
		<SelectPicker :list="options" @confirm="setEnv" :model-value="appStore.devEnv" ref="pickerRef">
		</SelectPicker>
	</view>
</template>
<script setup>
import { ref, shallowRef } from 'vue'
import SelectPicker from '../SelectPicker'
import { useAppStore } from '@/store'
import Storage from '@/utils/Storage'
import { useDebounceFn } from '@/composables'
import LFabBtn from '@/uni_modules/lime-fab/components/l-fab/l-fab.vue'
const storageKey = '_DEV_BTN_OFFSET_'
const storage = new Storage()
const appStore = useAppStore()
const pickerRef = shallowRef()

const options = [
	{
		name: 'dev',
		value: 'dev'
	},
	{
		name: 'sim',
		value: 'sim'
	},
	{
		name: 'pre',
		value: 'pre'
	},
	{
		name: 'sit',
		value: 'sit'
	},
	{
		name: 'fat',
		value: 'fat'
	},
	{
		name: 'uat',
		value: 'uat'
	},
	{
		name: 'pro',
		value: 'pro'
	},
	{
		name: 'yapi',
		value: 'yapi'
	}
]
const offset = ref(storage.getItem(storageKey) || [0, 300])
const setEnv = (v) => {
	appStore.setDevEnv(v)
	uni.showToast({ title: '重启生效', icon: 'none' })
}

const onClick = () => {
	pickerRef.value.open()
}

const [onOffsetChange] = useDebounceFn((v) => {
	storage.setItem(storageKey, v)
}, 300)
</script>
<style lang="scss" scoped></style>

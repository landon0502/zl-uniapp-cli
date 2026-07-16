<template>
	<uv-empty v-bind="props" :icon="img"> </uv-empty>
</template>
<script setup>
import emptyImage from '@/assets/images/no-data.png'
import emptyYellow from '@/assets/images/empty-yellow.png'
import emptyGreen from '@/assets/images/empty-green.png'
import emptyProps from '@/uni_modules/uv-empty/components/uv-empty/props'
import { computed } from 'vue'

const props = defineProps({
	...emptyProps.props,
	icon: {
		type: String,
		default: ''
	},
	width: {
		type: [String, Number],
		default: 190
	},
	height: {
		type: [String, Number],
		default: 134
	},
	theme: String
})

const img = computed(() => {
	return (
		{
			green: emptyGreen,
			blue: emptyImage,
			yellow: emptyYellow
		}[props.theme ?? getApp().globalData.theme] ||
		props.icon ||
		emptyImage
	)
})
</script>

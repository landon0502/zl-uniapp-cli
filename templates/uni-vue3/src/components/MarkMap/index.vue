<template>
	<map
		:id="mapId"
		ref="mapRef"
		:style="props.customStyle"
		:controls="props.controls"
		:scale="props.scale"
		:latitude="props.location?.latitude"
		:longitude="props.location?.longitude"
		:markers="markers"
		@markertap="markerClickHandler"
		@tap="resetMarker"
		:show-location="props.showLocation"
		:maxScale="props.maxScale"
	></map>
</template>
<script setup>
import { isArray, isEmpty, isFunction, isPlainObject } from 'lodash'
import { computed, nextTick, shallowRef } from 'vue'
import { useMapContext, useMergeModelValue, useDebounceFn, useDefineInvoke } from '@/composables'
import { safeToNumber } from '@/utils/utils'

const props = defineProps({
	showLocation: Boolean,
	customStyle: Object,
	markersData: Array,
	scale: {
		type: Number,
		default: 16
	},
	controls: Array,
	location: {
		type: Object,
		default() {
			return {}
		}
	},
	markConfig: {
		type: [Object, Function]
	},
	idKey: {
		type: String,
		default: 'id'
	},
	selected: [String, Number],
	maxScale: {
		type: Number,
		default: 30
	},
	includePoints: {
		type: Boolean,
		default: true
	}
})

const emit = defineEmits({ markertap: true, maptap: true })

const mapId = 'marker-map'
/**
 * 组件实例
 */
const mapRef = shallowRef()
const mergeMarkersData = useMergeModelValue(() => props.markersData, {
	defaultValue: []
})

/**
 * 变量声明
 */
const selectedMarker = useMergeModelValue(
	() => {
		return props.selected
	},
	{
		defaultValue: []
	}
)

const markers = computed(() => {
	let data = mergeMarkersData.value.map((item) => {
		return {
			...item,
			__isSelected: safeToNumber(selectedMarker.value) === safeToNumber(item[props.idKey])
		}
	})

	const getMarkConfig = (m) => {
		if (isPlainObject(props.markConfig)) {
			return Object.assign({}, m, props.markConfig)
		}
		if (isFunction(props.markConfig)) {
			return props.markConfig(m)
		}
		return m
	}
	if (isEmpty(data)) return []
	if (isArray(data)) return data.map(getMarkConfig)
	if (isPlainObject(data)) return [getMarkConfig(data)]

	return []
})
const markersDefineInvoke = useDefineInvoke(() => !isEmpty(markers.value))

const { mapContext, includePoints } = useMapContext(mapId, {
	markers: markers,
	includePoints: true,
	callback() {
		markersDefineInvoke(async () => {
			if (props.includePoints) {
				await nextTick()
				includePoints()
			}
		})
	}
})

/**
 * 变量声明
 */

const selectMarker = async (id) => {
	selectedMarker.value = id
}

const [markerClickHandler] = useDebounceFn((e) => {
	const markerId = e.detail.markerId
	selectMarker(markerId)
	emit('markertap', e)
})

const resetMarker = () => {
	selectMarker()
	emit('maptap')
}

defineExpose({
	mapContext,
	moveToLocation(options = {}) {
		mapContext.value.moveToLocation(options)
	},
	openMapApp(options) {
		mapContext.value.openMapApp(options)
	},
	selectMarker: markerClickHandler
})
</script>

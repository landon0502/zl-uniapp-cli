<template>
	<view class="w-full">
		<view class="w-full">
			<scroll-view :scroll-x="true">
				<view class="flex flex-row py-24rpx px-24rpx items-center">
					<view
						v-for="(item, index) in mergeValue"
						:key="index"
						class="flex-horizontal items-center selected-col"
					>
						<view
							@click="areaChange(index)"
							class="h-60rpx rounded-8rpx bg-#F2F3F5 flex-center px-24rpx"
							:class="{ active: index === current }"
						>
							<text
								class="font-size-14px line-height-22px text-center text-[var(--uv-main-color)] whitespace-nowrap"
								:class="{ 'active-text': index === current }"
								>{{ item.name }}</text
							>
						</view>
					</view>

					<view
						v-if="last(mergeValue)?.level !== props.level && !mergeValue[current]?.level"
						class="h-60rpx rounded-8rpx bg-#F2F3F5 flex-center px-24rpx selected-col"
						:class="{ active: current === mergeValue.length }"
						id="selected-placeholder"
						@click="areaChange(mergeValue.length)"
					>
						<text
							class="font-size-14px line-height-22px text-center text-[var(--uv-main-color)] whitespace-nowrap"
							:class="{ 'active-text': current === mergeValue.length }"
						>
							请选择
						</text>
					</view>
				</view>
			</scroll-view>
			<uv-line />
		</view>
		<view class="h-600rpx">
			<scroll-view :scroll-y="true" class="w-full h-full">
				<view class="flex flex-col gap-12rpx px-24rpx">
					<view
						v-for="(item, index) in renderDistrictsList"
						:key="index"
						@click="selectHandler(item, index)"
						class="h-96rpx flex-horizontal items-center"
					>
						<text
							class="font-size-16px font-400 line-24px text-[var(--uv-main-color)]"
							:class="{ 'active-text': isRowActived(mergeValue[current], item) }"
							>{{ item.name }}</text
						>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>
<script setup>
import { computed, ref } from 'vue'
import { ADDRESS_SELECT_PUPOP_KEY, useServices } from './context'
import usePopupContext from '@/components/WithPopup/usePopupContext'
import { isEmpty, isArray, last, omit, mergeWith } from 'lodash'
import { chainInfocode, amapGeoDistrictKey } from '@/contants'
import { findTreeNodes } from '@/utils/utils'
import { useStorage } from '@/composables'

const props = defineProps({
	level: {
		validator(v) {
			return ['province', 'city', 'district', 'street'].includes(v)
		},
		default: 'street'
	}
})
const childrenKey = 'districts'
const { setItem } = useStorage(amapGeoDistrictKey)
/**
 * hooks
 */
const { regionControl, adressDetailControl } = useServices()
const { listener, setFooterConfig } = usePopupContext({ key: ADDRESS_SELECT_PUPOP_KEY })

/**
 * 变量声明
 */
const mergeValue = ref([])
const area = ref(getApp().globalData.amapGeoDistricts || [])
const current = ref(0)

/**
 * 渲染的列表
 */
const renderDistrictsList = computed(() => {
	const currentSelectedParent =
		current.value === 0 ? area.value[0] : mergeValue.value[current.value - 1]

	let list = findTreeNodes(
		area.value,
		(node) => node.level !== 'street' && currentSelectedParent?.adcode === node.adcode,
		childrenKey
	)
	return list?.[0]?.[childrenKey] ?? []
})

/**
 * 选择地址
 */
const selectHandler = async (item) => {
	let isLastLevel = item.level === props.level
	if (mergeValue.value.length <= current.value) {
		mergeValue.value.push(omit(item, [childrenKey]))
	} else {
		mergeValue.value.splice(
			current.value,
			mergeValue.value.length - current.value,
			omit(item, [childrenKey])
		)
	}
	// 当还存在下级时，禁用提交按钮
	setFooterConfig({
		confirmBtnProps: {
			disabled: !isLastLevel
		}
	})
	if (!isLastLevel) {
		current.value++
		if (isEmpty(item[childrenKey])) {
			let districts = await fetchDistricts(item.adcode, 3)
			area.value = mergeDistrictsData(districts)
		}
	}
}

const fetchDistricts = async (code = chainInfocode, subdistrict = 1) => {
	let res = await regionControl.run({
		keywords: code,
		subdistrict,
		page: 1
	})

	return res.data.districts
}

const fillInitValueParams = (value = [], districts = area.value) => {
	if (isEmpty(value) || !isArray(value)) return value

	let list = findTreeNodes(
		districts,
		(node) =>
			value.some(
				(item) =>
					(item.adcode === node.adcode && node.level !== 'street') ||
					(node.level === 'street' && node.name === item.name)
			),
		childrenKey
	).map((item) => omit(item, [childrenKey]))

	return list
}

/**
 * 合并请求的地址数据
 */
const mergeDistrictsData = (newDistricts) => {
	let mergeDistricts = mergeWith(area.value, newDistricts, (objValue, srcValue) => {
		let find = findTreeNodes(
			[objValue],
			(node) => {
				return srcValue.level !== 'street' && node.adcode === srcValue.adcode
			},
			childrenKey
		)
		if (!isEmpty(find)) {
			find[0].districts = srcValue.districts
		}
		return objValue
	})

	return mergeDistricts
}
/**
 * 补全选择数据数据
 */
const init = async () => {
	// 存储 市级数据
	if (isEmpty(area.value)) {
		area.value = await fetchDistricts(void 0, 2)
		getApp().globalData.amapGeoDistricts = area.value
		setItem(area.value)
	}

	if (mergeValue.value.length > 2) {
		let [, city, district] = mergeValue.value
		let currentDistricts = findTreeNodes(
			area.value,
			(node) => {
				return node.level !== 'street' && node.adcode === district.adcode
			},
			childrenKey
		)
		if (isEmpty(currentDistricts)) {
			let districts = await fetchDistricts(city.adcode, 3)
			area.value = mergeDistrictsData(districts)
		}
	}
	mergeValue.value = await fillInitValueParams(mergeValue.value)
}

/**
 * 在弹窗打开时 获取已选择的值
 */
listener.onOpen(async (data) => {
	mergeValue.value = data
	if (!isEmpty(data)) {
		current.value = data.length - 1
	}
	await init(data)

	// 如果值为空，禁用提交按钮
	if (isEmpty(mergeValue.value)) {
		setFooterConfig({
			confirmBtnProps: {
				disabled: true
			}
		})
	}
})

/**
 * 返回数据，在onConfirm res[key]中取返回值
 */
listener.onPopupBeforeConfirm(async () => {
	let lastValue = last(mergeValue.value)
	// 如果最后一级为街道级，由于高德地图/v3/geocode/regeo接口街道级adcode部分数据复用了区级adcode，必须请求详情重新拿回街道数据
	if (lastValue.level === 'street') {
		const [longitude, latitude] = lastValue.center.split(',')
		let res = await adressDetailControl.run({ longitude, latitude })
		lastValue.adcode = res.data.regeocode.addressComponent.towncode
	}
	mergeValue.value.splice(mergeValue.value.length - 1, 1, lastValue)
	return mergeValue.value
})

/**
 * 区域列表切换
 */
const areaChange = async (index) => {
	current.value = index
}

/**
 * 是否激活
 */
const isRowActived = (v, node) => {
	if (!v || !node) return false
	if (v.level === node.level && node.level === 'street') {
		return v.name === node.name && v.adcode === node.adcode
	}
	return v.adcode === node.adcode
}
</script>
<style lang="scss" scoped>
.active {
	color: $uv-primary;
	border: 1rpx solid $uv-primary;
	background: $uv-primary-light;
	box-sizing: border-box;
	&-text {
		color: $uv-primary;
	}
}
.selected-col {
	&::after {
		display: block;
		content: '';
		width: 20rpx;
		height: 1px;
		background: #000000e5;
	}
	&:last-of-type {
		&::after {
			display: none;
		}
	}
}
</style>

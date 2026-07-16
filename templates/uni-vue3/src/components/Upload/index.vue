<template>
	<view
		class="upload"
		:class="{ 'upload-disabled': props.disabled }"
		:style="{ '--upload-size': addUnit(props.size, 'px') }"
	>
		<uv-upload
			v-bind="props"
			:fileList="fileList"
			multiple
			:maxCount="props.maxCount"
			useBeforeRead
			@beforeRead="onBeforeRead"
			@afterRead="onAfterRead"
			@delete="onDelete"
		>
			<slot name="upload-btn" v-if="!props.hideUploadBtn"></slot>
		</uv-upload>
	</view>
</template>
<script setup name="Upload">
import { useMergeModelValue } from '@/composables'
import uploadProps from './props'
import { toRefs, computed } from 'vue'
import { uploadFile } from '@/utils/uploadFile'
import { getFileTypeByUrl, getFileSuffix } from '@/utils/utils'
import { addUnit, getPx } from '@/uni_modules/uv-ui-tools/libs/function'
defineOptions({
	// #ifdef MP-WEIXIN
	options: {
		styleIsolation: 'shared'
	}
	// #endif
})
const emit = defineEmits({
	'update:modelValue': true,
	change: true,
	beforeRead: true
})

const props = defineProps(uploadProps.props)
const { modelValue } = toRefs(props)
const mergeValue = useMergeModelValue(modelValue, {
	defaultValue: []
})

const initFileList = computed(() => {
	return (
		mergeValue?.value?.map?.((url) => {
			let type = getFileTypeByUrl(url)
			let file = {
				type,
				url,
				status: 'success',
				thumb: {
					video: `${url}?x-oss-process=video/snapshot,t_1000,f_jpg,w_${getPx(props.width)}`,
					image: `${url}?x-oss-process=${type}/resize,,w_${getPx(props.width)},h_${getPx(props.height)}`
				}[type]
			}
			if (file.type === 'image') {
				file.thumb = url
			}
			return file
		}) ?? []
	)
})
const fileList = useMergeModelValue(initFileList, {
	set(val) {
		emit(
			'update:modelValue',
			val.map((item) => item.url)
		)
	}
})
const onBeforeRead = async (event, files, name) => {
	emit('beforeRead', event, files, name)
}
const onAfterRead = async (event) => {
	// 当设置 multiple 为 true 时, file 为数组格式，否则为对象格式
	let lists = [].concat(event.file)
	let fileListValues = fileList.value
	let fileListLen = fileListValues.length
	lists.map((item) => {
		fileListValues.push({
			...item,
			status: 'uploading',
			message: '上传中'
		})
	})

	for (let i = 0; i < lists.length; i++) {
		try {
			const { url, name } = lists[i]
			const result = await uploadFilePromise({ url, filename: name || url })
			let item = fileListValues[fileListLen]
			fileListValues.splice(
				fileListLen,
				1,
				Object.assign(item, {
					status: 'success',
					message: '',
					url: result.url
				})
			)
			fileListLen++
		} catch {
			lists[i].status = 'error'
			return Promise.reject('上传失败')
		}
	}
	fileList.value = fileListValues
	emit('change', fileListValues)
}

/**
 * 文件上传
 * @param param0
 */
const uploadFilePromise = ({ url, filename }) => {
	return uploadFile({
		filePath: url,
		ext: getFileSuffix(filename),
		payload: props.uploadPayload
	})
}

/**
 * 删除上传的文件
 */
const onDelete = ({ index }) => {
	let list = fileList.value ?? []
	list.splice(index, 1)
	fileList.value = list
	emit('change', fileList.value)
}
</script>
<style lang="scss" scoped>
$size: var(--upload-size);
@mixin rounded-card {
	border-radius: 8px;
	width: $size !important;
	height: $size !important;
}
.upload {
	:deep(.uv-upload) {
		overflow: unset;
		.uv-upload__wrap {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
		}
		.uv-upload__wrap__preview {
			overflow: unset;
			margin: 0 !important;
		}
		.uv-upload__wrap__preview__image,
		.uv-upload__wrap__preview__other,
		.uv-upload__button {
			@include rounded-card;
		}
		.uv-upload__deletable {
			width: 20px;
			height: 20px;
			border-radius: 20px;
			background: #939496;

			display: flex;
			align-items: center;
			justify-content: center;
			right: 6rpx;
			top: 6rpx;

			.uv-upload__deletable__icon {
				position: static;
			}
			.uv-icon__icon {
				font-size: 16px !important;
				color: #fff !important;
			}
		}
		.uv-upload__success {
			display: none;
		}
		.uv-upload__status {
			border-radius: 8px;
		}
		.uv-upload__wrap__preview {
			margin: 0 20rpx 20rpx 0;
		}
	}
}
.upload-disabled {
	:deep(.uv-upload__deletable) {
		display: none !important;
	}
}
</style>

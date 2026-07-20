import { genUuid, getFileSuffix } from './utils'
import { fetchOssToken } from '@/api/common'
import { validURL } from './validate'

/**
 * 补全上传资源路径
 */
export function fullUploadFilePath(url) {
	if (!url || validURL(url)) {
		return url
	}
	return import.meta.env.VITE_UPLOAD_URL + '/' + url
}

/**
 * 获取oss 配置信息
 * @param {*} file
 * @param {*} payload
 * @returns
 */
export async function getOSSData({ filePath, payload, ext }) {
	const result = await fetchOssToken(payload)
	if (result.success !== '1') {
		return false
	}

	const data = result.data
	const { dir, policy, accessid, signature } = data
	const token = {
		policy: policy,
		OSSAccessKeyId: accessid,
		success_action_status: '200',
		signature: signature
	}
	if (!ext) {
		throw new Error('缺失后缀')
	}
	return {
		...token,
		key: dir + genUuid() + (ext || getFileSuffix(filePath))
	}
}

/**
 * 文件上传
 */
export const uploadFile = async ({ filePath, payload, ext }) => {
	let ossData = await getOSSData({ filePath, payload, ext })

	await uni.$uv.http.upload(import.meta.env.VITE_UPLOAD_URL, {
		custom: { raw_response: true },
		name: 'file',
		filePath,
		formData: ossData
	})

	return {
		url: fullUploadFilePath(ossData.key)
	}
}

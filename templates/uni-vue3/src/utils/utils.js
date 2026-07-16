import { isString, isPlainObject, isArray, isEmpty, isFunction, omit } from 'lodash'
import { deepClone, getHistoryPage } from '@/uni_modules/uv-ui-tools/libs/function'
import { checkNum, validURL } from './validate'
import { getCurrentInstance, unref } from 'vue'
// #ifdef H5
import pinyin from 'tiny-pinyin'
// #endif
// #ifdef APP
import { chineseToPinyin } from '@/uni_modules/w-pinyin'
// #endif
// #ifdef APP-NVUE
const dom = weex.requireModule('dom')
// #endif
// #ifdef MP-WEIXIN
import UUID from './UUID'
// #endif
// #ifndef MP-WEIXIN
import { v4 as uuid } from 'uuid'
// #endif
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
/**
 * 手机号加密
 */
export const phoneEncrypt = (phone) => {
	if (phone) {
		return phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
	}
	return ''
}

/**
 * 金字塔分组
 * @param {*} arr
 * @returns
 */
export function pyramidGrouping(arr) {
	const result = []
	let currentIndex = 0
	let level = 1 // 金字塔层级，第n层有n个元素

	while (currentIndex < arr.length) {
		const levelItems = arr.slice(currentIndex, currentIndex + level)
		result.push(levelItems)
		currentIndex += level
		level++
	}

	return result
}

/**
 * 解析json字符串
 */
export function sefaJsonParse(jsonString) {
	try {
		return JSON.parse(jsonString)
	} catch {
		return void 0
	}
}

/**
 * 获取值类型
 */
export function getValueType(value) {
	let t = Object.prototype.toString.call(value)
	let reg = /^\[(object){1}\s{1}(\w+)\]$/i
	return t.replace(reg, '$2').toLowerCase()
}

export const safeParse = (input, defaultValue = {}) => {
	if (input) {
		try {
			return JSON.parse(input)
		} catch (ex) {
			console.error(ex)
		}
	}
	return defaultValue
}

export const expectArray = (input) => {
	if (input) {
		if (Array.isArray(input)) {
			return input
		}
		const value = safeParse(input, [])
		if (isString(value)) {
			return expectArray(value)
		}
		return Array.isArray(value) ? value : []
	}
	return []
}

export const expectObject = (input) => {
	if (input) {
		if (isPlainObject(input)) {
			return input
		}
		const value = safeParse(input, {})
		return isPlainObject(value) ? value : {}
	}
	return {}
}

/**
 * 生成uuid
 */
export function genUuid() {
	// #ifdef MP-WEIXIN
	return UUID.v4()
	// #endif
	// #ifndef MP-WEIXIN
	return uuid()
	// #endif
}
/**
 * 获取页面id
 * @returns
 */
export function getPageId(pageInstance) {
	const currentPage = pageInstance ?? getHistoryPage()
	// #ifdef MP-WEIXIN
	return currentPage.__wxWebviewId__
	// #endif
	// #ifndef MP-WEIXIN
	return currentPage.$.uid
	// #endif
}

/**
 * @param filename
 * @Explain filename字符串处理,获取文件后缀
 * @Return String
 */
export function getFileSuffix(filename) {
	const pos = filename.lastIndexOf('.')
	let suffix = ''
	if (pos !== -1) {
		suffix = filename.substring(pos)
	}
	return suffix
}

export function base64ToFile(base64String, filename) {
	// 将 base64 字符串分割成两部分：第一部分是数据类型（如：data:image/png;base64,），第二部分是纯数据
	const arr = base64String.split(',')
	const mime = arr[0].match(/:(.*?);/)[1] // 提取 MIME 类型
	const bstr = atob(arr[1]) // 解码 base64 字符串
	let n = bstr.length
	const u8arr = new Uint8Array(n)
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n)
	}
	// 创建 Blob 对象
	const blob = new Blob([u8arr], { type: mime })
	// 创建 File 对象
	return new File([blob], filename, { type: mime })
}

export function getExtensionFromBase64(base64) {
	const mime = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
	if (mime && mime.length > 1) {
		switch (mime[1]) {
			case 'image/jpeg':
				return 'jpg'
			case 'image/png':
				return 'png'
			case 'image/gif':
				return 'gif'
			// 可以根据需要添加其他类型
			default:
				return 'png'
		}
	}
	return 'png'
}

export function base64ToFilePath(base64Data) {
	return new Promise((resolve, reject) => {
		// #ifdef H5
		// 在 H5 端，我们转换为 File 对象
		const file = base64ToFile(base64Data, 'image.png')
		resolve(file)
		// #endif

		// #ifndef H5
		// 在小程序端和 App 端，将 base64 写入临时文件
		const fileManager = uni.getFileSystemManager()
		// 生成临时文件路径
		const filePath = `${uni.env.USER_DATA_PATH}/temp_${Date.now()}.png`
		// 将 base64 数据写入文件
		fileManager.writeFile({
			filePath,
			data: base64Data.replace(/^data:image\/\w+;base64,/, ''),
			encoding: 'base64',
			success: () => {
				resolve(filePath)
			},
			fail: (err) => {
				reject(err)
			}
		})
		// #endif
	})
}

/**
 * 安全的执行promise
 * @param {*} promise
 * @returns
 */
export async function safeAwait(promise) {
	try {
		const result = await promise
		return [null, result] // ✅ 第一个是错误，第二个是结果
	} catch (error) {
		return [error, null] // ❌ 出错时返回错误
	}
}

/**
 * 补全oss url文件地址
 * @param {*} url
 * @returns
 */
export function fillOssUrl(url) {
	return validURL(url)
		? url
		: import.meta.env.VITE_UPLOAD_URL + (url.startsWith('/') ? url : '/' + url)
}

/**
 * 获取文件类型
 * @param {*} url
 * @returns
 */
export function getFileTypeByUrl(url) {
	// 去掉参数和 hash
	const cleanUrl = url.split('?')[0].split('#')[0]
	const ext = cleanUrl.split('.').pop().toLowerCase()

	const map = {
		image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
		video: ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'ogg'],
		audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'],
		document: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
		code: ['js', 'ts', 'json', 'html', 'css', 'java', 'c', 'cpp', 'py'],
		zip: ['zip', 'rar', '7z', 'tar', 'gz']
	}

	for (const key in map) {
		if (map[key].includes(ext)) return key // 返回类别
	}

	return ext || 'unknown' // 如果不在表中，则返回扩展名
}

/**
 * 格式化树
 */
export function formatTree(tree, format, childrenKey = 'children') {
	if (!isArray(tree)) {
		return new Error('The parameters can only be arrays or objects!')
	}
	if (!isFunction(format)) {
		return new Error('The parameters can only be function!')
	}
	let list = []
	tree.forEach((node) => {
		let item = format(node)
		let children = node[childrenKey]
		if (!isEmpty(children)) {
			item[childrenKey] = formatTree(children, format, childrenKey)
		}
		list.push(item)
	})
	return list
}

/**
 * 过滤树
 */
export function filterTree(tree, predicate, childrenKey = 'children') {
	let copy = deepClone(tree)
	if (!isArray(tree)) {
		return new Error('The parameters can only be arrays or objects!')
	}
	if (!isFunction(predicate)) {
		return new Error('The parameters can only be function!')
	}
	let list = copy.filter(predicate)
	list.forEach((node) => {
		let children = node[childrenKey]
		if (!isEmpty(children)) {
			node[childrenKey] = filterTree([...children], predicate, childrenKey)
		}
	})
	return list
}

export function formatMs(ms) {
	const d = dayjs.duration(ms)
	return {
		year: d.years(),
		day: d.days(),
		hour: String(d.hours()).padStart(2, '0'),
		minute: String(d.minutes()).padStart(2, '0'),
		second: String(d.seconds()).padStart(2, '0')
	}
}

/**
 * 拼接oss资源域名 固定存放地址
 */
export function fullAssetsOssPath(path) {
	if (!path) return path
	return (
		import.meta.env.VITE_ASSETS_OSS_BASEURL +
		'/scmsv-assets' +
		(path.startsWith('/') ? path : '/' + path)
	)
}
/**
 *  通用的 uni API Promise 化方法
 * @param {*} apiName
 * @returns
 */
export function uniPromisify(apiName) {
	return (options = {}) =>
		new Promise((resolve, reject) => {
			uni[apiName]({
				...options,
				success(res) {
					if (isFunction(options.success)) options.success(res)
					resolve(res)
				},
				fail(err) {
					if (isFunction(options.fail)) options.fail(err)
					reject(err)
				}
			})
		})
}

/**
 * 获取树型深度
 * @param {*} tree
 * @param {*} childKey
 * @returns
 */
export function getTreeDepth(tree, childKey = 'children', start = 1) {
	let max = 0

	function dfs(list, depth) {
		list.forEach((item) => {
			max = Math.max(max, depth)
			const children = item[childKey]
			if (children && children.length) {
				dfs(children, depth + 1)
			}
		})
	}

	dfs(tree, start)
	return max
}

/**
 * tree数据平铺
 * @param {*} tree
 * @returns
 */
export function flattenTreeIterative(tree, predicate, childKey = 'children') {
	const stack = [...tree].map((item) => predicate(item))
	const result = []

	while (stack.length) {
		const node = stack.shift()
		const children = node[childKey]
		result.push(omit(node, childKey))

		if (children?.length) {
			stack.unshift(...children.map((item) => predicate(item, node)))
		}
	}

	return result
}

/**
 * 查找树节点
 * @param {*} tree
 * @param {*} predicate
 * @param {*} childrenKey
 * @returns
 */
export function findTreeNodes(tree, predicate, childrenKey = 'children') {
	const result = []

	function dfs(nodes) {
		for (const node of nodes) {
			if (predicate(node)) {
				result.push(node)
			}
			const children = node[childrenKey]
			if (Array.isArray(children)) {
				dfs(children)
			}
		}
	}

	dfs(tree)
	return result
}

/**
 * 提取树结构的指定层级数据
 * @param {Array} tree - 原始树结构数组
 * @param {string} childrenKey - 子节点字段名（默认 'children'）
 * @param {number} maxLevel - 子节点字段名（默认 'children'）
 * @returns {Array}  指定的所有节点数据
 */
export function getThirdLevelNodes(tree, maxLevel = 3, childrenKey = 'children') {
	const thirdLevelNodes = []
	// 递归遍历树，记录当前层级
	function traverse(nodes, currentLevel) {
		if (!nodes || !nodes.length || currentLevel > maxLevel) return
		for (const node of nodes) {
			if (currentLevel === maxLevel) {
				thirdLevelNodes.push(node)
			} else {
				traverse(node[childrenKey], currentLevel + 1)
			}
		}
	}

	// 初始遍历：第一层节点，层级从1开始
	traverse(tree, 1)
	return thirdLevelNodes
}

/**
 * 将字符串数字转为Number，如果不是数字，则返回原值
 */
export function safeToNumber(value) {
	if (checkNum(value)) {
		return Number(value)
	}
	return value
}

/**
 * 查询节点
 * @param {*} selector
 * @returns
 */
export async function queryNodeRect(elRef, instance = getCurrentInstance()) {
	// #ifdef APP-NVUE
	return new Promise((resolve) => {
		dom.getComponentRect(unref(elRef), (res) => {
			resolve(res.size)
		})
	})
	// #endif
	// #ifndef APP-NVUE
	try {
		if (!elRef) {
			return null
		}
		let res = await instance?.ctx?.$uv?.getRect?.(elRef)

		return res
	} catch (error) {
		return Promise.reject(error)
	}
	// #endif
}

/**
 * 检测app定位权限
 * @returns
 */
export function checkLocationPermission() {
	return new Promise((resolve) => {
		// #ifdef H5
		resolve({
			granted: true,
			status: null
		})
		// #endif
		// #ifdef APP
		let res = uni.getAppAuthorizeSetting()
		const status = res.locationAuthorized

		resolve({
			granted: status === 'authorized',
			status
		})
		// #endif
	})
}

//获取字符串首字母
export function getFirstLetter(str, maxLen = 50) {
	if (str === null || str === undefined || str === '') {
		return ''
	}
	// #ifdef H5
	const pinyinarr = pinyin.parse(str)
	if (pinyinarr.length === 0) return ''
	return pinyinarr
		.filter((p) => p.type !== 3)
		.map((p) => (p.type === 1 ? p.target : p.target.slice(0, 1)))
		.join('')
		.substr(0, maxLen)
		.toUpperCase()
	// #endif
	// #ifdef APP
	const s = chineseToPinyin(str)
	return s
		.split(' ')
		.filter(Boolean)
		.reduce((acc, it) => acc + it[0], '')
	// #endif
}

//判断字符串是否为数字
export function checkNum(val) {
	const re = /^-?[1-9][0-9]*(\.\d*)?$|^-?0(\.\d*)?$/
	return re.test(val)
}

export function isvalidPhone(phone) {
	const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
	return reg.test(phone)
}

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
	return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
	const valid_map = ['admin', 'editor']
	return valid_map.indexOf(str.trim()) >= 0
}

/**
 * @param {string} url
 * @returns {Boolean}
 */
export function validURL(url) {
	return /^(https?:\/\/)(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[\w\-./?%&=]*)?$/i.test(
		url
	)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validLowerCase(str) {
	const reg = /^[a-z]+$/
	return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUpperCase(str) {
	const reg = /^[A-Z]+$/
	return reg.test(str)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validAlphabets(str) {
	const reg = /^[A-Za-z]+$/
	return reg.test(str)
}

/**
 * @param {string} email
 * @returns {Boolean}
 */
export function validEmail(email) {
	const reg =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
	return reg.test(email)
}

/**
 * 是否合法IP地址
 * @param rule
 * @param value
 * @param callback
 */
export function validateIP(value) {
	const reg =
		/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
	return reg.test(value)
}

/* 是否手机号码或者固话*/
export function validatePhoneTwo(value) {
	const reg = /^((0\d{2,3}-\d{7,8})|(1[34578]\d{9}))$/
	return reg.test(value)
}

/* 是否固话*/
export function validateTelephone(value) {
	const reg = /0\d{2}-\d{7,8}/
	return reg.test(value)
}

/* 是否手机号码*/
export function validatePhone(value) {
	const reg = /^[1][3,4,5,7,8][0-9]{9}$/
	return reg.test(value)
}

/* 是否身份证号码*/
export function validateIdNo(value) {
	const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
	return reg.test(value)
}

export function isInteger(num) {
	return num % 1 === 0
}

/**
 * @desc 校验中文
 */
export function checkChinese(v) {
	return /^[\u4e00-\u9fa5]+$/.test(v)
}

/**
 * @desc 验证数字或英文字符
 */
export function letterAndNumber(val) {
	return /^[a-zA-Z0-9]+$/.test(val)
}

/**
 * @desc 校验字符串是否为数字
 */
export function checkNumString(v) {
	if (typeof v !== 'string') return false
	return /^[0-9]+.?[0-9]*$/.test(v)
}

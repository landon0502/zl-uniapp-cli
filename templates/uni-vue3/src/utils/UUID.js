class UUID {
	/**
	 * 生成v4版本的UUID
	 */
	static v4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			// 使用小程序的Math.random()，不依赖crypto
			const r = (Math.random() * 16) | 0
			const v = c === 'x' ? r : (r & 0x3) | 0x8
			return v.toString(16)
		})
	}

	/**
	 * 生成指定长度的随机字符串
	 */
	static randomString(length = 8) {
		let result = ''
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length))
		}
		return result
	}

	/**
	 * 生成简化的UUID（无连字符）
	 */
	static simple() {
		return this.v4().replace(/-/g, '')
	}

	/**
	 * 基于时间戳的UUID（性能更好）
	 */
	static timeBased() {
		const timestamp = Date.now().toString(36)
		const randomStr = Math.random().toString(36).substring(2, 10)
		return `${timestamp}-${randomStr}`
	}

	/**
	 * 生成多个UUID
	 */
	static generateMultiple(count) {
		const uuids = []
		for (let i = 0; i < count; i++) {
			uuids.push(this.v4())
		}
		return uuids
	}
}

export default UUID

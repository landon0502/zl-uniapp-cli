import { isUndefined, isFunction } from 'lodash'
class RouterEvents {
	eventCache = new Map()
	add(pageId, events) {
		this.eventCache.set(pageId, events)
	}
	clear(pageId) {
		if (isUndefined(pageId)) {
			this.eventCache.clear()
		} else {
			this.eventCache.delete(pageId)
		}
	}
	invoke(pageId, key, data) {
		if (!pageId) return
		let pageEvent = this.eventCache.get(pageId) ?? {}
		let fn = pageEvent[key]
		if (isFunction(fn)) {
			fn(data)
		}
		// 执行完成后进行清除
		this.clear(pageId)
	}
}
export default RouterEvents

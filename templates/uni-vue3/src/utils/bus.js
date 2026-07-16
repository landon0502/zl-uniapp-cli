import { isUndef } from './is'
import { isEmpty, noop } from 'lodash'

/**
 * @zh 全局事件
 */
export class EventBus {
	events = {}
	taskCallBackCache = {}
	/**
	 * 绑定监听函数
	 * evt: 事件
	 * callback: 绑定函数
	 * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
	 */
	$on(evt, callback, autoTrigger = false) {
		if (!this.events[evt]) this.events[evt] = []
		if (callback) {
			this.events[evt].push(callback)
		}

		if (Reflect.has(this.taskCallBackCache, evt)) {
			autoTrigger && this.$emit(evt, ...this.taskCallBackCache[evt])
			delete this.taskCallBackCache[evt]
		}
		return this
	}
	// 发布事件
	$emit(evt, ...payload) {
		const callbacks = this.events[evt]
		if (callbacks) {
			callbacks.forEach((cb) => cb.apply(this, payload))
		} else {
			// 对在$emit后绑定的$on，先缓存参数，等绑定后再调用
			this.taskCallBackCache[evt] = payload
		}

		return this
	}
	// 删除订阅
	$off(evt, callback = noop) {
		if (isUndef(evt)) {
			this.$clear()
		} else if (typeof evt === 'symbol' || typeof evt === 'string') {
			if (typeof callback === 'function' && Array.isArray(this.events[evt])) {
				this.events[evt] = this.events[evt].filter((cb) => cb !== callback)
			} else {
				Reflect.deleteProperty(this.events, evt)
				this.taskCallBackCache[evt] = null
			}
		}
		return this
	}
	// 只进行一次的事件订阅
	$once(evt, callback = noop) {
		const proxyCallback = (...payload) => {
			callback.apply(this, payload)
			// 回调函数执行完成之后就删除事件订阅
			this.$off(evt, proxyCallback)
		}

		this.$on(evt, proxyCallback)
	}
	// 判断某一个事件是否还存着
	$has(evt, callback = noop) {
		if (isEmpty(this.events)) {
			return false
		}
		if (isUndef(callback)) {
			return !isEmpty(this.events[evt])
		}
		let events = this.events[evt] ?? []
		return events.some((item) => item === callback)
	}
	// 清除所有事件
	$clear() {
		this.events = {}
		this.taskCallBackCache = {}
	}
}
export default new EventBus()

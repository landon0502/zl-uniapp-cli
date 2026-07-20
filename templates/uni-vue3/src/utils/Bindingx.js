import { isNvue } from '@/utils/is'
import { isFunction, isPlainObject, noop } from 'lodash'
// #ifdef APP-NVUE
const Binding = uni.requireNativePlugin('bindingx')
// #endif

function getOptions(options) {
	return isFunction(options) ? options() : isPlainObject(options) ? options : {}
}

export default class Bindingx {
	pendingQueue = []
	constructor() {
		if (!isNvue()) {
			console.warn('The current class can only be used in nvue！！！')
		}
	}
	// 手势操作
	pan({ anchor, props = [], callback = noop }) {
		const options = {
			eventType: 'pan',
			anchor,
			props
		}
		return Binding.bind(options, (res) => {
			callback(res)
		})
	}
	// 动画
	timing({ exitExpression, props = [], callback = noop }) {
		const options = {
			eventType: 'timing',
			exitExpression,
			props
		}
		return Binding.bind(options, (res) => {
			callback(res)
		})
	}
	// 滚动
	scroll({ anchor, props = [], callback = noop }) {
		const options = {
			eventType: 'scroll',
			anchor,
			props
		}
		return Binding.bind(options, (res) => {
			callback(res)
		})
	}
	// 陀螺仪
	orientation({ props = [], callback = noop }) {
		return Binding.bind(
			{
				eventType: 'orientation',
				props
			},
			(res) => {
				callback(res)
			}
		)
	}
	bind({ type, options }) {
		const mergeOptions = getOptions(options)
		let token = null
		const callback = (res) => {
			if (res.state === 'exit' || res.state === 'end') {
				Binding.unbind({ type: mergeOptions.type, token })
			}
			mergeOptions?.callback?.(res)
		}
		mergeOptions.callback = callback
		let bindRes = this[type](mergeOptions)
		token = bindRes.token
	}
	next({ type, options }) {
		this.pendingQueue.push({ type, options })
		return this
	}
	run(done = noop) {
		let _self = this
		let config = this.pendingQueue.splice(0, 1)
		this.bind({
			...config,
			callback(res) {
				config?.callback?.(res)
				if (this.pendingQueue.length > 0) {
					_self.run()
				} else {
					done()
				}
			}
		})
	}
}

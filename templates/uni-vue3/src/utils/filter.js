import { toValue } from 'vue'
import { noop } from 'lodash'
/**
 * @internal
 */
export function createFilterWrapper(filter, fn) {
	function wrapper(...args) {
		return new Promise((resolve, reject) => {
			// make sure it's a promise
			Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args }))
				.then(resolve)
				.catch(reject)
		})
	}

	return wrapper
}
/**
 * Create an EventFilter that debounce the events
 */
export function debounceFilter(ms, options = {}) {
	let timer
	let maxTimer
	let lastRejector = noop

	const _clearTimeout = (timer) => {
		clearTimeout(timer)
		lastRejector()
		lastRejector = noop
	}

	let lastInvoker

	const filter = (invoke) => {
		const duration = toValue(ms)
		const maxDuration = toValue(options.maxWait)

		if (timer) _clearTimeout(timer)

		if (duration <= 0 || (maxDuration !== void 0 && maxDuration <= 0)) {
			if (maxTimer) {
				_clearTimeout(maxTimer)
				maxTimer = void 0
			}
			return Promise.resolve(invoke())
		}

		return new Promise((resolve, reject) => {
			lastRejector = options.rejectOnCancel ? reject : resolve
			lastInvoker = invoke
			// Create the maxTimer. Clears the regular timer on invoke
			if (maxDuration && !maxTimer) {
				maxTimer = setTimeout(() => {
					if (timer) _clearTimeout(timer)
					maxTimer = void 0
					resolve(lastInvoker())
				}, maxDuration)
			}

			// Create the regular timer. Clears the max timer on invoke
			timer = setTimeout(() => {
				if (maxTimer) _clearTimeout(maxTimer)
				maxTimer = void 0
				resolve(invoke())
			}, duration)
		})
	}

	let cancel = () => {
		_clearTimeout(timer)
		_clearTimeout(maxTimer)
	}

	return { filter, cancel }
}

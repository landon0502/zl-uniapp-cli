import { isArray, isFunction, isPlainObject, noop } from 'lodash'
import { onUnmounted, shallowRef, unref } from 'vue'
import { isNvue } from '@/utils/is'
import { useDebounceFn } from '../'
// #ifdef APP-NVUE
const Binding = uni.requireNativePlugin('bindingx')
// #endif

/**
 * 获取选项
 * @param {Function|Object} options - 选项
 * @param {...any} args - 传递给函数选项的参数
 * @returns {Object} - 处理后的选项
 */
function getOptions(options, ...args) {
	return isFunction(options) ? options(...args) : isPlainObject(options) ? options : {}
}

/**
 * 获取元素
 * @param {string|number|Ref|HTMLElement|Object} target - 目标元素
 * @returns {string|number|HTMLElement} - 处理后的元素
 */
function getEl(target) {
	const el = unref(target)
	if (typeof el === 'string' || typeof el === 'number') return el
	if (WXEnvironment) {
		return el.ref
	}
	return el instanceof HTMLElement ? el : el.$el
}

/**
 * 处理属性中的元素引用
 * @param {Array} [props=[]] - 属性数组
 * @returns {Array} - 处理后的属性数组
 */
function unPropsElRef(props = []) {
	return props.map((item) => ({
		...item,
		element: getEl(item.element)
	}))
}

/**
 * BindingX 动画库的 hook (仅在 NVUE 中使用)
 *
 * @returns {Object} - BindingX 相关的方法
 * @returns {Function} returns.pan - 手势事件
 * @returns {Function} returns.timing - 动画事件
 * @returns {Function} returns.scroll - 滚动事件
 * @returns {Function} returns.orientation - 陀螺仪事件
 * @returns {Function} returns.bind - 绑定事件
 * @returns {Function} returns.bindAll - 绑定多个事件
 * @returns {Function} returns.run - 运行绑定的事件
 * @returns {Function} returns.getComputedStyle - 获取计算样式
 * @returns {Function} returns.unbindAll - 解绑所有事件
 *
 * @example
 * // 基本用法
 * import useBindingx from '@/composables/nvue/useBindingx'
 *
 * export default {
 *   setup() {
 *     const { pan, timing, bind, unbindAll } = useBindingx()
 *
 *     // 绑定手势事件
 *     const handlePan = () => {
 *       pan({
 *         anchor: 'container',
 *         props: [
 *           {
 *             element: 'box',
 *             property: 'transform.translateX',
 *             expression: {
 *               transform: {
 *                 translateX: {
 *                   type: 'expression',
 *                   value: 'x'
 *                 }
 *               }
 *             }
 *           }
 *         ],
 *         callback: (res) => {
 *           console.log('pan event:', res)
 *         }
 *       })
 *     }
 *
 *     // 绑定动画事件
 *     const handleTiming = () => {
 *       timing({
 *         exitExpression: 't>1000',
 *         props: [
 *           {
 *             element: 'box',
 *             property: 'transform.translateX',
 *             expression: {
 *               transform: {
 *                 translateX: {
 *                   type: 'expression',
 *                   value: '50*t'
 *                 }
 *               }
 *             }
 *           }
 *         ],
 *         callback: (res) => {
 *           console.log('timing event:', res)
 *         }
 *       })
 *     }
 *
 *     return {
 *       handlePan,
 *       handleTiming
 *     }
 *   }
 * }
 */
export default function useBindingx() {
	// 待执行的事件队列
	const pendingQueue = shallowRef([])
	// 绑定的事件结果
	const bindingRes = shallowRef([])

	/**
	 * 获取当前计算样式
	 * @param {string|number|Ref|HTMLElement|Object} elRef - 元素引用
	 * @returns {Object} - 计算样式
	 */
	const getComputedStyle = (elRef) => {
		return Binding.getComputedStyle(getEl(elRef))
	}

	/**
	 * 手势事件
	 * @param {Object} options - 配置选项
	 * @param {string|number|Ref|HTMLElement|Object} options.anchor - 锚点元素
	 * @param {Array} [options.props=[]] - 属性配置
	 * @param {Function} [options.callback=noop] - 回调函数
	 * @returns {Object} - 绑定结果
	 */
	const pan = ({ anchor, props = [], callback = noop }) => {
		if (!isNvue()) {
			throw new Error('The current class can only be used in nvue！！！')
		}
		const options = {
			eventType: 'pan',
			anchor: getEl(anchor),
			props: unPropsElRef(props)
		}
		return Binding.bind(options, (res) => {
			callback(res)
		})
	}

	/**
	 * 动画事件
	 * @param {Object} options - 配置选项
	 * @param {string} options.exitExpression - 退出表达式
	 * @param {Array} [options.props=[]] - 属性配置
	 * @param {Function} [options.callback=noop] - 回调函数
	 * @returns {Object} - 绑定结果
	 */
	const timing = ({ exitExpression, props = [], callback = noop }) => {
		if (!isNvue()) {
			throw new Error('The current class can only be used in nvue！！！')
		}
		const options = {
			eventType: 'timing',
			exitExpression,
			props: unPropsElRef(props)
		}
		return Binding.bind(options, (res) => {
			callback(res)
		})
	}

	/**
	 * 滚动事件
	 * @param {Object} options - 配置选项
	 * @param {string|number|Ref|HTMLElement|Object} options.anchor - 锚点元素
	 * @param {Array} [options.props=[]] - 属性配置
	 * @param {Function} [options.callback=noop] - 回调函数
	 * @returns {Object} - 绑定结果
	 */
	const scroll = ({ anchor, props = [], callback = noop }) => {
		if (!isNvue()) {
			throw new Error('The current class can only be used in nvue！！！')
		}
		const options = {
			eventType: 'scroll',
			anchor: getEl(anchor),
			props: unPropsElRef(props)
		}
		return Binding.bind(options, (res) => {
			callback(res)
		})
	}

	/**
	 * 陀螺仪事件
	 * @param {Object} options - 配置选项
	 * @param {Array} [options.props=[]] - 属性配置
	 * @param {Function} [options.callback=noop] - 回调函数
	 * @returns {Object} - 绑定结果
	 */
	const orientation = ({ props = [], callback = noop }) => {
		if (!isNvue()) {
			throw new Error('The current class can only be used in nvue！！！')
		}
		return Binding.bind(
			{
				eventType: 'orientation',
				props: unPropsElRef(props)
			},
			(res) => {
				callback(res)
			}
		)
	}

	/**
	 * 绑定事件
	 * @param {Function|Object} options - 配置选项
	 * @param {...any} args - 传递给函数选项的参数
	 * @returns {Object} - 绑定结果
	 */
	const bind = (options, ...args) => {
		if (!isNvue()) {
			throw new Error('The current class can only be used in nvue！！！')
		}
		const mergeOptions = getOptions(options, ...args)

		const bindRes = { pan, timing, scroll, orientation }[mergeOptions.eventType](mergeOptions)
		bindingRes.value.push({
			type: mergeOptions.eventType,
			res: bindRes
		})
		return bindRes
	}

	/**
	 * 绑定多个事件
	 * @param {Function|Object|Array} options - 配置选项
	 * @param {boolean} [reset=true] - 是否重置队列
	 * @returns {Object} - 包含 next 和 run 方法的对象
	 */
	const bindAll = (options, reset = true) => {
		if (reset) {
			pendingQueue.value = []
		}
		const insertOptions = (isArray(options) ? options : [options])
			.filter((item) => isFunction(item) || isPlainObject(item))
			.map(() => {
				return (...args) => getOptions(options, ...args)
			})
		pendingQueue.value.push(...insertOptions)
		return {
			next: (nextOptions) => bindAll(nextOptions, false),
			run
		}
	}

	/**
	 * 运行绑定的事件
	 * @param {Function} [done=noop] - 完成回调
	 * @param {...any} args - 传递给选项函数的参数
	 */
	const [run] = useDebounceFn((done = noop, ...args) => {
		let config = pendingQueue.value.shift()(...args)
		const bindRes = bind({
			...config,
			callback(res) {
				config?.callback?.(res)
				if (
					(config.eventType !== 'pan' && res.state === 'exit') ||
					(config.eventType === 'pan' && res.state === 'end')
				) {
					Binding.unbind({ type: config.eventType, token: bindRes.token })
					if (pendingQueue.value.length > 0) {
						run(done, { ...res, eventType: config.eventType })
					} else {
						done()
					}
				}
			}
		})
	}, 40)

	/**
	 * 解绑所有事件
	 */
	const unbindAll = () => {
		bindingRes.value.forEach(({ type, res }) => {
			Binding.unbind({
				eventType: type,
				token: res?.token
			})
		})
		bindingRes.value = []
	}

	// 组件卸载时解绑所有事件
	onUnmounted(() => {
		unbindAll()
	})

	// 返回 BindingX 相关的方法
	return {
		pan,
		timing,
		scroll,
		orientation,
		bind,
		bindAll,
		run,
		getComputedStyle,
		unbindAll
	}
}

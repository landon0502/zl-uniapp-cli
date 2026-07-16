import { forEach, isEmpty, isFunction } from 'lodash'
import { onUnmounted, ref, toValue, watch } from 'vue'
import useDebounceFn from './useDebounceFn'

/**
 * 创建一个函数，当指定值定义后才执行传入的函数
 *
 * @param {Ref|any} source - 触发执行的源值，当该值为 truthy 时执行缓存的函数
 * @param {Object} [options={}] - 配置选项
 * @param {boolean} [options.control=false] - 是否返回控制对象，而不是直接返回 invoke 函数
 * @returns {Function|Object} - 当 control 为 false 时返回 invoke 函数，否则返回控制对象
 * @returns {Function} returns.invoke - 执行函数的方法
 * @returns {Function} returns.execAll - 执行所有缓存的函数
 * @returns {Ref<Array>} returns.fns - 缓存的函数列表
 *
 * @example
 * // 基本用法
 * const isReady = ref(false)
 * const invoke = useDefineInvoke(isReady)
 *
 * // 当 isReady 为 false 时，函数会被缓存
 * invoke(() => {
 *   console.log('This will be executed when isReady becomes true')
 * })
 *
 * // 稍后设置 isReady 为 true，缓存的函数会被执行
 * isReady.value = true
 *
 * // 带回调的用法
 * invoke(
 *   () => new Promise(resolve => setTimeout(resolve, 1000)),
 *   {
 *     success: () => console.log('Success!'),
 *     fail: (error) => console.error('Error:', error)
 *   }
 * )
 *
 * // 带控制选项
 * const { invoke, execAll, fns } = useDefineInvoke(isReady, { control: true })
 */
export default function useDefineInvoke(source, options = {}) {
	const { control = false } = options
	// 存储函数和回调的数组
	let fns = []
	// 响应式存储缓存的函数和回调
	const cacheFn = ref([])

	/**
	 * 执行所有缓存的函数
	 */
	function execAll() {
		// 遍历所有非空的缓存函数
		forEach(cacheFn.value.filter(Boolean), async ([fn, callback], index) => {
			try {
				// 执行函数
				isFunction(fn) && (await fn())
				// 执行回调
				if (isFunction(callback)) {
					callback()
				} else {
					isFunction(callback?.success) && callback.success()
				}
			} catch (error) {
				// 执行失败回调
				isFunction(callback?.fail) && callback.fail(error)
			} finally {
				// 清空已执行的缓存
				cacheFn.value[index] = []
				fns[index] = []
			}
		})
	}

	// 监听 source 和 cacheFn 的变化
	const stopWatcher = watch(
		[() => toValue(source), cacheFn],
		([newVal, newCacheFns]) => {
			// 当 source 为 truthy 且缓存函数不为空时
			if (newVal && !isEmpty(newCacheFns)) {
				// 先停止监听，否则在重置 cacheFn 时会导致二次执行
				stopWatcher()
				// 执行所有缓存的函数
				execAll()
			}
		},
		{
			// 深度监听
			deep: true
		}
	)

	// 创建一个防抖函数，用于更新缓存的函数列表
	const [addFn, cancel] = useDebounceFn((fns) => {
		cacheFn.value = fns.filter(Boolean)
	}, 100)

	// 组件卸载时清理
	onUnmounted(() => {
		stopWatcher()
		cancel()
	})

	/**
	 * 执行函数或缓存函数
	 * @param {Function} fn - 要执行的函数
	 * @param {Function|Object} [callback] - 回调函数或包含 success/fail 回调的对象
	 */
	const invoke = async (fn, callback) => {
		// 检查 source 是否为 truthy
		let isInvoke = toValue(source)
		if (isInvoke) {
			// 直接执行函数
			try {
				isFunction(fn) && (await fn())
				if (isFunction(callback)) {
					callback()
				} else {
					isFunction(callback?.success) && callback.success()
				}
			} catch (error) {
				isFunction(callback?.fail) && callback?.fail(error)
			}
		} else {
			// 缓存函数和回调
			fns.push([fn, callback])
			addFn(fns)
		}
	}

	// 根据 control 选项返回不同的结果
	if (control) {
		return {
			invoke,
			execAll,
			fns: cacheFn
		}
	}
	return invoke
}

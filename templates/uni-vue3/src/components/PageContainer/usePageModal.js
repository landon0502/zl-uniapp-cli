import { ref, nextTick, shallowRef } from 'vue'
import { genUuid } from '@/utils/utils'
import { PAGE_CTX_KEY } from './context'
import { noop } from 'lodash'
import { isPromise } from '@/utils/is'
import { usePageStore } from '@/composables'
const defaultConfig = {
	align: 'center',
	width: '650rpx'
}
export default function usePageModal() {
	const { setStoreItem } = usePageStore(PAGE_CTX_KEY)
	const modalRef = shallowRef(new Map())
	const modalConfig = ref([])

	/**
	 * 显示弹窗
	 */
	async function open({
		onConfirm = () => Promise.resolve(),
		onCancel = noop,
		onClose = noop,
		...config
	}) {
		let openedModalConfig = Object.assign({}, defaultConfig, config)
		return new Promise((resolve, reject) => {
			openedModalConfig._id = genUuid()
			openedModalConfig.onConfirm = async () => {
				try {
					let res = onConfirm({ modalCtx: modalRef.value.get(openedModalConfig._id) })
					if (isPromise(res)) await res

					resolve(true)
				} catch (error) {
					reject(error)
				} finally {
					if (openedModalConfig.asyncClose) {
						modalRef.value.get(openedModalConfig._id).closeLoading()
						modalRef.value.get(openedModalConfig._id).close()
					}
				}
			}
			openedModalConfig.onCancel = () => {
				onCancel()
				resolve(false)
			}
			openedModalConfig.onClose = () => {
				// 需要在关闭动画完成以后再删除对应实例，需要加延时
				onClose()
				let timer = setTimeout(() => {
					modalRef.value.delete(openedModalConfig._id)
					modalConfig.value = modalConfig.value.filter((item) => item._id !== openedModalConfig._id)
					clearTimeout(timer)
				}, 300)
			}
			modalConfig.value.push(openedModalConfig)

			let timer = setTimeout(() => {
				nextTick().then(() => {
					modalRef.value.get(openedModalConfig._id).open()
				})
				clearTimeout(timer)
			}, 50)
		})
	}

	/**
	 * 添加modal ref
	 */
	function addModalRef(ctx, config) {
		modalRef.value.set(config._id, ctx)
	}

	setStoreItem('modal', {
		open,
		modalRef,
		modalConfig
	})
	return {
		open,
		modalRef,
		modalConfig,
		addModalRef
	}
}

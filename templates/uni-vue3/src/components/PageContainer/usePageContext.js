import { computed, nextTick } from 'vue'
import { getPageId, PAGE_CTX_KEY } from './context'
import { useDefineInvoke, usePageStore } from '@/composables'
import { sleep } from '@/uni_modules/lime-shared/sleep'
import { noop } from 'lodash'

export default function usePageContext(options = {}) {
	const { setStoreItem, getStoreItem, removeStoreItem, getStore } = usePageStore(PAGE_CTX_KEY)

	const isLoad = computed(() => getStore()?.isLoad)
	const invoke = useDefineInvoke(isLoad)
	const pageId = getPageId()
	/**
	 * 显示/隐藏 骨架屏
	 * @returns
	 */
	const skeletons = {
		/**
		 * 显示骨架屏
		 * @param {Object} config
		 * @returns {void}
		 */
		show: (config = options.skeletons, callback = noop) => {
			if (getStoreItem(pageId)) {
				setStoreItem('showSkeletons', false)
				setStoreItem('skeletons', null)
				removeStoreItem(pageId)
			}
			invoke(() => {
				setStoreItem(pageId, true)
				setStoreItem('skeletons', config)
				setStoreItem('showSkeletons', true)
			})
			callback()
		},
		/**
		 * 隐藏骨架屏
		 * @returns {void}
		 */
		hide: async (options, callback = noop) => {
			await nextTick()
			invoke(async () => {
				const { delay = 0 } = options ?? {}
				delay > 0 && (await sleep(delay))
				if (!getStoreItem(pageId)) {
					return
				}
				setStoreItem('showSkeletons', false)
				setStoreItem('skeletons', null)
				removeStoreItem(pageId)
				callback()
			})
		}
	}

	return {
		skeletons,
		pageContext: computed(() => getStore()),
		getPageModalCtx: () => getStore()?.modal,
		updatePageLayoutResize() {
			return getStore().updatePageLayoutResize()
		}
	}
}

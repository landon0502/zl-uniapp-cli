import { globalConfig } from '@/config/pages'
import router from '@/router'
import { find } from 'lodash'

let pageNameList = {
	getPageName(url) {
		const pageInfo = find(
			globalConfig.tabBar.list,
			(item) => router.addRootPath(item.pagePath) === router.addRootPath(url)
		)
		return pageInfo?.name ?? ''
	},
	getPageCode(url) {
		const pageInfo = find(
			globalConfig.tabBar.list,
			(item) => router.addRootPath(item.pagePath) === router.addRootPath(url)
		)
		return pageInfo?.code ?? ''
	}
}
export default pageNameList

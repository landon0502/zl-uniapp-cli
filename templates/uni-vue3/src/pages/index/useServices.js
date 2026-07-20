import { fetchList } from '@/api/test'
import { useRequest } from '@/composables'
export default function useServices() {
	const getList = async (params) => {
		let res = await fetchList(params)
		return {
			...res,
			data: {
				...res.data,
				totalRecords: void 0
			}
		}
	}

	const listControl = useRequest(getList, {
		enablePaging: true
	})

	return {
		listControl
	}
}

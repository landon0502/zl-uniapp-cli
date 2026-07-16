import { getStreetsMaps, getAddressDetail } from '@/api/common'
import { useRequest } from '@/composables'

export const ADDRESS_SELECT_PUPOP_KEY = 'addresSelect'

export function useServices() {
	const regionControl = useRequest(getStreetsMaps)

	const adressDetailControl = useRequest(getAddressDetail)
	return {
		regionControl,
		adressDetailControl
	}
}

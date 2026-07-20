import { login } from '@/api/user'
import { useRequest } from '@/composables'
export default function useServices() {
	const loginApi = useRequest(login, {
		enablePaging: true
	})
	return {
		loginApi
	}
}

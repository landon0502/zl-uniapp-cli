import Storage from '@/utils/Storage'
export function isLogin() {
	const storage = new Storage()
	return !!storage.getItem('Authorization')
}

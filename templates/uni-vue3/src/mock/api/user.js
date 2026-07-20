import logo from '@/assets/images/logo.png'
import Mock from '../mock'
import setupMock from '../setupMock'
export default function userMock() {
	setupMock({
		setup: () => {
			// 用户信息
			const userRole = 'admin'
			Mock.mock(new RegExp('/api/user/userInfo'), () => {
				return Mock.mock({
					data: {
						name: 'user',
						avatar: logo,
						email: 'wangliqun@email.com',
						job: 'frontend',
						jobName: '前端开发工程师',
						organization: 'Frontend',
						organizationName: '前端',
						location: 'beijing',
						locationName: '北京',
						introduction: '王力群并非是一个真实存在的人。',
						personalWebsite: 'https://www.arco.design',
						verified: true,
						phoneNumber: /177[*]{6}[0-9]{2}/,
						accountId: /[a-z]{4}[-][0-9]{8}/,
						registrationTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
						permissions: userRole
					},
					success: '1',
					errorCode: '',
					errorMsg: '成功'
				})
			})

			// 登录
			Mock.mock(new RegExp('/api/user/login'), (params) => {
				const { mobile, password } = JSON.parse(params.body)
				if (!mobile) {
					return {
						status: 'error',
						errorMsg: '手机号不能为空'
					}
				}
				if (!password) {
					return {
						status: 'error',
						errorMsg: '密码不能为空'
					}
				}
				if (mobile === '18300000000' && password === '111111') {
					return Mock.mock({
						success: '1',
						errorCode: '',
						data: {
							token: 'testtoken'
						}
					})
				}
				return {
					status: 'error',
					errorMsg: '账号或者密码错误'
				}
			})
		}
	})
}

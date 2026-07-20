import Mock from '../mock'
import setupMock from '../setupMock'
export default function homeMock() {
	setupMock({
		setup: () => {
			Mock.mock(new RegExp('/api/region'), {
				data: [],
				success: '1',
				errorCode: '',
				errorMsg: '成功'
			})
		}
	})
}

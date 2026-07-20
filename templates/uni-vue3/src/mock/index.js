import Mock from './mock'
import userMock from './api/user'
import commonMock from './api/common'

import { isDevelopment } from '@/utils/is'

export default function mock() {
	if (isDevelopment()) {
		userMock()
		commonMock()
		Mock.setup({
			timeout: '100-3000'
		})
	}
}

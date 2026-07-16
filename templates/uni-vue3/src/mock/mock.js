import { noop } from 'lodash'
// #ifdef MP-WEIXIN
import MicroAppMock from 'better-mock/dist/mock.mp.js'
// #endif
// #ifdef H5
import Mock from 'better-mock'
// #endif
let UseMock = {
	setup: noop,
	mock: noop
}

// #ifdef MP-WEIXIN
UseMock = MicroAppMock
// #endif
// #ifdef H5
UseMock = Mock
// #endif

export default UseMock

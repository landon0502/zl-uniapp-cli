import { describe, expect, it } from 'vitest'

import { isEmpty } from 'lodash'
import * as qs from 'qs'
describe('test utils', () => {
	it('这是一个单元测试案例', () => {
		let res1 = isEmpty({})
		let res2 = isEmpty([])
		expect([res1, res2]).toEqual([true, true])
	})
	it('qs', () => {
		let url = '/pages/login/index?a=1&b=2'
		expect(qs.parse(url)).toEqual({ a: '1', b: '2' })
	})
	it('qs', () => {})
})

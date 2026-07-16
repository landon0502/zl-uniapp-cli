import { validateWhiteList } from '@/router'
import { describe, expect, it } from 'vitest'

describe('路由测试', () => {
	it('白名单校验', () => {
		expect([
			validateWhiteList('/pages/error/abc?a=b'),
			validateWhiteList('/pages/login/index')
		]).toEqual([true, true])
	})
})

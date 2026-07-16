/**
 * 登录
 * @param {*} data
 * @returns {Promise}
 */
export const login = (params) => uni.$uv.http.post('/api/user/login', params)

/**
 * 获取用户信息
 */
export const getUser = (params) => uni.$uv.http.post('/api/user/userInfo', params)

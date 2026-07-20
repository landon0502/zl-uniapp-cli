/**
 * 获取数据
 */
export const fetchList = (params) => uni.$uv.http.post('/api/mock/fetch', params)

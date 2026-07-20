import { cloneDeep, isArray, isEmpty, noop, pick } from 'lodash'
import { ref, toValue, unref } from 'vue'
import useToggle from './useToggle'
import { isUndef } from '@/utils/is'

// 默认分页参数键名
const defaultPaingParamsKeys = {
	page: 'page',
	pageSize: 'pageSize'
}

// 默认分页响应键名
const defaultPagingResponeKeys = {
	page: 'page',
	pageSize: 'pageSize',
	totalRecords: 'totalRecords',
	list: 'list'
}

/**
 * 将对象中的 ref 转换为值
 * @param {Object} values - 包含 ref 的对象
 * @returns {Object} - 转换后的值对象
 */
function toValues(values) {
	return Object.entries({ ...values }).reduce((acc, [key, value]) => {
		return {
			...acc,
			[key]: toValue(value)
		}
	}, {})
}

/**
 * 获取请求参数
 * @param {Object} options - 配置选项
 * @param {Object} options.params - 请求参数
 * @param {Object} options.pagingParams - 分页参数
 * @param {boolean} options.enablePaging - 是否启用分页
 * @returns {Object} - 合并后的请求参数
 */
function getRequestParams({ params, pagingParams, enablePaging }) {
	if (!enablePaging) {
		return params
	}
	return Object.assign({}, pagingParams, params)
}

/**
 * 处理成功回调
 * @param {Object} options - 选项对象
 * @param {Function} [onSuccess=noop] - 成功回调函数
 */
async function onSuccessHandler(options, onSuccess = noop) {
	onSuccess(toValues(options))
}

/**
 * 获取分页配置
 * @param {Object} data - 响应数据
 * @param {Object} [keys=defaultPagingResponeKeys] - 分页响应键名映射
 * @returns {Object} - 分页配置
 */
function getPagination(data, keys = defaultPagingResponeKeys) {
	// 返回数据为数组且存在分页时 记录所以数据
	const getDataInArray = (key) => {
		let ls = key ? data[key] : data
		return isArray(ls) ? ls : []
	}
	return {
		page: data[keys.page],
		pageSize: data[keys.pageSize],
		totalRecords: data[keys.totalRecords],
		list: getDataInArray(keys.list)
	}
}

/**
 * 处理分页数据
 * @param {Object} options - 配置选项
 * @param {Object} [options.data={}] - 响应数据
 * @param {Object} options.pagination - 分页信息
 * @param {Object} options.params - 请求参数
 * @param {Array} options.pagedData - 已分页数据
 * @param {boolean} options.noMoreData - 是否没有更多数据
 * @param {Object} [options.responsePageKeys=defaultPagingResponeKeys] - 响应分页键名映射
 * @param {Object} [options.pagingParamsKeys=defaultPaingParamsKeys] - 分页参数键名映射
 * @returns {Object} - 处理后的分页数据
 */
function pageHandler({
	data = {},
	pagination,
	params,
	pagedData,
	noMoreData,
	responsePageKeys = defaultPagingResponeKeys,
	pagingParamsKeys = defaultPaingParamsKeys
}) {
	let accData = [...pagedData]
	const { page, pageSize, totalRecords, list } = getPagination(data, responsePageKeys)
	if (!noMoreData) {
		let oldPageIndex = pagination.page ?? 0,
			newPageIndex = params?.[pagingParamsKeys.page] ?? 0
		// 当pageIndex === 1时 不需要拼接
		if (Number(newPageIndex) <= 1) {
			accData = list
		} else if (oldPageIndex >= 1 && oldPageIndex < newPageIndex) {
			accData = [...accData, ...list]
		}
		if (!isUndef(page)) {
			if (!isUndef(totalRecords)) {
				noMoreData = totalRecords <= accData.length
			} else {
				noMoreData = list.length < params?.pageSize
			}
		}
	}

	return {
		total: totalRecords,
		noMoreData,
		pagination: {
			page,
			pageSize,
			totalRecords
		},
		pagedData: accData
	}
}

/**
 * 具体请求处理
 * @param {Function} service - 请求服务函数
 * @param {Object} options - 配置选项
 * @param {Ref<boolean>} options.loading - 加载状态
 * @param {Object} options.params - 请求参数
 * @param {Object} options.config - 配置
 * @param {Ref} options.response - 响应数据
 * @param {Ref} options.data - 响应数据中的 data 字段
 * @param {Ref<Object>} options.pagination - 分页信息
 * @param {boolean} options.enablePaging - 是否启用分页
 * @param {Ref<Array>} options.pagedData - 已分页数据
 * @param {Ref<number>} options.total - 总数据量
 * @param {Ref<boolean>} options.noMoreData - 是否没有更多数据
 * @param {Function} options.onSuccess - 成功回调
 * @param {Function} options.updateLoadState - 更新加载状态的函数
 * @param {Function} [options.onNomore=noop] - 没有更多数据时的回调
 * @param {Object} options.pagingParamsKeys - 分页参数键名映射
 * @returns {Promise} - 请求结果
 */
async function runService(service, options = {}) {
	const {
		loading,
		params,
		config,
		response,
		data,
		pagination,
		enablePaging,
		pagedData,
		total,
		noMoreData,
		onSuccess,
		updateLoadState,
		onNomore = noop,
		pagingParamsKeys
	} = options
	updateLoadState(true)
	try {
		const res = await service(params, config)
		response.value = res
		data.value = response.value?.data
		if (data.value) {
			// 如果启用了分页
			if (enablePaging && data.value.page) {
				const pageInfo = pageHandler({
					params: unref(params),
					data: unref(data),
					pagination: unref(pagination),
					pagedData: unref(pagedData),
					pagingParamsKeys
				})
				noMoreData.value = pageInfo.noMoreData
				pagedData.value = pageInfo.pagedData
				pagination.value = pageInfo.pagination
				total.value = pageInfo.total
				if (pageInfo.noMoreData) {
					onNomore()
				}
			}

			onSuccessHandler(
				{
					loading,
					params,
					config,
					response,
					data,
					pagination,
					enablePaging,
					pagedData,
					total,
					noMoreData
				},
				onSuccess
			)
		}
		return res
	} finally {
		updateLoadState(false)
	}
}

/**
 * 通用请求 hooks
 *
 * @param {Function} service - 请求服务函数
 * @param {Object} [options={}] - 配置选项
 * @param {Function} [options.onNomore=noop] - 没有更多数据时的回调
 * @param {Object} [options.params] - 默认请求参数
 * @param {Object} [options.responsePageKeys={}] - 响应分页数据键名映射
 * @param {Object} [options.pagingParams] - 分页参数配置
 * @param {number} [options.pagingParams.page=1] - 当前页码
 * @param {number} [options.pagingParams.pageSize=20] - 每页大小
 * @param {boolean} [options.immediate=false] - 是否立即执行一次
 * @param {boolean} [options.enablePaging] - 是否启用分页
 * @param {Function} [options.onSuccess] - 成功回调
 * @param {Function} [options.responseOnceCallback] - 立即执行时的回调
 * @param {Object} [options.config] - 请求配置
 * @returns {Object} - 请求相关的状态和方法
 * @returns {Ref<boolean>} returns.loading - 加载状态
 * @returns {Ref} returns.data - 响应数据中的 data 字段
 * @returns {Ref<Object>} returns.pagination - 分页信息
 * @returns {Ref<number>} returns.total - 总数据量
 * @returns {Ref} returns.response - 全量响应体
 * @returns {Ref<Array>} returns.pagedData - 已分页数据
 * @returns {Ref<boolean>} returns.noMoreData - 是否没有更多数据
 * @returns {Ref<Object>} returns.requestParams - 请求参数
 * @returns {Ref<Object>} returns.pagingParams - 分页参数
 * @returns {Ref<boolean>} returns.enablePaging - 是否启用分页
 * @returns {Function} returns.run - 执行请求的方法
 * @returns {Function} returns.nextPage - 请求下一页数据
 * @returns {Function} returns.resetPage - 重置分页数据
 *
 * @example
 * // 基本用法
 * const { data, loading, run } = useRequest(api.getUserList)
 *
 * // 带参数
 * const { data, loading, run } = useRequest(api.getUserList, {
 *   params: { status: 1 },
 *   immediate: true
 * })
 *
 * // 启用分页
 * const { data, loading, pagedData, nextPage, resetPage, noMoreData } = useRequest(api.getUserList, {
 *   enablePaging: true,
 *   pagingParams: {
 *     page: 1,
 *     pageSize: 10
 *   }
 * })
 *
 * // 执行请求
 * run({ status: 2 })
 *
 * // 请求下一页
 * nextPage()
 *
 * // 重置分页
 * resetPage()
 */
export default function useRequest(service, options = {}) {
	const {
		onNomore = noop,
		params,
		responsePageKeys = {},
		pagingParams = {
			[defaultPaingParamsKeys.pageSize]: 20,
			[defaultPaingParamsKeys.page]: 1
		},
		immediate = false,
		enablePaging
	} = options

	// 加载状态
	const [loading, updateLoadState] = useToggle(false)

	// 响应式选项
	const refOptions = {
		// 请求loading
		loading,
		// 更新请求状态
		updateLoadState,
		// 成功响应的data
		data: ref(),
		// 分页配置
		pagination: ref({
			page: 0,
			pageSize: 0,
			totalRecords: 0
		}),
		// 总数据量
		total: ref(),
		// 全量响应体
		response: ref(),
		// 分页数据
		pagedData: ref([]),
		// 没有更多状态
		noMoreData: ref(false),
		// 请求参数
		requestParams: ref(cloneDeep(unref(params) ?? {})),
		// 分页参数
		pagingParams: ref(cloneDeep(unref(pagingParams) ?? {})),
		// 是否启用分页
		enablePaging: ref(unref(enablePaging))
	}

	// 默认配置项
	const defaultOptions = toValues(
		cloneDeep(
			pick(refOptions, [
				'loading',
				'data',
				'pagination',
				'total',
				'response',
				'pagedData',
				'noMoreData'
			])
		)
	)

	/**
	 * 请求数据
	 * @param {Object} options - 配置选项
	 * @param {Object} [options.params=refOptions.requestParams.value] - 请求参数
	 * @param {Object} [options.config={}] - 配置
	 * @param {boolean} [options.enablePaging=refOptions.enablePaging.value] - 是否启用分页
	 * @param {Object} [options.pagingParamsKeys=defaultPaingParamsKeys] - 分页参数键名映射
	 * @param {Object} [options.pagingParams=refOptions.pagingParams.value] - 分页参数
	 * @returns {Promise} - 请求结果
	 */
	const fetchData = async ({
		params = refOptions.requestParams.value,
		config = {},
		enablePaging = refOptions.enablePaging.value,
		pagingParamsKeys = defaultPaingParamsKeys,
		pagingParams = refOptions.pagingParams.value
	}) => {
		refOptions.requestParams.value = params
		if (!isEmpty(pagingParams)) {
			refOptions.pagingParams.value = { ...refOptions.pagingParams.value, ...pagingParams }
		}
		// 整合参数
		const serviceParams = getRequestParams({
			enablePaging,
			params: refOptions.requestParams.value,
			pagingParams: refOptions.pagingParams.value
		})
		return runService(service, {
			...refOptions,
			params: serviceParams,
			config,
			onSuccess: config.onSuccess ?? options.onSuccess,
			enablePaging,
			onNomore,
			responsePageKeys,
			pagingParamsKeys
		})
	}

	// 立即执行一次
	immediate &&
		fetchData({
			params: refOptions.requestParams.value,
			config: options.config,
			enablePaging: options.enablePaging,
			pagingParams: refOptions.pagingParams.value
		}).then((res) => {
			options.responseOnceCallback?.(res)
			onSuccessHandler(refOptions, options.onSuccess)
		})

	/**
	 * 请求下一页数据
	 * @returns {Promise} - 请求结果
	 */
	const nextPage = async () => {
		if (!options.enablePaging || refOptions.noMoreData.value) {
			return
		}
		try {
			refOptions.pagingParams.value.page = Number(refOptions.pagingParams.value.page) + 1
			return fetchData({
				params: refOptions.requestParams.value,
				pagingParams: refOptions.pagingParams.value,
				enablePaging: true
			})
		} catch {
			refOptions.pagingParams.value.page -= 1
		}
	}

	/**
	 * 重置分页数据
	 * @returns {Promise} - 请求结果
	 */
	const resetPage = async () => {
		if (!options.enablePaging) {
			return
		}
		refOptions.pagingParams.value.page = 1

		Object.entries(defaultOptions).forEach(([key, defaultValue]) => {
			refOptions[key].value = defaultValue
		})
		return fetchData({
			params: refOptions.requestParams.value,
			pagingParams: refOptions.pagingParams.value,
			enablePaging: true
		})
	}

	// 返回请求相关的状态和方法
	return {
		...refOptions,
		/**
		 * 执行请求
		 * @param {Object} params - 请求参数
		 * @param {Object} [options={}] - 请求配置
		 * @returns {Promise} - 请求结果
		 */
		run: (params, options = {}) => fetchData({ params, ...options }),
		nextPage,
		resetPage
	}
}

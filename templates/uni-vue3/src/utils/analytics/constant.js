export const LOG_CONFIG = {
	1: {
		pro: 'zl-life-logger-pro',
		dev: 'zl-life-logger'
	},
	2: {
		pro: 'opration-log-pro',
		dev: 'opration-log-test'
	},
	3: {
		pro: 'pos-teminal-pro',
		dev: 'pos-teminal-test'
	}
}
export const LOG_HOST = {
	1: 'https://fp-zl-device.cn-shanghai.log.aliyuncs.com',
	2: 'https://stableposv5-h5.cn-shanghai.log.aliyuncs.com',
	3: 'https://pos-teminal-device.cn-shanghai.log.aliyuncs.com'
}

export const POINT_CHANNEL = '2' //渠道字段，英文名称channel，渠道类型：收银机 ：1；APP :2；后台：3；微商城：4；智数罗盘：5
/**
 * 埋点类型
 */
export const pointType = {
	// 通用埋点
	COMMON: '1',
	// 行为埋点
	ACTION: '2',
	// 数据埋点
	DATA: '3'
}

/**
 * 日志类型
 */
export const logType = {
	/** entry 新项目接入SDK (架构用，防止非中仑域名接入SDK) */
	ENTRY: 'entry',
	/** pv 页面访问 */
	PV: 'pv',
	/** click 页面点击事件 */
	CLICK: 'click',
	/** api 接口请求 */
	API: 'api',
	/** resource资源加载 */
	RESOURCE: 'resource',
	/** js-error 控制台错误 */
	JSERROR: 'js-error',
	/** pos-callback 硬件信息上报 */
	POSCALLBACK: 'pos-callback',
	/** pos-warn 硬件告警 */
	POSWARN: 'pos-warn',
	/** business-point 个性化埋点 */
	BUSINESSPOINT: 'business-point'
}

/**
 * 操作类型
 */
export const actionType = {
	/** sw表示加载页面[show] */
	SHOW: 'sw',
	/** ck表示点击[click] */
	CLICK: 'ck',
	/** ex表示退出[exit]（杀进程、进入后台>30min、当前页面静止不操作时间>30min、登陆用户退出账号） */
	EXIT: 'ex',
	/** in表示输入框[input] */
	INPUT: 'in',
	/** pv表示访问 */
	PV: 'pv'
}

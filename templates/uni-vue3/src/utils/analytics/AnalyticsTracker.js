import { genUuid, uniPromisify } from '../utils'
import { plusRuntimeGetProperty } from '../sys'
import { page, sys } from '@/uni_modules/uv-ui-tools/libs/function'
import pageNameList from './pageName'
import dayjs from 'dayjs'
import { LOG_CONFIG, LOG_HOST, pointType, POINT_CHANNEL, logType, actionType } from './constant'
import { isDev } from '@/contants'
import { noop } from 'lodash'
import Storage from '../Storage'

class TrackConf {
	pointType = pointType
	logType = logType
	actionType = actionType
}
function getLogUrl(pointType, env) {
	const store = LOG_CONFIG[pointType]?.[env]
	if (!store) {
		throw new Error(`[Analytics] invalid log config: ${pointType}-${env}`)
	}
	return `${LOG_HOST[pointType]}/logstores/${store}/track`
}

class SysInfo {
	networkType = ''
	constructor() {
		this.getNetworkType()
	}
	async getNetworkType() {
		const res = await uniPromisify('getNetworkType')()
		this.networkType = res.networkType
		uni.offNetworkStatusChange(noop)
		uni.onNetworkStatusChange(function (res) {
			this.networkType = res.networkType
		})
	}
	async getSys() {
		const sysInfo = sys()
		let version = ''
		// #ifdef APP || MP
		const { version: appVersion } = await plusRuntimeGetProperty()
		version = appVersion
		// #endif
		return {
			networktype: this.networkType, //例如 WIFI、4G等
			screen_height: sysInfo.screenWidth.toString(), //屏幕宽度 例如 1080
			screen_width: sysInfo.screenHeight.toString(), //屏幕高度 例如 2160
			ostype: sysInfo.platform, //操作系统，例如 ios、android
			osversion: sysInfo.system, //操作系统版本，例如 8.1.0
			manufacturer: sysInfo.brand, //设备制造商，例如 Xiaomi
			model: sysInfo.model, //设备型号，例如 MI MAX 3
			imei: sysInfo.imei, // IMEI设备号
			mac: sysInfo.uuid, // MAC地址
			version // 应用版本号
		}
	}
}

export default class AnalyticsTracker extends TrackConf {
	sessionid = genUuid()
	currentPageInfo = {} // 当前页面信息
	system = new SysInfo()
	locationInfo = {
		latitude: null,
		longitude: null,
		refreshTime: dayjs()
	}
	/**
	 * 刷新位置信息
	 * @desc 如何不存在坐标，获取刷新时间大于半个小时，则重新刷新位置信息
	 */
	async refreshLocation() {
		if (
			!this.locationInfo.longitude ||
			!this.locationInfo.latitude ||
			dayjs().diff(this.locationInfo.refreshTime, 'm') >= 30
		) {
			let location = await uniPromisify('getLocation')()
			this.locationInfo = {
				longitude: location.longitude.toString(),
				latitude: location.latitude.toString(),
				refreshTime: dayjs()
			}
		}
		return {
			longitude: this.locationInfo.longitude,
			latitude: this.locationInfo.latitude
		}
	}
	/**
	 * 埋点
	 */
	async trackEvent({ eventname, eventcode, log_type, action, attributes = {} }) {
		const { id, username } = getApp().globalData.userinfo || {}
		const sysInfo = await this.system.getSys()
		const storage = new Storage()

		// 如何不存在坐标，获取刷新时间大于半个小时，则重新刷新位置信息
		const { longitude, latitude } = await this.refreshLocation()

		const info = {
			usercode: id,
			username: username,

			shopcode: '',
			shopname: '',
			branchcode: '',
			branchname: '',

			user_sign: storage.getItem('Authorization'),
			//Part1：配置信息
			pointType: this.pointType.COMMON, //埋点类型1全埋点
			project_name: import.meta.env.VITE_APP_PROJECT_NAME,
			//Part2：公共字段
			...sysInfo,
			// Part3：事件信息
			uuid: genUuid(), //uuid
			log_time: dayjs().valueOf().toString(), //客户端记录时间，精确到毫秒
			session_id: this.sessionid, //会话控制唯一id
			eventname, // 表示事件名称
			eventcode, // 表示事件code
			log_type, // entry 新项目接入SDK (架构用，防止非中仑域名接入SDK) pv 页面访问 click 页面点击事件 api 接口请求 resource资源加载 js-error 控制台错误 pos-callback 硬件信息上报 pos-warn 硬件告警 business-point 个性化埋点
			action, //sw表示加载页面[show]， ck表示点击[click]  , ex表示退出[exit]（杀进程、进入后台>30min、当前页面静止不操作时间>30min、登陆用户退出账号）in表示输入框[input]
			longitude, //经度
			latitude, //纬度
			...this.currentPageInfo,
			channel: POINT_CHANNEL,
			attributes: JSON.stringify(attributes),
			...attributes //以下所有数据为同时携带的想要获取的数据内容
		}
		await this.sendLogger(info)
	}
	/**
	 * 点击埋点
	 */
	trackClick({ eventname, eventcode, extraInfo = {} }) {
		this.trackEvent({
			eventname: eventname,
			eventcode: eventcode,
			log_type: this.logType.CLICK,
			action: this.actionType.CLICK,
			attributes: extraInfo
		})
	}
	/**
	 * 页面访问
	 */
	trackPageView({ referrer, urlPath = page(), extraInfo }) {
		if (!urlPath) return
		this.currentPageInfo = {
			starttime: dayjs().valueOf().toString(), // 页面进入时间，精确到毫秒
			endtime: '', //页面离开时间，精确到毫秒

			referrer, // 从哪个页面来
			referrer_name: pageNameList.getPageName(referrer), // 当前来源页面名称
			url_path: urlPath, //行为发生的页面url
			url_title: pageNameList.getPageName(urlPath) //行为发生的页面名称
		}

		this.trackEvent({
			eventname: pageNameList.getPageName(urlPath) || '页面跳转',
			eventcode: pageNameList.getPageCode(urlPath) || 'swpage',
			log_type: this.logType.PV,
			action: this.actionType.PV,
			attributes: extraInfo
		})
	}
	/**
	 * 行为埋点
	 */
	async trackAction({ message = {} }) {
		const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
		const sysInfo = await this.system.getSys()
		const info = {
			pointType: this.pointType.ACTION, //埋点类型2行为埋点
			channel: POINT_CHANNEL,

			analysistype: 'businessanalysis',
			timelocal: time,
			clientip: '',
			bptype: 'none',
			system: import.meta.env.VITE_APP_PROJECT_CODE,
			env: import.meta.env.VITE_REQUEST_ENV,
			bpbuzcode: 'shopoperationlogrecord',
			t: dayjs().valueOf().toString(),
			message: {
				bpbuzcode: 'shopoperationlogrecord',
				ip: '',
				source: '1',
				channel: '2',
				operatetime: time,
				deviceuniquecode: sysInfo.uuid,
				operatecode: '',
				operatename: '',
				operatenmessage: '',
				...message //以下所有数据为同时携带的想要获取的数据内容
			}
		}
		this.sendLogger(info)
	}
	/**
	 * 转化
	 */
	trackConversion({ operatecode = '', operatorname = '', operatorcode = '', operatename = '' }) {
		const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
		let info = {
			pointType: this.pointType.DATA, //埋点类型3异常数据埋点
			channel: POINT_CHANNEL,

			operatorname, //操作员姓名
			operatorcode, //操作员编号
			operatecode, //行为类型编号
			operatename, //行为类型名称
			operatetime: time, //操作时间
			extraInfo: '' // 额外信息，暂定这个字段
		}
		this.sendLogger(info)
	}
	/**
	 * 发送埋点信息
	 * @param {*} data
	 */
	async sendLogger(data) {
		let url = getLogUrl(data.pointType, isDev ? 'dev' : 'pro')
		let arr = []
		if ([this.pointType.COMMON, this.pointType.DATA].includes(data.pointType)) {
			arr.push(data)
		} else if (data.pointType === this.pointType.ACTION) {
			arr.push({
				content: JSON.stringify(data)
			})
		}
		await uniPromisify('request')({
			url,
			method: 'POST',
			data: JSON.stringify({
				__logs__: arr
			}),
			dataType: 'json',
			header: {
				'content-type': 'application/x-protobuf',
				'x-log-apiversion': '0.6.0',
				'x-log-bodyrawsize': '300'
			}
		})
	}
}
export const analytics = new AnalyticsTracker()

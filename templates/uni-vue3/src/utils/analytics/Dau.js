import dayjs from 'dayjs'
import { uniPromisify } from '../utils'
import { plusRuntimeGetProperty } from '../sys'
import { sys } from '@/uni_modules/uv-ui-tools/libs/function'
import Storage from '../Storage'
export default class Dau {
	storage = new Storage()
	storageKey = 'DAU_LAST_TIME'

	/** 判断今天是否已经上报 */
	shouldReportToday() {
		try {
			const lastTime = this.storage.getItem(this.storageKey)
			return !dayjs().isSame(lastTime, 'D')
		} catch {
			return true
		}
	}

	/** 标记今天已上报 */
	markReported() {
		this.storage.setItem(this.storageKey, dayjs().format('YYYY-MM-DD'))
	}

	/** 获取客户端 IP */
	async getIp() {
		try {
			const res = await uniPromisify('request')({
				url: import.meta.env.VITE_APP_IP_URL,
				dataType: 'script'
			})
			if (res.statusCode === 200) {
				return JSON.parse(res.data).ip
			}
		} catch (e) {
			console.error('getIp failed', e)
		}
	}

	/** 获取 IPv4 / IPv6 信息，统一返回 { ip, ipinfo } */
	async getIpInfo(ip) {
		try {
			if (!ip) return {}
			if (ip.includes('.')) {
				// IPv4
				const res = await uniPromisify('request')({
					url: `${import.meta.env.VITE_APP_IPV4_LOCATION_PARSE_URL}?ip=${ip}`,
					method: 'GET',
					timeout: 8000
				})
				if (res.data?.code?.toLowerCase() === 'success') {
					const ipinfo = res.data.data
					ipinfo.province = ipinfo.prov
					ipinfo.area = `${ipinfo.country} ${ipinfo.prov} ${ipinfo.city} ${ipinfo.district} ${ipinfo.isp}`
					return { ip, ipinfo }
				}
				throw res
			}
			// IPv6
			const res = await uniPromisify('request')({
				url: `${import.meta.env.VITE_APP_IPV6_PARSE_URL}?type=json&ip=${ip}`,
				method: 'GET',
				timeout: 8000
			})
			if (res.data?.code === '0') {
				const ipinfo = this.parseIPv6Info(res.data)
				return { ip, ipinfo }
			}
			throw res
		} catch {
			return Promise.resolve({ ip })
		}
	}

	/** 上报日活 */
	async reportDailyActive() {
		try {
			if (!this.shouldReportToday()) return
			const ip = await this.getIp()
			const { ipinfo } = await this.getIpInfo(ip)
			await this.sendReport(ip, ipinfo)
			this.markReported()
		} catch (e) {
			console.error('reportDailyActive failed:', e)
		}
	}

	/** 发送上报请求 */
	async sendReport(ip, ipinfo) {
		const widgetInfo = await plusRuntimeGetProperty()
		const systemInfo = sys()
		const deviceInfo = uni.getDeviceInfo()

		const params = {
			project: systemInfo.appName,
			version: widgetInfo.version ?? '',
			os: systemInfo.system ?? '',
			deviceid: deviceInfo.deviceId,
			ip,
			env: import.meta.env.VITE_REQUEST_ENV,
			extra: '', // 额外信息
			oem: systemInfo.appName,
			tel: '',
			sign: 'zlnetwork.sispark',
			shopcode: '无',
			shopname: '无'
		}

		// flatten ipinfo
		if (ipinfo) {
			const flatten = (obj, prefix = 'ipinfo') => {
				return Object.keys(obj).reduce((acc, key) => {
					if (typeof obj[key] === 'object') {
						Object.assign(acc, flatten(obj[key], `${prefix}[${key}]`))
					} else {
						acc[`${prefix}[${key}]`] = obj[key]
					}
					return acc
				}, {})
			}
			Object.assign(params, flatten(ipinfo))
		}
		await uniPromisify('request')({
			url: import.meta.env.VITE_APP_DAU_REPORT_URL,
			method: 'POST',
			data: params,
			dataType: 'json',
			header: { 'content-type': 'application/x-www-form-urlencoded' }
		})
	}

	/** 解析 IPv6 返回信息 */
	parseIPv6Info(result) {
		const ipinfo = {}
		const _arr = result.data.location.split('\t')
		ipinfo.country_name = _arr[0]
		ipinfo.region_name = _arr[1].replace('省', '')
		ipinfo.city_name = _arr[2]
		ipinfo.area = result.data.location
		ipinfo.isp = result.data.location.includes('中国移动')
			? '中国移动'
			: result.data.location.includes('中国电信')
				? '中国电信'
				: result.data.location.includes('中国联通')
					? '中国联通'
					: result.data.location.includes('铁通')
						? '铁通'
						: ''
		return ipinfo
	}
}

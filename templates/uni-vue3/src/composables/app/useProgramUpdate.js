import { fetchUpgradeDetection } from '@/api/common'
import { sys } from '@/uni_modules/uv-ui-tools/libs/function'
import { useStorage } from '..'
import { uniPromisify } from '@/utils/utils'
import { plusRuntimeGetProperty } from '@/utils/sys'
import { unref } from 'vue'

/**
 * 安装应用包
 * @param {string} tempFilePath - 临时文件路径
 * @param {Object} options - 安装选项
 * @returns {Promise} - 安装结果
 */
function installPack(tempFilePath, options) {
	return new Promise((resolve, reject) => {
		plus.runtime.install(
			tempFilePath,
			options,
			function () {
				resolve()
			},
			function (e) {
				reject(e)
			}
		)
	})
}

/**
 * 应用更新的 hook
 *
 * @param {Object} [options={}] - 配置选项
 * @param {boolean} [options.immutable=false] - 是否立即检查更新
 * @returns {Object} - 更新相关的方法
 * @returns {Function} returns.appUpdateCheck - 检查应用更新
 * @returns {Function} returns.showUpdateModal - 显示更新提示
 * @returns {Function} returns.updatePack - 更新应用包
 *
 * @example
 * // 基本用法
 * const { appUpdateCheck } = useProgramUpdate()
 *
 * // 立即检查更新
 * const { appUpdateCheck } = useProgramUpdate({ immutable: true })
 *
 * // 手动检查更新
 * appUpdateCheck()
 */
export default function useProgramUpdate(options) {
	const { immutable = false } = options || {}
	// 存储暂不更新的版本号
	const { data: notupdateversionno, setItem: setNotUpdateVersion } = useStorage(
		'notupdateversionno',
		{
			listenStorageChange: true
		}
	)
	// 获取平台信息
	const platform = sys().platform

	/**
	 * 检查应用更新
	 */
	const appUpdateCheck = async () => {
		// #ifdef APP-PLUS
		try {
			// 获取应用信息
			let wgtinfo = await plusRuntimeGetProperty()
			const { version } = wgtinfo
			const servercode = uni.getStorageSync('servercode')
			const params = {
				versionno: version, // 当前应用版本号
				appid: import.meta.env.VITE_APP_PROGRAM_UPDATE_ID, // 见云效配置
				platform: platform, // android - 安卓 ios - ios
				shopcode: servercode // 定向推送用
			}
			// 检查更新
			let result = await fetchUpgradeDetection(params)
			if (result && result.success === '1') {
				// upgrade: 0-无需升级 1-需要升级
				const { upgrade, versionno, forceflag, remark, appurl } = result.data
				// 需求： 暂不更新 就使用旧版本 除非再发一个新版本 才会再有提示
				if (upgrade === '1' && versionno !== notupdateversionno.value) {
					showUpdateModal({ forceflag, remark, appurl, versionno })
				}
			}
		} catch (error) {
			console.log(error)
			return Promise.reject(error)
		}
		// #endif
	}

	/**
	 * 显示更新提示
	 * @param {Object} data - 更新信息
	 * @param {string} data.versionno - 版本号
	 * @param {string} data.forceflag - 是否强制更新
	 * @param {string} data.remark - 更新说明
	 * @param {string} data.appurl - 安卓更新地址
	 * @param {string} data.iosurl - iOS更新地址
	 */
	const showUpdateModal = async (data) => {
		// #ifdef APP-PLUS
		const { versionno, forceflag, remark, appurl, iosurl } = data
		// 根据平台选择更新地址
		const updatePackUrl = sys().platform.toLocaleLowerCase() === 'ios' ? iosurl : appurl
		// 显示更新提示
		let res = await uniPromisify('showModal')({
			title: '发现新版本',
			content: remark,
			showCancel: forceflag === '0',
			cancelText: '暂不更新',
			confirmText: '立即更新'
		})
		// 处理强制更新情况下的返回键逻辑
		if (!res.confirm && !res.cancel) {
			if (forceflag === '1' && platform === 'android') return showUpdateModal(data)
		}

		// 存储暂不更新的版本
		if (res.cancel) return setNotUpdateVersion(versionno)
		// 立即更新
		if (res.confirm) await updatePack(updatePackUrl)
		// #endif
	}

	/**
	 * 更新应用包
	 * @param {string} appurl - 应用更新地址
	 */
	const updatePack = async (appurl) => {
		// #ifdef APP-PLUS
		if (platform === 'ios') {
			// iOS 直接打开 App Store
			plus.runtime.openURL(encodeURI(appurl), (e) => {
				throw new Error(e)
			})
		} else {
			// 安卓下载并安装
			uni.showLoading({
				mask: true,
				title: '正在下载应用，请稍等…'
			})
			let downloadResult = await uniPromisify('downloadFile')({
				url: appurl,
				fail() {
					uni.hideLoading()
					uni.showToast({
						title: '当前网络不稳定，请检查网络设置',
						icon: 'none'
					})
				}
			})
			if (downloadResult.statusCode === 200) {
				// 安装应用包
				await installPack(downloadResult.tempFilePath, { force: false })
			} else {
				uni.hideLoading()
				uni.showToast({
					title: '当前网络不稳定，请检查网络设置',
					icon: 'none'
				})
			}
		}
		// #endif
	}

	// 如果设置了 immutable，则立即检查更新
	unref(immutable) && appUpdateCheck()

	// 返回更新相关的方法
	return {
		appUpdateCheck,
		showUpdateModal,
		updatePack
	}
}

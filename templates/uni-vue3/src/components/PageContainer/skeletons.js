import { isArray, merge, isNumber, isEmpty } from 'lodash'
import { getPx, addStyle } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
const sysInfo = uni.getWindowInfo()
import { addUnit } from '@/uni_modules/uv-ui-tools/libs/function/index.js'
function isFull(size) {
	return ['100%', '100vw', '750rpx'].includes(size)
}

function getSize(size) {
	if (isArray(size)) {
		return size.map((item) => getPx(item ?? 0))
	}
	return [getPx(size ?? 0), getPx(size ?? 0)]
}

/**
 * @typedef {{
 * width: number,
 * height: number,
 * radius: string | number,
 * bg: string,
 * marginLeft: number
 * }} Style
 */

/**
 * 创建骨架屏
 * @returns
 */
export class Skeletons {
	containerConfig = {
		width: sysInfo.windowWidth,
		leftGap: '24rpx',
		rightGap: '24rpx',
		topGap: 0,
		separateLine: true // 占据整行
	}
	configs = []
	/**
	 * 创建容器
	 * 指定上左右间距及容器宽度
	 * @param {*} options
	 */
	constructor(options = {}) {
		Object.assign(this.containerConfig, options)
		if (!options.contentWidth) {
			this.containerConfig.contentWidth =
				this.containerConfig.width -
				getPx(this.containerConfig.leftGap) -
				getPx(this.containerConfig.rightGap)
		} else {
			this.containerConfig.contentWidth = getPx(options.contentWidth)
		}
	}
	commonStyleHandler({ bg, radius, ...otherStyle }) {
		let style = {}
		if (!isEmpty(otherStyle)) {
			style = Object.entries(otherStyle).reduce((acc, [key, value]) => {
				let config = {
					...acc
				}
				if (value) {
					config[key] = isNumber(value) ? addUnit(value, 'px') : value
				}
				return config
			}, {})
		}
		return {
			backgroundColor: bg,
			borderRadius: addUnit(radius, 'px'),
			...style
		}
	}
	getContainer(contaienr = {}) {
		return merge({}, this.containerConfig, contaienr)
	}
	// 创建line
	createLine({ lines, num = 1, gap }, contaienr) {
		const { separateLine, leftGap, contentWidth } = this.getContainer(contaienr)
		let config = {
			type: 'line',
			num,
			style: [],
			gap: addUnit(gap, 'px')
		}
		if (isArray(lines)) {
			config.num = lines.length
			lines.forEach((line) => {
				return config.style.push(
					addStyle(
						{
							...this.commonStyleHandler(line),
							marginLeft: separateLine ? addUnit(leftGap, 'px') : 0,
							width: addUnit(line.width ?? contentWidth, 'px'),
							height: addUnit(line.height ?? 20, 'px')
						},
						'string'
					)
				)
			})
		}
		return config
	}

	/**
	 * 创建一个块
	 * @param {{style: Style}} param0
	 * @param {*} contaienr // 容器配置，与containerConfig 配置相同
	 * @returns
	 */
	createBlock({ style }, contaienr) {
		let { width, height, bg, radius, marginLeft, marginTop, marginBottom, marginRight } = style
		const { contentWidth, separateLine, leftGap } = this.getContainer(contaienr)
		let config = {
			type: 'custom',
			style: ''
		}
		width = isFull(width) ? contentWidth : width

		let itemStyle = {
			width: addUnit(width, 'px'),
			height: addUnit(height, 'px'),
			marginLeft: addUnit(marginLeft, 'px'),
			...this.commonStyleHandler({ bg, radius, marginTop, marginBottom, marginRight })
		}
		if (separateLine) {
			itemStyle.marginLeft = addUnit(leftGap, 'px')
		}
		config.style = addStyle(itemStyle, 'string')
		return config
	}
	/**
	 * 创建flex
	 * @param {{
	 * children: Array, // 子元素
	 * num: number, // 渲染行数
	 * gap: number, // 间隔
	 * style: Style, // 样式
	 * }} param0
	 * @param {*} contaienr // 容器配置，与containerConfig 配置相同
	 * @returns
	 */
	createFlex(options = {}, contaienr) {
		const { children = [], num, gap = '12rpx', style = {} } = options
		let { leftGap, rightGap } = this.getContainer(contaienr)
		const config = {
			type: 'flex',
			num,
			children: children
		}
		config.style = addStyle(
			{
				...this.commonStyleHandler(style),
				marginLeft: addUnit(leftGap, 'px'),
				marginRight: addUnit(rightGap, 'px'),
				gap: addUnit(gap, 'px')
			},
			'string'
		)
		const ctx = {
			addChildren(child) {
				if (isArray(child)) {
					config.children.push(...child)
				} else {
					config.children.push(child)
				}

				return ctx
			},
			done() {
				return config
			}
		}
		return ctx
	}

	/**
	 * 创建 grid
	 * @param {{
	 * rows: number, // 行数
	 * cols: number, // 列数
	 * style: Style, // 样式
	 * gap: number, // 间距
	 * }} param0
	 * @param {*} contaienr // 容器配置，与containerConfig 配置相同
	 * @returns
	 */
	createGrid({ rows = 1, cols = 1, style, gap }, contaienr) {
		let { contentWidth } = this.getContainer(contaienr)
		contentWidth = getPx(contentWidth)
		let itemWidth = style.width
		let itemGap = 0
		const [x, y] = getSize(gap)
		if (itemWidth === 'full') {
			itemWidth = (contentWidth - x * (cols - 1)) / cols
			itemGap = x
		} else {
			itemWidth = isFull(style.width) ? contentWidth : style.width
			itemGap = cols > 1 ? (contentWidth - getPx(itemWidth) * cols) / (cols - 1) : 0
		}

		let child = new Array(cols).fill({ ...style }).map((style, index) => {
			return this.createBlock(
				{
					style: {
						...style,
						width: addUnit(itemWidth, 'px'),
						marginLeft: index > 0 ? addUnit(itemGap, 'px') : '0'
					}
				},
				{ separateLine: false }
			)
		})
		let config = this.createFlex({ num: rows, gap: y }).addChildren(child).done()
		return config
	}
	/**
	 * 创建头像
	 * @param {{
	 * style: Style, // 样式
	 * }} param0
	 * @param {*} contaienr // 容器配置，与containerConfig 配置相同
	 * @returns
	 */
	createAvatar({ style = {} }, contaienr) {
		let config = {
			type: 'avatar'
		}
		let { separateLine, leftGap, rightGap } = this.getContainer(contaienr)
		if (separateLine) {
			style.marginLeft = addUnit(leftGap, 'px')
		}
		config.style = addStyle(
			{
				...this.commonStyleHandler(style),
				marginLeft: addUnit(leftGap, 'px'),
				marginRight: addUnit(rightGap, 'px')
			},
			'string'
		)
		return config
	}
	/**
	 * 添加上下级间隔
	 * @param {number} num
	 */
	gap(num) {
		this.configs.push(getPx(num))
	}
	/**
	 * 添加配置项到配置中
	 * @param {*} config
	 * @returns
	 */
	add(config) {
		if (isArray(config)) {
			this.configs.push(...config)
		} else {
			this.configs.push(config)
		}

		return this
	}
	/**
	 * 获取配置
	 * @returns
	 */
	getConfig() {
		// 如果存在上边距
		if (this.containerConfig.marginTop) {
			let first = this.configs[0]
			if (first.type === 'line') {
				first.style[0] = addStyle(
					{
						...addStyle(first.style[0]),
						marginTop: addUnit(this.containerConfig.marginTop, 'px')
					},
					'string'
				)
			} else {
				first.style = {
					...addStyle(first.style),
					marginTop: addUnit(this.containerConfig.marginTop, 'px')
				}
			}
		}
		return this.configs
	}
}

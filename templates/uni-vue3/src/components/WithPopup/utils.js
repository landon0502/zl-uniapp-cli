/**
 * 工具函数
 */
import { isEmpty } from 'lodash'

/**
 * 通过组件props筛选出对应值
 * @param {Object} props - 组件属性对象
 * @param {Object} definedProps - 定义的属性对象
 * @returns {Object} 筛选后的属性对象
 */
export function getComponentProps(props, definedProps = {}) {
	if (isEmpty(props)) {
		return {}
	}
	let data = Object.entries(props).reduce((prev, [key, value]) => {
		if (Reflect.has(definedProps, key)) {
			prev[key] = value
		}
		return prev
	}, {})
	return data
}

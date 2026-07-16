import { setConfig } from '@/uni_modules/uv-ui-tools/libs/function'

export function defineThemeConfig() {
	setConfig({
		// 修改$uv.config对象的属性
		config: {
			// 颜色部分，本来可以通过scss的:export导出供js使用，但是奈何nvue不支持
			color: {
				'uv-main-color': '#303133',
				'uv-content-color': '#909193',
				'uv-tips-color': '#909193',
				'uv-light-color': '#c0c4cc',
				'uv-border-color': '#dadbde',
				'uv-bg-color': '#f3f4f6',
				'uv-disabled-color': '#c8c9cc',

				'uv-primary': 'red',
				'uv-primary-dark': '#255aa6',
				'uv-primary-disabled': '#9acafc',
				'uv-primary-light': '#255aa61a',

				'uv-warning': '#f9ae3d',
				'uv-warning-dark': '#f1a532',
				'uv-warning-disabled': '#f9d39b',
				'uv-warning-light': '#fdf6ec',

				'uv-success': '#5ac725',
				'uv-success-dark': '#53c21d',
				'uv-success-disabled': '#a9e08f',
				'uv-success-light': '#f5fff0',

				'uv-error': '#f56c6c',
				'uv-error-dark': '#e45656',
				'uv-error-disabled': '#f7b2b2',
				'uv-error-light': '#fef0f0',

				'uv-info': '#909399',
				'uv-info-dark': '#767a82',
				'uv-info-disabled': '#c4c6c9',
				'uv-info-light': '#f4f4f5',
				'uv-info-bg': '#f5f5f7'
			},
			// 修改默认单位为rpx，相当于执行 uni.$uv.config.unit = 'rpx'
			unit: 'px'
		},

		// 修改$uv.props对象的属性【app-vue不支持全局使用uni.$uv.setConfig设置props属性】
		props: {
			// 修改uv-text组件的size参数的默认值，注意：默认值都要用default声明
			// text: {},
			// 其他组件属性配置，具体的参数名称可以去每个组件的props.js中进行查看
		}
	})
}

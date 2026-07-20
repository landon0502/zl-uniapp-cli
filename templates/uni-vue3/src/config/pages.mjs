/**
 * 页面映射配置
 * 用于生成 pages.json
 */
export const pageMap = [
	// 应用加载页（仅 APP 平台）
	{
		path: 'pages/app-load/index',
		style: {
			navigationBarTitleText: '应用加载',
			navigationStyle: 'custom',
			disableSwipeBack: true
		},
		condition: 'APP'
	},

	// 首页
	{
		path: 'pages/index/index',
		style: {
			navigationBarTitleText: '首页',
			navigationStyle: 'custom'
		}
	},
	// 登录页
	{
		path: 'pages/login/index',
		style: {
			navigationBarTitleText: '登录',
			navigationStyle: 'custom',
			enableSwipeBack: false,
			disableSwipeBack: true
		}
	},

	// 个人中心
	{
		path: 'pages/user/index',
		style: {
			navigationBarTitleText: '个人中心',
			navigationStyle: 'custom'
		}
	},
	// 图片裁剪
	{
		path: 'pages/tools/clipper/index',
		style: {
			navigationBarTitleText: '图片裁剪',
			navigationStyle: 'custom'
		}
	}
]

// 全局配置
export const globalConfig = {
	easycom: {
		custom: {
			'^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
				'z-paging/components/z-paging$1/z-paging$1.vue'
		}
	},
	globalStyle: {
		navigationBarTextStyle: 'black',
		navigationBarTitleText: 'uni-app',
		navigationBarBackgroundColor: '#F8F8F8',
		backgroundColor: '#F8F8F8',
		bounce: 'none'
	},
	tabBar: {
		custom: true,
		height: '0px',
		list: [
			{
				pagePath: 'pages/index/index',
				text: '',
				visible: false
			},
			{
				pagePath: 'pages/user/index',
				text: '',
				visible: false
			}
		]
	},
	condition: {
		current: 0,
		list: []
	}
}

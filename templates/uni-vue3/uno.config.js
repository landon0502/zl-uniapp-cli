// uno.config.ts
import { defineConfig, presetAttributify } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'

import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
	presets: [
		// 2. 使用 presetUni 替代 presetUno，这是适配 uni-app 的关键:cite[6]
		presetUni(), // [!code highlight]
		// 其他你需要的预设可以保留
		presetAttributify() // 支持属性化写法（可选）
		// presetIcons({
		// 	// 图标预设（可选）
		// 	scale: 1.2,
		// 	warn: true
		// })
	],
	shortcuts: [
		{
			'border-base': 'border border-gray-500_10',
			'flex-center': 'flex justify-center items-center',
			'flex-vertical': 'flex flex-col',
			'flex-horizontal': 'flex flex-row'
		}
	],
	transformers: [
		transformerDirectives({
			enforce: 'pre'
		})
	],
	theme: {
		colors: {
			black: 'var(--uv-text-color)',
			text: 'var(--uv-text-color)',
			white: 'var(--uv-white-color)',
			red: 'var(--uv-red-color)',
			primary: 'var(--uv-primary)',
			gray: 'var(--uv-gray-color)',
			lightgray: 'var(--uv-lightgray-color)'
		},
		fontFamily: {
			// SearchPageFont: ['search-page-font']
		}
	},
	rules: [
		// 动态背景色
		// [
		// 	/^bg-custom-(\w+)$/,
		// 	([, color]) => {
		// 		const colorMap = {
		// 			ocean: '#1E40AF',
		// 			forest: '#065F46',
		// 			sunset: '#DC2626',
		// 			lavender: '#7C3AED'
		// 		}
		// 		return { 'background-color': colorMap[color] || '#000' }
		// 	}
		// ]
	],

	content: {
		pipeline: {
			exclude: [
				// 排除的文件/文件夹
				'node_modules',
				'.git',
				'dist',
				'public',
				'*.nvue',
				'*.uvue'
			]
		}
	},
	hash: process.env.NODE_ENV === 'production'
})

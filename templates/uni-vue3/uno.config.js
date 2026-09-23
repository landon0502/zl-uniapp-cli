// uno.config.ts
import { defineConfig, presetIcons, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
	presets: [
		// 核心预设：自动处理 rpx 单位转换和平台兼容性
		presetUni(),
		// 可选：图标预设
		presetIcons({
			scale: 1.2,
			warn: true,
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle'
			}
		})
	],
	// 内容扫描：确保覆盖 pages、components 等所有目录
	content: {
		pipeline: {
			include: [
				// 匹配 .vue 和 .uvue 文件
				/\.(vue|uvue)($|\?)/
			]
		}
	},
	transformers: [
		// 支持 @apply 等指令
		transformerDirectives(),
		// 支持变体组简写，如 hover:(bg-gray-400 font-medium)
		transformerVariantGroup()
	],
	// 强制构建模式，避免小程序端开发模式的兼容问题
	envMode: 'build'
})

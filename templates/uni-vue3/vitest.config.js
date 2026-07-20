import { defineConfig, configDefaults } from 'vitest/config'
import path from 'path'

const root = process.cwd()
export default defineConfig({
	test: {
		alias: {
			'@': path.resolve(root, './src')
		},
		environment: 'jsdom',
		exclude: [...configDefaults.exclude, 'dist/*', 'node_modules', 'unpackage'],
		setupFiles: './testSetup.js',
		globals: true
	}
})

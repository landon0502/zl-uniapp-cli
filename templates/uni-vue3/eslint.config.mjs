import pluginJs from '@eslint/js'
import pluginPrettier from 'eslint-plugin-prettier/recommended'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import vueParser from 'vue-eslint-parser' // 需要安装 vue-eslint-parser
export default defineConfig([
	globalIgnores([
		'*.md',
		'*.html',
		'node_modules',
		'dist',
		'.vscode',
		'vite.config.js',
		'src/uni_modules',
		'*.wxs'
	]),
	{
		files: ['**/*.js', '**/*.jsx', '**/*.vue'], // 针对 JS 和 Vue 文件
		languageOptions: {
			globals: {
				...globals.browser, // 浏览器环境全局变量
				process: 'readonly',
				uni: 'readonly',
				UniViewJSBridge: 'readonly',
				plus: 'readonly',
				getApp: 'readonly',
				getCurrentPages: 'readonly',
				defineProps: 'readonly',
				defineEmits: 'readonly',
				defineExpose: 'readonly',
				defineSlots: 'readonly',
				wx: 'readonly',
				defineOptions: 'readonly',
				VITE_REQUEST_ENV: 'readonly',
				__uniConfig: 'readonly',
				weex: 'readonly',
				WXEnvironment: 'readonly',
				require: 'readonly'
			},
			ecmaVersion: 'latest', // 使用最新的 ECMAScript 版本
			sourceType: 'module' // 使用 ES 模块
		}
	},
	{
		files: ['**/*.vue', '**/*.jsx'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true
				}
			}
		}
	},
	pluginJs.configs.recommended, // 使用 ESLint 推荐规则
	pluginPrettier, // 添加 Prettier 支持
	...pluginVue.configs['flat/essential'], // 使用 Vue 插件的基础规则
	{
		rules: {
			semi: 0, // 禁止尾部使用分号
			// 此处可添加或覆盖特定规则
			'no-console': 'off', // 生产环境禁用 console
			'no-debugger': 'off', // 生产环境禁用 debugger
			'no-duplicate-case': 'warn', // 禁止出现重复case
			'no-empty': 'error', // 禁止出现空语句块
			'no-extra-parens': 'off', // 禁止不必要的括号
			'no-func-assign': 'warn', // 禁止对Function声明重新赋值
			'no-unreachable': 'off', // 禁止出现[return|throw]之后的代码块
			'no-else-return': 'warn', // 禁止if语句中return语句之后有else块
			'no-empty-function': 'warn', // 禁止出现空的函数块
			'no-lone-blocks': 'warn', // 禁用不必要的嵌套块
			'no-multi-spaces': 'warn', // 禁止使用多个空格
			'no-redeclare': 'off', // 禁止多次声明同一变量
			'no-return-assign': 'warn', // 禁止在return语句中使用赋值语句
			'no-return-await': 'warn', // 禁用不必要的[return/await]
			'no-self-compare': 'warn', // 禁止自身比较表达式
			'no-useless-catch': 'warn', // 禁止不必要的catch子句
			'no-useless-return': 'warn', // 禁止不必要的return语句
			'no-mixed-spaces-and-tabs': 'off', // 禁止空格和tab的混合缩进
			'no-multiple-empty-lines': 'warn', // 禁止出现多行空行
			'no-trailing-spaces': 'warn', // 禁止一行结束后面不要有空格
			'no-useless-call': 'warn', // 禁止不必要的.call()和.apply()
			'no-var': 'warn', // 禁止出现var用let和const代替
			'no-delete-var': 'off', // 允许出现delete变量的使用
			'no-shadow': 'off', // 允许变量声明与外层作用域的变量同名
			'no-unused-vars': 2, // 未使用变量
			'dot-notation': 'off', // 要求尽可能地使用点号
			'default-case': 'warn', // 要求switch语句中有default分支
			eqeqeq: 'warn', // 要求使用 === 和 !==
			curly: 'off', // 要求所有控制语句使用一致的括号风格
			'space-before-blocks': 'warn', // 要求在块之前使用一致的空格
			'space-in-parens': 'warn', // 要求在圆括号内使用一致的空格
			'space-infix-ops': 'warn', // 要求操作符周围有空格
			'space-unary-ops': 'warn', // 要求在一元操作符前后使用一致的空格
			'switch-colon-spacing': 'warn', // 要求在switch的冒号左右有空格
			'arrow-spacing': 'warn', // 要求箭头函数的箭头前后使用一致的空格
			'array-bracket-spacing': 'warn', // 要求数组方括号中使用一致的空格
			'brace-style': 'warn', // 要求在代码块中使用一致的大括号风格
			camelcase: 0, // 要求使用骆驼拼写法命名约定
			indent: ['off', 2], // 要求使用JS一致缩进2个空格
			'max-depth': ['warn', 4], // 要求可嵌套的块的最大深度4
			'max-statements': ['warn', 100], // 要求函数块最多允许的的语句数量20
			'max-nested-callbacks': ['warn', 5], // 要求回调函数最大嵌套深度3
			'max-statements-per-line': ['warn', { max: 2 }], // 要求每一行中所允许的最大语句数量
			quotes: ['off', 'single', 'avoid-escape'], // 要求统一使用单引号符号
			'vue/multi-word-component-names': 'off',
			'vue/no-deprecated-slot-attribute': 'off',
			'vue/no-useless-template-attributes': 'off',
			'vue/valid-v-slot': 0
		}
	}
])

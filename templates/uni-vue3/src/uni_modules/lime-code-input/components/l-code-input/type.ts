// @ts-nocheck
export interface CodeInputProps {
	/**
	 * 密码值
	 */
	value?: string;
	modelValue?:string;
	/**
	 * 输入框下方文字提示
	 */
	info?: string;
	/**
	 * 输入框下方错误提示
	 */
	errorInfo?: string;	
	/**
	 * 密码最大长度 6
	 */
	length:number;
	/**
	 * 输入框格子之间的间距，如 20px 20rpx，默认单位为px
	 */
	gutter: string;	
	/**
	 * 是否隐藏密码内容
	 */
	mask: boolean;
	/**
	 * 是否已聚焦，聚焦时会显示光标
	 */
	focused:boolean;
	/**
	 * 是否使用下划线模式
	 */
	line:boolean;
	/**
	 * 线条宽度
	 */
	lineWidth?: string;
	/**
	 * 描边色
	 */
	borderColor?:string;
	borderWidth?:string;
	/**
	 * 格子尺寸
	 */
	width?:string;
	height?:string;
	radius?: string;
	/**
	 * 字体大小
	 */
	fontSize?:string;
	/**
	 * 激活色
	 */
	activeBgColor?:string;
	activeBorderColor?:string;
	
	color?:string;
	/**
	 * 格子背景色
	 */
	bgColor?:string;
	cursorColor?:string;
	disabledKeyboard: boolean;
	disabledDot: boolean;
	insertAt?:UTSJSONObject;
	lastElementStyle?:string;
	lastElementPlaceholder?:string;
	lastElementPlaceholderStyle?:string;
	
	
	type: 'text' | 'number' | 'idcard' | 'digit' | 'tel' | 'safe-password' | 'nickname'
}
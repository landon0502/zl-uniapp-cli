<template>
	<view class="demo-block">
		<text class="demo-block__title-text ultra">CodeInput 验证码输入框</text>
		<text class="demo-block__desc-text">带网格的输入框组件，可以用于输入密码、短信验证码等场景，通常与数字键盘组件配合使用。</text>
		<view class="demo-block__body">

			<view class="demo-block card">
				<text class="demo-block__title-text">基础类型</text>
				<view class="demo-block__body">
					<l-code-input v-model="value1"></l-code-input>
				</view>
			</view>
			<view class="demo-block card">
				<text class="demo-block__title-text">自定义长度</text>
				<view class="demo-block__body">
					<l-code-input :value="value" :length="5"></l-code-input>
				</view>
			</view>
			<view class="demo-block card">
				<text class="demo-block__title-text">明文展示</text>
				<view class="demo-block__body">
					<l-code-input :value="value" :mask="false"></l-code-input>
				</view>
			</view>
			<view class="demo-block card">
				<text class="demo-block__title-text">提示信息</text>
				<view class="demo-block__body">
					<l-code-input v-model="info" info="请输入验证码" :error-info="errorInfo"></l-code-input>
				</view>
			</view>
			<view class="demo-block card">
				<text class="demo-block__title-text">线条类型</text>
				<view class="demo-block__body">
					<l-code-input :value="value" line :focused="focused" @focus="focused = true" ></l-code-input>
				</view>
			</view>
			<view class="demo-block card">
				<text class="demo-block__title-text">自定义样式</text>
				<view class="demo-block__body">
					<l-code-input :value="value" focused bg-color="white" border-color="#ddd" active-border-color="#34c471" cursor-color="#34c471"></l-code-input>
					<!-- <l-code-input :value="value" focused line border-color="#ddd" active-border-color="#3283ff" cursor-color="#3283ff"></l-code-input>
					 -->
					 <l-code-input :value="value" focused cursor-color="#3283ff">
					 	<template #line="{active}">
					 		<view
					 			style="position: absolute;bottom: 0;width: 100%; left: 0; height: 5px; border-radius: 5px;"
					 			:style="active ? 'background:#3283ff' : 'background-color: #666;'"></view>
					 	</template>
					 </l-code-input>
				</view>
			</view>
			<!-- <view class="demo-block card">
				<text class="demo-block__title-text">自定义样式</text>
				<view class="demo-block__body">
					<l-code-input :value="value" :focused="focused2" disabledKeyboard @focus="focused2 = true"></l-code-input>
				</view>
			</view> -->
		</view>
	</view>
</template>
<script>
	export default {
		data() {
			return {
				value: '',
				value1: '1599999999',
				focused: false,
				focused2: false,
				errorInfo: '',
				info: ''
			}
		},
		watch:{
			info(newVal) {
				if (newVal.length == 6 && newVal != '123456') {
				    this.errorInfo = '密码错误';
				} else {
				    this.errorInfo = '';
				}
			}
		},
		mounted() {
			setTimeout(()=>{
				this.value = '1'
				setTimeout(()=>{
					this.value = '12'
				},1000)
			},1000)
		}
	}
	
	
</script>
<style lang="scss">


	.close-btn {
		overflow: visible;
		position: absolute;
		// background-color: aqua;
		left: 50%;
		transform: translateX(-50%);
		z-index: 11501;
		// margin-left: -32rpx;
		bottom: -100rpx;
		// bottom: -112rpx // calc(-1 * (48rpx + 64rpx));
	}

.demo-block {
		margin: 32px 16px 0;
		
		// overflow: visible;
		&.card{
			background-color: white;
			padding: 30rpx;
			margin-bottom: 20rpx !important;
		}
		&__title {
			margin: 0;
			margin-top: 8px;
			&-text {
				color: rgba(0, 0, 0, 0.6);
				font-weight: 400;
				font-size: 14px;
				line-height: 16px;
				display: flex;
				// margin-left: 20px;
				&.large {
					color: rgba(0, 0, 0, 0.9);
					font-size: 18px;
					font-weight: 700;
					line-height: 26px;
					margin-left: 20px;
				}
				&.ultra {
					color: rgba(0, 0, 0, 0.9);
					font-size: 24px;
					font-weight: 700;
					line-height: 32px;
				}
			}
		}
		&__desc-text {
			color: rgba(0, 0, 0, 0.6);
			margin: 8px 16px 0 0;
			font-size: 14px;
			line-height: 22px;
			// margin-left: 20px;
		}
		&__body {
			margin: 16px 0;
			overflow: visible;
			.demo-block {
				// margin-top: 0px;
				margin: 0;
			}
		}
	}
</style>
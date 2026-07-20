<template>
	<PageContainer :nav-bar-props="{ leftIcon: '' }">
		<view class="flex flex-col items-center justify-between login-container">
			<view class="flex flex-col gap-50rpx mt-152rpx">
				<text class="font-size-28px color-#000000 font-bold">欢迎登录</text>
				<view class="flex-vertical gap-32rpx">
					<uv-input
						class="mb-50rpx"
						v-model="userInfo.phone"
						type="number"
						maxlength="11"
						fontSize="16"
						placeholderStyle="color: #BDBDBD"
						:custom-style="{ paddingLeft: 0, paddingRight: 0 }"
						placeholder="请输入手机号码"
						border="bottom"
					></uv-input>
					<uv-input
						placeholder="请输入密码"
						fontSize="16"
						maxlength="20"
						v-model="userInfo.password"
						placeholderStyle="color: #BDBDBD"
						:custom-style="{ paddingLeft: 0, paddingRight: 0 }"
						:password="pwdHidden"
						border="bottom"
					>
						<template v-slot:suffix v-if="userInfo.password">
							<NIcon @click="togglePwd" :name="pwdIcon" :size="24"></NIcon>
						</template>
					</uv-input>
				</view>
				<uv-button
					type="primary"
					size="large"
					class="w-600rpx mt-40rpx"
					:customStyle="{
						borderRadius: '16rpx',
						width: '600rpx',
						height: '96rpx',
						border: 0,
						backgroundColor: 'var(--uv-App-theme)'
					}"
					@click="handleLogin"
					:loading="loading"
				>
					立即登录
				</uv-button>
			</view>
		</view>
	</PageContainer>
</template>

<script setup>
import { ref } from 'vue'
import router from '@/router'
import PageContainer from '@/components/PageContainer'
import { useUserStore } from '@/store'
import { useRequest, useToggle } from '@/composables'
import NIcon from '@/components/NIcon'

const userStore = useUserStore()
const userInfo = ref({
	phone: '',
	password: '',
	userType: ''
})

const { run, loading } = useRequest(userStore.login, {
	manual: true
})
const pwdHidden = ref(true)
const [pwdIcon, togglePwdIcon] = useToggle('eye-close-line')

const togglePwd = () => {
	pwdHidden.value = !pwdHidden.value
	togglePwdIcon(pwdHidden.value ? 'eye-close-line' : 'eye-line')
}

// 登录点击事件
const handleLogin = async () => {
	const { phone, password } = userInfo.value
	// 前端基础非空+格式校验
	// 手机号为空
	if (!phone) {
		uni.showToast({ title: '请输入手机号', icon: 'none', duration: 2000 })
		return
	}
	// 手机号格式校验（11位纯数字，严谨校验）
	const regPhone = /^1[3-9]\d{9}$/
	if (!regPhone.test(phone)) {
		uni.showToast({ title: '请输入正确的手机号', icon: 'none', duration: 2000 })
		return
	}
	// 密码为空
	if (!password) {
		uni.showToast({ title: '请输入密码', icon: 'none', duration: 2000 })
		return
	}
	// 密码长度建议校验（可选，比如密码最少6位）
	if (password.length < 6) {
		uni.showToast({ title: '密码不能少于6位', icon: 'none', duration: 2000 })
		return
	}
	await run({
		mobile: phone,
		identityType: 1,
		password: password,
		terminal: 'app'
	})

	const url = '/pages/index/index'
	//BD
	router.launch({
		url
	})
}
</script>

<style scoped lang="scss">
.role-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
	width: 160rpx;
	cursor: pointer;
	.role-icon {
		width: 180rpx;
		height: 180rpx;
		margin-bottom: 16rpx;
	}
	.role-text {
		font-size: 28rpx;
		color: #333;
	}
}
.login-container {
	:deep(.uv-input__content__prefix-icon) {
		display: none;
	}
}
</style>

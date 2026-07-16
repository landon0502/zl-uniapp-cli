<template>
	<view>
		<uv-loading-page
			:loading="loading"
			loading-mode="circle"
			:iconSize="50"
			:loadingText="'正在加载数据，请稍后...'"
		></uv-loading-page>
	</view>
</template>
<script setup>
import { useInitApp } from '@/composables'
// import logo from '@/assets/images/logo.png'
const { loading } = useInitApp()
</script>
<style lang="scss" scoped></style>

<template>
	<demo-block title="浮动气泡" type="ultra">
		<view class="tabs">
			<text class="tab" :class="{active: active == 0}" @click="change(0)">基础用法</text>
			<text class="tab" :class="{active: active == 1}" @click="change(1)">自由磁吸</text>
			<text class="tab" :class="{active: active == 2}" @click="change(2)">控制位置</text>
		</view>
		<view v-if="active == 0">
			<text class="text">在 x 轴默认位置，允许 y 轴方向拖拽</text>
			<l-fab @click="onClick">拖</l-fab>
		</view>
		<view v-if="active == 1">
			<text class="text">允许 x 和 y 轴方向拖拽，吸附到 x 轴方向最近一边</text>
			<l-fab axis="xy" magnetic="x">拖</l-fab>
		</view>
		<view v-if="active == 2">
			<text class="text">使用 offset 控制位置, x:{{offset[0]}}, y:{{offset[1]}}</text>
			<!-- #ifdef VUE3 -->
			<l-fab v-model:offset="offset" axis="xy">拖</l-fab>
			<!-- #endif -->
			<!-- #ifndef VUE3 -->
			<l-fab :offset.sync="offset" axis="xy">拖</l-fab>
			<!-- #endif -->
		</view>
		<view style="height: 200vh;"></view>
	</demo-block>
</template>
<script>
	export default {
		data() {
			return {
				active: 0,
				offset: [200, 400]
			}
		},
		methods: {
			change(index) {
				this.active = index
			},
			onClick() {
				uni.showToast({
					icon: false,
					title: '点击气泡'
				})
			}
		}
	}

</script>
<style>
	.tabs {
		display: flex;
		flex-direction: row;
	}
	.tab{margin-right:10px}
	.tab:last-child {
		margin-right:0px
	}
	.text {
		display: block;
		margin: 30px 0;
		color: rgba(0, 0, 0, 0.6);
	}
	.active {
		color: blue;
	}
</style>

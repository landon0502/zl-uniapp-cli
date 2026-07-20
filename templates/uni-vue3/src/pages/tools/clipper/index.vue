<template>
	<PageContainer :show-nav-bar="false">
		<l-clipper
			v-if="params.tempFilePath"
			:image-url="params.tempFilePath"
			@success="onSuccess"
			@cancel="onCancel"
			is-limit-move
		/>
	</PageContainer>
</template>
<script setup>
import PageContainer from '@/components/PageContainer'
import { useRouter } from '@/composables'
import router from '@/router'

const { params } = useRouter()

function onSuccess(res) {
	router.back({
		params: res
	})
}

function onCancel() {
	router.back()
}
</script>
<style lang="scss" scoped></style>

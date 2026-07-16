<script>
import { defineComponent } from 'vue'
import { useInitApp } from '@/composables'
import Storage from './utils/Storage'
import { amapGeoDistrictKey } from '@/contants'
const storage = new Storage()
export default defineComponent({
	globalData: {
		userinfo: null, // 用户缓存
		amapGeoDistricts: storage.getItem(amapGeoDistrictKey), // 全国区域缓存
		location: null, // 当前定位坐标缓存
		theme: '' // app主图
	},
	setup() {
		// #ifdef H5
		useInitApp()
		// #endif
	}
})
</script>
<style lang="scss">
/* uni.scss */
@import './uni.scss';
/*每个页面公共css */
</style>

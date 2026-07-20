import { Skeletons } from '@/components/PageContainer/skeletons'

function createSkeletons() {
	const skeletons = new Skeletons({
		marginTop: '24rpx',
		padding: '30rpx'
	})

	skeletons.add(
		skeletons.createGrid({
			rows: 2,
			cols: 3,
			style: {
				width: '160rpx',
				height: '160rpx',
				radius: '8px'
			}
		})
	)
	return skeletons.getConfig()
}
export default createSkeletons()

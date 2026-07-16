import { Skeletons } from '@/components/PageContainer/skeletons'

function createSkeletons() {
	const skeletons = new Skeletons({
		marginTop: '24rpx'
	})
	skeletons.add(
		skeletons.createBlock({
			style: {
				width: '100%',
				height: '88rpx',
				radius: '8px'
			}
		})
	)
	skeletons.gap('28rpx')
	skeletons.add(
		skeletons.createBlock({
			style: {
				width: '100%',
				height: '304rpx',
				radius: '8px'
			}
		})
	)
	skeletons.gap('48rpx')
	skeletons.add(
		skeletons.createGrid({
			rows: 1,
			cols: 3,
			style: {
				width: '200rpx',
				height: '30px',
				radius: '8px'
			}
		})
	)
	skeletons.gap('86rpx')
	skeletons.add(
		skeletons
			.createFlex({
				num: 1, // flex容器只渲染1个
				gap: 30, // 子节点间距（替代你写的marginRight）
				style: { justifyContent: 'center' },
				children: [
					// 左侧：圆形/方形占位图 custom类型
					{
						type: 'custom',
						num: 1,
						style: { width: '286rpx', height: '76rpx', borderRadius: '8rpx' } // 推荐对象格式，必生效
					},
					// 右侧：3行文字 line类型
					{
						type: 'custom',
						num: 1,
						style: { width: '286rpx', height: '76rpx', borderRadius: '8rpx' } // 推荐对象格式，必生效
					}
				]
			})
			.done() // ✅ 重中之重：必须加 .done() 收尾！！！
	)
	for (let i = 0; i < 3; i++) {
		skeletons.gap('48rpx')
		skeletons.add(
			skeletons
				.createFlex({
					num: 1, // flex容器只渲染1个
					gap: '30rpx', // 子节点间距（替代你写的marginRight）
					children: [
						// 左侧：圆形/方形占位图 custom类型
						{
							type: 'custom',
							num: 1,
							style: { width: '186rpx', height: '186rpx', borderRadius: '8rpx' } // 推荐对象格式，必生效
						},
						// 右侧：3行文字 line类型
						{
							type: 'line',
							num: 3, // 固定渲染3行
							gap: '40rpx', // 行间距
							style: [null, 'width:360rpx;', null] // 第1行满宽、第2行360rpx、第3行满宽，去掉字符串null
						}
					]
				})
				.done() // ✅ 重中之重：必须加 .done() 收尾！！！
		)

		skeletons.gap('48rpx')
		skeletons.add(
			skeletons.createGrid({
				rows: 1,
				cols: 4,
				style: {
					width: '135rpx',
					height: '20px',
					radius: '8px'
				}
			})
		)
	}
	return skeletons.getConfig()
}

export default createSkeletons()

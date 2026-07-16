<template>
	<!-- #ifndef APP-NVUE -->
	<movable-area class="l-fab-wrapper" :style="[rootStyle]">
		<view ref="l-fab" class="l-fab" v-if="!state.animation" :style="[styles]"></view>
		<movable-view 
			v-if="state.animation"
			class="l-fab" 
			hover-class="l-fab--active"
			:direction="direction"
			:style="[styles]"
			:x="state.x"
			:y="state.y"
			:animation="state.animation"
			:damping="80"
			@click="onClick"
			@mousedown="onTouchStart"
			@mouseup="onTouchEnd"
			@touchcancel="onTouchEnd"
			@touchstart="onTouchStart"
			@touchend="onTouchEnd"
			@change="onTouchMove">
			<slot></slot>
		</movable-view>
	</movable-area>
	<!-- #endif -->
	<!-- #ifdef APP-NVUE -->
	<!-- 之所以多加一个，是因为一开始位置会在左上角，还没有计算完成，所以需要一个透明的节点获取尺寸 -->
	<view ref="l-fab" class="l-fab" v-if="!state.animation" :style="[styles]"></view>
	<view 
		v-if="state.animation" 
		ref="l-fab"
		class="l-fab"
		hover-class="l-fab--active"
		:style="[styles]"
		@click="onClick"
		@touchstart="onTouchStart"
		@touchend="onTouchEnd">
		<slot></slot>
	</view>
	<!-- #endif -->
</template>
<script lang="ts">
	// @ts-nocheck
	/**
	 * Fab 悬浮按钮组件
	 * @description 用于创建可拖拽的浮动操作按钮
	 * @tutorial https://ext.dcloud.net.cn/plugin?name=lime-fab
	 * 
	 * @property {number[]} offset 初始偏移坐标 [x, y]（支持px/rpx单位）
	 * @property {any|string|number} gap 按钮与屏幕边缘的安全间距
	 * @property {any|string|number|Array} size 按钮尺寸
	 * @property {LFabAxis} axis 拖拽方向限制
	 * @value x 仅水平拖拽
	 * @value y 仅垂直拖拽
	 * @value xy 自由拖拽
	 * @value lock 固定位置（不可拖拽）
	 * @property {string} [icon] 按钮图标（支持字体图标/图片路径）
	 * @property {LFabMagnetic} [magnetic] 磁吸方向
	 * @value x 水平磁吸
	 * @value y 垂直磁吸
	 * @property {string} [bgColor] 按钮背景色（支持渐变色）
	 * @event {Function} dragstart 开始拖拽时触发
	 * @event {Function} drag 拖拽过程中触发
	 * @event {Function} dragend 拖拽结束时触发
	 */
	import {defineComponent, ref, reactive, computed, onMounted, watch, getCurrentInstance, onUnmounted} from '@/uni_modules/lime-shared/vue';
	import FloatingBubbleProps from './props'
	import {unitConvert} from '@/uni_modules/lime-shared/unitConvert'
	import {addUnit} from '@/uni_modules/lime-shared/addUnit'
	import {getRect} from '@/uni_modules/lime-shared/getRect'
	// import {getStyleStr} from '@/uni_modules/lime-shared/getStyleStr'
	import {closest} from '@/uni_modules/lime-shared/closest'
	import type { CSSProperties } from './type'
	// #ifdef APP-NVUE
	import {clamp} from '@/uni_modules/lime-shared/clamp'
	const Binding = uni.requireNativePlugin('bindingx');
	// #endif
	
	const name = 'l-fab'
	export default defineComponent({
		name,
		props: FloatingBubbleProps,
		emits: ['click','update:offset', 'change', 'customClick'],
		setup(props, {emit}) {
			const context = getCurrentInstance()
			const { windowWidth, windowHeight } = uni.getWindowInfo()
			const root= reactive({
				width: 0,
				height: 0,
			});
			const state = reactive({
				ox: 0,
				oy: 0,
			    x: 0,
			    y: 0,
				animation: false,
			    width: 0,
			    height: 0,
			});
			const dragging = ref(false);
			const gap = computed(() => unitConvert(props.gap))
			const boundary = computed(() => ({
				// #ifndef APP-NVUE
			    top: 0,
				left: 0,
				// #endif
				// #ifdef APP-NVUE
				top: gap.value,
				left: gap.value,
				// #endif
			    right: windowWidth - state.height - gap.value,
			    bottom: windowHeight - state.width - gap.value,
			  
			}));
			// #ifndef APP-NVUE
			const rootStyle = computed(() => {
			    const style:CSSProperties = {
					width: addUnit(windowWidth - gap.value * 2),
					height: addUnit(windowHeight - gap.value * 2),
					left: addUnit(gap.value),
					bottom: addUnit(gap.value),
				};
			    return style;
			});
			
			const direction = computed(() => {
				const obj = {
					x: 'horizontal',
					y: 'vertical',
					xy: 'all'
				}
				return obj[props.axis] || 'none'
			})
			// #endif
			
			
			const styles = computed(() => {
				const x = addUnit(state.x);
				const y = addUnit(state.y);
				const style:CSSProperties = {
					// #ifdef APP-NVUE
					transform: `translate(${x}, ${y})`
					// #endif
				}
				if(!state.animation) {
					style.opacity = 0
				} 
				if(props.size) {
					style.height = style.width = addUnit(props.size)
				}
				if(props.bgColor) {
					style['background'] = props.bgColor;
				}
				return style // getStyleStr(style) 
			})
			//
			const updateState = () => {
				const { width, height } = root;
				const { offset } = props;
				if(dragging.value) return;
				// 跳转页面再返回会出现在左上角，故加这个方法让其保持原位
				Object.assign(state, {
					ox: offset[0] > -1 ? offset[0] : windowWidth - width - gap.value,
					oy: offset[1] > -1 ? offset[1] : windowHeight - height - gap.value
				})
				Object.assign(state, {
					x: offset[0] > -1 ? offset[0] : windowWidth - width - gap.value,
					y: offset[1] > -1 ? offset[1] : windowHeight - height - gap.value,
					width,
					height,
				})
			};
			
			// #ifdef APP-NVUE
			const getEl = (el: any) => {
				if (typeof el === 'string' || typeof el === 'number') return el;
				if (WXEnvironment) {
					return el.ref;
				} else {
					return el instanceof HTMLElement ? el : el.$el;
				}
			}
			// #endif
			
			const onTouchStart = () => {
			   // #ifndef APP-NVUE
			   dragging.value = true;
			   // #endif
				// #ifdef APP-NVUE
				if(props.axis == 'lock') {
					dragging.value = false;
					Binding.unbindAll()
				};
				
				if(!'xy'.includes(props.axis)) return
				 dragging.value = true;
				const ref = getEl(context.refs[name])
				const axis = Array.from(props.axis).map(key => ([key, key.toUpperCase()]))
				const axisProps = axis.map(([lowercase,capital]) => ({
					element: ref,
					property:'transform.translate' + capital,
					expression: `${lowercase}+${state[lowercase]}`
				}))
				// 这里退出机制有点棘手，有大佬知道的可告之
				// const yExit = `y > ${boundary.value.bottom - state.x} || y < ${boundary.value.top - state.x} `
				// const xExit = `x > ${boundary.value.right - state.x} || x < ${boundary.value.left - state.x} `
				let fab = Binding.bind({
					anchor:ref,
					eventType:'pan',
					// exitExpression: `${yExit}`,
					props: axisProps
				}, function(res: any) {
					if(['end', 'exit'].includes(res.state)) {
						axis.forEach(([lowercase, capital]) => {
							state[lowercase] += res['delta' + capital];
							state.ox = state.x
							state.oy = state.y
							state.ox = clamp(state.x, boundary.value.left, boundary.value.right) 
							state.oy = clamp(state.y, boundary.value.top, boundary.value.bottom) 
						})
					}
					if (res.state === 'exit') {
						Binding.unbind({
							token: fab.token,
							eventType: 'pan'
						})
					}
				});
				// #endif
			};
			
			const onTouchMove = ({detail}: any) => {
				if(!dragging.value) return
				const {x, y} = detail
				state.ox = x
				state.oy = y
				emit('update:offset', [x, y]);
				emit('change', [x, y]);
			};
			
			const magnetic= (boundary: number[], traget:number, axis: string) => {
				if (props.magnetic === axis) {
					const next = closest(boundary,traget);
					const axis2 = axis == 'x' ? 'y' : 'x'
					const current = state['o' + axis2] 
					state[axis] = next - 0.001;
					state[axis2] = current - 0.001 
					
					setTimeout(() => {
						state[axis] = next
						state[axis2] = current
						const e = [state.x, state.y]
						emit('update:offset', e);
						emit('change', e);
					}, 50)
				} else {
					// #ifdef APP-NVUE
					state.x = state.ox
					state.y = state.oy
					const e = [state.x, state.y]
					emit('update:offset', e);
					emit('change', e);
					// #endif
				}
				
			}
			const onTouchEnd = () => {
			    dragging.value = false;
			    setTimeout(() => {
					magnetic([boundary.value.left, boundary.value.right], state.ox, 'x')
					magnetic([boundary.value.top, boundary.value.bottom], state.oy, 'y')
			    },100);
			};
			
			const onClick = (e: MouseEvent) => {
			    emit('customClick', e)
			    emit('click', e)
			};
			
			const stopWatch = watch([() => props.gap, () => props.offset],
			    () => updateState(),
			    // { deep: true }
			);
			
			onMounted(() => {
				// 用nextTick有时无法得到尺寸
			   setTimeout(() =>{
				   getRect(`.${name}`, context?.proxy).then(res => {
						root.width = res.width
						root.height = res.height
						updateState()
						state.animation = true
				   })
			   },100)
			});
			
			onUnmounted(() => {
				stopWatch()
			})
			return {
				styles,
				onTouchStart,
				onTouchEnd,
				onClick,
				state,
				// #ifndef APP-NVUE
				rootStyle,
				onTouchMove,
				direction,
				// #endif
			}
		}
	})
</script>
<style lang="scss">
	@import './index.scss';
</style>
<template>
	<view class="dz-grid" ref="dzGridRef" :style="[gridStyle]">
		<slot />
	</view>
</template>

<script lang="ts">
import props from './props';
/**
 * grid 宫格布局
 * @description 宫格组件一般用于同时展示多个同类项目的场景，可以给宫格的项目设置徽标组件(badge)，或者图标等，也可以扩展为左右滑动的轮播形式。
 * @tutorial https://www.uviewui.com/components/grid.html
 * @property {String | Number}	col			宫格的列数（默认 3 ）
 * @property {Boolean}			border		是否显示宫格的边框（默认 false ）
 * @property {String}			align		宫格对齐方式，表现为数量少的时候，靠左，居中，还是靠右 （默认 'left' ）
 * @property {Object}			customStyle	定义需要用到的外部样式
 * @event {Function} click 点击宫格触发
 * @example <dz-grid :col="3" @click="click"></dz-grid>
 */
import { ref, watch, computed, defineComponent } from 'vue';
import type { CSSProperties } from 'vue';

export default defineComponent({
	name: 'dz-grid',
	props,
	emits: ['click'],
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props, { emit }) {
		const dzGridRef = ref(null);
		const index = ref<number>(0);
		const width = ref<number>(0);
		const children = ref([]);
		// 计算父组件的值是否发生变化
		const parentData = computed(() => {
			return [props.hoverClass, props.col, props.size, props.border];
		});
		// 宫格对齐方式
		const gridStyle = computed((): CSSProperties => {
			let style = {};
			switch (props.align) {
				case 'left':
					style.justifyContent = 'flex-start';
					break;
				case 'center':
					style.justifyContent = 'center';
					break;
				case 'right':
					style.justifyContent = 'flex-end';
					break;
				default:
					style.justifyContent = 'flex-start';
			}
			return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
		});

		// 当父组件需要子组件需要共享的参数发生了变化，手动通知子组件
		watch(
			() => parentData.value,
			() => {
				if (children.value.length) {
					children.value.map((child) => {
						// 判断子组件(dz-radio)如果有updateParentData方法的话，就就执行(执行的结果是子组件重新从父组件拉取了最新的值)
						typeof child.updateParentData == 'function' && child.updateParentData();
					});
				}
			}
		);

		// 此方法由dz-grid-item触发，用于在dz-grid发出事件
		function childClick(name: string) {
			emit('click', name);
		}

		return {
			dzGridRef,
			index,
			width,
			children,
			gridStyle,
			childClick,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';
$dz-grid-width: 100% !default;
.dz-grid {
	/* #ifdef MP */
	width: $dz-grid-width;
	position: relative;
	box-sizing: border-box;
	overflow: hidden;
	display: block;
	/* #endif */
	justify-content: center;
	@include flex;
	flex-wrap: wrap;
	align-items: center;
}
</style>

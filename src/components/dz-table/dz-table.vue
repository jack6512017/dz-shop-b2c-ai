<template>
	<view class="dz-table" :style="[tableStyle]">
		<slot />
	</view>
</template>

<script lang="ts">
/**
 * table 表格
 * @description 表格组件一般用于展示大量结构化数据的场景
 * @property {String} border-color 表格边框的颜色（默认#e4e7ed）
 * @property {String} bg-color 表格的背景颜色（默认#ffffff）
 * @property {String} align 单元格的内容对齐方式，作用类似css的text-align（默认center）
 * @property {String} padding 单元格的内边距，同css的padding写法（默认10rpx 0）
 * @property {String Number} font-size 单元格字体大小，单位rpx（默认28）
 * @property {String} color 单元格字体颜色（默认#606266）
 * @property {Object} th-style th单元格的样式，对象形式(将th所需参数放在table组件，是为了避免每一个th组件要写一遍）
 * @event {Function} click 点击组件时触发
 * @event {Function} close 点击关闭按钮时触发
 * @example <dz-table></dz-table>
 */
import { computed, defineComponent } from 'vue';
import type { CSSProperties } from 'vue';

export default defineComponent({
	name: 'dz-table',
	props: {
		borderColor: {
			type: String,
			default: '#e4e7ed',
		},
		align: {
			type: String,
			default: 'center',
		},
		thHeight: {
			type: [String, Number],
			default: 60,
		},
		tdHeight: {
			type: [String, Number],
			default: 60,
		},
		// td的内边距
		padding: {
			type: String,
			default: '10rpx 6rpx',
		},
		// 字体大小
		thFontSize: {
			type: [String, Number],
			default: 28,
		},
		// 字体大小
		tdFontSize: {
			type: [String, Number],
			default: 22,
		},
		// 字体颜色
		color: {
			type: String,
			default: '#606266',
		},
		// th的自定义样式
		thStyle: {
			type: Object,
			default() {
				return {};
			},
		},
		// table的背景颜色
		bgColor: {
			type: String,
			default: '#ffffff',
		},
	},
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props) {
		const tableStyle = computed((): CSSProperties => {
			const style = {};
			style.borderLeft = `solid 1px ${props.borderColor}`;
			style.borderTop = `solid 1px ${props.borderColor}`;
			style.backgroundColor = props.bgColor;
			return style;
		});

		return { tableStyle, props };
	},
});
</script>

<style lang="scss" scoped>
.dz-table {
	width: 100%;
	box-sizing: border-box;
}
</style>

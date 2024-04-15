<template>
	<div
		class="dz-divider"
		:style="{
			height: height == 'auto' ? 'auto' : height + 'rpx',
			backgroundColor: bgColor,
			marginBottom: marginBottom + 'rpx',
			marginTop: marginTop + 'rpx',
		}"
	>
		<div class="dz-divider-line" :style="[lineStyle]"></div>
		<div
			v-if="useSlot"
			class="dz-divider-text"
			:style="{
				color: color,
				fontSize: fontSize + 'rpx',
			}"
		>
			<slot></slot>
		</div>
		<div class="dz-divider-line" :style="[lineStyle]"></div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 单一边divider横线的宽度(数值)，单位px。或者百分比
	halfWidth: {
		type: [Number, String],
		default: 75,
	},
	// divider横线的颜色，如设置，
	borderColor: {
		type: String,
		default: '#dcdfe6',
	},
	// 文字颜色
	color: {
		type: String,
		default: '#909399',
	},
	// 文字大小，单位rpx
	fontSize: {
		type: [Number, String],
		default: 13,
	},
	// 整个divider的背景颜色
	bgColor: {
		type: String,
		default: '#ffffff',
	},
	// 整个divider的高度单位rpx
	height: {
		type: [Number, String],
		default: 'auto',
	},
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 0,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 0,
	},
	// 是否使用slot传入内容，如果不用slot传入内容，先的中间就不会有空隙
	useSlot: {
		type: Boolean,
		default: true,
	},
});

const lineStyle = computed((): CSSProperties => {
	let style = {};
	if (String(props.halfWidth).indexOf('%') != -1) style.width = props.halfWidth;
	else style.width = props.halfWidth + 'rpx';
	if (props.borderColor) style.borderColor = props.borderColor;
	return style;
});
</script>

<style lang="scss" scoped>
.dz-divider {
	width: 100%;
	position: relative;
	text-align: center;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	flex-direction: row;
}

.dz-divider-line {
	border-bottom: 1rpx solid #e4e7ed;
	transform: scale(1, 0.5);
	transform-origin: center;
}

.dz-divider-text {
	white-space: nowrap;
	padding: 0 16rpx;
	display: inline-flex;
}
</style>

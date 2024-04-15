<template>
	<view class="dz-loading">
		<view v-if="mode == 'flower' || mode == 'circle'" class="dz-flex dz-row-center">
			<view :class="{ 'dz-flower dz-flex': mode == 'flower' }">
				<dz-loading :mode="mode" :color="color" size="70" borderSize="8"></dz-loading>
			</view>
		</view>
		<!-- loading-1 -->
		<view v-if="mode == 'loading-1'" class="la-square-jelly-box la-2x" :style="[loadingSize]">
			<view :style="[loadingStyle]"></view>
			<view></view>
		</view>
		<!-- loading-2 -->
		<view
			v-if="mode == 'loading-2'"
			class="spinner-inside"
			:style="{
				width: size + 110 + 'rpx',
			}"
		>
			<view :style="{ backgroundColor: color }" class="bounce1"></view>
			<view :style="{ backgroundColor: color }" class="bounce2"></view>
			<view :style="{ backgroundColor: color }" class="bounce3"></view>
		</view>
		<!-- loading-3 -->
		<view v-if="mode == 'loading-3'" class="loading-3"></view>
		<view v-if="mode == 'loading-4'" class="loading-4">
			<text :style="[loadingStyle]"></text>
			<text :style="[loadingStyle]"></text>
			<text :style="[loadingStyle]"></text>
			<text :style="[loadingStyle]"></text>
			<text :style="[loadingStyle]"></text>
			<text :style="[loadingStyle]"></text>
		</view>
		<view v-if="mode == 'loading-5'" class="loading-5"></view>
		<view v-if="mode == 'loading-6'" class="loading-6"></view>
		<view v-if="mode == 'loading-7'" class="loading-7">
			<text :style="[loadingStyle]"></text>
			<text :style="[loadingStyle]"></text>
			<text :style="[loadingStyle]"></text>
		</view>
		<view
			v-if="mode == 'loading-8'"
			class="loading-8"
			:style="{
				width: `80rpx`,
				height: `80rpx`,
			}"
		>
			<view class="load8-container container1">
				<view :style="[loadingStyle]" class="circle1"></view>
				<view :style="[loadingStyle]" class="circle2"></view>
				<view :style="[loadingStyle]" class="circle3"></view>
				<view :style="[loadingStyle]" class="circle4"></view>
			</view>
			<view class="load8-container container2">
				<view :style="[loadingStyle]" class="circle1"></view>
				<view :style="[loadingStyle]" class="circle2"></view>
				<view :style="[loadingStyle]" class="circle3"></view>
				<view :style="[loadingStyle]" class="circle4"></view>
			</view>
			<view class="load8-container container3">
				<view :style="[loadingStyle]" class="circle1"></view>
				<view :style="[loadingStyle]" class="circle2"></view>
				<view :style="[loadingStyle]" class="circle3"></view>
				<view :style="[loadingStyle]" class="circle4"></view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
/**
 * loading 加载动画
 * @description 警此组件为一个小动画，目前用在loadmore加载更多和switch开关等组件的正在加载状态场景。
 * @property {String} mode 模式选择，（默认circle）
 * @property {String} color 动画活动区域的颜色，只对 mode = flower 模式有效（默认#c7c7c7）
 * @property {String Number} size 加载图标的大小，单位rpx（默认34）
 * @property {Boolean} show 是否显示动画（默认true）
 * @example <dz-loading mode="circle"></dz-loading>
 */
import { computed } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 动画的类型
	mode: {
		type: String,
		default: 'loading-1',
	},
	// 动画的颜色
	color: {
		type: String,
		default: '#c7c7c7',
	},
	// 加载图标的大小，单位rpx
	size: {
		type: [String, Number],
		default: '34',
	},
	borderColor: {
		type: String,
		default: '#e4e4e4',
	},
});

const loadingStyle = computed((): CSSProperties => {
	// 加载中动画的样式

	let style = {};
	if (props.mode == 'loading-1') {
		style.background = `${props.color ? props.color : '#c7c7c7'}`;
		style.borderColor = `${props.color ? props.color : '#c7c7c7'}`;
	}
	if (props.mode == 'loading-4') {
		style.background = `${props.color ? props.color : '#c7c7c7'}`;
	}
	if (props.mode == 'loading-8') {
		style.background = `${props.color ? props.color : '#5cdbd3'}`;
	}
	return style;
});
// loading大小

const loadingSize = computed((): CSSProperties => {
	let style = {};
	style.width = props.size + 'rpx';
	style.height = props.size + 'rpx';
	return style;
});
</script>

<style lang="scss" scoped>
.dz-loading {
	display: flex;
	align-items: center;
	justify-content: center;
}

.dz-flower {
	align-items: center;
	justify-content: center;
	width: 120rpx;
	height: 120rpx;
	background: rgba(17, 17, 17, 0.7);
	border-radius: 20rpx;
}

// loading-1
.la-square-jelly-box,
.la-square-jelly-box > view {
	position: relative;
	-webkit-box-sizing: border-box;
	-moz-box-sizing: border-box;
	box-sizing: border-box;
}
.la-square-jelly-box {
	display: block;
	font-size: 0;
	color: #fff;
}
.la-square-jelly-box.la-dark {
	color: #333;
}
.la-square-jelly-box > view {
	display: inline-block;
	float: none;
	background-color: pink;
	border: 0 solid pink;
}
.la-square-jelly-box {
	width: 32rpx;
	height: 32rpx;
}
.la-square-jelly-box > view:nth-child(1),
.la-square-jelly-box > view:nth-child(2) {
	position: absolute;
	left: 0;
	width: 100%;
}
.la-square-jelly-box > view:nth-child(1) {
	top: -25%;
	z-index: 1;
	height: 100%;
	border-radius: 10%;
	animation: square-jelly-box-animate 0.6s -0.1s linear infinite;
}
.la-square-jelly-box > view:nth-child(2) {
	bottom: -9%;
	height: 10%;
	background: #000;
	border-radius: 50%;
	opacity: 0.2;
	animation: square-jelly-box-shadow 0.6s -0.1s linear infinite;
}
.la-square-jelly-box.la-2x {
	width: 64rpx;
	height: 64rpx;
}
@keyframes square-jelly-box-animate {
	17% {
		border-bottom-right-radius: 10%;
	}
	25% {
		transform: translateY(25%) rotate(22.5deg);
	}
	50% {
		border-bottom-right-radius: 100%;
		transform: translateY(50%) scale(1, 0.9) rotate(45deg);
	}
	75% {
		transform: translateY(25%) rotate(67.5deg);
	}
	100% {
		transform: translateY(0) rotate(90deg);
	}
}
@keyframes square-jelly-box-shadow {
	50% {
		transform: scale(1.25, 1);
	}
}
// loading-2
.spinner-inside {
	margin: 25rpx auto;
	text-align: center;
}
.spinner-inside > view {
	display: inline-block;
	width: 24rpx;
	height: 24rpx;
	margin-right: 4rpx;
	border-radius: 100%;
	animation: bouncedelay 1.4s infinite ease-in-out;
	/* Prevent first frame from flickering when animation starts */
	animation-fill-mode: both;
}
.spinner-inside .bounce1 {
	animation-delay: -0.32s;
}
.spinner-inside .bounce2 {
	animation-delay: -0.16s;
}
@keyframes bouncedelay {
	0%,
	80%,
	100% {
		transform: scale(0);
	}
	40% {
		transform: scale(1);
	}
}
.loading-3 {
	position: relative;
	margin-left: -40rpx;
}
.loading-3:before {
	position: absolute;
	width: 20rpx;
	height: 20rpx;
	content: '';
	background: #7a80fc;
	border-radius: 20rpx;
	animation: loading-3_before 1.2s infinite ease-in-out;
}
.loading-3:after {
	position: absolute;
	left: 22rpx;
	width: 20rpx;
	height: 20rpx;
	content: '';
	background: #42e38d;
	border-radius: 20rpx;
	animation: loading-3_after 1.2s infinite ease-in-out;
}
@keyframes loading-3_before {
	0% {
		transform: translateX(0rpx) rotate(0deg);
	}
	50% {
		background: #42e38d;
		transform: translateX(30rpx) scale(1.2) rotate(260deg);
	}
	100% {
		transform: translateX(0rpx) rotate(0deg);
	}
}
@keyframes loading-3_after {
	0% {
		transform: translateX(0rpx);
	}
	50% {
		background: #7a80fc;
		transform: translateX(-30rpx) scale(1.2) rotate(-260deg);
	}
	100% {
		transform: translateX(0rpx);
	}
}
.loading-4 {
	display: flex;
	justify-content: space-between;
	width: 60rpx;
	height: 20rpx;
	margin: 0 auto;
}
.loading-4 text {
	display: inline-block;
	width: 6rpx;
	height: 100%;
	background: lightgreen;
	border-radius: 3rpx;
	animation: load 1.04s ease infinite;
}
@keyframes load {
	0%,
	100% {
		height: 20rpx;
	}
	50% {
		height: 30rpx;
		margin-top: -10rpx;
	}
}
.loading-4 text:nth-child(2) {
	animation-delay: 0.9s;
}
.loading-4 text:nth-child(3) {
	animation-delay: 0.18s;
}
.loading-4 text:nth-child(4) {
	animation-delay: 0.27s;
}
.loading-4 text:nth-child(5) {
	animation-delay: 0.36s;
}
.loading-4 text:nth-child(6) {
	animation-delay: 0.4s;
}
.loading-5 {
	display: inline-block;
	width: 48rpx;
	height: 48rpx;
	border-top: 6rpx solid #42e38d;
	border-right: 6rpx solid transparent;
	border-radius: 50%;
	animation: rotation 1s linear infinite;
}
.loading-5:after {
	position: absolute;
	top: 0;
	left: 0;
	width: 48rpx;
	height: 48rpx;
	content: '';
	border-bottom: 6rpx solid transparent;
	border-left: 6rpx solid #ff3d00;
	border-radius: 50%;
	animation: rotation 0.5s linear infinite reverse;
}
.loading-6 {
	position: relative;
	display: inline-block;
	width: 48rpx;
	height: 48rpx;
	border: 3rpx solid #333;
	border-radius: 50%;
	animation: rotation 1s linear infinite;
}
.loading-6:after {
	position: absolute;
	top: 4rpx;
	left: 4rpx;
	width: 9rpx;
	height: 9rpx;
	margin: 7rpx;
	content: '';
	background: #333;
	border: 2rpx solid #333;
	border-radius: 50%;
}

@keyframes rotation {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
.loading-7 {
	display: flex;
	justify-content: space-between;
	width: 32rpx;
	height: 16rpx;
	margin: 0 auto;
}
.loading-7 text {
	display: inline-block;
	width: 6rpx;
	height: 100%;
	background: red;
	border-radius: 3rpx;
	animation: mplive 1.04s ease infinite;
}
@keyframes mplive {
	0%,
	100% {
		height: 20rpx;
	}
	50% {
		height: 30rpx;
		margin-top: -10rpx;
	}
}
.loading-7 text:nth-child(2) {
	animation-delay: 0.13s;
}
.loading-7 text:nth-child(3) {
	animation-delay: 0.26s;
}
/* load8 */
.loading-8 {
	position: relative;
	margin: auto;
}
.container1 > view,
.container2 > view,
.container3 > view {
	position: absolute;
	width: 12px;
	height: 12px;
	border-radius: 100%;
	animation: bouncedelay 1.2s infinite ease-in-out;
	animation-fill-mode: both;
}
.loading-8 .load8-container {
	position: absolute;
	width: 100%;
	height: 100%;
}
.container2 {
	transform: rotateZ(45deg);
}
.container3 {
	transform: rotateZ(90deg);
}
.circle1 {
	top: 0;
	left: 0;
}
.circle2 {
	top: 0;
	right: 0;
}
.circle3 {
	right: 0;
	bottom: 0;
}
.circle4 {
	bottom: 0;
	left: 0;
}
.container2 .circle1 {
	animation-delay: -1.1s;
}
.container3 .circle1 {
	animation-delay: -1s;
}
.container1 .circle2 {
	animation-delay: -0.9s;
}
.container2 .circle2 {
	animation-delay: -0.8s;
}
.container3 .circle2 {
	animation-delay: -0.7s;
}
.container1 .circle3 {
	animation-delay: -0.6s;
}
.container2 .circle3 {
	animation-delay: -0.5s;
}
.container3 .circle3 {
	animation-delay: -0.4s;
}
.container1 .circle4 {
	animation-delay: -0.3s;
}
.container2 .circle4 {
	animation-delay: -0.2s;
}
.container3 .circle4 {
	animation-delay: -0.1s;
}
@keyframes bouncedelay {
	0%,
	80%,
	100% {
		transform: scale(0);
	}
	40% {
		transform: scale(1);
	}
}
</style>

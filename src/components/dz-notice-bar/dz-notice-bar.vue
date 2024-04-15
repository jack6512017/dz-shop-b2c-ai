<template>
	<view
		class="dz-notice-bar-wrap"
		:style="{
			margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
			borderRadius: borderRadius + 'rpx',
		}"
	>
		<block v-if="isShow && mode == 'horizontal' && isCircular">
			<dz-notice-row
				:type="type"
				:color="color"
				:bgColor="bgColor"
				:list="list"
				:volumeIcon="volumeIcon"
				:leftIconColor="leftIconColor"
				:rightIconColor="rightIconColor"
				:title="title"
				:titleStyle="titleStyle"
				:cover="cover"
				:widthHeight="widthHeight"
				:moreIcon="moreIcon"
				:volumeSize="volumeSize"
				:closeIcon="closeIcon"
				:mode="mode"
				:fontSize="fontSize"
				:speed="speed"
				:playState="playState"
				:padding="padding"
				@getMore="getMore"
				@close="close"
				@click="click"
			></dz-notice-row>
		</block>
		<block v-if="(isShow && mode == 'vertical') || (mode == 'horizontal' && !isCircular)">
			<dz-notice-column
				:type="type"
				:color="color"
				:bgColor="bgColor"
				:list="list"
				:volumeIcon="volumeIcon"
				:title="title"
				:titleStyle="titleStyle"
				:leftIconColor="leftIconColor"
				:rightIconColor="rightIconColor"
				:cover="cover"
				:widthHeight="widthHeight"
				:moreIcon="moreIcon"
				:closeIcon="closeIcon"
				:mode="mode"
				:volumeSize="volumeSize"
				:disable-touch="disableTouch"
				:fontSize="fontSize"
				:duration="duration"
				:playState="playState"
				:padding="padding"
				@getMore="getMore"
				@close="close"
				@click="click"
				@end="end"
			></dz-notice-column>
		</block>
	</view>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
	// 显示的内容，数组
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 显示的主题，success|error|primary|info|warning
	type: {
		type: String,
		default: 'warning',
	},
	// 是否显示左侧的音量图标
	volumeIcon: {
		type: [Number, String],
		default: 1,
	},
	// 文字
	title: {
		type: String,
		default: '',
	},
	// 文字样式
	titleStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 图标颜色
	leftIconColor: {
		type: String,
		default: '',
	},
	// 右侧图标颜色
	rightIconColor: {
		type: String,
		default: '#606266',
	},
	// 图片
	cover: {
		type: String,
		default: '',
	},
	widthHeight: {
		type: [Number, String],
		default: 40,
	},
	// 音量喇叭的大小
	volumeSize: {
		type: [Number, String],
		default: 34,
	},
	// 是否显示右侧的右箭头图标
	moreIcon: {
		type: Boolean,
		default: false,
	},
	// 是否显示右侧的关闭图标
	closeIcon: {
		type: Boolean,
		default: false,
	},
	// 是否自动播放
	autoplay: {
		type: Boolean,
		default: true,
	},
	// 文字颜色，各图标也会使用文字颜色
	color: {
		type: String,
		default: '',
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '',
	},
	// 滚动方向，horizontal-水平滚动，vertical-垂直滚动
	mode: {
		type: String,
		default: 'horizontal',
	},
	// 是否显示
	show: {
		type: Boolean,
		default: true,
	},
	// 字体大小，单位rpx
	fontSize: {
		type: [Number, String],
		default: 28,
	},
	// 滚动一个周期的时间长，单位ms
	duration: {
		type: [Number, String],
		default: 2000,
	},
	// 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
	speed: {
		type: [Number, String],
		default: 160,
	},
	// 水平滚动时，是否采用衔接形式滚动
	// 水平衔接模式，采用的是swiper组件，水平滚动
	isCircular: {
		type: Boolean,
		default: true,
	},
	// 播放状态，play-播放，paused-暂停
	playState: {
		type: String,
		default: 'play',
	},
	// 是否禁止用手滑动切换
	// 目前HX2.6.11，只支持App 2.5.5+、H5 2.5.5+、支付宝小程序、字节跳动小程序
	disableTouch: {
		type: Boolean,
		default: true,
	},
	// 滚动通知设置圆角
	borderRadius: {
		type: [Number, String],
		default: 0,
	},
	// 通知的边距
	padding: {
		type: [Number, String],
		default: '20rpx 24rpx',
	},
	// list列表为空时，是否显示组件
	noListHidden: {
		type: Boolean,
		default: true,
	},
	// 左右边距
	marginLeftRight: {
		type: [String, Number],
		default: 24,
	},
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 24,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 24,
	},
});
const emit = defineEmits(['click', 'close', 'getMore', 'end']);
// 如果设置show为false，或者设置了noListHidden为true，且list长度又为零的话，隐藏组件
const isShow = computed(() => {
	if (props.show == false || (props.noListHidden == true && props.list.length == 0)) return false;
	else return true;
});

// 点击通告栏
function click(index) {
	emit('click', index);
}
// 点击关闭按钮
function close() {
	emit('close');
}
// 点击更多箭头按钮
function getMore() {
	emit('getMore');
}
// 滚动一个周期结束，只对垂直，或者水平步进形式有效
function end() {
	emit('end');
}
</script>

<style lang="scss" scoped>
.dz-notice-bar-wrap {
	overflow: hidden;
}
</style>

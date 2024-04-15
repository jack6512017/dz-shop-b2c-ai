<template>
	<view
		class="dz-loadmore"
		:style="[
			{
				backgroundColor: bgColor,
				marginBottom: api.addUnit(marginBottom),
				marginTop: api.addUnit(marginTop),
				height: api.addUnit(height),
			},
		]"
	>
		<dz-line length="140rpx" :color="lineColor" :hairline="false" :dashed="dashed" v-if="line"></dz-line>
		<!-- 加载中和没有更多的状态才显示两边的横线 -->
		<view :class="status == 'loadmore' || status == 'nomore' ? 'dz-more' : ''" class="dz-loadmore__content">
			<view class="dz-loadmore__content__icon-wrap" v-if="status === 'loading' && icon">
				<dz-loading-icon :color="iconColor" :size="iconSize" :mode="loadingIcon"></dz-loading-icon>
			</view>
			<!-- 如果没有更多的状态下，显示内容为dot（粗点），加载特定样式 -->
			<text
				class="dz-line-1"
				:style="[loadTextStyle]"
				:class="[status == 'nomore' && isDot == true ? 'dz-loadmore__content__dot-text dz-tips-color' : 'dz-loadmore__content__text dz-main-color']"
				@tap="loadMore"
				>{{ showText() }}</text
			>
		</view>
		<dz-line length="140rpx" :color="lineColor" :hairline="false" :dashed="dashed" v-if="line"></dz-line>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps({
	// 组件状态，loadmore-加载前的状态，loading-加载中的状态，nomore-没有更多的状态
	status: {
		type: String,
		default: 'loadmore',
	},
	// 组件背景色
	bgColor: {
		type: String,
		default: 'transparent',
	},
	// 是否显示加载中的图标
	icon: {
		type: Boolean,
		default: true,
	},
	// 字体大小
	fontSize: {
		type: [String, Number],
		default: 14,
	},
	// 图标大小
	iconSize: {
		type: [String, Number],
		default: 17,
	},
	// 字体颜色
	color: {
		type: String,
		default: '#606266',
	},
	// 加载中状态的图标，spinner-花朵状图标，circle-圆圈状，semicircle-半圆
	loadingIcon: {
		type: String,
		default: 'spinner',
	},
	// 加载前的提示语
	loadmoreText: {
		type: String,
		default: '加载更多',
	},
	// 加载中提示语
	loadingText: {
		type: String,
		default: '正在加载...',
	},
	// 没有更多的提示语
	nomoreText: {
		type: String,
		default: '没有更多了',
	},
	// 在“没有更多”状态下，是否显示粗点
	isDot: {
		type: Boolean,
		default: false,
	},
	// 加载中图标的颜色
	iconColor: {
		type: String,
		default: '#b7b7b7',
	},
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 10,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 10,
	},
	// 高度，单位px
	height: {
		type: [String, Number],
		default: 'auto',
	},
	// 是否显示左边分割线
	line: {
		type: Boolean,
		default: false,
	},
	// 线条颜色
	lineColor: {
		type: String,
		default: '#E6E8EB',
	},
	// 是否虚线，true-虚线，false-实线
	dashed: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(['loadmore']);
// 粗点
const dotText = ref<String>('●');

// 加载的文字显示的样式
function loadTextStyle() {
	return {
		color: props.color,
		fontSize: uni.$api.addUnit(props.fontSize),
		lineHeight: uni.$api.addUnit(props.fontSize),
		backgroundColor: props.bgColor,
	};
}

// 显示的提示文字
function showText() {
	let text = '';
	if (props.status == 'loadmore') text = props.loadmoreText;
	else if (props.status == 'loading') text = props.loadingText;
	else if (props.status == 'nomore' && props.isDot) text = dotText.value;
	else text = props.nomoreText;
	return text;
}

function loadMore() {
	// 只有在“加载更多”的状态下才发送点击事件，内容不满一屏时无法触发底部上拉事件，所以需要点击来触发
	if (props.status == 'loadmore') emit('loadmore');
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-loadmore {
	@include flex(row);
	align-items: center;
	justify-content: center;
	flex: 1;

	&__content {
		margin: 0 15px;
		@include flex(row);
		align-items: center;
		justify-content: center;

		&__icon-wrap {
			margin-right: 8px;
		}

		&__text {
			font-size: 14px;
			color: $dz-content-color;
		}

		&__dot-text {
			font-size: 15px;
			color: $dz-tips-color;
		}
	}
}
</style>

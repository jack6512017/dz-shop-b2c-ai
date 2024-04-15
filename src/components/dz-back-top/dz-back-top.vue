<template>
	<view
		@tap="backToTop"
		class="dz-back-top"
		:class="['dz-back-top--mode--' + mode]"
		:style="[
			{
				bottom: bottom + 'rpx',
				right: right + 'rpx',
				borderRadius: mode == 'circle' ? '10000rpx' : '8rpx',
				zIndex: mZIndex,
				opacity: opacity,
			},
			customStyle,
		]"
	>
		<view class="dz-back-top__content" v-if="!$slots.default && !$slots.$default">
			<dz-icon @click="backToTop" :name="icon" :custom-style="iconStyle"></dz-icon>
			<view class="dz-back-top__content__tips">
				{{ tips }}
			</view>
		</view>
		<slot v-else></slot>
	</view>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
	// 返回顶部的形状，circle-圆形，square-方形
	mode: {
		type: String,
		default: 'circle',
	},
	// 自定义图标
	icon: {
		type: String,
		default: 'top',
	},
	// 提示文字
	tips: {
		type: String,
		default: '',
	},
	// 返回顶部滚动时间
	duration: {
		type: [Number, String],
		default: 100,
	},
	// 滚动距离
	scrollTop: {
		type: [Number, String],
		default: 0,
	},
	// 距离顶部多少距离显示，单位rpx
	top: {
		type: [Number, String],
		default: 400,
	},
	// 返回顶部按钮到底部的距离，单位rpx
	bottom: {
		type: [Number, String],
		default: 200,
	},
	// 返回顶部按钮到右边的距离，单位rpx
	right: {
		type: [Number, String],
		default: 40,
	},
	// 层级
	zIndex: {
		type: [Number, String],
		default: '9',
	},
	// 图标的样式，对象形式
	iconStyle: {
		type: Object,
		default() {
			return {
				color: '#909399',
				fontSize: '38rpx',
			};
		},
	},
	// 整个组件的样式
	customStyle: {
		type: Object,
		default() {
			return {};
		},
	},
});

// 不透明度，为了让组件有一个显示和隐藏的过渡动画
const opacity = ref<number>(0);
// 组件的z-index值，隐藏时设置为-1，就会看不到
const mZIndex = ref<number>(-1);

const showBackTop = computed(() => {
	// 由于scrollTop为页面的滚动距离，默认为px单位，这里将用于传入的top(rpx)值
	// 转为px用于比较，如果滚动条到顶的距离大于设定的距离，就显示返回顶部的按钮
	return props.scrollTop > uni.upx2px(props.top);
});

watch(
	() => showBackTop.value,
	(nVal) => {
		// 当组件的显示与隐藏状态发生跳变时，修改组件的层级和不透明度
		// 让组件有显示和消失的动画效果，如果用v-if控制组件状态，将无设置动画效果
		if (nVal) {
			mZIndex.value = props.zIndex;
			opacity.value = 1;
		} else {
			mZIndex.value = -1;
			opacity.value = 0;
		}
	}
);

function backToTop() {
	uni.pageScrollTo({
		scrollTop: 0,
		duration: props.duration,
	});
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-back-top {
	width: 80rpx;
	height: 80rpx;
	position: fixed;
	z-index: 9;
	@include flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	transition: opacity 0.4s;

	&__content {
		@include flex;
		flex-direction: column;
		align-items: center;

		&__tips {
			font-size: 24rpx;
			transform: scale(0.8);
			line-height: 1;
		}
	}
}
</style>

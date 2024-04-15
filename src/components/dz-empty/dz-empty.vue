<template>
	<view
		class="dz-empty"
		v-if="show"
		:style="{
			marginTop: marginTop + 'rpx',
		}"
		@tap.stop="emptyTab"
	>
		<dz-icon
			:name="src ? src : name"
			:custom-style="iconStyle"
			:label="text"
			label-pos="bottom"
			:label-color="color"
			:label-size="fontSize"
			:size="iconSize"
			:color="iconColor"
			margin-top="14"
		></dz-icon>
		<view class="dz-slot-wrap">
			<slot name="bottom"></slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
defineProps({
	// 图标路径
	src: {
		type: String,
		default: '',
	},
	// 提示文字
	text: {
		type: String,
		default: '还没有内容呢~',
	},
	// 文字颜色
	color: {
		type: String,
		default: '#c0c4cc',
	},
	// 图标的颜色
	iconColor: {
		type: String,
		default: '#c0c4cc',
	},
	// 图标的大小
	iconSize: {
		type: [String, Number],
		default: 360,
	},
	// 文字大小，单位rpx
	fontSize: {
		type: [String, Number],
		default: 26,
	},
	// 选择预置的图标类型
	name: {
		type: String,
		default: 'empty',
	},
	//  图标宽度，单位rpx
	imgWidth: {
		type: [String, Number],
		default: 120,
	},
	// 图标高度，单位rpx
	imgHeight: {
		type: [String, Number],
		default: 'auto',
	},
	// 是否显示组件
	show: {
		type: Boolean,
		default: true,
	},
	// 组件距离上一个元素之间的距离
	marginTop: {
		type: [String, Number],
		default: 0,
	},
	iconStyle: {
		type: Object,
		default() {
			return {};
		},
	},
});

const emit = defineEmits(['click']);

function emptyTab() {
	emit('click');
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-empty {
	@include flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
}

.dz-image {
	margin-bottom: 20rpx;
}

.dz-slot-wrap {
	@include flex;
	justify-content: center;
	align-items: center;
	margin-top: 20rpx;
}
</style>

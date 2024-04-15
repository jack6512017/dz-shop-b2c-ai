<template>
	<view
		class="dz-section"
		:style="{
			background: bgColor,
			padding: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
		}"
	>
		<view
			class="dz-section__title"
			:style="{
				fontWeight: bold ? 'bold' : 'normal',
				color: color,
				fontSize: fontSize + 'rpx',
			}"
			:class="{
				'dz-section--line': showLine,
			}"
		>
			<view class="dz-section__title__icon-wrap dz-flex" v-if="showLine">
				<dz-icon top="0" name="column-line" :size="fontSize * 1.25" bold :color="lineColor ? lineColor : color"></dz-icon>
			</view>
			<text class="dz-flex yd-section__title__text">{{ title }}</text>
		</view>
		<view
			class="dz-section__right-info"
			v-if="right || $slots.right"
			:style="{
				color: subColor,
			}"
			@tap="rightClick"
		>
			<slot name="right" v-if="$slots.right"></slot>
			<block v-else>
				{{ subTitle }}
				<view class="dz-section__right-info__icon-arrow dz-flex dz-tips-color" v-if="arrow"
					><dz-icon name="right" size="24" :color="subColor"></dz-icon
				></view>
			</block>
		</view>
	</view>
</template>

<script lang="ts" setup>
/**
 * section 查看更多
 * @description 该组件一般用于分类信息有很多，但是限于篇幅只能列出一部分，让用户通过"查看更多"获得更多信息的场景，实际效果见演示。
 * @property {String} title 左边主标题
 * @property {String} sub-title 右边副标题（默认更多）
 * @property {Boolean} right 是否显示右边的内容（默认true）
 * @property {Boolean} showLine 是否显示左边的竖条（默认true）
 * @property {Boolean} arrow 是否显示右边箭头（默认true）
 * @property {String Number} font-size 主标题的字体大小（默认28）
 * @property {Boolean} bold 主标题是否加粗（默认true）
 * @property {String} color 主标题颜色（默认#303133）
 * @event {Function} click 组件右侧的内容被点击时触发，用于跳转"更多"
 * @example <dz-section title="今日热门" :right="false"></dz-section>
 */
defineProps({
	// 标题信息
	title: {
		type: String,
		default: '',
	},
	// 右边副标题内容
	subTitle: {
		type: String,
		default: '更多',
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '#fff',
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
	// 左右边距
	marginLeftRight: {
		type: [String, Number],
		default: 0,
	},
	// 是否显示右边的内容
	right: {
		type: Boolean,
		default: true,
	},
	fontSize: {
		type: [Number, String],
		default: 28,
	},
	// 主标题是否加粗
	bold: {
		type: Boolean,
		default: true,
	},
	// 主标题的颜色
	color: {
		type: String,
		default: '#303133',
	},
	// 右边副标题的颜色
	subColor: {
		type: String,
		default: '#909399',
	},
	// 是否显示左边的竖条
	showLine: {
		type: Boolean,
		default: true,
	},
	// 左边竖线的颜色
	lineColor: {
		type: String,
		default: '',
	},
	// 是否显示右边箭头
	arrow: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['click']);

function rightClick() {
	emit('click');
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-section {
	@include flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;

	&__title {
		position: relative;
		font-size: 28rpx;
		// padding-left: 20rpx;
		@include flex;
		align-items: center;

		&__icon-wrap {
			// position: absolute;
		}

		&__text {
			line-height: 1;
		}
	}

	&__right-info {
		font-size: 26rpx;
		@include flex;
		align-items: center;

		&__icon-arrow {
			margin-left: 6rpx;
		}
	}
}
</style>

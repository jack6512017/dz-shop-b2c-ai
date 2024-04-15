<template>
	<view
		class="dz-swiper-wrap"
		:style="{
			borderRadius: `${borderRadius}rpx`,
			margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
		}"
	>
		<swiper
			:current="elCurrent"
			@change="change"
			@animationfinish="animationfinish"
			:interval="interval"
			:circular="circular"
			:duration="duration"
			:autoplay="autoplay"
			:previous-margin="effect3d ? effect3dPreviousMargin + 'rpx' : '0'"
			:next-margin="effect3d ? effect3dPreviousMargin + 'rpx' : '0'"
			:style="{
				height: height + 'rpx',
				backgroundColor: bgColor,
			}"
		>
			<swiper-item class="dz-swiper-item" v-for="(item, index) in list" :key="index">
				<view
					class="dz-list-image-wrap"
					@tap.stop.prevent="listClick(index)"
					:class="[mCurrent != index ? 'dz-list-scale' : '']"
					:style="{
						borderRadius: `${borderRadius}rpx`,
						transform: effect3d && mCurrent != index ? 'scaleY(0.9)' : 'scaleY(1)',
						margin: effect3d && mCurrent != index ? '0 20rpx' : 0,
					}"
				>
					<image class="dz-swiper-image" :src="item[name] ? item[name] : api.isObject(item) ? '' : item" :mode="imgMode"></image>
					<view
						v-if="title && item.title"
						class="dz-swiper-title dz-line-1"
						:style="[
							{
								'padding-bottom': titlePaddingBottom,
							},
							titleStyle,
						]"
					>
						{{ item.title }}
					</view>
				</view>
			</swiper-item>
		</swiper>
		<view
			class="dz-swiper-indicator-container"
			:style="{
				top: indicatorPos == 'topLeft' || indicatorPos == 'topCenter' || indicatorPos == 'topRight' ? '12rpx' : 'auto',
				bottom: indicatorPos == 'bottomLeft' || indicatorPos == 'bottomCenter' || indicatorPos == 'bottomRight' ? '12rpx' : 'auto',
				justifyContent: justifyContent,
				padding: `0 ${effect3d ? '74rpx' : '24rpx'}`,
			}"
		>
			<block v-if="mode == 'rect'">
				<view
					class="dz-indicator-item-rect"
					:class="{ 'dz-indicator-item-rect-active': index == mCurrent }"
					v-for="(item, index) in list"
					:key="index"
					:style="{
						background: index == mCurrent ? activeColor : 'rgba(0, 0, 0, 0.3)',
					}"
				></view>
			</block>
			<block v-if="mode == 'dot'">
				<view
					class="dz-indicator-item-dot"
					:class="{ 'dz-indicator-item-dot-active': index == mCurrent }"
					v-for="(item, index) in list"
					:key="index"
					:style="{
						background: index == mCurrent ? activeColor : 'rgba(0, 0, 0, 0.3)',
					}"
				></view>
			</block>
			<block v-if="mode == 'round'">
				<view
					class="dz-indicator-item-round"
					:class="{ 'dz-indicator-item-round-active': index == mCurrent }"
					v-for="(item, index) in list"
					:key="index"
					:style="{
						background: index == mCurrent ? activeColor : 'rgba(0, 0, 0, 0.3)',
					}"
				></view>
			</block>
			<block v-if="mode == 'number'">
				<view class="dz-indicator-item-number">{{ mCurrent + 1 }}/{{ list.length }}</view>
			</block>
			<block v-if="mode == 'slider'">
				<view class="dz-indicator-line-box"><dz-swiper-indicator :length="list.length" :current="mCurrent"></dz-swiper-indicator></view>
			</block>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';

/**
 * swiper 轮播图
 * @description 该组件一般用于导航轮播，广告展示等场景,可开箱即用
 * @property {Array} list 轮播图数据，见官网"基本使用"说明
 * @property {Boolean} title 是否显示标题文字，需要配合list参数，（默认false）
 * @property {String} mode 指示器模式，（默认round）
 * @property {String Number} height 轮播图组件高度，单位rpx（默认250）
 * @property {String} indicator-pos 指示器的位置（默认bottomCenter）
 * @property {Boolean} effect3d 是否开启3D效果（默认false）
 * @property {Boolean} autoplay 是否自动播放（默认true）
 * @property {String Number} interval 自动轮播时间间隔，单位ms（默认2500）
 * @property {Boolean} circular 是否衔接播放，（默认true）
 * @property {String} bg-color 背景颜色（默认#f3f4f6）
 * @property {String Number} border-radius 轮播图圆角值，单位rpx（默认8）
 * @property {Object} title-style 自定义标题样式
 * @property {String Number} effect3d-previous-margin mode = true模式的情况下，激活项与前后项之间的距离，单位rpx（默认50）
 * @property {String} img-mode 图片的裁剪模式，详见image组件裁剪模式（默认aspectFill）
 * @event {Function} click 点击轮播图时触发
 * @example <dz-swiper :list="list" mode="dot" indicator-pos="bottomRight"></dz-swiper>
 */

const props = defineProps({
	// 轮播图的数据,格式如：[{image: 'xxxx', title: 'xxxx'}，{image: 'yyyy', title: 'yyyy'}]，其中title字段可选
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 是否显示title标题
	title: {
		type: Boolean,
		default: false,
	},
	// 用户自定义的指示器的样式
	indicator: {
		type: Object,
		default() {
			return {};
		},
	},
	// 圆角值
	borderRadius: {
		type: [Number, String],
		default: 8,
	},
	// 隔多久自动切换
	interval: {
		type: [String, Number],
		default: 3000,
	},
	// 指示器的模式，rect|dot|number|round
	mode: {
		type: String,
		default: 'round',
	},
	// list的高度，单位rpx
	height: {
		type: [Number, String],
		default: 250,
	},
	// 指示器的位置，topLeft|topCenter|topRight|bottomLeft|bottomCenter|bottomRight
	indicatorPos: {
		type: String,
		default: 'bottomCenter',
	},
	// 是否开启缩放效果
	effect3d: {
		type: Boolean,
		default: false,
	},
	// 3D模式的情况下，激活item与前后item之间的距离，单位rpx
	effect3dPreviousMargin: {
		type: [Number, String],
		default: 50,
	},
	// 是否自动播放
	autoplay: {
		type: Boolean,
		default: true,
	},
	// 自动轮播时间间隔，单位ms
	duration: {
		type: [Number, String],
		default: 500,
	},
	// 是否衔接滑动，即到最后一张时接着滑动，是否自动切换到第一张
	circular: {
		type: Boolean,
		default: true,
	},
	// 图片的裁剪模式
	imgMode: {
		type: String,
		default: 'aspectFill',
	},
	// 从list数组中读取的图片的属性名
	name: {
		type: String,
		default: 'image',
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '#f3f4f6',
	},
	// 初始化时，默认显示第几项
	current: {
		type: [Number, String],
		default: 0,
	},
	// 标题的样式，对象形式
	titleStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 选中项的主题颜色
	activeColor: {
		type: String,
		default: 'rgba(255, 255, 255, 0.8)',
	},
	// 上边距
	marginTop: {
		type: [Number, String],
		default: 0,
	},
	//下边距
	marginBottom: {
		type: [Number, String],
		default: 0,
	},
	// 左右边距
	marginLeftRight: {
		type: [Number, String],
		default: 0,
	},
});

const emit = defineEmits(['click', 'change']);
const mCurrent = ref<number | string>(props.current); // 当前活跃的swiper-item的index

// 如果外部的list发生变化，判断长度是否被修改，如果前后长度不一致，重置mCurrent值，避免溢出
watch(
	() => props.list,
	(nVal, oVal) => {
		if (nVal.length !== oVal.length) mCurrent.value = 0;
	}
);

// 监听外部current的变化，实时修改内部依赖于此测mCurrent值，如果更新了current，而不是更新mCurrent，
// 就会错乱，因为指示器是依赖于mCurrent的
watch(
	() => props.current,
	(n) => {
		mCurrent.value = n;
	}
);

const justifyContent = computed(() => {
	if (props.indicatorPos == 'topLeft' || props.indicatorPos == 'bottomLeft') return 'flex-start';
	if (props.indicatorPos == 'topCenter' || props.indicatorPos == 'bottomCenter') return 'center';
	if (props.indicatorPos == 'topRight' || props.indicatorPos == 'bottomRight') return 'flex-end';
});

const titlePaddingBottom = computed(() => {
	let tmp = 0;
	if (props.mode == 'none') return '12rpx';
	if (['bottomLeft', 'bottomCenter', 'bottomRight'].indexOf(props.indicatorPos) >= 0 && props.mode == 'number') {
		tmp = '60rpx';
	} else if (['bottomLeft', 'bottomCenter', 'bottomRight'].indexOf(props.indicatorPos) >= 0 && props.mode != 'number') {
		tmp = '40rpx';
	} else {
		tmp = '12rpx';
	}
	return tmp;
});

// 因为uni的swiper组件的current参数只接受Number类型，这里做一个转换

const elCurrent = computed(() => Number(props.current));

function listClick(index: number) {
	emit('click', index);
}
function change(e: number) {
	let current = e.detail.current;
	mCurrent.value = current;
	// 发出change事件，表示当前自动切换的index，从0开始
	emit('change', current);
}
// 头条小程序不支持animationfinish事件，改由change事件
// 暂不监听此事件，因为不再给swiper绑定mCurrent属性
function animationfinish(e: number) {
	// #ifndef MP-TOUTIAO
	mCurrent.value = e.detail.current;
	// #endif
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-swiper-wrap {
	position: relative;
	overflow: hidden;
	transform: translateY(0);
}

.dz-swiper-image {
	width: 100%;
	will-change: transform;
	height: 100%;
	/* #ifndef APP-NVUE */
	display: block;
	/* #endif */
	/* #ifdef H5 */
	pointer-events: none;
	/* #endif */
}

.dz-swiper-indicator-container {
	padding: 0 24rpx;
	position: absolute;
	@include flex;
	width: 100%;
	z-index: 1;
}

.dz-indicator-item-rect {
	width: 26rpx;
	height: 8rpx;
	margin: 0 6rpx;
	transition: all 0.5s;
	background-color: rgba(0, 0, 0, 0.3);
}

.dz-indicator-item-rect-active {
	background-color: rgba(255, 255, 255, 0.8);
}

.dz-indicator-item-line {
	width: 26rpx;
	height: 6rpx;
	transition: all 0.5s;

	background-color: rgba(0, 0, 0, 0.3);
}

.dz-indicator-item-line-active {
	border-radius: 3rpx;
	background-color: rgba(255, 255, 255, 0.8);
}

.dz-indicator-item-dot {
	width: 14rpx;
	height: 14rpx;
	margin: 0 6rpx;
	border-radius: 20rpx;
	transition: all 0.5s;
	background-color: rgba(0, 0, 0, 0.3);
}

.dz-indicator-item-dot-active {
	background-color: rgba(255, 255, 255, 0.8);
}

.dz-indicator-item-round {
	width: 14rpx;
	height: 14rpx;
	margin: 0 6rpx;
	border-radius: 20rpx;
	transition: all 0.5s;
	background-color: rgba(0, 0, 0, 0.3);
}

.dz-indicator-item-round-active {
	width: 34rpx;
	background-color: rgba(255, 255, 255, 0.8);
}

.dz-indicator-item-number {
	padding: 6rpx 16rpx;
	line-height: 1;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 100rpx;
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.8);
}

.dz-indicator-line-box {
}

.dz-list-scale {
	transform-origin: center center;
}

.dz-list-image-wrap {
	width: 100%;
	height: 100%;
	flex: 1;
	transition: all 0.5s;
	overflow: hidden;
	box-sizing: content-box;
	position: relative;
}

.dz-swiper-title {
	position: absolute;
	background-color: rgba(0, 0, 0, 0.3);
	bottom: 0;
	left: 0;
	width: 100%;
	font-size: 28rpx;
	padding: 12rpx 24rpx;
	color: rgba(255, 255, 255, 0.9);
}

.dz-swiper-item {
	@include flex;
	overflow: hidden;
	align-items: center;
}
</style>

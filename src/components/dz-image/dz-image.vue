<template>
	<view class="dz-image" @tap="onClick" :style="[wrapStyle, backgroundStyle]">
		<image
			v-if="!isError"
			:src="src"
			:mode="mode"
			@error="onErrorHandler"
			@load="onLoadHandler"
			:lazy-load="lazyLoad"
			class="dz-image__image"
			:show-menu-by-longpress="showMenuByLongpress"
			:style="{
				borderRadius: shape == 'circle' ? '50%' : api.addUnit(borderRadius),
			}"
		></image>
		<view
			v-if="showLoading && loading"
			class="dz-flex dz-image__loading"
			:style="{
				borderRadius: shape == 'circle' ? '50%' : api.addUnit(borderRadius),
				backgroundColor: bgColor,
			}"
		>
			<slot v-if="$slots.loading" name="loading" />
			<dz-icon v-else :name="loadingIcon" :width="width" :height="height"></dz-icon>
		</view>
		<view
			v-if="showError && isError && !loading"
			class="dz-flex dz-image__error"
			:style="{
				borderRadius: shape == 'circle' ? '50%' : api.addUnit(borderRadius),
			}"
		>
			<slot v-if="$slots.error" name="error" />
			<dz-icon v-else :name="errorIcon" :width="width" :height="height"></dz-icon>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue';

const props = defineProps({
	// 图片地址
	src: {
		type: String,
		default: '',
	},
	// 裁剪模式
	mode: {
		type: String,
		default: 'aspectFill',
	},
	// 宽度，单位任意
	width: {
		type: [String, Number],
		default: '100%',
	},
	// 高度，单位任意
	height: {
		type: [String, Number],
		default: 'auto',
	},
	// 图片形状，circle-圆形，square-方形
	shape: {
		type: String,
		default: 'square',
	},
	// 圆角，单位任意
	borderRadius: {
		type: [String, Number],
		default: 0,
	},
	// 是否懒加载，微信小程序、App、百度小程序、字节跳动小程序
	lazyLoad: {
		type: Boolean,
		default: true,
	},
	// 开启长按图片显示识别微信小程序码菜单
	showMenuByLongpress: {
		type: Boolean,
		default: true,
	},
	// 加载中的图标，或者小图片
	loadingIcon: {
		type: String,
		default: '',
	},
	// 加载失败的图标，或者小图片
	errorIcon: {
		type: String,
		default: 'picfill',
	},
	// 是否显示加载中的图标或者自定义的slot
	showLoading: {
		type: Boolean,
		default: true,
	},
	// 是否显示加载错误的图标或者自定义的slot
	showError: {
		type: Boolean,
		default: true,
	},
	// 是否需要淡入效果
	fade: {
		type: Boolean,
		default: true,
	},
	// 只支持网络资源，只对微信小程序有效
	webp: {
		type: Boolean,
		default: false,
	},
	// 过渡时间，单位ms
	duration: {
		type: [String, Number],
		default: 500,
	},
	// 背景颜色，用于深色页面加载图片时，为了和背景色融合
	bgColor: {
		type: String,
		default: '#f8f8f8',
	},
	// 自定义样式，对象形式
	customStyle: {
		type: Object,
		default() {
			return {};
		},
	},
});
const emits = defineEmits(['error', 'click', 'load']);

// 图片是否加载错误，如果是，则显示错误占位图
const isError = ref<Boolean>(false);
// 初始化组件时，默认为加载中状态
const loading = ref<Boolean>(true);
// 不透明度，为了实现淡入淡出的效果
const opacity = ref<Number>(1);
// 过渡时间，因为props的值无法修改，故需要一个中间值
const durationTime = ref<Number>(props.duration);
// 图片加载完成时，去掉背景颜色，因为如果是png图片，就会显示灰色的背景
const backgroundStyle = reactive({});

watch(
	() => props.src,
	(n) => {
		if (!n) {
			// 如果传入null或者''，或者false，或者undefined，标记为错误状态
			isError.value = true;
			loading.value = false;
		} else {
			isError.value = false;
			loading.value = true;
		}
	},
	{ immediate: true }
);

const wrapStyle = computed((): CSSProperties => {
	let style = {};
	// 通过调用addUnit()方法，如果有单位，如百分比，px单位等，直接返回，如果是纯粹的数值，则加上rpx单位
	style.width = uni.$api.addUnit(props.width);
	style.height = uni.$api.addUnit(props.height);
	// 如果是配置了圆形，设置50%的圆角，否则按照默认的配置值
	style.borderRadius = props.shape == 'circle' ? '50%' : uni.$api.addUnit(props.borderRadius);
	// 如果设置圆角，必须要有hidden，否则可能圆角无效
	style.overflow = props.borderRadius > 0 ? 'hidden' : 'visible';
	if (props.fade) {
		style.opacity = opacity.value;
		style.transition = `opacity ${Number(props.duration) / 1000}s ease-in-out`;
	}
	style = Object.assign(style, props.customStyle);
	return style;
});

// 点击图片
function onClick() {
	emits('click');
}

// 图片加载失败
function onErrorHandler() {
	loading.value = false;
	isError.value = true;
	emits('error');
}

// 图片加载完成，标记loading结束
function onLoadHandler() {
	loading.value = false;
	isError.value = false;
	emits('load');
	// 如果不需要动画效果，就不执行下方代码，同时移除加载时的背景颜色
	// 否则无需fade效果时，png图片依然能看到下方的背景色
	if (!props.fade) return removeBgColor();
	// 原来opacity为1(不透明，是为了显示占位图)，改成0(透明，意味着该元素显示的是背景颜色，默认的灰色)，再改成1，是为了获得过渡效果
	opacity.value = 0;
	// 这里设置为0，是为了图片展示到背景全透明这个过程时间为0，延时之后延时之后重新设置为duration，是为了获得背景透明(灰色)
	// 到图片展示的过程中的淡入效果
	durationTime.value = 0;
	// 延时50ms，否则在浏览器H5，过渡效果无效
	setTimeout(() => {
		durationTime.value = props.duration;
		opacity.value = 1;
		setTimeout(() => {
			removeBgColor();
		}, durationTime.value);
	}, 50);
}
// 移除图片的背景色
function removeBgColor() {
	// 淡入动画过渡完成后，将背景设置为透明色，否则png图片会看到灰色的背景
	backgroundStyle.backgroundColor = 'transparent';
}
</script>

<style scoped lang="scss">
.dz-image {
	position: relative;
	transition: opacity 0.5s ease-in-out;

	&__image {
		width: 100%;
		height: 100%;
	}

	&__loading,
	&__error {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		background-color: #f3f4f6;
		color: #333;
		font-size: 46rpx;
	}
}
</style>

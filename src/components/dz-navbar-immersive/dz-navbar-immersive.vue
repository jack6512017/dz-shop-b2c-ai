<template>
	<view
		class="dz-navigation-bar"
		:class="{
			'dz-bar-line': opacity > 0.85 && splitLine,
			'dz-navbar-fixed': isFixed,
			'dz-backdrop__filter': backdropFilter,
		}"
		:style="[navbarStyle]"
	>
		<view class="dz-status-bar" :style="{ height: statusBarHeight + 'px' }" v-if="isImmersive"></view>
		<view
			class="dz-navigation_bar-title"
			:style="{
				opacity: opacity,
				color: color,
				paddingTop: top - statusBarHeight + 'px',
			}"
			v-if="title && !isCustom"
			>{{ title }}</view
		>
		<slot></slot>
	</view>
</template>

<script lang="ts">
// #ifdef MP-WEIXIN
export default { options: { virtualHost: true } };
// #endif
</script>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 导航栏高度，单位px，非rpx
	height: {
		type: [String, Number],
		default: 44,
	},
	//NavigationBar标题
	title: {
		type: String,
		default: '',
	},
	//NavigationBar标题颜色
	color: {
		type: String,
		default: '#333',
	},
	//NavigationBar背景颜色,不支持rgb
	backgroundColor: {
		type: String,
		default: '#fff',
	},
	//是否需要分割线
	splitLine: {
		type: Boolean,
		default: false,
	},
	//是否设置不透明度
	isOpacity: {
		type: Boolean,
		default: true,
	},
	//不透明度最大值 0-1
	maxOpacity: {
		type: [Number, String],
		default: 1,
	},
	//滚动条滚动距离
	scrollTop: {
		type: [Number, String],
		default: 0,
	},
	/*
			 isOpacity 为true时生效
			 opacity=scrollTop /windowWidth * scrollRatio
			*/
	scrollRatio: {
		type: [Number, String],
		default: 0.3,
	},
	//是否自定义header内容
	isCustom: {
		type: Boolean,
		default: false,
	},
	//是否沉浸式
	isImmersive: {
		type: Boolean,
		default: true,
	},
	isFixed: {
		type: Boolean,
		default: true,
	},
	//是否开启高斯模糊效果[仅在支持的浏览器有效果]
	backdropFilter: {
		type: Boolean,
		default: false,
	},
	//下拉隐藏NavigationBar，主要针对有回弹效果ios端
	dropDownHide: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['init', 'change']);

//header宽度
const width = ref<number>(375);
//小程序端 左侧距胶囊按钮距离
const left = ref<number>(375);
const top = ref<number>(0);
//滚动总高度,计算opacity
const scrollH = ref<number>(1);
//0-1
const opacity = ref<number>(1);
//状态栏高度
const statusBarHeight = ref<number>(1);
//header背景色
const background = ref<string>('255,255,255');
const dropDownOpacity = ref<number>(0);

watch(
	() => props.scrollTop,
	() => {
		if (props.isOpacity) {
			opacityChange();
		}
	}
);

watch(
	() => props.backgroundColor,
	(val) => {
		if (val) {
			background.value = hexToRgb(val);
		}
	}
);

//header高度
const navbarHeight = computed(() => {
	return props.height + statusBarHeight.value;
});

// 整个导航栏的样式
const navbarStyle = computed((): CSSProperties => {
	let style = {};
	style.height = navbarHeight.value + 'px';
	style.backgroundColor = `rgba(${background.value},${opacity.value})`;
	style.opacity = dropDownOpacity.value;
	return style;
});

onMounted(() => {
	opacity.value = props.isOpacity ? 0 : props.maxOpacity;
	let obj = {};
	// #ifdef MP-WEIXIN
	obj = wx.getMenuButtonBoundingClientRect();
	// #endif
	// #ifdef MP-BAIDU
	obj = swan.getMenuButtonBoundingClientRect();
	// #endif
	// #ifdef MP-ALIPAY
	my.hideAddToDesktopMenu();
	// #endif
	uni.getSystemInfo({
		success: (res) => {
			statusBarHeight.value = res.statusBarHeight;
			width.value = res.windowWidth;
			left.value = obj.left || res.windowWidth;
			if (props.isImmersive) {
				navbarHeight.value = obj.top ? obj.top + obj.height + 8 : res.statusBarHeight + 44;
			}
			scrollH.value = res.windowWidth * props.scrollRatio;
			top.value = obj.top ? obj.top + (obj.height - 32) / 2 : res.statusBarHeight + 6;
			emit('init', {
				width: width.value,
				height: navbarHeight.value,
				left: left.value,
				top: top.value,
				statusBarHeight: statusBarHeight.value,
				opacity: opacity.value,
			});
		},
	});
});

function hexToRgb(hex: string): string {
	let rgb = '255,255,255';
	if (hex && ~hex.indexOf('#')) {
		if (hex.length === 4) {
			let text = hex.substring(1, 4);
			hex = '#' + text + text;
		}
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (result) {
			rgb = `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
		}
	}
	return rgb;
}

function opacityChange() {
	if (props.dropDownHide) {
		if (props.scrollTop < 0) {
			if (dropDownOpacity.value > 0) {
				dropDownOpacity.value = 1 - Math.abs(props.scrollTop) / 20;
			}
		} else {
			dropDownOpacity.value = 1;
		}
	}
	let scroll = props.scrollTop <= 1 ? 0 : props.scrollTop;
	let _opacity = scroll / scrollH.value;
	if ((opacity.value >= props.maxOpacity && _opacity >= props.maxOpacity) || (opacity.value == 0 && _opacity == 0)) {
		return;
	}
	opacity.value = _opacity > props.maxOpacity ? props.maxOpacity : _opacity;
	dropDownOpacity.value = opacity.value;
	emit('change', {
		opacity: opacity.value,
	});
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-navigation-bar {
	width: 100%;
	transition: opacity 0.4s;
}
.dz-backdrop__filter {
	/* Safari for macOS & iOS */
	-webkit-backdrop-filter: blur(15px);
	/* Google Chrome */
	backdrop-filter: blur(15px);
}

.dz-navbar-fixed {
	position: fixed;
	left: 0;
	top: 0;
	z-index: 991;
}

.dz-status-bar {
	width: 100%;
}

.dz-navigation_bar-title {
	width: 100%;
	font-size: 17px;
	line-height: 17px;
	/* #ifndef APP-PLUS */
	font-weight: 500;
	/* #endif */
	height: 32px;
	@include flex;
	align-items: center;
	justify-content: center;
}

.dz-bar-line::after {
	content: '';
	position: absolute;
	border-bottom: 1rpx solid #eaeef1;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	bottom: 0;
	right: 0;
	left: 0;
}
</style>

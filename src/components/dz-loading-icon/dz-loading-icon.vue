<template>
	<view class="dz-loading-icon" :class="[vertical && 'dz-loading-icon--vertical']" v-if="show">
		<view
			v-if="!webviewHide"
			class="dz-loading-icon__spinner"
			:class="[`dz-loading-icon__spinner--${mode}`]"
			ref="ani"
			:style="{
				color: color,
				width: addUnit(size, 'px'),
				height: addUnit(size, 'px'),
				borderTopColor: color,
				borderBottomColor: otherBorderColor,
				borderLeftColor: otherBorderColor,
				borderRightColor: otherBorderColor,
				'animation-duration': `${duration}ms`,
				'animation-timing-function': mode === 'semicircle' || mode === 'circle' ? timingFunction : '',
			}"
		>
			<block v-if="mode === 'spinner'">
				<!-- #ifndef APP-NVUE -->
				<view v-for="(item, index) in array12" :key="index" class="dz-loading-icon__dot"> </view>
				<!-- #endif -->
				<!-- #ifdef APP-NVUE -->
				<!-- 此组件内部图标部分无法设置宽高，即使通过width和height配置了也无效 -->
				<loading-indicator
					v-if="!webviewHide"
					class="dz-loading-indicator"
					:animating="true"
					:style="{
						color: color,
						width: addUnit(size),
						height: addUnit(size),
					}"
				/>
				<!-- #endif -->
			</block>
		</view>
		<text
			v-if="text"
			class="dz-loading-icon__text"
			:style="{
				fontSize: addUnit(textSize),
				color: textColor,
			}"
			>{{ text }}</text
		>
	</view>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, unref } from 'vue';
import { isNumber } from '@/utils/is';

const props = defineProps({
	// 是否显示组件
	show: {
		type: Boolean,
		default: true,
	},
	// 颜色
	color: {
		type: String,
		default: '#909399',
	},
	// 提示文字颜色
	textColor: {
		type: String,
		default: '#909399',
	},
	// 文字和图标是否垂直排列
	vertical: {
		type: Boolean,
		default: false,
	},
	// 模式选择，circle-圆形，spinner-花朵形，semicircle-半圆形
	mode: {
		type: String,
		default: 'spinner',
	},
	// 图标大小，单位默认px
	size: {
		type: [String, Number],
		default: 24,
	},
	// 文字大小
	textSize: {
		type: [String, Number],
		default: 15,
	},
	// 文字内容
	text: {
		type: [String, Number],
		default: '',
	},
	// 动画模式
	timingFunction: {
		type: String,
		default: 'ease-in-out',
	},
	// 动画执行周期时间
	duration: {
		type: [String, Number],
		default: 1200,
	},
	// mode=circle时的暗边颜色
	inactiveColor: {
		type: String,
		default: '',
	},
});

// #ifdef APP-NVUE
const animation = weex.requireModule('animation');
// #endif

// Array.form可以通过一个伪数组对象创建指定长度的数组
const array12 = Array.from({
	length: 12,
});
// 这里需要设置默认值为360，否则在安卓nvue上，会延迟一个duration周期后才执行
// 在iOS nvue上，则会一开始默认执行两个周期的动画
const aniAngel = ref<Number>(360); // 动画旋转角度
const webviewHide = ref<Boolean>(false); // 监听webview的状态，如果隐藏了页面，则停止动画，以免性能消耗
const loading = ref<Boolean>(false); // 是否运行中，针对nvue使用

// 当为circle类型时，给其另外三边设置一个更轻一些的颜色
// 之所以需要这么做的原因是，比如父组件传了color为红色，那么需要另外的三个边为浅红色
// 而不能是固定的某一个其他颜色(因为这个固定的颜色可能浅蓝，导致效果没有那么细腻良好)
function otherBorderColor() {
	const lightColor = colorGradient(props.color, '#ffffff', 100)[80];
	if (props.mode === 'circle') {
		return props.inactiveColor ? props.inactiveColor : lightColor;
	} else {
		return 'transparent';
	}
}

watch(
	() => props.show,
	(n) => {
		// nvue中，show为true，且为非loading状态，就重新执行动画模块
		// #ifdef APP-NVUE
		if (n && !loading.value) {
			setTimeout(() => {
				startAnimate();
			}, 30);
		}
		// #endif
	}
);

onMounted(() => {
	init();
});

function init() {
	setTimeout(() => {
		// #ifdef APP-NVUE
		props.show && nvueAnimate();
		// #endif
		// #ifdef APP-PLUS
		props.show && addEventListenerToWebview();
		// #endif
	}, 20);
}

// 监听webview的显示与隐藏
function addEventListenerToWebview() {
	// webview的堆栈
	const pages = getCurrentPages();
	// 当前页面
	const page = pages[pages.length - 1];
	// 当前页面的webview实例
	const currentWebview = page.$getAppWebview();
	// 监听webview的显示与隐藏，从而停止或者开始动画(为了性能)
	currentWebview.addEventListener('hide', () => {
		webviewHide.value = true;
	});
	currentWebview.addEventListener('show', () => {
		webviewHide.value = false;
	});
}

// #ifdef APP-NVUE
function nvueAnimate() {
	// nvue下，非spinner类型时才需要旋转，因为nvue的spinner类型，使用了weex的
	// loading-indicator组件，自带旋转功能
	props.mode !== 'spinner' && startAnimate();
}

// 执行nvue的animate模块动画
function startAnimate() {
	loading.value = true;
	const ani = ref(null);
	if (!unref(ani)) return;
	animation.transition(
		unref(ani),
		{
			// 进行角度旋转
			styles: {
				transform: `rotate(${aniAngel.value}deg)`,
				transformOrigin: 'center center',
			},
			duration: props.duration,
			timingFunction: props.timingFunction,
			// delay: 10
		},
		() => {
			// 每次增加360deg，为了让其重新旋转一周
			aniAngel.value += 360;
			// 动画结束后，继续循环执行动画，需要同时判断webviewHide变量
			// nvue安卓，页面隐藏后依然会继续执行startAnimate方法
			props.show && !webviewHide.value ? startAnimate() : (loading.value = false);
		}
	);
}
// #endif

// 添加单位，如果有rpx，%，px等单位结尾或者值为auto，直接返回，否则加上rpx单位结尾
function addUnit(value = 'auto', unit = 'rpx') {
	// 用内置验证规则中的isNumber判断是否为数值
	return isNumber(value) ? `${value}${unit}` : value;
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';
$dz-loading-icon-color: #c8c9cc !default;
$dz-loading-icon-text-margin-left: 4px !default;
$dz-loading-icon-text-color: #606266 !default;
$dz-loading-icon-text-font-size: 14px !default;
$dz-loading-icon-text-line-height: 20px !default;
$dz-loading-width: 30px !default;
$dz-loading-height: 30px !default;
$dz-loading-max-width: 100% !default;
$dz-loading-max-height: 100% !default;
$dz-loading-semicircle-border-width: 2px !default;
$dz-loading-semicircle-border-color: transparent !default;
$dz-loading-semicircle-border-top-right-radius: 100px !default;
$dz-loading-semicircle-border-top-left-radius: 100px !default;
$dz-loading-semicircle-border-bottom-left-radius: 100px !default;
$dz-loading-semicircle-border-bottom-right-radiu: 100px !default;
$dz-loading-semicircle-border-style: solid !default;
$dz-loading-circle-border-top-right-radius: 100px !default;
$dz-loading-circle-border-top-left-radius: 100px !default;
$dz-loading-circle-border-bottom-left-radius: 100px !default;
$dz-loading-circle-border-bottom-right-radiu: 100px !default;
$dz-loading-circle-border-width: 2px !default;
$dz-loading-circle-border-top-color: #e5e5e5 !default;
$dz-loading-circle-border-right-color: $dz-loading-circle-border-top-color !default;
$dz-loading-circle-border-bottom-color: $dz-loading-circle-border-top-color !default;
$dz-loading-circle-border-left-color: $dz-loading-circle-border-top-color !default;
$dz-loading-circle-border-style: solid !default;
$dz-loading-icon-host-font-size: 0px !default;
$dz-loading-icon-host-line-height: 1 !default;
$dz-loading-icon-vertical-margin: 6px 0 0 !default;
$dz-loading-icon-dot-top: 0 !default;
$dz-loading-icon-dot-left: 0 !default;
$dz-loading-icon-dot-width: 100% !default;
$dz-loading-icon-dot-height: 100% !default;
$dz-loading-icon-dot-before-width: 2px !default;
$dz-loading-icon-dot-before-height: 25% !default;
$dz-loading-icon-dot-before-margin: 0 auto !default;
$dz-loading-icon-dot-before-background-color: currentColor !default;
$dz-loading-icon-dot-before-border-radius: 40% !default;

.dz-loading-icon {
	/* #ifndef APP-NVUE */
	// display: inline-flex;
	/* #endif */
	flex-direction: row;
	align-items: center;
	justify-content: center;
	color: $dz-loading-icon-color;

	&__text {
		margin-left: $dz-loading-icon-text-margin-left;
		color: $dz-loading-icon-text-color;
		font-size: $dz-loading-icon-text-font-size;
		line-height: $dz-loading-icon-text-line-height;
	}

	&__spinner {
		width: $dz-loading-width;
		height: $dz-loading-height;
		position: relative;
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		max-width: $dz-loading-max-width;
		max-height: $dz-loading-max-height;
		animation: dz-rotate 1s linear infinite;
		/* #endif */
	}

	&__spinner--semicircle {
		border-width: $dz-loading-semicircle-border-width;
		border-color: $dz-loading-semicircle-border-color;
		border-top-right-radius: $dz-loading-semicircle-border-top-right-radius;
		border-top-left-radius: $dz-loading-semicircle-border-top-left-radius;
		border-bottom-left-radius: $dz-loading-semicircle-border-bottom-left-radius;
		border-bottom-right-radius: $dz-loading-semicircle-border-bottom-right-radiu;
		border-style: $dz-loading-semicircle-border-style;
	}

	&__spinner--circle {
		border-top-right-radius: $dz-loading-circle-border-top-right-radius;
		border-top-left-radius: $dz-loading-circle-border-top-left-radius;
		border-bottom-left-radius: $dz-loading-circle-border-bottom-left-radius;
		border-bottom-right-radius: $dz-loading-circle-border-bottom-right-radiu;
		border-width: $dz-loading-circle-border-width;
		border-top-color: $dz-loading-circle-border-top-color;
		border-right-color: $dz-loading-circle-border-right-color;
		border-bottom-color: $dz-loading-circle-border-bottom-color;
		border-left-color: $dz-loading-circle-border-left-color;
		border-style: $dz-loading-circle-border-style;
	}

	&--vertical {
		flex-direction: column;
	}
}

/* #ifndef APP-NVUE */
:host {
	font-size: $dz-loading-icon-host-font-size;
	line-height: $dz-loading-icon-host-line-height;
}

.dz-loading-icon {
	&__spinner--spinner {
		animation-timing-function: steps(12);
	}

	&__text:empty {
		display: none;
	}

	&--vertical &__text {
		margin: $dz-loading-icon-vertical-margin;
		color: #606266;
	}

	&__dot {
		position: absolute;
		top: $dz-loading-icon-dot-top;
		left: $dz-loading-icon-dot-left;
		width: $dz-loading-icon-dot-width;
		height: $dz-loading-icon-dot-height;

		&:before {
			display: block;
			width: $dz-loading-icon-dot-before-width;
			height: $dz-loading-icon-dot-before-height;
			margin: $dz-loading-icon-dot-before-margin;
			background-color: $dz-loading-icon-dot-before-background-color;
			border-radius: $dz-loading-icon-dot-before-border-radius;
			content: ' ';
		}
	}
}

@for $i from 1 through 12 {
	.dz-loading-icon__dot:nth-of-type(#{$i}) {
		transform: rotate($i * 30deg);
		opacity: 1 - 0.0625 * ($i - 1);
	}
}

@keyframes dz-rotate {
	0% {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(1turn);
	}
}

/* #endif */
</style>

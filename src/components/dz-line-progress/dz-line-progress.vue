<template>
	<view
		class="dz-progress"
		:style="{
			borderRadius: round ? '100rpx' : 0,
			height: height + 'rpx',
			backgroundColor: inactiveColor,
		}"
	>
		<view
			:class="[type ? `dz-type-${type}-bg` : '', striped ? 'dz-striped' : '', striped && stripedActive ? 'dz-striped-active' : '']"
			class="dz-active"
			:style="[progressStyle]"
		>
			<slot v-if="$slots.default || $slots.$default" />
			<block v-else-if="showPercent">
				{{ percent + '%' }}
			</block>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CSSProperties } from 'vue';

/**
 * lineProgress 线型进度条
 * @description 展示操作或任务的当前进度，比如上传文件，是一个线形的进度条。
 * @property {String Number} percent 进度条百分比值，为数值类型，0-100
 * @property {Boolean} round 进度条两端是否为半圆（默认true）
 * @property {String} type 如设置，active-color值将会失效
 * @property {String} active-color 进度条激活部分的颜色（默认#19be6b）
 * @property {String} inactive-color 进度条的底色（默认#ececec）
 * @property {Boolean} show-percent 是否在进度条内部显示当前的百分比值数值（默认true）
 * @property {String Number} height 进度条的高度，单位rpx（默认28）
 * @property {Boolean} striped 是否显示进度条激活部分的条纹（默认false）
 * @property {Boolean} striped-active 条纹是否具有动态效果（默认false）
 * @example <dz-line-progress :percent="70" :show-percent="true"></dz-line-progress>
 */

const props = defineProps({
	// 两端是否显示半圆形
	round: {
		type: Boolean,
		default: true,
	},
	// 主题颜色
	type: {
		type: String,
		default: '',
	},
	// 激活部分的颜色
	activeColor: {
		type: String,
		default: '#19be6b',
	},
	inactiveColor: {
		type: String,
		default: '#ececec',
	},
	// 进度百分比，数值
	percent: {
		type: Number,
		default: 0,
	},
	// 是否在进度条内部显示百分比的值
	showPercent: {
		type: Boolean,
		default: true,
	},
	// 进度条的高度，单位rpx
	height: {
		type: [Number, String],
		default: 28,
	},
	// 是否显示条纹
	striped: {
		type: Boolean,
		default: false,
	},
	// 条纹是否显示活动状态
	stripedActive: {
		type: Boolean,
		default: false,
	},
});

const progressStyle = computed((): CSSProperties => {
	let style = {};
	style.width = props.percent + '%';
	if (props.activeColor) style.backgroundColor = props.activeColor;
	return style;
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-progress {
	overflow: hidden;
	height: 15px;
	/* #ifndef APP-NVUE */
	display: inline-flex;
	/* #endif */
	align-items: center;
	width: 100%;
	border-radius: 100rpx;
}

.dz-active {
	width: 0;
	height: 100%;
	align-items: center;
	@include flex;
	justify-items: flex-end;
	justify-content: space-around;
	font-size: 20rpx;
	color: #ffffff;
	transition: all 0.4s ease;
}

.dz-striped {
	background-image: linear-gradient(
		45deg,
		rgba(255, 255, 255, 0.15) 25%,
		transparent 25%,
		transparent 50%,
		rgba(255, 255, 255, 0.15) 50%,
		rgba(255, 255, 255, 0.15) 75%,
		transparent 75%,
		transparent
	);
	background-size: 39px 39px;
}

.dz-striped-active {
	animation: progress-stripes 2s linear infinite;
}

@keyframes progress-stripes {
	0% {
		background-position: 0 0;
	}

	100% {
		background-position: 39px 0;
	}
}
</style>

<!-- <template>
	<view class="u-line-progress" :style="[api.addStyle(customStyle)]">
		
		<view
			class="u-line-progress__background"
			ref="lineProgressRef"
			:style="[
				{
					backgroundColor: inactiveColor,
					height: api.addUnit(height)
				}
			]"
		></view>
		
		<view class="u-line-progress__line" :style="[progressStyle]">
			<slot>
				<text v-if="showText && percentage >= 10" class="u-line-progress__text">{{ innserPercentage + '%' }}</text>
			</slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, watch, computed, unref, getCurrentInstance, onMounted } from 'vue';

const props = defineProps({
	// 激活部分的颜色
	activeColor: {
	    type: String,
	    default: '#19be6b',
	},
	inactiveColor: {
	    type: String,
	    default: '#ececec',
	},
	// 进度百分比，数值
	percentage: {
	    type: [String, Number],
	    default:  0,
	},
	// 是否在进度条内部显示百分比的值
	showText: {
	    type: Boolean,
	    default: true,
	},
	// 进度条的高度，单位rpx
	height: {
	    type: [String, Number],
	    default: 24
	},
	customStyle: {
	  type: [Object, String],
	  default: () => ({}),
	},
})

	// #ifdef APP-NVUE
	const dom = uni.requireNativePlugin('dom')
	// #endif
	/**
	 * lineProgress 线型进度条
	 * @description 展示操作或任务的当前进度，比如上传文件，是一个线形的进度条。
	 * @tutorial https://www.uviewui.com/components/lineProgress.html
	 * @property {String}			activeColor		激活部分的颜色 ( 默认 '#19be6b' )
	 * @property {String}			inactiveColor	背景色 ( 默认 '#ececec' )
	 * @property {String | Number}	percentage		进度百分比，数值 ( 默认 0 )
	 * @property {Boolean}			showText		是否在进度条内部显示百分比的值 ( 默认 true )
	 * @property {String | Number}	height			进度条的高度，单位px ( 默认 12 )
	 *
	 * @example <u-line-progress :percent="70" :show-percent="true"></u-line-progress>
	 */

		const lineWidth  = ref<number>(0);

const lineProgressRef = ref(null)
 const proxy = getCurrentInstance()?.proxy ?? null;

	watch(()=>props.percentage, ()=>{
		resizeProgressWidth();
	})




const progressStyle = computed(()=>{
	let style = {}
	style.width = lineWidth.value
	style.backgroundColor = props.activeColor
	style.height = uni.$api.addUnit(props.height)
	return style
})


const innserPercentage = computed(()=>{
	// 控制范围在0-100之间
	return uni.$api.range(0, 100, props.percentage)
})




onMounted(()=>{
	init()
})





		function init() {
				uni.$api.sleep(20).then(() => {
					resizeProgressWidth()
				})
			}

		function	getProgressWidth() {
				// #ifndef APP-NVUE
				return uni.$api.getRect('.u-line-progress__background', false, proxy)
				// #endif

				// #ifdef APP-NVUE
				// 返回一个promise
				return new Promise(resolve => {
					dom.getComponentRect(unref(lineProgressRef)], (res) => {
						resolve(res.size)
					})
				})
				// #endif
			}

			function resizeProgressWidth() {
			getProgressWidth().then(size => {
					const {
						width
					} = size
					// 通过设置的percentage值，计算其所占总长度的百分比
					lineWidth.value = width * innserPercentage.value / 100 + 'px'
				})
			}
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.u-line-progress {
	align-items: stretch;
	position: relative;
	@include flex;
	flex: 1;
	overflow: hidden;
	border-radius: 100px;

	&__background {
		background-color: #ececec;
		border-radius: 100px;
		flex: 1;
	}

	&__line {
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		align-items: center;
		@include flex;
		color: #ffffff;
		border-radius: 100px;
		transition: width 0.5s ease;
		justify-content: flex-end;
	}

	&__text {
		font-size: 10px;
		align-items: center;
		text-align: right;
		color: #ffffff;
		margin-right: 5px;
		transform: scale(0.9);
	}
}
</style>
 -->

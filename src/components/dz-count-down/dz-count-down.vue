<template>
	<view class="dz-countdown">
		<view class="dz-countdown-item" :style="[itemStyle]" v-if="showDays && (hideZeroDay || (!hideZeroDay && d != '00'))">
			<view class="dz-countdown-time" :style="[letterStyle]">
				{{ d }}
			</view>
		</view>
		<view
			class="dz-countdown-colon"
			:style="{
				fontSize: separatorSize + 'rpx',
				color: separatorColor,
				paddingBottom: separator == 'colon' ? '4rpx' : 0,
			}"
			v-if="showDays && (hideZeroDay || (!hideZeroDay && d != '00'))"
		>
			{{ separator == 'colon' ? ':' : '天' }}
		</view>
		<view class="dz-countdown-item" :style="[itemStyle]" v-if="showHours">
			<view class="dz-countdown-time" :style="{ fontSize: fontSize + 'rpx', color: color }">
				{{ h }}
			</view>
		</view>
		<view
			class="dz-countdown-colon"
			:style="{
				fontSize: separatorSize + 'rpx',
				color: separatorColor,
				paddingBottom: separator == 'colon' ? '4rpx' : 0,
			}"
			v-if="showHours"
		>
			{{ separator == 'colon' ? ':' : '时' }}
		</view>
		<view class="dz-countdown-item" :style="[itemStyle]" v-if="showMinutes">
			<view class="dz-countdown-time" :style="{ fontSize: fontSize + 'rpx', color: color }">
				{{ i }}
			</view>
		</view>
		<view
			class="dz-countdown-colon"
			:style="{
				fontSize: separatorSize + 'rpx',
				color: separatorColor,
				paddingBottom: separator == 'colon' ? '4rpx' : 0,
			}"
			v-if="showMinutes"
		>
			{{ separator == 'colon' ? ':' : '分' }}
		</view>
		<view class="dz-countdown-item" :style="[itemStyle]" v-if="showSeconds">
			<view class="dz-countdown-time" :style="{ fontSize: fontSize + 'rpx', color: color }">
				{{ s }}
			</view>
		</view>
		<view
			class="dz-countdown-colon"
			:style="{
				fontSize: separatorSize + 'rpx',
				color: separatorColor,
				paddingBottom: separator == 'colon' ? '4rpx' : 0,
			}"
			v-if="showSeconds && separator == 'zh'"
		>
			秒
		</view>
	</view>
</template>

<script lang="ts" setup>
/**
 * countDown 倒计时
 * @description 该组件一般使用于某个活动的截止时间上，通过数字的变化，给用户明确的时间感受，提示用户进行某一个行为操作。
 * @property {String Number} timestamp 倒计时，单位为秒
 * @property {Boolean} autoplay 是否自动开始倒计时，如果为false，需手动调用开始方法。（默认true）
 * @property {String} separator 分隔符，colon为英文冒号，zh为中文（默认colon）
 * @property {String Number} separator-size 分隔符的字体大小，单位rpx（默认30）
 * @property {String} separator-color 分隔符的颜色（默认#303133）
 * @property {String Number} font-size 倒计时字体大小，单位rpx（默认30）
 * @property {Boolean} show-border 是否显示倒计时数字的边框（默认false）
 * @property {Boolean} hide-zero-day 当"天"的部分为0时，隐藏该字段 （默认true）
 * @property {String} border-color 数字边框的颜色（默认#303133）
 * @property {String} bg-color 倒计时数字的背景颜色（默认#ffffff）
 * @property {String} color 倒计时数字的颜色（默认#303133）
 * @property {String} height 数字高度值(宽度等同此值)，设置边框时看情况是否需要设置此值，单位rpx（默认auto）
 * @property {Boolean} show-days 是否显示倒计时的"天"部分（默认true）
 * @property {Boolean} show-hours 是否显示倒计时的"时"部分（默认true）
 * @property {Boolean} show-minutes 是否显示倒计时的"分"部分（默认true）
 * @property {Boolean} show-seconds 是否显示倒计时的"秒"部分（默认true）
 * @event {Function} timeEnd 倒计时结束
 * @event {Function} change 每秒触发一次，回调为当前剩余的倒计秒数
 * @example <dz-count-down ref="uCountDown" :timestamp="86400" :autoplay="false"></dz-count-down>
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { CSSProperties } from 'vue';
const props = defineProps({
	// 倒计时的时间，秒为单位
	timestamp: {
		type: [Number, String],
		default: 0,
	},
	// 是否自动开始倒计时
	autoplay: {
		type: Boolean,
		default: true,
	},
	// 用英文冒号(colon)或者中文(zh)当做分隔符，false的时候为中文，如："11:22"或"11时22秒"
	separator: {
		type: String,
		default: 'colon',
	},
	// 分隔符的大小，单位rpx
	separatorSize: {
		type: [Number, String],
		default: 30,
	},
	// 分隔符颜色
	separatorColor: {
		type: String,
		default: '#303133',
	},
	// 字体颜色
	color: {
		type: String,
		default: '#303133',
	},
	// 字体大小，单位rpx
	fontSize: {
		type: [Number, String],
		default: 30,
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '#fff',
	},
	// 数字框高度，单位rpx
	height: {
		type: [Number, String],
		default: 'auto',
	},
	// 是否显示数字框
	showBorder: {
		type: Boolean,
		default: false,
	},
	// 边框颜色
	borderColor: {
		type: String,
		default: '#303133',
	},
	// 是否显示秒
	showSeconds: {
		type: Boolean,
		default: true,
	},
	// 是否显示分钟
	showMinutes: {
		type: Boolean,
		default: true,
	},
	// 是否显示小时
	showHours: {
		type: Boolean,
		default: true,
	},
	// 是否显示“天”
	showDays: {
		type: Boolean,
		default: true,
	},
	// 当"天"的部分为0时，不显示
	hideZeroDay: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['change', 'timeEnd']);

// 监听时间戳的变化
watch(
	() => props.timestamp,
	() => {
		// 如果倒计时间发生变化，清除定时器，重新开始倒计时
		clearTimer();
		start();
	}
);
const d = ref<string>('00'); // 天的默认值
const h = ref<string>('00'); // 小时的默认值
const i = ref<string>('00'); // 分钟的默认值
const s = ref<string>('00'); // 秒的默认值
const timer = ref(null); // 定时器
const seconds = ref<number>(0); // 记录不停倒计过程中变化的秒数
// 倒计时item的样式，item为分别的时分秒部分的数字
const itemStyle = computed((): CSSProperties => {
	let style = {};
	if (props.height) {
		style.height = props.height + 'rpx';
		style.width = props.height + 'rpx';
	}
	if (props.showBorder) {
		style.borderStyle = 'solid';
		style.borderColor = props.borderColor;
		style.borderWidth = '1px';
	}
	if (props.bgColor) {
		style.backgroundColor = props.bgColor;
	}
	return style;
});
// 倒计时数字的样式
const letterStyle = computed((): CSSProperties => {
	let style = {};
	if (props.fontSize) style.fontSize = props.fontSize + 'rpx';
	if (props.color) style.color = props.color;
	return style;
});

onMounted(() => {
	// 如果自动倒计时
	props.autoplay && props.timestamp && start();
});

// 倒计时
function start() {
	// 避免可能出现的倒计时重叠情况
	clearTimer();
	if (props.timestamp <= 0) return;
	seconds.value = Number(props.timestamp);
	formatTime(seconds.value);
	timer.value = setInterval(() => {
		seconds.value--;
		// 发出change事件
		emit('change', seconds.value);
		if (seconds.value < 0) {
			return timeEnd();
		}
		formatTime(seconds.value);
	}, 1000);
}

// 格式化时间
function formatTime(seconds: number) {
	// 小于等于0的话，结束倒计时
	seconds <= 0 && timeEnd();
	let [day, hour, minute, second] = [0, 0, 0, 0];
	day = Math.floor(seconds / (60 * 60 * 24));
	// 判断是否显示“天”参数，如果不显示，将天部分的值，加入到小时中
	// hour为给后面计算秒和分等用的(基于显示天的前提下计算)
	hour = Math.floor(seconds / (60 * 60)) - day * 24;
	// showHour为需要显示的小时
	let showHour = null;
	if (props.showDays) {
		showHour = hour;
	} else {
		// 如果不显示天数，将“天”部分的时间折算到小时中去
		showHour = Math.floor(seconds / (60 * 60));
	}
	minute = Math.floor(seconds / 60) - hour * 60 - day * 24 * 60;
	second = Math.floor(seconds) - day * 24 * 60 * 60 - hour * 60 * 60 - minute * 60;
	// 如果小于10，在前面补上一个"0"
	showHour = showHour < 10 ? '0' + showHour : showHour;
	minute = minute < 10 ? '0' + minute : minute;
	second = second < 10 ? '0' + second : second;
	day = day < 10 ? '0' + day : day;
	d.value = day;
	h.value = showHour;
	i.value = minute;
	s.value = second;
}

// 停止倒计时
function timeEnd() {
	clearTimer();
	emit('timeEnd', {});
}

// 清除定时器
function clearTimer() {
	if (timer.value) {
		// 清除定时器
		clearInterval(timer.value);
		timer.value = null;
	}
}

onUnmounted(() => {
	clearInterval(timer.value);
	timer.value = null;
});
</script>

<style scoped lang="scss">
@import '../libs/css/components.scss';

.dz-countdown {
	/* #ifndef APP-NVUE */
	display: inline-flex;
	/* #endif */
	align-items: center;
}

.dz-countdown-item {
	@include flex(row);
	align-items: center;
	justify-content: center;
	padding: 2rpx;
	border-radius: 6rpx;
	white-space: nowrap;
	transform: translateZ(0);
}

.dz-countdown-time {
	margin: 0;
	padding: 0;
	line-height: 1;
}

.dz-countdown-colon {
	@include flex(row);
	justify-content: center;
	padding: 0 5rpx;
	line-height: 1;
	align-items: center;
	padding-bottom: 4rpx;
}

.dz-countdown-scale {
	transform: scale(0.9);
	transform-origin: center center;
}
</style>

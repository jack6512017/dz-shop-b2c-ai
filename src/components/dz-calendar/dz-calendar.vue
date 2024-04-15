<template>
	<dz-popup
		:maskCloseAble="maskCloseAble"
		mode="bottom"
		:popup="false"
		v-model:show="modelValueShow"
		length="auto"
		:safeAreaInsetBottom="safeAreaInsetBottom"
		@close="close"
		:z-index="uZIndex"
		:border-radius="borderRadius"
		:closeable="closeable"
		closeIcon="roundclose"
		closeIconSize="40"
	>
		<view class="dz-calendar">
			<view class="dz-calendar__header">
				<view class="dz-calendar__header__text" v-if="!$slots['tooltip']">
					{{ toolTip }}
				</view>
				<slot v-else name="tooltip" />
			</view>
			<view class="dz-calendar__action dz-flex dz-row-center">
				<view class="dz-calendar__action__icon">
					<dz-icon v-if="changeYear" name="arrowleftdouble" :color="yearArrowColor" @click="changeYearHandler(0)"></dz-icon>
				</view>
				<view class="dz-calendar__action__icon">
					<dz-icon v-if="changeMonth" name="arrowleft" :color="monthArrowColor" @click="changeMonthHandler(0)"></dz-icon>
				</view>
				<view class="dz-calendar__action__text">{{ showTitle }}</view>
				<view class="dz-calendar__action__icon">
					<dz-icon v-if="changeMonth" name="arrowright" :color="monthArrowColor" @click="changeMonthHandler(1)"></dz-icon>
				</view>
				<view class="dz-calendar__action__icon">
					<dz-icon v-if="changeYear" name="arrowrightdouble" :color="yearArrowColor" @click="changeYearHandler(1)"></dz-icon>
				</view>
			</view>
			<view class="dz-calendar__week-day">
				<view class="dz-calendar__week-day__text" v-for="(item, index) in weekDayZh" :key="index">{{ item }}</view>
			</view>
			<view class="dz-calendar__content">
				<!-- 前置空白部分 -->
				<block v-for="(item, index) in weekdayArr" :key="index">
					<view class="dz-calendar__content__item"></view>
				</block>
				<view
					class="dz-calendar__content__item"
					:class="{
						'dz-hover-class': openDisAbled(year, month, index + 1),
						'dz-calendar__content--start-date': (mode == 'range' && startDate == `${year}-${month}-${index + 1}`) || mode == 'date',
						'dz-calendar__content--end-date': (mode == 'range' && endDate == `${year}-${month}-${index + 1}`) || mode == 'date',
					}"
					:style="{ backgroundColor: getColor(index, 1), borderRadius: mode == 'date' ? '12rpx' : '0rpx' }"
					v-for="(item, index) in daysArr"
					:key="index"
					@tap="dateClick(index)"
				>
					<view class="dz-calendar__content__item__inner" :style="{ color: getColor(index, 2) }">
						<view>{{ index + 1 }}</view>
					</view>
					<view
						class="dz-calendar__content__item__tips"
						:style="{ color: activeColor }"
						v-if="mode == 'range' && startDate == `${year}-${month}-${index + 1}` && startDate != endDate"
						>{{ startText }}</view
					>
					<view
						class="dz-calendar__content__item__tips"
						:style="{ color: activeColor }"
						v-if="mode == 'range' && endDate == `${year}-${month}-${index + 1}`"
						>{{ endText }}</view
					>
				</view>
				<view class="dz-calendar__content__bg-month">{{ month }}</view>
			</view>
			<view class="dz-calendar__bottom">
				<view class="dz-calendar__bottom__choose">
					<text>{{ mode == 'date' ? activeDate : startDate }}</text>
					<text v-if="endDate">至{{ endDate }}</text>
				</view>
				<view class="dz-calendar__bottom__btn">
					<dz-button
						shape="circle"
						size="default"
						hover-class="none"
						:border="false"
						:disabled="mode == 'date' ? false : !startDate || !endDate"
						:custom-style="{
							width: '100%',
							background: !startDate || !endDate ? activeBgDisabledColor : activeBgColor,
							color: activeColor,
						}"
						@click="btnFix(false)"
						>确定</dz-button
					>
				</view>
			</view>
		</view>
	</dz-popup>
</template>

<script lang="ts" setup>
/**
 * calendar 日历
 * @description 此组件用于单个选择日期，范围选择日期等，日历被包裹在底部弹起的容器中。
 * @tutorial http://uviewui.com/components/calendar.html
 * @property {String} mode 选择日期的模式，date-为单个日期，range-为选择日期范围
 * @property {Boolean} v-model 布尔值变量，用于控制日历的弹出与收起
 * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配(默认false)
 * @property {Boolean} change-year 是否显示顶部的切换年份方向的按钮(默认true)
 * @property {Boolean} change-month 是否显示顶部的切换月份方向的按钮(默认true)
 * @property {String Number} max-year 可切换的最大年份(默认2050)
 * @property {String Number} min-year 可切换的最小年份(默认1950)
 * @property {String Number} min-date 最小可选日期(默认1950-01-01)
 * @property {String Number} max-date 最大可选日期(默认当前日期)
 * @property {String Number} 弹窗顶部左右两边的圆角值，单位rpx(默认20)
 * @property {Boolean} mask-close-able 是否允许通过点击遮罩关闭日历(默认true)
 * @property {String} month-arrow-color 月份切换按钮箭头颜色(默认#606266)
 * @property {String} year-arrow-color 年份切换按钮箭头颜色(默认#909399)
 * @property {String} color 日期字体的默认颜色(默认#303133)
 * @property {String} active-bg-color 起始/结束日期按钮的背景色(默认#2979ff)
 * @property {String Number} z-index 弹出时的z-index值(默认10075)
 * @property {String} active-color 起始/结束日期按钮的字体颜色(默认#ffffff)
 * @property {String} range-bg-color 起始/结束日期之间的区域的背景颜色(默认rgba(41,121,255,0.13))
 * @property {String} range-color 选择范围内字体颜色(默认#2979ff)
 * @property {String} start-text 起始日期底部的提示文字(默认 '开始')
 * @property {String} end-text 结束日期底部的提示文字(默认 '结束')
 * @property {String} btn-type 底部确定按钮的主题(默认 'primary')
 * @property {String} toolTip 顶部提示文字，如设置名为tooltip的slot，此参数将失效(默认 '选择日期')
 * @property {Boolean} closeable 是否显示右上角的关闭图标(默认true)
 * @example <dz-calendar v-model="show" :mode="mode"></dz-calendar>
 */

import { reactive, onMounted, computed, watch, toRefs } from 'vue';

const props = defineProps({
	safeAreaInsetBottom: {
		type: Boolean,
		default: false,
	},
	// 是否允许通过点击遮罩关闭Picker
	maskCloseAble: {
		type: Boolean,
		default: false,
	},
	// 通过双向绑定控制组件的弹出与收起
	modelValue: {
		type: Boolean,
		default: false,
	},
	// 弹出的z-index值
	zIndex: {
		type: [String, Number],
		default: 0,
	},
	// 是否允许切换年份
	changeYear: {
		type: Boolean,
		default: true,
	},
	// 是否允许切换月份
	changeMonth: {
		type: Boolean,
		default: true,
	},
	// date-单个日期选择，range-开始日期+结束日期选择
	mode: {
		type: String,
		default: 'date',
	},
	// 可切换的最大年份
	maxYear: {
		type: [Number, String],
		default: 2050,
	},
	// 可切换的最小年份
	minYear: {
		type: [Number, String],
		default: 1950,
	},
	// 最小可选日期(不在范围内日期禁用不可选)
	minDate: {
		type: [Number, String],
		default: '1950-01-01',
	},
	/**
	 * 最大可选日期
	 * 默认最大值为今天，之后的日期不可选
	 * 2030-12-31
	 * */
	maxDate: {
		type: [Number, String],
		default: '',
	},
	// 弹窗顶部左右两边的圆角值
	borderRadius: {
		type: [String, Number],
		default: 40,
	},
	// 月份切换按钮箭头颜色
	monthArrowColor: {
		type: String,
		default: '#606266',
	},
	// 年份切换按钮箭头颜色
	yearArrowColor: {
		type: String,
		default: '#909399',
	},
	// 默认日期字体颜色
	color: {
		type: String,
		default: '#303133',
	},
	// 选中|起始结束日期背景色
	activeBgColor: {
		type: String,
		default: '#2979ff',
	},
	activeBgDisabledColor: {
		type: String,
		default: '#a0cfff',
	},
	// 选中|起始结束日期字体颜色
	activeColor: {
		type: String,
		default: '#ffffff',
	},
	// 范围内日期背景色
	rangeBgColor: {
		type: String,
		default: 'rgba(41,121,255,0.13)',
	},
	// 范围内日期字体颜色
	rangeColor: {
		type: String,
		default: '#2979ff',
	},
	// mode=range时生效，起始日期自定义文案
	startText: {
		type: String,
		default: '开始',
	},
	// mode=range时生效，结束日期自定义文案
	endText: {
		type: String,
		default: '结束',
	},
	// 当前选中日期带选中效果
	isActiveCurrent: {
		type: Boolean,
		default: true,
	},
	// 切换年月是否触发事件 mode=date时生效
	isChange: {
		type: Boolean,
		default: false,
	},
	// 是否显示右上角的关闭图标
	closeable: {
		type: Boolean,
		default: true,
	},
	// 顶部的提示文字
	toolTip: {
		type: String,
		default: '选择日期',
	},
});

const data = reactive({
	modelValueShow: false,
	// 星期几,值为1-7
	weekday: 1,
	weekdayArr: [],
	// 当前月有多少天
	days: 0,
	daysArr: [],
	showTitle: '',
	year: 2020,
	month: 0,
	day: 0,
	startYear: 0,
	startMonth: 0,
	startDay: 0,
	endYear: 0,
	endMonth: 0,
	endDay: 0,
	today: '',
	activeDate: '',
	startDate: '',
	endDate: '',
	isStart: true,
	min: null,
	max: null,
	weekDayZh: ['日', '一', '二', '三', '四', '五', '六'],
});

const emit = defineEmits(['update:modelValue', 'change']);

const dataChange = computed(() => {
	return `${props.mode}-${props.minDate}-${props.maxDate}`;
});

const uZIndex = computed(() => {
	// 如果用户有传递z-index值，优先使用
	return props.zIndex ? props.zIndex : uni.$api.zIndex.popup;
});

watch(
	() => props.modelValue,
	(val) => {
		data.modelValueShow = val;
	}
);

watch(
	() => dataChange.value,
	() => {
		init();
	}
);

onMounted(() => {
	init();
});

function getColor(index: number, type: string): string {
	let _color = type == 1 ? '' : props.color;
	let day = index + 1;
	let date = `${data.year}-${data.month}-${day}`;
	let timestamp = new Date(date.replace(/\-/g, '/')).getTime();
	let start = data.startDate.replace(/\-/g, '/');
	let end = data.endDate.replace(/\-/g, '/');
	if ((props.isActiveCurrent && data.activeDate == date) || data.startDate == date || data.endDate == date) {
		_color = type == 1 ? props.activeBgColor : props.activeColor;
	} else if (data.endDate && timestamp > new Date(start).getTime() && timestamp < new Date(end).getTime()) {
		_color = type == 1 ? props.rangeBgColor : props.rangeColor;
	}
	return _color;
}

function init() {
	let now = new Date();
	data.year = now.getFullYear();
	data.month = now.getMonth() + 1;
	data.day = now.getDate();
	data.today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
	data.activeDate = data.today;
	data.min = initDate(props.minDate);
	data.max = initDate(props.maxDate || data.today);
	data.startDate = props.mode == 'range' ? data.activeDate : '';
	data.startYear = 0;
	data.startMonth = 0;
	data.startDay = 0;
	data.endYear = 0;
	data.endMonth = 0;
	data.endDay = 0;
	data.endDate = '';
	data.isStart = true;
	changeData();
}

// 日期处理
function initDate(date) {
	let fdate = date.split('-');
	return {
		year: Number(fdate[0] || 1920),
		month: Number(fdate[1] || 1),
		day: Number(fdate[2] || 1),
	};
}

function openDisAbled(year: number, month: number, day: number): boolean {
	let bool = true;
	let date = `${year}/${month}/${day}`;
	// let today = data.today.replace(/\-/g, '/');
	let min = `${data.min.year}/${data.min.month}/${data.min.day}`;
	let max = `${data.max.year}/${data.max.month}/${data.max.day}`;
	let timestamp = new Date(date).getTime();
	if (timestamp >= new Date(min).getTime() && timestamp <= new Date(max).getTime()) {
		bool = false;
	}
	return bool;
}

function generateArray(start: number, end: number) {
	return Array.from(new Array(end + 1).keys()).slice(start);
}

function formatNum(num: number): string {
	return num < 10 ? '0' + num : num + '';
}

//一个月有多少天
function getMonthDay(year: number, month: number) {
	let days = new Date(year, month, 0).getDate();
	return days;
}

function getWeekday(year: number, month: number) {
	let date = new Date(`${year}/${month}/01 00:00:00`);
	return date.getDay();
}

function checkRange(year: number): boolean {
	let overstep = false;
	if (year < props.minYear || year > props.maxYear) {
		uni.showToast({
			title: '日期超出范围啦~',
			icon: 'none',
		});
		overstep = true;
	}
	return overstep;
}

function changeMonthHandler(isAdd: number) {
	if (isAdd) {
		let month = data.month + 1;
		let year = month > 12 ? data.year + 1 : data.year;
		if (!checkRange(year)) {
			data.month = month > 12 ? 1 : month;
			data.year = year;
			changeData();
		}
	} else {
		let month = data.month - 1;
		let year = month < 1 ? data.year - 1 : data.year;
		if (!checkRange(year)) {
			data.month = month < 1 ? 12 : month;
			data.year = year;
			changeData();
		}
	}
}

function changeYearHandler(isAdd: number) {
	let year = isAdd ? data.year + 1 : data.year - 1;
	if (!checkRange(year)) {
		data.year = year;
		changeData();
	}
}

function changeData() {
	data.days = getMonthDay(data.year, data.month);
	data.daysArr = generateArray(1, data.days);
	data.weekday = getWeekday(data.year, data.month);
	data.weekdayArr = generateArray(1, data.weekday);
	data.showTitle = `${data.year}年${data.month}月`;
	if (props.isChange && props.mode == 'date') {
		btnFix(true);
	}
}

function dateClick(day: number) {
	day += 1;
	if (!openDisAbled(data.year, data.month, day)) {
		data.day = day;
		let date = `${data.year}-${data.month}-${day}`;
		if (props.mode == 'date') {
			data.activeDate = date;
		} else {
			let compare = new Date(date.replace(/\-/g, '/')).getTime() < new Date(data.startDate.replace(/\-/g, '/')).getTime();
			if (data.isStart || compare) {
				data.startDate = date;
				data.startYear = data.year;
				data.startMonth = data.month;
				data.startDay = data.day;
				data.endYear = 0;
				data.endMonth = 0;
				data.endDay = 0;
				data.endDate = '';
				data.activeDate = '';
				data.isStart = false;
			} else {
				if (data.startDate == date) return;
				data.endDate = date;
				data.endYear = data.year;
				data.endMonth = data.month;
				data.endDay = data.day;
				data.isStart = true;
			}
		}
	}
}

function close() {
	// 修改通过v-model绑定的父组件变量的值为false，从而隐藏日历弹窗
	emit('update:modelValue', false);
}

function getWeekText(date: string): string {
	date = new Date(`${date.replace(/\-/g, '/')} 00:00:00`);
	let week = date.getDay();
	return '星期' + ['日', '一', '二', '三', '四', '五', '六'][week];
}

function btnFix(show: boolean) {
	if (!show) {
		close();
	}
	if (props.mode == 'date') {
		let arr = data.activeDate.split('-');
		let year = props.isChange ? data.year : Number(arr[0]);
		let month = props.isChange ? data.month : Number(arr[1]);
		let day = props.isChange ? data.day : Number(arr[2]);
		//当前月有多少天
		let days = getMonthDay(year, month);
		let result = `${year}-${formatNum(month)}-${formatNum(day)}`;
		let weekText = getWeekText(result);
		let isToday = false;
		if (`${year}-${month}-${day}` == data.today) {
			//今天
			isToday = true;
		}
		emit('change', {
			year: year,
			month: month,
			day: day,
			days: days,
			result: result,
			week: weekText,
			isToday: isToday,
			// switch: show //是否是切换年月操作
		});
	} else {
		if (!data.startDate || !data.endDate) return;
		let startMonth = formatNum(data.startMonth);
		let startDay = formatNum(data.startDay);
		let startDate = `${data.startYear}-${startMonth}-${startDay}`;
		let startWeek = getWeekText(startDate);

		let endMonth = formatNum(data.endMonth);
		let endDay = formatNum(data.endDay);
		let endDate = `${data.endYear}-${endMonth}-${endDay}`;
		let endWeek = getWeekText(endDate);
		emit('change', {
			startYear: data.startYear,
			startMonth: data.startMonth,
			startDay: data.startDay,
			startDate: startDate,
			startWeek: startWeek,
			endYear: data.endYear,
			endMonth: data.endMonth,
			endDay: data.endDay,
			endDate: endDate,
			endWeek: endWeek,
		});
	}
}

const { modelValueShow, showTitle, weekDayZh, weekdayArr, year, month, daysArr, startDate, endDate, activeDate } = { ...toRefs(data) };
</script>

<style scoped lang="scss">
@import '../libs/css/components';

.dz-calendar {
	color: $dz-content-color;

	&__header {
		width: 100%;
		box-sizing: border-box;
		font-size: 30rpx;
		background-color: #fff;
		color: $dz-main-color;

		&__text {
			margin-top: 30rpx;
			padding: 0 60rpx;
			@include flex;
			justify-content: center;
			align-items: center;
		}
	}

	&__action {
		padding: 40rpx 0 40rpx 0;

		&__icon {
			margin: 0 16rpx;
		}

		&__text {
			padding: 0 16rpx;
			color: $dz-main-color;
			font-size: 32rpx;
			line-height: 32rpx;
			font-weight: bold;
		}
	}

	&__week-day {
		@include flex;
		align-items: center;
		justify-content: center;
		padding: 6px 0;
		overflow: hidden;

		&__text {
			flex: 1;
			text-align: center;
		}
	}

	&__content {
		width: 100%;
		@include flex;
		flex-wrap: wrap;
		padding: 6px 0;
		box-sizing: border-box;
		background-color: #fff;
		position: relative;

		&--end-date {
			border-top-right-radius: 12rpx !important;
			border-bottom-right-radius: 12rpx !important;
		}

		&--start-date {
			border-top-left-radius: 12rpx !important;
			border-bottom-left-radius: 12rpx !important;
		}

		&__item {
			width: 14.2857%;
			@include flex;
			align-items: center;
			justify-content: center;
			padding: 6px 0;
			overflow: hidden;
			position: relative;
			z-index: 2;

			&__inner {
				height: 84rpx;
				@include flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				font-size: 32rpx;
				position: relative;
				border-radius: 50%;

				&__desc {
					width: 100%;
					font-size: 24rpx;
					line-height: 24rpx;
					transform: scale(0.75);
					transform-origin: center center;
					position: absolute;
					left: 0;
					text-align: center;
					bottom: 2rpx;
				}
			}

			&__tips {
				width: 100%;
				font-size: 24rpx;
				line-height: 24rpx;
				position: absolute;
				left: 0;
				transform: scale(0.8);
				transform-origin: center center;
				text-align: center;
				bottom: 8rpx;
				z-index: 2;
			}
		}

		&__bg-month {
			position: absolute;
			font-size: 130px;
			line-height: 130px;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			color: #e4e7ed;
			z-index: 1;
		}
	}

	&__bottom {
		width: 100%;
		@include flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		background-color: #fff;
		padding: 0 40rpx 30rpx;
		box-sizing: border-box;
		font-size: 24rpx;
		color: $dz-tips-color;

		&__choose {
			height: 50rpx;
		}

		&__btn {
			width: 100%;
		}
	}
}
</style>

<template>
	<dz-popup
		:maskCloseAble="maskCloseAble"
		mode="bottom"
		:borderRadius="borderRadius"
		:popup="false"
		v-model:show="modelValueShow"
		length="auto"
		:safeAreaInsetBottom="safeAreaInsetBottom"
		@close="close"
		:z-index="mZIndex"
	>
		<view class="dz-datetime-picker">
			<view class="dz-picker-header" @touchmove.stop.prevent="">
				<view
					class="dz-btn-picker dz-btn-picker--tips"
					:style="{ color: cancelColor }"
					hover-class="dz-opacity"
					:hover-stay-time="150"
					@tap="getResult('cancel')"
					>{{ cancelText }}</view
				>
				<view class="dz-picker__title">{{ title }}</view>
				<view
					class="dz-btn-picker dz-btn-picker--primary"
					:style="{ color: moving ? cancelColor : confirmColor }"
					hover-class="dz-opacity"
					:hover-stay-time="150"
					@touchmove.stop=""
					@tap.stop="getResult('confirm')"
				>
					{{ confirmText }}
				</view>
			</view>
			<view class="dz-picker-body">
				<picker-view v-if="mode == 'region'" :value="valueArr" @change="change" class="dz-picker-view" @pickstart="pickstart" @pickend="pickend">
					<picker-view-column v-if="!reset && params.province">
						<view class="dz-column-item" v-for="(item, index) in provinces" :key="index">
							<view class="dz-line-1">{{ item.title }}</view>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!reset && params.city">
						<view class="dz-column-item" v-for="(item, index) in citys" :key="index">
							<view class="dz-line-1">{{ item.title }}</view>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!reset && params.area">
						<view class="dz-column-item" v-for="(item, index) in areas" :key="index">
							<view class="dz-line-1">{{ item.title }}</view>
						</view>
					</picker-view-column>
				</picker-view>
				<picker-view v-else-if="mode == 'time'" :value="valueArr" @change="change" class="dz-picker-view" @pickstart="pickstart" @pickend="pickend">
					<picker-view-column v-if="!reset && params.year">
						<view class="dz-column-item" v-for="(item, index) in years" :key="index">
							{{ item }}
							<text class="dz-text" v-if="showTimeTag">年</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!reset && params.month">
						<view class="dz-column-item" v-for="(item, index) in months" :key="index">
							{{ formatNumber(item) }}
							<text class="dz-text" v-if="showTimeTag">月</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!reset && params.day">
						<view class="dz-column-item" v-for="(item, index) in days" :key="index">
							{{ formatNumber(item) }}
							<text class="dz-text" v-if="showTimeTag">日</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!reset && params.hour">
						<view class="dz-column-item" v-for="(item, index) in hours" :key="index">
							{{ formatNumber(item) }}
							<text class="dz-text" v-if="showTimeTag">时</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!reset && params.minute">
						<view class="dz-column-item" v-for="(item, index) in minutes" :key="index">
							{{ formatNumber(item) }}
							<text class="dz-text" v-if="showTimeTag">分</text>
						</view>
					</picker-view-column>
					<picker-view-column v-if="!reset && params.second">
						<view class="dz-column-item" v-for="(item, index) in seconds" :key="index">
							{{ formatNumber(item) }}
							<text class="dz-text" v-if="showTimeTag">秒</text>
						</view>
					</picker-view-column>
				</picker-view>
				<picker-view v-else-if="mode == 'selector'" :value="valueArr" @change="change" class="dz-picker-view" @pickstart="pickstart" @pickend="pickend">
					<picker-view-column v-if="!reset">
						<view class="dz-column-item" v-for="(item, index) in range" :key="index">
							<view class="dz-line-1">{{ getItemValue(item, 'selector') }}</view>
						</view>
					</picker-view-column>
				</picker-view>
				<picker-view
					v-else-if="mode == 'multiSelector'"
					:value="valueArr"
					@change="change"
					class="dz-picker-view"
					@pickstart="pickstart"
					@pickend="pickend"
				>
					<picker-view-column v-if="!reset" v-for="(item, index) in range" :key="index">
						<view class="dz-column-item" v-for="(item1, index1) in item" :key="index1">
							<view class="dz-line-1">{{ getItemValue(item1, 'multiSelector') }}</view>
						</view>
					</picker-view-column>
				</picker-view>
			</view>
		</view>
	</dz-popup>
</template>

<script lang="ts" setup>
/**
 * picker picker弹出选择器
 * @description 此选择器有两种弹出模式：一是时间模式，可以配置年，日，月，时，分，秒参数 二是地区模式，可以配置省，市，区参数
 * @property {Object} params 需要显示的参数
 * @property {String} mode 模式选择，region-地区类型，time-时间类型（默认time）
 * @property {String Number} start-year 可选的开始年份，mode=time时有效（默认1950）
 * @property {String Number} end-year 可选的结束年份，mode=time时有效（默认2050）
 * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配（默认false）
 * @property {Boolean} show-time-tag 时间模式时，是否显示后面的年月日中文提示
 * @property {String} cancel-color 取消按钮的颜色（默认#606266）
 * @property {String} confirm-color 确认按钮的颜色（默认#2979ff）
 * @property {String} default-time 默认选中的时间，mode=time时有效
 * @property {String} confirm-text 确认按钮的文字
 * @property {String} cancel-text 取消按钮的文字
 * @property {String} default-region 默认选中的地区，中文形式，mode=region时有效
 * @property {String} default-code 默认选中的地区，编号形式，mode=region时有效
 * @property {Boolean} mask-close-able 是否允许通过点击遮罩关闭Picker（默认true）
 * @property {String Number} z-index 弹出时的z-index值（默认1075）
 * @property {Array} default-selector 数组形式，其中每一项表示选择了range对应项中的第几个
 * @property {Array} range 自定义选择的数据，mode=selector或mode=multiSelector时有效
 * @property {String} range-key 当range参数的元素为对象时，指定Object中的哪个key的值作为选择器显示内容
 * @event {Function} confirm 点击确定按钮，返回当前选择的值
 * @event {Function} cancel 点击取消按钮，返回当前选择的值
 * @example <dz-picker v-model="show" mode="time"></dz-picker>
 */
import areaConfig from '@/core/config/areaConfig';
import { reactive, onMounted, computed, watch, getCurrentInstance, toRefs } from 'vue';

const props = defineProps({
	// picker中需要显示的参数
	params: {
		type: Object,
		default() {
			return {
				year: true,
				month: true,
				day: true,
				hour: false,
				minute: false,
				second: false,
				province: true,
				city: true,
				area: true,
				timestamp: true,
			};
		},
	},
	// 当mode=selector或者mode=multiSelector时，提供的数组
	range: {
		type: Array,
		default() {
			return [];
		},
	},
	// 当mode=selector或者mode=multiSelector时，提供的默认选中的下标
	defaultSelector: {
		type: Array,
		default() {
			return [0];
		},
	},
	// 当 range 是一个 Array＜Object＞ 时，通过 range-key 来指定 Object 中 key 的值作为选择器显示内容
	rangeKey: {
		type: String,
		default: '',
	},
	// 模式选择，region-地区类型，time-时间类型，selector-单列模式，multiSelector-多列模式
	mode: {
		type: String,
		default: 'time',
	},
	// 年份开始时间
	startYear: {
		type: [String, Number],
		default: 1950,
	},
	// 显示显示弹窗的圆角，单位rpx
	borderRadius: {
		type: [Number, String],
		default: 0,
	},
	// 年份结束时间
	endYear: {
		type: [String, Number],
		default: 2050,
	},
	// 月份限制时间
	startEndMonth: {
		type: Array,
		default() {
			return [];
		},
	},
	// 日限制时间
	startEndDay: {
		type: Array,
		default() {
			return [];
		},
	},
	// "取消"按钮的颜色
	cancelColor: {
		type: String,
		default: '#606266',
	},
	// "确定"按钮的颜色
	confirmColor: {
		type: String,
		default: '#2979ff',
	},
	// 默认显示的时间，2025-07-02 || 2025-07-02 13:01:00 || 2025/07/02
	defaultTime: {
		type: String,
		default: '',
	},
	// 默认显示的地区，可传类似["河北省", "秦皇岛市", "北戴河区"]
	defaultRegion: {
		type: Array,
		default() {
			return [];
		},
	},
	// 时间模式时，是否显示后面的年月日中文提示
	showTimeTag: {
		type: Boolean,
		default: true,
	},
	// 默认显示地区的编码，defaultRegion和areaCode同时存在，areaCode优先，可传类似["110000", "110100", "110101"]
	areaCode: {
		type: Array,
		default() {
			return [];
		},
	},
	safeAreaInsetBottom: {
		type: Boolean,
		default: false,
	},
	// 是否允许通过点击遮罩关闭Picker
	maskCloseAble: {
		type: Boolean,
		default: true,
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
	// 顶部标题
	title: {
		type: String,
		default: '',
	},
	// 取消按钮的文字
	cancelText: {
		type: String,
		default: '取消',
	},
	// 确认按钮的文字
	confirmText: {
		type: String,
		default: '确认',
	},
});

const emit = defineEmits(['update:modelValue', 'columnchange', 'cancel', 'confirm']);

const data = reactive({
	modelValueShow: props.modelValue,
	years: [],
	months: [],
	days: [],
	hours: [],
	minutes: [],
	seconds: [],
	year: 0,
	month: 0,
	day: 0,
	hour: 0,
	minute: 0,
	second: 0,
	reset: false,
	startDate: '',
	endDate: '',
	valueArr: [],
	provinces: areaConfig,
	citys: areaConfig[0].child,
	areas: areaConfig[0].child[0].child,
	province: 0,
	city: 0,
	area: 0,
	moving: false, // 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
});

const vm = getCurrentInstance();

onMounted(() => {
	init();
});

const propsChange = computed(() => {
	// 引用这几个变量，是为了监听其变化
	return `${props.mode}-${props.defaultTime}-${props.startYear}-${props.endYear}-${props.startEndMonth}-${props.startEndDay}-${props.defaultRegion}-${props.areaCode}`;
});

const provinceChange = computed(() => data.province);
const cityChange = computed(() => data.city);
const yearAndMonth = computed(() => `${props.year}-${props.month}`);
// 如果用户有传递z-index值，优先使用
// props.$api.zIndex.popup
const mZIndex = computed(() => (props.zIndex ? props.zIndex : 1000));

watch(
	() => props.modelValue,
	(newVal) => {
		data.modelValueShow = newVal;
	}
);

watch(
	() => propsChange.value,
	() => {
		data.reset = true;
		setTimeout(() => init(), 10);
	}
);

watch(
	() => provinceChange.value,
	() => {
		data.city = 0;
		data.area = 0;
		data.valueArr[1] = 0;
		data.valueArr[2] = 0;
		data.citys = areaConfig[data.province].child;
		data.areas = areaConfig[data.province].child[data.city].child;
	}
);

watch(
	() => cityChange.value,
	() => {
		data.area = 0;
		data.valueArr[2] = 0;
		data.areas = areaConfig[data.province].child[data.city].child;
	}
);

// watch监听月份的变化，实时变更日的天数，因为不同月份，天数不一样
// 一个月可能有30，31天，甚至闰年2月的29天，平年2月28天
watch(
	() => yearAndMonth.value,
	() => {
		if (props.params.year) setDays();
	}
);

// 微信和QQ小程序由于一些奇怪的原因(故同时对所有平台均初始化一遍)，需要重新初始化才能显示正确的值
watch(
	() => props.modelValue,
	(n) => {
		if (n) {
			data.reset = true;
			setTimeout(() => init(), 10);
		}
	}
);

// 标识滑动开始，只有微信小程序才有这样的事件
function pickstart() {
	// #ifdef MP-WEIXIN
	data.moving = true;
	// #endif
}

// 标识滑动结束
function pickend() {
	// #ifdef MP-WEIXIN
	data.moving = false;
	// #endif
}
// 对单列和多列形式的判断是否有传入变量的情况
function getItemValue(item, mode) {
	// 目前(2020-05-25)uni-app对微信小程序编译有错误，导致v-if为false中的内容也执行，错误导致
	// 单列模式或者多列模式中的getItemValue同时被执行，故在这里再加一层判断
	if (props.mode == mode) {
		return typeof item == 'object' ? item[props.rangeKey] : item;
	}
}

// 小于10前面补0，用于月份，日期，时分秒等
function formatNumber(num: number) {
	return +num < 10 ? '0' + num : String(num);
}

// 生成递进的数组
function generateArray(start, end) {
	// 转为数值格式，否则用户给end-year等传递字符串值时，下面的end+1会导致字符串拼接，而不是相加
	start = Number(start);
	end = Number(end);
	end = end > start ? end : start;
	// 生成数组，获取其中的索引，并剪出来
	return [...Array(end + 1).keys()].slice(start);
}

function getIndex(arr, val) {
	let index = arr.indexOf(val);
	// 如果index为-1(即找不到index值)，~(-1)=-(-1)-1=0，导致条件不成立
	return ~index ? index : 0;
}

//日期时间处理
function initTimeValue() {
	// 格式化时间，在IE浏览器(uni不存在此情况)，无法识别日期间的"-"间隔符号
	let fdate = props.defaultTime.replace(/\-/g, '/');
	fdate = fdate && fdate.indexOf('/') == -1 ? `2020/01/01 ${fdate}` : fdate;
	let time = null;
	if (fdate) time = new Date(fdate);
	else time = new Date();
	// 获取年日月时分秒
	data.year = time.getFullYear();
	data.month = Number(time.getMonth()) + 1;
	data.day = time.getDate();
	data.hour = time.getHours();
	data.minute = time.getMinutes();
	data.second = time.getSeconds();
}

function init() {
	data.valueArr = [];
	data.reset = false;
	if (props.mode == 'time') {
		initTimeValue();
		if (props.params.year) {
			data.valueArr.push(0);
			setYears();
		}
		if (props.params.month) {
			data.valueArr.push(0);
			setMonths();
		}
		if (props.params.day) {
			data.valueArr.push(0);
			setDays();
		}
		if (props.params.hour) {
			data.valueArr.push(0);
			setHours();
		}
		if (props.params.minute) {
			data.valueArr.push(0);
			setMinutes();
		}
		if (props.params.second) {
			data.valueArr.push(0);
			setSeconds();
		}
	} else if (props.mode == 'region') {
		if (props.params.province) {
			data.valueArr.push(0);
			setProvinces();
		}
		if (props.params.city) {
			data.valueArr.push(0);
			setCitys();
		}
		if (props.params.area) {
			data.valueArr.push(0);
			setAreas();
		}
	} else if (props.mode == 'selector') {
		data.valueArr = props.defaultSelector;
	} else if (props.mode == 'multiSelector') {
		data.valueArr = props.defaultSelector;
	}
	vm?.proxy?.$forceUpdate();
}

// 设置picker的某一列值
function setYears() {
	// 获取年份集合
	data.years = generateArray(props.startYear, props.endYear);
	// 设置data.valueArr某一项的值，是为了让picker预选中某一个值
	data.valueArr.splice(data.valueArr.length - 1, 1, getIndex(data.years, data.year));
}

function setMonths() {
	if (props.startEndMonth.length) {
		data.months = generateArray(props.startEndMonth[0], props.startEndMonth[1]);
	} else {
		data.months = generateArray(1, 12);
	}
	data.valueArr.splice(data.valueArr.length - 1, 1, getIndex(data.months, data.month));
}

function setDays() {
	let totalDays = new Date(data.year, data.month, 0).getDate();
	if (props.startEndDay.length) {
		data.days = generateArray(props.startEndDay[0], props.startEndDay[1]);
	} else {
		data.days = generateArray(1, totalDays);
	}
	let index = 0;
	// 这里不能使用类似setMonths()中的data.valueArr.splice(data.valueArr.length - 1, xxx)做法
	// 因为this.month和this.year变化时，会触发watch中的this.setDays()，导致data.valueArr.length计算有误
	if (props.params.year && props.params.month) index = 2;
	else if (props.params.month) index = 1;
	else if (props.params.year) index = 1;
	else index = 0;
	// 当月份变化时，会导致日期的天数也会变化，如果原来选的天数大于变化后的天数，则重置为变化后的最大值
	// 比如原来选中3月31日，调整为2月后，日期变为最大29，这时如果day值继续为31显然不合理，于是将其置为29(picker-column从1开始)
	if (data.day > data.days.length) data.day = data.days.length;
	data.valueArr.splice(index, 1, getIndex(data.days, data.day));
}

function setHours() {
	data.hours = generateArray(0, 23);
	data.valueArr.splice(data.valueArr.length - 1, 1, getIndex(data.hours, data.hour));
}

function setMinutes() {
	data.minutes = generateArray(0, 59);
	data.valueArr.splice(data.valueArr.length - 1, 1, getIndex(data.minutes, data.minute));
}

function setSeconds() {
	data.seconds = generateArray(0, 59);
	data.valueArr.splice(data.valueArr.length - 1, 1, getIndex(data.seconds, data.second));
}

function setProvinces() {
	// 判断是否需要province参数
	if (!props.params.province) return;
	let tmp = '';
	let useCode = false;
	// 如果同时配置了defaultRegion和areaCode，优先使用areaCode参数
	if (props.areaCode.length) {
		tmp = props.areaCode[0];
		useCode = true;
	} else if (props.defaultRegion.length) tmp = props.defaultRegion[0];
	else tmp = 0;
	// 历遍省份数组匹配
	areaConfig.map((v, k) => {
		if (useCode ? v.id == tmp : v.title == tmp) {
			tmp = k;
		}
	});
	data.province = tmp;
	data.provinces = areaConfig;
	// 设置默认省份的值
	data.valueArr.splice(0, 1, data.province);
}

function setCitys() {
	if (!props.params.city) return;
	let tmp = '';
	let useCode = false;
	if (props.areaCode.length) {
		tmp = props.areaCode[1];
		useCode = true;
	} else if (props.defaultRegion.length) tmp = props.defaultRegion[1];
	else tmp = 0;
	areaConfig[data.province].child.map((v, k) => {
		if (useCode ? v.id == tmp : v.title == tmp) {
			tmp = k;
		}
	});
	data.city = tmp;
	data.citys = areaConfig[data.province].child;
	data.valueArr.splice(1, 1, data.city);
}

function setAreas() {
	if (!props.params.area) return;
	let tmp = '';
	let useCode = false;
	if (props.areaCode.length) {
		tmp = props.areaCode[2];
		useCode = true;
	} else if (props.defaultRegion.length) tmp = props.defaultRegion[2];
	else tmp = 0;
	areaConfig[data.province].child[data.city].child.map((v, k) => {
		if (useCode ? v.id == tmp : v.title == tmp) {
			tmp = k;
		}
	});
	data.area = tmp;
	data.areas = areaConfig[data.province].child[data.city].child;
	data.valueArr.splice(2, 1, data.area);
}
function close() {
	emit('update:modelValue', false);
}

// 用户更改picker的列选项
function change(e) {
	data.valueArr = e.detail.value;
	let i = 0;
	if (props.mode == 'time') {
		// 这里使用i++，是因为data.valueArr数组的长度是不确定长度的，它根据props.params的值来配置长度
		// 进入if规则，i会加1，保证了能获取准确的值
		if (props.params.year) data.year = data.years[data.valueArr[i++]];
		if (props.params.month) data.month = data.months[data.valueArr[i++]];
		if (props.params.day) data.day = data.days[data.valueArr[i++]];
		if (props.params.hour) data.hour = data.hours[data.valueArr[i++]];
		if (props.params.minute) data.minute = data.minutes[data.valueArr[i++]];
		if (props.params.second) data.second = data.seconds[data.valueArr[i++]];
		emit('columnchange', {
			year: data.year,
			month: data.month,
			day: data.day,
		});
	} else if (props.mode == 'region') {
		if (props.params.province) data.province = data.valueArr[i++];
		if (props.params.city) data.city = data.valueArr[i++];
		if (props.params.area) data.area = data.valueArr[i++];
	} else if (props.mode == 'multiSelector') {
		let index = null;
		// 对比前后两个数组，寻找变更的是哪一列，如果某一个元素不同，即可判定该列发生了变化
		props.defaultSelector.map((val, idx) => {
			if (val != e.detail.value[idx]) index = idx;
		});
		// 为了让用户对多列变化时，对动态设置其他列的变更
		if (index != null) {
			emit('columnchange', {
				column: index,
				index: e.detail.value[index],
			});
		}
	}
}

// 用户点击确定按钮
function getResult(event = null) {
	// #ifdef MP-WEIXIN
	if (data.moving) return;
	// #endif
	let result = {};
	// 只返回用户在props.params中配置了为true的字段
	if (props.mode == 'time') {
		if (props.params.year) result.year = formatNumber(data.year || 0);
		if (props.params.month) result.month = formatNumber(data.month || 0);
		if (props.params.day) result.day = formatNumber(data.day || 0);
		if (props.params.hour) result.hour = formatNumber(data.hour || 0);
		if (props.params.minute) result.minute = formatNumber(data.minute || 0);
		if (props.params.second) result.second = formatNumber(data.second || 0);
		if (props.params.timestamp) result.timestamp = getTimestamp();
	} else if (props.mode == 'region') {
		if (props.params.province) result.province = areaConfig[data.province];
		if (props.params.city) result.city = areaConfig[data.province].child[data.city];
		if (props.params.area) result.area = areaConfig[data.province].child[data.city].child[data.area];
	} else if (props.mode == 'selector') {
		result = data.valueArr;
	} else if (props.mode == 'multiSelector') {
		result = data.valueArr;
	}
	if (event) emit(event, result);
	close();
}
// 获取时间戳
function getTimestamp() {
	// yyyy-mm-dd为安卓写法，不支持iOS，需要使用"/"分隔，才能二者兼容
	let time = data.year + '/' + data.month + '/' + data.day + ' ' + data.hour + ':' + data.minute + ':' + data.second;
	return new Date(time).getTime() / 1000;
}
const { modelValueShow, valueArr, provinces, citys, areas, years, months, days, hours, minutes, seconds, reset, moving } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-datetime-picker {
	position: relative;
	z-index: 999;
}

.dz-picker-view {
	height: 100%;
	box-sizing: border-box;
}

.dz-picker-header {
	width: 100%;
	height: 90rpx;
	padding: 0 40rpx;
	@include flex;
	justify-content: space-between;
	align-items: center;
	box-sizing: border-box;
	font-size: 30rpx;
	background: #fff;
	position: relative;
}

.dz-picker-header::after {
	content: '';
	position: absolute;
	border-bottom: 1rpx solid #eaeef1;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	bottom: 0;
	right: 0;
	left: 0;
}

.dz-picker__title {
	color: $dz-content-color;
}

.dz-picker-body {
	width: 100%;
	height: 500rpx;
	overflow: hidden;
	background-color: #fff;
}

.dz-column-item {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	color: $dz-main-color;
	padding: 0 8rpx;
}

.dz-text {
	font-size: 24rpx;
	padding-left: 8rpx;
}

.dz-btn-picker {
	padding: 16rpx;
	box-sizing: border-box;
	text-align: center;
	text-decoration: none;
}

.dz-opacity {
	opacity: 0.5;
}

.dz-btn-picker--primary {
	color: $dz-type-primary;
}

.dz-btn-picker--tips {
	color: $dz-tips-color;
}
</style>

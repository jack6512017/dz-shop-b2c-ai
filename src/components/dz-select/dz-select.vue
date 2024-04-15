<template>
	<view class="dz-select">
		<dz-popup
			:maskCloseAble="maskCloseAble"
			mode="bottom"
			:popup="false"
			:borderRadius="borderRadius"
			v-model:show="modelValueShow"
			length="auto"
			:safeAreaInsetBottom="safeAreaInsetBottom"
			@close="close"
			:z-index="mZIndex"
		>
			<view class="dz-select">
				<view class="dz-select__header" @touchmove.stop.prevent="">
					<view
						class="dz-select__header__cancel dz-select__header__btn"
						:style="{ color: cancelColor }"
						hover-class="dz-hover-class"
						:hover-stay-time="150"
						@tap="getResult('cancel')"
					>
						{{ cancelText }}
					</view>
					<view class="dz-select__header__title">
						{{ title }}
					</view>
					<view
						class="dz-select__header__confirm dz-select__header__btn"
						:style="{ color: moving ? cancelColor : confirmColor }"
						hover-class="dz-hover-class"
						:hover-stay-time="150"
						@touchmove.stop=""
						@tap.stop="getResult('confirm')"
					>
						{{ confirmText }}
					</view>
				</view>
				<view class="dz-select__body">
					<picker-view @change="columnChange" class="dz-select__body__picker-view" :value="defaultSelector" @pickstart="pickstart" @pickend="pickend">
						<picker-view-column v-for="(item, index) in columnData" :key="index">
							<view class="dz-select__body__picker-view__item" v-for="(item1, index1) in item" :key="index1">
								<view class="dz-line-1">{{ item1[labelName] }}</view>
							</view>
						</picker-view-column>
					</picker-view>
				</view>
			</view>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
/**
 * select 列选择器
 * @description 此选择器用于单列，多列，多列联动的选择场景。(不建议使用Picker组件的单列和多列模式，Select组件是专门为列选择而构造的组件，更简单易用。)
 * @property {String} mode 模式选择，"single-column"-单列模式，"mutil-column"-多列模式，"mutil-column-auto"-多列联动模式
 * @property {Array} list 列数据，数组形式
 * @property {Boolean} v-model 布尔值变量，用于控制选择器的弹出与收起
 * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配(默认false)
 * @property {String} cancel-color 取消按钮的颜色（默认#606266）
 * @property {String} confirm-color 确认按钮的颜色(默认#2979ff)
 * @property {String} confirm-text 确认按钮的文字
 * @property {String} cancel-text 取消按钮的文字
 * @property {String} default-value 提供的默认选中的下标
 * @property {Boolean} mask-close-able 是否允许通过点击遮罩关闭Picker(默认true)
 * @property {String Number} z-index 弹出时的z-index值(默认10075)
 * @property {String} value-name 自定义list数据的value属性名 1.3.6
 * @property {String} label-name 自定义list数据的label属性名 1.3.6
 * @property {String} child-name 自定义list数据的children属性名，只对多列联动模式有效 1.3.7
 * @event {Function} confirm 点击确定按钮，返回当前选择的值
 * @example <dz-select v-model="show" :list="list"></dz-select>
 */
import { ref, watch, computed } from 'vue';
const props = defineProps({
	// 列数据
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 是否显示边框
	border: {
		type: Boolean,
		default: true,
	},
	// 通过双向绑定控制组件的弹出与收起
	modelValue: {
		type: Boolean,
		default: false,
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
	// 弹出的z-index值
	zIndex: {
		type: [String, Number],
		default: 0,
	},
	// 显示显示弹窗的圆角，单位rpx
	borderRadius: {
		type: [Number, String],
		default: 0,
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
	// 提供的默认选中的下标
	defaultValue: {
		type: Array,
		default() {
			return [0];
		},
	},
	// 模式选择，single-column-单列，mutil-column-多列，mutil-column-auto-多列联动
	mode: {
		type: String,
		default: 'single-column',
	},
	// 自定义value属性名
	valueName: {
		type: String,
		default: 'value',
	},
	// 自定义label属性名
	labelName: {
		type: String,
		default: 'label',
	},
	// 自定义多列联动模式的children属性名
	childName: {
		type: String,
		default: 'children',
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

const emit = defineEmits(['update:modelValue', 'cancel', 'confirm']);

const modelValueShow = ref<boolean>(false);
// 用于列改变时，保存当前的索引，下一次变化时比较得出是哪一列发生了变化
const defaultSelector = ref([0]);
// picker-view的数据
const columnData = ref([]);
// 每次队列发生变化时，保存选择的结果
const selectValue = ref([]);
// 上一次列变化时的index
const lastSelectIndex = ref([]);
// 列数
const columnNum = ref<number>(0);
// 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
const moving = ref<boolean>(false);

watch(
	() => props.modelValue,
	(val) => {
		modelValueShow.value = val;
		if (val) setTimeout(() => init(), 10);
	}
);

// 如果用户有传递z-index值，优先使用
// this.$api.zIndex.popup
const mZIndex = computed(() => {
	return props.zIndex ? props.zIndex : 1000;
});
// 标识滑动开始，只有微信小程序才有这样的事件
function pickstart() {
	// #ifdef MP-WEIXIN
	moving.value = true;
	// #endif
}
// 标识滑动结束
function pickend() {
	// #ifdef MP-WEIXIN
	moving.value = false;
	// #endif
}
function init() {
	setColumnNum();
	setDefaultSelector();
	setColumnData();
	setSelectValue();
}
// 获取默认选中列下标
function setDefaultSelector() {
	// 如果没有传入默认选中的值，生成长度为columnNum，用0填充的数组
	defaultSelector.value = props.defaultValue.length == columnNum.value ? props.defaultValue : Array(columnNum.value).fill(0);
	lastSelectIndex.value = uni.$api.deepClone(defaultSelector.value);
}
// 计算列数
function setColumnNum() {
	// 单列的列数为1
	if (props.mode == 'single-column') columnNum.value = 1;
	// 多列时，props.list数组长度就是列数
	else if (props.mode == 'mutil-column') columnNum.value = props.list.length;
	// 多列联动时，通过历遍props.list的第一个元素，得出有多少列
	else if (props.mode == 'mutil-column-auto') {
		let num = 1;
		let column = props.list;
		// 只要有元素并且第一个元素有children属性，继续历遍
		while (column[0][props.childName]) {
			column = column[0] ? column[0][props.childName] : {};
			num++;
		}
		columnNum.value = num;
	}
}
// 获取需要展示在picker中的列数据
function setColumnData() {
	let data = [];
	selectValue.value = [];
	if (props.mode == 'mutil-column-auto') {
		// 获得所有数据中的第一个元素
		let column = props.list[defaultSelector.value.length ? defaultSelector.value[0] : 0];
		// 通过循环所有的列数，再根据设定列的数组，得出当前需要渲染的整个列数组
		for (let i = 0; i < columnNum.value; i++) {
			// 第一列默认为整个list数组
			if (i == 0) {
				data[i] = props.list;
				column = column[props.childName];
			} else {
				// 大于第一列时，判断是否有默认选中的，如果没有就用该列的第一项
				data[i] = column;
				column = column[defaultSelector.value[i]][props.childName];
			}
		}
	} else if (props.mode == 'single-column') {
		data[0] = props.list;
	} else {
		data = props.list;
	}
	columnData.value = data;
}
// 获取默认选中的值，如果没有设置defaultValue，就默认选中每列的第一个
function setSelectValue() {
	let tmp = null;
	for (let i = 0; i < columnNum.value; i++) {
		tmp = columnData.value[i][defaultSelector.value[i]];
		let data = {
			value: tmp ? tmp[props.valueName] : null,
			label: tmp ? tmp[props.labelName] : null,
		};
		// 判断是否存在额外的参数，如果存在，就返回
		if (tmp && tmp.extra) data.extra = tmp.extra;
		selectValue.value.push(data);
	}
}
// 列选项
function columnChange(e) {
	let index = null;
	let columnIndex = e.detail.value;
	// 由于后面是需要push进数组的，所以需要先清空数组
	selectValue.value = [];
	if (props.mode == 'mutil-column-auto') {
		// 对比前后两个数组，寻找变更的是哪一列，如果某一个元素不同，即可判定该列发生了变化
		lastSelectIndex.value.map((val, idx) => {
			if (val != columnIndex[idx]) index = idx;
		});
		defaultSelector.value = columnIndex;
		for (let i = index + 1; i < columnNum.value; i++) {
			// 当前变化列的下一列的数据，需要获取上一列的数据，同时需要指定是上一列的第几个的children，再往后的
			// 默认是队列的第一个为默认选项
			columnData.value[i] = columnData.value[i - 1][i - 1 == index ? columnIndex[index] : 0][props.childName];
			// 改变的列之后的所有列，默认选中第一个
			defaultSelector.value[i] = 0;
		}
		// 在历遍的过程中，可能由于上一步修改columnData.value，导致产生连锁反应，程序触发columnChange，会有多次调用
		// 只有在最后一次数据稳定后的结果是正确的，此前的历遍中，可能会产生undefined，故需要判断
		columnIndex.map((item, index) => {
			let data = columnData.value[index][columnIndex[index]];
			let tmp = {
				value: data ? data[props.valueName] : null,
				label: data ? data[props.labelName] : null,
			};
			// 判断是否有需要额外携带的参数
			if (data && data.extra !== undefined) tmp.extra = data.extra;
			selectValue.value.push(tmp);
		});
		// 保存这一次的结果，用于下次列发生变化时作比较
		lastSelectIndex.value = columnIndex;
	} else if (props.mode == 'single-column') {
		let data = columnData.value[0][columnIndex[0]];
		// 初始默认选中值
		let tmp = {
			value: data ? data[props.valueName] : null,
			label: data ? data[props.labelName] : null,
		};
		// 判断是否有需要额外携带的参数
		if (data && data.extra !== undefined) tmp.extra = data.extra;
		selectValue.value.push(tmp);
	} else if (props.mode == 'mutil-column') {
		// 初始默认选中值
		columnIndex.map((item, index) => {
			let data = columnData.value[index][columnIndex[index]];
			// 初始默认选中值
			let tmp = {
				value: data ? data[props.valueName] : null,
				label: data ? data[props.labelName] : null,
			};
			// 判断是否有需要额外携带的参数
			if (data && data.extra !== undefined) tmp.extra = data.extra;
			selectValue.value.push(tmp);
		});
	}
}
function close() {
	emit('update:modelValue', false);
}
// 点击确定或者取消
function getResult(event = null) {
	// #ifdef MP-WEIXIN
	if (moving.value) return;
	// #endif
	if (event) emit(event, selectValue.value);
	close();
}
</script>

<style scoped lang="scss">
@import '../libs/css/components.scss';

.dz-select {
	&__action {
		position: relative;
		line-height: $dz-form-item-height;
		height: $dz-form-item-height;

		&__icon {
			position: absolute;
			right: 20rpx;
			top: 50%;
			transition: transform 0.4s;
			transform: translateY(-50%);
			z-index: 1;

			&--reverse {
				transform: rotate(-180deg) translateY(50%);
			}
		}
	}

	&__hader {
		&__title {
			color: $dz-content-color;
		}
	}

	&--border {
		border-radius: 6rpx;
		border-radius: 4px;
		border: 1px solid $dz-form-item-border-color;
	}

	&__header {
		@include flex;
		align-items: center;
		justify-content: space-between;
		height: 80rpx;
		padding: 0 40rpx;
	}

	&__body {
		width: 100%;
		height: 500rpx;
		overflow: hidden;
		background-color: #fff;

		&__picker-view {
			height: 100%;
			box-sizing: border-box;

			&__item {
				@include flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				color: $dz-main-color;
				padding: 0 8rpx;
			}
		}
	}
}
</style>

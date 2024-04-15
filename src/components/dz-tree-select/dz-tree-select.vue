<template>
	<view class="dz-tree-select">
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
			<view class="dz-tree-select">
				<view class="dz-tree-select__header" @touchmove.stop.prevent="">
					<view
						class="dz-tree-select__header__cancel dz-tree-select__header__btn"
						:style="{ color: cancelColor }"
						hover-class="dz-hover-class"
						:hover-stay-time="150"
						@tap="getResult('cancel')"
					>
						{{ cancelText }}
					</view>
					<view class="dz-tree-select__header__title">
						{{ title }}
					</view>
					<view
						class="dz-tree-select__header__confirm dz-tree-select__header__btn"
						:style="{ color: moving ? cancelColor : confirmColor }"
						hover-class="dz-hover-class"
						:hover-stay-time="150"
						@touchmove.stop=""
						@tap.stop="getResult('confirm')"
					>
						{{ confirmText }}
					</view>
				</view>
				<view class="dz-tree-select__body">
					<dz-input
						v-model="filterValue"
						placeholder="请输入内容进行筛选"
						border="none"
						:customStyle="{ padding: '10rpx 20rpx', margin: '0 12rpx 12rpx', backgroundColor: '#f2f2f2', borderRadius: '36rpx' }"
						placeholderStyle="color: #909399"
						@change="handleFilterChange"
					></dz-input>
					<dz-tree
						ref="dzTreeRef"
						:data="columnData"
						:themeColor="theme.dzBaseColor"
						labelField="title"
						valueField="id"
						:filterValue="filterValue"
						:showCheckbox="showCheckbox"
						checkStrictly
						expandChecked
						:defaultCheckedKeys="defaultCheckedKeys"
					></dz-tree>
				</view>
			</view>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
/**
 * select 列选择器
 * @description 此选择器用于单列，多列，多列联动的选择场景。(不建议使用Picker组件的单列和多列模式，Select组件是专门为列选择而构造的组件，更简单易用。)
 * @property {String} mode 模式选择，false单列， true多选
 * @property {Array} list 列数据，数组形式
 * @property {Boolean} v-model 布尔值变量，用于控制选择器的弹出与收起
 * @property {Boolean} safe-area-inset-bottom 是否开启底部安全区适配(默认false)
 * @property {String} cancel-color 取消按钮的颜色（默认#606266）
 * @property {String} confirm-color 确认按钮的颜色(默认#2979ff)
 * @property {String} confirm-text 确认按钮的文字
 * @property {String} cancel-text 取消按钮的文字
 * @property {String} default-value 提供的默认选中的值
 * @property {Boolean} mask-close-able 是否允许通过点击遮罩关闭Picker(默认true)
 * @property {String Number} z-index 弹出时的z-index值(默认10075)
 * @property {String} value-name 自定义list数据的value属性名 1.3.6
 * @property {String} label-name 自定义list数据的label属性名 1.3.6
 * @property {String} child-name 自定义list数据的children属性名，只对多列联动模式有效 1.3.7
 * @event {Function} confirm 点击确定按钮，返回当前选择的值
 * @example <dz-tree-select v-model="show" :list="list"></dz-tree-select>
 */
import { ref, watch, computed } from 'vue';
import { useUserStore } from '@/state/modules/user';
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
	// 提供的默认选中的值
	defaultValue: {
		type: [Array, String, Number],
		default: null,
	},
	// 删除选中的值
	deleteValue: {
		type: [Array],
		default() {
			return [];
		},
	},
	// 模式选择，false单列， true多选
	mode: {
		type: Boolean,
		default: true,
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
const userStore = useUserStore();
const modelValueShow = ref<boolean>(false);
const dzTreeRef = ref(null);
const showCheckbox = ref<boolean>(false);
// 树形数据
const columnData = ref<Array>([]);
const defaultCheckedKeys = ref();
// 列是否还在滑动中，微信小程序如果在滑动中就点确定，结果可能不准确
const moving = ref<boolean>(false);
const filterValue = ref('');

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

const theme = computed(() => {
	return userStore.getTheme;
});

function init() {
	columnData.value = props.list;
	showCheckbox.value = props.mode;
	defaultCheckedKeys.value = props.defaultValue;
	// #ifdef MP-WEIXIN
	if (props.deleteValue.length) {
		dzTreeRef.value?.setCheckedKeys(props.deleteValue, false);
	}
	// #endif
}

function close() {
	emit('update:modelValue', false);
}
// 点击确定或者取消
function getResult(event = null) {
	const keys = dzTreeRef.value?.getCheckedKeys();
	// #ifdef MP-WEIXIN
	if (moving.value) return;
	// #endif
	if (event) emit(event, keys);
	close();
}

function handleFilterChange(e) {
	filterValue.value = e.detail.value;
}
</script>

<style scoped lang="scss">
@import '../libs/css/components.scss';

.dz-tree-select {
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
		height: 700rpx;
		padding: 12rpx;
		// overflow: hidden;
		background-color: #fff;
	}
}
</style>

<template>
	<view>
		<dz-popup
			:zoom="zoom"
			mode="center"
			:popup="false"
			:z-index="mZIndex"
			v-model:show="_show"
			:length="width"
			:mask-close-able="maskCloseAble"
			:border-radius="borderRadius"
			@close="popupClose"
			:negative-top="negativeTop"
		>
			<view class="dz-model">
				<view v-if="showTitle" class="dz-model__title dz-line-1" :style="[titleStyle]">{{ title }}</view>
				<view class="dz-model__content">
					<view :style="[contentStyle]" v-if="$slots.default || $slots.$default"><slot /></view>
					<view v-else class="dz-model__content__message" :style="[contentStyle]">{{ content }}</view>
				</view>
				<view class="dz-model__footer dz-border-top" v-if="showCancelButton || showConfirmButton || showCustomButton">
					<view
						v-if="showCancelButton"
						:hover-stay-time="100"
						hover-class="dz-model__btn--hover"
						class="dz-model__footer__button"
						:style="[cancelBtnStyle]"
						@tap="cancel"
					>
						{{ cancelText }}
					</view>
					<view
						v-if="showCustomButton"
						:hover-stay-time="100"
						hover-class="dz-model__btn--hover"
						class="dz-model__footer__button"
						:style="[customBtnStyle]"
						@tap="custom"
					>
						{{ customText }}
					</view>
					<view
						v-if="showConfirmButton || $slots['confirm-button']"
						:hover-stay-time="100"
						:hover-class="asyncClose ? 'none' : 'dz-model__btn--hover'"
						class="dz-model__footer__button hairline-left"
						:style="[confirmBtnStyle]"
						@tap="confirm"
					>
						<slot v-if="$slots['confirm-button']" name="confirm-button"></slot>
						<block v-else>
							<dz-loading mode="circle" :color="confirmColor" v-if="loading"></dz-loading>
							<block v-else>{{ confirmText }}</block>
						</block>
					</view>
				</view>
			</view>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
/**
 * modal 模态框
 * @description 弹出模态框，常用于消息提示、消息确认、在当前页面内完成特定的交互操作
 * @property {Boolean} value 是否显示模态框
 * @property {String | Number} z-index 层级
 * @property {String} title 模态框标题（默认"提示"）
 * @property {String | Number} width 模态框宽度（默认600）
 * @property {String} content 模态框内容（默认"内容"）
 * @property {Boolean} show-title 是否显示标题（默认true）
 * @property {Boolean} async-close 是否异步关闭，只对确定按钮有效（默认false）
 * @property {Boolean} show-confirm-button 是否显示确认按钮（默认true）
 * @property {Stringr | Number} negative-top modal往上偏移的值
 * @property {Boolean} show-cancel-button 是否显示取消按钮（默认false）
 * @property {Boolean} mask-close-able 是否允许点击遮罩关闭modal（默认false）
 * @property {String} confirm-text 确认按钮的文字内容（默认"确认"）
 * @property {String} cancel-text 取消按钮的文字内容（默认"取消"）
 * @property {String} cancel-color 取消按钮的颜色（默认"#606266"）
 * @property {String} confirm-color 确认按钮的文字内容（默认"#2979ff"）
 * @property {String | Number} border-radius 模态框圆角值，单位rpx（默认16）
 * @property {Object} title-style 自定义标题样式，对象形式
 * @property {Object} content-style 自定义内容样式，对象形式
 * @property {Object} cancel-style 自定义取消按钮样式，对象形式
 * @property {Object} confirm-style 自定义确认按钮样式，对象形式
 * @property {Boolean} zoom 是否开启缩放模式（默认true）
 * @event {Function} confirm 确认按钮被点击
 * @event {Function} cancel 取消按钮被点击
 * @example <dz-modal :src="title" :content="content"></dz-modal>
 */
import { ref, computed, watch } from 'vue';

const props = defineProps({
	// 是否显示Modal
	show: {
		type: Boolean,
		default: false,
	},
	// 层级z-index
	zIndex: {
		type: [Number, String],
		default: '',
	},
	// 标题
	title: {
		type: [String],
		default: '提示',
	},
	// 弹窗宽度，可以是数值(rpx)，百分比，auto等
	width: {
		type: [Number, String],
		default: 600,
	},
	// 弹窗内容
	content: {
		type: String,
		default: '内容',
	},
	// 是否显示标题
	showTitle: {
		type: Boolean,
		default: true,
	},
	// 是否显示确认按钮
	showConfirmButton: {
		type: Boolean,
		default: true,
	},
	// 是否显示取消按钮
	showCancelButton: {
		type: Boolean,
		default: false,
	},
	// 是否显示自定义按钮
	showCustomButton: {
		type: Boolean,
		default: false,
	},
	// 确认文案
	confirmText: {
		type: String,
		default: '确认',
	},
	//点击确认按钮事件值
	confirmValue: {
		type: [Number, String],
		default: '',
	},
	// 取消文案
	cancelText: {
		type: String,
		default: '取消',
	},
	// 自定义文案
	customText: {
		type: String,
		default: '跳转',
	},
	// 确认按钮颜色
	confirmColor: {
		type: String,
		default: '#2979ff',
	},
	// 取消文字颜色
	cancelColor: {
		type: String,
		default: '#606266',
	},
	customColor: {
		type: String,
		default: '#2979ff',
	},
	// 圆角值
	borderRadius: {
		type: [Number, String],
		default: 30,
	},
	// 标题的样式
	titleStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 内容的样式
	contentStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 取消按钮的样式
	cancelStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 确定按钮的样式
	confirmStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 自定义按钮的样式
	customStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 是否开启缩放效果
	zoom: {
		type: Boolean,
		default: true,
	},
	// 是否异步关闭，只对确定按钮有效
	asyncClose: {
		type: Boolean,
		default: false,
	},
	// 是否允许点击遮罩关闭modal
	maskCloseAble: {
		type: Boolean,
		default: false,
	},
	// 给一个负的margin-top，往上偏移，避免和键盘重合的情况
	negativeTop: {
		type: [String, Number],
		default: 0,
	},
});

const emit = defineEmits(['update:show', 'confirm', 'cancel', 'custom']);

defineExpose({
	clearLoading,
});

// 确认按钮是否正在加载中,
const loading = ref<boolean>(false);
const _show = ref<boolean>(props.show);
const cancelBtnStyle = computed(() => getCancelBtnStyle());

const confirmBtnStyle = computed(() => getConfirmBtnStyle());

const customBtnStyle = computed(() => getCustomBtnStyle());

const mZIndex = computed(() => {
	props.zIndex ? props.zIndex : uni.$api.zIndex.popup;
});

// 如果是异步关闭时，外部修改v-model的值为false时，重置内部的loading状态
// 避免下次打开的时候，状态混乱
watch(
	() => props.show,
	(n) => {
		_show.value = n;
		if (n === true) loading.value = false;
	}
);

function getCancelBtnStyle() {
	return Object.assign(
		{
			color: props.cancelColor,
		},
		props.cancelStyle
	);
}

function getConfirmBtnStyle() {
	return Object.assign(
		{
			color: props.confirmColor,
		},
		props.confirmStyle
	);
}

function getCustomBtnStyle() {
	return Object.assign(
		{
			color: props.customColor,
		},
		props.customStyle
	);
}

function confirm() {
	// 异步关闭
	if (props.asyncClose) {
		loading.value = true;
	} else {
		emit('update:show', false);
		_show.value = false;
	}
	emit('confirm', props.confirmValue);
}

function cancel() {
	emit('cancel');
	emit('update:show', false);
	_show.value = false;
	// 目前popup弹窗关闭有一个延时操作，此处做一个延时
	// 避免确认按钮文字变成了"确定"字样，modal还没消失，造成视觉不好的效果
	setTimeout(() => {
		loading.value = false;
	}, 300);
}

function custom() {
	// 自定义关闭
	emit('custom');
	emit('update:show', false);
	_show.value = false;
	// 目前popup弹窗关闭有一个延时操作，此处做一个延时
	// 避免确认按钮文字变成了"确定"字样，modal还没消失，造成视觉不好的效果
	setTimeout(() => {
		loading.value = false;
	}, 300);
}

// 点击遮罩关闭modal，设置v-model的值为false，否则无法第二次弹起modal
function popupClose() {
	emit('update:show', false);
	_show.value = false;
}
// 清除加载中的状态
function clearLoading() {
	loading.value = false;
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-model {
	height: auto;
	overflow: hidden;
	font-size: 32rpx;
	background-color: #fff;

	&__btn--hover {
		background-color: rgb(230, 230, 230);
	}

	&__title {
		padding-top: 48rpx;
		font-weight: 700;
		font-size: 36rpx;
		text-align: center;
		color: $dz-main-color;
	}

	&__content {
		&__message {
			padding: 48rpx;
			font-size: 30rpx;
			text-align: center;
			color: $dz-content-color;
		}
	}

	&__footer {
		@include flex(row);

		&__button {
			flex: 1;
			height: 100rpx;
			line-height: 100rpx;
			font-size: 32rpx;
			font-weight: 700;
			box-sizing: border-box;
			cursor: pointer;
			text-align: center;
			border-radius: 4rpx;
		}
	}
}
</style>

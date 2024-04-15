<template>
	<view class="dz-field" :class="{ 'dz-border-top': borderTop, 'dz-border-bottom': borderBottom }">
		<view class="dz-field-inner" :class="[type == 'textarea' ? 'dz-textarea-inner' : '', 'dz-label-postion-' + labelPosition]">
			<view
				class="dz-label"
				:class="[required ? 'dz-required' : '']"
				:style="{
					justifyContent: justifyContent(),
					flex: labelPosition == 'left' ? `0 0 ${labelWidth}rpx` : '1',
				}"
			>
				<view class="dz-icon-wrap" v-if="icon">
					<dz-icon size="32" :custom-style="iconStyle" :name="icon" :color="iconColor" class="dz-icon"></dz-icon>
				</view>
				<slot name="icon"></slot>
				<text class="dz-label-text" :class="[$slots.icon || icon ? 'dz-label-left-gap' : '']">{{ label }}</text>
			</view>
			<view class="fild-body">
				<view class="dz-flex-1 dz-flex" :style="[inputWrapStyle]">
					<textarea
						v-if="type == 'textarea'"
						class="dz-flex-1 dz-textarea-class"
						:style="[fieldStyle]"
						:value="modelValue"
						:placeholder="placeholder"
						:placeholderStyle="placeholderStyle"
						:disabled="disabled"
						:maxlength="inputMaxlength"
						:focus="focus"
						:autoHeight="autoHeight"
						:fixed="fixed"
						@input="onInput"
						@blur="onBlur"
						@focus="onFocus"
						@confirm="onConfirm"
						@tap="fieldClick"
					/>
					<input
						v-else
						:style="[fieldStyle]"
						:type="type"
						class="dz-flex-1 dz-field__input-wrap"
						:value="modelValue"
						:password="password || type === 'password'"
						:placeholder="placeholder"
						:placeholderStyle="placeholderStyle"
						:disabled="disabled"
						:maxlength="inputMaxlength"
						:focus="focus"
						:confirmType="confirmType"
						@focus="onFocus"
						@blur="onBlur"
						@input="onInput"
						@change="onInput"
						@confirm="onConfirm"
						@tap="fieldClick"
					/>
				</view>
				<dz-icon
					:size="clearSize"
					v-if="clearable && modelValue != '' && focused"
					name="roundclosefill"
					color="#c0c4cc"
					class="dz-clear-icon"
					@click="onClear"
				/>
				<view class="dz-button-wrap"><slot name="right" /></view>
				<dz-icon
					v-if="rightIcon"
					@click="rightIconClick"
					:name="rightIcon"
					color="#c0c4cc"
					:style="[rightIconStyle]"
					size="26"
					class="dz-arror-right"
				/>
			</view>
		</view>
		<view
			v-if="errorMessage !== false && errorMessage != ''"
			class="dz-error-message"
			:style="{
				paddingLeft: labelWidth + 'rpx',
			}"
			>{{ errorMessage }}</view
		>
	</view>
</template>

<script lang="ts">
/**
 * field 输入框
 * @description 借助此组件，可以实现表单的输入， 有"text"和"textarea"类型的，此外，借助picker和actionSheet组件可以快速实现上拉菜单，时间，地区选择等， 为表单解决方案的利器。
 * @property {String} type 输入框的类型（默认text）
 * @property {String} icon label左边的图标，限图标名称
 * @property {Object} icon-style 左边图标的样式，对象形式
 * @property {Boolean} right-icon 输入框右边的图标名称，限图标名称（默认false）
 * @property {Boolean} required 是否必填，左边您显示红色"*"号（默认false）
 * @property {String} label 输入框左边的文字提示
 * @property {Boolean} password 是否密码输入方式(用点替换文字)，type为text时有效（默认false）
 * @property {Boolean} clearable 是否显示右侧清空内容的图标控件(输入框有内容，且获得焦点时才显示)，点击可清空输入框内容（默认true）
 * @property {Number String} label-width label的宽度，单位rpx（默认130）
 * @property {String} label-align label的文字对齐方式（默认left）
 * @property {Object} field-style 自定义输入框的样式，对象形式
 * @property {Number | String} clear-size 清除图标的大小，单位rpx（默认30）
 * @property {String} input-align 输入框内容对齐方式（默认left）
 * @property {Boolean} border-bottom 是否显示field的下边框（默认true）
 * @property {Boolean} border-top 是否显示field的上边框（默认false）
 * @property {String} icon-color 左边通过icon配置的图标的颜色（默认#606266）
 * @property {Boolean} auto-height 是否自动增高输入区域，type为textarea时有效（默认true）
 * @property {String Boolean} error-message 显示的错误提示内容，如果为空字符串或者false，则不显示错误信息
 * @property {String} placeholder 输入框的提示文字
 * @property {String} placeholder-style placeholder的样式(内联样式，字符串)，如"color: #ddd"
 * @property {Boolean} focus 是否自动获得焦点（默认false）
 * @property {Boolean} fixed 如果type为textarea，且在一个"position:fixed"的区域，需要指明为true（默认false）
 * @property {Boolean} disabled 是否不可输入（默认false）
 * @property {Number String} maxlength 最大输入长度，设置为 -1 的时候不限制最大长度（默认140）
 * @property {String} confirm-type 设置键盘右下角按钮的文字，仅在type="text"时生效（默认done）
 * @event {Function} input 输入框内容发生变化时触发
 * @event {Function} focus 输入框获得焦点时触发
 * @event {Function} blur 输入框失去焦点时触发
 * @event {Function} confirm 点击完成按钮时触发
 * @event {Function} right-icon-click 通过right-icon生成的图标被点击时触发
 * @event {Function} click 输入框被点击或者通过right-icon生成的图标被点击时触发，这样设计是考虑到传递右边的图标，一般都为需要弹出"picker"等操作时的场景，点击倒三角图标，理应发出此事件，见上方说明
 * @example <dz-field v-model="mobile" label="手机号" required :error-message="errorMessage"></dz-field>
 */

import { ref, computed, defineComponent } from 'vue';
import props from './props';

export default defineComponent({
	name: 'dz-field',
	props,
	emits: ['update:modelValue', 'focus', 'blur', 'confirm', 'right-icon-click', 'click'],
	setup(props, { emit }) {
		const focused = ref<boolean>(false);
		const inputWrapStyle = computed(() => {
			let style = {};
			style.textAlign = props.inputAlign;
			// 判断lable的位置，如果是left的话，让input左边两边有间隙
			if (props.labelPosition == 'left') {
				style.margin = `0 8rpx`;
			} else {
				// 如果lable是top的，input的左边就没必要有间隙了
				style.marginRight = `8rpx`;
			}
			return style;
		});

		const rightIconStyle = computed(() => {
			let style = {};
			if (props.arrowDirection == 'top') style.transform = 'roate(-90deg)';
			if (props.arrowDirection == 'bottom') style.transform = 'roate(90deg)';
			else style.transform = 'roate(0deg)';
			return style;
		});

		// 因为uniapp的input组件的maxlength组件必须要数值，这里转为数值，给用户可以传入字符串数值
		const inputMaxlength = computed(() => {
			return Number(props.maxlength);
		});

		// uni不支持在computed中写style.justifyContent = 'center'的形式，故用此方法
		function justifyContent() {
			if (props.labelAlign == 'left') return 'flex-start';
			if (props.labelAlign == 'center') return 'center';
			if (props.labelAlign == 'right') return 'flex-end';
		}

		function onInput(event) {
			let value = event.detail.value;
			// 判断是否去除空格
			if (props.trim) value = uni.$api.trim(value);
			emit('update:modelValue', value);
		}
		function onFocus(event) {
			focused.value = true;
			emit('focus', event);
		}
		function onBlur(event) {
			// 最开始使用的是监听图标@touchstart事件，自从hx2.8.4后，此方法在微信小程序出错
			// 这里改为监听点击事件，手点击清除图标时，同时也发生了@blur事件，导致图标消失而无法点击，这里做一个延时
			setTimeout(() => {
				focused.value = false;
			}, 100);
			emit('blur', event);
		}
		function onConfirm(e) {
			emit('confirm', e.detail.value);
		}
		function onClear(event) {
			emit('update:modelValue', '');
		}
		function rightIconClick() {
			emit('right-icon-click');
			emit('click');
		}
		function fieldClick() {
			emit('click');
		}

		return {
			focused,
			inputWrapStyle,
			rightIconStyle,
			justifyContent,
			inputMaxlength,
			onInput,
			onFocus,
			onBlur,
			onConfirm,
			onClear,
			rightIconClick,
			fieldClick,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-field {
	font-size: 28rpx;
	padding: 20rpx 28rpx;
	text-align: left;
	position: relative;
	color: $dz-main-color;
}

.dz-field-inner {
	@include flex;
	align-items: center;
}

.dz-textarea-inner {
	align-items: flex-start;
}

.dz-textarea-class {
	min-height: 96rpx;
	width: auto;
	font-size: 28rpx;
}

.fild-body {
	@include flex;
	flex: 1;
	align-items: center;
}

.dz-arror-right {
	margin-left: 8rpx;
}

.dz-label-text {
	/* #ifndef APP-NVUE */
	display: inline-flex;
	/* #endif */
}

.dz-label-left-gap {
	margin-left: 6rpx;
}

.dz-label-postion-top {
	flex-direction: column;
	align-items: flex-start;
}

.dz-label {
	width: 130rpx;
	flex: 1 1 130rpx;
	text-align: left;
	position: relative;
	@include flex;
	align-items: center;
}

.dz-required::before {
	content: '*';
	position: absolute;
	left: -16rpx;
	font-size: 14px;
	color: $dz-type-error;
	height: 9px;
	line-height: 1;
}

.dz-field__input-wrap {
	position: relative;
	overflow: hidden;
	font-size: 28rpx;
	height: 48rpx;
	flex: 1;
	width: auto;
}

.dz-clear-icon {
	@include flex;
	align-items: center;
}

.dz-error-message {
	color: $dz-type-error;
	font-size: 26rpx;
	text-align: left;
}

.placeholder-style {
	color: rgb(150, 151, 153);
}

.dz-input-class {
	font-size: 28rpx;
}

.dz-button-wrap {
	margin-left: 8rpx;
}
</style>

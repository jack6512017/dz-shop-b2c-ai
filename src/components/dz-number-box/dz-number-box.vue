<template>
	<view class="dz-number-box">
		<view
			class="dz-number-box__slot"
			@tap.stop="clickHandler('minus')"
			@touchstart="onTouchStart('minus')"
			@touchend.stop="handleClearTimeout"
			v-if="showMinus && $slots.minus"
		>
			<slot name="minus" />
		</view>
		<view
			v-else-if="showMinus"
			class="dz-number-box__minus"
			@tap.stop="clickHandler('minus')"
			@touchstart="onTouchStart('minus')"
			@touchend.stop="handleClearTimeout"
			hover-class="dz-number-box__minus--hover"
			hover-stay-time="150"
			:class="{ 'dz-number-box__minus--disabled': isDisabled('minus') }"
			:style="[buttonStyle('minus')]"
		>
			<dz-icon name="move" :color="isDisabled('minus') ? '#c8c9cc' : '#323233'" size="30" bold :customStyle="iconStyle"></dz-icon>
		</view>

		<slot name="input">
			<input
				:disabled="disabledInput || disabled"
				:cursor-spacing="getCursorSpacing"
				:class="{ 'dz-number-box__input--disabled': disabled || disabledInput }"
				v-model="currentValue"
				class="dz-number-box__input"
				@blur="onBlur"
				@focus="onFocus"
				@input="onInput"
				:type="type"
				:style="[inputStyle]"
			/>
		</slot>
		<view
			class="dz-number-box__slot"
			@tap.stop="clickHandler('plus')"
			@touchstart="onTouchStart('plus')"
			@touchend.stop="handleClearTimeout"
			v-if="showPlus && $slots.plus"
		>
			<slot name="plus" />
		</view>
		<view
			v-else-if="showPlus"
			class="dz-number-box__plus"
			@tap.stop="clickHandler('plus')"
			@touchstart="onTouchStart('plus')"
			@touchend.stop="handleClearTimeout"
			hover-class="dz-number-box__plus--hover"
			hover-stay-time="150"
			:class="{ 'dz-number-box__minus--disabled': isDisabled('plus') }"
			:style="[buttonStyle('plus')]"
		>
			<dz-icon name="add" :color="isDisabled('plus') ? '#c8c9cc' : '#323233'" size="30" bold :customStyle="iconStyle"></dz-icon>
		</view>
	</view>
</template>

<script lang="ts">
import props from './props';
/**
 * numberBox 步进器
 * @description 该组件一般用于商城购物选择物品数量的场景。
 * @tutorial https://uviewui.com/components/numberBox.html
 * @property {String | Number}	name			步进器标识符，在change回调返回
 * @property {String | Number}	modelValue			用于双向绑定的值，初始化时设置设为默认min值(最小值)  （默认 0 ）
 * @property {String | Number}	min				最小值 （默认 1 ）
 * @property {String | Number}	max				最大值 （默认 Number.MAX_SAFE_INTEGER ）
 * @property {String | Number}	step			加减的步长，可为小数 （默认 1 ）
 * @property {Boolean}			integer			是否只允许输入整数 （默认 false ）
 * @property {Boolean}			disabled		是否禁用，包括输入框，加减按钮 （默认 false ）
 * @property {Boolean}			disabledInput	是否禁用输入框 （默认 false ）
 * @property {Boolean}			asyncChange		是否开启异步变更，开启后需要手动控制输入值 （默认 false ）
 * @property {String | Number}	inputWidth		输入框宽度，单位为px （默认 35 ）
 * @property {Boolean}			showMinus		是否显示减少按钮 （默认 true ）
 * @property {Boolean}			showPlus		是否显示增加按钮 （默认 true ）
 * @property {String | Number}	decimalLength	显示的小数位数
 * @property {Boolean}			longPress		是否开启长按加减手势 （默认 true ）
 * @property {String}			color			输入框文字和加减按钮图标的颜色 （默认 '#323233' ）
 * @property {String | Number}	buttonSize		按钮大小，宽高等于此值，单位px，输入框高度和此值保持一致 （默认 30 ）
 * @property {String}			bgColor			输入框和按钮的背景颜色 （默认 '#EBECEE' ）
 * @property {String | Number}	cursorSpacing	指定光标于键盘的距离，避免键盘遮挡输入框，单位px （默认 100 ）
 * @property {Boolean}			disablePlus		是否禁用增加按钮 （默认 false ）
 * @property {Boolean}			disableMinus	是否禁用减少按钮 （默认 false ）
 * @property {Object ｜ String}	iconStyle		加减按钮图标的样式
 *
 * @event {Function}	onFocus	输入框活动焦点
 * @event {Function}	onBlur	输入框失去焦点
 * @event {Function}	onInput	输入框值发生变化
 * @event {Function}	onChange
 * @example <dz-number-box v-model="value" @change="valChange"></dz-number-box>
 */
import { ref, watch, onMounted, computed, getCurrentInstance, defineComponent, nextTick } from 'vue';
export default defineComponent({
	name: 'dz-number-box',
	props,
	emits: ['focus', 'blur', 'update:modelValue', 'change', 'overlimit'],
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();
		// 输入框实际操作的值
		const currentValue = ref('');
		const type = ref('');
		// 定时器
		const longPressTimer = ref(null);
		// 多个值之间，只要一个值发生变化，都要重新检查check()函数
		watch(
			() => [props.integer, props.decimalLength, props.min, props.max],
			() => {
				check();
			}
		);
		// 监听v-model的变化，重新初始化内部的值
		watch(
			() => props.modelValue,
			(n) => {
				if (n !== currentValue.value) {
					currentValue.value = format(props.modelValue);
				}
			},
			{
				immediate: true,
			}
		);
		const getCursorSpacing = computed(() => {
			// 判断传入的单位，如果为px单位，需要转成px
			return uni.$api.getPx(props.cursorSpacing);
		});
		function isDisabled(e) {
			if (e === 'plus') {
				// 在点击增加按钮情况下，判断整体的disabled，是否单独禁用增加按钮，以及当前值是否大于最大的允许值
				return props.disabled || props.disablePlus || currentValue.value >= props.max;
			}
			// 点击减少按钮同理
			return props.disabled || props.disableMinus || currentValue.value <= props.min;
		}
		// 按钮的样式
		const buttonStyle = computed(() => (e) => {
			const style = {
				backgroundColor: props.bgColor,
				height: uni.$api.addUnit(props.buttonSize),
				color: props.color,
			};
			if (isDisabled(e)) {
				style.backgroundColor = '#f7f8fa';
			}
			return style;
		});
		// 输入框的样式
		const inputStyle = computed(() => {
			const disabled = props.disabled || props.disabledInput;
			const style = {
				color: props.color,
				backgroundColor: props.bgColor,
				height: uni.$api.addUnit(props.buttonSize),
				width: uni.$api.addUnit(props.inputWidth),
			};
			return style;
		});
		onMounted(() => {
			init();
		});

		function init() {
			currentValue.value = format(props.modelValue);
		}
		// 格式化整理数据，限制范围
		function format(value) {
			value = filter(value);
			// 如果为空字符串，那么设置为0，同时将值转为Number类型
			value = value === '' ? 0 : +value;
			// 对比最大最小值，取在min和max之间的值
			value = Math.max(Math.min(props.max, value), props.min);
			// 如果设定了最大的小数位数，使用toFixed去进行格式化
			if (props.decimalLength !== null) {
				value = value.toFixed(props.decimalLength);
			}
			return value;
		}
		// 过滤非法的字符
		function filter(value) {
			// 只允许0-9之间的数字，"."为小数点，"-"为负数时候使用
			value = String(value).replace(/[^0-9.-]/g, '');
			// 如果只允许输入整数，则过滤掉小数点后的部分
			if (props.integer && value.indexOf('.') !== -1) {
				value = value.split('.')[0];
			}
			return value;
		}
		function check() {
			// 格式化了之后，如果前后的值不相等，那么设置为格式化后的值
			const val = format(currentValue.value);
			if (val !== currentValue.value) {
				currentValue.value = val;
			}
		}
		// 输入框活动焦点
		function onFocus(event: Event) {
			emit('focus', {
				...event.detail,
				name: props.name,
			});
		}
		// 输入框失去焦点
		function onBlur(event: Event) {
			// 对输入值进行格式化
			const value = format(event.detail.value);
			// 发出blur事件
			emit('blur', {
				...event.detail,
				name: props.name,
			});
		}
		// 输入框值发生变化
		function onInput(e) {
			const { value = '' } = e.detail || {};
			// 为空返回
			if (value === '') return;
			let formatted = filter(value);
			// 最大允许的小数长度
			if (props.decimalLength !== null && formatted.indexOf('.') !== -1) {
				const pair = formatted.split('.');
				formatted = `${pair[0]}.${pair[1].slice(0, props.decimalLength)}`;
			}
			formatted = format(formatted);
			emitChange(formatted);
		}
		// 发出change事件
		function emitChange(value) {
			// 如果开启了异步变更值，则不修改内部的值，需要用户手动在外部通过v-model变更
			if (!props.asyncChange) {
				nextTick(() => {
					emit('update:modelValue', value);
					currentValue.value = value;
					proxy.$forceUpdate();
				});
			}
			emit('change', {
				value,
				name: props.name,
			});
		}
		function onChange() {
			if (isDisabled(type.value)) {
				return emit('overlimit', type.value);
			}
			const diff = type.value === 'minus' ? -props.step : +props.step;
			const value = format(add(+currentValue.value, diff));
			emitChange(value);
			emit(type.value);
		}
		// 对值扩大后进行四舍五入，再除以扩大因子，避免出现浮点数操作的精度问题
		function add(num1, num2) {
			const cardinal = Math.pow(10, 10);
			return Math.round((num1 + num2) * cardinal) / cardinal;
		}
		// 点击加减按钮
		function clickHandler(e) {
			type.value = e;
			onChange();
		}
		function longPressStep() {
			// 每隔一段时间，重新调用longPressStep方法，实现长按加减
			handleClearTimeout();
			longPressTimer.value = setTimeout(() => {
				onChange();
				longPressStep();
			}, 250);
		}
		function onTouchStart(v) {
			if (!props.longPress) return;
			handleClearTimeout();
			type.value = v;
			// 一定时间后，默认达到长按状态
			longPressTimer.value = setTimeout(() => {
				onChange();
				longPressStep();
			}, 600);
		}
		// 触摸结束，清除定时器，停止长按加减
		function onTouchEnd() {
			if (!props.longPress) return;
			handleClearTimeout();
		}
		// 清除定时器
		function handleClearTimeout() {
			clearTimeout(longPressTimer.value);
			longPressTimer.value = null;
		}

		return {
			clickHandler,
			onTouchStart,
			handleClearTimeout,
			isDisabled,
			buttonStyle,
			getCursorSpacing,
			currentValue,
			onBlur,
			onFocus,
			onInput,
			onChange,
			inputStyle,
			onTouchEnd,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

$dz-numberBox-hover-bgColor: #e6e6e6 !default;
$dz-numberBox-disabled-color: #c8c9cc !default;
$dz-numberBox-disabled-bgColor: #f7f8fa !default;
$dz-numberBox-plus-radius: 4px !default;
$dz-numberBox-minus-radius: 4px !default;
$dz-numberBox-input-text-align: center !default;
$dz-numberBox-input-font-size: 15px !default;
$dz-numberBox-input-padding: 0 !default;
$dz-numberBox-input-margin: 0 2px !default;
$dz-numberBox-input-disabled-color: #c8c9cc !default;
$dz-numberBox-input-disabled-bgColor: #f2f3f5 !default;

.dz-number-box {
	@include flex(row);
	align-items: center;

	&__slot {
		/* #ifndef APP-NVUE */
		touch-action: none;
		/* #endif */
	}

	&__plus,
	&__minus {
		width: 35px;
		@include flex;
		justify-content: center;
		align-items: center;
		/* #ifndef APP-NVUE */
		touch-action: none;
		/* #endif */

		&--hover {
			background-color: $dz-numberBox-hover-bgColor !important;
		}

		&--disabled {
			color: $dz-numberBox-disabled-color;
			background-color: $dz-numberBox-disabled-bgColor;
		}
	}

	&__plus {
		border-top-right-radius: $dz-numberBox-plus-radius;
		border-bottom-right-radius: $dz-numberBox-plus-radius;
	}

	&__minus {
		border-top-left-radius: $dz-numberBox-minus-radius;
		border-bottom-left-radius: $dz-numberBox-minus-radius;
	}

	&__input {
		position: relative;
		text-align: $dz-numberBox-input-text-align;
		font-size: $dz-numberBox-input-font-size;
		padding: $dz-numberBox-input-padding;
		margin: $dz-numberBox-input-margin;
		@include flex;
		align-items: center;
		justify-content: center;

		&--disabled {
			color: $dz-numberBox-input-disabled-color;
			background-color: $dz-numberBox-input-disabled-bgColor;
		}
	}
}
</style>

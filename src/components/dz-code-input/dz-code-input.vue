<template>
	<view class="dz-char-box">
		<view class="dz-char-flex">
			<input :disabled="disabledKeyboard" :value="inputValue" type="number" :focus="focus" :maxlength="maxlength" class="dz-input" @input="getVal" />
			<view v-for="(item, index) in loopCharArr" :key="index">
				<view
					:class="[
						breathe && charArrLength == index ? 'dz-breathe' : '',
						'dz-char-item',
						charArrLength === index && mode == 'box' ? 'dz-box-active' : '',
						mode === 'box' ? 'dz-box' : '',
					]"
					:style="{
						fontWeight: bold ? 'bold' : 'normal',
						fontSize: fontSize + 'rpx',
						width: width + 'rpx',
						height: width + 'rpx',
						color: inactiveColor,
						borderColor: charArrLength === index && mode == 'box' ? activeColor : inactiveColor,
					}"
				>
					<view
						class="dz-placeholder-line"
						:style="{
							display: charArrLength === index ? 'block' : 'none',
							height: width * 0.5 + 'rpx',
						}"
						v-if="mode !== 'middleLine'"
					></view>
					<view
						v-if="mode === 'middleLine' && charArrLength <= index"
						:class="[breathe && charArrLength == index ? 'dz-breathe' : '', charArrLength === index ? 'dz-middle-line-active' : '']"
						class="dz-middle-line"
						:style="{ height: bold ? '4px' : '2px', background: charArrLength === index ? activeColor : inactiveColor }"
					></view>
					<view
						v-if="mode === 'bottomLine'"
						:class="[breathe && charArrLength == index ? 'dz-breathe' : '', charArrLength === index ? 'dz-buttom-line-active' : '']"
						class="dz-bottom-line"
						:style="{ height: bold ? '4px' : '2px', background: charArrLength === index ? activeColor : inactiveColor }"
					></view>
					<block v-if="!dotFill"> {{ charArr[index] ? charArr[index] : '' }}</block>
					<block v-else>
						<text class="dz-dot">{{ charArr[index] ? '●' : '' }}</text>
					</block>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
/**
 * messageInput 验证码输入框
 * @description 该组件一般用于验证用户短信验证码的场景，也可以结合键盘组件使用
 * @property {String Number} maxlength 输入字符个数（默认4）
 * @property {Boolean} dot-fill 是否用圆点填充（默认false）
 * @property {String} mode 模式选择，见上方"基本使用"说明（默认box）
 * @property {String Number} value 预置值
 * @property {Boolean} breathe 是否开启呼吸效果，见上方说明（默认true）
 * @property {Boolean} focus 是否自动获取焦点（默认false）
 * @property {Boolean} bold 字体和输入横线是否加粗（默认true）
 * @property {String Number} font-size 字体大小，单位rpx（默认60）
 * @property {String} active-color 当前激活输入框的样式（默认#2979ff）
 * @property {String} inactive-color 非激活输入框的样式，文字颜色同此值（默认#606266）
 * @property {String | Number} width 输入框宽度，单位rpx，高等于宽（默认80）
 * @property {Boolean} disabled-keyboard 禁止点击输入框唤起系统键盘（默认false）
 * @event {Function} change 输入内容发生改变时触发，具体见官网说明
 * @event {Function} finish 输入字符个数达maxlength值时触发，见官网说明
 * @example <dz-message-input mode="bottomLine"></dz-message-input>
 */
import { ref, watch, computed, defineComponent } from 'vue';
import props from './props';

export default defineComponent({
	name: 'dz-code-input',
	props,
	emit: ['change', 'finish'],
	setup(props, { emit }) {
		const inputValue = ref<string | number>('');
		watch(
			() => props.value,
			(val) => {
				// 转为字符串
				val = String(val);
				// 超出部分截掉
				inputValue.value = val.substring(0, props.maxlength);
				// change---长度到达，发送finish事件
				if (String(inputValue.value).length == props.maxlength) {
					emit('finish', inputValue.value);
				}
			},
			{
				immediate: true,
			}
		);

		// 用于显示字符
		const charArr = computed(() => {
			return inputValue.value.split('');
		});

		const charArrLength = computed(() => {
			return charArr.value.length;
		});

		// 根据长度，循环输入框的个数，因为头条小程序数值不能用于v-for
		const loopCharArr = computed(() => {
			return new Array(props.maxlength);
		});

		function getVal(e) {
			let { value } = e.detail;
			inputValue.value = value;
			// 判断长度是否超出了maxlength值，理论上不会发生，因为input组件设置了maxlength属性值
			if (String(value).length > props) return;
			// 未达到maxlength之前，发送change事件，达到后发送finish事件
			emit('change', value);
			if (String(value).length == props) {
				emit('finish', value);
			}
		}

		return {
			inputValue,
			getVal,
			charArr,
			charArrLength,
			loopCharArr,
		};
	},
});
</script>

<style scoped lang="scss">
@import '../libs/css/components.scss';

@keyframes breathe {
	0% {
		opacity: 0.3;
	}

	50% {
		opacity: 1;
	}

	100% {
		opacity: 0.3;
	}
}

.dz-char-box {
	text-align: center;
}

.dz-char-flex {
	@include flex;
	justify-content: center;
	flex-wrap: wrap;
	position: relative;
}

.dz-input {
	position: absolute;
	top: 0;
	left: -100%;
	width: 200%;
	height: 100%;
	text-align: left;
	z-index: 9;
	opacity: 0;
	background: none;
}

.dz-char-item {
	position: relative;
	width: 90rpx;
	height: 90rpx;
	margin: 10rpx 10rpx;
	font-size: 60rpx;
	font-weight: bold;
	color: $dz-main-color;
	line-height: 90rpx;
	@include flex;
	justify-content: center;
	align-items: center;
}

.dz-middle-line {
	border: none;
}

.dz-box {
	box-sizing: border-box;
	border: 2rpx solid #cccccc;
	border-radius: 6rpx;
}

.dz-box-active {
	overflow: hidden;
	animation-timing-function: ease-in-out;
	animation-duration: 1500ms;
	animation-iteration-count: infinite;
	animation-direction: alternate;
	border: 2rpx solid $dz-type-primary;
}

.dz-middle-line-active {
	background: $dz-type-primary;
}

.dz-breathe {
	animation: breathe 2s infinite ease;
}

.dz-placeholder-line {
	/* #ifndef APP-NVUE */
	display: none;
	/* #endif */
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	width: 2rpx;
	height: 40rpx;
	background: #333333;
	animation: twinkling 1.5s infinite ease;
}

.dz-animation-breathe {
	animation-name: breathe;
}

.dz-dot {
	font-size: 34rpx;
	line-height: 34rpx;
}

.dz-middle-line {
	height: 4px;
	background: #000000;
	width: 80%;
	position: absolute;
	border-radius: 2px;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.dz-buttom-line-active {
	background: $dz-type-primary;
}

.dz-bottom-line {
	height: 4px;
	background: #000000;
	width: 80%;
	position: absolute;
	border-radius: 2px;
	bottom: 0;
	left: 50%;
	transform: translate(-50%);
}
</style>

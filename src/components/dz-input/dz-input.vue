<template>
	<view class="dz-input" :class="inputClass" :style="[wrapperStyle]">
		<view class="dz-input__content">
			<view class="dz-input__content__prefix-icon" v-if="prefixIcon || $slots.prefix">
				<slot name="prefix">
					<dz-icon :name="prefixIcon" size="30" :customStyle="prefixIconStyle"></dz-icon>
				</slot>
			</view>
			<view class="dz-input__content__field-wrapper" @tap="clickHandler">
				<!-- 根据uni-app的input组件文档，H5和APP中只要声明了password参数(无论true还是false)，type均失效，此时
					为了防止type=number时，又存在password属性，type无效，此时需要设置password为undefined
				 -->
				<input
					class="dz-input__content__field-wrapper__field"
					:style="[inputStyle]"
					:type="type"
					:focus="focus"
					:cursor="cursor"
					:value="innerValue"
					:auto-blur="autoBlur"
					:disabled="disabled || readonly"
					:maxlength="maxlength"
					:placeholder="placeholder"
					:placeholder-style="placeholderStyle"
					:placeholder-class="placeholderClass"
					:confirm-type="confirmType"
					:confirm-hold="confirmHold"
					:hold-keyboard="holdKeyboard"
					:cursor-spacing="cursorSpacing"
					:adjust-position="adjustPosition"
					:selection-end="selectionEnd"
					:selection-start="selectionStart"
					:password="password || type === 'password' || undefined"
					:ignoreCompositionEvent="ignoreCompositionEvent"
					@input="onInput"
					@blur="onBlur"
					@focus="onFocus"
					@confirm="onConfirm"
					@change="onInput"
					@keyboardheightchange="onkeyboardheightchange"
				/>
			</view>
			<view class="dz-input__content__clear" v-if="isShowClear" @tap="onClear">
				<dz-icon name="close" size="22" color="#ffffff" customStyle="line-height: 12px"></dz-icon>
			</view>
			<view class="dz-input__content__subfix-icon" v-if="suffixIcon || $slots.suffix">
				<slot name="suffix">
					<dz-icon :name="suffixIcon" size="32" :customStyle="suffixIconStyle"></dz-icon>
				</slot>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { ref, watch, computed, getCurrentInstance, defineComponent, nextTick } from 'vue';
import type { CSSProperties } from 'vue';
/**
 * Input 输入框
 * @description  此组件为一个输入框，默认没有边框和样式，是专门为配合表单组件dz-form而设计的，利用它可以快速实现表单验证，输入内容，下拉选择等功能。
 * @tutorial https://uviewui.com/components/input.html
 * @property {String | Number}	value					输入的值
 * @property {String}			type					输入框类型，见上方说明 （ 默认 'text' ）
 * @property {Boolean}			fixed					如果 textarea 是在一个 position:fixed 的区域，需要显示指定属性 fixed 为 true，兼容性：微信小程序、百度小程序、字节跳动小程序、QQ小程序 （ 默认 false ）
 * @property {Boolean}			disabled				是否禁用输入框 （ 默认 false ）
 * @property {String}			disabledColor			禁用状态时的背景色（ 默认 '#f5f7fa' ）
 * @property {Boolean}			clearable				是否显示清除控件 （ 默认 false ）
 * @property {Boolean}			password				是否密码类型 （ 默认 false ）
 * @property {String | Number}	maxlength				最大输入长度，设置为 -1 的时候不限制最大长度 （ 默认 -1 ）
 * @property {String}			placeholder				输入框为空时的占位符
 * @property {String}			placeholderClass		指定placeholder的样式类，注意页面或组件的style中写了scoped时，需要在类名前写/deep/ （ 默认 'input-placeholder' ）
 * @property {String | Object}	placeholderStyle		指定placeholder的样式，字符串/对象形式，如"color: red;"
 * @property {Boolean}			showWordLimit			是否显示输入字数统计，只在 type ="text"或type ="textarea"时有效 （ 默认 false ）
 * @property {String}			confirmType				设置右下角按钮的文字，兼容性详见uni-app文档 （ 默认 'done' ）
 * @property {Boolean}			confirmHold				点击键盘右下角按钮时是否保持键盘不收起，H5无效 （ 默认 false ）
 * @property {Boolean}			holdKeyboard			focus时，点击页面的时候不收起键盘，微信小程序有效 （ 默认 false ）
 * @property {Boolean}			focus					自动获取焦点，在 H5 平台能否聚焦以及软键盘是否跟随弹出，取决于当前浏览器本身的实现。nvue 页面不支持，需使用组件的 focus()、blur() 方法控制焦点 （ 默认 false ）
 * @property {Boolean}			autoBlur				键盘收起时，是否自动失去焦点，目前仅App3.0.0+有效 （ 默认 false ）
 * @property {Boolean}			disableDefaultPadding	是否去掉 iOS 下的默认内边距，仅微信小程序，且type=textarea时有效 （ 默认 false ）
 * @property {String ｜ Number}	cursor					指定focus时光标的位置（ 默认 -1 ）
 * @property {String ｜ Number}	cursorSpacing			输入框聚焦时底部与键盘的距离 （ 默认 30 ）
 * @property {String ｜ Number}	selectionStart			光标起始位置，自动聚集时有效，需与selection-end搭配使用 （ 默认 -1 ）
 * @property {String ｜ Number}	selectionEnd			光标结束位置，自动聚集时有效，需与selection-start搭配使用 （ 默认 -1 ）
 * @property {Boolean}			adjustPosition			键盘弹起时，是否自动上推页面 （ 默认 true ）
 * @property {String}			inputAlign				输入框内容对齐方式（ 默认 'left' ）
 * @property {String | Number}	fontSize				输入框字体的大小 （ 默认 '15px' ）
 * @property {String}			color					输入框字体颜色	（ 默认 '#303133' ）
 * @property {Function}			formatter			    内容式化函数
 * @property {String}			prefixIcon				输入框前置图标
 * @property {String | Object}	prefixIconStyle			前置图标样式，对象或字符串
 * @property {String}			suffixIcon				输入框后置图标
 * @property {String | Object}	suffixIconStyle			后置图标样式，对象或字符串
 * @property {String}			border					边框类型，surround-四周边框，bottom-底部边框，none-无边框 （ 默认 'surround' ）
 * @property {Boolean}			readonly				是否只读，与disabled不同之处在于disabled会置灰组件，而readonly则不会 （ 默认 false ）
 * @property {String}			shape					输入框形状，circle-圆形，square-方形 （ 默认 'square' ）
 * @property {Object}			customStyle				定义需要用到的外部样式
 * @property {Boolean}			ignoreCompositionEvent	是否忽略组件内对文本合成系统事件的处理。
 * @example <dz-input v-model="value" :password="true" suffix-icon="lock-fill" />
 */

const props = {
	// 输入的值
	modelValue: {
		type: [String, Number],
		default: '',
	},
	// 输入框类型
	// number-数字输入键盘，app-vue下可以输入浮点数，app-nvue和小程序平台下只能输入整数
	// idcard-身份证输入键盘，微信、支付宝、百度、QQ小程序
	// digit-带小数点的数字键盘，App的nvue页面、微信、支付宝、百度、头条、QQ小程序
	// text-文本输入键盘
	type: {
		type: String,
		default: 'text',
	},
	// 如果 textarea 是在一个 position:fixed 的区域，需要显示指定属性 fixed 为 true，
	// 兼容性：微信小程序、百度小程序、字节跳动小程序、QQ小程序
	fixed: {
		type: Boolean,
		default: false,
	},
	// 是否禁用输入框
	disabled: {
		type: Boolean,
		default: false,
	},
	// 禁用状态时的背景色
	disabledColor: {
		type: String,
		default: '#f5f7fa',
	},
	// 是否显示清除控件
	clearable: {
		type: Boolean,
		default: false,
	},
	// 是否密码类型
	password: {
		type: Boolean,
		default: false,
	},
	// 最大输入长度，设置为 -1 的时候不限制最大长度
	maxlength: {
		type: [String, Number],
		default: -1,
	},
	// 	输入框为空时的占位符
	placeholder: {
		type: String,
		default: null,
	},
	// 指定placeholder的样式类，注意页面或组件的style中写了scoped时，需要在类名前写/deep/
	placeholderClass: {
		type: String,
		default: 'input-placeholder',
	},
	// 指定placeholder的样式
	placeholderStyle: {
		type: [String, Object],
		default: 'color: #c0c4cc',
	},
	// 是否显示输入字数统计，只在 type ="text"或type ="textarea"时有效
	showWordLimit: {
		type: Boolean,
		default: false,
	},
	// 设置右下角按钮的文字，有效值：send|search|next|go|done，兼容性详见uni-app文档
	// https://uniapp.dcloud.io/component/input
	// https://uniapp.dcloud.io/component/textarea
	confirmType: {
		type: String,
		default: 'done',
	},
	// 点击键盘右下角按钮时是否保持键盘不收起，H5无效
	confirmHold: {
		type: Boolean,
		default: false,
	},
	// focus时，点击页面的时候不收起键盘，微信小程序有效
	holdKeyboard: {
		type: Boolean,
		default: false,
	},
	// 自动获取焦点
	// 在 H5 平台能否聚焦以及软键盘是否跟随弹出，取决于当前浏览器本身的实现。nvue 页面不支持，需使用组件的 focus()、blur() 方法控制焦点
	focus: {
		type: Boolean,
		default: false,
	},
	// 键盘收起时，是否自动失去焦点，目前仅App3.0.0+有效
	autoBlur: {
		type: Boolean,
		default: false,
	},
	// 是否去掉 iOS 下的默认内边距，仅微信小程序，且type=textarea时有效
	disableDefaultPadding: {
		type: Boolean,
		default: false,
	},
	// 指定focus时光标的位置
	cursor: {
		type: [String, Number],
		default: -1,
	},
	// 输入框聚焦时底部与键盘的距离
	cursorSpacing: {
		type: [String, Number],
		default: 30,
	},
	// 光标起始位置，自动聚集时有效，需与selection-end搭配使用
	selectionStart: {
		type: [String, Number],
		default: -1,
	},
	// 光标结束位置，自动聚集时有效，需与selection-start搭配使用
	selectionEnd: {
		type: [String, Number],
		default: -1,
	},
	// 键盘弹起时，是否自动上推页面
	adjustPosition: {
		type: Boolean,
		default: true,
	},
	// 输入框内容对齐方式，可选值为：left|center|right
	inputAlign: {
		type: String,
		default: 'left',
	},
	// 输入框字体的大小
	fontSize: {
		type: [String, Number],
		default: '15px',
	},
	// 输入框字体颜色
	color: {
		type: String,
		default: '#303133',
	},
	// 输入框前置图标
	prefixIcon: {
		type: String,
		default: '',
	},
	// 前置图标样式，对象或字符串
	prefixIconStyle: {
		type: [String, Object],
		default: '',
	},
	// 输入框后置图标
	suffixIcon: {
		type: String,
		default: '',
	},
	// 后置图标样式，对象或字符串
	suffixIconStyle: {
		type: [String, Object],
		default: '',
	},
	// 边框类型，surround-四周边框，bottom-底部边框，none-无边框
	border: {
		type: String,
		default: 'surround',
	},
	// 是否只读，与disabled不同之处在于disabled会置灰组件，而readonly则不会
	readonly: {
		type: Boolean,
		default: false,
	},
	// 输入框形状，circle-圆形，square-方形
	shape: {
		type: String,
		default: 'square',
	},
	// 用于处理或者过滤输入框内容的方法
	formatter: {
		type: [Function, null],
		default: null,
	},
	// 是否忽略组件内对文本合成系统事件的处理
	ignoreCompositionEvent: {
		type: Boolean,
		default: true,
	},
	customStyle: {
		type: [Object, String],
		default: () => ({}),
	},
};

export default defineComponent({
	name: 'dz-input',
	props,
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	emits: ['blur', 'focus', 'confirm', 'keyboardheightchange', 'update:modelValue', 'change', 'clear'],
	setup(props, { emit }) {
		// 输入框的值
		const innerValue = ref<string | number>('');
		// 是否处于获得焦点状态
		const focused = ref<boolean>(false);
		// modelValue是否第一次变化，在watch中，由于加入immediate属性，会在第一次触发，此时不应该认为modelValue发生了变化
		const firstChange = ref<boolean>(true);
		// modelValue绑定值的变化是由内部还是外部引起的
		const changeFromInner = ref<boolean>(false);
		// 过滤处理方法
		let innerFormatter = (value) => value;

		watch(
			() => props.modelValue,
			(newVal) => {
				innerValue.value = newVal;
				/* #ifdef H5 */
				// 在H5中，外部value变化后，修改input中的值，不会触发@input事件，此时手动调用值变化方法
				if (firstChange.value === false && changeFromInner.value === false) {
					valueChange();
				}
				/* #endif */
				firstChange.value = false;
				// 重置changeFromInner的值为false，标识下一次引起默认为外部引起的
				changeFromInner.value = false;
			},
			{
				immediate: true,
			}
		);

		const { proxy } = getCurrentInstance();
		// 是否显示清除控件
		const isShowClear = computed((): CSSProperties => {
			return !!props.clearable && !props.readonly && !!focused.value && innerValue.value !== '';
		});
		// 组件的类名
		const inputClass = computed(() => {
			let classes = [],
				{ border, shape } = props;
			border === 'surround' && (classes = classes.concat(['dz-border', 'dz-input--radius']));
			classes.push(`dz-input--${shape}`);
			border === 'bottom' && (classes = classes.concat(['dz-border-bottom', 'dz-input--no-radius']));
			return classes.join(' ');
		});
		// 组件的样式
		const wrapperStyle = computed((): CSSProperties => {
			const style = {};
			// 禁用状态下，被背景色加上对应的样式
			if (props.disabled) {
				style.backgroundColor = props.disabledColor;
			}
			// 无边框时，去除内边距
			if (props.border === 'none') {
				style.padding = '0';
			} else {
				// 由于uni-app的iOS开发者能力有限，导致需要分开写才有效
				style.paddingTop = '6px';
				style.paddingBottom = '6px';
				style.paddingLeft = '9px';
				style.paddingRight = '9px';
			}
			return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
		});
		// 输入框的样式
		const inputStyle = computed((): CSSProperties => {
			const style = {
				color: props.color,
				fontSize: uni.$api.addUnit(props.fontSize),
				textAlign: props.inputAlign,
			};
			return style;
		});

		// 在微信小程序中，不支持将函数当做props参数，故只能通过ref形式调用
		function setFormatter(e) {
			innerFormatter = e;
		}
		// 当键盘输入时，触发input事件
		function onInput(e) {
			let { value = '' } = e.detail || {};
			// 格式化过滤方法
			const formatter = props.formatter || innerFormatter;
			const formatValue = formatter(value);
			// 为了避免props的单向数据流特性，需要先将innerValue值设置为当前值，再在nextTick中重新赋予设置后的值才有效
			innerValue.value = value;
			nextTick(() => {
				innerValue.value = formatValue;
				valueChange();
			});
		}
		// 输入框失去焦点时触发
		function onBlur(event) {
			emit('blur', event.detail.value);
			// H5端的blur会先于点击清除控件的点击click事件触发，导致focused
			// 瞬间为false，从而隐藏了清除控件而无法被点击到
			sleep(50).then(() => {
				focused.value = false;
			});
			// 尝试调用dz-form的验证方法
			formValidate(proxy, 'blur');
		}

		// 输入框聚焦时触发
		function onFocus(event) {
			focused.value = true;
			emit('focus');
		}
		// 点击完成按钮时触发
		function onConfirm(event) {
			emit('confirm', innerValue.value);
		}
		// 键盘高度发生变化的时候触发此事件
		// 兼容性：微信小程序2.7.0+、App 3.1.0+
		function onkeyboardheightchange() {
			emit('keyboardheightchange');
		}
		// 内容发生变化，进行处理
		function valueChange() {
			const value = innerValue.value;
			nextTick(() => {
				emit('update:modelValue', value);
				// 标识value值的变化是由内部引起的
				changeFromInner.value = true;
				emit('change', value);
				// 尝试调用dz-form的验证方法
				formValidate(proxy, 'change');
			});
		}
		// 点击清除控件
		function onClear() {
			innerValue.value = '';
			nextTick(() => {
				valueChange();
				emit('clear');
			});
		}
		/**
		 * 在安卓nvue上，事件无法冒泡
		 * 在某些时间，我们希望监听dz-from-item的点击事件，此时会导致点击dz-form-item内的dz-input后
		 * 无法触发dz-form-item的点击事件，这里通过手动调用dz-form-item的方法进行触发
		 */
		function clickHandler() {
			// #ifdef APP-NVUE
			if (os() === 'android') {
				const formItem = $parent.call(proxy, 'dz-form-item');
				if (formItem) {
					formItem.clickHandler();
				}
			}
			// #endif
		}

		/**
		 * @description 进行延时，以达到可以简写代码的目的 比如: await uni.$u.sleep(20)将会阻塞20ms
		 * @param {number} value 堵塞时间 单位ms 毫秒
		 * @returns {Promise} 返回promise
		 */
		function sleep(value = 30) {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve();
				}, value);
			});
		}

		/**
		 * @description 在dz-form的子组件内容发生变化，或者失去焦点时，尝试通知dz-form执行校验方法
		 * @param {*} instance
		 * @param {*} event
		 */
		function formValidate(instance, event) {
			const formItem = $parent.call(instance, 'dz-form-item');
			const form = $parent.call(instance, 'dz-form');
			// 如果发生变化的input或者textarea等，其父组件中有dz-form-item或者dz-form等，就执行form的validate方法
			// 同时将form-item的pros传递给form，让其进行精确对象验证
			if (formItem && form) {
				form.validateField(formItem.prop, () => {}, event);
			}
		}

		function $parent(name = undefined) {
			let parent = proxy?.$parent;
			// 通过while历遍，这里主要是为了H5需要多层解析的问题
			while (parent) {
				// 父组件
				if (parent.$options && parent.$options.name !== name) {
					// 如果组件的name不相等，继续上一级寻找
					parent = parent.$parent;
				} else {
					return parent;
				}
			}
			return false;
		}

		/**
		 * @description 运行期判断平台
		 * @returns {string} 返回所在平台(小写)
		 * @link 运行期判断平台 https://uniapp.dcloud.io/frame?id=判断平台
		 */
		function os() {
			return uni.getSystemInfoSync().osName.toLowerCase();
		}

		return {
			innerValue,
			isShowClear,
			inputClass,
			wrapperStyle,
			inputStyle,
			clickHandler,
			onInput,
			onBlur,
			onFocus,
			onConfirm,
			onkeyboardheightchange,
			onClear,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-input {
	@include flex(row);
	align-items: center;
	justify-content: space-between;
	flex: 1;

	&--radius,
	&--square {
		border-radius: 4px;
	}

	&--no-radius {
		border-radius: 0;
	}

	&--circle {
		border-radius: 100px;
	}

	&__content {
		flex: 1;
		@include flex(row);
		align-items: center;
		justify-content: space-between;

		&__field-wrapper {
			position: relative;
			@include flex(row);
			margin: 0;
			flex: 1;

			&__field {
				line-height: 26px;
				text-align: left;
				color: $dz-main-color;
				height: 24px;
				font-size: 15px;
				flex: 1;
			}
		}

		&__clear {
			width: 20px;
			height: 20px;
			border-radius: 100px;
			background-color: #c6c7cb;
			@include flex(row);
			align-items: center;
			justify-content: center;
			transform: scale(0.82);
			margin-left: 4px;
		}

		&__subfix-icon {
			margin-left: 4px;
		}

		&__prefix-icon {
			margin-right: 4px;
		}
	}
}
</style>

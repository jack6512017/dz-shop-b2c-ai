<template>
	<view class="dz-textarea" :class="textareaClass" :style="[textareaStyle]">
		<textarea
			class="dz-textarea__field"
			:value="innerValue"
			:style="{ height: api.addUnit(height) }"
			:placeholder="placeholder"
			:placeholder-style="api.addStyle(placeholderStyle, 'string')"
			:placeholder-class="placeholderClass"
			:disabled="disabled"
			:focus="focus"
			:autoHeight="autoHeight"
			:fixed="fixed"
			:cursorSpacing="cursorSpacing"
			:cursor="cursor"
			:showConfirmBar="showConfirmBar"
			:selectionStart="selectionStart"
			:selectionEnd="selectionEnd"
			:adjustPosition="adjustPosition"
			:disableDefaultPadding="disableDefaultPadding"
			:holdKeyboard="holdKeyboard"
			:maxlength="maxlength"
			:confirmType="confirmType"
			:ignoreCompositionEvent="ignoreCompositionEvent"
			@focus="onFocus"
			@blur="onBlur"
			@linechange="onLinechange"
			@input="onInput"
			@confirm="onConfirm"
			@keyboardheightchange="onKeyboardheightchange"
		></textarea>
		<text
			class="dz-textarea__count"
			:style="{
				'background-color': disabled ? 'transparent' : '#fff',
			}"
			v-if="count"
			>{{ innerValue.length }}/{{ maxlength }}</text
		>
	</view>
</template>

<script lang="ts">
import props from './props.ts';
import { ref, computed, getCurrentInstance, nextTick, watch, defineComponent } from 'vue';
/**
 * Textarea 文本域
 * @description 文本域此组件满足了可能出现的表单信息补充，编辑等实际逻辑的功能，内置了字数校验等
 * @tutorial https://www.uviewui.com/components/textarea.html
 *
 * @property {String | Number} 		value					输入框的内容
 * @property {String | Number}		placeholder				输入框为空时占位符
 * @property {String}			    placeholderClass		指定placeholder的样式类，注意页面或组件的style中写了scoped时，需要在类名前写/deep/ （ 默认 'input-placeholder' ）
 * @property {String | Object}	    placeholderStyle		指定placeholder的样式，字符串/对象形式，如"color: red;"
 * @property {String | Number}		height					输入框高度（默认 70 ）
 * @property {String}				confirmType				设置键盘右下角按钮的文字，仅微信小程序，App-vue和H5有效（默认 'done' ）
 * @property {Boolean}				disabled				是否禁用（默认 false ）
 * @property {Boolean}				count					是否显示统计字数（默认 false ）
 * @property {Boolean}				focus					是否自动获取焦点，nvue不支持，H5取决于浏览器的实现（默认 false ）
 * @property {Boolean | Function}	autoHeight				是否自动增加高度（默认 false ）
 * @property {Boolean}				fixed					如果textarea是在一个position:fixed的区域，需要显示指定属性fixed为true（默认 false ）
 * @property {Number}				cursorSpacing			指定光标与键盘的距离（默认 0 ）
 * @property {String | Number}		cursor					指定focus时的光标位置
 * @property {Function}			    formatter			    内容式化函数
 * @property {Boolean}				showConfirmBar			是否显示键盘上方带有”完成“按钮那一栏，（默认 true ）
 * @property {Number}				selectionStart			光标起始位置，自动聚焦时有效，需与selection-end搭配使用，（默认 -1 ）
 * @property {Number | Number}		selectionEnd			光标结束位置，自动聚焦时有效，需与selection-start搭配使用（默认 -1 ）
 * @property {Boolean}				adjustPosition			键盘弹起时，是否自动上推页面（默认 true ）
 * @property {Boolean | Number}		disableDefaultPadding	是否去掉 iOS 下的默认内边距，只微信小程序有效（默认 false ）
 * @property {Boolean}				holdKeyboard			focus时，点击页面的时候不收起键盘，只微信小程序有效（默认 false ）
 * @property {String | Number}		maxlength				最大输入长度，设置为 -1 的时候不限制最大长度（默认 140 ）
 * @property {String}				border					边框类型，surround-四周边框，none-无边框，bottom-底部边框（默认 'surround' ）
 * @property {Boolean}				ignoreCompositionEvent	是否忽略组件内对文本合成系统事件的处理
 *
 * @event {Function(e)} focus					输入框聚焦时触发，event.detail = { value, height }，height 为键盘高度
 * @event {Function(e)} blur					输入框失去焦点时触发，event.detail = {value, cursor}
 * @event {Function(e)} linechange				输入框行数变化时调用，event.detail = {height: 0, heightRpx: 0, lineCount: 0}
 * @event {Function(e)} input					当键盘输入时，触发 input 事件
 * @event {Function(e)} confirm					点击完成时， 触发 confirm 事件
 * @event {Function(e)} keyboardheightchange	键盘高度发生变化的时候触发此事件
 * @example <dz--textarea v-model="value1" placeholder="请输入内容" ></dz--textarea>
 */

export default defineComponent({
	name: 'dz-textarea',
	props,
	emits: ['update:modelValue', 'focus', 'blur', 'linechange', 'change', 'confirm', 'onKeyboardheightchange'],
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();

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

		// 组件的类名
		const textareaClass = computed(() => {
			let classes = [],
				{ border, disabled, shape } = props;
			border === 'surround' && (classes = classes.concat(['dz-border', 'dz-textarea--radius']));
			border === 'bottom' && (classes = classes.concat(['dz-border-bottom', 'dz-textarea--no-radius']));
			disabled && classes.push('dz-textarea--disabled');
			return classes.join(' ');
		});

		const textareaStyle = computed(() => {
			const style = {};
			// #ifdef APP-NVUE
			// 由于textarea在安卓nvue上的差异性，需要额外再调整其内边距
			if (uni.$api.os() === 'android') {
				style.paddingTop = '6px';
				style.paddingLeft = '9px';
				style.paddingBottom = '3px';
				style.paddingRight = '6px';
			}
			// #endif
			return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
		});

		// 在微信小程序中，不支持将函数当做props参数，故只能通过ref形式调用
		function setFormatter(e) {
			innerFormatter = e;
		}
		function onFocus(e) {
			emit('focus', e);
		}
		function onBlur(e) {
			emit('blur', e);
			// 尝试调用dz-form的验证方法
			formValidate(proxy, 'blur');
		}
		function onLinechange(e) {
			emit('linechange', e);
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

		function onConfirm(e) {
			emit('confirm', e);
		}
		function onKeyboardheightchange(e) {
			emit('keyboardheightchange', e);
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

		return {
			textareaClass,
			textareaStyle,
			innerValue,
			onFocus,
			onBlur,
			onLinechange,
			onInput,
			onConfirm,
			onKeyboardheightchange,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-textarea {
	border-radius: 4px;
	background-color: #fff;
	position: relative;
	@include flex;
	flex: 1;
	padding: 9px;

	&--radius {
		border-radius: 4px;
	}

	&--no-radius {
		border-radius: 0;
	}

	&--disabled {
		background-color: #f5f7fa;
	}

	&__field {
		flex: 1;
		font-size: 15px;
		color: $dz-content-color;
		width: 100%;
	}

	&__count {
		position: absolute;
		right: 5px;
		bottom: 2px;
		font-size: 12px;
		color: $dz-tips-color;
		background-color: #ffffff;
		padding: 1px 4px;
	}
}
</style>

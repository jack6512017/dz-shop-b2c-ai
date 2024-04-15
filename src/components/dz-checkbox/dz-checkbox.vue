<template>
	<view
		class="dz-checkbox"
		:style="[checkboxStyle]"
		@tap.stop="wrapperClickHandler"
		:class="[`dz-checkbox-label--${parentData.iconPlacement}`, parentData.borderBottom && parentData.placement === 'column' && 'dz-border-bottom']"
	>
		<view class="dz-checkbox__icon-wrap" @tap.stop="iconClickHandler" :class="iconClasses" :style="[iconWrapStyle]">
			<slot name="icon">
				<dz-icon class="dz-checkbox__icon-wrap__icon" name="checkbox" :size="elIconSize" :color="elIconColor" />
			</slot>
		</view>
		<text
			@tap.stop="labelClickHandler"
			:style="{
				color: elDisabled ? elInactiveColor : elLabelColor,
				fontSize: elLabelSize,
				lineHeight: elLabelSize,
			}"
			>{{ label }}
		</text>
	</view>
</template>

<script lang="ts">
import props from './props';
import { isArray } from '@/utils/is';
import { reactive, ref, onMounted, computed, getCurrentInstance, defineComponent, nextTick, unref } from 'vue';
/**
 * checkbox  复选框
 * @description 复选框组件一般用于需要多个选择的场景，该组件功能完整，使用方便
 * @tutorial https://uviewui.com/components/checkbox.html
 * @property {String | Number | Boolean}	name			checkbox组件的标示符
 * @property {String}						shape			形状，square为方形，circle为圆型
 * @property {String | Number}				size			整体的大小
 * @property {Boolean}						checked			是否默认选中
 * @property {String | Boolean}				disabled		是否禁用
 * @property {String}						activeColor		选中状态下的颜色，如设置此值，将会覆盖parent的activeColor值
 * @property {String}						inactiveColor	未选中的颜色
 * @property {String | Number}				iconSize		图标的大小，单位px
 * @property {String}						iconColor		图标颜色
 * @property {String | Number}				label			label提示文字，因为nvue下，直接slot进来的文字，由于特殊的结构，无法修改样式
 * @property {String}						labelColor 		label的颜色
 * @property {String | Number}				labelSize		label的字体大小，px单位
 * @property {String | Boolean}				labelDisabled	是否禁止点击提示语选中复选框
 * @property {Object}						customStyle		定义需要用到的外部样式
 *
 * @event {Function}	change	任一个checkbox状态发生变化时触发，回调为一个对象
 * @example <dz-checkbox v-model="checked" :disabled="false">天涯</dz-checkbox>
 */

export default defineComponent({
	name: 'dz-checkbox',
	props,
	emits: ['change'],
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();
		const isChecked = ref<boolean>(false);
		const data = reactive({
			// 父组件的默认值，因为头条小程序不支持在computed中使用this.parent.shape的形式
			// 故只能使用如此方法
			parentData: {
				iconSize: 20,
				labelDisabled: null,
				disabled: null,
				shape: 'square',
				activeColor: null,
				inactiveColor: null,
				size: 36,
				modelValue: null,
				iconColor: null,
				placement: 'row',
				borderBottom: false,
				iconPlacement: 'left',
			},
		});
		// 是否禁用，如果父组件dz-checkbox-group禁用的话，将会忽略子组件的配置
		const elDisabled = computed(() => {
			return props.disabled !== '' ? props.disabled : data.parentData.disabled !== null ? data.parentData.disabled : false;
		});

		// 是否禁用label点击
		const elLabelDisabled = computed(() => {
			return props.labelDisabled !== '' ? props.labelDisabled : data.parentData.labelDisabled !== null ? data.parentData.labelDisabled : false;
		});

		// 组件尺寸，对应size的值，默认值为21px
		const elSize = computed(() => {
			return props.size ? props.size : data.parentData.size ? data.parentData.size : 36;
		});

		// 组件的勾选图标的尺寸，默认24rpx
		const elIconSize = computed(() => {
			return props.iconSize ? props.iconSize : data.parentData.iconSize ? data.parentData.iconSize : 20;
		});

		// 组件选中激活时的颜色
		const elActiveColor = computed(() => {
			return props.activeColor ? props.activeColor : data.parentData.activeColor ? data.parentData.activeColor : '#2979ff';
		});

		// 组件选未中激活时的颜色
		const elInactiveColor = computed(() => {
			return props.inactiveColor ? props.inactiveColor : data.parentData.inactiveColor ? data.parentData.inactiveColor : '#c8c9cc';
		});

		// label的颜色
		const elLabelColor = computed(() => {
			return props.labelColor ? props.labelColor : data.parentData.labelColor ? data.parentData.labelColor : '#606266';
		});

		// 组件的形状
		const elShape = computed(() => {
			return props.shape ? props.shape : data.parentData.shape ? data.parentData.shape : 'circle';
		});

		// label大小
		const elLabelSize = computed(() => {
			return uni.$api.addUnit(props.labelSize ? props.labelSize : data.parentData.labelSize ? data.parentData.labelSize : '24');
		});

		const elIconColor = computed(() => {
			const iconColor = props.iconColor ? props.iconColor : data.parentData.iconColor ? data.parentData.iconColor : '#ffffff';
			// 图标的颜色
			if (unref(elDisabled)) {
				// disabled状态下，已勾选的checkbox图标改为elInactiveColor
				return isChecked.value ? props.elInactiveColor : 'transparent';
			} else {
				return isChecked.value ? iconColor : 'transparent';
			}
		});

		const iconClasses = computed(() => {
			let classes = [];
			// 组件的形状
			classes.push('dz-checkbox__icon-wrap--' + unref(elShape));
			if (unref(elDisabled)) {
				classes.push('dz-checkbox__icon-wrap--disabled');
			}
			if (isChecked.value && unref(elDisabled)) {
				classes.push('dz-checkbox__icon-wrap--disabled--checked');
			}
			// 支付宝，头条小程序无法动态绑定一个数组类名，否则解析出来的结果会带有","，而导致失效
			// #ifdef MP-ALIPAY || MP-TOUTIAO
			classes = classes.join(' ');
			// #endif
			return classes;
		});

		const iconWrapStyle = computed(() => {
			// checkbox的整体样式
			const style = {};
			style.backgroundColor = isChecked.value && !unref(elDisabled) ? unref(elActiveColor) : '#ffffff';
			style.borderColor = isChecked.value && !unref(elDisabled) ? unref(elActiveColor) : unref(elInactiveColor);
			style.width = uni.$api.addUnit(unref(elSize));
			style.height = uni.$api.addUnit(unref(elSize));
			// 如果是图标在右边的话，移除它的右边距
			if (data.parentData.iconPlacement === 'right') {
				style.marginRight = 0;
			}
			return style;
		});

		const checkboxStyle = computed(() => {
			const style = {};
			if (data.parentData.borderBottom && data.parentData.placement === 'row') {
				// uni.$u.error('检测到您将borderBottom设置为true，需要同时将dz-checkbox-group的placement设置为column才有效')
			}
			// 当父组件设置了显示下边框并且排列形式为纵向时，给内容和边框之间加上一定间隔
			if (data.parentData.borderBottom && data.parentData.placement === 'column') {
				style.paddingBottom = '8px';
			}
			return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
		});

		onMounted(() => {
			init();
		});

		function init() {
			// 支付宝小程序不支持provide/inject，所以使用这个方法获取整个父组件，在created定义，避免循环引用
			updateParentData();
			if (!proxy.parent) {
				uni.$api.error('dz-checkbox必须搭配dz-checkbox-group组件使用');
			}
			// 设置初始化时，是否默认选中的状态，父组件dz-checkbox-group的value可能是array，所以额外判断
			if (props.checked) {
				isChecked.value = true;
			} else if (isArray(data.parentData.modelValue)) {
				// 查找数组是是否存在this.name元素值
				isChecked.value = data.parentData.modelValue.some((item) => {
					return item === props.name;
				});
			}
		}

		function updateParentData() {
			getParentData('dz-checkbox-group');
		}

		function getParentData(parentName = '') {
			// 避免在created中去定义parent变量
			if (!proxy.parent) proxy.parent = {};
			// 这里的本质原理是，通过获取父组件实例(也即类似dz-radio的父组件dz-radio-group的this)
			// 将父组件this中对应的参数，赋值给本组件(dz-radio的this)的parentData对象中对应的属性
			// 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
			// 此处并不会自动更新子组件的数据，而是依赖父组件dz-radio-group去监听data的变化，手动调用更新子组件的方法去重新获取
			proxy.parent = uni.$api.$parent.call(proxy, proxy, parentName);
			if (proxy.parent.children) {
				// 如果父组件的children不存在本组件的实例，才将本实例添加到父组件的children中
				proxy.parent.children.indexOf(proxy) === -1 && proxy.parent.children.push(proxy);
			}
			if (proxy.parent && data.parentData) {
				// 历遍parentData中的属性，将parent中的同名属性赋值给parentData
				Object.keys(data.parentData).map((key) => {
					data.parentData[key] = proxy.parent[key];
				});
			}
		}

		/**
		 * @description 在dz-form的子组件内容发生变化，或者失去焦点时，尝试通知dz-form执行校验方法
		 * @param {*} instance
		 * @param {*} event
		 */
		function formValidate(instance, event) {
			const formItem = uni.$api.$parent.call(instance, proxy, 'dz-form-item');
			const form = uni.$api.$parent.call(instance, proxy, 'dz-form');
			// 如果发生变化的input或者textarea等，其父组件中有dz-form-item或者dz-form等，就执行form的validate方法
			// 同时将form-item的pros传递给form，让其进行精确对象验证
			if (formItem && form) {
				form.validateField(formItem.prop, () => {}, event);
			}
		}

		// 横向两端排列时，点击组件即可触发选中事件
		function wrapperClickHandler(e) {
			data.parentData.iconPlacement === 'right' && iconClickHandler(e);
		}

		// 点击图标
		function iconClickHandler(e) {
			uni.$api.preventEvent(e);
			// 如果整体被禁用，不允许被点击
			if (!unref(elDisabled)) {
				setRadioCheckedStatus();
			}
		}

		// 点击label
		function labelClickHandler(e) {
			uni.$api.preventEvent(e);
			// 如果按钮整体被禁用或者label被禁用，则不允许点击文字修改状态
			if (!unref(elLabelDisabled) && !unref(elDisabled)) {
				setRadioCheckedStatus();
			}
		}

		function emitEvent() {
			emit('change', isChecked.value);
			// 尝试调用dz-form的验证方法，进行一定延迟，否则微信小程序更新可能会不及时
			nextTick(() => {
				formValidate(proxy, 'change');
			});
		}
		// 改变组件选中状态
		// 这里的改变的依据是，更改本组件的checked值为true，同时通过父组件遍历所有dz-checkbox实例
		// 将本组件外的其他dz-checkbox的checked都设置为false(都被取消选中状态)，因而只剩下一个为选中状态
		function setRadioCheckedStatus() {
			// 将本组件标记为与原来相反的状态
			isChecked.value = !isChecked.value;
			emitEvent();
			typeof proxy.parent.unCheckedOther === 'function' && proxy.parent.unCheckedOther(proxy);
		}

		return {
			init,
			checkboxStyle,
			wrapperClickHandler,
			isChecked,
			parentData: data.parentData,
			iconClickHandler,
			iconClasses,
			iconWrapStyle,
			elIconSize,
			elIconColor,
			labelClickHandler,
			elDisabled,
			elInactiveColor,
			elLabelColor,
			elLabelSize,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';
$dz-checkbox-icon-wrap-margin-right: 12rpx !default;
$dz-checkbox-icon-wrap-font-size: 12rpx !default;
$dz-checkbox-icon-wrap-border-width: 2rpx !default;
$dz-checkbox-icon-wrap-border-color: #c8c9cc !default;
$dz-checkbox-icon-wrap-icon-line-height: 0 !default;
$dz-checkbox-icon-wrap-circle-border-radius: 100% !default;
$dz-checkbox-icon-wrap-square-border-radius: 6rpx !default;
$dz-checkbox-icon-wrap-checked-color: #fff !default;
$dz-checkbox-icon-wrap-checked-background-color: red !default;
$dz-checkbox-icon-wrap-checked-border-color: #2979ff !default;
$dz-checkbox-icon-wrap-disabled-background-color: #ebedf0 !default;
$dz-checkbox-icon-wrap-disabled-checked-color: #c8c9cc !default;
$dz-checkbox-label-margin-left: 10rpx !default;
$dz-checkbox-label-margin-right: 24px !default;
$dz-checkbox-label-color: #fff !default;
$dz-checkbox-label-font-size: 30rpx !default;
$dz-checkbox-label-disabled-color: #c8c9cc !default;

.dz-checkbox {
	/* #ifndef APP-NVUE */
	@include flex(row);
	/* #endif */
	overflow: hidden;
	flex-direction: row;
	align-items: center;

	&-label--left {
		flex-direction: row;
	}

	&-label--right {
		flex-direction: row-reverse;
		justify-content: space-between;
	}

	&__icon-wrap {
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		// nvue下，border-color过渡有问题
		transition-property: border-color, background-color, color;
		transition-duration: 0.2s;
		/* #endif */
		color: #fff;
		@include flex;
		align-items: center;
		justify-content: center;
		color: transparent;
		text-align: center;
		margin-right: $dz-checkbox-icon-wrap-margin-right;

		font-size: $dz-checkbox-icon-wrap-font-size;
		border-width: $dz-checkbox-icon-wrap-border-width;
		border-color: $dz-checkbox-icon-wrap-border-color;
		border-style: solid;

		/* #ifdef MP-TOUTIAO */
		// 头条小程序兼容性问题，需要设置行高为0，否则图标偏下
		&__icon {
			line-height: $dz-checkbox-icon-wrap-icon-line-height;
		}

		/* #endif */

		&--circle {
			border-radius: $dz-checkbox-icon-wrap-circle-border-radius;
		}

		&--square {
			border-radius: $dz-checkbox-icon-wrap-square-border-radius;
		}

		&--checked {
			color: $dz-checkbox-icon-wrap-checked-color;
			background-color: $dz-checkbox-icon-wrap-checked-background-color;
			border-color: $dz-checkbox-icon-wrap-checked-border-color;
		}

		&--disabled {
			background-color: $dz-checkbox-icon-wrap-disabled-background-color !important;
		}

		&--disabled--checked {
			color: $dz-checkbox-icon-wrap-disabled-checked-color !important;
		}
	}

	&__label {
		/* #ifndef APP-NVUE */
		word-wrap: break-word;
		/* #endif */
		margin-left: $dz-checkbox-label-margin-left;
		margin-right: $dz-checkbox-label-margin-right;
		color: $dz-checkbox-label-color;
		font-size: $dz-checkbox-label-font-size;

		&--disabled {
			color: $dz-checkbox-label-disabled-color;
		}
	}
}
</style>

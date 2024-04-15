<template>
	<view
		class="dz-radio"
		@tap.stop="wrapperClickHandler"
		:style="[radioStyle]"
		:class="[`dz-radio-label--${parentData.iconPlacement}`, parentData.borderBottom && parentData.placement === 'column' && 'dz-border-bottom']"
	>
		<view class="dz-radio__icon-wrap" @tap.stop="iconClickHandler" :class="iconClasses" :style="[iconWrapStyle]">
			<slot name="icon">
				<dz-icon class="dz-radio__icon-wrap__icon" name="checkbox" :size="elIconSize" :color="elIconColor" />
			</slot>
		</view>
		<slot>
			<text
				class="dz-radio__text"
				@tap.stop="labelClickHandler"
				:style="{
					color: elDisabled ? elInactiveColor : elLabelColor,
					fontSize: elLabelSize,
					lineHeight: elLabelSize,
				}"
				>{{ label }}</text
			>
		</slot>
	</view>
</template>

<script lang="ts">
import props from './props';
import { isArray } from '@/utils/is';
import { reactive, ref, onMounted, computed, getCurrentInstance, defineComponent, nextTick, unref, onBeforeUnmount } from 'vue';
import type { CSSProperties } from 'vue';
/**
 * radio 单选框
 * @description 单选框用于有一个选择，用户只能选择其中一个的场景。搭配dz-radio-group使用
 * @tutorial https://www.uviewui.com/components/radio.html
 * @property {String | Number}	name			radio的名称
 * @property {String}			shape			形状，square为方形，circle为圆型
 * @property {Boolean}			disabled		是否禁用
 * @property {String | Boolean}	labelDisabled	是否禁止点击提示语选中单选框
 * @property {String}			activeColor		选中时的颜色，如设置parent的active-color将失效
 * @property {String}			inactiveColor	未选中的颜色
 * @property {String | Number}	iconSize		图标大小，单位px
 * @property {String | Number}	labelSize		label字体大小，单位px
 * @property {String | Number}	label			label提示文字，因为nvue下，直接slot进来的文字，由于特殊的结构，无法修改样式
 * @property {String | Number}	size			整体的大小
 * @property {String}			iconColor		图标颜色
 * @property {String}			labelColor		label的颜色
 * @property {Object}			customStyle		组件的样式，对象形式
 *
 * @event {Function} change 某个radio状态发生变化时触发(选中状态)
 * @example <dz-radio :labelDisabled="false">门掩黄昏，无计留春住</dz-radio>
 */
export default defineComponent({
	name: 'dz-radio',
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
		const checked = ref<boolean>(false);
		const data = reactive({
			// 当你看到这段代码的时候，
			// 父组件的默认值，因为头条小程序不支持在computed中使用this.parent.shape的形式
			// 故只能使用如此方法
			parentData: {
				iconSize: 24,
				labelDisabled: null,
				disabled: null,
				shape: null,
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

		// 是否禁用，如果父组件dz-raios-group禁用的话，将会忽略子组件的配置
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
				// disabled状态下，已勾选的radio图标改为elInactiveColor
				return checked.value ? props.elInactiveColor : 'transparent';
			} else {
				return checked.value ? iconColor : 'transparent';
			}
		});

		const iconClasses = computed(() => {
			let classes = [];
			// 组件的形状
			classes.push('dz-radio__icon-wrap--' + unref(elShape));
			if (unref(elDisabled)) {
				classes.push('dz-radio__icon-wrap--disabled');
			}
			if (checked.value && unref(elDisabled)) {
				classes.push('dz-radio__icon-wrap--disabled--checked');
			}
			// 支付宝，头条小程序无法动态绑定一个数组类名，否则解析出来的结果会带有","，而导致失效
			// #ifdef MP-ALIPAY || MP-TOUTIAO
			classes = classes.join(' ');
			// #endif
			return classes;
		});

		const iconWrapStyle = computed((): CSSProperties => {
			// radio的整体样式
			const style = {};
			style.backgroundColor = checked.value && !unref(elDisabled) ? unref(elActiveColor) : '#ffffff';
			style.borderColor = checked.value && !unref(elDisabled) ? unref(elActiveColor) : unref(elInactiveColor);
			style.width = uni.$api.addUnit(unref(elSize));
			style.height = uni.$api.addUnit(unref(elSize));
			// 如果是图标在右边的话，移除它的右边距
			if (data.parentData.iconPlacement === 'right') {
				style.marginRight = 0;
			}
			return style;
		});

		const radioStyle = computed((): CSSProperties => {
			const style = {};
			if (data.parentData.borderBottom && data.parentData.placement === 'row') {
				// uni.$u.error('检测到您将borderBottom设置为true，需要同时将dz-radio-group的placement设置为column才有效')
			}
			// 当父组件设置了显示下边框并且排列形式为纵向时，给内容和边框之间加上一定间隔
			if (data.parentData.borderBottom && data.parentData.placement === 'column') {
				// ios像素密度高，需要多一点的距离
				style.paddingBottom = uni.$api.os() === 'ios' ? '12px' : '8px';
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
				uni.$api.error('dz-radio必须搭配dz-radio-group组件使用');
			}
			// 设置初始化时，是否默认选中的状态
			checked.value = props.name === data.parentData.modelValue;
		}

		function updateParentData() {
			getParentData('dz-radio-group');
		}

		// 点击图标
		function iconClickHandler(e) {
			uni.$api.preventEvent(e);
			// 如果整体被禁用，不允许被点击
			if (!unref(elDisabled)) {
				setRadioCheckedStatus();
			}
		}

		// 横向两端排列时，点击组件即可触发选中事件
		function wrapperClickHandler(e) {
			data.parentData.iconPlacement === 'right' && iconClickHandler(e);
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
			// dz-radio的checked不为true时(意味着未选中)，才发出事件，避免多次点击触发事件
			if (!checked.value) {
				emit('change', props.name);
				// 尝试调用dz-form的验证方法，进行一定延迟，否则微信小程序更新可能会不及时
				nextTick(() => {
					formValidate(proxy, 'change');
				});
			}
		}

		// 改变组件选中状态
		// 这里的改变的依据是，更改本组件的checked值为true，同时通过父组件遍历所有dz-radio实例
		// 将本组件外的其他dz-radio的checked都设置为false(都被取消选中状态)，因而只剩下一个为选中状态
		function setRadioCheckedStatus() {
			emitEvent();
			// 将本组件标记为选中状态
			checked.value = true;
			typeof proxy.parent.unCheckedOther === 'function' && proxy.parent.unCheckedOther(proxy);
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

		onBeforeUnmount(() => {
			// 判断当前页面是否存在parent和chldren，一般在radio和radio-group父子联动的场景会有此情况
			// 组件销毁时，移除子组件在父组件children数组中的实例，释放资源，避免数据混乱
			if (proxy.parent && isArray(proxy.parent.children)) {
				// 组件销毁时，移除父组件中的children数组中对应的实例
				const childrenList = proxy.parent.children;
				childrenList.map((child, index) => {
					// 如果相等，则移除
					if (child === proxy) {
						childrenList.splice(index, 1);
					}
				});
			}
		});

		return {
			init,
			checked,
			label: props.label,
			parentData: data.parentData,
			wrapperClickHandler,
			radioStyle,
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
$dz-radio-wrap-margin-right: 12rpx !default;
$dz-radio-wrap-font-size: 40rpx !default;
$dz-radio-wrap-border-width: 2rpx !default;
$dz-radio-wrap-border-color: #c8c9cc !default;
$dz-radio-line-height: 0 !default;
$dz-radio-circle-border-radius: 100% !default;
$dz-radio-square-border-radius: 6rpx !default;
$dz-radio-checked-color: #fff !default;
$dz-radio-checked-background-color: red !default;
$dz-radio-checked-border-color: #2979ff !default;
$dz-radio-disabled-background-color: #ebedf0 !default;
$dz-radio-disabled--checked-color: #c8c9cc !default;
$dz-radio-label-margin-left: 10rpx !default;
$dz-radio-label-margin-right: 24rpx !default;
$dz-radio-label-color: $dz-content-color !default;
$dz-radio-label-font-size: 30rpx !default;
$dz-radio-label-disabled-color: #c8c9cc !default;

.dz-radio {
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
		color: $dz-content-color;
		@include flex;
		align-items: center;
		justify-content: center;
		color: transparent;
		text-align: center;
		margin-right: $dz-radio-wrap-margin-right;
		font-size: $dz-radio-wrap-font-size;
		border-width: $dz-radio-wrap-border-width;
		border-color: $dz-radio-wrap-border-color;
		border-style: solid;

		/* #ifdef MP-TOUTIAO */
		// 头条小程序兼容性问题，需要设置行高为0，否则图标偏下
		&__icon {
			line-height: $dz-radio-line-height;
		}

		/* #endif */

		&--circle {
			border-radius: $dz-radio-circle-border-radius;
		}

		&--square {
			border-radius: $dz-radio-square-border-radius;
		}

		&--checked {
			color: $dz-radio-checked-color;
			background-color: $dz-radio-checked-background-color;
			border-color: $dz-radio-checked-border-color;
		}

		&--disabled {
			background-color: $dz-radio-disabled-background-color !important;
		}

		&--disabled--checked {
			color: $dz-radio-disabled--checked-color !important;
		}
	}

	&__label {
		/* #ifndef APP-NVUE */
		word-wrap: break-word;
		/* #endif */
		margin-left: $dz-radio-label-margin-left;
		margin-right: $dz-radio-label-margin-right;
		color: $dz-radio-label-color;
		font-size: $dz-radio-label-font-size;

		&--disabled {
			color: $dz-radio-label-disabled-color;
		}
	}
}
</style>

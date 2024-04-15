<template>
	<view class="dz-switch" :class="[disabled && 'dz-switch--disabled']" :style="[switchStyle, api.addStyle(customStyle)]" @tap="clickHandler">
		<view class="dz-switch__bg" :style="[bgStyle]"> </view>
		<view class="dz-switch__node" :class="[modelValue && 'dz-switch__node--on']" :style="[nodeStyle]" ref="dz-switch__node">
			<dz-loading-icon :show="loading" mode="circle" timingFunction="linear" :color="modelValue ? activeColor : '#AAABAD'" :size="size * 0.6" />
		</view>
	</view>
</template>

<script lang="ts">
import props from './props';
/**
 * switch 开关选择器
 * @description 选择开关一般用于只有两个选择，且只能选其一的场景。
 * @tutorial https://www.uviewui.com/components/switch.html
 * @property {Boolean}						loading			是否处于加载中（默认 false ）
 * @property {Boolean}						disabled		是否禁用（默认 false ）
 * @property {String | Number}				size			开关尺寸，单位px （默认 25 ）
 * @property {String}						activeColor		打开时的背景色 （默认 '#2979ff' ）
 * @property {String} 						inactiveColor	关闭时的背景色 （默认 '#ffffff' ）
 * @property {Boolean | String | Number}	modelValue		通过v-model双向绑定的值 （默认 false ）
 * @property {Boolean | String | Number}	activeValue		打开选择器时通过change事件发出的值 （默认 true ）
 * @property {Boolean | String | Number}	inactiveValue	关闭选择器时通过change事件发出的值 （默认 false ）
 * @property {Boolean}						asyncChange		是否开启异步变更，开启后需要手动控制输入值 （默认 false ）
 * @property {String | Number}				space			圆点与外边框的距离 （默认 0 ）
 * @property {Object}						customStyle		定义需要用到的外部样式
 *
 * @event {Function} change 在switch打开或关闭时触发
 * @example <dz-switch v-model="checked" active-color="red" inactive-color="#eee"></dz-switch>
 */
import { watch, computed, defineComponent, nextTick } from 'vue';
import type { CSSProperties } from 'vue';
export default defineComponent({
	name: 'dz-switch',
	props,
	emits: ['update:modelValue', 'change'],
	setup(props, { emit }) {
		watch(
			() => props.modelValue,
			(n) => {
				if (n !== props.inactiveValue && n !== props.activeValue) {
					uni.$api.error('v-model绑定的值必须为inactiveValue、activeValue二者之一');
				}
			},
			{
				immediate: true,
			}
		);
		const isActive = computed(() => {
			return props.modelValue === props.activeValue;
		});
		const switchStyle = computed((): CSSProperties => {
			let style = {};
			// 这里需要加2，是为了腾出边框的距离，否则圆点node会和外边框紧贴在一起
			style.width = uni.$api.addUnit(props.size * 2 + 2);
			style.height = uni.$api.addUnit(Number(props.size) + 6);
			// style.borderColor = props.modelValue ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.12)'
			// 如果自定义了“非激活”演示，name边框颜色设置为透明(跟非激活颜色一致)
			// 这里不能简单的设置为非激活的颜色，否则打开状态时，会有边框，所以需要透明
			if (customInactiveColor.value) {
				style.borderColor = 'rgba(0, 0, 0, 0)';
			}
			style.backgroundColor = isActive.value ? props.activeColor : props.inactiveColor;
			return style;
		});

		const nodeStyle = computed((): CSSProperties => {
			let style = {};
			// 如果自定义非激活颜色，将node圆点的尺寸减少两个像素，让其与外边框距离更大一点
			style.width = uni.$api.addUnit(props.size - props.space);
			style.height = uni.$api.addUnit(props.size - props.space);
			const translateX = isActive.value ? uni.$api.addUnit(props.space) : uni.$api.addUnit(props.size);
			style.transform = `translateX(-${translateX})`;
			return style;
		});

		const bgStyle = computed((): CSSProperties => {
			let style = {};
			// 这里配置一个多余的元素在HTML中，是为了让switch切换时，有更良好的背景色扩充体验(见实际效果)
			style.width = uni.$api.addUnit(Number(props.size) * 2 - props.size / 2);
			style.height = uni.$api.addUnit(props.size);
			style.backgroundColor = props.inactiveColor;
			// 打开时，让此元素收缩，否则反之
			style.transform = `scale(${isActive.value ? 0 : 1})`;
			return style;
		});

		const customInactiveColor = computed(() => {
			// 之所以需要判断是否自定义了“非激活”颜色，是为了让node圆点离外边框更宽一点的距离
			return props.inactiveColor !== '#fff' && props.inactiveColor !== '#ffffff';
		});

		function clickHandler() {
			if (!props.disabled && !props.loading) {
				const oldValue = isActive.value ? props.inactiveValue : props.activeValue;
				if (!props.asyncChange) {
					emit('update:modelValue', oldValue);
				}
				// 放到下一个生命周期，因为双向绑定的value修改父组件状态需要时间，且是异步的
				nextTick(() => {
					emit('change', oldValue);
				});
			}
		}

		return {
			switchStyle,
			clickHandler,
			bgStyle,
			nodeStyle,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-switch {
	@include flex(row);
	/* #ifndef APP-NVUE */
	box-sizing: border-box;
	/* #endif */
	position: relative;
	background-color: #fff;
	border-width: 1px;
	border-radius: 100px;
	transition: background-color 0.4s;
	// border-color: rgba(0, 0, 0, 0.12);
	// border-style: solid;
	justify-content: flex-end;
	align-items: center;
	// 由于weex为阿里逗着玩的KPI项目，导致bug奇多，这必须要写这一行，
	// 否则在iOS上，点击页面任意地方，都会触发switch的点击事件
	overflow: hidden;

	&__node {
		@include flex(row);
		align-items: center;
		justify-content: center;
		border-radius: 100px;
		background-color: #fff;
		border-radius: 100px;
		box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.25);
		transition-property: transform;
		transition-duration: 0.4s;
		transition-timing-function: cubic-bezier(0.3, 1.05, 0.4, 1.05);
	}

	&__bg {
		position: absolute;
		border-radius: 100px;
		background-color: #ffffff;
		transition-property: transform;
		transition-duration: 0.4s;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
		transition-timing-function: ease;
	}

	&--disabled {
		opacity: 0.6;
	}
}
</style>

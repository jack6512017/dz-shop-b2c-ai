<template>
	<view class="dz-toolbar" @touchmove.stop.prevent="noop" v-if="show">
		<view class="dz-toolbar__cancel__wrapper" hover-class="dz-hover-class">
			<text
				class="dz-toolbar__wrapper__cancel"
				@tap="cancel"
				:style="{
					color: cancelColor,
				}"
				>{{ cancelText }}</text
			>
		</view>
		<text class="dz-toolbar__title dz-line-1" v-if="title">{{ title }}</text>
		<view class="dz-toolbar__confirm__wrapper" hover-class="dz-hover-class">
			<text
				class="dz-toolbar__wrapper__confirm"
				@tap="confirm"
				:style="{
					color: confirmColor,
				}"
				>{{ confirmText }}</text
			>
		</view>
	</view>
</template>

<script lang="ts">
import props from './props';
/**
 * Toolbar 工具条
 * @description
 * @tutorial https://www.uviewui.com/components/toolbar.html
 * @property {Boolean}	show			是否展示工具条（默认 true ）
 * @property {String}	cancelText		取消按钮的文字（默认 '取消' ）
 * @property {String}	confirmText		确认按钮的文字（默认 '确认' ）
 * @property {String}	cancelColor		取消按钮的颜色（默认 '#909193' ）
 * @property {String}	confirmColor	确认按钮的颜色（默认 '#3c9cff' ）
 * @property {String}	title			标题文字
 * @event {Function}
 * @example
 */
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'dz-toolbar',
	props,
	emits: ['cancel', 'confirm'],
	setup(props, { emit }) {
		// 空操作
		function noop(e: Event) {
			preventEvent(e);
		}
		// 阻止事件冒泡
		function preventEvent(e: Event) {
			e && typeof e.stopPropagation === 'function' && e.stopPropagation();
		}
		// 点击取消按钮
		function cancel() {
			emit('cancel');
		}
		// 点击确定按钮
		function confirm() {
			emit('confirm');
		}
		return {
			noop,
			cancel,
			confirm,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-toolbar {
	height: 42px;
	@include flex;
	justify-content: space-between;
	align-items: center;

	&__wrapper {
		&__cancel {
			color: $dz-tips-color;
			font-size: 15px;
			padding: 0 15px;
		}
	}

	&__title {
		color: $dz-main-color;
		padding: 0 60rpx;
		font-size: 16px;
		flex: 1;
		text-align: center;
	}

	&__wrapper {
		&__confirm {
			color: $dz-type-primary;
			font-size: 15px;
			padding: 0 15px;
		}
	}
}
</style>

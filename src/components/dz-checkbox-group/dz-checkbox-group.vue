<template>
	<view class="dz-checkbox-group" :class="bemClass">
		<slot></slot>
	</view>
</template>

<script lang="ts">
import props from './props';
import { isArray } from '@/utils/is';
/**
 * checkboxGroup 复选框组
 * @description 复选框组件一般用于需要多个选择的场景，该组件功能完整，使用方便
 * @tutorial https://www.uviewui.com/components/checkbox.html
 * @property {String}			name			标识符
 * @property {Array}			modelValue		绑定的值
 * @property {String}			shape			形状，circle-圆形，square-方形 （默认 'square' ）
 * @property {Boolean}			disabled		是否禁用全部checkbox （默认 false ）
 * @property {String}			activeColor		选中状态下的颜色，如设置此值，将会覆盖parent的activeColor值 （默认 '#2979ff' ）
 * @property {String}			inactiveColor	未选中的颜色 （默认 '#c8c9cc' ）
 * @property {String | Number}	size			整个组件的尺寸 单位px （默认 18 ）
 * @property {String}			placement		布局方式，row-横向，column-纵向 （默认 'row' ）
 * @property {String | Number}	labelSize		label的字体大小，px单位  （默认 14 ）
 * @property {String}			labelColor		label的字体颜色 （默认 '#303133' ）
 * @property {Boolean}			labelDisabled	是否禁止点击文本操作 (默认 false )
 * @property {String}			iconColor		图标颜色 （默认 '#ffffff' ）
 * @property {String | Number}	iconSize		图标的大小，单位px （默认 12 ）
 * @property {String}			iconPlacement	勾选图标的对齐方式，left-左边，right-右边  （默认 'left' ）
 * @property {Boolean}			borderBottom	placement为row时，是否显示下边框 （默认 false ）
 * @event {Function}	change	任一个checkbox状态发生变化时触发，回调为一个对象
 * @event {Function}	input	修改通过v-model绑定的值时触发，回调为一个对象
 * @example <dz-checkbox-group></dz-checkbox-group>
 */

import { ref, computed, getCurrentInstance, watch, defineComponent, onBeforeUnmount } from 'vue';

export default defineComponent({
	name: 'dz-checkbox-group',
	props,
	emits: ['update:modelValue', 'change'],
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();
		const children = ref<any>([]);
		// 这里computed的变量，都是子组件dz-checkbox需要用到的，由于头条小程序的兼容性差异，子组件无法实时监听父组件参数的变化
		// 所以需要手动通知子组件，这里返回一个parentData变量，供watch监听，在其中去通知每一个子组件重新从父组件(dz-checkbox-group)
		// 拉取父组件新的变化后的参数
		const parentData = computed(() => {
			return [
				props.modelValue,
				props.disabled,
				props.inactiveColor,
				props.activeColor,
				props.size,
				props.labelDisabled,
				props.shape,
				props.iconSize,
				props.borderBottom,
				props.placement,
			];
		});

		const bemClass = computed(() => {
			// bem为一个computed变量，在mixin中
			return uni.$api.bem(proxy, 'checkbox-group', ['placement']);
		});

		// 当父组件需要子组件需要共享的参数发生了变化，手动通知子组件
		watch(
			() => parentData.value,
			() => {
				if (children.value.length) {
					children.value.map((child) => {
						// 判断子组件(dz-radio)如果有init方法的话，就就执行(执行的结果是子组件重新从父组件拉取了最新的值)
						typeof child.init === 'function' && child.init();
					});
				}
			}
		);

		// 将其他的checkbox设置为未选中的状态
		function unCheckedOther() {
			const values = [];
			children.value.map((child) => {
				// 将被选中的checkbox，放到数组中返回
				if (child.isChecked) {
					values.push(child.name);
				}
			});
			// 发出事件
			emit('change', values);
			// 修改通过v-model绑定的值
			emit('update:modelValue', values);
		}

		onBeforeUnmount(() => {
			// 判断当前页面是否存在parent和chldren，一般在checkbox和checkbox-group父子联动的场景会有此情况
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

		return { bemClass, children, unCheckedOther };
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-checkbox-group {
	&--row {
		@include flex;
	}

	&--column {
		@include flex(column);
	}
}
</style>

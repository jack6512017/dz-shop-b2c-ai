<template>
	<view class="dz-th" :style="[thStyle]">
		<slot></slot>
	</view>
</template>

<script lang="ts">
/**
 * th th单元格
 * @description 表格组件一般用于展示大量结构化数据的场景（搭配dz-table使用）
 * @tutorial https://www.uviewui.com/components/table.html#td-props
 * @property {String Number} width 标题单元格宽度百分比或者具体带单位的值，如30%，200rpx等，一般使用百分比，单元格宽度默认为均分tr的长度
 * @example 暂无示例
 */

import { computed, defineComponent, getCurrentInstance } from 'vue';
import type { CSSProperties } from 'vue';

export default defineComponent({
	name: 'dz-th',
	props: {
		// 宽度，百分比或者具体带单位的值，如30%， 200rpx等，一般使用百分比
		width: {
			type: [Number, String],
			default: 'auto',
		},
	},
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props) {
		const { proxy } = getCurrentInstance();
		const thStyle = computed((): CSSProperties => {
			const style = {};
			const parent = $parent.call(proxy, 'dz-table');
			if (parent) {
				// 将父组件的相关参数，合并到本组件
				if (props.width != 'auto') style.flex = `0 0 ${props.width}`;
				style.textAlign = parent.align;
				style.fontSize = parent.thFontSize + 'rpx';
				style.height = parent.thHeight + 'rpx';
				style.padding = parent.padding;
				style.borderBottom = `solid 1px ${parent.borderColor}`;
				style.borderRight = `solid 1px ${parent.borderColor}`;
				style.color = parent.color;
			}
			return style;
		});

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
			thStyle,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-th {
	@include flex;
	flex-direction: column;
	flex: 1;
	justify-content: center;
	font-size: 28rpx;
	color: $dz-main-color;
	font-weight: bold;
	background-color: rgb(245, 246, 248);
}
</style>

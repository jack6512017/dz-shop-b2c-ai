<template>
	<view class="dz-line" :style="[lineStyle]"> </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	color: {
		type: String,
		default: '#d6d7d9',
	},
	// 长度，竖向时表现为高度，横向时表现为长度，可以为百分比，带px单位的值等
	length: {
		type: [String, Number],
		default: '100%',
	},
	// 线条方向，col-竖向，row-横向
	direction: {
		type: String,
		default: 'row',
	},
	// 是否显示细边框
	hairline: {
		type: Boolean,
		default: true,
	},
	// 线条与上下左右元素的间距，字符串形式，如"30px"、"20px 30px"
	margin: {
		type: [String, Number],
		default: 0,
	},
	// 是否虚线，true-虚线，false-实线
	dashed: {
		type: Boolean,
		default: false,
	},
	customStyle: {
		type: [Object, String],
		default: () => ({}),
	},
});

const lineStyle = computed((): CSSProperties => {
	const style = {};
	style.margin = props.margin;
	// 如果是水平线条，边框高度为1px，再通过transform缩小一半，就是0.5px了
	if (props.direction === 'row') {
		// 此处采用兼容分开写，兼容nvue的写法
		style.borderBottomWidth = '1px';
		style.borderBottomStyle = props.dashed ? 'dashed' : 'solid';
		style.width = uni.$api.addUnit(props.length);
		if (props.hairline) style.transform = 'scaleY(0.5)';
	} else {
		// 如果是竖向线条，边框宽度为1px，再通过transform缩小一半，就是0.5px了
		style.borderLeftWidth = '1px';
		style.borderLeftStyle = props.dashed ? 'dashed' : 'solid';
		style.height = uni.$api.addUnit(props.length);
		if (props.hairline) style.transform = 'scaleX(0.5)';
	}
	style.borderColor = props.color;
	return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-line {
	/* #ifndef APP-NVUE */
	vertical-align: middle;
	/* #endif */
}
</style>

<template>
	<div :class="customClass">
		<div :style="{ background: bgColor }">
			<div v-if="mode == 'line'" :style="[customStyle]" class="title-icon">
				<div class="name" :style="[nameStyle]">{{ title }}</div>
				<div class="border" :style="[lineStyle]"></div>
			</div>
			<div v-if="mode == 'icon'" class="title-icon" :style="[customStyle]">
				<dz-icon v-if="coverLeft || coverRight" :name="coverLeft ? coverLeft : coverRight" :width="iconWidth" :height="iconHeight"></dz-icon>
				<dz-icon v-else name="lightfill" size="36" :color="iconColor"></dz-icon>

				<div class="dz-flex dz-row-center dz-col-center dz-m-l-16 dz-m-r-16" style="flex-direction: column">
					<div class="name" :style="[nameStyle]">{{ title }}</div>
					<div v-if="tipConfig.status == 1" class="dz-text-center dz-m-t-10" :style="[tipStyle]">
						{{ tipConfig.title }}
					</div>
				</div>

				<dz-icon v-if="coverLeft || coverRight" :name="coverRight ? coverRight : coverLeft" :width="iconWidth" :height="iconHeight"></dz-icon>
				<dz-icon v-else name="lightfill" size="36" :color="iconColor"></dz-icon>
			</div>
			<div v-if="mode == 'linear'" class="linear">
				<div class="left" :style="[linearLeftStyle]"></div>
				<div ref="nameRef" class="name" :style="[nameStyle]">{{ title }}</div>
				<div class="right" :style="[linearRightStyle]"></div>
			</div>
			<div v-if="mode == 'text'">
				<div class="name" :class="`dz-text-${textAlign}`" :style="[nameStyle]">
					{{ title }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 模式  边框 / (icon 图片)
	mode: {
		type: String,
		default: 'icon',
	},
	name: {
		type: String,
		default: 'lightfill',
	},
	// 图片
	coverLeft: {
		type: String,
		default: '',
	},
	coverRight: {
		type: String,
		default: '',
	},
	// 标题名称
	title: {
		type: String,
		default: '为你推荐',
	},
	// 副标题
	tipConfig: {
		type: Object,
		default() {
			return {
				title: '描述',
				status: 1,
				fontSize: 12,
				color: '#333',
			};
		},
	},
	// 左边iocn 或 图片大小
	iconWidth: {
		type: [Number, String],
		default: '26',
	},
	// 右边iocn 或 图片大小
	iconHeight: {
		type: [Number, String],
		default: '26',
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '',
	},
	// icon 颜色
	iconColor: {
		type: String,
		default: '#2979ff',
	},
	// 自定义样式
	customStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 字体大小
	fontSize: {
		type: [String, Number],
		default: 36,
	},
	// 字体颜色
	titleColor: {
		type: String,
		default: '#333',
	},
	// 选中项的主题颜色
	barColor: {
		type: String,
		default: '#2979ff',
	},
	barBokehColor: {
		type: String,
		default: '#f3f4f6',
	},
	// 底部边框bar的宽度，单位px
	barWidth: {
		type: [String, Number],
		default: 190,
	},
	// bar的高度
	barHeight: {
		type: [String, Number],
		default: 16,
	},
	// bar的位置
	barTop: {
		type: [String, Number],
		default: 49,
	},
	bold: {
		type: Boolean,
		default: true,
	},
	// 字体位置
	textAlign: {
		type: String,
		default: 'left',
	},
	// 底部边框的自定义样式
	barStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	customClass: {
		type: String,
		default: '',
	},
});

// 边框自定义样式
const lineStyle = computed((): CSSProperties => {
	let style = {
		width: props.barWidth + 'rpx',
		'background-color': props.barColor,
		height: props.barHeight + 'rpx',
		// 设置一个很大的值，它会自动取能用的最大值，不用高度的一半，是因为高度可能是单数，会有小数出现
		'border-radius': `${props.barHeight / 2}rpx`,
		top: props.barTop + 'rpx',
	};
	Object.assign(style, props.barStyle);
	return style;
});
// 标题自定义样式
const nameStyle = computed((): CSSProperties => {
	let style = {
		fontSize: props.fontSize + 'rpx',
		color: props.titleColor,
		fontWeight: props.bold ? 'bold' : 500,
	};
	return style;
});

// 副标题样式
const tipStyle = computed((): CSSProperties => {
	let style = {
		fontSize: props.tipConfig.fontSize + 'rpx',
		color: props.tipConfig.color,
	};
	return style;
});

const linearRightStyle = computed((): CSSProperties => {
	let style = {
		width: props.barWidth + 'rpx',
		borderRadius: `${props.barHeight}rpx 0 0 ${props.barHeight}rpx`,
		height: props.barHeight + 'rpx',
		background: `linear-gradient(to left,${props.barBokehColor},${props.barColor})`,
	};
	return style;
});

const linearLeftStyle = computed((): CSSProperties => {
	let style = {
		width: props.barWidth + 'rpx',
		borderRadius: `0 ${props.barHeight}rpx ${props.barHeight}rpx 0`,
		height: props.barHeight + 'rpx',
		background: `linear-gradient(to right,${props.barBokehColor},${props.barColor})`,
	};
	return style;
});
</script>

<style lang="scss" scoped>
.title-icon {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20rpx 0;
	position: relative;
}
.name {
	margin: 0 20rpx;
	font-size: 36rpx;
	font-weight: bold;
	position: relative;
	z-index: 1;
}
.border {
	position: absolute;
	z-index: 0;
}
.linear {
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>

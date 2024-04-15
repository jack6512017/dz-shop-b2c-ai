<template>
	<view class="dz-swiper-indicator">
		<view
			class="dz-swiper-indicator__wrapper dz-flex"
			v-if="indicatorMode === 'line'"
			:class="[`dz-swiper-indicator__wrapper--${indicatorMode}`]"
			:style="{
				width: api.addUnit(lineWidth * length),
				backgroundColor: indicatorInactiveColor,
			}"
		>
			<view class="dz-swiper-indicator__wrapper--line__bar" :style="[lineStyle]"></view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 轮播的长度
	length: {
		type: [String, Number],
		default: 0,
	},
	// 当前处于活动状态的轮播的索引
	current: {
		type: [String, Number],
		default: 0,
	},
	// 指示器非激活颜色
	indicatorActiveColor: {
		type: String,
		default: '#FFFFFF',
	},
	// 指示器的激活颜色
	indicatorInactiveColor: {
		type: String,
		default: 'rgba(255, 255, 255, 0.35)',
	},
	// 指示器模式，line-线型，dot-点型
	indicatorMode: {
		type: String,
		default: 'line',
	},
});

const lineWidth = ref<Number>(22);

// 指示器为线型的样式

const lineStyle = computed((): CSSProperties => {
	let style = {};
	style.width = uni.$api.addUnit(lineWidth.value);
	style.transform = `translateX(${uni.$api.addUnit(props.current * lineWidth.value)})`;
	style.backgroundColor = props.indicatorActiveColor;
	return style;
});
</script>

<style lang="scss" scoped>
.dz-swiper-indicator {
	&__wrapper {
		&--line {
			border-radius: 100px;
			height: 4px;

			&__bar {
				width: 22px;
				height: 4px;
				border-radius: 100px;
				background-color: #ffffff;
				transition: transform 0.3s;
			}
		}

		&__dot {
			width: 5px;
			height: 5px;
			border-radius: 100px;
			margin: 0 4px;

			&--active {
				width: 12px;
			}
		}
	}
}
</style>

<template>
	<scroll-view id="_scroll" scroll-x="true" class="scroll-tap" :scroll-left="slider.scrollLeft" scroll-with-animation>
		<view class="scroll-item" :id="'dz-tab-item-' + index" v-for="(item, index) in list" :key="index" @tap="tabClick(index)">
			<view class="image" :style="[activeStyle(index)]">
				<view v-if="index == 0" class="all">
					<dz-icon class="dz-m-l-4 dz-m-t-4" name="categoryfill" size="76" :color="index == activeIndex ? activeColor : '#DBDBDB'"></dz-icon>
				</view>
				<dz-image v-else :src="item.cover ? item.cover : pCover" borderRadius="12" width="100%" height="100%"></dz-image>
			</view>
			<view class="title dz-line-1" :style="{ color: index == activeIndex ? activeColor : inactiveColor }">{{ item.title }}</view>
		</view>
	</scroll-view>
</template>

<script lang="ts">
export default { options: { virtualHost: true } };
</script>

<script lang="ts" setup>
import { ref, reactive, watch, computed, onMounted, nextTick, getCurrentInstance } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	//需循环的标签列表
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 当前活动tab的索引
	activeIndex: {
		type: [Number, String],
		default: 0,
	},
	// 卡片背景颜色
	bgColor: {
		type: String,
		default: '#f3f4f6',
	},
	// 选中项的主题颜色
	activeColor: {
		type: String,
		default: '#2979ff',
	},
	// 未选中项的颜色
	inactiveColor: {
		type: String,
		default: '#303133',
	},
	// 无图片展示
	pCover: {
		type: String,
		default: '',
	},
});

interface Slider {
	left: number;
	width: number;
	scrollLeft: number;
}
const emit = defineEmits(['click']);
const proxy = getCurrentInstance()?.proxy ?? null;
const tagIndex = ref<number>(0);
const scorll = reactive<any>({});
const slider = reactive<Slider>({
	left: 0,
	width: 0,
	scrollLeft: 0,
});

watch(
	() => props.list,
	() => {
		nextTick(() => {
			calcScrollPosition();
		});
	}
);

const activeStyle = computed((): CSSProperties => {
	return (index) => {
		let style = {};
		if (index == props.activeIndex && index != 0) {
			style.border = `1px solid ${props.activeColor}`;
			style.background = '';
		} else {
			style = {
				background: props.bgColor,
			};
		}
		return style;
	};
});

onMounted(() => {
	tagIndex.value = props.activeIndex;
	nextTick(() => {
		calcScrollPosition();
	});
});

function calcScrollPosition() {
	const query = uni.createSelectorQuery().in(proxy);
	query
		.select('#_scroll')
		.boundingClientRect((res) => {
			for (const key in res) {
				scorll[key] = res[key];
			}
			updateTabWidth();
		})
		.exec();
}
function updateTabWidth(index = 0) {
	let data = props.list;
	if (data.length == 0) return;
	const query = uni.createSelectorQuery().in(proxy);
	query
		.select('#dz-tab-item-' + index)
		.boundingClientRect((res) => {
			data[index]._slider = {
				width: res.width,
				left: res.left,
				scrollLeft: res.left - (data[index - 1] ? data[index - 1]._slider.width : 0),
			};
			if (tagIndex.value == index) {
				tabToIndex(tagIndex.value);
			}
			index++;
			if (data.length > index) {
				updateTabWidth(index);
			}
		})
		.exec();
}
function tabToIndex(index: number) {
	let _slider = props.list[index]._slider;
	let scorll_left = (scorll && scorll.left) || 0;
	slider.left = _slider.left - scorll_left;
	slider.width = _slider.width;
	slider.scrollLeft = _slider.scrollLeft - scorll_left;
}
function tabClick(index: number) {
	tagIndex.value = index;
	tabToIndex(index);
	emit('click', index);
}
</script>

<style lang="scss" scoped>
.scroll-tap {
	white-space: nowrap;
	touch-action: none;
	.scroll-item {
		display: inline-block;
		text-align: center;
		margin-right: 16rpx;
		.image {
			width: 110rpx;
			height: 110rpx;
			margin-bottom: 6rpx;
			border-radius: 12rpx;
			box-sizing: border-box;

			.all {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 100%;
				height: 100%;
			}
		}
		.title {
			width: 110rpx;
			height: 60rpx;
			font-size: 22rpx;
		}
	}
	.scroll-item:last-child {
		margin-right: 0;
	}
}
</style>

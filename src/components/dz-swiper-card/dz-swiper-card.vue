<template>
	<view
		class="dz-swiper-card"
		:style="{
			backgroundColor: bgColor,
			margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
		}"
	>
		<swiper
			:current="mCurrent"
			:autoplay="autoplay"
			:circular="true"
			:interval="interval"
			:style="{
				height: height + 'rpx',
			}"
			@change="change"
		>
			<swiper-item
				v-for="(item, index) in list"
				:key="index"
				:class="`dz-w-${parseInt(cardWidth) * 2} dz-p-r-${parseInt(mode != 'default' ? 0 : config.clearance) * 2}`"
			>
				<view
					class="carousel__item"
					:class="mode != 'default' && (index + mCurrent + 2) % 2 !== 0 ? 'da-swiper-item-scale ' : ''"
					:style="{
						height: height + 'rpx',
						borderRadius: config.radius + 'px',
						backgroundColor: item.bgColor,
					}"
					@tap="click(item.link)"
				>
					<dz-image v-if="item.bgCover" :src="item.bgCover" :width="parseInt(cardWidth) * 2" :height="height" :borderRadius="config.radius" />
					<view class="content" :style="[contentStyle(item)]">
						<dz-image :src="item.contentCover" :width="parseInt(config.content.size) * 2" :height="parseInt(config.content.size) * 2" />
					</view>
					<view
						v-if="item.isTag == 1"
						class="tag"
						:style="{ top: `${config.content.height + config.content.top - config.tag.height - config.tag.bottom}px` }"
					>
						<view :style="[tagStyle(item)]">{{ item.tag }}</view>
					</view>
					<view v-if="item.isTitle == 1" class="tag" :style="[titleStyle(item)]">{{ item.title }} </view>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const props = defineProps({
	list: {
		type: Array,
		default() {
			return [
				{
					title: '滚动卡片',
					tag: '标签',
					bgColor: '#9863F7',
					bgCover: '',
					contentBgColor: '#fff',
					contentCover: '',
					isTitle: 0,
					titleStyle: {
						color: '#fff',
					},
					isTag: 1,
					tagStyle: {
						color: '#fff',
						backgroundColor: '#9863F7',
					},
					link: {
						activeMenuType: '',
						activeMenu: '',
					},
				},
			];
		},
	},
	// 模式，line|topBottom
	mode: {
		type: String,
		default: 'round',
	},
	// list的高度，单位px
	height: {
		type: [Number, String],
		default: 106,
	},
	// 是否自动播放
	autoplay: {
		type: Boolean,
		default: true,
	},
	// 隔多久自动切换
	interval: {
		type: [String, Number],
		default: 1000,
	},
	// 隔多久自动切换，单位ms
	duration: {
		type: [Number, String],
		default: 500,
	},
	col: {
		type: [Number, String],
		default: 4,
	},
	config: {
		type: Object,
		default: () => {},
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: 'transparent',
	},
	// 初始化时，默认显示第几项
	current: {
		type: [Number, String],
		default: 0,
	},
	// 上边距
	marginTop: {
		type: [Number, String],
		default: 0,
	},
	//下边距
	marginBottom: {
		type: [Number, String],
		default: 0,
	},
	// 左右边距
	marginLeftRight: {
		type: [Number, String],
		default: 0,
	},
});

const emit = defineEmits(['click']);
const mCurrent = ref(0);
const cardWidth = computed(() => {
	return (375 - props.marginLeftRight) / parseFloat(props.col);
});

const contentStyle = computed(() => (item: any) => {
	const style = {};
	if (Object.keys(props.config).length !== 0) {
		style.width = parseInt(cardWidth.value) - parseInt(props.config.content.leftRigh) * 2 + 'px';
		style.height = `${props.config.content.height}px`;
		style.borderRadius = `${props.config.content.radius}px`;
		style.backgroundColor = item.contentBgColor;
		style.top = `${props.config.content.top}px`;
		style.left = `${props.config.content.leftRight}px`;
		style.right = `${props.config.content.leftRight}px`;
	}
	return style;
});

const tagStyle = computed(() => (item: any) => {
	const style = {};
	if (Object.keys(props.config).length !== 0) {
		style.padding = `0 ${props.config.tag.paddingLeftRight}px`;
		style.color = item.tagStyle.color;
		style.fontSize = `${props.config.tag.fontSize}px`;
		style.height = `${props.config.tag.height}px`;
		style.lineHeight = `${props.config.tag.height}px`;
		style.borderRadius = `${props.config.tag.radius}px`;
		style.backgroundColor = item.tagStyle.backgroundColor;
	}
	return style;
});

const titleStyle = computed(() => (item: any) => {
	const style = {};
	if (Object.keys(props.config).length !== 0) {
		style.width = '100%';
		style.color = item.titleStyle.color;
		style.fontSize = `${props.config.title.fontSize}px`;
		style.height = `${props.config.title.height}px`;
		const top = props.config.content.height + props.config.content.top;
		style.top = `${top + (props.height / 2 - props.config.title.height - top) / 2}px`;
	}
	return style;
});

function change(e: any) {
	mCurrent.value = e.detail.current;
}

function click(item: any) {
	emit('click', item);
}
</script>

<script lang="ts">
export default { options: { virtualHost: true } };
</script>

<style lang="scss" scoped>
.carousel__item {
	position: relative;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: all 800ms cubic-bezier(0.39, 0.575, 0.565, 1) 0s;
}

.da-swiper-item-scale {
	transition: all 800ms cubic-bezier(0.39, 0.575, 0.565, 1) 0s;
	transform: scaleX(0.83) scaleY(0.83);
}

.content {
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
}

.tag {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
}
</style>

<template>
	<view
		v-if="show"
		class="dz-notice-bar"
		:style="{
			background: computeBgColor(),
			padding: padding,
		}"
		:class="[type ? `dz-type-${type}-light-bg` : '']"
	>
		<view class="dz-flex dz-direction-row">
			<view
				class="dz-left-icon"
				v-if="volumeIcon == 1"
				:style="{
					fontSize: `${titleStyle.fontSize}px`,
					color: titleStyle.color,
					fontWeight: titleStyle.isBold == 1 ? 'bold' : '500',
				}"
			>
				{{ title }}
			</view>
			<view class="dz-icon-wrap">
				<dz-icon class="dz-left-icon" v-if="volumeIcon == 2" name="notificationfill" :size="volumeSize" :color="computeColor"></dz-icon>
			</view>
			<dz-image v-if="volumeIcon == 3" :src="cover" :width="widthHeight" :height="widthHeight" mode="widthFix"></dz-image>
			<view class="dz-flex dz-notice-box" id="dz-notice-box">
				<view
					class="dz-flex dz-notice-content"
					id="dz-notice-content"
					:style="{
						animationDuration: animationDuration,
						animationPlayState: animationPlayState,
					}"
				>
					<text
						class="dz-notice-text"
						v-for="(item, index) in list"
						:key="index"
						@tap="click(index)"
						:style="[textStyle]"
						:class="['dz-type-' + type]"
					>
						{{ item }}<block v-if="index != list.length - 1">，</block>
					</text>
				</view>
			</view>
			<view class="dz-icon-wrap">
				<dz-icon @click="getMore" class="dz-right-icon" v-if="moreIcon" name="right" :size="26" :color="rightIconColor"></dz-icon>
				<dz-icon @click="close" class="dz-right-icon" v-if="closeIcon" name="close" :size="26" :color="rightIconColor"></dz-icon>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref, watch, computed, nextTick } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 显示的内容，数组
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 显示的主题，success|error|primary|info|warning|none
	// none主题默认为透明背景，黑色(contentColor)字体
	type: {
		type: String,
		default: 'warning',
	},
	// 是否显示左侧的音量图标
	volumeIcon: {
		type: [Number, String],
		default: 1,
	},
	// 文字
	title: {
		type: String,
		default: '',
	},
	// 文字样式
	titleStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 图标颜色
	leftIconColor: {
		type: String,
		default: '',
	},
	// 右侧图标颜色
	rightIconColor: {
		type: String,
		default: '#606266',
	},
	// 图片
	cover: {
		type: String,
		default: '',
	},
	widthHeight: {
		type: [Number, String],
		default: 40,
	},
	// 是否显示右侧的右箭头图标
	moreIcon: {
		type: Boolean,
		default: false,
	},
	// 是否显示右侧的关闭图标
	closeIcon: {
		type: Boolean,
		default: false,
	},
	// 是否自动播放
	autoplay: {
		type: Boolean,
		default: true,
	},
	// 文字颜色，各图标也会使用文字颜色
	color: {
		type: String,
		default: '',
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '',
	},
	// 是否显示
	show: {
		type: Boolean,
		default: true,
	},
	// 字体大小，单位rpx
	fontSize: {
		type: [Number, String],
		default: 26,
	},
	// 音量喇叭的大小
	volumeSize: {
		type: [Number, String],
		default: 34,
	},
	// 水平滚动时的滚动速度，即每秒滚动多少rpx，这有利于控制文字无论多少时，都能有一个恒定的速度
	speed: {
		type: [Number, String],
		default: 160,
	},
	// 播放状态，play-播放，paused-暂停
	playState: {
		type: String,
		default: 'play',
	},
	// 通知的边距
	padding: {
		type: [Number, String],
		default: '18rpx 24rpx',
	},
});

const emit = defineEmits(['click', 'close', 'getMore']);
const { proxy }: any = getCurrentInstance();

// 滚动的文字宽度
const textWidth = ref<Number>(0);
// 动画执行时间
const animationDuration = ref<String>('10s');
// 动画的开始和结束执行
const animationPlayState = ref<String>('paused');
// 显示的文本
const showText = ref<String>('');

watch(
	() => props.list,
	(val) => {
		showText.value = val.join('，');
		nextTick(() => {
			initSize();
		});
	},
	{
		immediate: true,
	}
);

watch(
	() => props.playState,
	(val) => {
		if (val == 'play') animationPlayState.value = 'running';
		else animationPlayState.value = 'paused';
	}
);

watch(
	() => props.speed,
	() => {
		initSize();
	}
);

// 计算字体颜色，如果没有自定义的，就用主题颜色
const computeColor = computed(() => {
	if (props.leftIconColor) return props.leftIconColor;
	// 如果是无主题，就默认使用content-color
	else if (props.type == 'none') return '#606266';
	else return props.type;
});

// 文字内容的样式
const textStyle = computed((): CSSProperties => {
	let style = {};
	if (props.color) {
		style.color = props.color;
	} else if (props.type == 'none') {
		style.color = '#606266';
	}
	style.fontSize = props.fontSize + 'rpx';
	return style;
});

// 计算背景颜色
function computeBgColor() {
	if (props.bgColor) {
		return props.bgColor;
	} else if (props.type == 'none') {
		return 'transparent';
	}
}

onMounted(() => {
	nextTick(() => {
		initSize();
	});
});

function initSize() {
	let query = [];
	textWidth.value = 0;
	let textQuery = new Promise((resolve) => {
		uni.createSelectorQuery()
			.in(proxy)
			.select(`#dz-notice-content`)
			.boundingClientRect()
			.exec((ret) => {
				textWidth.value = ret[0].width;
				resolve();
			});
	});
	query.push(textQuery);
	Promise.all(query).then(() => {
		// 根据t=s/v(时间=路程/速度)，这里为何不需要加上#dz-notice-box的宽度，因为中设置了.dz-notice-content样式中设置了padding-left: 100%
		// 恰巧计算出来的结果中已经包含了#dz-notice-box的宽度
		animationDuration.value = `${textWidth.value / uni.upx2px(props.speed)}s`;
		// 这里必须这样开始动画，否则在APP上动画速度不会改变(HX版本2.4.6，IOS13)
		animationPlayState.value = 'paused';
		setTimeout(() => {
			if (props.playState == 'play' && props.autoplay) animationPlayState.value = 'running';
		}, 10);
	});
}

// 点击通告栏
function click(index) {
	emit('click', index);
}

// 点击关闭按钮
function close() {
	emit('close');
}

// 点击更多箭头按钮
function getMore() {
	emit('getMore');
}
</script>

<style lang="scss" scoped>
.dz-notice-bar {
	padding: 18rpx 24rpx;
	overflow: hidden;
}

.dz-direction-row {
	align-items: center;
	justify-content: space-between;
}

.dz-left-icon {
	display: inline-flex;
	align-items: center;
}

.dz-notice-box {
	flex: 1;
	overflow: hidden;
	margin-left: 12rpx;
}

.dz-right-icon {
	margin-left: 12rpx;
	display: inline-flex;
	align-items: center;
}

.dz-notice-content {
	animation: dz-loop-animation 10s linear infinite both;
	text-align: right;
	// 这一句很重要，为了能让滚动左右连接起来
	padding-left: 100%;
	flex-wrap: nowrap;
}

.dz-notice-text {
	font-size: 26rpx;
	word-break: keep-all;
	white-space: nowrap;
}

@keyframes dz-loop-animation {
	0% {
		transform: translate3d(0, 0, 0);
	}

	100% {
		transform: translate3d(-100%, 0, 0);
	}
}
</style>

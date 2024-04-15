<template>
	<view @touchmove.stop.prevent>
		<view
			class="popup-adv"
			:style="{ width: list.length == 1 ? width : '700rpx', borderRadius: radius }"
			:class="[fadeIn || show ? 'popup-adv-normal' : 'popup-adv-scale', show ? 'popup-adv-show' : '']"
		>
			<view v-if="list.length == 1" class="popup-adv__image" :style="{ borderRadius: radius, overflow: 'hidden' }">
				<image :src="list[0].cover" :style="{ borderRadius: radius, overflow: 'hidden' }" @tap="click(0)"></image>
			</view>
			<view v-else class="popup-adv__swiper">
				<dz-swiper name="cover" :list="list" :effect3d="true" :autoplay="false" border-radius="30" height="750" bgColor="" @click="click"></dz-swiper>
			</view>
			<view class="dz-flex dz-row-center dz-m-t-30" @tap.stop="cancel"><dz-icon name="roundclosefill" size="70" color="#f3f4f6"></dz-icon></view>
		</view>
		<view class="popup-adv__mask" :class="[show ? 'popup-adv__mask__show' : '']" @tap="maskClick"></view>
	</view>
</template>

<script lang="ts" setup>
const props = defineProps({
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	//是否显示
	show: {
		type: Boolean,
		default: false,
	},
	width: {
		type: String,
		default: '600rpx',
	},
	radius: {
		type: String,
		default: '30rpx',
	},
	//标题
	title: {
		type: String,
		default: '',
	},
	//点击遮罩 是否可关闭
	maskClosable: {
		type: Boolean,
		default: false,
	},
	//淡入效果
	fadeIn: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['click', 'maskClick', 'cancel']);

function click(index: number) {
	emit('click', index);
}

function maskClick() {
	if (!props.show) return;
	emit('maskClick');
}

function cancel() {
	emit('cancel');
}
</script>

<style lang="scss" scoped>
.popup-adv {
	position: fixed;
	left: 50%;
	top: 50%;
	margin: auto;
	z-index: 9999997;
	transition: all 0.6s ease-in-out;
	opacity: 0;
	box-sizing: border-box;
	visibility: hidden;
	&__image {
		width: 100%;
		position: relative;
		image {
			width: 100%;
			height: 750rpx;
		}
	}
	&__swiper {
		width: 100%;
	}
	&__mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		z-index: 9999996;
		transition: all 0.6s ease;
		opacity: 0;
		visibility: hidden;
	}
	&__mask__show {
		visibility: visible;
		opacity: 1;
	}
}

.popup-adv-scale {
	transform: translate(-50%, -50%) scale(0);
}

.popup-adv-normal {
	transform: translate(-50%, -50%) scale(1);
}

.popup-adv-show {
	opacity: 1;
	visibility: visible;
}
</style>

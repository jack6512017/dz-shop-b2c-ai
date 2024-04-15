<template>
	<view class="guide" :style="{ height: systemInfo.screenHeight + 'px' }">
		<swiper
			class="flex1"
			:interval="2000"
			:indicator-dots="true"
			:show-indicators="true"
			:autoplay="autoPlay"
			@change="sliderChange"
			:infinite="false"
			:forbid-slide-animation="false"
		>
			<swiper-item class="flex1" v-for="(img, index) in imageList" :key="index">
				<view class="flex1" @click="launchAppIndex">
					<!-- #ifndef APP-PLUS -->
					<image class="flex1" mode="aspectFill" :style="{ width: screenWidth + 'px', height: systemInfo.screenHeight + 'px' }" :src="img" />
					<!-- #endif -->
					<!-- #ifdef APP-PLUS -->
					<image class="flex1" resize="aspectFill" :src="img" :style="{ width: screenWidth + 'px', height: systemInfo.screenHeight + 'px' }" />
					<!-- #endif -->
				</view>
			</swiper-item>
		</swiper>
		<view class="swiper-to-home" @click="launchApp">
			<text class="swiper-to-home-text">{{ time }}S</text>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const systemInfo = uni.getSystemInfoSync();
const screenWidth = systemInfo.screenWidth;
const data = reactive({
	imageList: [],
	autoPlay: true,
	currIndex: 0,
	time: 0,
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

onLoad(async () => {
	await uni.$onLaunched;
	data.imageList = shopSetting.value.style_attention_app_guide;
	data.time = data.imageList.length * 2;
	isTime();
});

function isTime() {
	var countDown = setInterval(() => {
		if (data.time == 1) {
			launchApp();
			clearInterval(countDown);
			return;
		}
		data.time--;
	}, 1000);
}

function sliderChange(e) {
	data.currIndex = e.detail.current;
	if (data.imageList.length == data.currIndex + 1 && data.time == 1) {
		data.autoPlay = false;
		launchApp();
	}
}

function launchAppIndex() {
	if (data.imageList.length == data.currIndex + 1) {
		launchApp();
	} else {
		return;
	}
}

function launchApp() {
	uni.navigateBack();
	userStore.setIsGuide(false);
}

const { autoPlay, imageList, time } = { ...toRefs(data) };
</script>
<style scoped>
.guide {
	display: flex;
	height: 100%;
	flex-direction: column;
	flex: 1;
}

.flex1 {
	flex: 1;
}

.swiper-to-home {
	position: absolute;
	z-index: 999;
	right: 40rpx;
	/* #ifndef MP */
	top: 80rpx;
	/* #endif */
	/* #ifdef MP */
	top: 150rpx;
	/* #endif */
}

.swiper-to-home-text {
	color: #ffffff;
	text-align: center;
	background-color: rgba(0, 0, 0, 0.5);
	border-width: 1rpx;
	border-color: #ffffff;
	border-style: solid;
	border-radius: 30rpx;
	font-size: 28rpx;
	padding-top: 10rpx;
	padding-bottom: 10rpx;
	padding-left: 30rpx;
	padding-right: 30rpx;
}

.indicator {
	width: 714rpx;
	height: 30rpx;
	position: absolute;
	bottom: 50rpx;
	left: 1rpx;
	item-color: #f6f6f6;
	item-selected-color: #fd575c;
	item-size: 20rpx;
}
</style>

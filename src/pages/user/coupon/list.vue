<template>
	<view>
		<dz-navbar-immersive
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar :title="language.coupon.couponTitle" :followTheme="false" :shadow="0"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			:title="language.coupon.couponTitle"
			:background="{ background: theme.dzBaseColor }"
			:border-bottom="false"
			:back-icon-color="theme.dzBaseFontColor"
			:title-color="theme.dzBaseFontColor"
		></dz-navbar>
		<block v-if="list.length">
			<view
				class="banner"
				:style="{
					height: 180 + api.systemInfo.statusBarHeight + 'px',
					background: theme.dzBaseColor,
				}"
			>
				<view class="tetle" :style="{ paddingTop: 64 + api.systemInfo.statusBarHeight + 'px' }">{{ language.coupon.couponTip }}</view>
				<view class="tip">{{ language.coupon.couponText }}</view>
			</view>
			<view class="round"></view>
			<view class="content">
				<block v-for="(item, index) in list" :key="index">
					<dz-coupon-item :coupon="item" isButton customStyle="margin-bottom:20rpx" @click="getCoupon($event, index)"></dz-coupon-item>
				</block>
			</view>
		</block>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" :text="language.product.noCouponsAvailable" :src="emptyCoupon" iconSize="360"></dz-empty>
		<view class="dz-relative dz-ios-p-safe-bottom"
			><dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="list.length ? 0 : 20" margin-bottom="20"></dz-loadmore
		></view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CSSProperties } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom, onPageScroll } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const page = ref<number>(1);
const list = ref<array>([]);
const emptyCoupon = uni.$api.assetsConfig.emptyCoupon;
const loadingStatus = ref<string>('loading');
const scrollTop = ref<number>(0);
const opacity = ref<number>(0);

const navbarStyle = computed((): CSSProperties => {
	let style = {};
	style.opacity = opacity.value;
	return style;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.language.coupon.couponTitle,
	});
	getCouponList();
});

onPageScroll((e) => {
	scrollTop.value = e.scrollTop;
});

onPullDownRefresh(() => {
	page.value = 1;
	list.value = [];
	getCouponList();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getCouponList();
});

function opacityChange(e) {
	opacity.value = e.opacity;
}

function getCouponList() {
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiShop.couponIndex, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSzie,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

function login() {
	uni.navigateTo({
		url: uni.$api.routesConfig.login.path,
		animationType: 'slide-in-bottom',
	});
}

//获取优惠券
async function getCoupon(item: any, index: number) {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	await uni.$api.http
		.post(uni.$api.apiShop.couponCreate, {
			id: item.id,
		})
		.then((res) => {
			if (list.value[index]) {
				if (!item.myGet) {
					list.value[index].myGet = {
						count: 1,
					};
				} else {
					list.value[index].myGet.count = parseInt(item.myGet.count) + 1;
				}
				if (
					parseInt(list.value[index].max_fetch) > 0 &&
					list.value[index].myGet &&
					list.value[index].myGet.count == parseInt(list.value[index].max_fetch)
				) {
					list.value[index].is_get = 0;
				} else {
					list.value[index].is_get = 1;
				}
			}
			uni.$api.toast(uni.$api.language.product.couponGetSuccess);
		});
}
</script>

<style lang="scss">
.banner {
	position: absolute;
	width: 100%;
	height: 380rpx;
	top: 0;
	text-align: center;
	.tetle {
		padding-top: 128rpx;
		font-size: 58rpx;
		font-family: PingFang;
		font-weight: 800;
		background: linear-gradient(0deg, #fffefa 0%, #f0ce86 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.tip {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #ffffff;
	}
}
.content {
	margin-top: -60rpx;
	padding: 0 20rpx 1rpx;
}

.round {
	position: relative;
	width: 100%;
	height: 80rpx;
	margin-top: 200rpx;
	background: #f5f5f5;
	border-radius: 50rpx 50rpx 0 0;
}
</style>

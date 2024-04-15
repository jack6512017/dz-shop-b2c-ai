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
			<dz-navbar :title="`我的${shopSetting.point_front_name}`"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			:title="`我的${shopSetting.point_front_name}`"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
			:border-bottom="false"
			:background="{ background: theme.dzBaseColor }"
		></dz-navbar>
		<view
			class="integral-bg"
			:style="{
				height: `${420 + api.systemInfo.statusBarHeight * 2}rpx`,
				background: `linear-gradient(180deg,${theme.dzBaseColor} 80%,${api.theme.dzBgColor})100%`,
			}"
		></view>
		<view v-if="userInfo.account" class="card">
			<view class="integral-box">
				<view class="integral">
					<view class="dzicon-iconfont dzicon-tubiao309"></view>
					<view class="integral">{{ (userInfo.account && userInfo.account.user_integral) || '0' }}</view>
				</view>
				<view class="btn" @tap="toPage('integralDetail')"><text>明细</text></view>
			</view>
		</view>
		<view class="content">
			<dz-row justify="space-between" class="dz-m-t-20">
				<dz-col :gutter="16" span="4">
					<view class="card-item">
						<text>{{ (userInfo.account && userInfo.account.accumulate_integral) || '0' }}</text>
						<text class="dz-m-t-10">累计{{ shopSetting.point_front_name }}</text>
					</view>
				</dz-col>
				<dz-col :gutter="16" span="4">
					<view class="card-item">
						<text>{{ (userInfo.account && Math.abs(parseInt(userInfo.account.consume_integral))) || '0' }}</text>
						<text class="dz-m-t-10">累计消费</text>
					</view>
				</dz-col>
				<dz-col :gutter="16" span="4">
					<view class="card-item">
						<text>{{ (userInfo.account && userInfo.account.frozen_integral) || '0' }}</text>
						<text class="dz-m-t-10">冻结{{ shopSetting.point_front_name }}</text>
					</view>
				</dz-col>
			</dz-row>
		</view>
		<view class="integral-product dz-m-20"
			><dz-title :title="`${shopSetting.point_front_name}商品`" mode="line" :barColor="theme.dzBaseDisabled"></dz-title
		></view>
		<dz-product-list :list="list" marginLeftRight="20"></dz-product-list>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :text="`暂无${shopSetting.point_front_name}商品`" :src="empty" iconSize="360"></dz-empty>
		<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CSSProperties } from 'vue';
import { onLoad, onPullDownRefresh, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const loadingStatus = ref<string>('loading');
const page = ref<number>(1);
const scrollTop = ref<number>(0);
const opacity = ref<number>(0);
const empty = uni.$api.assetsConfig.empty;
const list = ref([]);

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '我的' + shopSetting.value.point_front_name,
	});
	init();
});

onPullDownRefresh(() => {
	init();
});

onPageScroll((e) => {
	scrollTop.value = e.scrollTop;
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getProductList();
});

function opacityChange(e) {
	opacity.value = e.opacity;
}

function init() {
	if (userStore.hasLogin) {
		getMemberIndex();
	}
	getProductList();
}

const navbarStyle = computed((): CSSProperties => {
	let style = {};
	style.opacity = opacity.value;
	return style;
});

function getMemberIndex() {
	uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

function toPage(url) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
	});
}

function getProductList() {
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiShop.productIndex, {
			params: {
				page: page.value,
				is_integral: 1,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		});
	uni.stopPullDownRefresh();
}
</script>

<style lang="scss" scoped>
.integral-bg {
	position: absolute;
	top: 0;
	width: 100%;
}
.card {
	position: relative;
	z-index: 1;
	color: #ffffff;
	.integral-box {
		text-align: center;
		position: relative;
		padding: 40rpx 0;

		.integral {
			display: flex;
			align-items: center;
			justify-content: center;

			.dzicon-tubiao309 {
				padding-top: 12rpx;
				margin-right: 20rpx;
				font-size: 46rpx;
			}
			.integral {
				font-size: 70rpx;
				font-weight: 500;
			}
		}
		.btn {
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			height: 40rpx;

			text {
				margin-top: 40rpx;
				padding: 0 20rpx;
				line-height: 40rpx;
				font-size: 24rpx;
				border-radius: 20rpx;
				background-color: rgba(255, 255, 255, 0.4);
			}
		}
	}
}
.card-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.content {
	position: relative;
	margin: 20rpx 24rpx 0;
	padding: 30rpx;
	border-radius: 20rpx;
	background: #fff;
	color: $dz-content-color;
}
</style>

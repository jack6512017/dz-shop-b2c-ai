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
			<dz-navbar :title="'我的账户'"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			:title="'我的账户'"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
			:border-bottom="false"
			:background="{ background: theme.dzBaseColor }"
		></dz-navbar>
		<view
			class="account-bg"
			:style="{
				height: `${300 + api.systemInfo.statusBarHeight * 2}rpx`,
				background: `linear-gradient(180deg,${theme.dzBaseColor} 60%,${theme.dzBgColor})100%`,
			}"
		>
		</view>
		<view class="account-box" v-if="userInfo.account">
			<view class="dz-m-b-30 name">{{ shopSetting.balance_front_name || '余额' }}</view>
			<view class="price" @tap="toPage('bill', 1)"
				><text class="dz-font-40">￥</text> {{ (userInfo && userInfo.account && userInfo.account.user_money) || '0.00' }}</view
			>
			<view class="dz-m-t-40">
				<dz-button
					:border="false"
					:custom-style="{ background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
					hover-class="none"
					size="medium"
					shape="circle"
					@click="toPage('creditsLog')"
				>
					明细
				</dz-button>
				<dz-button
					v-if="parseInt(shopSetting.is_open_recharge) === 1"
					:border="false"
					:custom-style="{ marginLeft: '20rpx', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					hover-class="none"
					size="medium"
					shape="circle"
					@click="toPage('recharge')"
				>
					充值
				</dz-button>
			</view>
		</view>
		<dz-title title="专属推荐" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
		<dz-product-list class="dz-m-20" :list="guessYouLikeList"></dz-product-list>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view v-if="loadingStatus == 'loading'" class="dz-p-b-20 dz-ios-m-bline"><dz-loadmore :status="loadingStatus" margin-top="20"></dz-loadmore></view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { CSSProperties } from 'vue';
import { onLoad, onPullDownRefresh, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const loadingStatus = ref<string>('loading');
const page = ref<number>(0);
const scrollTop = ref<number>(0);
const opacity = ref<number>(0);
const empty = uni.$api.assetsConfig.empty;
const guessYouLikeList = ref<array>([]);

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '我的账户',
	});

	init();
	uni.$on('integralChange', (data) => {
		if (userStore.hasLogin) {
			getMemberIndex();
		}
	});
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
	getGuessYouLikeList();
});

const navbarStyle = computed((): CSSProperties => {
	let style = {};
	style.opacity = opacity.value;
	return style;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

function init() {
	if (userStore.hasLogin) {
		getMemberIndex();
	}
	getGuessYouLikeList();
}

function opacityChange(e) {
	opacity.value = e.opacity;
}

function getMemberIndex() {
	uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

function toPage(url, status) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			status,
		},
	});
}
// 专属推荐
async function getGuessYouLikeList() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			guessYouLikeList.value = [...guessYouLikeList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
}
</script>

<style lang="scss" scoped>
.account-bg {
	position: absolute;
	top: 0;
	width: 100%;
}

.account-box {
	position: relative;
	z-index: 1;
	margin: 20rpx;
	padding: 30rpx;
	border-radius: 20rpx;
	text-align: center;
	overflow: hidden !important;
	background: #fff;
	.name {
		color: $dz-tips-color;
	}
	.price {
		font-size: 70rpx;
		font-weight: 500;
	}
}
</style>

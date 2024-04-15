<template>
	<view>
		<dz-navbar-immersive splitLine scrollRatio="0.3" :isCustom="true" :scrollTop="scrollTop" backgroundColor="#fff">
			<dz-navbar title="直播间"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			title="直播间"
			:isFixed="true"
			:background="{ background: theme.dzBaseColor }"
			:border-bottom="false"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
		></dz-navbar>
		<view class="pure_top"><view class="pure_top_view" :style="{ background: theme.dzBaseColor }"></view></view>
		<view class="swiper"><dz-swiper :list="advList" name="cover" height="320" border-radius="20" bg-color="" class="swiper-banner"></dz-swiper></view>
		<dz-tabs
			:list="tabList"
			:current="current"
			:scrollable="false"
			lineHeight="4"
			:activeStyle="{
				color: theme.dzBaseColor,
				fontSize: '30rpx',
				fontWeight: '700',
			}"
			:lineColor="theme.dzBaseColor"
			bgColor="transparent"
			@change="tabChange"
		></dz-tabs>
		<view class="container">
			<view class="item" v-for="(item, index) in miniProgramLivelist" :key="index" @tap="toLive(item)">
				<view class="right">
					<image :src="item.cover" lazy-load></image>
					<view class="tag dz-flex" :style="{ background: parseInt(item.live_status) === 102 ? theme.dzBaseDisabled : 'rgba(0, 0, 0, 0.5)' }">
						<dz-page-loading-style v-if="parseInt(item.live_status) === 101" mode="loading-7"></dz-page-loading-style>
						<text class="dz-m-l-6">{{ filterStateText(item.live_status) }}</text>
					</view>
					<view class="live">
						<view class="title dz-line-1" style="width: 450rpx">{{ item.name }}</view>
						<view class="name">主播: {{ item.anchor_name || '匿名' }}</view>
						<view class="time" v-if="item.live_status === '101'">直播开始于 {{ api.timeFormat(item.start_time) }}</view>
						<view class="time" v-if="item.live_status === '102'">直播于 {{ api.timeFormat(item.start_time) }} 开始</view>
						<view class="time" v-if="item.live_status === '103'"
							>直播: {{ api.timeFormat(item.start_time) }} - {{ api.timeFormat(item.end_time) }}</view
						>
					</view>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="60" class="dz-m-b-60" text="暂无直播记录" :src="empty" iconSize="360"></dz-empty>
		<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		<dz-title v-if="guessYouLikeList.length" class="dz-m-t-20" title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
		<dz-product-list :list="guessYouLikeList" :marginTop="20" :marginLeftRight="20" :marginBottom="20"></dz-product-list>
		<dz-empty
			v-if="loadingStatus == 'nodata' && loadingProductStatus == 'nodata' && miniProgramLivelist.length == 0"
			margin-top="80"
			:src="empty"
			iconSize="360"
		></dz-empty>
		<dz-loadmore
			v-if="loadingStatus == 'nodata' && loadingProductStatus == 'loading' && miniProgramLivelist.length == 0"
			:status="loadingProductStatus"
			margin-top="0"
			margin-bottom="20"
		></dz-loadmore>
		<dz-safe-bottom></dz-safe-bottom>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPageScroll, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const empty = uni.$api.assetsConfig.empty;
const tabList = [
	{
		state: 101,
		name: '进行中',
	},
	{
		state: 102,
		name: '未开始',
	},
	{
		state: 103,
		name: '已结束',
	},
];
const data = reactive({
	advList: [],
	current: 0,
	state: 101,
	page: 1,
	miniProgramLivelist: [],
	loadingStatus: 'loading',
	loadingProductStatus: null,
	guessYouLikeList: [],
	scrollTop: 0,
	opacity: 0,
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '直播间',
	});
	data.state = tabList[data.current].state;

	getMiniProgramLiveIndex();
	getAdvList();
});

onPageScroll((e: any) => {
	data.scrollTop = e.scrollTop;
});

onPullDownRefresh(() => {
	data.page = 1;
	data.miniProgramLivelist = [];
	data.guessYouLikeList = [];
	data.advList = [];
	getMiniProgramLiveIndex();
	getAdvList();
});

onReachBottom(() => {
	if (data.miniProgramLivelist.length > 0) {
		if (data.loadingStatus == 'nomore') return;
		data.page++;
		getMiniProgramLiveIndex();
	} else {
		if (data.loadingProductStatus == 'nomore') return;
		data.page++;
		getGuessYouLikeList();
	}
});

function tabChange({ index }: any) {
	data.current = index;
	data.page = 1;
	data.state = tabList[index].state;
	data.miniProgramLivelist.length = 0;
	data.guessYouLikeList.length = 0;
	getMiniProgramLiveIndex();
}

async function getMiniProgramLiveIndex() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiLive.miniProgramLiveIndex, {
			params: {
				page: data.page,
				live_status: data.state,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.miniProgramLivelist = [...data.miniProgramLivelist, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
				getGuessYouLikeList();
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
}

function toLive(item: any) {
	uni.$api.shop.liveNavigate(item.room_id);
}

async function getAdvList() {
	await uni.$api.http
		.get(uni.$api.apiBase.advIndex, {
			params: {
				location: 'live_top',
			},
		})
		.then((res) => {
			data.advList = res.data.live_top;
		});
	uni.stopPullDownRefresh();
}

// 为你推荐
async function getGuessYouLikeList() {
	data.loadingProductStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingProductStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.guessYouLikeList = [...data.guessYouLikeList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingProductStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loadingProductStatus = 'loadmore';
		});
}

function filterStateText(val: any) {
	switch (parseInt(val, 10)) {
		case 101:
			return '直播中';
		case 102:
			return '未开始';
		case 103:
			return '已结束';
	}
}

const { scrollTop, advList, current, miniProgramLivelist, loadingStatus, guessYouLikeList, loadingProductStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.container {
	position: relative;
	padding: 24rpx;
}

.pure_top {
	width: 100%;
	height: 400rpx;
	position: relative;
	z-index: 0;
	overflow: hidden;
}

.pure_top_view {
	content: '';
	width: 160%;
	height: 320rpx;
	position: absolute;
	left: -30%;
	top: 0;
	border-radius: 0 0 50% 50%;
}

.swiper {
	position: relative;
	z-index: 99;
	padding: 20rpx 24rpx 30rpx;
	margin-top: -360rpx;
}

.swiper-banner {
	overflow: hidden;
	padding-bottom: 50rpx;
}
.item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 220rpx;
	background: #ffffff;
	border-radius: 20rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
	.right {
		display: flex;
		align-items: center;
		position: relative;
		image {
			flex-shrink: 0;
			width: 220rpx;
			height: 220rpx;
		}
		.live {
			height: 100%;
			display: flex;
			flex-direction: column;
			align-content: space-around;
			margin: 20rpx;
			color: $dz-main-color;
			.title {
				font-size: 32rpx;
			}
			.name {
				padding: 20rpx 0 10rpx;

				color: $dz-tips-color;
			}
		}
		.tag {
			position: absolute;
			top: 20rpx;
			left: 20rpx;
			height: 52rpx;
			padding: 0 12rpx;
			color: #fff;
			background-color: rgba(0, 0, 0, 0.5);
			border-radius: 26rpx 26rpx 26rpx 0;
		}
	}
	.left {
		margin-right: 20rpx;
	}
}
</style>

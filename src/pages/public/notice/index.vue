<template>
	<view class="container">
		<dz-navbar title="公告"> </dz-navbar>
		<view class="notice-item" v-for="item in announceList" :key="item.id">
			<text class="time">{{ api.timeFormat(item.created_time) }}</text>
			<view class="content" @tap.stop="noticeTap(item.id)">
				<text class="title">{{ item.title }}</text>
				<view class="img-wrapper" v-if="item.cover"><image class="pic" mode="aspectFit" :src="item.cover"></image></view>
				<text class="introduce" v-if="item.synopsis">{{ item.synopsis }}</text>
				<view class="bot dz-flex">
					<text>查看详情</text>
					<dz-icon name="right" size="30"></dz-icon>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="160" :icon="empty"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref } from 'vue';
import assets from '@/core/config/assetsConfig';

const loading = ref<Boolean>(false);
const loadingStatus = ref<String>('loading');
const announceList = ref<Array>([]);
const page = ref<Number>(1);
const empty = assets.empty;

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: '公告' });
	getNotifyAnnounceIndex();
});

onPullDownRefresh(() => {
	page.value = 1;
	announceList.value = [];
	getNotifyAnnounceIndex();
});

onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getNotifyAnnounceIndex();
});

async function getNotifyAnnounceIndex() {
	if (loading.value) {
		uni.stopPullDownRefresh();
		return;
	}
	loading.value = true;
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiBase.announceIndex, {
			params: {
				page: page.value,
				page_size: 10,
			},
		})
		.then((res) => {
			loading.value = false;
			uni.stopPullDownRefresh();
			loadingStatus.value = res.data.length === 10 ? 'loadmore' : 'nomore';
			announceList.value = [...announceList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		})
		.catch(() => {
			uni.stopPullDownRefresh();
			loading.value = false;
			loadingStatus.value = 'loadmore';
		});
}

function noticeTap(id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.noticeDetail,
		query: {
			id,
		},
	});
}
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 20rpx;
}
.notice-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 0 20rpx 20rpx;
}

.time {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 80rpx;
	padding-top: 10rpx;
	font-size: 26rpx;
	color: $dz-tips-color;
}

.content {
	width: 710rpx;
	padding: 15rpx 24rpx 0;
	background-color: #fff;
	border-radius: 20rpx;
}

.title {
	font-size: 32rpx;
}

.img-wrapper {
	width: 100%;
	height: 260rpx;
	position: relative;
}

.pic {
	display: block;
	width: 100%;
	height: 100%;
	border-radius: 6rpx;
}

.cover {
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	font-size: 36rpx;
	color: #fff;
}

.introduce {
	display: inline-block;
	padding: 16rpx 0;
	font-size: 28rpx;
	color: $dz-content-color;
	line-height: 38rpx;
}

.bot {
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	height: 80rpx;
	font-size: 24rpx;
	color: $dz-tips-color;
	position: relative;
}
</style>

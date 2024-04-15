<template>
	<view>
		<dz-navbar title="收藏"></dz-navbar>
		<view class="content">
			<content-list ref="contentListRef" :list="shareContentList" @collect="collect"></content-list>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="0" margin-bottom="20"></dz-loadmore>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, unref } from 'vue';
import { onLoad, onUnload, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import contentList from '@/pages/main/discover/components/content-list/content-list.vue';

const empty = uni.$api.assetsConfig.empty;
const page = ref<number>(1);
const shareContentList = ref<array>([]);
const loadingStatus = ref<string>('loading');
const contentListRef = ref(null);

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '收藏',
	});
	getShareContent();
	uni.$on('collectionLikeChange', () => {
		page.value = 1;
		shareContentList.value = [];
		getShareContent();
	});
});

onPullDownRefresh(() => {
	page.value = 1;
	shareContentList.value = [];
	getShareContent();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getShareContent();
});

onUnload(() => {
	unref(contentListRef)?.videoPauseAll();
	uni.$off('collectionLikeChange');
});

async function getShareContent() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShare.collectionIndex, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			shareContentList.value = [...shareContentList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		})
		.catch((err) => {
			loadingStatus.value = 'loadmore';
			console.log(err);
		});
	uni.stopPullDownRefresh();
}

function collect(index) {
	shareContentList.value.splice(index, 1);
	if (shareContentList.value.length == 0) {
		loadingStatus.value = 'noData';
	}
}
</script>

<style lang="scss" scoped>
.content {
	padding: 20rpx 24rpx 1rpx;
}
</style>

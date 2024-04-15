<template>
	<view>
		<dz-navbar :title="title"></dz-navbar>
		<view class="content">
			<scroll-view scroll-x class="scroll-tap" v-if="cateList.length > 0">
				<block v-for="(item, index) in cateList" :key="index">
					<view class="scroll-item dz-content-bg-color" @tap="cateTap(item)">
						<view class="image"><dz-image :src="item.cover" :borderRadius="50" :width="100" :height="100"></dz-image></view>
						<view class="text dz-line-1 dz-tips-color">{{ item.title }}</view>
					</view>
				</block>
			</scroll-view>
			<content-list ref="contentListRef" :list="shareContentList"></content-list>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="20" :src="empty" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="0" margin-bottom="20"></dz-loadmore>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, unref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom, onUnload } from '@dcloudio/uni-app';
import contentList from '@/pages/main/discover/components/content-list/content-list.vue';

const title = ref<string>();
const shareId = ref<string>();
const page = ref<number>(1);
const shareContentList = ref<array>([]);
const cateList = ref<array>([]);
const loadingStatus = ref<string>('loading');
const empty = uni.$api.assetsConfig.empty;
const contentListRef = ref(null);

onLoad(async (options) => {
	await uni.$onLaunched;
	title.value = options.title;
	shareId.value = options.id;
	uni.setNavigationBarTitle({
		title: options.title,
	});

	getShareContent();
	getShareCateChilds();

	uni.$on('collectionLikeChange', () => {
		page.value = 1;
		shareContentList.value = [];
		getShareContent();
	});
});

onPullDownRefresh(() => {
	page.value = 1;
	cateList.value = [];
	shareContentList.value = [];
	getShareContent();
	getShareCateChilds();
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

async function getShareCateChilds() {
	await uni.$api.http
		.get(uni.$api.apiShare.childs, {
			params: {
				id: shareId.value,
			},
		})
		.then((res) => {
			cateList.value = res.data;
		});
}

async function getShareContent() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShare.contentIndex, {
			params: {
				page: page.value,
				cate_id: shareId.value,
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
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

function cateTap(item: object) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.shareList,
		query: {
			id: item.id,
			title: item.title,
		},
	});
}
</script>

<style lang="scss" scoped>
.content {
	padding: 24rpx 24rpx 1rpx;
}
.scroll-tap {
	white-space: nowrap;
	margin-bottom: 20rpx;
	.scroll-item {
		display: inline-block;
		text-align: center;
		width: 166rpx;
		margin-right: 20rpx;
		padding: 20rpx;
		border-radius: 20rpx;
		.image {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			margin: 0 auto;
		}
		.text {
			margin-top: 6rpx;
			font-size: 28rpx;
		}
	}
	.scroll-item:last-of-type {
		margin-right: 0;
	}
}
</style>

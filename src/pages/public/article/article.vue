<template>
	<view class="container">
		<dz-navbar title="文章中心" :borderBottom="false"></dz-navbar>
		<dz-swiper
			v-if="banner.length"
			name="cover"
			:list="banner"
			:mode="'round'"
			:height="320"
			indicator-pos="bottomCenter"
			bgColor=""
			borderRadius="0"
			@click="swiperClick"
		></dz-swiper>
		<view class="tap" v-if="cateData.length > 0">
			<scroll-view scroll-x class="scroll-tap">
				<block v-for="(item, index) in cateData" :key="index">
					<view class="scroll-item" @tap="cateTap(item)">
						<view class="text">
							<view>{{ item.title }}</view>
						</view>
					</view>
				</block>
			</scroll-view>
		</view>
		<dz-article
			:list="articleList"
			:mode="articleConfig.mode"
			:defaultList="articleConfig.list"
			:data-source="articleConfig.dataSource"
			:margin-left-right="parseInt(articleConfig.marginLeftRight) * 2"
			:margin-top="parseInt(articleConfig.marginTop) * 2"
			:margin-bottom="parseInt(articleConfig.marginBottom)"
			:card-margin="parseInt(articleConfig.cardMargin) * 2"
			:card-padding="parseInt(articleConfig.cardPadding) * 2"
			:content-padding="parseInt(articleConfig.contentPadding) * 2"
			:borderRadius="parseInt(articleConfig.borderRadius) * 2"
			:radius1="parseInt(articleConfig.radius1) * 2"
			:radius2="parseInt(articleConfig.radius2) * 2"
			:width="parseInt(articleConfig.width) * 2"
			:height="parseInt(articleConfig.height) * 2"
			:is-description="articleConfig.isDescription"
			:is-time="articleConfig.isTime"
			:is-view-count="articleConfig.isViewCount"
		></dz-article>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view v-if="loadingStatus == 'loading'">
			<dz-loadmore :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
		<dz-safe-bottom></dz-safe-bottom>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom, onUnload } from '@dcloudio/uni-app';

const empty = uni.$api.assetsConfig.emptyOrder;
const banner = ref<array>([]);
const articleList = ref<array>([]);
const cateId = ref<string>('');
const loadingStatus = ref<string>('loading');
const page = ref<number>(1);
const articleConfig = {
	cardMargin: 10,
	cardPadding: 0,
	contentPadding: 10,
	dataSource: 'manual',
	height: 160,
	isDescription: 1,
	isTime: 1,
	isViewCount: 1,
	marginLeftRight: 10,
	marginBottom: 10,
	marginTop: 10,
	mode: 'max',
	num: 1,
	borderRadius: 10,
	radius1: 10,
	radius2: 0,
	width: 112,
};
const cateData = ref<array>([]);
const isLoading = ref<boolean>(false);

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '文章中心',
	});

	if (options.cate_id) {
		cateId.value = options.cate_id;
	}
	getIndex();
	getArticle();

	uni.$on('niceChange', () => {
		page.value = 1;
		articleList.value = [];
		getArticle();
	});
});

onPullDownRefresh(() => {
	page.value = 1;
	banner.value = [];
	articleList.value = [];
	getIndex();
	getArticle();
});

onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getArticle();
});

onUnload(() => {
	uni.$off('niceChange');
});

async function getIndex() {
	await uni.$api.http.get(uni.$api.apiArticle.article).then((res) => {
		banner.value = res.data.adv;
		cateData.value = res.data.cate;
	});
}

async function getArticle() {
	if (isLoading.value) {
		uni.stopPullDownRefresh();
		return;
	}
	isLoading.value = true;
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiArticle.articleIndex, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			isLoading.value = false;
			uni.stopPullDownRefresh();
			loadingStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			articleList.value = [...articleList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		})
		.catch(() => {
			uni.stopPullDownRefresh();
			isLoading.value = false;
			loadingStatus.value = 'loadmore';
		});
}

// 轮播图
function swiperClick(index: number) {
	const item = banner.value[index];
	uni.$api.shop.advNavigate(item.jump_type, item.jump_link, item.id);
}

function cateTap(item: object) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.articleList,
		query: {
			id: item.id,
			title: item.title,
		},
	});
}
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 20rpx;
}

.tap {
	padding: 20rpx;
	background-color: #fff;
	.scroll-tap {
		white-space: nowrap;
		.scroll-item {
			display: inline-block;
			margin-right: 20rpx;
			border-radius: 35rpx;
			background-color: $dz-bg-color;
		}
		.scroll-item:last-child {
			margin-right: 0rpx;
		}
		.text {
			display: flex;
			align-items: center;
			justify-content: center;
			// width: 160rpx;
			height: 70rpx;
			font-size: 28rpx;
			padding: 0 20rpx;
		}
	}
}
</style>

<template>
	<view>
		<dz-navbar title="我的反馈"></dz-navbar>
		<view class="item" v-for="item in list" :key="item.id">
			<text class="time">{{ api.timeFormat(item.created_time) }}</text>
			<view class="content" @tap.stop="goTap(item.id)">
				<view>
					<text class="title">{{ item.content }}</text>
					<text class="introduce" v-if="item.synopsis">{{ item.synopsis }}</text>
					<view class="dz-m-t-20 detail">
						<text>查看详情</text>
					</view>
				</view>
				<dz-icon name="right" color="#909399" size="30"></dz-icon>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="160" :src="empty"></dz-empty>
		<view v-if="loadingStatus == 'loading'">
			<dz-loadmore :status="loadingStatus" :line="loadingStatus == 'loading' ? false : true" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref } from 'vue';
import assets from '@/core/config/assetsConfig';

const loading = ref<Boolean>(false);
const loadingStatus = ref<String>('loading');
const list = ref([]);
const page = ref<number>(1);
const empty = assets.empty;

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: '公告' });
	getList();
});

onPullDownRefresh(() => {
	page.value = 1;
	list.value = [];
	getList();
});

onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getList();
});

async function getList() {
	if (loading.value) {
		uni.stopPullDownRefresh();
		return;
	}
	loading.value = true;
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiBase.opinionIndex, {
			params: {
				page: page.value,
				page_size: 10,
			},
		})
		.then((res) => {
			loading.value = false;
			uni.stopPullDownRefresh();
			loadingStatus.value = res.data.length === 10 ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
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

function goTap(id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.feedbackDetail,
		query: {
			id,
		},
	});
}
</script>

<style lang="scss" scoped>
.item {
	display: flex;
	flex-direction: column;
	align-items: center;
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
	display: flex;
	justify-content: space-between;
	width: 710rpx;
	padding: 24rpx;
	background: #fff;
	border-radius: 20rpx;
}

.title {
	font-size: 32rpx;
}

.detail {
	color: $dz-tips-color;
}
</style>

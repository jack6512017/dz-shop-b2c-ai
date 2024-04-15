<template>
	<view class="activity">
		<dz-navbar :title="language.discount.activitiesList"></dz-navbar>
		<view class="content" v-if="discountData.length > 0">
			<view class="activity-item" v-for="(item, index) in discountData" :key="index" @tap="toDiscount(item)">
				<dz-image :src="item.cover" width="100%" height="320"></dz-image>
				<view class="msg">
					<view v-if="parseInt(item.state) === 1 && item.end_time_left && item.end_time_left > 0">
						<text>{{ language.discount.noTime }}</text>
						<dz-count-down
							:timestamp="parseInt(item.end_time_left)"
							separator="zd"
							:bg-color="theme.dzBaseColor"
							font-size="24"
							separator-size="22"
							:separator-color="theme.dzTipsColor"
							:color="theme.dzBaseFontColor"
							style="margin-left: 10rpx"
							@timeEnd="timeOut(index)"
						></dz-count-down>
					</view>
					<text v-if="parseInt(item.state) != 1 && item.end_time_left && item.end_time_left < 0">{{ language.discount.timeOut }}</text>
					<view class="title">{{ item.discount_name }}</view>
					<view class="tip">{{ item.description }}</view>
				</view>
			</view>
		</view>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const data = reactive({
	discountData: [],
	loadingStatus: 'loading',
	type: '',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.type = options.type;
	uni.setNavigationBarTitle({ title: uni.$api.language.discount.activitiesList });
	getDiscountIndex();
});

onPullDownRefresh(() => {
	data.discountData = [];
	getDiscountIndex();
});
async function getDiscountIndex() {
	data.loadingStatus = 'loading';
	const path = data.type == 'data' ? 'discountIndex' : 'discountSoon';
	await uni.$api.http
		.get(uni.$api.apiShop[path])
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.discountData = res.data.discount;
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}
function toDiscount(item: any) {
	const params = {
		id: item.id,
		cover: item.cover,
		name: item.discount_name,
		type: data.type,
	};
	uni.$api.router.push({
		route: uni.$api.routesConfig.discountList,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
}
// 倒计时
function timeOut(index: number) {
	data.discountData[index].state = 3;
	data.discountData[index].end_time_left = -1;
}

const { discountData, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.content {
	padding: 20rpx;
	background-color: #fff;
}
.activity-item {
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
	width: 100%;
	margin-bottom: 40rpx;
	image {
		width: 100%;
		height: 320rpx;
		background-position: center center;
		background-size: cover;
		background-repeat: no-repeat;
	}
	text {
		color: $dz-tips-color;
	}
	.msg {
		padding: 10rpx 20rpx;
	}
	.title {
		font-size: 36rpx;
		font-weight: bold;
		color: $dz-main-color;
		margin-bottom: 6rpx;
	}
	.tip {
		font-size: 24rpx;
		color: $dz-tips-color;
	}
}
</style>

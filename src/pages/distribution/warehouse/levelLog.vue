<template>
	<view>
		<dz-navbar title="升级日志" :borderBottom="false"></dz-navbar>
		<view class="content">
			<view class="item" v-for="(item, index) in list" :key="index">
				<view class="num">
					<text class="title">变更等级:</text>
					<text v-if="item.newWarehouseLevel" :style="{ color: theme.dzBaseColor }">{{ item.newWarehouseLevel.name }}</text>
					<text v-else :style="{ color: theme.dzBaseColor }">无</text>
				</view>
				<dz-line></dz-line>
				<view class="cell">
					<text>初始等级:</text>
					<text v-if="item.oldWarehouseLevel" :style="{ color: '#333' }">{{ item.oldWarehouseLevel.name }}</text>
					<text v-else :style="{ color: '#333' }">无</text>
				</view>
				<view class="cell">
					<text>原因:</text>
					<text>{{ levelChange(item.group) }}</text>
				</view>
				<view class="cell">
					<text>时间:</text>
					<text>{{ api.timeFormat(item.created_time) }}</text>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无售后订单" :src="emptyOrder" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const data = reactive({
	list: [],
	page: 1,
	loadingStatus: 'loading',
});

const userStore = useUserStore();
const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '升级日志',
	});
	getList();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.list = [];
	data.loadingStatus = 'loading';
	getList();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getList();
});

function levelChange(val) {
	if (val == 'order_pay') {
		return '自购升级';
	} else if (val == 'purchase_order_pay') {
		return '销货升级';
	} else {
		return '人工调整';
	}
}

function getList() {
	data.loadingStatus = 'loading';
	let params = {};
	params.page = data.page;
	params.page_size = uni.$api.appConfig.pageSize;
	uni.$api.http
		.get(uni.$api.apiShop.distributionWarehouseLevelLog, {
			params,
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.list = [...data.list, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		})
		.catch((err) => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

const { list, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.content {
	padding: 20rpx 20rpx 1rpx;
	.item {
		padding: 20rpx;
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		.num {
			display: flex;
			margin-bottom: 10rpx;
			.title {
				color: #999;
				margin-right: 6rpx;
			}
			.color1 {
				color: #d8d8d8;
			}
			.color2 {
				color: rgb(255, 196, 63);
			}
		}
		.price {
			text-align: right;
			text {
				color: red;
			}
		}
		.cell {
			line-height: 46rpx;
			text {
				color: #999;
				margin-right: 6rpx;
			}
		}
	}
}
</style>

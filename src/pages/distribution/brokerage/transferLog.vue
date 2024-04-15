<template>
	<view>
		<dz-navbar :title="type ? '货款转赠记录' : shopSetting.commission_front_name + '转赠记录'" :border-bottom="false"></dz-navbar>
		<dz-tabs
			:list="tabList"
			:current="current"
			:scrollable="false"
			line-height="4"
			:activeStyle="{
				color: theme.dzBaseColor,
				fontSize: '30rpx',
				fontWeight: '700',
			}"
			:lineColor="theme.dzBaseColor"
			@change="tabChange"
			style="position: fixed; width: 100%; z-index: 2"
		></dz-tabs>
		<view class="container">
			<view class="record">
				<view class="item" v-for="(item, index) in list" :key="index">
					<view class="left">
						<dz-image :src="item.receiver.head_portrait || missingFace" width="80" height="80" borderRadius="40"></dz-image>
						<view class="user-info">
							<view class="title">ID: {{ item.receiver.id }}</view>
							<view class="title">用户名: {{ item.receiver.nickname }}</view>
							<view class="title">手机号: {{ item.receiver.mobile }}</view>
							<view class="time">申请时间: {{ api.timeFormat(item.created_time) }}</view>
						</view>
					</view>
					<view style="display: flex; flex-direction: column">
						<dz-tag v-if="item.state == 0" text="申请中" bgColor="#fdc561" mode="dark" shape="circle"></dz-tag>
						<dz-tag v-if="item.state == 1" text="已同意" bgColor="#42e38d" mode="dark" shape="circle"></dz-tag>
						<dz-tag v-if="item.state == -1" text="已拒绝" bgColor="#f00" mode="dark" shape="circle"></dz-tag>
						<view class="right">{{ item.cash }}</view>
					</view>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无转赠记录" :src="emptyOrder" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script setup lang="ts">
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const missingFace = uni.$api.assetsConfig.missingFace;
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const tabList = [
	{
		value: '1',
		name: '已通过',
	},
	{
		value: '0',
		name: '审核中',
	},
	{
		value: '-1',
		name: '已拒绝',
	},
];

const data = reactive({
	type: '',
	list: [],
	page: 1,
	loadingStatus: 'loading',
	current: 0,
	state: 1,
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: options.type ? '货款转赠记录' : shopSetting.value.commission_front_name + '转赠记录',
	});
	if (options.type) {
		data.type = options.type;
	}
	getGivingRecord();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.list = [];
	getGivingRecord();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getGivingRecord();
});

function getGivingRecord() {
	data.loadingStatus = 'loading';
	uni.$api.http
		.get(uni.$api.apiMember.brokerageTransferIndex, {
			params: {
				page: data.page,
				state: data.state,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.list = [...data.list, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}

function tabChange({ index }) {
	data.current = index;
	data.state = tabList[index].value;
	data.page = 1;
	data.list = [];
	getGivingRecord();
}

const { type, current, list, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.container {
	margin-top: 108rpx;
	font-size: 28rpx;
	padding-bottom: 1rpx;
	.record {
		.item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin: 24rpx;
			padding: 20rpx;
			background: #fff;
			border-radius: 20rpx;
			.left {
				display: flex;
			}

			.user-info {
				margin-left: 20rpx;

				.title {
				}

				.time {
					margin-top: 15rpx;
					font-size: 26rpx;
					color: $dz-tips-color;
				}
			}
		}
	}
}

.right {
	margin-top: 20rpx;
	font-size: 32rpx;
	font-weight: 700;
	text-align: right;
}
</style>

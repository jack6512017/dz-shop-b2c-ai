<template>
	<view>
		<dz-navbar :title="'提现记录'" :borderBottom="false"></dz-navbar>
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
			@change="tabChange"
			style="position: fixed; width: 100%; z-index: 2"
		></dz-tabs>
		<view class="cell-content">
			<view class="cell-card" v-for="(item, index) in list" :key="index">
				<view>
					<view>流水号：{{ item.withdraw_no }}</view>
					<view class="bank">
						<view class="dzicon-iconfont dzicon-commission" v-if="item.account_type == 0"></view>
						<view class="dzicon-iconfont dzicon-card_fill" v-if="item.account_type == 1"></view>
						<view class="dzicon-iconfont dzicon-wechat" v-if="item.account_type == 2"></view>
						<view class="dzicon-iconfont dzicon-alip" v-if="item.account_type == 3"></view>
						<view>
							提现到
							<text v-if="item.account_type === '4'">{{ shopSetting.balance_front_name }}</text>
							<text v-else>{{ accountTypeFilter(item.account_type) }} - {{ item.mobile }}</text>
						</view>
					</view>
					<view v-if="item.memo" class="dz-m-t-6">拒绝原因：{{ item.memo }}</view>
					<view class="dz-m-t-15 dz-color-9">申请时间：{{ api.timeFormat(item.created_time) }}</view>
					<view v-if="parseInt(item.payment_date) != 0" class="dz-m-t-15 dz-color-9">到账日期：{{ api.timeFormat(item.payment_date) }}</view>
				</view>
				<view>
					<view class="dz-m-b-20">
						<dz-tag v-if="item.state == 0" text="申请中" bgColor="#fdc561" mode="dark" shape="circle"></dz-tag>
						<dz-tag v-if="item.state == 1" text="已同意" bgColor="#42e38d" mode="dark" shape="circle"></dz-tag>
						<dz-tag v-if="item.state == -1" text="已拒绝" bgColor="#f00" mode="dark" shape="circle"></dz-tag>
					</view>
					<view class="dz-font-36 dz-font-weight dz-text-right" :style="{ color: theme.dzBaseColor }">{{ item.cash }}</view>
				</view>
			</view>
		</view>
		<dz-empty :text="'暂无提现记录'" v-if="loadingStatus == 'noData'" :marginTop="80" :src="emptyOrder" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const emptyOrder = uni.$api.assetsConfig.emptyOrder;

const theme = computed(() => {
	return userStore.getTheme;
});
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

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
	current: 0,
	page: 1,
	state: 1,
	list: [],
	loadingStatus: 'loading',
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '提现记录',
	});
	getWithdrawList();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.list = [];
	getWithdrawList();
});
onReachBottom(() => {
	if (data.loadingStatus === 'nomore') return;
	data.page++;
	getWithdrawList();
});

function accountTypeFilter(val) {
	const accountTypeArr = ['余额', '银联卡', '微信', '支付宝'];
	return accountTypeArr[parseInt(val)];
}

async function getWithdrawList() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiMember.brokerageWithdrawIndex, {
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
	getWithdrawList();
}

const { current, list, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.cell-content {
	margin-top: 108rpx;
	padding-bottom: 1rpx;
}

.cell-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 24rpx;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
}

.bank {
	display: flex;
	align-items: center;
	margin-top: 6rpx;
	.dzicon-iconfont {
		margin-right: 10rpx;
		font-size: 36rpx;
	}
	.dzicon-alip {
		color: #00a0e9;
	}
	.dzicon-card_fill,
	.dzicon-commission {
		color: #fdc561;
	}
	.dzicon-wechat {
		color: $dz-type-success;
	}
}
</style>

<template>
	<view>
		<view>
			<dz-navbar title="明细" :borderBottom="false"></dz-navbar>
			<dz-tabs
				:list="tabList"
				:current="current"
				:scrollable="false"
				lineHeight="4"
				:activeStyle="{
					color: theme.dzBaseColor,
					fontSize: '32rpx',
					fontWeight: 'bold',
				}"
				:lineColor="theme.dzBaseColor"
				style="position: fixed; width: 100%; z-index: 2"
				@change="tabChange"
			></dz-tabs>
			<view class="cell-content">
				<view class="cell-card" v-for="(item, index) in tabList[current].list" :key="index">
					<view>
						<view class="dz-line-2">{{ item.remark ? item.remark : filtersType(item.credit_group) }}</view>
						<view class="dz-m-t-15 time">{{ api.timeFormat(item.created_time) }}</view>
					</view>
					<view
						class="dz-flex-s dz-font-36 dz-font-weight"
						:style="{
							color: item.num < 0 ? theme.dzBaseColor : theme.dzBaseColor,
						}"
						>{{ numFilter(item.num) }}</view
					>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="160" text="暂无账单记录" :src="emptyOrder" iconSize="360"></dz-empty>
			<view class="dz-ios-m-bline"
				><dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="0" :margin-bottom="20"></dz-loadmore
			></view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const tabList = ref([
	{
		page: 1,
		state: undefined,
		name: '全部',
		list: [],
	},
	{
		page: 1,
		state: 1,
		name: '充值',
		list: [],
	},
	{
		page: 1,
		state: 2,
		name: '消费',
		list: [],
	},
]);
const current = ref<number>(0);
const state = ref<number>(1);
const loadingStatus = ref<string>('loading');
const emptyOrder = uni.$api.assetsConfig.emptyOrder;

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '明细',
	});
	getCreditsLogList();
});

onPullDownRefresh(() => {
	tabList.value[current.value].page = 1;
	tabList.value[current.value].list = [];
	getCreditsLogList();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	tabList.value[current.value].page++;
	getCreditsLogList();
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

function tabChange(e) {
	current.value = e.index;
	if (tabList.value[e.index].list.length) return;
	state.value = tabList.value[e.index].state;
	getCreditsLogList();
}

function getCreditsLogList() {
	loadingStatus.value = 'loading';
	let params = {};
	if (state.value != 0) {
		params.num_type = state.value;
	}
	uni.$api.http
		.get(uni.$api.apiMember.moneyLogIndex, {
			params: {
				...params,
				page: tabList.value[current.value].page,
				page_size: 15,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == 15 ? 'loadmore' : 'nomore';
			tabList.value[current.value].list = [...tabList.value[current.value].list, ...res.data];
			if (tabList.value[current.value].page == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}

function numFilter(val) {
	return val >= 0 ? `+${val.toString()}` : val;
}

function filtersType(type: string): string {
	let tag = '';
	switch (type) {
		case 'shop_order_pay':
			tag = '订单' + shopSetting.value.balance_front_name || '余额' + '支付';
			break;
		case 'shop_order_refund':
			tag = '订单退款';
			break;
		case 'manager':
			tag = '手动操作';
			break;
	}
	return tag;
}
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
	border-radius: 20rpx;
	background-color: #fff;
	.time {
		color: $dz-tips-color;
	}
}
</style>

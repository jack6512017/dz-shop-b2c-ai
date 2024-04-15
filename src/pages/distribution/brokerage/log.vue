<template>
	<view>
		<!-- 佣金明细 -->
		<dz-navbar
			:title="type ? '收益日志' : api.formatString(language.distribution.theCommissionSubsidiary, shopSetting.commission_front_name)"
			:border-bottom="false"
		></dz-navbar>
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
					<view class="dz-line-2">{{ item.remark ? item.remark : recodeType(item.group) }}</view>
					<view class="dz-m-t-15 dz-color-9">{{ api.timeFormat(item.created_time) }}</view>
				</view>
				<view class="dz-flex-s dz-font-36 dz-font-weight" :style="{ color: item.num < 0 ? theme.dzBaseColor : theme.dzBaseColor }">{{
					`${parseFloat(item.num) > 0 ? '+' : ''}${item.num}`
				}}</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" :text="language.distribution.noBillRecordYet" :src="emptyOrder" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const language = uni.$api.language;
const userStore = useUserStore();
const emptyOrder = uni.$api.assetsConfig.emptyOrder;

const theme = computed(() => {
	return userStore.getTheme;
});
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const tabList = [
	{ name: '全部', num_type: '' },
	{ name: '进账', num_type: '1' },
	{ name: '出账', num_type: '2' },
];

const data = reactive({
	type: '',
	current: 0,
	page: 1,
	numType: '',
	list: [],
	loadingStatus: 'loading',
	isLoading: false,
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: options.type ? '收益日志' : uni.$api.formatString(language.distribution.theCommissionSubsidiary, shopSetting.value.commission_front_name),
	});
	if (options.type) {
		data.type = options.type;
	}
	getPromoterRecordIndex();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.list = [];
	getPromoterRecordIndex();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getPromoterRecordIndex();
});

function recodeType(val: string): string {
	if (val == 'manual_update') {
		return '管理员手动调整';
	} else if (val == 'close_withdraw') {
		return '提现失败返回';
	} else if (val == 'withdraw') {
		return '佣金提现';
	} else if (val == 'shop_order_pay') {
		return '订单佣金支付';
	} else if (val == 'shop_order_refund') {
		return '订单退款';
	} else if (val == 'fission_brokerage') {
		return '裂变分销';
	} else if (val == 'store_brokerage') {
		return '店铺分销佣金';
	} else if (val == 'regional_brokerage') {
		return '区域代理佣金';
	} else if (val == 'transfer_brokerage') {
		return '佣金转赠';
	} else {
		return '无';
	}
}

function tabChange({ index }) {
	if (data.isLoading) return;
	data.current = index;
	data.numType = tabList[index].num_type;
	data.page = 1;
	data.list = [];
	getPromoterRecordIndex();
}

async function getPromoterRecordIndex() {
	data.loadingStatus = 'loading';
	data.isLoading = true;
	await uni.$api.http
		.get(uni.$api.apiMember.brokerageLogIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
				num_type: data.numType,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.list = [...data.list, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		})
		.finally(() => {
			data.isLoading = false;
		});
	uni.stopPullDownRefresh();
}

const { type, current, list, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
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
</style>

<template>
	<view class="content">
		<dz-navbar :title="language.joinBuyGroup.joinBuyGroupTitle" :borderBottom="false"></dz-navbar>
		<dz-tabs
			:list="list"
			:current="current"
			:scrollable="false"
			line-height="4"
			:activeStyle="{
				color: theme.dzBaseColor,
			}"
			:itemStyle="{ height: '44px', padding: '0 10rpx' }"
			:lineColor="theme.dzBaseColor"
			style="position: fixed; width: 100%; z-index: 3"
			@change="tabChange"
		></dz-tabs>
		<view class="order-box">
			<view class="item" v-for="(item, index) in joinBuyMemberList" :key="index">
				<view class="top">
					<view class="logo">
						<view
							v-if="
								(parseInt(item.joinBuy.state) === 0 || parseInt(item.joinBuy.state) === 1) &&
								item.joinBuy.end_time_left &&
								item.joinBuy.end_time_left > 0
							"
						>
							{{ language.joinBuyGroup.joinBuyLeftTime }}
							<dz-count-down
								class="dz-m-l-10"
								:timestamp="item.joinBuy.end_time_left"
								:show-days="false"
								:color="theme.dzBaseColor"
								:separator-color="theme.dzBaseColor"
								:bg-color="'transparent'"
								@timeEnd="joinBuyTimeout(item.joinBuy.id)"
							></dz-count-down>
						</view>
						<view v-if="parseInt(item.joinBuy.state) > 1"
							>{{ api.timeFormat(item.joinBuy.created_time) }} {{ language.joinBuyGroup.joinBuyStart }}</view
						>
					</view>
					<view
						class="status"
						:style="{ color: theme.dzBaseColor }"
						v-if="parseInt(item.joinBuy.state) === 1 && item.joinBuy.end_time_left && item.joinBuy.end_time_left > 0"
					>
						{{ api.formatString(language.joinBuyGroup.joinBuyShareTip, parseInt(item.joinBuy.total_number) - parseInt(item.joinBuy.number)) }}
					</view>
					<view
						class="status"
						:style="{ color: theme.dzBaseColor }"
						v-if="parseInt(item.joinBuy.state) === 1 && item.joinBuy.end_time_left && item.joinBuy.end_time_left < 0"
					>
						{{ language.joinBuyGroup.joinBuyOutOfTime }}
					</view>
					<view class="status" :style="{ color: theme.dzBaseColor }" v-if="parseInt(item.joinBuy.state) === 0">{{
						language.joinBuyGroup.joinBuyPay
					}}</view>
					<view class="status" :style="{ color: theme.dzBaseColor }" v-if="parseInt(item.joinBuy.state) === 2">{{
						language.joinBuyGroup.joinBuySuccess
					}}</view>
					<view class="status" :style="{ color: theme.dzBaseColor }" v-if="parseInt(item.joinBuy.state) === 3">{{
						language.joinBuyGroup.joinBuyFail
					}}</view>
				</view>
				<view class="order-content" @tap.stop="joinBuyProduct(item.joinBuy.product_id)">
					<view class="order-item">
						<view class="left">
							<view class="image"><dz-image :src="item.joinBuy.product_picture" borderRadius="10" width="170" height="170"></dz-image></view>
							<view class="title">
								<view class="name">{{ item.joinBuy.product_name }}</view>
								<view class="sku">{{ item.joinBuy.sku_name || language.application.defaultSkuName }}</view>
							</view>
						</view>
						<view class="right">
							<view class="price-box">
								<view>{{ language.application.moneySymbol }}{{ item.joinBuy.product_money || '0.00' }}</view>
								<view>x 1</view>
							</view>
						</view>
					</view>
				</view>
				<view class="tip">
					<text>{{ language.application.moneySymbol }}{{ item.joinBuy.product_money || '0.00' }}</text>
					{{ language.joinBuyGroup.joinBuyOrderTip }}
				</view>
				<view class="bottom">
					<view></view>
					<view class="btn" v-if="parseInt(item.order_status) === 0">
						<dz-button
							:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '120rpx' }"
							hover-class="none"
							size="mini"
							:border="false"
							shape="circle"
							@click="pay(item)"
						>
							{{ language.joinBuyGroup.joinBuyButtonPay }}
						</dz-button>
					</view>
					<view class="btn" v-if="parseInt(item.joinBuy.state) === 1 && item.joinBuy.end_time_left && item.joinBuy.end_time_left > 0">
						<dz-button
							:border="false"
							:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '120rpx', marginLeft: '20rpx' }"
							hover-class="none"
							size="mini"
							shape="circle"
							@click="toJoinBuyDetail(item.joinBuy.id)"
						>
							{{ language.joinBuyGroup.joinBuyButtonShare }}
						</dz-button>
					</view>
					<view class="btn" v-if="parseInt(item.joinBuy.state) === 1 && item.joinBuy.end_time_left && item.joinBuy.end_time_left < 0">
						<dz-button
							:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '120rpx' }"
							hover-class="none"
							size="mini"
							shape="circle"
							:border="false"
							@click="toJoinBuyDetail(item.joinBuy.id)"
						>
							{{ language.joinBuyGroup.joinBuyButtonDetail }}
						</dz-button>
					</view>
					<view class="btn" v-if="parseInt(item.joinBuy.state) > 1">
						<dz-button
							:border="false"
							:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '120rpx' }"
							hover-class="none"
							size="mini"
							shape="circle"
							@click="toJoinBuyDetail(item.joinBuy.id)"
						>
							{{ language.joinBuyGroup.joinBuyButtonDetail }}
						</dz-button>
						<dz-button
							v-if="parseInt(item.joinBuy.state) === 2"
							:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '120rpx', marginLeft: '20rpx' }"
							hover-class="none"
							size="mini"
							shape="circle"
							:border="false"
							@click="toOrderDetail(item)"
						>
							{{ language.joinBuyGroup.joinBuyButtonOrderDetail }}
						</dz-button>
					</view>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" :text="language.joinBuyGroup.joinBuyEmpty" :src="emptyOrder" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="0" magrin-bottom="20"></dz-loadmore>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const list = [
	{
		status: '',
		name: language.joinBuyGroup.joinBuyStatusAll,
	},
	{
		status: 0,
		name: '待付款',
	},
	{
		status: 1,
		name: language.joinBuyGroup.joinBuyStatusProgress,
	},
	{
		status: 2,
		name: language.joinBuyGroup.joinBuyStatusSuccess,
	},
	{
		status: 3,
		name: language.joinBuyGroup.joinBuyStatusFail,
	},
];
const data = reactive({
	current: 0,
	page: 1,
	joinBuyMemberList: [],
	loadingStatus: 'loading',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.joinBuyGroup.joinBuyGroupTitle,
	});
	getJoinBuyMemberIndex();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.joinBuyMemberList = [];
	getJoinBuyMemberIndex();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getJoinBuyMemberIndex();
});

function getJoinBuyMemberIndex() {
	data.loadingStatus = 'loading';
	uni.$api.http
		.get(uni.$api.apiShop.joinBuyIndex, {
			params: {
				page: data.page,
				state: list[data.current].status,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.joinBuyMemberList = [...data.joinBuyMemberList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}
function tabChange({ index }) {
	data.page = 1;
	data.joinBuyMemberList = [];
	data.current = index;
	getJoinBuyMemberIndex();
}

//跳转商品
function joinBuyProduct(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.joinBuyProduct,
		query: {
			id: id,
		},
	});
}
//拼团超时
function joinBuyTimeout(id) {
	for (let i = 0; i < data.joinBuyMemberList.length; i++) {
		if (data.joinBuyMemberList[i].id === id) {
			data.joinBuyMemberList[i].state = 3;
			break;
		}
	}
}
// 拼团详情
function toJoinBuyDetail(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.joinBuyDetail,
		query: {
			id,
		},
	});
}
//订单详情
function toOrderDetail(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderDetail,
		query: {
			id: item.id,
		},
	});
}

// 订单支付
function pay(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.pay,
		query: {
			id: item.id,
		},
	});
}

const { current, joinBuyMemberList, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.content {
	height: 100%;
}

.order-box {
	position: flex;
	height: auto;
	margin-top: 88rpx;
	padding: 20rpx 20rpx 1rpx 20rpx;
	box-sizing: border-box;
	.item {
		padding: 20rpx;
		background-color: #fff;
		border-radius: 15rpx;
		overflow: hidden;
		margin-bottom: 20rpx;

		.top {
			display: flex;
			justify-content: space-between;
			align-items: center;
			.logo {
				display: flex;
				align-items: center;
				font-size: 28rpx;
				color: $dz-main-color;
			}
			.status {
			}
		}
	}
}
.order-content {
	margin-top: 30rpx;
	.order-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		.left {
			display: flex;
			.image {
				flex-shrink: 0;
				width: 170rpx;
				height: 170rpx;
				border-radius: 10rpx;
			}
			.title {
				margin-left: 20rpx;
				.name {
					line-height: 40rpx;
					color: $dz-main-color;
					font-size: 28rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}
				.sku {
					margin-top: 10rpx;
					font-size: 24rpx;
					color: $dz-tips-color;
				}
			}
		}

		.right {
			.price-box {
				margin-left: 10rpx;
				text-align: right;
				font-size: 24rpx;
				color: $dz-tips-color;
			}
		}
	}
}
.tip {
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
	width: 100;
	padding-top: 20rpx;
	font-size: 24rpx;
	color: $dz-tips-color;
	text {
		margin-left: 10rpx;
		font-size: 32rpx;
		color: $dz-main-color;
	}
}
.bottom {
	display: flex;
	justify-content: space-between;
	margin-top: 20rpx;
}
</style>

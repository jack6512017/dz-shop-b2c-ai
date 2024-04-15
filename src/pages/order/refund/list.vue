<template>
	<view>
		<dz-navbar title="售后主页" :borderBottom="false"></dz-navbar>
		<view style="position: fixed; width: 100%; z-index: 2">
			<dz-tabs
				:list="tabsList"
				:current="current"
				:scrollable="false"
				lineHeight="4"
				:activeStyle="{ color: theme.dzBaseColor }"
				:lineColor="theme.dzBaseColor"
				@change="tabChange"
			></dz-tabs>
		</view>
		<view class="content">
			<block v-for="(item, index) in list" :key="index">
				<view class="product">
					<view class="order-tip">
						<view class="dz-flex">
							<view class="order">订单号:</view>
							<view class="number">{{ item.order_product_sn }}</view>
						</view>
						<view class="tip" :class="[item.refund_status == 5 ? 'success' : '']">{{ statusFilter(item.refund_status) }}</view>
					</view>
					<view class="item">
						<view class="image"><dz-image :src="item.product_picture" :borderRadius="15" :width="180" :height="180"></dz-image></view>
						<view class="right">
							<view>
								<view class="title">{{ item.product_name }}</view>
								<view class="tip" :style="{ color: theme.dzBaseColor }">数量: {{ item.num }}</view>
							</view>
							<view class="refund-btn">
								<view></view>
								<view>
									<dz-button
										type="info"
										size="mini"
										shape="circle"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '120rpx',
											marginLeft: '20rpx',
											background: '#fff',
											border: '1rpx solid rgba(0, 0, 0, 0.12)',
										}"
										@click="toRefund('refundDetail', item)"
									>
										查看详情
									</dz-button>
									<dz-button
										v-if="(item.order_status == 2 || item.order_status == 3 || item.order_status == 4) && item.refund_status == 2"
										type="info"
										size="mini"
										shape="circle"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '120rpx',
											marginLeft: '20rpx',
											background: '#fff',
											border: '1rpx solid rgba(0, 0, 0, 0.12)',
										}"
										@click="toRefund('refundShipping', item)"
									>
										填写物流
									</dz-button>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无售后订单" :src="emptyOrder" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="0" margin-bottom="20"></dz-loadmore>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const emptyOrder = uni.$api.assetsConfig.emptyOrder;

const tabsList = [
	{
		name: '全部',
	},
	{
		name: '处理中',
	},
	{
		name: '已完成',
	},
];
const data = reactive({
	current: 0,
	list: [],
	page: 1,
	refundStatus: '1,2,3,4,5,6,7,8,-1,-2,-3',
	loadingStatus: 'loading',
});

const refundStatusFilter = uni.$api.dataConfig.refundStatus;

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '售后主页',
	});
	getList();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getList();
});

function getList() {
	data.loadingStatus = 'loading';
	uni.$api.http
		.get(uni.$api.apiMember.orderProductIndex, {
			params: {
				refund_status: data.refundStatus,
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.list = [...data.list, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
}

function statusFilter(val) {
	let state;
	refundStatusFilter.forEach((item) => {
		if (item.key === parseInt(val)) {
			state = item.value;
		}
	});
	return state;
}

function tabChange({ index }: any) {
	data.current = index;
	if (index == 0) {
		data.refundStatus = '1,2,3,4,5,6,7,8,-1,-2,-3';
	} else if (index == 1) {
		data.refundStatus = '1,2,3,4,6,7,8';
	} else {
		data.refundStatus = '5,-1,-2,-3';
	}
	data.page = 1;
	data.list = [];
	getList();
}

function toRefund(url: string, item: any) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			id: item.id,
			order_id: item.order_id,
			order_status: item.order_status,
		},
	});
}

const { list, current, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.content {
	margin-top: 88rpx;
	padding: 20rpx 20rpx 1rpx;
}

.product {
	padding: 30rpx 20rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;

	.order-tip {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 24rpx;

		.order {
			color: $dz-main-color;
		}

		.number {
			margin-left: 10rpx;
			color: $dz-tips-color;
		}

		.tip {
		}

		.success {
			color: $dz-main-color;
		}
	}

	.item {
		display: flex;
		margin-top: 20rpx;

		.image {
			flex-shrink: 0;
			width: 180rpx;
			height: 180rpx;
			border-radius: 10rpx;
			background-color: $dz-bg-color;
		}

		.right {
			flex: 1;
			margin-left: 20rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.title {
				font-size: 28rpx;
				color: $dz-main-color;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}

			.tip {
				margin-top: 10rpx;
				font-size: 24rpx;
				color: $dz-tips-color;
			}

			.refund-btn {
				width: 100%;
				display: flex;
				justify-content: space-between;
			}
		}
	}
}
</style>

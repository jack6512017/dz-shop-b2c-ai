<template>
	<view>
		<dz-navbar title="库存记录"></dz-navbar>
		<view class="tag-box">
			<dz-row gutter="16">
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">今日进货箱数</view>
						<view>{{ statisticsInfo.today_purchase_stock }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">本月进货箱数</view>
						<view>{{ statisticsInfo.this_month_purchase_stock }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">上月进货箱数</view>
						<view>{{ statisticsInfo.last_month_purchase_stock }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">累计进货箱数</view>
						<view>{{ statisticsInfo.total_purchase_stock }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">今日销货箱数</view>
						<view>{{ statisticsInfo.today_sale_stock }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">本月销货箱数</view>
						<view>{{ statisticsInfo.this_month_sale_stock }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">上月销货箱数</view>
						<view>{{ statisticsInfo.last_month_sale_stock }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">累计销货箱数</view>
						<view>{{ statisticsInfo.total_sale_stock }}</view>
					</view>
				</dz-col>
			</dz-row>
		</view>
		<view class="order-box">
			<view class="order-item" v-for="(item, index) in statisticsList" :key="index">
				<view class="num">
					<text>{{ filtersGroup(item.group) }}单号:</text>
					{{ item.order_sn }}
				</view>
				<dz-line></dz-line>
				<view class="product-content">
					<view class="left">
						<view class="image">
							<dz-image
								:src="item.sku.picture ? item.sku.picture : item.product.picture"
								:borderRadius="13"
								:width="130"
								:height="130"
							></dz-image>
						</view>
						<view class="product-msg">
							<view class="name">{{ item.product_name }}</view>
							<view class="sku">{{ item.sku_name || '默认款' }}</view>
						</view>
					</view>
					<view class="right">
						<view class="price-box">
							<view>{{ filtersGroup(item.group) }}价</view>
							<view class="dz-color-3">￥{{ price(item) }}</view>
							<view class="dz-color-3">x{{ parseInt(item.num) < 0 ? Math.abs(parseInt(item.num)) : parseInt(item.num) }}</view>
						</view>
					</view>
				</view>
				<view v-if="item.group != 'manual' && item.group != 'pickup'">
					<view class="cell">
						<text>{{ filtersGroupText(item.group) }}商ID:</text>
						{{ item.reMember ? item.reMember.id : '无' }}
					</view>
					<view class="cell">
						<text>{{ filtersGroupText(item.group) }}商昵称:</text>
						{{ item.reMember ? item.reMember.nickname : '平台' }}
					</view>
				</view>
				<view class="cell">
					<text>{{ filtersGroup(item.group) }}时间:</text>
					{{ api.timeFormat(item.created_time) }}
				</view>
				<view class="cell dz-m-b-10">
					<text>支付时间:</text>
					{{ api.timeFormat(parseInt(item.created_time) + api.random(300, 600)) }}
				</view>
				<dz-line></dz-line>
				<view class="price dz-m-t-10 sum">
					{{ filtersGroup(item.group) }}总价：
					<text :style="{ color: theme.dzBaseColor }">{{ item.product_total_price }}</text>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无库存记录" :src="empty" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
			</view>
		</view>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const empty = uni.$api.assetsConfig.empty;
const userStore = useUserStore();
const data = reactive({
	statisticsInfo: {
		last_month_purchase_stock: 0,
		last_month_sale_stock: 0,
		this_month_purchase_stock: 0,
		this_month_sale_stock: 0,
		today_purchase_stock: 0,
		today_sale_stock: 0,
		total_purchase_stock: 69,
		total_sale_stock: 12,
	},
	statisticsList: [],
	page: 1,
	pageLoadingShow: false,
	loadingStatus: 'loading',
	pageLoadingStatus: 'loading',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '库存记录',
	});
	statistics();
	stockLog();
});

onPullDownRefresh(() => {
	data.pageLoadingShow = true;
	data.page = 1;
	data.statisticsInfo = {};
	data.statisticsList = [];
	statistics();
	stockLog();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	stockLog();
});

function filtersGroup(val) {
	switch (val) {
		case 'purchase':
			return '进货';
			break;
		case 'sale':
			return '销货';
			break;
		case 'pickup':
			return '提货';
			break;
		case 'refund':
			return '退货';
			break;
		case 'manual':
			return '手提';
			break;
	}
}

function filtersGroupText(val) {
	switch (val) {
		case 'purchase':
			return '供应';
			break;
		case 'sale':
			return '进货';
			break;
		case 'pickup':
			return '提货';
			break;
		case 'refund':
			return '退货';
			break;
		case 'manual':
			return '手提';
			break;
	}
}

function pageLoadingClick() {
	statistics();
}

function price(val) {
	let sum;
	sum = (parseFloat(val.product_total_price) / parseInt(val.num)).toFixed(2);
	return sum > 0 ? sum : Math.abs(sum);
}

function statistics() {
	uni.$api.http
		.get(uni.$api.apiShop.distributionWarehouseStockLogStatistics)
		.then((res) => {
			data.statisticsInfo = res.data;
			data.pageLoadingShow = false;
		})
		.catch((err) => {
			data.pageLoadingStatus = 'error';
		});
}

function stockLog() {
	uni.$api.http
		.get(uni.$api.apiShop.distributionWarehouseStockLogIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.statisticsList = [...data.statisticsList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}

const { statisticsInfo, statisticsList, loadingStatus, pageLoadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.tag-box {
	padding: 14rpx 14rpx 0;
}
.tag-item {
	padding: 10rpx;
	margin-bottom: 16rpx;
	background: #fff;
	border-radius: 15rpx;
	text-align: center;
	font-size: 24rpx;
	.title {
		color: #999;
	}
}
.order-box {
	padding: 0 20rpx 1rpx;
	.order-item {
		padding: 20rpx;
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		.num {
			margin-bottom: 10rpx;
			text {
				margin-right: 6rpx;
				color: #999;
			}
		}
		.price {
			text-align: right;
			color: #999;
			text {
				color: #333;
				margin-left: 6rpx;
			}
		}
		.cell {
			line-height: 46rpx;
			text {
				margin-right: 6rpx;
				color: #999;
			}
		}
		.sum {
			color: #333;
			text {
				margin-left: 6rpx;
			}
		}
	}
}

.product-content {
	display: flex;
	justify-content: space-between;
	margin: 15rpx 0;
	.left {
		display: flex;
		.image {
			flex-shrink: 0;
			width: 130rpx;
			height: 130rpx;
			border-radius: 10rpx;
			background-color: $dz-bg-color;
		}
		.product-msg {
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
				color: #999;
			}
		}
	}

	.right {
		flex-shrink: 0;
		.price-box {
			margin-left: 10rpx;
			text-align: right;
			font-size: 24rpx;
			color: $dz-tips-color;
		}
	}
}
</style>

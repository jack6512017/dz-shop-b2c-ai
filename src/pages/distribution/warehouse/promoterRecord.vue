<template>
	<view>
		<dz-navbar title="货款收益"></dz-navbar>
		<view class="tag-box">
			<dz-row gutter="16">
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">当日收益</view>
						<view>{{ estimateStat[0] ? estimateStat[0].warehouse.toFixed(2) : '0.00' }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">本月收益</view>
						<view>{{ estimateStat[1] ? estimateStat[1].warehouse.toFixed(2) : '0.00' }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">累计收益</view>
						<view>{{ userInfo.promoter ? userInfo.promoter.accumulate_brokerage : '0.00' }}</view>
					</view>
				</dz-col>
				<dz-col span="3">
					<view class="tag-item">
						<view class="title">待结算收益</view>
						<view>{{ userInfo.promoter ? userInfo.promoter.frozen_brokerage : '0.00' }}</view>
					</view>
				</dz-col>
			</dz-row>
		</view>
		<view class="order-box">
			<view class="order-item" v-for="(item, index) in promoterRecordTeamList" :key="index">
				<view class="num">
					<view>
						<text class="title">类型:</text>
						{{ parseInt(item.commission_type) == 1 ? '平台收益' : '货款结余' }}
					</view>
					<text :class="[colorFilters(parseInt(item.state))]">{{ filterStateText(parseInt(item.state)) }}</text>
				</view>
				<dz-line></dz-line>
				<view class="cell">
					<text>进货商ID:</text>
					{{ item.member.id }}
				</view>
				<view class="cell">
					<text>进货商昵称:</text>
					{{ item.member.nickname }}
				</view>
				<view class="cell">
					<text>销售商品:</text>
					{{ item.remark }}
				</view>
				<view class="cell">
					<text>销售数量:</text>
					{{ item.num }}
				</view>
				<view class="cell">
					<text>订单号:</text>
					{{ item.map_sn }}
				</view>
				<view class="cell dz-m-b-10">
					<text>销售时间:</text>
					{{ api.timeFormat(item.created_time) }}
				</view>
				<dz-line></dz-line>
				<view class="price dz-m-t-10">
					收益金额：
					<text :style="{ color: theme.dzBaseColor }">{{ item.commission_money }}</text>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" text="暂无收益数据" margin-top="80" :src="emptyData" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="20" :margin-buttom="20"></dz-loadmore>
		</view>
		<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const emptyData = uni.$api.assetsConfig.emptyData;
const data = reactive({
	page: 1,
	loadingStatus: 'loading',
	promoterRecordTeamList: [],
	loadingShow: true,
	pageLoadingStatus: 'loading',
	estimateStat: [],
});

const theme = computed(() => {
	return userStore.getTheme;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '货款收益',
	});
	getIncomeList();
	getEstimateStat();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.promoterRecordTeamList = [];
	data.loadingShow = true;
	getEstimateStat();
	getIncomeList();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getIncomeList();
});

function filterStateText(val) {
	switch (parseInt(val)) {
		case 1:
			return '已完成';
		case 0:
			return '待结算';
		case -1:
			return '已关闭';
	}
}

function colorFilters(val) {
	switch (parseInt(val)) {
		case 1:
			return 'color1';
		case 0:
			return 'color2';
		case -1:
			return 'color3';
	}
}

function loadingClick() {
	getIncomeList();
}

function getEstimateStat() {
	uni.$api.http.get(uni.$api.apiShop.distributionMemberEstimateStat).then((res) => {
		data.estimateStat = res.data.estimateStat;
	});
}

async function getIncomeList() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.distributionPromoterRecordIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
				record_type: 'warehouse',
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.loadingShow = false;
			data.promoterRecordTeamList = [...data.promoterRecordTeamList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}

const { estimateStat, promoterRecordTeamList, loadingStatus, loadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.tag-box {
	padding: 14rpx;
}

.tag-item {
	padding: 10rpx;
	background: #fff;
	border-radius: 15rpx;
	text-align: center;
	font-size: 24rpx;

	.title {
		color: #999;
	}
}

.color1 {
	color: #41cc8b;
}

.color2 {
	color: rgb(255, 196, 63);
}

.color3 {
	color: #fd5548;
}

.order-box {
	padding: 0 20rpx 1rpx;

	.order-item {
		padding: 20rpx;
		background: #fff;
		border-radius: 20rpx;
		margin-bottom: 20rpx;

		.num {
			display: flex;
			justify-content: space-between;
			margin-bottom: 10rpx;

			.title {
				color: #999;
				margin-right: 6rpx;
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

.order-content {
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
				color: #999;
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
</style>

<template>
	<view class="limited">
		<dz-navbar :is-fixed="true" :title="language.limited.limitedTitle"></dz-navbar>
		<view class="content">
			<dz-image v-if="advList[0]" :src="advList[0].cover" width="100%" height="320"></dz-image>
			<view v-if="list.length" class="product-box">
				<view class="item" v-for="(item, index) in list" :key="index" @tap="banicBuying(item)">
					<view class="image"><dz-image :src="item.product.picture" width="200" height="200" borderRadius="15"></dz-image></view>
					<view class="right">
						<view>
							<view class="title">{{ item.product.name }}</view>
							<view class="tip">{{ item.product.sketch }}</view>
							<view style="margin-top: 30rpx">
								<text
									class="limited-tip"
									v-if="parseInt(item.state) == 1 && item.end_time_left && item.end_time_left > 0"
									:class="{ on: parseInt(item.state) !== 1 }"
								>
									{{ language.product.marketingFinish }}
								</text>
								<dz-count-down
									v-if="parseInt(item.state) === 1"
									:timestamp="item.end_time_left"
									separator="zd"
									:bg-color="theme.dzBaseColor"
									font-size="24"
									separator-size="22"
									:separator-color="theme.dzTipsColor"
									:color="theme.dzBaseFontColor"
									style="margin-left: 10rpx"
									@timeEnd="timeOut(index)"
								></dz-count-down>
								<text v-if="parseInt(item.state) == 0 && item.start_time_left && item.start_time_left > 0">{{
									language.product.marketingStart
								}}</text>
								<text v-if="parseInt(item.state) == 3 && item.end_time_left && item.end_time_left < 0">{{
									language.product.marketingFinished
								}}</text>
								<dz-count-down
									v-if="parseInt(item.state) === 0"
									:timestamp="item.start_time_left"
									separator="10"
									:bg-color="parseInt(item.state) !== 1 ? theme.dzTipsColor : theme.dzBaseColor"
									font-size="24"
									separator-size="22"
									:separator-color="theme.dzTipsColor"
									:color="theme.dzBaseFontColor"
									style="margin-left: 10rpx"
									@timeEnd="StartTimeOut(index)"
								></dz-count-down>
							</view>
						</view>
						<view class="price-box">
							<view class="price">
								<view class="m-price" :style="{ color: theme.dzBaseColor }">
									<text>{{ language.application.moneySymbol }}</text>
									<text class="price-num">{{ item.min_price }}</text>
								</view>
								<view class="price-tip">{{ language.application.moneySymbol }}{{ item.product.price }}</view>
							</view>
							<view>
								<dz-button
									:custom-style="{
										background:
											parseInt(item.state) == 3 && item.end_time_left && item.end_time_left < 0
												? theme.dzBaseDisabled
												: theme.dzBaseColor,
										color: theme.dzBaseFontColor,
									}"
									hover-class="none"
									:disabled="parseInt(item.state) == 3 && item.end_time_left && item.end_time_left < 0"
									size="mini"
									shape="circle"
									:border="false"
									@click="banicBuying(item)"
								>
									{{ language.limited.immediatelyRob }}
								</dz-button>
							</view>
						</view>
					</view>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="list.length ? 0 : 20" magrin-bottom="20"></dz-loadmore>
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
const empty = uni.$api.assetsConfig.empty;
const data = reactive({
	page: 1,
	list: [],
	advList: [],
	loadingStatus: 'loading',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.limited.limitedTitle,
	});
	getLimitedBuy();
	getAdvList();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.list = [];
	data.advList = [];
	getLimitedBuy();
	getAdvList();
});

onReachBottom(() => {
	if (data.loadingStatus === 'nomore') return;
	data.page++;
	getLimitedBuy();
});

async function getLimitedBuy() {
	if (data.loading) {
		return;
	}
	data.loading = true;
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.limitedSoon, {
			page: data.page,
			page_size: uni.$api.appConfig.pageSize,
		})
		.then((res) => {
			data.loading = false;
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.list = [...data.list, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loading = false;
			data.loadingStatus = 'loadmore';
		});
}

async function getAdvList() {
	await uni.$api.http
		.get(uni.$api.apiBase.advIndex, {
			params: {
				location: 'limited_buy_top',
			},
		})
		.then(async (res) => {
			data.advList = res.data.limited_buy_top;
		});
	uni.stopPullDownRefresh();
}

// 立即抢购
function banicBuying(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.limitedProduct,
		query: {
			id: item.product_id,
		},
	});
}

// 倒计时
function timeOut(index) {
	data.list[index].state = 1;
	data.list[index].end_time_left = -1;
}

function StartTimeOut(index) {
	data.list[index].state = 1;
	data.list[index].start_time_left = -1;
}

const { advList, list, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.banner {
	image {
		width: 100%;
		height: 320rpx;
		display: block;
	}
}
.product-box {
	padding: 20rpx 20rpx 0 20rpx;
	.item {
		display: flex;
		padding: 20rpx;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
		background-color: #ffffff;
		.image {
			flex-shrink: 0;
			width: 200rpx;
			height: 200rpx;
			border-radius: 15rpx;
		}
		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			margin-left: 15rpx;
			.title {
				width: 460rpx;
				font-size: 28rpx;
				color: $dz-main-color;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			.tip {
				width: 460rpx;
				font-size: 24rpx;
				color: $dz-tips-color;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			.limited-tip {
				font-size: 24rpx;
				color: $dz-tips-color;
			}
			.on {
				color: $dz-main-color;
			}
			.price-box {
				display: flex;
				justify-content: space-between;
				.price {
					display: flex;
					align-items: center;
					font-size: 24rpx;
					color: $dz-tips-color;
					.m-price {
						.price-num {
							font-size: 36rpx;
							font-weight: bold;
						}
					}
					.price-tip {
						margin-left: 10rpx;
						text-decoration: line-through;
					}
				}
			}
		}
	}
}
</style>

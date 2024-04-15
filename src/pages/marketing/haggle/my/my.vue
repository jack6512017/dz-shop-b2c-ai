<template>
	<view>
		<dz-navbar :title="language.haggle.myBargain"></dz-navbar>
		<view v-if="haggleLaunch.length" class="product-box">
			<block v-for="(item, index) in haggleLaunch" :key="index">
				<view class="item" v-if="item.sku" @click="haggleTap(item.product_id, 'haggleProduct')">
					<view class="image"><dz-image :src="item.sku.baseProduct.picture" borderRadius="15" width="200" height="200"></dz-image></view>
					<view class="right">
						<view>
							<view class="title">{{ item.sku.baseProduct.name }}</view>
							<view>
								<!-- 活动即将开始/还剩-->
								<text
									class="group-tip"
									v-if="parseInt(item.state) != 3 && parseInt(item.state) != 2 && item.end_time_left && item.end_time_left > 0"
									:class="{ on: parseInt(item.state) != 1 }"
								>
									{{ parseInt(item.state) != 1 ? language.limited.theEventIsAboutToBegin : language.limited.surplus }}
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
								<view class="group-tip" v-if="item.order && parseInt(item.order.order_status) == 0 && item.order.close_left_time > 0">
									剩余支付时间
									<dz-count-down
										:timestamp="item.order.close_left_time"
										:show-days="false"
										:color="theme.dzBaseFontColor"
										fontSize="24"
										separator-size="22"
										separator="zd"
										:separator-color="theme.dzTipsColor"
										style="margin-left: 10rpx"
										:bg-color="theme.dzBaseColor"
										@timeEnd="timePayOut(index)"
									></dz-count-down>
								</view>
								<view v-if="item.order && item.order.close_left_time < 0" class="group-tip">支付已关闭</view>
							</view>
						</view>
						<view class="price-box">
							<view class="price">
								<view class="m-price" v-if="parseInt(item.state) === 1">{{
									api.formatString(language.haggle.haggleSuccess, item.surplus_money)
								}}</view>
								<view v-if="parseInt(item.state) === 3">{{ language.haggle.haggleerror }}</view>
								<view v-if="parseInt(item.state) === 2">{{ language.haggle.haggleStatusSuccess }}</view>
							</view>
							<view>
								<!-- 去支付 -->
								<dz-button
									:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, marginRight: '20rpx' }"
									hover-class="none"
									size="mini"
									:border="false"
									shape="circle"
									@click="toPay(item)"
									v-if="
										(item.end_time_left > 0 && item.order_id == 0 && parseInt(item.state) === 2) ||
										(item.order && item.order.close_left_time > 0 && item.order.pay_status == 0)
									"
								>
									去支付
								</dz-button>
								<dz-button
									:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
									hover-class="none"
									size="mini"
									shape="circle"
									:border="false"
									@click="haggleTap(item.id, 'haggleDetails')"
									v-if="parseInt(item.state) === 1"
								>
									{{ language.haggle.haggles }}
								</dz-button>
								<!-- 再砍一个 -->
								<dz-button
									:plain="true"
									:border="false"
									size="mini"
									shape="circle"
									hoverClass="none"
									:customStyle="{ background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
									@click="haggleTap(item.product_id, 'haggleProduct')"
									v-else-if="parseInt(item.state) === 2"
								>
									再砍一个
								</dz-button>
								<dz-button
									type="default"
									:plain="true"
									hoverClass="none"
									:border="false"
									size="mini"
									shape="circle"
									:customStyle="{ background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
									@click="haggleTap(item.id, 'haggleProduct')"
									v-else
								>
									再砍一个
								</dz-button>
							</view>
						</view>
					</view>
				</view>
			</block>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :text="language.haggle.haggleEmpty" :src="empty" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="!haggleLaunch.length ? 20 : 0" magrin-bottom="20"></dz-loadmore>
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
	loadingStatus: 'loading',
	page: 1,
	haggleLaunch: [],
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.haggle.myBargain,
	});
	getBargainLaunch();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.haggleLaunch = [];
	getBargainLaunch();
});

onReachBottom(() => {
	if (data.loadingStatus === 'nomore') return;
	data.page++;
	getBargainLaunch();
});

async function getBargainLaunch() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.haggleLaunchIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.haggleLaunch = [...data.haggleLaunch, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

// 去支付
async function toPay(item) {
	let orderId = item.order_id;
	if (item.order_id == 0 && item.state == 2) {
		uni.showLoading({
			title: '正在生成订单...',
		});
		await uni.$api.http
			.get(uni.$api.apiShop.haggleLaunchBuildOrder, {
				params: { id: item.id },
			})
			.then((res) => {
				orderId = res.data.order_id;
				data.page = 1;
				data.haggleLaunch.length = 0;
				getBargainLaunch();
			})
			.finally(() => {
				uni.hideLoading();
			});
	}

	if (orderId > 0) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.orderDetail,
			query: {
				id: orderId,
			},
		});
	}
}

function haggleTap(id, url) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			id,
		},
	});
}

function timeOut(index) {
	data.haggleLaunch[index].state = 3;
	data.haggleLaunch[index].end_time_left = -1;
}

function timePayOut(index) {
	data.haggleLaunch[index].order.close_left_time = -1;
}

const { haggleLaunch, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.product-box {
	padding: 20rpx 20rpx 0;
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
				width: 450rpx;
				font-size: 28rpx;
				color: $dz-main-color;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
			.group-tip {
				margin-top: 6rpx;
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
						color: $dz-type-error;
					}
				}
			}
		}
	}
}
</style>

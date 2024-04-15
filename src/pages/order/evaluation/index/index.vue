<template>
	<view>
		<dz-navbar :title="'评价'" :borderBottom="false"></dz-navbar>
		<dz-tabs
			:list="list"
			:current="current"
			:scrollable="false"
			line-height="4"
			:activeStyle="{
				color: theme.dzBaseColor,
			}"
			:lineColor="theme.dzBaseColor"
			style="position: fixed; width: 100%; z-index: 3"
			@change="tabChange"
		></dz-tabs>
		<view class="content">
			<block v-for="(item, index) in productList" :key="index">
				<view class="order-item">
					<view class="product" @tap="toOrderDetail(item)">
						<view class="image"><dz-image :src="item.product_picture" :borderRadius="15" :width="170" :height="170"></dz-image></view>
						<view class="right">
							<view class="right-l">
								<view class="title">{{ item.product_name }}</view>
								<view class="price-box">
									<view>￥{{ item.product_money }}</view>
									<view>x{{ item.num }}</view>
								</view>
							</view>
							<view class="right-r">{{ item.sku_name || '默认款' }}</view>
						</view>
					</view>
					<view class="footer">
						<view class="time">发货时间: {{ api.timeFormat(item.created_time) }}</view>
						<view>
							<dz-button
								v-if="current == 0 && parseInt(item.evaluate_status) == 0"
								:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '120rpx', marginLeft: '20rpx' }"
								:border="false"
								hover-class="none"
								size="mini"
								shape="circle"
								@click="toEvaluation(item)"
							>
								去评论
							</dz-button>
							<dz-button
								v-if="current == 1 && parseInt(item.evaluate_status) == 1"
								:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '120rpx', marginLeft: '20rpx' }"
								hover-class="none"
								:border="false"
								size="mini"
								shape="circle"
								@click="toEvaluation(item, 'add')"
							>
								写追论
							</dz-button>
							<dz-button
								v-if="current == 1 && item.evaluate_status == 2"
								type="info"
								:border="false"
								:disabled="true"
								size="mini"
								shape="circle"
								:custom-style="{ width: '120rpx', marginLeft: '20rpx', background: '#fff', border: '1rpx solid rgba(0, 0, 0, 0.12)' }"
							>
								已评论
							</dz-button>
							<dz-button
								v-if="current == 1 || parseInt(item.evaluate_status) == 2"
								type="info"
								size="mini"
								hoverClass="none"
								:border="false"
								shape="circle"
								:custom-style="{ width: '120rpx', marginLeft: '20rpx', background: '#fff', border: '1rpx solid rgba(0, 0, 0, 0.12)' }"
								@click="toEvaluationDetail(item)"
							>
								查看评论
							</dz-button>
						</view>
					</view>
				</view>
			</block>
			<dz-empty v-if="evaluationLoadingStatus == 'noData'" margin-top="80" :text="evaluationTip" :src="emptyOrder" iconSize="360"></dz-empty>
			<view v-if="evaluationLoadingStatus == 'loading'" class="dz-ios-m-bline"><dz-loadmore margin-top="0" :status="loadingStatus"></dz-loadmore></view>
		</view>
		<block v-if="guessYouLikeList.length">
			<dz-title class="dz-m-t-20" title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
			<dz-product-list class="dz-m-20" :list="guessYouLikeList"></dz-product-list>
		</block>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view v-if="isStatus && loadingStatus == 'loading'" class="dz-p-b-20 dz-ios-m-bline"
			><dz-loadmore :status="loadingStatus" margin-top="20"></dz-loadmore
		></view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onUnload, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const empty = uni.$api.assetsConfig.empty;
const list = [{ name: '待评价' }, { name: '已评价' }];
const data = reactive({
	current: 0,
	orderId: '',
	productList: [],
	loadingStatus: 'loading',
	page: 1,
	guessYouLikeList: [],
	evaluationTip: '暂无待评论商品',
	pageEvaluation: 1,
	evaluationLoadingStatus: 'loading',
	isStatus: false,
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '评价',
	});
	uni.$on('evaluationStatus', (data) => {
		data.page = 0;
		data.productList = [];
		getOrderProductIndex();
	});
	data.orderId = options.id;
	getOrderProductIndex();
});

onUnload(() => {
	uni.$off(['evaluationStatus']);
});

onReachBottom(() => {
	if (data.productList.length < uni.$api.appConfig.pageSize && data.orderId) {
		if (data.loadingStatus == 'nomore') return;
		data.isStatus = true;
		data.loadingStatus = 'loading';
		data.page++;
		getGuessYouLikeList();
	} else {
		if (data.evaluationLoadingStatus == 'nomore') return;
		data.pageEvaluation++;
		getOrderProductIndex();
	}
});

function tabChange({ index }) {
	data.current = index;
	data.pageEvaluation = 1;
	data.productList.length = 0;
	data.evaluationTip = parseInt(data.current) == 0 ? '暂无待评论商品' : '暂无已评论商品';
	getOrderProductIndex();
	if (data.orderId) {
		data.page = 1;
		data.isStatus = false;
		data.guessYouLikeList = [];
	}
}

async function getOrderProductIndex() {
	data.evaluationLoadingStatus = 'loading';
	let params = {};
	params.order_status = '3,4';
	params.evaluate_status = data.current;
	if (params.evaluate_status == 1) {
		params.evaluate_status = params.evaluate_status + ',2';
	}
	if (data.orderId) {
		params.order_id = data.orderId;
	}
	uni.$api.http
		.get(uni.$api.apiMember.orderProductIndex, {
			params: {
				page: data.pageEvaluation,
				...params,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.evaluationLoadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.productList = [...data.productList, ...res.data];
			if (data.pageEvaluation == 1 && res.data.length == 0) {
				data.evaluationLoadingStatus = 'noData';
				if (data.orderId) {
					data.loadingStatus = 'loading';
					getGuessYouLikeList();
				}
			} else {
				if (data.orderId) {
					data.loadingStatus = 'loading';
					getGuessYouLikeList();
				}
			}
		})
		.catch(() => {
			data.evaluationLoadingStatus = 'loadmore';
		});
}

async function getGuessYouLikeList() {
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.guessYouLikeList = [...data.guessYouLikeList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
}

// 订单详情
function toOrderDetail(item) {
	if (data.current == 0) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.orderDetail,
			query: {
				id: item.order_id,
			},
		});
	} else {
		toEvaluationDetail(item);
	}
}

// 去评论
function toEvaluation(item, type) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.evaluation,
		query: {
			data: JSON.stringify(item),
			type: type,
		},
	});
}

// 查看评论
function toEvaluationDetail(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.evaluationDetail,
		query: {
			order_id: item.order_id,
			product_id: item.id,
		},
	});
}

function toProductDetail(item) {
	if (parseInt(item.product_status) == 0) return uni.$api.toast(uni.$api.language.user.productTheShelves);
	let url;
	if (item.marketing_type && item.marketing_type != 0) {
		if (item.marketing_type == 'group_buy') {
			url = 'groupProduct';
		} else {
			url = `${item.marketing_type}Product`;
		}
	} else {
		url = 'product';
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			id: item.id,
		},
	});
}

const { current, productList, evaluationLoadingStatus, guessYouLikeList, loadingStatus, isStatus, evaluationTip } = { ...toRefs(data) };
</script>

<style lang="scss">
.content {
	margin-top: 88rpx;
	padding: 20rpx 20rpx 1rpx;
}
.order-item {
	margin-bottom: 20rpx;
	padding: 20rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
}
.product {
	display: flex;

	.image {
		flex-shrink: 0;
		width: 170rpx;
		height: 170rpx;
		border-radius: 10rpx;
	}
	.right {
		margin-left: 20rpx;
		flex: 1;
		.right-l {
			display: flex;
			justify-content: space-between;
			.title {
				line-height: 40rpx;
				color: $dz-main-color;
				font-size: 28rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
			.price-box {
				margin-left: 10rpx;
				text-align: right;
				font-size: 24rpx;
				color: $dz-tips-color;
			}
		}
		.right-r {
			margin-top: 10rpx;
			font-size: 24rpx;
			color: $dz-content-color;
		}
	}
}
.footer {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 30rpx;
	.time {
		font-size: 24rpx;
		color: $dz-tips-color;
	}
}
</style>

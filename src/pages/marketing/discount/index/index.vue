<template>
	<view class="discount-index">
		<dz-navbar :title="language.discount.discountTitle"></dz-navbar>
		<view class="content">
			<dz-swiper v-if="advList.length > 0" :list="advList" name="cover" height="320" border-radius="0" @click="swiperClick"></dz-swiper>
			<view class="banner-box">
				<dz-tabs
					:list="bannerTab"
					:scrollable="false"
					:current="bannerCurrent"
					font-size="28"
					height="80"
					lineHeight="4"
					:activeStyle="{
						color: theme.dzBaseColor,
						fontSize: '32rpx',
						fontWeight: 'bold',
					}"
					:lineColor="theme.dzBaseColor"
					radius="20"
					@change="bannerChange"
				></dz-tabs>
				<view class="banner-card" v-show="bannerCurrent == 0">
					<view class="banner-item">
						<view
							class="item"
							v-for="(item, index) in discountData.discount && discountData.discount.slice(0, 3)"
							:key="index"
							@tap="toDiscount(item, 'data')"
						>
							<view class="text">
								<view class="title">{{ item.discount_name }}</view>
								<view class="tip">{{ item.description }}</view>
							</view>
							<view style="margin-bottom: 15rpx" v-if="parseInt(item.state) === 1 && item.end_time_left && item.end_time_left > 0">
								<text>{{ language.discount.noTime }}</text>
								<dz-count-down
									v-if="parseInt(item.state) === 1 && item.end_time_left && item.end_time_left > 0"
									:timestamp="parseInt(item.end_time_left)"
									separator="zd"
									:bg-color="theme.dzBaseColor"
									font-size="24"
									separator-size="22"
									:separator-color="theme.dzTipsColor"
									:color="theme.dzBaseFontColor"
									style="margin-left: 10rpx"
									@timeEnd="timeOut(index)"
								></dz-count-down>
							</view>
							<view style="margin-bottom: 15rpx" v-if="parseInt(item.state) != 1 && item.end_time_left && item.end_time_left < 0">
								<!-- 本场活动已结束 -->
								<text>{{ language.discount.timeOut }}</text>
							</view>
							<dz-image :src="item.cover" width="100%" height="320" borderRadius="20"></dz-image>
						</view>
						<view class="tip-box" v-if="parseInt(discountData.total) > 3">
							<view class="text">
								共有
								<text :style="{ margin: '0 5rpx', color: theme.dzBaseColor, fontSize: '30rpx', fontWeight: 'bold' }">{{
									discountData.total
								}}</text>

								场活动， {{ language.discount.moreActivities }}
							</view>
							<view class="btn">
								<dz-button
									:custom-style="{ background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
									hover-class="none"
									size="medium"
									shape="circle"
									@click="toActivity('data')"
								>
									{{ language.discount.more }}
								</dz-button>
							</view>
						</view>
					</view>
				</view>
				<view class="banner-card" v-show="bannerCurrent == 1">
					<view class="banner-item">
						<view
							class="item"
							v-for="(item, index) in discountSoon.discount && discountSoon.discount.slice(0, 3)"
							:key="index"
							@tap="toDiscount(item, 'soon')"
						>
							<view class="text">
								<view class="title">{{ item.discount_name }}</view>
								<view class="tip">{{ item.description }}</view>
							</view>
							<view style="margin-bottom: 15rpx" v-if="parseInt(item.state) === 0">
								<text>活动即将开始</text>
								<dz-count-down
									v-if="parseInt(item.state) === 0"
									:timestamp="parseInt(item.start_time_left)"
									separator="zd"
									:bg-color="theme.dzBaseColor"
									font-size="24"
									separator-size="22"
									:separator-color="theme.dzTipsColor"
									:color="theme.dzBaseFontColor"
									style="margin-left: 10rpx"
									@timeEnd="marketingStart(index)"
								></dz-count-down>
							</view>
							<view style="margin-bottom: 15rpx" v-if="parseInt(item.state) === 1 && item.end_time_left && item.end_time_left > 0">
								<text>{{ language.discount.noTime }}</text>
								<dz-count-down
									v-if="parseInt(item.state) === 1 && item.end_time_left && item.end_time_left > 0"
									:timestamp="parseInt(item.end_time_left)"
									separator="zd"
									:bg-color="theme.dzBaseColor"
									font-size="24"
									separator-size="22"
									:separator-color="theme.dzTipsColor"
									:color="theme.dzBaseFontColor"
									style="margin-left: 10rpx"
									@timeEnd="timeOut(index)"
								></dz-count-down>
							</view>
							<view style="margin-bottom: 15rpx" v-if="parseInt(item.state) != 1 && item.end_time_left && item.end_time_left < 0">
								<!-- 本场活动已结束 -->
								<text>{{ language.discount.timeOut }}</text>
							</view>
							<dz-image :src="item.cover" width="100%" height="320" borderRadius="20"></dz-image>
						</view>
						<view class="tip-box" v-if="parseInt(discountSoon.total) > 3">
							<view class="text">
								共有
								<text :style="{ margin: '0 5rpx', color: theme.dzBaseColor, fontSize: '30rpx', fontWeight: 'bold' }">{{
									discountSoon.total
								}}</text>
								场活动， {{ language.discount.moreActivities }}
							</view>
							<view class="btn">
								<dz-button
									:custom-style="{ background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
									hover-class="none"
									size="medium"
									:border="false"
									type="info"
									shape="circle"
									@click="toActivity('soon')"
								>
									{{ language.discount.more }}
								</dz-button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="product-box">
			<dz-title
				v-if="discountProductList.length > 0"
				:title="bannerCurrent == 1 ? language.discount.trailerGoods : language.discount.activitiesOfGoods"
				mode="line"
				:barColor="theme.dzBaseDisabled"
			></dz-title>
			<view class="product-list">
				<view class="product-item" v-for="(item, index) in discountProductList" :key="index" @tap="toProduct(item)">
					<dz-image :src="item.product_picture" width="342" height="342"></dz-image>
					<view class="product-info">
						<view>
							<view class="price-text">{{ item.product_name }}</view>
							<dz-tag size="mini" style="margin: 0 0 10rpx 10rpx" :bg-color="theme.dzBaseColor" :color="theme.dzBaseFontColor" mode="dark">
								{{ (parseFloat(item.discount) / 10).toFixed(1) }}折
							</dz-tag>
						</view>

						<view style="display: flex; align-items: flex-end; padding-left: 10rpx">
							<view class="price-box" :style="{ color: theme.dzBaseColor }">
								<text class="price-l">{{ language.application.moneySymbol }}</text>
								<text class="price-r">{{ marketingPrice(item) }}</text>
							</view>
							<view v-if="item.product" class="price-tip"
								>{{ language.application.moneySymbol }}{{ item.product.price || item.product.market_price }}</view
							>
						</view>
					</view>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :text="noDataText" :src="empty" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
			</view>
			<!-- 页面加载 -->
			<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
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
const bannerTab = [{ name: uni.$api.language.discount.activitiesAreBooming }, { name: uni.$api.language.discount.trailer }];
const data = reactive({
	discountSoon: {},
	bannerCurrent: 0,
	advList: [],
	discountProductList: [],
	page: 1,
	loadingStatus: 'loading',
	discountData: {},
	discount: {},
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	noDataText: '',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: language.discount.discountTitle });
	data.pageLoadingStatus = 'loading';
	data.pageLoadingShow = true;
	await getDiscountProductIndex();
	await getAdvList();
	await getDiscountSoon();
	await getDiscountIndex();
	if (parseInt(data.discountData.total) === 0) {
		data.bannerCurrent = 1;
		discountProductSoon();
	}
	data.pageLoadingShow = false;
});

onPullDownRefresh(() => {
	loadingData();
});

onReachBottom(() => {
	if (data.loadingStatus === 'nomore') return;
	data.page++;
	if (data.bannerCurrent == 1) {
		discountProductSoon();
	} else {
		getDiscountProductIndex();
	}
});

function pageLoadingClick() {
	data.pageLoadingStatus = 'loading';
	loadingData();
}
function swiperClick(index) {
	let item = data.advList[index];
	uni.$api.advNavigate(item.jump_type, item.jump_link, item.id);
}
async function loadingData() {
	data.pageLoadingStatus = 'loading';
	data.pageLoadingShow = true;
	data.page = 1;
	data.discountProductList = [];
	data.discountSoon = {};
	data.discountData = {};
	data.discount = {};
	data.advList = [];
	data.bannerCurrent = 0;
	await getDiscountProductIndex();
	await getAdvList();
	await getDiscountSoon();
	await getDiscountIndex();
	if (parseInt(data.discountData.total) === 0) {
		data.bannerCurrent = 1;
		discountProductSoon();
	}
	data.pageLoadingShow = false;
}

async function getAdvList() {
	await uni.$api.http
		.get(uni.$api.apiBase.advIndex, {
			params: {
				location: 'discount_top',
			},
		})
		.then((res) => {
			data.advList = res.data.discount_top;
		});
}

// tap 改变
function bannerChange({ index }) {
	data.bannerCurrent = index;
	data.page = 1;
	data.discountProductList = [];
	if (data.bannerCurrent == 1) {
		getDiscountSoon();
		discountProductSoon();
	} else {
		getDiscountIndex();
		getDiscountProductIndex();
	}
}
// 开始活动列表
async function getDiscountIndex() {
	await uni.$api.http
		.get(uni.$api.apiShop.discountIndex)
		.then((res) => {
			data.discountData = res.data;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
	uni.stopPullDownRefresh();
}

// 预告活动列表
async function getDiscountSoon() {
	await uni.$api.http.get(uni.$api.apiShop.discountSoon).then((res) => {
		data.discountSoon = res.data;
	});
}

function toActivity(type: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.discountActivity,
		query: {
			type,
		},
	});
}
// 开始活动商品列表
async function getDiscountProductIndex() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.discountProductIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.discountProductList = [...data.discountProductList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
				data.noDataText = data.language.discount.noActivities;
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
}
// 预告活动商品列表
async function discountProductSoon() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.discountProductSoon, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.discountProductList = [...data.discountProductList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
				data.noDataText = language.discount.notrailerActivities;
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
}

function toDiscount(item: any, type: string) {
	const params = {
		id: item.id,
		cover: item.cover,
		name: item.discount_name,
		type,
	};
	uni.$api.router.push({
		route: uni.$api.routesConfig.discountList,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
}

function toProduct(item: any) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.discountProduct,
		query: {
			id: item.product_id,
			marketing_id: item.discount_id,
		},
	});
}

// 倒计时
function timeOut(index: number) {
	data.discountData.discount[index].end_time_left = -1;
	data.discountData.discount[index].state = 3;
}

//营销活动开始
function marketingStart(index: number) {
	data.discountSoon.discount[index].state = 1;
}

function marketingPrice(val: any) {
	//限时折扣
	const decimal = val.decimal_reservation_number;
	const discount = val.discount;
	let price = val.product.price;

	//限时折扣价格保留方式
	switch (parseInt(decimal)) {
		case -1:
			//保留角和分
			price = uni.$api.toFixed((price * discount) / 100, 2);
			break;
		case 0:
			//抹去角和分
			price = Math.floor((price * discount) / 100) * 10;
			price = (Math.round(price * 10) / 100).toFixed(0);
			break;
		case 1:
			//抹去分
			price = uni.$api.toFixed((price * discount) / 100, 1);
			break;
		default:
			price = uni.$api.toFixed((price * discount) / 100, 2);
	}
	return parseFloat(price).toFixed(2);
}

const { advList, bannerCurrent, discountData, discountSoon, discountProductList, loadingStatus, noDataText, pageLoadingShow, pageLoadingStatus } = {
	...toRefs(data),
};
</script>

<style lang="scss">
.discount-index {
	padding-bottom: 20rpx;
}
.banner-box {
	margin-top: 20rpx;
	padding: 0 20rpx;
}
.banner-item {
	margin: 20rpx 0;
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	border-radius: 20rpx;
	overflow: hidden;
	background-color: #ffffff;
	.item {
		padding: 20rpx;
		background-color: #ffffff;
		width: 100%;
		.text {
			padding-bottom: 10rpx;
			color: $dz-tips-color;
		}
		.title {
			color: $dz-main-color;
			font-size: 36rpx;
			font-weight: bold;
		}
		.name {
			color: $dz-tips-color;
			font-size: 24rpx;
		}
		image {
			width: 100%;
			height: 256rpx;
			border-radius: 10rpx;
			display: block;
		}
	}
}
.tip-box {
	padding: 0 20rpx;
	.text {
		color: $dz-tips-color;
		font-size: 24rpx;
	}
	.btn {
		display: flex;
		justify-content: center;
		padding: 20rpx 0 30rpx;
	}
}
.product-list {
	display: flex;
	justify-content: space-between;
	flex-wrap: wrap;
	margin: 0 24rpx;
	.product-item {
		width: 342rpx;
		height: 520rpx;
		background-color: #fff;
		box-sizing: border-box;
		margin: 9rpx 0;
		border-radius: 20rpx;
		overflow: hidden;
		.price-box {
			.price-l {
				font-size: 24rpx;
			}
			.price-r {
				font-size: 32rpx;
				font-weight: bold;
			}
		}
		.price-text {
			margin: 10rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.price-tip {
			font-size: 24rpx;
			color: $dz-tips-color;
			text-decoration: line-through;
			margin-left: 10rpx;
		}
	}
	.product-info {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 168rpx;
	}
}
</style>

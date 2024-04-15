<template>
	<view>
		<dz-navbar :title="title"></dz-navbar>
		<view class="content">
			<view class="banner" v-if="discountProduct.length"><dz-image :src="banner" width="100%" height="320"></dz-image></view>
			<view class="product-card" v-if="discountProduct.length">
				<view class="title">{{ language.discount.localCommodities }}</view>
				<view class="item" v-for="(item, index) in discountProduct" :key="index" @tap="puy(item)">
					<view v-if="item.product" class="image"><dz-image :src="item.product.picture" width="180" height="180" borderRadius="15"></dz-image></view>
					<view v-if="item.product" class="right">
						<view>
							<view class="name">{{ item.product.name }}</view>
							<view class="tip">{{ item.product.sketch }}</view>
						</view>
						<view class="price-box">
							<view class="price">
								<view class="price-content" :style="{ color: theme.dzBaseColor }">
									<text class="price-l">{{ language.application.moneySymbol }}</text>
									<text class="price-r">{{ marketingPrice(item) }}</text>
								</view>
								<view class="text">{{ language.application.moneySymbol }}{{ item.product.price || item.product.market_price }}</view>
							</view>
							<view class="btn">
								<dz-button
									:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '160rpx', height: '60rpx' }"
									hover-class="none"
									size="medium"
									shape="circle"
									:border="false"
									@click="puy(item)"
								>
									{{ language.discount.buy }}
								</dz-button>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
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
const data = reactive({
	banner: '',
	title: '',
	id: '',
	page: 1,
	loadingStatus: 'loading',
	discountProduct: [],
	type: '',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	const opt = JSON.parse(decodeURIComponent(options.data));
	data.banner = opt.cover;
	data.title = opt.name;
	data.id = opt.id;
	data.type = opt.type;
	uni.setNavigationBarTitle({ title: opt.name });
	getDiscountProductIndex();
});

onPullDownRefresh(() => {
	data.discountProduct = [];
	data.page = 1;
	getDiscountProductIndex();
});

onReachBottom(() => {
	if (data.loadingStatus === 'nomore') return;
	data.page++;
	getDiscountProductIndex();
});

async function getDiscountProductIndex() {
	data.loadingStatus = 'loading';
	const path = data.type == 'data' ? 'discountProductIndex' : 'discountProductSoon';
	uni.$api.http
		.get(uni.$api.apiShop[path], {
			params: {
				discount_id: data.id,
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.discountProduct = [...data.discountProduct, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
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

function puy(item: any) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.discountProduct,
		query: {
			id: item.product_id,
			marketing_id: item.discount_id,
		},
	});
}

const { title, discountProduct, banner, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.content {
	width: 100%;
	.banner {
		image {
			width: 100%;
		}
	}

	.product-card {
		position: relative;
		top: -60rpx;
		margin: 0 20rpx;
		padding: 20rpx 20rpx 1rpx;
		border-radius: 20rpx;
		background-color: #fff;
		.title {
			margin-bottom: 30rpx;
			font-size: 36rpx;
			font-weight: 700;
			color: $dz-main-color;
		}
		.item {
			display: flex;
			margin-bottom: 40rpx;
			.image {
				flex-shrink: 0;
				width: 180rpx;
				height: 180rpx;
				border-radius: 15rpx;
			}
			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				margin-left: 20rpx;
				.name {
					width: 451rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
					font-size: 28rpx;
					color: $dz-main-color;
				}
				.tip {
					width: 451rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					font-size: 24rpx;
					color: $dz-tips-color;
				}
				.price-box {
					display: flex;
					justify-content: space-between;
					align-items: flex-end;
					.price {
						display: flex;
						align-items: flex-end;
						.price-content {
							.price-l {
								font-size: 24rpx;
							}
							.price-r {
								font-size: 32rpx;
								font-weight: bold;
							}
						}
						.text {
							color: $dz-tips-color;
							font-size: 24rpx;
							font-weight: 400;
							margin-left: 10rpx;
							text-decoration: line-through;
						}
					}
				}
			}
		}
		.item:last-child {
			margin-bottom: 20rpx;
		}
	}
}
</style>

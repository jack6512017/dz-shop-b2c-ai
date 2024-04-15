<template>
	<view>
		<dz-navbar :is-fixed="true" :title="title"></dz-navbar>
		<dz-image :src="cover" width="100%" height="320"></dz-image>
		<view v-if="list.length" class="product-box">
			<view class="item" v-for="(item, index) in list" :key="index" @tap="itemTab(item.product.id)">
				<view class="image"><dz-image :src="item.product.picture" width="200" height="200" borderRadius="12"></dz-image></view>
				<view class="right">
					<view>
						<view class="title">{{ item.product.name }}</view>
						<view class="tip">{{ item.product.sketch }}</view>
					</view>
					<view class="dz-m-t-30 dz-color-9">{{ api.formatString(language.haggle.joinNumber, item.partake_number) }}</view>
					<view class="price-box">
						<view class="price">
							<view class="m-price" :style="{ color: theme.dzBaseColor }">
								<text>{{ language.application.moneySymbol }}</text>
								<text class="price-num">
									{{ api.toFixed(item.product.price - (1 - api.toFloat(item.min_rate / 100)) * item.product.price, 2) }}
								</text>
							</view>
						</view>
						<view>
							<dz-button
								:custom-style="{
									background: theme.dzBaseColor,
									color: theme.dzBaseFontColor,
								}"
								hover-class="none"
								size="mini"
								shape="circle"
								:border="false"
								@click="itemTab(item.product.id)"
							>
								去砍价
							</dz-button>
						</view>
					</view>
				</view>
			</view>
		</view>
		<dz-empty v-if="productLoadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore
				v-if="productLoadingStatus == 'loading'"
				:status="productLoadingStatus"
				:margin-top="!list.length ? 20 : 0"
				magrin-bottom="20"
			></dz-loadmore>
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
	title: '',
	cover: '',
	id: '',
	page: 0,
	list: [],
	loading: false,
	productLoadingStatus: 'loading',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	const opt = JSON.parse(decodeURIComponent(options.data));
	data.id = opt.id;
	data.cover = opt.cover;
	data.title = opt.name;
	uni.setNavigationBarTitle({
		title: data.title || language.haggleListTitle,
	});
	getList();
});

onPullDownRefresh(() => {
	data.page = 0;
	data.list = [];
	getList();
});

onReachBottom(() => {
	if (data.loading || data.productLoadingStatus === 'nomore') return;
	getList();
});

function itemTab(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.haggleProduct,
		query: {
			id,
		},
	});
}

async function getList() {
	if (data.loading) return;
	data.page++;
	data.productLoadingStatus = 'loading';
	data.loading = true;
	await uni.$api.http
		.get(uni.$api.apiShop.haggleProductIndex, {
			params: {
				id: data.id,
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.list = [...data.list, ...res.data];
			data.productLoadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			if (data.page === 1 && res.data.length === 0) {
				data.productLoadingStatus = 'nodata';
			}
			data.loading = false;
		})
		.catch(() => {
			data.loading = false;
		});
	uni.stopPullDownRefresh();
}

const { title, cover, list, productLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.product-box {
	padding: 20rpx;
	.item {
		display: flex;
		padding: 20rpx;
		border-radius: 15rpx;
		margin-bottom: 20rpx;
		background-color: #ffffff;
		.image {
			flex-shrink: 0;
			width: 200rpx;
			height: 200rpx;
			border-radius: 12rpx;
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
				}
			}
		}
	}
}
</style>

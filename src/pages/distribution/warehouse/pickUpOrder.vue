<template>
	<view>
		<dz-navbar title="提货"></dz-navbar>
		<view class="card-box">
			<view class="card-item">
				<view class="image"><dz-image :src="product.picture" :width="180" :height="180" :border-radius="15"></dz-image></view>
				<view class="right">
					<view class="porduct-name">{{ product.name }}</view>
					<view class="dz-color-9">库存量: {{ stock(product.sku) }}</view>
				</view>
			</view>
			<view class="suk-box">
				<view v-for="(item, index) in product.sku" :key="index" class="dz-m-b-30">
					<view>{{ item.name || '默认款' }}</view>
					<view class="suk-item">
						<view class="dz-color-9">库存：{{ item.warehouseProductStock ? item.warehouseProductStock.user_stock : 0 }}</view>
						<view>
							<dz-number-box
								v-model="item.num"
								:max="
									item.warehouseProductStock
										? parseInt(item.warehouseProductStock.user_stock) > parseInt(item.stock)
											? parseInt(item.stock)
											: parseInt(item.warehouseProductStock.user_stock)
										: 0
								"
								:min="0"
								:disabled="!item.warehouseProductStock || item.warehouseProductStock.user_stock == 0"
								:index="index"
								@change="getNum"
							></dz-number-box>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="footer">
			<view class="footer-bottom">
				<view>
					<view>合计：{{ num }}件</view>
					<!-- <view>进货总价：￥{{ price }}</view> -->
				</view>
				<view>
					<dz-button
						:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, fontSize: '26rpx' }"
						hover-class="none"
						size="medium"
						:border="false"
						shape="circle"
						@click="submit"
					>
						提货
					</dz-button>
				</view>
			</view>
		</view>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const data = reactive({
	value: 1,
	product: {},
	num: 0,
	price: 0,
	pageLoadingShow: true,
	pageLoadingStatus: 'loading',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '提货',
	});
	data.productId = options.id;
	pickUpPorduct();
});

onUnload(() => {
	uni.$off(['getAddressData']);
});

function pageLoadingClick() {
	pickUpPorduct();
}

function pickUpPorduct() {
	uni.$api.http
		.get(uni.$api.apiShop.distributionWarehouseProductView, {
			params: {
				id: data.productId,
			},
		})
		.then((res) => {
			data.product = res.data;
			data.product.sku.forEach((item) => {
				item.num = 0;
			});
			data.pageLoadingShow = false;
		})
		.catch((err) => {
			data.pageLoadingStatus = 'error';
		});
}

function stock(sku) {
	let stock = 0;
	if (sku && sku.length) {
		sku.forEach((item) => {
			stock += item.warehouseProductStock ? parseInt(item.warehouseProductStock.user_stock) : 0;
		});
	}
	return stock;
}

function getNum() {
	data.num = 0;
	setTimeout(() => {
		data.product.sku.forEach((item) => {
			data.num += item.num ? parseInt(item.num) : 0;
		});
	}, 30);
}

function submit() {
	if (!data.num) return uni.$api.toast('请选择数量');
	const value = {};
	for (let i = 0; i < data.product.sku.length; i++) {
		if (data.product.sku[i].num) {
			value[data.product.sku[i].id] = data.product.sku[i].num;
		}
	}
	const params = {
		data: value,
		id: data.product.id,
		type: 'warehouse_pickup',
	};
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.warehousePickUpOrderCreate,
		query: {
			data: JSON.stringify(params),
		},
	});
}

const { product, num, pageLoadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.card-box {
	padding: 20rpx;
	background-color: #fff;
}
.card-item {
	display: flex;
	.image {
		flex-shrink: 0;
		width: 180rpx;
		height: 180rpx;
		margin-right: 20rpx;
		border-radius: 10rpx;
		background: $dz-bg-color;
	}
	.right {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		.porduct-name {
			height: 80rpx;
			line-height: 40rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}
	}
}
.suk-box {
	margin-top: 60rpx;
	.suk-item {
		display: flex;
		justify-content: space-between;
		margin-top: 10rpx;
	}
}
.footer {
	position: fixed;
	bottom: 0;
	width: 100%;
	background: #ffffff;
	.footer-bottom {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		margin-bottom: env(safe-area-inset-bottom);
	}
}
</style>

<template>
	<view>
		<dz-navbar title="库存管理"></dz-navbar>
		<view v-if="currentNumber > 1" class="fixed-box dz-flex dz-row-center">每次最低进货数量是{{ currentNumber }}件</view>
		<view class="card-box" :class="currentNumber > 1 ? 'dz-m-t-86' : ''">
			<view class="card-item" v-for="(item, index) in porductList" :key="index">
				<view class="image"><dz-image :src="item.picture" :width="180" :height="180" :border-radius="15"></dz-image></view>
				<view class="right">
					<view class="porduct-name">{{ item.name }}</view>
					<view class="sum">库存量: {{ stock(item.sku) }}件</view>
					<view class="btn-box dz-m-t-10">
						<dz-button
							size="mini"
							:custom-style="{
								width: '120rpx',
								height: '52rpx',
								lineHeight: '52rpx',
								background: '#fff',
								border: '1rpx solid rgba(0,0,0,0.12)',
								color: '#333',
								marginRight: '20rpx',
								fontSize: '26rpx',
							}"
							hover-class="none"
							shape="circle"
							:border="false"
							@click="toPageTap('warehousePurchaseOrder', item)"
						>
							进货
						</dz-button>
						<dz-button
							size="mini"
							:border="false"
							:custom-style="{
								width: '120rpx',
								height: '52rpx',
								lineHeight: '52rpx',
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								fontSize: '26rpx',
							}"
							hover-class="none"
							shape="circle"
							@click="toPageTap('warehousePickUpOrder', item)"
						>
							提货
						</dz-button>
					</view>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" text="暂无商品" margin-top="80" :src="emptyData" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
		<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
		<!-- 规格弹窗 -->
		<dz-popup v-model:show="specShow" mode="bottom" border-radius="40" closeIcon="roundclose" closeIconSize="40" :closeable="true">
			<dz-attr-content
				:product="productDetail"
				:buyNumber="currentNumber"
				:currentMinMum="currentNumber"
				buttonName="确定"
				@confirm="attrConfirmClick"
			></dz-attr-content>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onUnload, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const emptyData = uni.$api.assetsConfig.emptyData;
const data = reactive({
	porductList: [],
	loadingShow: false,
	pageLoadingStatus: 'loading',
	loadingStatus: 'loading',
	page: 1,
	specShow: false,
	currentSkuId: '',
	currentNumber: 1,
	productDetail: {},
});

const userStore = useUserStore();
const theme = computed(() => {
	return userStore.getTheme;
});
const userPromoter = computed(() => {
	return userStore.getUserPromoter;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '库存记录',
	});
	uni.$on('orderGroupChange', (data) => {
		data.page = 1;
		data.porductList = [];
		warehouseProduct();
	});
	warehouseProduct();
	if (userPromoter.value && userPromoter.value.promoterWarehouse && userPromoter.value.promoterWarehouse.warehouseLevel) {
		const min_purchase_num = userPromoter.value.promoterWarehouse.warehouseLevel.min_purchase_num;
		data.currentNumber = min_purchase_num > 0 ? min_purchase_num : 1;
	}
});

onPullDownRefresh(() => {
	data.page = 1;
	data.porductList = [];
	data.loadingShow = true;
	warehouseProduct();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	warehouseProduct();
});

onUnload(() => {
	uni.$off('orderGroupChange');
});

function loadingClick() {
	warehouseProduct();
}

async function warehouseProduct() {
	await uni.$api.http
		.get(uni.$api.apiShop.distributionWarehouseProductIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
			data.loadingShow = false;
			data.porductList = [...data.porductList, ...res.data];
		})
		.catch((err) => {
			console.log(err);
			data.pageLoadingStatus = 'error';
		});
	uni.stopPullDownRefresh();
}

function stock(sku) {
	let stock = 0;
	if (sku.length) {
		sku.forEach((item) => {
			stock += item.warehouseProductStock ? parseInt(item.warehouseProductStock.user_stock) : 0;
		});
	}
	return stock;
}

//属性选择确认
function attrConfirmClick(v) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.warehousePurchaseOrder,
		query: {
			id: data.productDetail.id,
			minNum: data.currentNumber,
			...v,
		},
	});
	data.specShow = false;
}

//获取商品详情
async function getProductDetail(row) {
	data.currentSkuId = row.sku_id;
	uni.showLoading({ title: '加载中...' });
	await uni.$api.http
		.get(uni.$api.apiShop.distributionWarehouseProductView, {
			params: {
				id: row.product_id,
			},
		})
		.then((res) => {
			const sku = res.data;
			sku.sku_data = row.sku_data;
			data.productDetail = sku;
			data.specShow = true;
		})
		.finally(() => {
			uni.hideLoading();
		});
}

function toPageTap(url, val) {
	if (url == 'warehousePurchaseOrder') {
		getProductDetail({
			sku_id: val.sku[0].id,
			sku_data: val.sku[0].data,
			number: 1,
			product_id: val.id,
		});
		return;
	} else {
		uni.$api.router.push({
			route: uni.$api.routesConfig[url],
			query: {
				id: val.id,
			},
		});
	}
}

const { currentNumber, porductList, loadingStatus, loadingShow, pageLoadingStatus, specShow, productDetail } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.fixed-box {
	position: fixed;
	width: 100%;
	height: 86rpx;
	padding: 0 20rpx;
	background: #fff7ec;
	color: #f90;
	z-index: 2;
}
.tip {
	text {
		margin-right: 10rpx;
		color: #333;
	}
	padding: 20rpx 20rpx 0 20rpx;
	color: rgb(250, 52, 52);
}
.card-box {
	padding: 20rpx 20rpx 1rpx;
}

.dz-m-t-86 {
	margin-top: 86rpx;
}
.card-item {
	display: flex;
	padding: 20rpx;
	margin-bottom: 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
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
		.sum {
			color: #999;
		}
		.btn-box {
			width: 260rpx;
			margin-left: auto;
		}
	}
}
</style>

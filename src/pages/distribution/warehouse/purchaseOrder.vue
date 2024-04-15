<template>
	<view>
		<dz-navbar title="进货"></dz-navbar>
		<view class="card-box" v-if="order.product">
			<view class="card-item">
				<image :src="order.product.picture"></image>
				<view class="right">
					<view class="porduct-name">{{ order.product.name }}</view>
					<view>
						<dz-tag type="info" size="mini" :bgColor="theme.dzBgColor" :borderColor="theme.dzBgColor">
							款式：
							<text class="dz-font-24 dz-m-r-10" style="line-height: 32rpx">{{ config.skuName }}</text>
						</dz-tag>
					</view>
					<view class="dz-color-9">库存量: {{ config.skuStock }}</view>
				</view>
			</view>
			<view class="sum">
				<view class="price">进货价：￥{{ config.skuPrice }}</view>
				<dz-number-box v-model="config.skuNumber" :min="parseInt(config.minNum)" @change="change"></dz-number-box>
			</view>
			<view class="dz-m-t-30">
				<dz-row gutter="16">
					<dz-col span="4" v-for="(item, index) in shortcutList" :key="index" @click="quickClick(index)">
						<view
							class="layout"
							:style="{
								background: index == shortcutIndex ? theme.dzBaseColor : theme.dzBgColor,
								color: index == shortcutIndex ? theme.dzBaseFontColor : '#333',
							}"
						>
							<view class="dz-font-md dz-text-center">x {{ item }}</view>
						</view>
					</dz-col>
				</dz-row>
			</view>
		</view>
		<view class="footer">
			<view class="footer-bottom">
				<view>
					<view>合计：{{ config.skuNumber }}</view>
					<view>进货总价：￥{{ price }}</view>
				</view>
				<view>
					<dz-button
						:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
						hover-class="none"
						:border="false"
						size="medium"
						shape="circle"
						@click="submit"
					>
						进货
					</dz-button>
				</view>
			</view>
		</view>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const data = reactive({
	order: {},
	price: 0,
	pageLoadingShow: true,
	pageLoadingStatus: 'loading',
	shortcutList: [2, 5, 7, 10, 30],
	shortcutIndex: -1,
	config: {},
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '进货',
	});
	data.config = options;
	if (data.config.minNum >= 1) {
		data.shortcutList = [];
		for (let i = 0; i < 6; i++) {
			data.shortcutList.push(parseInt(data.config.minNum) + i * 5);
		}
	}
	change({ value: parseInt(options.skuNumber) });
	orderPreview();
});

function pageLoadingClick() {
	orderPreview();
}

function quickClick(index) {
	data.shortcutIndex = index;
	data.config.skuNumber = data.shortcutList[index];
	change({ value: parseInt(data.config.skuNumber) });
}

async function orderPreview() {
	await uni.$api.http
		.post(uni.$api.apiShop.distributionWarehousePurchaseOrderPreview, {
			product_id: data.config.id,
			sku_id: data.config.skuId,
		})
		.then((res) => {
			data.order = res.data;
			data.pageLoadingShow = false;
		})
		.catch((err) => {
			data.pageLoadingStatus = 'error';
		});
}

function change({ value }) {
	data.config.skuNumber = value;
	data.config.skuPrice ? (data.price = (parseFloat(data.config.skuPrice) * parseInt(data.config.skuNumber)).toFixed(2)) : (data.price = 0);
}

async function submit() {
	if (!data.config.skuNumber) return uni.$api.toast('请选择箱数');
	await uni.$api.http
		.post(uni.$api.apiShop.distributionWarehousePurchaseOrderCreate, {
			product_id: data.config.id,
			sku_id: data.config.skuId,
			num: data.config.skuNumber,
		})
		.then((res) => {
			uni.$api.router.redirectTo({
				route: uni.$api.routesConfig.pay,
				query: {
					id: res.data.id,
					orderGroup: 'warehouse_purchase_order',
				},
			});
		});
}

function toPage(url, type) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			type,
		},
	});
}

const { order, config, shortcutList, shortcutIndex, price, pageLoadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.card-box {
	padding: 20rpx;
	background-color: #fff;
}
.card-item {
	display: flex;
	image {
		width: 180rpx;
		height: 180rpx;
		margin-right: 20rpx;
		border-radius: 15rpx;
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
.layout {
	margin: 10rpx 0;
	padding: 20rpx;
	border-radius: 12rpx;
}
.sum {
	display: flex;
	justify-content: space-between;
	margin: 60rpx 0 10rpx;
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

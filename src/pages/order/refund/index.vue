<template>
	<view>
		<dz-navbar title="售后服务" :border-bottom="false"></dz-navbar>
		<view>
			<view class="product">
				<view class="image"><dz-image :src="refundPorduct.product_picture" :borderRadius="15" :width="160" :height="160"></dz-image></view>
				<view class="right">
					<view class="title">{{ refundPorduct.product_name }}</view>
					<view class="tip">
						<text>实付款:</text>
						<text class="sum">￥{{ refundPorduct.product_money }}</text>
						<text class="dz-m-l-20">购买数量:</text>
						<text class="sum">{{ refundPorduct.num }}</text>
					</view>
				</view>
			</view>
			<view class="card">
				<dz-cell-item
					v-if="refundMoneyStatus()"
					icon="refund"
					icon-size="48"
					:icon-style="{ color: theme.dzTypeSuccess }"
					center
					title="退款"
					value="未收到包裹或协商后不需寄回货物"
					hover-class="none"
					@tap="tapRefund('1')"
				></dz-cell-item>
				<dz-cell-item
					v-if="changeProductStatus()"
					icon="round_transfer"
					icon-size="46"
					:icon-style="{ color: theme.dzTypeWarning }"
					center
					title="换货"
					value="更换收到的货物"
					hover-class="none"
					@tap="tapRefund('3')"
				></dz-cell-item>
				<dz-cell-item
					v-if="refundMoneyAndProductStatus()"
					center
					icon="pick"
					icon-size="48"
					:icon-style="{ color: theme.dzTypePrimary }"
					title="退货退款"
					value="已收到货，需退还已收到的货物"
					hover-class="none"
					@tap="tapRefund('2')"
				></dz-cell-item>
			</view>
		</view>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const data = reactive({
	refundPorduct: {},
	orderId: '',
	orderItemId: '',
	pageLoadingStatus: 'loading',
	pageLoadingShow: true,
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '售后服务',
	});
	data.orderId = options.id;
	data.orderItemId = options.order_id;
	getOrderDetail();
});

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

function loadingClick() {
	getOrderDetail();
}

async function getOrderDetail() {
	await uni.$api.http
		.get(uni.$api.apiMember.orderView, {
			params: {
				id: data.orderItemId,
			},
		})
		.then((res) => {
			let productItem = res.data.product.filter((item) => item.id == data.orderId);
			data.refundPorduct = productItem[0];
			data.pageLoadingShow = false;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

function tapRefund(type) {
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.refund,
		query: {
			id: data.refundPorduct.id,
			refund_type: type,
			order_status: data.refundPorduct.order_status,
		},
	});
}

function refundMoneyStatus() {
	return (
		([2, 3, 4, 12].indexOf(parseInt(data.refundPorduct.order_status)) !== -1 &&
			data.refundPorduct.shipping_status != 0 &&
			[0, -3].indexOf(parseInt(data.refundPorduct.refund_status)) !== -1 &&
			data.refundPorduct.is_virtual != 1) ||
		(data.refundPorduct.refund_status == -2 && shopSetting.value.order_refund_cancel_reapply == 1)
	);
}

function changeProductStatus() {
	return (
		([2, 3, 4, 12].indexOf(parseInt(data.refundPorduct.order_status)) !== -1 &&
			data.refundPorduct.shipping_status != 0 &&
			[0, -3].indexOf(parseInt(data.refundPorduct.refund_status)) !== -1 &&
			data.refundPorduct.is_virtual != 1) ||
		(data.refundPorduct.refund_status == -2 && shopSetting.value.order_refund_cancel_reapply == 1)
	);
}

function refundMoneyAndProductStatus() {
	return (
		([2, 3, 4, 12].indexOf(parseInt(data.refundPorduct.order_status)) !== -1 &&
			data.refundPorduct.shipping_status != 0 &&
			[0, -3].indexOf(parseInt(data.refundPorduct.refund_status)) !== -1 &&
			data.refundPorduct.is_virtual != 1) ||
		(data.refundPorduct.refund_status == -2 && shopSetting.value.order_refund_cancel_reapply == 1)
	);
}

const { refundPorduct, pageLoadingStatus, pageLoadingShow } = { ...toRefs(data) };
</script>

<style lang="scss">
.product {
	display: flex;
	padding: 30rpx;
	background-color: #ffffff;

	.image {
		flex-shrink: 0;
		width: 160rpx;
		height: 160rpx;
		border-radius: 10rpx;
		background-color: $dz-bg-color;
	}

	.right {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		.title {
			font-size: 28rpx;
			color: $dz-main-color;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}

		.tip {
			font-size: 24rpx;
			color: $dz-tips-color;

			.sum {
				color: $dz-main-color;
			}
		}
	}
}

.card {
	margin-top: 20rpx;
	background-color: #ffffff;
}
</style>

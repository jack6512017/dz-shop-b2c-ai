<template>
	<view>
		<dz-navbar title="详情"></dz-navbar>
		<view class="status" :style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }">
			<view class="title dz-flex dz-row-between">
				<view>{{ refundStatusFilter(refundDetail.refund_status) }}</view>
				<view
					v-if="
						(parseInt(refundDetail.order_status) == 2 || parseInt(refundDetail.order_status) == 3 || parseInt(refundDetail.order_status) == 4) &&
						parseInt(refundDetail.refund_status) == 7
					"
				>
					<view>
						<dz-button
							:plain="true"
							type="info"
							shape="circle"
							hoverClass="node"
							:custom-style="{
								background: theme.dzBaseLight,
								borderColor: theme.dzBaseDisabled,
								color: theme.dzBaseColor,
								width: '160rpx',
							}"
							@click="salesDelivery()"
						>
							确认收货
						</dz-button>
					</view>
				</view>
			</view>
			<view class="time" v-if="parseInt(refundDetail.refund_status) == 5">退款原路返还至您的支付账户</view>
			<view class="time" v-if="parseInt(refundDetail.refund_status) == 5">2天内到账 到账时间个别银行间有所差异</view>
			<view class="time" v-if="parseInt(refundDetail.refund_status) == 4">预计24小时内审核</view>
		</view>
		<view class="content" v-if="parseInt(refundDetail.refund_type) != 3 && refundDetail.warehouse_is_pickup == 0">
			<dz-cell-item center title="退款金额" :value="`￥${money}`" hover-class="none" :arrow="false"></dz-cell-item>
		</view>
		<view class="content" v-else><dz-cell-item center title="退增库存" :value="refundDetail.num" hover-class="none" :arrow="false"></dz-cell-item></view>
		<view class="product dz-m-t-20">
			<dz-cell-item center title="退货/退款/换货信息" hover-class="none" :arrow="false" :borderBottom="false"></dz-cell-item>
			<view class="item">
				<view class="image"><dz-image :src="refundDetail.product_picture" :borderRadius="15" :width="180" :height="180"></dz-image></view>
				<view class="right">
					<view>
						<view class="title">{{ refundDetail.product_name }}</view>
						<view class="tip">数量: {{ refundDetail.num }}</view>
					</view>
				</view>
			</view>
			<view class="message">
				<view v-if="refundDetail.refund_reason">申请原因: {{ refundDetail.refund_reason }}</view>
				<view v-if="refundDetail.refund_evidence"
					>退款凭证:
					<dz-album :urls="JSON.parse(refundDetail.refund_evidence)" keyName="url"></dz-album>
				</view>
				<view v-if="refundDetail.refund_explain">退款说明: {{ refundDetail.refund_explain }}</view>
				<view v-if="refundDetail.refund_status == 5">实际退款金额: ￥{{ refundDetail.refund_balance_money }}</view>
				<view v-if="refundDetail.warehouse_is_pickup == 0">商品金额: ￥{{ money }}</view>
				<view>申请时间: {{ api.timeFormat(refundDetail.created_time, 'yyyy-mm-dd') }}</view>
				<view>售后编号: {{ refundDetail.order_product_sn }}</view>

				<view v-if="refundDetail.refund_shipping_company && parseInt(refundDetail.refund_shipping_company) != 0">
					退货物流公司: {{ refundDetail.refund_shipping_company }}
				</view>
				<view v-if="refundDetail.refund_shipping_code">退货物流单号: {{ refundDetail.refund_shipping_code }}</view>

				<view v-if="refundDetail.refund_resend_shipping_company">重发物流公司: {{ refundDetail.refund_resend_shipping_company }}</view>
				<view v-if="refundDetail.refund_resend_shipping_code" class="dz-flex dz-row-between">
					<view>重发物流单号: {{ refundDetail.refund_resend_shipping_code }}</view>
					<view>
						<dz-button
							:plain="true"
							type="info"
							size="mini"
							shape="circle"
							hoverClass="none"
							:border="false"
							:custom-style="{
								height: '40rpx',
								background: '#FFF',
								lineHeight: '40rpx',
								border: '1rpx solid rgba(0,0,0,0.12)',
							}"
							@click="copy(refundDetail.refund_resend_shipping_code)"
						>
							复制
						</dz-button>
					</view>
				</view>
			</view>
			<view
				class="dz-flex dz-row-right dz-m-r-30 dz-p-b-30"
				v-if="(refundDetail.order_status == 2 || refundDetail.order_status == 3 || refundDetail.order_status == 4) && refundDetail.refund_status == 2"
			>
				<view>
					<dz-button
						type="info"
						hoverClass="none"
						shape="circle"
						:border="false"
						:custom-style="{
							width: '152rpx',
							height: '56rpx',
							background: '#fff',
							border: '1rpx solid rgba(0,0,0,0.12)',
						}"
						@click="toPage('refundShipping', refundDetail)"
					>
						填写物流
					</dz-button>
				</view>
			</view>
		</view>
		<view class="footer">
			<view class="footer-bottom dz-flex">
				<view class="dz-flex-1" v-if="customerService">
					<dz-button
						:open-type="parseInt(serviceType) == 4 ? '' : 'contact'"
						:sessionFrom="sessionFrom"
						type="info"
						hoverClass="none"
						shape="circle"
						:border="false"
						:custom-style="{
							width: '90%',
							background: '#fff',
							border: '1rpx solid rgba(0,0,0,0.12)',
						}"
						@click="serviceTap"
					>
						<dz-icon name="service_light" size="48"></dz-icon>
						<text class="dz-m-l-10">联系客服</text>
					</dz-button>
				</view>
				<view class="dz-flex-1">
					<dz-button
						type="info"
						shape="circle"
						hoverClass="none"
						:border="false"
						:custom-style="{
							width: '90%',
							background: '#fff',
							border: '1rpx solid rgba(0,0,0,0.12)',
						}"
						@click="phone"
					>
						<dz-icon name="phone_light" size="48"></dz-icon>
						<text class="dz-m-l-10">热线电话</text>
					</dz-button>
				</view>
			</view>
		</view>
		<dz-modal
			v-model:show="salesDeliveryModalShow"
			:mask-close-able="false"
			content="是否确认已经收到货？"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			:async-close="true"
			@cancel="salesDeliveryCancel"
			@confirm="salesDeliveryConfirm"
		></dz-modal>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="getOrderDetail"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();

const data = reactive({
	serviceType: '',
	refundDetail: {},
	customerService: false, //是否使用客服
	sessionFrom: '',
	salesDeliveryModalShow: false,
	shipping_money: 0,
	money: 0,
	orderProductId: '',
	orderItemId: '',
	pageLoadingStatus: 'loading',
	pageLoadingShow: true,
});

const theme = computed(() => {
	return userStore.getTheme;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const hasLogin = computed(() => {
	return userStore.hasLogin;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.serviceType = shopSetting.value.app_service_type;
	let serviceType = parseInt(shopSetting.value.app_service_type);
	if (serviceType > 0) {
		if (hasLogin.value) {
			data.sessionFrom =
				'{"source":"' +
				'订单编号：' +
				data.refundDetail.order_sn +
				'","mobile":"' +
				userInfo.value.mobile +
				'","sex":"' +
				userInfo.value.gender +
				'","nickName":"' +
				userInfo.value.nickname +
				'","avatarUrl":"' +
				userInfo.value.head_portrait +
				'"}';
		}
		//2为小程序原生客服，3为芝麻小客服
		if (serviceType === 2) {
			// #ifdef MP-WEIXIN
			data.customerService = true;
			// #endif
		}
		if (serviceType === 3) {
			data.customerService = true;
		}
		if (serviceType === 4) {
			// #ifdef MP-WEIXIN
			data.customerService = true;
			// #endif
			// #ifdef H5
			if (uni.$api.h5IsWechat()) {
				data.customerService = true;
			}
			// #endif
		}
	}
	data.orderProductId = options.id;
	data.orderItemId = options.order_id;
	data.shipping_money = options.shipping_money;
	getOrderDetail();
});

async function getOrderDetail() {
	await uni.$api.http
		.get(uni.$api.apiMember.orderView, {
			params: {
				id: data.orderItemId,
			},
		})
		.then((res) => {
			const productItem = res.data.product.filter((item) => item.id == data.orderProductId);
			data.refundDetail = productItem[0];
			data.shipping_money > 0
				? (data.money = (parseFloat(data.shipping_money) + parseFloat(data.refundDetail.product_money)).toFixed(2))
				: (data.money = data.refundDetail.product_money);
			data.pageLoadingShow = false;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

function refundStatusFilter(status) {
	let state;
	uni.$api.dataConfig.refundStatus.forEach((item) => {
		if (item.key === parseInt(status)) {
			state = item.value;
		}
	});
	return state;
}

function toPage(url, item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: item,
	});
}

function phone() {
	uni.$api.http
		.get(uni.$api.apiCommon.configIndex, {
			params: {
				field: 'store_refund_mobile',
			},
		})
		.then((res) => {
			if (!res.data.store_refund_mobile) return uni.$api.toast('暂无联系方式');
			uni.makePhoneCall({
				phoneNumber: res.data.store_refund_mobile,
			});
		});
}

function serviceTap() {
	let serviceType = parseInt(shopSetting.value.app_service_type);
	//微信原生小程序客服
	if (serviceType === 2) {
		// #ifndef MP-WEIXIN
		uni.$api.toast('请在小程序中打开客服');
		// #endif
	} else if (serviceType === 3) {
		//芝麻小客服
		// #ifndef MP-WEIXIN
		let customerServiceUrl = shopSetting.value.app_service_zmxkf_url;
		if (!customerServiceUrl) {
			uni.$api.toast('客服暂未配置');
			return;
		}
		if (hasLogin.value) {
			let params = {
				source: encodeURIComponent('订单编号：' + data.refundDetail.order_sn),
				openid: userInfo.value.id,
				mobile: userInfo.value.mobile,
				sex: userInfo.value.gender,
				nickName: encodeURIComponent(userInfo.value.nickname),
				avatarUrl: encodeURIComponent(userInfo.value.head_portrait),
			};
			customerServiceUrl = uni.$api.objParseUrlAndParam(customerServiceUrl, params);
			uni.$api.shop.clearCustomerServiceRead();
			uni.$api.router.push({
				route: uni.$api.routesConfig.webview,
				query: {
					url: uni.$api.strEncode(customerServiceUrl),
				},
			});
		} else {
			//要求先登录
			uni.$api.router.push({
				route: uni.$api.routesConfig.login,
			});
		}
		// #endif
	} else if (serviceType == 4) {
		//企业微信客服
		let customerServiceUrl = shopSetting.value.app_service_wxkf_url;
		let corpId = shopSetting.value.app_service_wxkf_id;

		if (!customerServiceUrl || !corpId) {
			uni.$api.toast('客服暂未配置');
			return;
		}
		// #ifdef MP-WEIXIN
		wx.openCustomerServiceChat({
			extInfo: { url: customerServiceUrl },
			corpId: corpId,
			fail() {
				uni.$api.toast('启用微信客服失败');
			},
		});
		// #endif
		// #ifdef H5
		if (uni.$api.h5IsWechat()) {
			window.location.href = customerServiceUrl;
		}
		window.open(customerServiceUrl);
		// #endif
		// #ifdef APP-PLUS
		plus.runtime.openURL(customerServiceUrl);
		// #endif
	}
}

function salesDelivery() {
	data.salesDeliveryModalShow = true;
}

function salesDeliveryCancel() {
	data.salesDeliveryModalShow = false;
}

function salesDeliveryConfirm() {
	salesDeliverySubmit();
}

// 复制
function copy(val) {
	uni.$api.copy(val);
	uni.$api.toast('物流单号已复制到剪贴板');
}

async function salesDeliverySubmit() {
	await uni.$api.http
		.post(data.refundDetail.order_status == 4 ? uni.$api.apiMember.orderCustomerSalesDelivery : uni.$api.apiMember.orderProductRefundSalesDelivery, {
			id: data.refundDetail.id,
		})
		.then(() => {
			data.salesDeliveryModalShow = false;
			uni.$api.toast('提交成功');
			uni.$emit('refundChange', {});
			setTimeout(() => {
				uni.$api.router.back();
			}, 1000);
		});
}

const { refundDetail, money, customerService, serviceType, sessionFrom, salesDeliveryModalShow, pageLoadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.status {
	display: flex;
	flex-direction: column;
	justify-content: center;
	height: 200rpx;
	padding: 0 30rpx;

	.title {
		font-size: 36rpx;
		margin-bottom: 20rpx;
	}

	.time {
		font-size: 24rpx;
	}
}

.content {
	background-color: #ffffff;
}

.product {
	background-color: #ffffff;
}

.item {
	display: flex;
	padding: 0 30rpx;

	.image {
		flex-shrink: 0;
		width: 180rpx;
		height: 180rpx;
		border-radius: 10rpx;
		background-color: $dz-bg-color;
	}

	.right {
		margin-left: 20rpx;

		.title {
			font-size: 28rpx;
			color: $dz-main-color;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}

		.tip {
			margin-top: 10rpx;
			font-size: 24rpx;
			color: $dz-tips-color;
		}
	}
}

.message {
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	color: $dz-tips-color;

	view {
		line-height: 54rpx;
	}
}

.footer {
	position: fixed;
	bottom: 0;
	width: 100%;
	background-color: #ffffff;

	.footer-bottom {
		width: 100%;
		height: 120rpx;
		display: flex;
		align-items: center;
		margin-bottom: env(safe-area-inset-bottom);
	}
}
</style>

<template>
	<view>
		<view v-if="wechatMpScene != '' && wechatMpScene == 1154">
			<dz-mask :show="true" :zIndex="1"></dz-mask>
			<view class="mp-scene">
				<view class="mp-weixin dz-flex dz-row-center"><dz-icon name="round_link_fill" color="#7A80FC" :size="70"></dz-icon></view>
				<view class="mp-tip dz-text-center">点击右下角</view>
				<img :src="guide" />
			</view>
		</view>
		<view v-else class="haggle-details">
			<!-- 砍一砍 -->
			<dz-navbar
				:title="language.haggle.bargaiDetailTitle"
				:title-color="theme.dzBaseFontColor"
				:back-icon-color="theme.dzBaseFontColor"
				:border-bottom="false"
				:background="{ background: 'linear-gradient(to right, rgb(255, 51, 102), rgb(255, 51, 18))' }"
			></dz-navbar>
			<view class="content">
				<view class="product-card" @tap="productClick">
					<view class="title">
						<image class="img" :src="(brgainLaunchView.baseMember && brgainLaunchView.baseMember.head_portrait) || missingFace"></image>
						<view class="right">
							<view class="name">{{ brgainLaunchView.baseMember && brgainLaunchView.baseMember.nickname }}</view>
							<!-- 我发现了好货,快来帮我砍价 -->
							<text>{{ language.haggle.bargaiDetailTip }}</text>
						</view>
					</view>
					<view class="product-box" v-if="brgainLaunchView.sku">
						<image :src="brgainLaunchView.sku.baseProduct.picture"></image>
						<view class="product-right">
							<view class="name">{{ brgainLaunchView.sku.baseProduct.name }}</view>
							<view class="price" :style="{ color: theme.dzBaseColor }">
								<!-- 可砍至￥ -->
								<view
									>{{ language.haggle.bargaiDetail }}<text class="dz-font-24">{{ language.application.moneySymbol }}</text
									>{{ brgainLaunchView.min_money }}</view
								>
								<text class="default-price dz-font-24">{{ language.application.moneySymbol }}{{ brgainLaunchView.sku.price }}</text>
							</view>
						</view>
					</view>
				</view>
				<!-- 正在砍价中 -->
				<view class="status" v-if="brgainLaunchView.state == 1">{{ language.haggle.bargaiDeingNegotiated }}</view>
				<!-- 砍价失败 -->
				<view class="status" v-if="brgainLaunchView.state == 3">{{ language.haggle.haggleerror }}</view>
				<!-- 砍价成功 -->
				<view class="status" v-if="brgainLaunchView.state == 2">{{ language.haggle.haggleStatusSuccess }}</view>
				<!-- 已砍99元,还可以9砍元 -->
				<view class="tip">
					{{ language.haggle.bargaiDown }}
					<text style="font-size: 32rpx; margin-left: 10rpx; margin-right: 10rpx">{{ haggle_money }}</text>
					{{ language.haggle.baragiCanAlsoCut }}
					<text style="font-size: 36rpx; margin-left: 10rpx; margin-right: 10rpx">{{ brgainLaunchView.surplus_money }}</text>
					{{ language.haggle.baragiDollar }}
				</view>
				<view class="assist-list dz-m-b-60">
					<!-- 已砍价 -->
					<view class="title dz-font-32">{{ language.haggle.cutPriceList }}</view>
					<scroll-view scroll-y style="max-height: 600rpx">
						<view class="item" v-for="(item, index) in brgainLaunchView.partake" :key="index">
							<view class="item-left">
								<image :src="item.partake.member_head_portrait || missingFace"></image>
								<view>
									<view class="name">{{ item.partake.member_nickname }}</view>
									<text>{{ haggleTip[api.random(0, 6)].val }}</text>
								</view>
							</view>
							<view class="item-right">
								<text class="dzicon-iconfont dzicon-flashbuyfill-copy" style="color: #fedcbd; margin-right: 10rpx"></text>
								<!-- 砍掉9元 -->
								<text>{{ language.haggle.bargaiCutOff }}{{ item.haggle_money }}{{ language.haggle.baragiDollar }}</text>
							</view>
						</view>
						<view v-if="brgainLaunchView.partake && !brgainLaunchView.partake.length" class="dz-m-t-20 dz-text-center" style="color: #fff">
							暂无好友帮砍，去分享吧~
						</view>
					</scroll-view>
				</view>
				<view class="time" v-if="parseInt(brgainLaunchView.state) === 0 || parseInt(brgainLaunchView.state) === 1">
					<!-- 还有 -->
					<text class="dz-m-r-10">{{ language.haggle.thereAre }}</text>
					<dz-count-down
						v-if="parseInt(brgainLaunchView.state) === 0"
						:timestamp="brgainLaunchView.start_time"
						:show-days="false"
						separator="zh"
						:bg-color="theme.dzTypeError"
						color="#fff"
						separator-color="#fff"
					></dz-count-down>
					<dz-count-down
						v-if="parseInt(brgainLaunchView.state) === 1"
						:timestamp="brgainLaunchView.end_time_left"
						:bg-color="theme.dzTypeError"
						color="#fff"
						separator="zh"
						separator-color="#fff"
					></dz-count-down>
					<text class="dz-m-l-10">{{ language.haggle.bargaiDetailfinished }}</text>
				</view>
				<dz-button
					@click="share"
					v-if="brgainLaunchView.member_id == userInfo.id"
					open-type="share"
					:disabled="brgainLaunchView.end_time_left < 0 || brgainLaunchView.state == 2"
					type="warning"
					hover-class="none"
					shape="circle"
					:border="false"
					:custom-style="{ marginBottom: '30rpx' }"
				>
					{{ language.haggle.bargaiCallFriends }}
				</dz-button>
				<dz-button
					v-if="brgainLaunchView.member_id != userInfo.id"
					type="warning"
					hover-class="none"
					:disabled="brgainLaunchView.end_time_left < 0 || brgainLaunchView.state == 2"
					:loading="isLoading"
					@click="haggleTap"
					shape="circle"
					:border="false"
				>
					{{ language.haggle.bargaiHelpCallFriends }}
				</dz-button>
				<dz-button
					v-if="brgainLaunchView.member_id == userInfo.id && brgainLaunchView.state == 2"
					type="warning"
					:disabled="brgainLaunchView.order && brgainLaunchView.order.close_left_time < 0"
					@click="toPay"
					:border="false"
					hover-class="none"
					shape="circle"
				>
					<view v-if="brgainLaunchView.order && parseInt(brgainLaunchView.order.order_status) == 0">
						<dz-count-down
							:timestamp="brgainLaunchView.order.close_left_time"
							:show-days="false"
							:color="theme.dzBaseFontColor"
							fontSize="28"
							:separator-color="theme.dzBaseFontColor"
							bg-color="#FFC43F"
							@timeEnd="timeOut"
						></dz-count-down>
						分钟将关闭支付
					</view>
					<block v-if="!brgainLaunchView.order">付款领取</block>
					<block v-if="brgainLaunchView.order && brgainLaunchView.order.close_left_time < 0">已关闭</block>
					<block v-if="brgainLaunchView.order && brgainLaunchView.order.pay_status == 1">订单详情</block>
				</dz-button>
			</view>
			<dz-page-loading :show="pageLoadingShow" :satus="pageLoadingStatus" @click="getBrgainLaunchView"></dz-page-loading>
			<!-- 砍价提示 -->
			<dz-modal
				v-model:show="barginShow"
				:mask-close-able="false"
				title="恭喜"
				:content="barginText"
				:confirm-color="theme.dzBaseColor"
				:async-close="true"
				@confirm="barginConfirm"
			></dz-modal>
		</view>
		<dz-app-share v-model:show="appShareShow" :isPoster="false" :config="shareData"></dz-app-share>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, watch, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onShareAppMessage, onShareTimeline, onUnload } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const guide = uni.$api.assetsConfig.guide;
const haggleTip = [
	// 看见砍价,随手一砍
	{ val: language.haggle.haggleDetailTip1 },
	{ val: language.haggle.haggleDetailTip2 },
	{ val: language.haggle.haggleDetailTip3 },
	{ val: language.haggle.haggleDetailTip4 },
	{ val: language.haggle.haggleDetailTip5 },
	{ val: language.haggle.haggleDetailTip6 },
	{ val: language.haggle.haggleDetailTip7 },
];
const data = reactive({
	source: 0,
	barginShow: false,
	barginText: '',
	brgainLaunchView: {},
	id: null,
	pageLoadingShow: true,
	pageLoadingStatus: 'loading',
	myShow: true,
	isSwitchShow: false, // 控制砍价提示框
	appShareShow: false,
	shareData: {},
	isLoading: false,
	mpShare: {},
});

const wechatMpScene = computed(() => {
	return userStore.getWechatMpScene;
});
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});
const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const wechatMpLogin = computed(() => {
	return userStore.getWechatMpLogin;
});
const theme = computed(() => {
	return userStore.getTheme;
});

watch(
	() => userStore.hasLogin,
	() => {
		updateShare();
	}
);

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.haggle.bargaiDetailTitle,
	});
	//保存推荐人
	if (options.promo_code) {
		userStore.setPromoCode(options.promo_code);
	}
	//保存经销商
	if (options.dealer_code) {
		userStore.setDealerCode(options.dealer_code);
	}
	//保存实体店
	if (options.store_id) {
		userStore.setStoreId(options.store_id);
	}
	//登录处理
	if (!userStore.hasLogin && parseInt(shopSetting.value.wechat_share_page_auto_login) == 1) {
		//公众号自动登录
		// #ifdef H5
		if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
			if (options.code) {
				uni.$api.wxAutoLoginHelper.wechatCodeLogin(options.code);
			} else {
				uni.$api.wxAutoLoginHelper.login();
			}
		}
		// #endif
	}
	data.source = options.source;
	data.id = options.id;
	getBrgainLaunchView();
	uni.$on('haggleCreate', (data) => {
		getBrgainLaunchView();
	});
});

onShareAppMessage(() => {
	return data.mpShare;
});

// #ifdef MP-WEIXIN
onShareTimeline(() => {
	return data.mpShare;
});
// #endif

onPullDownRefresh(() => {
	data.pageLoadingShow = true;
	data.brgainLaunchView = {};
	getBrgainLaunchView();
});

onUnload(() => {
	uni.$off('haggleCreate');
});

const haggle_money = computed(() => {
	let money = 0;
	data.brgainLaunchView.partake &&
		data.brgainLaunchView.partake.forEach((item) => {
			money += parseFloat(item.haggle_money);
		});
	return money.toFixed(2);
});

function barginConfirm() {
	data.barginShow = false;
}

async function getBrgainLaunchView() {
	await uni.$api.http
		.get(uni.$api.apiShop.haggleLaunchView, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			data.brgainLaunchView = res.data;
			data.pageLoadingShow = false;
			// TODO
			if (res.data.partake.length > 1 && data.isSwitchShow) {
				let index = res.data.partake.findIndex((item) => item.member_id == userInfo.value.id);
				data.barginText = `成功砍掉${res.data.partake[index].haggle_money}元`;
				data.barginShow = true;
			}
			// 分享
			updateShare();
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
	uni.stopPullDownRefresh();
}

//更新分享
function updateShare() {
	//初始化公众号分享
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.wxHelper.wxShare(
			window.location.href,
			shopSetting.value.haggle_detail_share_title,
			data.brgainLaunchView.sku.baseProduct.name,
			sharePath(),
			data.brgainLaunchView.sku.baseProduct.picture
		);
	}
	// #endif
	//初始化小程序分享
	data.mpShare.title = shopSetting.value.haggle_detail_share_title;
	data.mpShare.path = sharePath();
	data.mpShare.imageUrl = data.brgainLaunchView.sku.baseProduct.picture;
	//初始化APP分享
	data.shareData = {
		shareUrl: sharePath(),
		shareTitle: shopSetting.value.haggle_detail_share_title,
		shareContent: data.brgainLaunchView.sku.baseProduct.name,
		shareImg: data.brgainLaunchView.sku.baseProduct.picture,
	};
}

//分享路径
function sharePath() {
	let domain = uni.$api.appConfig.h5Domain;
	let url = '';
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	// #ifdef MP
	url = `${uni.$api.routesConfig.haggleDetails.path}?id=${data.id}&source=${data.source}`;
	// #endif
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.haggleDetails.path}?id=${data.id}&source=${data.source}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + userInfo.value.promo_code;
		if (userInfo.value.store_id) {
			url = url + '&store_id=' + userInfo.value.store_id;
		}
	}
	return url;
}

//营销活动开始
function marketingStart() {
	data.brgainLaunchView.state = 1;
}

//营销活动结束
function marketingEnd() {
	data.brgainLaunchView.state = 2;
}

async function share() {
	let url = '';
	// #ifdef MP
	if (
		wechatMpLogin.value &&
		shopSetting.value.notify_miniprogram_sub &&
		(shopSetting.value.notify_miniprogram_sub.order_haggle_success || shopSetting.value.notify_miniprogram_sub.order_haggle_fail)
	) {
		let tmplIds = [];
		// 砍价成功
		shopSetting.value.notify_miniprogram_sub.order_haggle_success && tmplIds.push(shopSetting.value.notify_miniprogram_sub.order_haggle_success);
		// 砍价失败
		shopSetting.value.notify_miniprogram_sub.order_haggle_fail && tmplIds.push(shopSetting.value.notify_miniprogram_sub.order_haggle_fail);
		wx.requestSubscribeMessage({
			tmplIds: tmplIds,
			success: () => {
				url = sharePath();
			},
			fail() {
				url = sharePath();
			},
		});
	} else {
		url = sharePath();
	}
	// #endif

	// #ifndef MP
	url = sharePath();
	// #endif

	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.toast(uni.$api.language.application.wxshareTip);
	} else {
		if (uni.$api.copy(url)) {
			uni.$api.toast(uni.$api.language.haggle.haggleShare);
		}
	}
	// #endif
	// #ifdef APP-PLUS
	data.appShareShow = true;
	// #endif
}

// 帮好友砍一刀
async function haggleTap() {
	if (data.isLoading) return;
	data.isLoading = true;
	await uni.$api.http
		.post(uni.$api.apiShop.hagglePartakeCreate, {
			launch_id: data.brgainLaunchView.id,
		})
		.then(() => {
			data.isSwitchShow = true;
			uni.$emit('haggleCreate', {});
		})
		.finally(() => {
			data.isLoading = false;
		});
}

// 去支付
async function toPay() {
	let orderId = data.brgainLaunchView.order_id;
	if (data.brgainLaunchView.order_id == 0 && data.brgainLaunchView.state == 2) {
		uni.showLoading({
			title: '正在生成订单...',
		});
		await uni.$api.http
			.get(uni.$api.apiShop.haggleLaunchBuildOrder, {
				params: { id: data.brgainLaunchView.id },
			})
			.then((res) => {
				orderId = res.data.order_id;
				getBrgainLaunchView();
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

function timeOut() {
	data.brgainLaunchView.order.close_left_time = -1;
}

function productClick() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.haggleProduct,
		query: {
			id: data.brgainLaunchView.product_id,
		},
	});
}

const { brgainLaunchView, pageLoadingShow, pageLoadingStatus, barginShow, barginText, appShareShow, shareData, isLoading } = { ...toRefs(data) };
</script>

<style lang="scss">
page {
	background: linear-gradient(to right, rgb(255, 51, 102), rgb(255, 51, 18));
}
.content {
	padding: 30rpx;
}
.product-card {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 20rpx;
	.title {
		display: flex;
		align-items: center;
		width: 100%;
		image {
			flex-shrink: 0;
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
		}
		.right {
			margin-left: 20rpx;
			font-size: 28rpx;
			.name {
				color: $dz-tips-color;
			}
			text {
				font-size: 32rpx;

				color: $dz-main-color;
				font-weight: 700;
			}
		}
	}
	.product-box {
		display: flex;
		margin-top: 30rpx;
		image {
			flex-shrink: 0;
			width: 160rpx;
			height: 160rpx;
			border-radius: 15rpx;
		}
		.product-right {
			flex: 1;
			margin-left: 20rpx;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			.name {
				font-size: 28rpx;
				color: $dz-main-color;
			}
			.price {
				display: flex;
				align-items: flex-end;
				width: 100%;
				font-size: 32rpx;
				font-weight: 700;
				.default-price {
					margin-left: 20rpx;
					color: $dz-tips-color;
					text-decoration: line-through;
					font-weight: 400;
				}
			}
		}
	}
}
.status {
	text-align: center;
	margin-top: 30rpx;
	font-size: 36rpx;
	color: #ffffff;
}
.tip {
	text-align: center;
	margin: 20rpx 0;
	color: #ffffff;
	text {
		color: $dz-type-warning;
		font-weight: 700;
	}
}
.assist-list {
	padding: 20rpx;
	background-color: rgba(255, 255, 255, 0.4);
	border-radius: 20rpx;
	.title {
		padding-bottom: 20rpx;
		text-align: center;
		color: #ffffff;
		border-bottom: 1rpx solid #ffffff;
	}
	.item {
		display: flex;
		justify-content: space-between;
		padding: 20rpx 10rpx;
		.item-left {
			display: flex;
			align-items: center;
			color: #ffffff;
			image {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				margin-right: 20rpx;
			}
			.name {
				font-size: 28rpx;
			}
			text {
				font-size: 24rpx;
			}
		}
		.item-right {
			display: flex;
			align-items: center;
			color: $dz-type-warning;
		}
	}
}
.time {
	padding: 30rpx 0 20rpx;
	color: #ffffff;
	text-align: center;
}
</style>

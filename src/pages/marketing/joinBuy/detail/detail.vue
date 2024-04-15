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
		<view v-else>
			<dz-navbar :title="language.joinBuyDetail.joinBuyDetailTitle"></dz-navbar>
			<view class="marketing-list">
				<view class="item" @tap="gotoProduct(joinBuyView.product_id)">
					<image class="img" :src="joinBuyView.product_picture" lazy-load></image>
					<view class="right">
						<view>
							<view class="title">{{ joinBuyView.product_name }}</view>
							<view class="text">{{ joinBuyView.sku_name || language.application.defaultSkuName }}</view>
						</view>
						<view class="price-box">
							<view class="price">
								<text>{{ language.application.moneySymbol }}</text>
								<text>{{ joinBuyView.product_money }}</text>
								<view class="price-tip">x 1</view>
							</view>
							<dz-tag size="mini" :bg-color="theme.dzBaseColor" :color="theme.dzBaseFontColor" mode="dark" style="font-size: 24rpx">
								{{ api.formatString(language.joinBuyDetail.joinBuyNum, joinBuyView.total_number) }}
							</dz-tag>
						</view>
					</view>
				</view>
			</view>
			<view class="group-box">
				<view
					class="group-title"
					v-if="
						joinBuyView.order &&
						joinBuyView.order.length &&
						joinBuyView.order[0].pay_status == 0 &&
						joinBuyView.end_time_left &&
						parseInt(joinBuyView.end_time_left) > 0
					"
				>
					待付款
				</view>
				<view
					class="group-title dz-m-b-10"
					v-if="parseInt(joinBuyView.state) == 1 && joinBuyView.end_time_left && parseInt(joinBuyView.end_time_left) > 0"
				>
					拼单中，还差{{ unJoinBuyMemberNumber }}人，剩余
					<dz-count-down
						class="dz-m-l-10"
						:timestamp="joinBuyView.end_time_left"
						:show-days="false"
						:color="theme.dzBaseColor"
						:separator-color="theme.dzBaseColor"
						:bg-color="'transparent'"
						@timeEnd="joinBuyEnd"
					></dz-count-down>
				</view>
				<view v-if="joinBuyView.end_time_left && joinBuyView.end_time_left < 0">{{ joinBuyView.member_nickname }} - 开团失败</view>
				<view v-else>{{ joinBuyView.member_nickname }} - {{ stateFilters(joinBuyView.state) }}</view>
				<!-- 团员信息 -->
				<view class="group-name">
					<view class="img" v-for="(item, index) in joinBuyMemberList" :key="index">
						<image
							:style="{ borderColor: index === 0 ? theme.dzBaseColor : theme.dzBgColor }"
							:src="item.member.head_portrait || missingFace"
							mode=""
						></image>
						<view :style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }" v-if="index === 0">团长</view>
						<view
							:style="{ background: theme.dzBgColor, color: theme.dzMainColor }"
							v-if="parseInt(item.pay_status) === 1 && index !== 0 && parseInt(item.order_status) !== -4"
						>
							成员
						</view>
						<view
							:style="{ background: theme.dzBgColor, color: theme.dzBaseFontColor }"
							v-if="parseInt(item.pay_status) === 0 && parseInt(item.order_status) !== -4"
						>
							待付
						</view>
					</view>
					<view class="img" v-for="indexes in unJoinBuyMemberNumber" :key="indexes" v-if="parseInt(joinBuyView.state) != 3">
						<image :style="{ borderColor: theme.dzBgColor }" :src="missingFace" mode=""></image>
					</view>
				</view>
				<!-- 支付 -->
				<view class="btn" v-if="joinBuyPayShow">
					<dz-button
						:border="false"
						:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '70%' }"
						hover-class="none"
						shape="circle"
						@click="pay()"
					>
						去支付
					</dz-button>
				</view>
				<!--邀请好友-->
				<view class="btn scale-1" v-if="joinBuyShareShow">
					<dz-button
						:border="false"
						:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '70%' }"
						hover-class="none"
						shape="circle"
						open-type="share"
						@click="share(joinBuyView)"
					>
						邀请好友
					</dz-button>
				</view>
				<!--加入拼团-->
				<view class="btn scale-1 dz-m-t-20" v-if="joinBuyJoinShow">
					<dz-button
						:border="false"
						:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '70%' }"
						hover-class="none"
						shape="circle"
						@click="submit(joinBuyView)"
					>
						加入拼团
					</dz-button>
				</view>
				<!-- 拼团成功 -->
				<view class="btn dz-m-b-60" v-if="parseInt(joinBuyView.state) === 2">
					<dz-icon name="roundcheckfill" :color="theme.dzTypeSuccess" size="180"></dz-icon>
				</view>
				<!-- 拼团失败 -->
				<view class="btn dz-m-b-60" v-if="parseInt(joinBuyView.end_time_left) < 0">
					<dz-icon name="roundclosefill" :color="theme.dzTypeWarning" size="180"></dz-icon>
				</view>
				<view class="btn dz-m-t-20">
					<dz-button
						:border="false"
						:custom-style="{
							width: '70%',
							background: theme.dzBgColor,
						}"
						hover-class="none"
						shape="circle"
						@click="toProfile"
					>
						返回用户中心
					</dz-button>
				</view>
			</view>
			<!-- 订单信息 -->
			<view class="cell-box" v-if="orderDetail && orderDetail.shipping_type && orderDetail.member_id == userInfo.id">
				<dz-cell-item
					center
					title="下单时间"
					:arrow="false"
					:value="api.timeFormat(joinBuyView.created_time)"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					title="订单编号"
					:arrow="false"
					:value="joinBuyView.order && joinBuyView.order[0].order_sn"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					title="配送方式"
					:arrow="false"
					:value="filterShippingType(orderDetail.shipping_type)"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					title="快递公司"
					:arrow="false"
					:value="orderDetail.company_name || '等待配送'"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					title="运费"
					:arrow="false"
					:value="api.formatString(language.orderCreate.price, orderDetail.shipping_money)"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					title="发票税费"
					:arrow="false"
					:value="api.formatString(language.orderCreate.price, orderDetail.tax_money)"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					title="商品金额"
					:arrow="false"
					:value="`￥${joinBuyView.price}`"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					title="实付款"
					:arrow="false"
					:value="api.formatString(language.orderCreate.price, orderDetail.pay_money)"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:border-bottom="false"
					:value-style="{ color: theme.dzBaseColor }"
					hover-class="none"
				></dz-cell-item>
			</view>
			<!-- 爆款推荐 -->
			<view class="product-box">
				<dz-title v-if="joinBuyList.length > 0" title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
				<view class="product-list">
					<view class="product-item" v-for="(item, listIndex) in joinBuyList" :key="listIndex" @tap="gotoProduct(item.product.id)">
						<image :src="item.product.picture"></image>
						<view class="product-info">
							<view>
								<view class="price-text">{{ item.product.name }}</view>
								<dz-tag size="mini" mode="dark" :bg-color="theme.dzBaseColor" :color="theme.dzBaseFontColor" style="margin: 0 0 10rpx 10rpx">
									{{ item.num }}{{ language.joinBuy.yesGroup }}
								</dz-tag>
							</view>

							<view style="display: flex; align-items: flex-end; padding-left: 10rpx">
								<view class="price-box" :style="{ color: theme.dzBaseColor }">
									<text class="price-l">{{ language.application.moneySymbol }}</text>
									<text class="price-r">{{ item.product.join_buy_price }}</text>
								</view>
								<view class="price-tip">{{ language.application.moneySymbol }}{{ item.product.market_price || item.product.price }}</view>
							</view>
						</view>
					</view>
				</view>
				<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
				<view class="dz-p-t-20">
					<dz-loadmore v-if="loadingStatus == 'laoding'" :status="loadingStatus" :bg-color="theme.dzBgColor" margin-bottom="20"></dz-loadmore>
				</view>
			</view>
			<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
		</view>
		<dz-app-share v-model:show="appShareShow" :isPoster="false" :config="shareData"></dz-app-share>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, watch, toRefs } from 'vue';
import { onLoad, onShow, onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const empty = uni.$api.assetsConfig.empty;
const guide = uni.$api.assetsConfig.guide;
const data = reactive({
	id: '',
	joinBuyView: {},
	page: 1,
	loading: false,
	loadingStatus: 'loading',
	joinBuyList: [],
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	orderDetail: {},
	mpShare: {},
	appShareShow: false,
	shareData: {},
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
		title: language.joinBuyDetail.joinBuyDetailTitle,
	});
	data.id = options.id;
	getJoinBuyList();
	getJoinBuyView();
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
});

onShow(() => {
	if (data.id && data.joinBuyView && data.joinBuyView.id) {
		getJoinBuyView();
	}
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
	data.page = 1;
	data.joinBuyList = [];
	getJoinBuyView();
	getJoinBuyList();
});

onReachBottom(() => {
	if (data.loadingStatus === 'nomore') return;
	data.page++;
	getJoinBuyList();
});

//拼团订单
const joinBuyMemberList = computed(() => {
	return data.joinBuyView.order;
});
//还差付款的拼团人数
const unJoinBuyMemberNumber = computed(() => {
	if (!data.joinBuyView.order) {
		return 0;
	}
	let order = data.joinBuyView.order;
	let paid = 0;
	for (let i = 0; i < order.length; i++) {
		if (parseInt(order[i].pay_status) === 1) {
			paid++;
		}
	}
	if (parseInt(order[0].pay_status) === 0) {
		return parseInt(data.joinBuyView.total_number) - paid - 1;
	} else {
		return parseInt(data.joinBuyView.total_number) - paid;
	}
});

//是否需要付款
const joinBuyPayShow = computed(() => {
	if (!userStore.hasLogin) {
		return false;
	}
	if (parseInt(data.joinBuyView.state) > 1) {
		return false;
	}
	const order = data.joinBuyView.user_order;

	if (order && parseInt(order.pay_status) === 0 && parseInt(userInfo.value.id) === parseInt(order.member_id)) {
		return true;
	}

	return false;
});

const joinBuyShareShow = computed(() => {
	if (!userStore.hasLogin) {
		return false;
	}
	if (!data.joinBuyView.order) {
		return false;
	}
	if (parseInt(data.joinBuyView.state) > 1) {
		return false;
	}
	const order = data.joinBuyView.user_order;
	if (order && parseInt(order.pay_status) === 1 && parseInt(userInfo.value.id) === parseInt(order.member_id)) {
		return true;
	}
	return false;
});

//是否可以加入拼团
const joinBuyJoinShow = computed(() => {
	if (!data.joinBuyView.order) {
		return false;
	}
	if (parseInt(data.joinBuyView.state) !== 1 || parseInt(data.joinBuyView.end_time_left) < 0) {
		return false;
	}
	const order = data.joinBuyView.user_order;

	if (order && parseInt(userInfo.value.id) === parseInt(order.member_id)) {
		return false;
	}

	return true;
});

function stateFilters(val) {
	let state;
	switch (parseInt(val)) {
		case 0:
			return (state = '待付款');
		case 1:
			return (state = '正发起拼团');
		case 2:
			return (state = '拼团成功');
		case 3:
			return (state = '开团失败');
	}
}
function filterShippingType(value) {
	const data = ['物流配送', '买家自提', '货到付款', '本地配送', '虚拟商品'];
	return data[parseInt(value) - 1];
}

function pageLoadingClick() {
	data.pageLoadingStatus = 'loading';
	getJoinBuyView();
}
//获取拼团详情
async function getJoinBuyView() {
	if (!data.id) return;
	data.pageLoadingShow = true;
	await uni.$api.http
		.get(uni.$api.apiShop.joinBuyView, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			data.joinBuyView = res.data;
			data.pageLoadingShow = false;
			if (data.joinBuyView && data.joinBuyView.user_order && data.joinBuyView.user_order.id) {
				getOrderDetail(data.joinBuyView.user_order.id);
			}
			// 分享
			updateShare();
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

// 获取订单运费信息
async function getOrderDetail(id) {
	await uni.$api.http
		.get(uni.$api.apiMember.orderView, {
			params: {
				id,
			},
		})
		.then((res) => {
			data.orderDetail = res.data;
		});
}

//更新分享
function updateShare() {
	//初始化公众号分享
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.wxHelper.wxShare(
			window.location.href,
			shopSetting.value.joinBuy_detail_share_title,
			data.joinBuyView.product_name,
			sharePath(),
			data.joinBuyView.product_picture
		);
	}
	// #endif
	//初始化小程序分享
	data.mpShare.title = shopSetting.value.joinBuy_detail_share_title;
	data.mpShare.path = sharePath();
	data.mpShare.imageUrl = data.joinBuyView.product_picture;

	//初始化APP分享
	data.shareData = {
		shareUrl: sharePath(),
		shareTitle: shopSetting.value.joinBuy_detail_share_title,
		shareContent: data.joinBuyView.product_name,
		shareImg: data.joinBuyView.product_picture || shopSetting.value.store_logo,
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
	url = `${uni.$api.routesConfig.joinBuyDetail.path}?id=${data.id}`;
	// #endif
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.joinBuyDetail.path}?id=${data.id}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + userInfo.value.promo_code;
		if (userInfo.value.store_id) {
			url = url + '&store_id=' + userInfo.value.store_id;
		}
	}
	return url;
}

// 去支付
function pay() {
	if (!userStore.hasLogin) {
		return false;
	}
	if (!data.joinBuyView.order) {
		return false;
	}
	if (data.joinBuyView.state > 1) {
		return false;
	}
	let order = data.joinBuyView.user_order;

	if (parseInt(order.pay_status) === 0 && parseInt(userInfo.value.id) === parseInt(order.member_id)) {
		uni.$api.router.redirectTo({
			route: uni.$api.routesConfig.pay,
			query: {
				id: order.id,
			},
		});
	}
}
//获取拼团产品列表
async function getJoinBuyList() {
	if (data.loading) {
		return;
	}
	data.loading = true;
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.joinBuyProductIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then(async (res) => {
			data.loading = false;
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.joinBuyList = [...data.joinBuyList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loading = false;
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}
// 跳转拼团商品
function gotoProduct(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.joinBuyProduct,
		query: {
			id: id,
		},
	});
}
// 回到用户中心
function toProfile() {
	uni.$api.router.switchTab({
		route: uni.$api.routesConfig.profile,
	});
}
//拼团倒计时结束
function joinBuyEnd(e) {
	getJoinBuyView();
}
//拼团分享
async function share(val) {
	let url = '';
	// #ifdef MP
	if (
		wechatMpLogin.value &&
		shopSetting.value.notify_miniprogram_sub &&
		(shopSetting.value.notify_miniprogram_sub.order_joinBuy_success || shopSetting.value.notify_miniprogram_sub.order_joinBuy_fail)
	) {
		let tmplIds = [];
		// 拼团成功
		shopSetting.value.notify_miniprogram_sub.order_joinBuy_success && tmplIds.push(shopSetting.value.notify_miniprogram_sub.order_joinBuy_success);
		// 拼团失败
		shopSetting.value.notify_miniprogram_sub.order_joinBuy_fail && tmplIds.push(shopSetting.value.notify_miniprogram_sub.order_joinBuy_fail);
		wx.requestSubscribeMessage({
			tmplIds: tmplIds,
			success: (res) => {
				url = sharePath();
			},
			fail(err) {
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
			uni.$api.toast(uni.$api.language.application.shareUrlCopySuccess);
		}
	}

	// #endif
	// #ifdef APP-PLUS
	data.appShareShow = true;
	// #endif
}
// 加入拼团
function submit(val) {
	const params = {};
	const _data = {};
	_data.sku_id = val.sku_id;
	_data.num = 1;
	params.type = 'join_buy';
	params.join_buy_product_id = data.joinBuyView.joinBuyProduct.id;
	params.data = JSON.stringify(_data);
	params.join_buy_id = data.joinBuyView.id;
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
}

const { joinBuyView, orderDetail, joinBuyList, loadingStatus, pageLoadingShow, pageLoadingStatus, appShareShow, shareData } = { ...toRefs(data) };
</script>

<style lang="scss">
.marketing-list {
	padding: 20rpx 20rpx 0;
	.item {
		display: flex;
		padding: 20rpx;
		background-color: #ffffff;
		overflow: hidden;
		margin-bottom: 20rpx;
		border-radius: 20rpx;
		.img {
			width: 180rpx;
			height: 180rpx;
			flex-shrink: 0;
			border-radius: 15rpx;
			background-color: $dz-bg-color;
		}
		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			margin-left: 20rpx;
			.title {
				font-size: 28rpx;
				color: $dz-main-color;
			}
			.text {
				font-size: 24rpx;
				color: $dz-tips-color;
			}
			.price-box {
				display: flex;
				align-items: flex-end;
				justify-content: space-between;
				.price {
					display: flex;
					align-items: flex-end;
					text:first-child {
						font-size: 22rpx;
					}
					text:last-child {
						font-size: 32rpx;
					}
					.price-tip {
						margin-left: 10rpx;
						font-size: 24rpx;
						color: $dz-tips-color;
					}
				}
				.group {
					padding: 10rpx 20rpx;
				}
			}
		}
	}
}
.group-box {
	margin: 20rpx;
	background-color: #ffffff;
	text-align: center;
	padding: 30rpx 0 40rpx;
	border-radius: 20rpx;
	.group-title {
		font-size: 36rpx;
		color: $dz-tips-color;
	}
	.group-name {
		display: flex;
		justify-content: center;
		padding: 80rpx 0;
		.img {
			width: 90rpx;
			height: 90rpx;
			margin-right: 20rpx;
			position: relative;
			image {
				width: 90rpx;
				height: 90rpx;
				border-radius: 50%;
				overflow: hidden;
				border-width: 1rpx;
				border-style: solid;
			}
			view {
				position: absolute;
				left: 45rpx;
				bottom: 10rpx;
				transform: translate(-28rpx, 30rpx);
				width: 60rpx;
				height: 36rpx;
				font-size: 22rpx;
				border-radius: 20rpx;
			}
		}
	}
	.scale-1 {
		animation: scaleBtn 0.9s infinite;
	}
	@keyframes scaleBtn {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(0.93);
		}

		100% {
			transform: scale(1);
		}
	}
}
.address {
	display: flex;
	align-items: center;
	padding: 20rpx;
	margin: 20rpx;
	border-radius: 20rpx;
	background-color: #fff;
	.dzicon-round_location_fill {
		font-size: 72rpx;
		margin-right: 20rpx;
	}
	.title {
		font-size: 32rpx;
		color: $dz-main-color;
		line-height: 54rpx;
	}
	.address-tip {
		margin: 6rpx 0;
		font-size: 28rpx;
		color: $dz-tips-color;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
}
.cell-box {
	margin: 20rpx;
	padding: 10rpx 0;
	background-color: #ffffff;
	border-radius: 20rpx;
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
		border-radius: 15rpx;
		overflow: hidden;
		image {
			width: 342rpx;
			height: 342rpx;
		}
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
		.price-price {
			font-size: 24rpx;
			color: $dz-main-color;
		}
		.price-tip {
			font-size: 24rpx;
			color: $dz-tips-color;
			text-decoration: line-through;
			margin-left: 10rpx;
		}
		.product-info {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			height: 160rpx;
		}
	}
}
</style>

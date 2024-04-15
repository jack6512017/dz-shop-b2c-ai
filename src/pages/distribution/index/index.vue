<template>
	<view v-if="memberInfo">
		<dz-navbar-immersive
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar title="推广中心"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			title="推广中心"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
			:border-bottom="false"
			:background="{ background: theme.dzBaseColor }"
		></dz-navbar>
		<view class="header" :style="{ background: `linear-gradient(180deg,${theme.dzBaseColor} 60%,${api.theme.dzBgColor})100%` }">
			<view class="left">
				<view class="img"
					><dz-avatar :src="memberInfo.head_portrait || missingFace" size="large" :isBorder="true" :borderColor="'rgba(255,255,255,0.6)'"></dz-avatar
				></view>
				<view class="dz-text-left">
					<view class="dz-font-36 dz-font-weight dz-line-1" style="max-width: 480rpx">
						{{ memberInfo.nickname || memberInfo.realname || language.distribution.noName }}
					</view>
					<view class="dz-font-24 dz-m-t-6">
						ID: {{ memberInfo.id }}
						<dz-icon class="dz-m-l-6 dz-font-24" name="copy-line" @click="copy(memberInfo.id)"></dz-icon>
					</view>
					<view v-if="recordType === 'fission'" class="dz-font-24 dz-m-t-6">
						是否分销商:
						{{
							memberInfo && memberInfo.promoterFission && memberInfo.promoterFission.state == 1 && memberInfo.promoterFission.status == 1
								? '是'
								: '否'
						}}
					</view>
					<view v-else class="dz-font-24 dz-m-t-6">
						等级:
						{{
							(memberInfo && memberInfo.promoterStore && memberInfo.promoterStore.storeLevel && memberInfo.promoterStore.storeLevel.name) || '--'
						}}
					</view>
				</view>
			</view>
			<view class="dz-m-r-30" @tap="toPage('distributionQrcode')"><dz-icon name="qrcode" size="60"></dz-icon></view>
		</view>
		<view class="data">
			<view class="item">
				<view class="sum">{{ memberInfo.promoter ? memberInfo.promoter.accumulate_brokerage : '0.00' }}</view>
				<view class="text">累计收益</view>
			</view>
			<view class="item">
				<view class="sum">{{ memberInfo.promoter ? memberInfo.promoter.user_brokerage : '0.00' }}</view>
				<view class="text">当前收益</view>
			</view>
			<view class="item">
				<view class="sum">{{ memberInfo.promoter ? memberInfo.promoter.frozen_brokerage : '0.00' }}</view>
				<view class="text">待结算货款</view>
			</view>
			<view class="item">
				<view class="sum">{{ memberInfo.sale_stock || 0 }}</view>
				<view class="text">销货笔数</view>
			</view>
		</view>
		<view class="card-box">
			<view class="card-item">
				<dz-cell-item
					title="经销管理"
					:arrow="false"
					:border-bottom="false"
					:title-style="{
						'font-size': '30rpx',
						color: theme.dzMainColor,
						'font-weight': '700',
					}"
					hover-class="none"
				></dz-cell-item>
				<dz-grid :border="false" col="4">
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('distributionChild', recordType)">
						<view class="icon-bg">
							<view><dz-icon name="friend" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">我的团队</text>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('distributionPromoterRecord')">
						<view class="icon-bg">
							<view><dz-icon name="share" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">直推订单</text>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('distributionPromoterRecord', 'group')">
						<view class="icon-bg">
							<view><dz-icon name="baby" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">团队订单</text>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('distributionPoster', 'store')">
						<view class="icon-bg">
							<view><dz-icon name="pic" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">分销海报</text>
					</dz-grid-item>
				</dz-grid>
			</view>

			<!-- 佣金 -->
			<view class="card-item">
				<dz-cell-item
					title="佣金"
					:arrow="false"
					:border-bottom="false"
					:title-style="{
						'font-size': '30rpx',
						color: theme.dzMainColor,
						'font-weight': '700',
					}"
					hover-class="none"
				></dz-cell-item>
				<dz-grid :border="false" col="4">
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toBrokerage">
						<view class="icon-bg">
							<view><dz-icon name="moneybag" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">{{ api.formatString(language.distribution.myCommission, shopSetting.commission_front_name) }}</text>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('brokerageLog')">
						<view class="icon-bg">
							<view><dz-icon name="edit" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">{{
							api.formatString(language.distribution.theCommissionSubsidiary, shopSetting.commission_front_name)
						}}</text>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toWithdraw">
						<view class="icon-bg">
							<view><dz-icon name="sponsor" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">我要提现</text>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="withdrawAccountClick">
						<view class="icon-bg">
							<view><dz-icon name="vipcard" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">提现账号</text>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('brokerageIndex')">
						<view class="icon-bg">
							<view><dz-icon name="tixianjilu" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">提现记录</text>
					</dz-grid-item>
					<dz-grid-item v-if="shopSetting.brokerage_transfer_is_open == 1" customStyle="padding-bottom: 15px" @tap="toPage('brokerageTransfer')">
						<view class="icon-bg">
							<view><dz-icon name="round_transfer" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">{{ shopSetting.commission_front_name }}转赠</text>
					</dz-grid-item>
					<dz-grid-item v-if="shopSetting.brokerage_transfer_is_open == 1" customStyle="padding-bottom: 15px" @tap="toPage('brokerageTransferLog')">
						<view class="icon-bg">
							<view><dz-icon name="time" size="55" color="#000"></dz-icon></view>
						</view>
						<text class="grid-item-text">转赠记录</text>
					</dz-grid-item>
				</dz-grid>
			</view>
		</view>
		<!-- 云账户签约 -->
		<dz-popup v-model:show="yunzhanghuShow" mode="center" width="90%" :closeable="true" closeIcon="close" border-radius="20">
			<view class="dz-text-center dz-font-32 dz-font-weight dz-p-t-30 dz-m-b-20">用户签约</view>
			<view class="member-type">
				<view class="card dz-m-r-30" @tap="handleSign(1)"> 中国人 </view>
				<view class="card" @tap="handleSign(2)">
					外籍人
					<text v-if="yunzhanghu_member_exempted" class="dz-font-24" :style="{ color: stateColorFilters(yunzhanghu_member_exempted.state) }"
						>({{ stateFilters(yunzhanghu_member_exempted.state) }})</text
					>
				</view>
			</view>
		</dz-popup>
		<!-- 新国都签约 -->
		<dz-modal
			v-model:show="yunhuotecShow"
			content="系统检查到您未签约，请签约后在重试"
			:show-cancel-button="true"
			@confirm="yunhuotecConfirm"
			:confirm-color="theme.dzBaseColor"
		></dz-modal>
		<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
		<dz-title v-if="guessYouLikeList.length" class="dz-m-t-20" title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
		<dz-product-list :list="guessYouLikeList" :marginTop="20" :marginLeftRight="20" :marginBottom="20"></dz-product-list>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPageScroll, onReachBottom, onPullDownRefresh, onUnload } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const data = reactive({
	recordType: null,
	scrollTop: 0,
	opacity: 0,
	loadingShow: true,
	pageLoadingStatus: 'loading',
	withdrawConfig: null,
	loadingStatus: 'loading',
	yunzhanghu_member_exempted: null,
	yunzhanghu_member: null,
	yunzhanghuShow: false,
	yunhuotec_member: null,
	yunhuotecShow: false,
	page: 1,
	guessYouLikeList: [],
	memberInfo: null,
});

const userStore = useUserStore();

onLoad(async (options) => {
	await uni.$onLaunched;
	data.recordType = options.type;
	uni.setNavigationBarTitle({
		title: '经销商中心',
	});
	uni.$on('memberChange', () => {
		getMemberIndex();
	});
	getMemberIndex();
	uni.$on('yunzhanghuMemberChange', () => {
		getWithdrawConfig();
	});
});

onPageScroll((e) => {
	data.scrollTop = e.scrollTop;
});

onPullDownRefresh(() => {
	data.loadingShow = true;
	data.guessYouLikeList = [];
	data.page = 1;
	getMemberIndex();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getGuessYouLikeList();
});

onUnload(() => {
	uni.$off(['memberChange', 'yunzhanghuMemberChange']);
});

const navbarStyle = computed(() => {
	let style = {};
	style.opacity = data.opacity;
	return style;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const wechatMpLogin = computed(() => {
	return userStore.getWechatMpLogin;
});

const isYunhuotec = computed(() => {
	return data.yunhuotec_member ? true : false;
});

function loadingClick() {
	getMemberIndex();
}
function opacityChange(e) {
	data.opacity = e.opacity;
}

function getMemberIndex() {
	uni.$api.http
		.get(uni.$api.apiShop.distributionMemberIndex)
		.then((res) => {
			data.loadingShow = false;
			data.memberInfo = res.data;
		})
		.catch((err) => {
			data.pageLoadingStatus = 'error';
			return;
		});
	getGuessYouLikeList();
}
async function getGuessYouLikeList() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.guessYouLikeList = [...data.guessYouLikeList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch((err) => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

function toBrokerage() {
	// #ifdef MP
	if (wechatMpLogin.value && shopSetting.value.notify_miniprogram_sub && shopSetting.value.notify_miniprogram_sub.promoter_brokerage_change) {
		wx.requestSubscribeMessage({
			tmplIds: [
				shopSetting.value.notify_miniprogram_sub.promoter_brokerage_change, //   账户余额变动通知
			],
			success: (res) => {
				uni.$api.router.push({
					route: uni.$api.routesConfig.brokerage,
				});
			},
			fail(err) {
				uni.$api.router.push({
					route: uni.$api.routesConfig.brokerage,
				});
			},
		});
	} else {
		uni.$api.router.push({
			route: uni.$api.routesConfig.brokerage,
		});
	}
	// #endif
	// #ifndef MP
	uni.$api.router.push({
		route: uni.$api.routesConfig.brokerage,
	});
	// #endif
}

function toWithdraw() {
	// #ifdef MP
	if (wechatMpLogin.value && shopSetting.value.notify_miniprogram_sub && shopSetting.value.notify_miniprogram_sub.promoter_brokerage_withdraw) {
		wx.requestSubscribeMessage({
			tmplIds: [
				shopSetting.value.notify_miniprogram_sub.promoter_brokerage_withdraw, //   佣金提现审核通知
			],
			success: (res) => {
				withdrawClick();
			},
			fail(err) {
				withdrawClick();
			},
		});
	} else {
		withdrawClick();
	}
	// #endif
	// #ifndef MP
	withdrawClick();
	// #endif
}

//提现申请
async function withdrawClick() {
	if (!data.withdrawConfig) {
		uni.showLoading({
			mask: true,
		});
		let loaded = await getWithdrawConfig();
		uni.hideLoading();
		// 加载配置失败
		if (!data.withdrawConfig) {
			uni.$api.toast(language.profile.failedToLoadConfiguration);
			return;
		}
	}
	if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 0) {
		//普通提现账号
		toPage('brokerageCreate');
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 1) {
		if (isYunzhanghu()) {
			toPage('brokerageCreate', 'yunzhanghu');
		} else {
			data.yunzhanghuShow = true;
		}
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 2) {
		if (isYunhuotec.value) {
			toPage('brokerageCreate', 'yunhuotec');
		} else {
			data.yunhuotecShow = true;
		}
	}
}

//提现账号
async function withdrawAccountClick() {
	if (!data.withdrawConfig) {
		uni.showLoading({
			mask: true,
		});
		let loaded = await getWithdrawConfig();
		uni.hideLoading();
		if (!data.withdrawConfig) {
			uni.$api.toast(language.profile.failedToLoadConfiguration);
			return;
		}
	}
	if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 0) {
		//通商云提现账号
		toPage('bankAccount');
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 1) {
		if (isYunzhanghu()) {
			toPage('yunzhanghuMemberCard');
		} else {
			data.yunzhanghuShow = true;
		}
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 2) {
		if (!isYunhuotec.value) {
			toPage('yunhuotecMemberCard');
		} else {
			data.yunhuotecShow = true;
		}
	}
}

//获取提现配置
async function getWithdrawConfig() {
	await uni.$api.http
		.get(uni.$api.apiMember.brokerageWithdrawConfig)
		.then((res) => {
			data.withdrawConfig = res.data;
			data.yunzhanghu_member_exempted = res.data.yunzhanghu_member_exempted;
			data.yunzhanghu_member = res.data.yunzhanghu_member;
			data.yunhuotec_member = res.data.yunhuotec_member;
			return true;
		})
		.catch((err) => {
			return false;
		});
}

function isYunzhanghu(): boolean {
	let state = false;
	if (data.yunzhanghu_member && (data.yunzhanghu_member.is_sign == 1 || data.yunzhanghu_member.is_exempted == 1)) {
		state = true;
	}
	return state;
}

function handleSign(e: number) {
	if (e == 2) {
		toPage('yunzhanghuMemberExempted');
	} else {
		toPage('yunzhanghuMemberSign');
	}
	data.yunzhanghuShow = false;
}

function yunhuotecConfirm() {
	toPage('yunhuotecMemberSign');
	data.yunhuotecShow = false;
}

function toPage(url: string, type?: string) {
	if (url == 'brokerageTransfer' && !data.memberInfo.pay_password_hash) {
		url = 'setPayPassword';
	}
	const params = {};
	if (type) {
		params.type = type;
	}
	if (url == 'distributionPromoterRecord') {
		params.recordType = data.recordType;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: params,
	});
}

// 复制
function copy(val: number) {
	uni.$api.copy(val);
	uni.$api.toast('已复制到剪贴板');
}

function stateFilters(val: number | string): string {
	switch (parseInt(val)) {
		case 0:
			return '待审核';
		case -1:
			return '已拒绝';
		case 1:
			return '已通过';
	}
}

function stateColorFilters(val: number | string): string {
	switch (parseInt(val)) {
		case 0:
			return '#ff9900';
		case -1:
			return '#fa3534';
		case 1:
			return '#19be6b';
	}
}

const {
	scrollTop,
	recordType,
	memberInfo,
	loadingShow,
	loadingStatus,
	pageLoadingStatus,
	guessYouLikeList,
	yunzhanghuShow,
	yunzhanghu_member_exempted,
	yunhuotecShow,
} = {
	...toRefs(data),
};
</script>

<style lang="scss" scoped>
.header {
	display: flex;
	justify-content: space-between;
	height: 320rpx;
	padding: 30rpx 20rpx;
	color: #fff;

	.left {
		display: flex;

		.img {
			flex-shrink: 0;
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			margin-right: 20rpx;
			overflow: hidden;
		}
	}
}

.data {
	display: flex;
	background: #fff;
	margin: 24rpx;
	border-radius: 20rpx;
	margin-top: -110rpx;

	.item {
		flex: 1;
		text-align: center;
		padding: 30rpx 0;
		font-size: 26rpx;

		view {
			line-height: 40rpx;
		}
	}
}

.card-box {
	margin: 24rpx;

	.card-item {
		background-color: #ffffff;
		margin-top: 24rpx;
		border-radius: 20rpx;
		overflow: hidden;
	}
}

.icon-bg {
	display: flex;
	justify-content: center;
	align-items: center;

	margin-bottom: 10rpx;

	border-radius: 40rpx;
}

.grid-item-text {
	display: block;
	text-align: center;
	font-size: 24rpx;
}

// 云账户
.member-type {
	display: flex;
	padding: 40rpx;
	.card {
		flex: 1;
		padding: 30rpx;
		border-radius: 15rpx;
		text-align: center;
		background: #f3f4f6;
	}
}
</style>

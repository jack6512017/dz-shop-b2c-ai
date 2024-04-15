<template>
	<view>
		<dz-navbar-immersive
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar title="经销商中心"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			title="经销商中心"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
			:border-bottom="false"
			:background="{ background: theme.dzBaseColor }"
		></dz-navbar>
		<view class="header" :style="{ background: theme.dzBaseColor }">
			<view class="left">
				<view class="img"
					><dz-avatar :src="memberInfo.head_portrait || missingFace" size="large" :isBorder="true" :borderColor="'rgba(255,255,255,0.6)'"></dz-avatar
				></view>
				<view class="user-info">
					<view class="dz-font-30 dz-font-weight dz-line-1" style="max-width: 480rpx">
						{{ memberInfo.nickname || memberInfo.realname || language.distribution.noName }}
					</view>
					<view class="dz-m-t-2">
						ID: {{ memberInfo.id }}
						<dz-icon class="dz-m-l-6" name="copy-line" @click="copy(memberInfo.id)"></dz-icon>
					</view>
					<view>
						经销商等级:
						{{
							(memberInfo.promoter &&
								memberInfo.promoter.promoterWarehouse &&
								memberInfo.promoter.promoterWarehouse.warehouseLevelSingle &&
								memberInfo.promoter.promoterWarehouse.warehouseLevelSingle.name) ||
							'--'
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
					:title-style="{ 'font-size': '32rpx', color: theme.dzMainColor, 'font-weight': '700' }"
					hover-class="none"
				></dz-cell-item>
				<dz-grid :border="false" col="4">
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('warehouseStockLog')">
						<view class="grid-item">
							<view class="icon-bg" :style="{ background: api.colorToRgba(theme.dzBaseDisabled) }">
								<view><dz-icon name="order-record" size="55" :color="theme.dzBaseColor"></dz-icon></view>
							</view>
							<text class="grid-item-text">库存记录</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('distributionChild', 'warehouse')">
						<view class="grid-item">
							<view class="icon-bg" :style="{ background: api.colorToRgba(theme.dzBaseDisabled) }">
								<view><dz-icon name="share" size="55" :color="theme.dzBaseColor"></dz-icon></view>
							</view>
							<text class="grid-item-text">商家人脉</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('warehouseProduct')">
						<view class="grid-item">
							<view class="icon-bg" :style="{ background: api.colorToRgba(theme.dzBaseDisabled) }">
								<view><dz-icon name="baby" size="55" :color="theme.dzBaseColor"></dz-icon></view>
							</view>
							<text class="grid-item-text">库存管理</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('distributionPoster', 'cloud')">
						<view class="grid-item">
							<view class="icon-bg" :style="{ background: api.colorToRgba(theme.dzBaseDisabled) }">
								<view><dz-icon name="pic" size="55" :color="theme.dzBaseColor"></dz-icon></view>
							</view>
							<text class="grid-item-text">经销海报</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('warehouseRanking')">
						<view class="grid-item">
							<view class="icon-bg" :style="{ background: api.colorToRgba(theme.dzBaseDisabled) }">
								<view><dz-icon name="upstage" size="55" :color="theme.dzBaseColor"></dz-icon></view>
							</view>
							<text class="grid-item-text">排行榜</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('warehouseLevelLog')">
						<view class="grid-item">
							<view class="icon-bg" :style="{ background: api.colorToRgba(theme.dzBaseDisabled) }">
								<view><dz-icon name="time" size="55" :color="theme.dzBaseColor"></dz-icon></view>
							</view>
							<text class="grid-item-text">升级日志</text>
						</view>
					</dz-grid-item>
				</dz-grid>
			</view>
			<!-- 财务管理 -->
			<view class="card-item">
				<dz-cell-item
					title="财务管理"
					:arrow="false"
					:border-bottom="false"
					:title-style="{ 'font-size': '32rpx', color: theme.dzMainColor, 'font-weight': '700' }"
					hover-class="none"
				></dz-cell-item>
				<dz-grid :border="false" col="4">
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toWarehousePromoterRecord">
						<view class="grid-item">
							<view class="icon-bg">
								<view><dz-icon name="moneybag" size="55" color="#999"></dz-icon></view>
							</view>
							<text class="grid-item-text">货款收益</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('brokerageLog', 'cloud')">
						<view class="grid-item">
							<view class="icon-bg">
								<view><dz-icon name="edit" size="55" color="#999"></dz-icon></view>
							</view>
							<text class="grid-item-text">收益日志</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="withdrawAccountClick">
						<view class="grid-item">
							<view class="icon-bg">
								<view><dz-icon name="vipcard" size="55" color="#999"></dz-icon></view>
							</view>
							<text class="grid-item-text">提现账号</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toWithdraw">
						<view class="grid-item">
							<view class="icon-bg">
								<view><dz-icon name="sponsor" size="55" color="#999"></dz-icon></view>
							</view>
							<text class="grid-item-text">我要提现</text>
						</view>
					</dz-grid-item>
					<dz-grid-item
						v-if="shopSetting.brokerage_transfer_is_open == 1"
						customStyle="padding-bottom: 15px"
						@tap="toPage('brokerageTransfer', 'cloud')"
					>
						<view class="grid-item">
							<view class="icon-bg">
								<view><dz-icon name="round_transfer" size="55" color="#999"></dz-icon></view>
							</view>
							<text class="grid-item-text">货款转赠</text>
						</view>
					</dz-grid-item>
					<dz-grid-item customStyle="padding-bottom: 15px" @tap="toPage('brokerageIndex')">
						<view class="grid-item">
							<view class="icon-bg">
								<view><dz-icon name="tixianjilu" size="55" color="#999"></dz-icon></view>
							</view>
							<text class="grid-item-text">提现记录</text>
						</view>
					</dz-grid-item>
					<dz-grid-item
						v-if="shopSetting.brokerage_transfer_is_open == 1"
						customStyle="padding-bottom: 15px"
						@tap="toPage('brokerageTransferLog', 'cloud')"
					>
						<view class="grid-item">
							<view class="icon-bg">
								<view><dz-icon name="newshot" size="55" color="#999"></dz-icon></view>
							</view>
							<text class="grid-item-text">转赠记录</text>
						</view>
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
		<dz-modal
			v-model:show="yunhuotecShow"
			content="系统检查到您未签约，请签约后在重试"
			:show-cancel-button="true"
			@confirm="yunhuotecConfirm"
			:confirm-color="theme.dzBaseColor"
		></dz-modal>
		<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
		<dz-title v-if="guessYouLikeList.length" class="dz-m-t-20" title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
		<dz-product-list class="dz-m-20" :list="guessYouLikeList"></dz-product-list>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="20"></dz-loadmore>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPageScroll, onReachBottom, onPullDownRefresh, onUnload } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const data = reactive({
	scrollTop: 0,
	opacity: 0,
	memberInfo: {
		promoter: {
			is_regional_agent: 0,
			regional_agent_level: 0,
		},
	},

	loadingShow: true,
	pageLoadingStatus: 'loading',
	withdrawConfig: null,
	postPath: '',
	postShow: false,
	loadingStatus: 'loading',
	yunzhanghu_member_exempted: null,
	yunzhanghu_member: null,
	yunzhanghuShow: false,
	yunhuotec_member: null,
	yunhuotecShow: false,
	page: 1,
	guessYouLikeList: [],
});

const userStore = useUserStore();

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

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '经销商中心',
	});
	uni.$on('memberChange', (data) => {
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
	data.memberInfo = {};
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

function loadingClick() {
	getMemberIndex();
}

function opacityChange(e) {
	data.opacity = e.opacity;
}

function getMemberIndex() {
	uni.$api.http
		.get(uni.$api.apiMember.warehouseIndex)
		.then((res) => {
			data.loadingShow = false;
			data.memberInfo = res.data;
		})
		.catch(() => {
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

function toWithdraw() {
	// #ifdef MP
	if (wechatMpLogin.value && shopSetting.value.notify_miniprogram_sub && shopSetting.value.notify_miniprogram_sub.promoter_brokerage_withdraw) {
		wx.requestSubscribeMessage({
			tmplIds: [
				shopSetting.value.notify_miniprogram_sub.promoter_brokerage_withdraw, //   账户余额变动通知
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
		await getWithdrawConfig();
		uni.hideLoading();
		// 加载配置失败
		if (!data.withdrawConfig) {
			uni.$api.toast(uni.$api.language.profile.failedToLoadConfiguration);
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
		await getWithdrawConfig();
		uni.hideLoading();
		if (!data.withdrawConfig) {
			uni.$api.toast(uni.$api.language.profile.failedToLoadConfiguration);
			return;
		}
	}
	if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 0) {
		//普通提现账号
		toPage('bankAccount');
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 1) {
		if (isYunzhanghu()) {
			toPage('yunzhanghuMemberCard');
		} else {
			data.yunzhanghuShow = true;
		}
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 2) {
		if (isYunhuotec.value) {
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

function toWarehousePromoterRecord() {
	// #ifdef MP
	if (wechatMpLogin.value && shopSetting.value.notify_miniprogram_sub && shopSetting.value.notify_miniprogram_sub.promoter_brokerage_change) {
		wx.requestSubscribeMessage({
			tmplIds: [
				shopSetting.value.notify_miniprogram_sub.promoter_brokerage_change, //   账户余额变动通知
			],
			success: (res) => {
				uni.$api.router.push({
					route: uni.$api.routesConfig.warehousePromoterRecord,
				});
			},
			fail(err) {
				uni.$api.router.push({
					route: uni.$api.routesConfig.warehousePromoterRecord,
				});
			},
		});
	} else {
		uni.$api.router.push({
			route: uni.$api.routesConfig.warehousePromoterRecord,
		});
	}
	// #endif
	// #ifndef MP
	uni.$api.router.push({
		route: uni.$api.routesConfig.warehousePromoterRecord,
	});
	// #endif
}

function toPage(url, type) {
	if (url == 'brokerageTransfer' && !data.memberInfo.pay_password_hash) {
		url = 'setPayPassword';
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			type,
		},
	});
}

// 复制
function copy(val) {
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

const { scrollTop, memberInfo, guessYouLikeList, loadingShow, pageLoadingStatus, loadingStatus, yunzhanghuShow, yunzhanghu_member_exempted, yunhuotecShow } = {
	...toRefs(data),
};
</script>

<style lang="scss" scoped>
.header {
	display: flex;
	justify-content: space-between;
	height: 260rpx;
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
	margin-top: -60rpx;
	.item {
		flex: 1;
		text-align: center;
		padding: 28rpx 0;
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

.grid-item {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.icon-bg {
	display: flex;
	justify-content: center;
	align-items: center;

	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;

	background: #f7f7f7;
}

.grid-item-text {
	margin-top: 10rpx;
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

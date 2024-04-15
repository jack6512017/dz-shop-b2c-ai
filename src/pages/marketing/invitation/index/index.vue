<template>
	<view class="container" :style="{ background: invitationData.page_background_color || '' }">
		<image class="register-bg" :src="invitationData.page_background_picture" :style="{ width: '100%' }"></image>
		<view class="content" :style="{ background: invitationData.page_background_color || '' }">
			<view class="card">
				<view class="title" :style="{ color: theme.dzBaseColor }">
					<dz-icon name="all" size="32"></dz-icon>
					<text class="dz-p-10 dz-font-32">邀请好友奖励</text>
					<dz-icon name="all" size="32"></dz-icon>
				</view>
				<dz-row gutter="32" justify="center">
					<dz-col v-if="parseInt(invitationData.invitee_coupon_id)" :span="4">
						<view class="card-item">
							<view class="card-content">
								<dz-image :src="couponPic" width="50" height="50"></dz-image>
								<view class="text"><text>专享优惠劵x1</text></view>
							</view>
						</view>
					</dz-col>
					<dz-col v-if="parseInt(invitationData.invitee_money)" :span="4">
						<view class="card-item">
							<view class="card-content">
								<dz-image :src="moneyPic" width="50" height="50"></dz-image>
								<view class="text">
									<text>{{ invitationData.invitee_money }}元</text>
								</view>
							</view>
						</view>
					</dz-col>
					<dz-col v-if="parseInt(invitationData.invitee_integral)" :span="4">
						<view class="card-item">
							<view class="card-content">
								<dz-image :src="integralPic" width="50" height="50"></dz-image>
								<view class="text">
									<text>{{ invitationData.invitee_integral }}壮粉</text>
								</view>
							</view>
						</view>
					</dz-col>
				</dz-row>
				<dz-button
					hover-class="none"
					shape="circle"
					:border="false"
					:custom-style="{ marginTop: '30rpx', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					@click="shareClick"
				>
					分享好友
				</dz-button>
				<dz-button
					hover-class="none"
					shape="circle"
					:custom-style="{ marginTop: '30rpx', background: 'transparent', color: theme.dzBaseColor, borderColor: theme.dzBaseColor }"
					@click="toPage"
				>
					生成海报分享
				</dz-button>
			</view>
			<view class="card dz-m-t-30 dz-m-b-40">
				<view class="title" :style="{ color: theme.dzBaseColor }">
					<dz-icon name="all" size="32"></dz-icon>
					<text class="dz-p-10 dz-font-32">
						您已邀请{{ parseInt(records.coupon_count) + parseInt(records.money_count) + parseInt(records.integral_count) }}位新用户成功获赠
					</text>
					<dz-icon name="all" size="32"></dz-icon>
				</view>
				<view v-if="parseInt(records.coupon_count)" class="dz-cell-item">
					<view class="dz-l">
						<dz-image :src="couponPic" width="40" height="40"></dz-image>
						<text class="dz-m-l-10">专享优惠劵</text>
					</view>
					<view class="dz-r">
						<text>x</text>
						<text class="dz-m-l-6">{{ records.coupon_count }}</text>
					</view>
				</view>
				<view v-if="parseInt(records.money_count)" class="dz-cell-item">
					<view class="dz-l">
						<dz-image :src="moneyPic" width="40" height="40"></dz-image>
						<text class="dz-m-l-10">{{ invitationData.invitee_money }}元现金好礼</text>
					</view>
					<view class="dz-r">
						<text>x</text>
						<text class="dz-m-l-6">{{ records.money_count }}</text>
					</view>
				</view>
				<view v-if="parseInt(records.integral_count)" class="dz-cell-item">
					<view class="dz-l">
						<dz-image :src="integralPic" width="40" height="40"></dz-image>
						<text class="dz-m-l-10">{{ invitationData.invitee_integral }}{{ shopSetting.point_front_name }}</text>
					</view>
					<view class="dz-r">
						<text>x</text>
						<text class="dz-m-l-6">{{ records.integral_count }}</text>
					</view>
				</view>
				<view v-if="!parseInt(records.coupon_count) && !parseInt(records.money_count) && !parseInt(records.integral_count)" class="tip">
					邀请获取奖励，快邀请好友一起分享吧
				</view>
			</view>
		</view>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
		<dz-app-share v-model:show="appShareShow" :isPoster="false" :config="shareData"></dz-app-share>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, toRefs } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const couponPic = uni.$api.assetsConfig.couponPic;
const integralPic = uni.$api.assetsConfig.integralPic;
const moneyPic = uni.$api.assetsConfig.moneyPic;

const data = reactive<object>({
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	invitationData: '',
	records: '',
	invitationId: '',
	shareData: {},
});
const mpShare = reactive({
	title: '', // 默认为小程序名称
	path: '', // 默认为当前页面路径
	imageUrl: '', // 默认为当前页面的截图
});
const appShareShow = ref<boolean>(false);
const userStore = useUserStore();
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
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
		title: '推荐有礼',
	});
	if (options.id) {
		data.invitationId = options.id;
		getInvitation();
	}
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

onShareAppMessage(() => {
	return mpShare;
});

// #ifdef MP-WEIXIN
onShareTimeline(() => {
	return mpShare;
});
// #endif

function pageLoadingClick() {
	data.pageLoadingStatus = 'loading';
	getInvitation();
}

function getInvitation() {
	data.pageLoadingShow = true;
	uni.$api.http
		.get(uni.$api.apiShop.invitationIndex, {
			params: {
				id: data.invitationId,
			},
		})
		.then((res) => {
			data.invitationData = res.data.invitation;
			data.records = res.data.records;
			data.pageLoadingShow = false;
			updateShare();
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

function toPage() {
	if (!data.invitationId) return;
	uni.$api.router.push({
		route: uni.$api.routesConfig.invitationPoster,
		query: {
			id: data.invitationId,
		},
	});
}

//分享路径
function sharePath() {
	let domain = uni.$api.appConfig.h5Domain;
	let url = '';
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	// #ifdef MP
	url = `${uni.$api.routesConfig.invitationIndex.path}?id=${data.invitationId}`;
	// #endif
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.invitationIndex.path}?id=${data.invitationId}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + userInfo.value.promo_code;
		if (userInfo.value.store_id) {
			url = url + '&store_id=' + userInfo.value.store_id;
		}
	}
	return url;
}

//更新分享
function updateShare() {
	//初始化公众号分享
	// #ifdef H5
	if (uni.$api.h5IsWechat()) {
		uni.$api.wxHelper.wxShare(
			window.location.href,
			data.invitationData.share_title,
			data.invitationData.share_description,
			sharePath(),
			data.invitationData.share_background_picture
		);
	}
	// #endif
	//初始化小程序分享
	mpShare.title = data.invitationData.title;
	mpShare.path = sharePath();
	mpShare.imageUrl = data.invitationData.share_background_picture;
	//初始化APP分享
	data.shareData = {
		shareUrl: sharePath(),
		shareTitle: data.invitationData.title,
		shareContent: data.invitationData.share_description,
		shareImg: data.invitationData.share_background_picture,
	};
}

function shareClick() {
	let url = data.shareData.shareUrl;
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.toast(uni.$api.language.application.wxshareTip);
	} else {
		if (url) {
			uni.$api.copy(url);
		}
		uni.$api.toast(url ? uni.$api.language.application.shareUrlCopySuccess : '复制失败');
	}
	// #endif
	// #ifdef APP-PLUS
	appShareShow.value = true;
	// #endif
}

const { invitationData, records, shareData, pageLoadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
page,
.container {
	height: 100%;
}
.register-bg {
	display: block;
}

.content {
	width: 100%;
	position: absolute;
	left: 0;
	padding: 0 40rpx;
}

.card {
	margin-top: 40rpx;
	padding: 30rpx;
	background: #fff;
	border-radius: 20rpx;
	.title {
		margin-bottom: 30rpx;
		text-align: center;
		font-weight: bold;
	}
	.card-item {
		padding: 8rpx;
		background: #fff5f5;
		border-radius: 20rpx;
	}
	.card-content {
		height: 158rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
		border: 4rpx solid #ffe0dd;
		border-radius: 20rpx;
		font-size: 24rpx;
		text-align: center;

		.text {
			height: 64rpx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-top: 10rpx;
			color: #ba4e4d;
			font-weight: bold;
		}
	}
	.dz-cell-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		color: #ba4e4d;
		.dz-l,
		.dz-r {
			display: flex;
			align-items: center;
		}
		.dz-r {
			font-weight: bold;
		}
	}
	.dz-cell-item:last-child {
		margin-bottom: 0;
	}
	.tip {
		text-align: center;
		color: #999;
	}
}
</style>

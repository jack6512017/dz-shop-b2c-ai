<template>
	<view>
		<block v-if="isWechatMpScene">
			<dz-mask :show="true" :zIndex="9998" @click="handleHide"></dz-mask>
			<view class="mp-scene">
				<view class="mp-weixin dz-flex dz-row-center"><dz-icon name="round_link_fill" color="#7A80FC" :size="70"></dz-icon></view>
				<view class="mp-tip dz-text-center">点击右下角</view>
				<img :src="guide" />
			</view>
		</block>
		<view v-else>
			<dz-product-detail
				:productData="data.productDetail"
				:customerService="customerService"
				:sessionFrom="sessionFrom"
				:shareData="data.shareData"
				:serviceType="serviceType"
				:isBuyMode="false"
				:scrollTop="scrollTop"
				:wxCustomerServicePath="wxCustomerServicePath"
			></dz-product-detail>
			<view class="dz-ios-p-safe-bottom"></view>
			<!-- 返回顶部 -->
			<dz-back-top
				:scrollTop="scrollTop"
				:customStyle="{ background: '#fff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)' }"
				:icon-style="{ fontSize: '36rpx' }"
			></dz-back-top>
			<!-- 页面加载 -->
			<dz-page-loading
				:show="pageLoadingShow"
				:showBack="true"
				:status="pageLoadingStatus"
				:errorText="errorText"
				@click="pageLoadingClick"
				@back="pageBackClick"
			></dz-page-loading>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { onLoad, onShow, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const productId = ref<string>();
const data = reactive({
	productDetail: {},
	shareData: {},
	mpShare: {
		title: '', // 默认为小程序名称
		path: '', // 默认为当前页面路径
		imageUrl: '', // 默认为当前页面的截图
	},
});
const scrollTop = ref<number>(0);
const customerService = ref<boolean>(false);
const sessionFrom = ref<string>('');
const wxCustomerServicePath = ref<string>('');
const pageLoadingShow = ref<boolean>(false);
const pageLoadingStatus = ref<string>('loading');
const errorText = ref<string>('您浏览的商品不存在~');
const isWechatMpScene = ref<boolean>(false);
const guide = uni.$api.assetsConfig.guide;

const wechatMpScene = computed(() => {
	return userStore.getWechatMpScene;
});
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});
const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const serviceType = ref<string>(shopSetting.value.app_service_type);

watch(
	() => userStore.hasLogin,
	() => {
		updateShare();
	}
);

onLoad(async (options) => {
	await uni.$onLaunched;
	if (wechatMpScene.value != 0 && wechatMpScene.value == 1154) {
		isWechatMpScene.value = true;
	}
	productId.value = options.id;
	pageLoadingStatus.value = 'loading';
	pageLoadingShow.value = true;
	serviceType.value = shopSetting.value.app_service_type;
	getProductDetail();
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
	//获取最新未读客服消息
	uni.$api.shop.getCustomerServiceUnread();
});

onPageScroll((e) => {
	scrollTop.value = e.scrollTop;
});

onShareAppMessage(() => {
	return data.mpShare;
});

// #ifdef MP-WEIXIN
onShareTimeline(() => {
	return data.mpShare;
});
// #endif

function pageLoadingClick() {
	pageLoadingStatus.value = 'loading';
	getProductDetail();
}

function handleHide() {
	isWechatMpScene.value = false;
}

//初始化客服
function initCustomerService() {
	let serviceType = parseInt(shopSetting.value.app_service_type);
	if (serviceType > 0) {
		if (userStore.hasLogin) {
			sessionFrom.value =
				'{"source":"' +
				data.productDetail.name +
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
			customerService.value = true;
			// #endif
		}
		if (serviceType === 3) {
			customerService.value = true;
		}
		if (serviceType === 4) {
			customerService.value = true;
		}
	}
}

async function getProductDetail() {
	await uni.$api.http
		.get(uni.$api.apiShop.productView, {
			params: {
				id: productId.value,
				marketing_type: 'limited_buy',
			},
		})
		.then((res) => {
			data.productDetail = res.data;
			uni.setNavigationBarTitle({ title: res.data.name });
			pageLoadingShow.value = false;
			//初始化客服
			initCustomerService();
			//分享
			updateShare();
			//初始化微信客服
			// #ifdef MP-WEIXIN
			wxCustomerServicePath.value = `${uni.$api.routesConfig.limitedProduct.path}.html?id=${productId.value}`;
			// #endif
		})
		.catch((err) => {
			pageLoadingShow.value = true;
			pageLoadingStatus.value = err.message == '找不到该产品' ? 'invalid' : 'error';
		});
}

//更新分享
function updateShare() {
	//初始化公众号分享
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.wxHelper.wxShare(
			window.location.href,
			shopSetting.value.limited_share_title,
			data.productDetail.name,
			sharePath(),
			data.productDetail.covers[0]
		);
	}
	// #endif
	//初始化小程序分享
	data.mpShare.title = shopSetting.value.limited_share_title;
	data.mpShare.path = sharePath();
	data.mpShare.imageUrl = data.productDetail.covers[0];
	//初始化APP分享
	data.shareData = {
		shareUrl: sharePath(),
		shareTitle: shopSetting.value.limited_share_title,
		shareContent: data.productDetail.name,
		shareImg: data.productDetail.covers[0],
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
	url = `${uni.$api.routesConfig.limitedProduct.path}?id=${productId.value}`;
	// #endif
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.limitedProduct.path}?id=${productId.value}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + userInfo.value.promo_code;
		if (userInfo.value.store_id) {
			url = url + '&store_id=' + userInfo.value.store_id;
		}
	}
	return url;
}

function pageBackClick() {
	let pages = getCurrentPages();
	if (pages.length == 1) {
		let indexPath = uni.$api.appConfig.indexPath;
		uni.reLaunch({
			url: indexPath,
		});
	} else {
		uni.navigateBack();
	}
}
</script>

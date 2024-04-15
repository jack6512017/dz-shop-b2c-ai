<template>
	<view>
		<!-- navbar -->
		<dz-navbar-immersive
			splitLine
			:isCustom="true"
			@init="initNavigation"
			@change="opacityChange"
			scrollRatio="0.3"
			:scrollTop="scrollTop"
			:title="barTitle"
			backgroundColor="#fff"
		>
			<view class="dz-navbar-inner" :style="[navbarInnerStyle]">
				<view class="dz-navbar-content-title" :style="[titleStyle]">
					<view class="dz-title dz-line-1">{{ barTitle }}</view>
				</view>
				<!-- #ifndef MP -->
				<view class="dz-navbar-right" v-if="userStore.hasLogin">
					<view class="message-box right-item" @tap="toPage('notifyIndex')">
						<dz-icon name="message" size="48" :color="isColor ? data.navbarIconColor.notifyColor : theme.dzMainColor"></dz-icon>
						<dz-badge
							:count="notifyUnRead"
							:offset="[-10, -10]"
							:color="data.navbarIconColor.badegColor"
							:bgColor="data.navbarIconColor.badegBgColor"
						></dz-badge>
					</view>
				</view>
				<!-- #endif -->
			</view>
		</dz-navbar-immersive>
		<!-- #ifndef MP -->
		<dz-navbar title="" immersive :isBack="false" :borderBottom="false" :background="{ background: 'transparent' }">
			<template #right>
				<view class="dz-navbar-right" v-if="userStore.hasLogin">
					<view class="message-box right-item" @tap="toPage('notifyIndex')">
						<dz-icon name="message" size="48" :color="isColor ? data.navbarIconColor.notifyColor : theme.dzMainColor"></dz-icon>
						<dz-badge
							:count="notifyUnRead"
							:offset="[-10, -10]"
							:color="data.navbarIconColor.badegColor"
							:bgColor="data.navbarIconColor.badegBgColor"
						></dz-badge>
					</view>
				</view>
			</template>
		</dz-navbar>
		<!-- #endif -->
		<view class="dz-relative">
			<view v-for="(item, index) in componentList" :key="index">
				<view v-if="item.component == 'dz-my-head'" ref="profileHead" :style="{ width: '100%', overflow: 'hidden' }">
					<my-head
						:config="item"
						:userInfo="userInfo"
						:hasLogin="userStore.hasLogin"
						:notifyUnRead="notifyUnRead"
						:isPromoterWarehouse="isPromoterWarehouse"
						:isPromoterStore="isPromoterStore"
						:signinToday="signinToday"
						:signinStatus="signinStatus"
						:isShowSignin="isShowSignin"
						@click="toPage"
					></my-head>
				</view>
				<!-- 统计菜单 -->
				<view v-if="item.component == 'dz-statistics-meun' && userStore.hasLogin" :style="{ marginTop: `-${parseInt(item.props.pushTop) * 2}rpx` }">
					<statistics-meun
						:config="item"
						:userInfo="userInfo"
						:shopSetting="shopSetting"
						:hasLogin="userStore.hasLogin"
						@click="toPage"
					></statistics-meun>
				</view>
				<!-- 我的订单 -->
				<view v-if="item.component == 'dz-my-order'" :style="{ marginTop: `-${parseInt(item.props.pushTop) * 2}rpx` }">
					<my-order :config="item" :userInfo="userInfo" :hasLogin="userStore.hasLogin"></my-order>
				</view>
				<!-- 卡片菜单 -->
				<view v-if="item.component == 'dz-card'" :style="{ marginTop: `-${parseInt(item.props.pushTop) * 2}rpx` }">
					<dz-card-menu
						:config="item"
						:customerServiceUnread="customerServiceUnread"
						:customerService="customerService"
						:serviceType="serviceType"
						:sessionFrom="sessionFrom"
						@click="linkJumpIndexTab(index, $event)"
						@cellClick="linkJumpTab"
					></dz-card-menu>
				</view>
				<!-- 分销 -->
				<view
					v-if="
						userStore.hasLogin &&
						item.component == 'dz-distribution' &&
						((isPromoterWarehouse && item.props.mode == 'warehouse') ||
							(isPromoterStore && item.props.mode == 'store') ||
							(isPromoterFission && item.props.mode == 'fission'))
					"
					:style="{ marginTop: `-${parseInt(item.props.pushTop) * 2}rpx` }"
				>
					<distribution
						:config="item"
						:userInfo="userInfo"
						:userPromoter="userPromoter"
						:estimateStat="estimateStat"
						:shopSetting="shopSetting"
						@click="toPage($event, item.props.mode)"
					>
					</distribution>
				</view>
				<!-- 我的足迹 -->
				<view v-if="item.component == 'dz-footprint' && userStore.hasLogin" :style="{ marginTop: `-${parseInt(item.props.pushTop) * 2}rpx` }">
					<footprint :config="item" :list="footPrintList" @click="toPage"></footprint>
				</view>
				<!-- 轮播图 -->
				<view v-if="item.component == 'dz-swiper'" :style="{ marginTop: `-${parseInt(item.props.pushTop) * 2}rpx` }">
					<view
						:style="{
							padding: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
								parseInt(item.props.marginBottom) * 2
							}rpx`,
						}"
					>
						<dz-swiper
							name="cover"
							:list="item.props.list"
							:border-radius="parseInt(item.props.borderRadius) * 2"
							:mode="item.props.mode"
							:height="parseInt(item.props.height) * 2"
							:indicator-pos="item.props.indicatorPos"
							:effect3d="item.props.effect3d == 1 ? true : false"
							:title="item.props.title == 1 ? true : false"
							:bgColor="item.props.bgColor"
							@click="linkJumpIndexTab(index, $event)"
						></dz-swiper>
					</view>
				</view>
				<!-- 广告 -->
				<view
					v-if="item.component == 'dz-banner'"
					class="dz-relative dz-banner"
					:style="{
						marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						padding: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
							parseInt(item.props.marginBottom) * 2
						}rpx`,
					}"
				>
					<view
						:style="{
							overflow: 'hidden',
							height: parseInt(item.props.height) * 2 + 'rpx',
						}"
					>
						<dz-image
							:src="item.props.cover"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:height="parseInt(item.props.height) * 2"
							@click="linkJumpTab(item.props.link)"
						></dz-image>
						<block v-for="(area, areaIndex) in item.props.area" :key="areaIndex">
							<view
								class="dz-absolute"
								:style="{
									boxSizing: 'border-box',
									width: parseInt(area.width) * 2 + 'rpx',
									height: parseInt(area.height) * 2 + 'rpx',
									top: parseInt(area.top) * 2 + 'rpx',
									left: parseInt(area.left) * 2 + 'rpx',
								}"
								@tap.stop="linkJumpTab(item.props.area[areaIndex].link)"
							>
								<dz-image v-if="area.cover" :src="area.cover" :width="parseInt(area.width) * 2" :height="parseInt(area.height) * 2"></dz-image>
							</view>
						</block>
					</view>
				</view>
				<!-- 标题 -->
				<view
					v-if="item.component == 'dz-title'"
					:style="{
						margin: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
							parseInt(item.props.marginBottom) * 2
						}rpx`,
					}"
				>
					<dz-title
						:title="item.props.title"
						:mode="item.props.mode"
						:bar-color="item.props.barColor"
						:bar-bokeh-color="item.props.barBokehColor"
						:nameLeft="item.props.coverLeft"
						:nameRight="item.props.coverRight"
						:font-size="parseInt(item.props.fontSize) * 2"
						:barWidth="parseInt(item.props.barWidth) * 2"
						:barHeight="parseInt(item.props.barHeight) * 2"
						:title-color="item.props.titleColor"
						:tip-config="item.props.tipConfig"
						:icon-width="parseInt(item.props.iconWidth) * 2"
						:icon-height="parseInt(item.props.iconHeight) * 2"
					></dz-title>
				</view>
				<!-- 悬浮按钮 -->
				<view v-if="item.component == 'dz-fab'">
					<dz-fab
						:mode="item.props.mode"
						:bottom="parseInt(item.props.bottom) * 2"
						:right="parseInt(item.props.right) * 2"
						:width="parseInt(item.props.width) * 2"
						:height="parseInt(item.props.height) * 2"
						:radius="parseInt(item.props.radius) * 2"
						:btnRadius="parseInt(item.props.btnRadius) * 2"
						:btnList="item.props.list"
						:bgColor="item.props.bgColor"
						:color="item.props.color"
						:maskClosable="false"
						@click="fabClick($event, index)"
					></dz-fab>
				</view>
				<!-- 商品列表 -->
				<view v-if="item.component == 'dz-product-list'">
					<block
						v-if="
							item.props.isLoading == 2 ||
							(item.props.isLoading == 1 && index == componentList.length - 1 && data.productConfig.loadingType == 'default')
						"
					></block>
					<block v-if="item.props.isList == 1 || item.props.isList == 2">
						<dz-product-list
							:list="index == componentList.length - 1 && item.props.isLoading == 1 ? productList : item.data"
							:isList="item.props.isList == 1 ? true : false"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:cart="item.props.cart"
							:market-price-show="item.props.marketPriceShow"
						></dz-product-list>
					</block>
					<block v-if="item.props.isList == 3">
						<dz-product-max
							:list="index == componentList.length - 1 && item.props.isLoading == 1 ? productList : item.data"
							:defaultList="item.props.list"
							:dataSource="item.props.dataSource"
							:radius="parseInt(item.props.radius) * 2"
							:left-right="parseInt(item.props.leftRight) * 2"
							:top-bottom="parseInt(item.props.topBottom) * 2"
							:max-height="parseInt(item.props.maxHeight ? item.props.maxHeight : 160) * 2"
							:cart="item.props.cart"
							:market-price-show="item.props.marketPriceShow"
						></dz-product-max>
					</block>
					<block v-if="item.props.isList == 4">
						<dz-product-three
							:list="index == componentList.length - 1 && item.props.isLoading == 1 ? productList : item.data"
							:defaultList="item.props.list"
							:dataSource="item.props.dataSource"
							:radius="parseInt(item.props.radius) * 2"
							:left-right="parseInt(item.props.leftRight) * 2"
							:top-bottom="parseInt(item.props.topBottom) * 2"
							:market-price-show="item.props.marketPriceShow"
							:clearance="parseInt(item.props.clearance) * 2"
						></dz-product-three>
					</block>
					<block v-if="item.props.isLoading == 1 && index == componentList.length - 1">
						<dz-empty v-if="loadingStatus == 'nodata'" margin-top="60" :src="empty" iconSize="360"></dz-empty>
						<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
					</block>
				</view>
				<view v-if="item.component == 'dz-gap'"><dz-gap :height="parseInt(item.props.height) * 2" :bg-color="item.props.bgColor"></dz-gap></view>
				<!-- 公告 -->
				<view
					v-if="item.component == 'dz-notice-bar' && noticeShow"
					:style="{
						marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						position: 'relative',
					}"
				>
					<dz-notice-bar
						:list="noticeListInfo(item.props.list)"
						:mode="item.props.mode"
						:bg-color="item.props.bgColor"
						duration="5000"
						:volumeIcon="item.props.volumeIcon"
						:moreIcon="item.props.rightType == 'arrowRight' ? true : false"
						:closeIcon="item.props.rightType == 'close' ? true : false"
						:title="item.props.title"
						:title-style="item.props.titleStyle"
						:cover="item.props.cover"
						:widthHeight="parseInt(item.props.coverSize) * 2"
						:leftIconColor="item.props.leftIconColor"
						:rightIconColor="item.props.rightIconColor"
						:color="item.props.color"
						:borderRadius="parseInt(item.props.borderRadius) * 2"
						:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
						:margin-top="parseInt(item.props.marginTop) * 2"
						:margin-bottom="parseInt(item.props.marginBottom) * 2"
						@click="noticeItmeClick(index, $event)"
						@getMore="noticeClick"
						@close="closeClick"
					></dz-notice-bar>
				</view>

				<view
					v-if="item.component == 'dz-cell'"
					:style="{
						marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						position: 'relative',
					}"
					><dz-cell :config="item" @click="linkJumpTab"
				/></view>
			</view>

			<dz-tabbar
				v-if="tabbarList.props && tabbarList.props.dataSource != 'default'"
				value="/pages/main/profile/profile"
				:list="tabbarList.props.list.slice(0, tabbarList.props.num)"
				:bgColor="tabbarList.props.bgColor"
				:inactiveColor="tabbarList.props.inactiveColor"
				:activeColor="tabbarList.props.activeColor || theme.dzBaseColor"
			>
			</dz-tabbar>
			<dz-tabbar v-else value="/pages/main/profile/profile" :list="defaultTabbarList" :activeColor="theme.dzBaseColor"></dz-tabbar>
		</view>

		<dz-modal
			v-model:show="bindMoible"
			:showTitle="false"
			content="请您先绑定手机号再进行其它操作"
			:contentStyle="{ color: theme.dzMainColor, fontSize: '32rpx', fontWeight: 'bold' }"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			cancel-text="暂不绑定"
			@confirm="toPage('bindMobile')"
		></dz-modal>
		<!-- 签到积分提示 -->
		<dz-popup v-model:show="isPopupShow" mode="center" border-radius="30" :closeable="true" width="80%" :custom-style="{ overflow: 'visible' }">
			<view class="popup-box">
				<dz-icon name="tubiao309" size="90" :color="theme.dzBaseColor"></dz-icon>
				<view class="title">每日签到拿{{ shopSetting.point_front_name }}购好礼</view>
				<dz-button
					:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor, margin: '30rpx 0' }"
					hover-class="none"
					shape="circle"
					@click="toPage('signIn')"
				>
					知道了
				</dz-button>
				<view class="tip">连续签到,可获得更多奖励哦!</view>
			</view>
		</dz-popup>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" zIndex="981" @click="getInfoData"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, unref, computed, watch } from 'vue';
import { onLoad, onShow, onPullDownRefresh, onReachBottom, onReady, onPageScroll } from '@dcloudio/uni-app';
import myHead from './components/my-head/my-head';
import statisticsMeun from './components/statistics-meun/statistics-meun';
import distribution from './components/distribution/distribution';
import myOrder from './components/my-order/my-order';
import footprint from './components/footprint/footprint';
import { useUserStore } from '@/state/modules/user';
// 获取系统状态栏的高度
let systemInfo = uni.getSystemInfoSync();
let menuButtonInfo = {};
// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
menuButtonInfo = uni.getMenuButtonBoundingClientRect();
// #endif
import $mAssetsConfig from '@/core/config/assetsConfig';
import tabbarConfig from '@/core/config/tabbarConfig';

const userStore = useUserStore();
const barTitle = ref<string>('');
const height = ref<number>(0);
const language = uni.$api.language;
const profileHead = ref(null);
const isShowSignin = ref<boolean>(false);
const memberLevel = $mAssetsConfig.memberLevel;
const bindMoible = ref<boolean>(false);
const top = ref<number>(0);
const opacity = ref<number>(0);
const scrollTop = ref<number>(0);
const titleWidth = ref<number>(250);
const footPrintList = ref<array>([]);
const isColor = ref<boolean>(true);
const notifyUnRead = ref<number>(0);
const hotLine = ref<string>('');
const lastInitTime = ref<number>(0);
const customerService = ref<boolean>(false);
const serviceType = ref<string>('');
const sessionFrom = ref<string>('');
const isPopupShow = ref<boolean>(false);
const defaultTabbarList = tabbarConfig.tabbarList;
const estimateStat = ref<array>([]);
const componentList = ref<array>([]);
const pageLoadingShow = ref<boolean>(false);
const pageLoadingStatus = ref<string>('loading');
const data = reactive({
	navbarIconColor: {
		notifyColor: '#fff',
		badegColor: '#fff',
		badegBgColor: '#fa3534',
	},
	productConfig: {},
});
const page = ref<number>(1);
const productList = ref<array>([]);
const loadingStatus = ref<string>('loading');
const empty = uni.$api.assetsConfig.empty;
const signinToday = ref<boolean>(false);
const signinStatus = ref<boolean>(false);
const signinMode = ref<array>([]);
const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const tabbarList = computed(() => {
	return userStore.getTabbarList;
});

const userPromoter = computed(() => {
	return userStore.getUserPromoter;
});

const customerServiceUnread = computed(() => {
	return userStore.getCustomerServiceUnread;
});

const signinTime = computed(() => {
	return userStore.getSigninTime;
});

const profileNoticeTime = computed(() => {
	return userStore.getProfileNoticeTime;
});

const theme = computed(() => {
	return userStore.getTheme;
});

// 导航栏内部盒子的样式
const navbarInnerStyle = computed(() => {
	let style = {};
	// 导航栏宽度，如果在小程序下，导航栏宽度为胶囊的左边到屏幕左边的距离
	style.height = navbarHeight.value + 'px';
	// // 如果是各家小程序，导航栏内部的宽度需要减少右边胶囊的宽度
	// #ifdef MP
	let rightButtonWidth = systemInfo.windowWidth - menuButtonInfo.left;
	style.marginRight = rightButtonWidth + 'px';
	// #endif
	return style;
});

// 导航中间的标题的样式
const titleStyle = computed(() => {
	let style = {};
	// #ifndef MP
	style.left = (systemInfo.windowWidth - uni.upx2px(titleWidth.value)) / 2 + 'px';
	style.right = (systemInfo.windowWidth - uni.upx2px(titleWidth.value)) / 2 + 'px';
	// #endif
	// #ifdef MP
	// 此处是为了让标题显示区域即使在小程序有右侧胶囊的情况下也能处于屏幕的中间，是通过绝对定位实现的
	let rightButtonWidth = systemInfo.windowWidth - menuButtonInfo.left;
	style.left = (systemInfo.windowWidth - uni.upx2px(titleWidth.value)) / 2 + 'px';
	style.right = rightButtonWidth - (systemInfo.windowWidth - uni.upx2px(titleWidth.value)) / 2 + rightButtonWidth + 'px';
	// #endif
	style.width = uni.upx2px(titleWidth.value) + 'px';
	style.opacity = opacity.value;
	return style;
});

// 转换字符数值为真正的数值
const navbarHeight = computed(() => {
	// #ifdef APP-PLUS || H5
	return height.value ? height.value : 44;
	// #endif
	// #ifdef MP
	// 小程序特别处理，让导航栏高度 = 胶囊高度 + 两倍胶囊顶部与状态栏底部的距离之差(相当于同时获得了导航栏底部与胶囊底部的距离)
	// 此方法有缺陷，暂不用(会导致少了几个px)，采用直接固定值的方式
	// return menuButtonInfo.height + (menuButtonInfo.top - this.statusBarHeight) * 2;//导航高度
	let _height = systemInfo.osName == 'ios' ? 44 : 48;
	return height.value ? height.value : _height;
	// #endif
});

// 是否(裂变/区域/店铺)分销
const isPromoter = computed(() => {
	let isRegional = false;
	if (userInfo.value && userInfo.value.promoter && userInfo.value.promoter.promoterRegional && userInfo.value.promoter.promoterRegional.length) {
		isRegional = userInfo.value.promoter.promoterRegional.some((item) => item.state == 1);
	}
	return (
		userInfo.value &&
		userInfo.value.promoter &&
		((userInfo.value.promoter.promoterFission && userInfo.value.promoter.promoterFission.state == 1 && userInfo.value.promoter_fission_is_open == 1) ||
			(userInfo.value.promoter.promoterRegional &&
				userInfo.value.promoter_regional_is_open == 1 &&
				isRegional &&
				userInfo.value.promoter.promoterRegional.length > 0) ||
			(userInfo.value.promoter.promoterStore &&
				userInfo.value.promoter.promoterStore.state == 1 &&
				userInfo.value.promoter_store_is_open == 1 &&
				userInfo.value.promoter.promoterStore.level_id > 0))
	);
});

// 是否裂变分销
const isPromoterFission = computed(() => {
	return (
		userInfo.value &&
		userInfo.value.promoter &&
		userInfo.value.promoter_fission_is_open == 1 &&
		userInfo.value.promoter.promoterFission &&
		userInfo.value.promoter.promoterFission.state == 1
	);
});

// 是否区域分销
const isPromoterRegional = computed(() => {
	let isRegional = false;
	if (userInfo.value && userInfo.value.promoter && userInfo.value.promoter.promoterRegional && userInfo.value.promoter.promoterRegional.length) {
		isRegional = userInfo.value.promoter.promoterRegional.some((item) => item.state == 1);
	}
	return (
		userInfo.value &&
		userInfo.value.promoter &&
		userInfo.value.promoter.promoterRegional &&
		userInfo.value.promoter_regional_is_open == 1 &&
		isRegional &&
		userInfo.value.promoter.promoterRegional.length > 0
	);
});

// 是否店铺分销
const isPromoterStore = computed(() => {
	return (
		userInfo.value &&
		userInfo.value.promoter &&
		userInfo.value.promoter_store_is_open == 1 &&
		userInfo.value.promoter.promoterStore &&
		userInfo.value.promoter.promoterStore.state == 1 &&
		userInfo.value.promoter.promoterStore.level_id > 0
	);
});

// 是否云仓分销
const isPromoterWarehouse = computed(() => {
	return (
		userInfo.value.promoter &&
		userInfo.value.promoter_warehouse_is_open == 1 &&
		userInfo.value.promoter.promoterWarehouse &&
		userInfo.value.promoter.promoterWarehouse.state == 1 &&
		userInfo.value.promoter.promoterWarehouse.level_id > 0
	);
});

const noticeShow = computed(() => {
	if (!componentList.value.length) return false;
	let status = componentList.value.some((item) => item.component == 'dz-notice-bar');
	if (!status) return false;
	let tiem = new Date().getTime() / 1000;
	if (profileNoticeTime.value && tiem < profileNoticeTime.value) {
		return false;
	} else {
		return true;
	}
});

watch(
	() => userStore.hasLogin,
	() => {
		console.log(userStore.hasLogin);
		getInfoData();
	}
);

onLoad(async () => {
	await uni.$onLaunched;
	const pages = getCurrentPages();
	if (pages[pages.length - 1].route != 'pages/main/profile/profile') return;
	barTitle.value = uni.$api.language.profile.titleProfile;
	if (tabbarList.value.props && tabbarList.value.props.dataSource != 'default') {
		const list = tabbarList.value.props.list;
		const route = list.filter((item) => item.pagePath == `/${pages[pages.length - 1].route}`);
		barTitle.value = route[0].text;
	}
	uni.setNavigationBarTitle({ title: barTitle.value });
	serviceType.value = shopSetting.value.app_service_type;
	isShowSignin.value = parseInt(shopSetting.value.sign_in_is_open) !== 0;
	getInfoData();
});

onShow(() => {
	if (!userStore.hasLogin) {
		footPrintList.value = [];
		return;
	}
	initData();
});

onPullDownRefresh(() => {
	if (!userStore.hasLogin) return uni.stopPullDownRefresh();
	page.value = 1;
	productList.value = [];
	initData();
	getInfoData();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nodata' || loadingStatus.value == 'nomore' || JSON.stringify(data.productConfig) == '{}') return;
	page.value++;
	if (data.productConfig.loadingType == 'default') {
		getProductList();
		return;
	}
	getGuessYouLikeList();
});

onReady(() => {
	//H5刷新后，scrollTop位置停留在上次位置，这时候没有触发onPageScroll事件，所以需要进行初始化
	// #ifdef H5
	if (unref(profileHead)) {
		let top = unref(profileHead).$el.getBoundingClientRect().top;
		scrollTop.value = Math.abs(top);
	}
	// #endif
});

onPageScroll((e) => {
	scrollTop.value = e.scrollTop;
});

async function getGuessYouLikeList() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: page.value,
				page_size: data.productConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length === data.productConfig.pageSize ? 'loadmore' : 'nomore';
			productList.value = [...productList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

async function getProductList() {
	loadingStatus.value = 'loading';
	const params = {};
	if (data.productConfig.cate_id) {
		params.cate_id = data.productConfig.cate_id;
	}
	if (data.productConfig.is_new) {
		params.is_new = data.productConfig.is_new;
	}
	if (data.productConfig.is_recommend) {
		params.is_recommend = data.productConfig.is_recommend;
	}
	if (data.productConfig.is_hot) {
		params.is_hot = data.productConfig.is_hot;
	}
	await uni.$api.http
		.get(uni.$api.apiShop.productIndex, {
			params: {
				...params,
				page: page.value,
				page_size: data.productConfig.pageSize,
			},
		})
		.then(async (res) => {
			loadingStatus.value = res.data.length == data.productConfig.pageSize ? 'loadmore' : 'nomore';
			productList.value = [...productList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

async function getInfoData() {
	pageLoadingShow.value = true;
	uni.$api.http
		.get(uni.$api.apiHome.centerIndex)
		.then((res) => {
			componentList.value = JSON.parse(JSON.stringify(uni.$api.dataConfig.centerComponent));
			if (res.data.decorate.component.length) {
				componentList.value = res.data.decorate.component;
				componentList.value.forEach((item) => {
					if (item.component == 'dz-my-head') {
						if (!item.props.hasOwnProperty('isMemberId')) {
							item.props.isMemberId = 1;
							item.props.isMemberLevel = 1;
							item.props.memberLevelTitle = '';
							item.props.isLevelCaver = 0;
						}
					}
				});
				if (componentList.value[componentList.value.length - 1].component == 'dz-product-list') {
					let config = componentList.value[componentList.value.length - 1];
					if (config.props.isLoading == 1) {
						data.productConfig = config.props.productForm;

						if (data.productConfig.loadingType == 'default') {
							getProductList();
						} else {
							getGuessYouLikeList();
						}
					}
				}
			} else {
				componentList.value.forEach((item) => {
					if (item.component == 'dz-my-head') {
						item.props.linearColor.color = `linear-gradient(30deg, ${theme.value.dzBaseDark}, ${theme.value.dzBaseColor})`;
						item.props.color = theme.value.dzBaseFontColor;
						item.props.levelColor = theme.value.dzBaseFontColor;
						item.props.levelBgColor = theme.value.dzBaseDisabled;
						item.props.levelCaver = memberLevel.value;
						data.navbarIconColor.notifyColor = theme.value.dzBaseFontColor;
					}
				});
			}

			componentList.value.forEach((item) => {
				if (item.component == 'dz-card') {
					item.props.list.forEach((child) => {
						if (child.pageView == 'account') {
							child.cate_title = child.cate_title.replace('余额', shopSetting.value.balance_front_name);
						}
						if (child.pageView == 'integral') {
							child.cate_title = child.cate_title.replace('积分', shopSetting.value.point_front_name);
						}
					});
					const distributionApplyFindIndex = item.props.list.findIndex(
						(child) => child.pageView == 'distributionApply' && (shopSetting.value.promoter_regional_is_open != 1 || !userStore.hasLogin)
					);
					if (distributionApplyFindIndex != -1) {
						item.props.list.splice(distributionApplyFindIndex, 1);
					}
					const apidataIsbnFindIndex = item.props.list.findIndex(
						(child) =>
							child.pageView == 'updateBook' &&
							((userInfo.value && !shopSetting.value.apidata_isbn_member.includes(userInfo.value.id)) || !userStore.hasLogin)
					);
					if (apidataIsbnFindIndex != -1) {
						item.props.list.splice(apidataIsbnFindIndex, 1);
					}
				}
			});

			let component = componentList.value.find((item) => item.component == 'dz-my-head');
			if (component) {
				signinMode.value = component.props.signinMode;
				if (signinMode.value.length && component.props.isSignin == 1) {
					let isOpenSignin = parseInt(shopSetting.value.signin_is_open) == 1;
					if (isOpenSignin && userStore.hasLogin && (userInfo.value.mobile != '' || parseInt(shopSetting.value.third_party_register) == 1)) {
						getSigninInfo();
					}
				}
			}
			pageLoadingShow.value = false;
		})
		.catch((err) => {
			pageLoadingStatus.value = 'error';
		});

	uni.stopPullDownRefresh();
}

async function getSigninInfo() {
	let time = new Date().getTime() / 1000;
	let timeDay = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1).getTime() / 1000;
	await uni.$api.http.get(uni.$api.apiShop.signinInfo).then((res) => {
		signinToday.value = res.data.signin_today == 1 ? false : true;
		if (!signinMode.value.includes('popup')) return;
		if (signinTime.value && time < signinTime.value) {
			isPopupShow.value = false;
		} else {
			if (signinToday.value) {
				isPopupShow.value = true;
				userStore.setSigninTime(timeDay);
			}
		}
	});
}

async function initData() {
	await getMemberInfo();
	await getNotifyUnRead();
	await getFootprintList();
	await initCustomerService();
	await uni.$api.shop.getCustomerServiceUnread();
	uni.stopPullDownRefresh();
}

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
		if (res.data.promoter && res.data.promoter.promoterWarehouse) {
			getEstimateStat();
		}
		//如果没有手机号，且强制绑定手机号
		if (res.data.mobile == '' && parseInt(shopSetting.value.third_party_register) != 1) {
			bindMoible.value = true;
		}
	});
	uni.stopPullDownRefresh();
}

function getEstimateStat() {
	uni.$api.http.get(uni.$api.apiShop.distributionMemberEstimateStat).then((res) => {
		estimateStat.value = res.data.estimateStat;
	});
}

async function getFootprintList() {
	let now = Date.parse(new Date()) / 1000;
	if (now - lastInitTime.value > 60) {
		lastInitTime.value = now;
		await uni.$api.http.get(uni.$api.apiMember.footprintIndex).then((res) => {
			footPrintList.value = res.data;
		});
	}
}

async function getNotifyUnRead() {
	//通知消息
	await uni.$api.http.get(uni.$api.apiMember.notifyUnReadCount).then((res) => {
		notifyUnRead.value = res.data.count;
	});
}

function noticeListInfo(val) {
	if (!val.length) return [];
	let list = [];
	val.forEach((item) => {
		list.push(item.title);
	});
	return list;
}

function closeClick() {
	let timeDay = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1).getTime() / 1000;
	userStore.setProfileNoticeTime(timeDay);
}

//初始化客服
function initCustomerService() {
	const serviceType = parseInt(shopSetting.value.app_service_type);
	if (serviceType > 0) {
		if (userStore.hasLogin) {
			sessionFrom.value =
				'{"source":"用户中心","mobile":"' +
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

function initNavigation(e) {
	opacity.value = e.opacity;
	top.value = e.top;
}

function opacityChange(e) {
	opacity.value = e.opacity;
	isColor.value = parseInt(opacity.value) == 1 ? false : true;
}

function toPage(url: string, e?: string) {
	let type = e;
	let path = url;
	const pageConfig = {
		2: { url: 'distribution', type: 'store' },
		3: { url: 'warehouse', type: 'warehouse' },
	};
	if ([2, 3].includes(parseInt(url))) {
		path = pageConfig[url].url;
		type = pageConfig[url].type;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[path],
		query: {
			type,
		},
	});
	if (url == 'signIn') {
		isPopupShow.value = false;
	}
}

// 更多公告
function noticeClick() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.notice,
	});
}

// 公告详情
function noticeItmeClick(index: number, itemIndex: number) {
	const item = componentList.value[index].props.list[itemIndex];
	if (!item.id) return;
	uni.$api.router.push({
		route: uni.$api.routesConfig.noticeDetail,
		query: {
			id: item.id,
		},
	});
}

// 悬浮按钮 跳转
function fabClick(itemIndex: number, index: number) {
	const item = componentList.value[index].props.list[itemIndex].link;
	// 优惠劵
	if (item.activeMenuType == 'coupon') {
		onCoupon(item);
		return;
	}
	uni.$api.shop.linkJump(item);
}

// 卡片菜单/轮播图 跳转
function linkJumpIndexTab(index: number, itemIndex: number) {
	const item = componentList.value[index].props.list[itemIndex];
	// 优惠劵
	if (item.activeMenuType == 'coupon') {
		onCoupon(item);
		return;
	}
	// 客服
	if (item.activeMenuType && item.pageView == 'customerService') {
		serviceTap();
		return;
	}
	// 热线
	if (item.activeMenuType && item.pageView == 'hotline') {
		phone();
		return;
	}
	if (item.activeMenuType && item.pageView == 'distributionApply' && userInfo.value && userInfo.value.promoter_regional_is_open != 1) {
		return uni.$api.toast(`未开启${item.cate_title ? item.cate_title : '区域申请'}，请联系工作人员`);
	}
	uni.$api.shop.linkJump(item);
}

// 广告/魔方/卡片导航更多 跳转
function linkJumpTab(val: object) {
	if (val.activeMenuType == 'coupon') {
		onCoupon(val);
		return;
	}
	uni.$api.shop.linkJump(val);
}

// 领取优惠劵
function onCoupon(item: object) {
	uni.$api.throttle(() => {
		uni.$api.http
			.post(uni.$api.apiShop.couponReceive, {
				id: item.id,
			})
			.then((res) => {
				uni.$api.toast(uni.$api.language.product.couponGetSuccess);
			});
	});
}

function phone() {
	if (hotLine.value) {
		uni.makePhoneCall({
			phoneNumber: hotLine.value,
		});
		return;
	}
	uni.$api.http
		.get(uni.$api.apiCommon.configIndex, {
			params: {
				field: 'store_hot_line',
			},
		})
		.then((res) => {
			hotLine.value = res.data.store_hot_line;
			if (!hotLine.value) return uni.$api.toast(uni.$api.language.profile.hotlineEmpty);
			uni.makePhoneCall({
				phoneNumber: res.data.store_hot_line,
			});
		});
}

//客服
function serviceTap() {
	const serviceType = parseInt(shopSetting.value.app_service_type);

	if (serviceType === 2) {
		//微信原生小程序客服
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
		if (userStore.hasLogin) {
			let params = {
				source: '用户中心',
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
		const customerServiceUrl = shopSetting.value.app_service_wxkf_url;
		const corpId = shopSetting.value.app_service_wxkf_id;
		if (!customerServiceUrl || !corpId) {
			uni.$api.toast('客服暂未配置');
			return;
		}
		// #ifdef MP-WEIXIN
		wx.openCustomerServiceChat({
			extInfo: { url: customerServiceUrl },
			corpId: corpId,
			success(res) {},
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
</script>

<style lang="scss" scoped>
.dz-navbar-inner {
	height: 44px;
	display: flex;
	justify-content: space-between;
	position: relative;
	align-items: center;
}

.dz-navbar-content-title {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	position: absolute;
	left: 0;
	right: 0;
	height: 60rpx;
	text-align: center;
	flex-shrink: 0;
}

.dz-title {
	line-height: 60rpx;
	font-size: 32rpx;
	flex: 1;
	// color: $dz-main-color;
}

.dz-navbar-right {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.right-item {
	margin: 0 32rpx;
	position: relative;
	// color: $dz-main-color;
	display: flex;
}

.dz-banner {
	image {
		display: inline-block;
	}
}

// 积分签到弹窗
.popup-box {
	padding: 40rpx;
	text-align: center;

	.title {
		margin-top: 20rpx;
		// color: $dz-main-color;
		font-size: 36rpx;
	}

	.tip {
		font-size: 24rpx;
		// color: $dz-tips-color;
	}
}
</style>

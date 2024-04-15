import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import appConfig from '@/core/config/appConfig';
import routesConfig from '@/core/config/routesConfig';
import router from '@/core/utils/router';
import tabbarConfig from '@/core/config/tabbarConfig';
import themeConfig from '@/core/config/themeConfig';
import theme from '@/core/config/theme';

const EMPTY = {
	accessToken: '',
	refreshToken: '',
	expirationTime: 0,
	userInfo: {},
	userPromoter: {},
	promoCode: '',
	dealerCode: '',
	storeId: '',
	lastLoginTime: 0,
	jumpUpdateVersion: '',
	productSearch: [],
	productSearchDefault: '',
	productSearchHot: [],
	cartNum: 0,
	imHistory: [],
	imNoRead: 0,
	shopSetting: {},
	customerTheme: 'red',
	theme: themeConfig['red'].colors,
	lastLoginCaptchaTimeStamp: 0, //上一次获取登录验证码时间
	lastMobileRegisterCaptchaTimeStamp: 0, //上一次获取注册验证码时间
	lastBindMobileCaptchaTimeStamp: 0, //上一次获取绑定手机号验证码时间
	lastMobileUnBindCaptchaTimeStamp: 0, //上一次获取修改手机号确认原手机号验证码时间
	lastMobileReBindCaptchaTimeStamp: 0, //上一次获取修改手机号验证码时间
	lastUpdatePasswordCaptchaTimeStamp: 0, //  上一次获取修改密码验证码时间
	lastUpdatePayPasswordCaptchaTimeStamp: 0, //  上一次获取修改支付密码验证码时间
	lastBrokerageTransfeCaptchaTimeStamp: 0, //  上一次获取佣金转账验证码时间
	lastLogoffCaptchaTimeStamp: 0, //  上一次获取注销验证码时间
	lastUsernameMobileRegisterCaptchaTimeStamp: 0, //  上一次获取用户名+手机号注册验证码时间
	lastThirdPartyLCaptchaTimeStamp: 0, // 上一次获取取第三方绑定验证码时间
	lastInputMobile: '',
	lastSelectMobileArea: '86',
	cartPageListen: false, //购物车页面是否处于监听状态
	styleLoadingType: 'loading-1',
	wechatTip: true, //微信端提示
	popupAdvTime: 0, // 记录首页弹窗时间
	isAgree: true, //  控制服务协议显示
	isGuide: true, // 控制引导页显示
	isPopAdv: false, // 控制是否首次点击弹窗
	iosWxConfig: false, //是否IOS已经注册了微信SDK
	allinpayMode: '', // 1标准通商云  2通商云E+ 当前属于那个通商云环境
	profileNoticeTime: '',
	signinTime: '', // 签到时间
	wechatMpLogin: null, // 是否是小程序登录
	wechatMpScene: 0, // 获取微信小程序本次场景值,
	updateWechatMpUserInfo: true,
};
const CACHE = uni.getStorageSync('appCache') || EMPTY;

//去除所有历史消息的tip类型
if (CACHE.imHistory) {
	for (let index = CACHE.imHistory.length - 1; index >= 0; index--) {
		if (CACHE.imHistory[index].tip === true) {
			CACHE.imHistory.splice(index, 1);
		}
	}
}

//初始化自定义TABBAR
const TABBARLIST = {
	type: 'default',
	props: {
		list: tabbarConfig.tabbarList,
	},
};
if (TABBARLIST.length > appConfig.cartBarIndex && CACHE.accessToken) {
	TABBARLIST[appConfig.cartBarIndex].count = CACHE.cartNum;
}

export const useUserStore = defineStore({
	id: 'user',
	state: () => ({
		data: {
			appCache: CACHE,
			...CACHE,
			//第三方登录用户授权信息
			thirdPartyUserInfo: { type: '', userInfo: {} },
			tabbarList: TABBARLIST,
		},
	}),
	getters: {
		getCustomerTheme(state) {
			return state.data.customerTheme;
		},
		getTheme(state) {
			return { ...theme, ...state.data.theme };
		},
		getData(state) {
			return state.data;
		},
		getLastInputMobile(state) {
			return state.data.lastInputMobile;
		},
		getLastSelectMobileArea(state) {
			return state.data.lastSelectMobileArea;
		},
		getLastLoginCaptchaTimeStamp(state) {
			return state.data.lastLoginCaptchaTimeStamp;
		},
		getLastMobileRegisterCaptchaTimeStamp(state) {
			return state.data.lastMobileRegisterCaptchaTimeStamp;
		},
		getLastBindMobileCaptchaTimeStamp(state) {
			return state.data.lastBindMobileCaptchaTimeStamp;
		},
		getLastBrokerageTransfeCaptchaTimeStamp(state) {
			return state.data.lastBrokerageTransfeCaptchaTimeStamp;
		},
		getLastLogoffCaptchaTimeStamp(state) {
			return state.data.lastLogoffCaptchaTimeStamp;
		},
		getLastUsernameMobileRegisterCaptchaTimeStamp(state) {
			return state.data.lastUsernameMobileRegisterCaptchaTimeStamp;
		},
		getLastThirdPartyLCaptchaTimeStamp(state) {
			return state.data.lastThirdPartyLCaptchaTimeStamp;
		},
		getLastMobileUnBindCaptchaTimeStamp(state) {
			return state.data.lastMobileUnBindCaptchaTimeStamp;
		},
		getLastMobileReBindCaptchaTimeStamp(state) {
			return state.data.lastMobileReBindCaptchaTimeStamp;
		},
		getLastUpdatePasswordCaptchaTimeStamp(state) {
			return state.data.lastUpdatePasswordCaptchaTimeStamp;
		},
		getAccessToken(state) {
			return state.data.accessToken;
		},
		getRefreshToken(state) {
			return state.data.refreshToken;
		},
		getExpirationTime(state) {
			return state.data.expirationTime;
		},
		getStyleLoadingType(state) {
			return state.data.styleLoadingType;
		},
		getProductSearch(state) {
			return state.data.productSearch;
		},
		getShopSetting(state) {
			return state.data.shopSetting;
		},
		getUserInfo(state) {
			return state.data.userInfo;
		},
		getCustomerServiceUnread(state) {
			return state.data.customerServiceUnread;
		},
		getIosWxConfig(state) {
			return state.data.iosWxConfig;
		},
		getPromoCode(state) {
			return state.data.promoCode;
		},
		getDealerCode(state) {
			return state.data.dealerCode;
		},
		getStoreId(state) {
			return state.data.storeId;
		},
		getTabbarList(state) {
			return state.data.tabbarList;
		},
		getProfileNoticeTime(state) {
			return state.data.profileNoticeTime;
		},
		getUserPromoter(state) {
			return state.data.userPromoter;
		},
		getSigninTime(state) {
			return state.data.signinTime;
		},
		getWechatMpLogin(state) {
			return state.data.wechatMpLogin;
		},
		getWechatMpScene(state) {
			return state.data.wechatMpScene;
		},
		getUpdateWechatMpUserInfo(state) {
			return state.data.updateWechatMpUserInfo;
		},
		getCartNum(state) {
			return state.data.cartNum;
		},
		getCartPageListen(state) {
			return state.data.cartPageListen;
		},
		getProductSearchHot(state) {
			return state.data.productSearchHot || [];
		},
		getProductSearchDefault(state) {
			return state.data.productSearchDefault;
		},
		getThirdPartyUserInfo(state) {
			return state.data.thirdPartyUserInfo;
		},
		getWechatTip(state) {
			return state.data.wechatTip;
		},
		getPopupAdvTime(state) {
			return state.data.popupAdvTime;
		},
		getIsPopAdv(state) {
			return state.data.isPopAdv;
		},
		getIsGuide(state) {
			return state.data.isGuide;
		},
		hasLogin: (state): boolean => !!state.data.accessToken,
	},
	actions: {
		login(value: any) {
			// const authStore = useAuthStore();
			this.data.appCache.accessToken = this.data.accessToken = value.access_token;
			this.data.appCache.refreshToken = this.data.refreshToken = value.refresh_token;
			this.data.appCache.expirationTime = this.data.expirationTime = value.expiration_time;
			// authStore.setToken(value.access_token);
			this.data.appCache.userInfo = this.data.userInfo = value.member;
			this.data.appCache.userPromoter = this.data.userPromoter = value.member.promoter;
			this.data.appCache.lastLoginTime = this.data.lastLoginTime = new Date().getTime() / 1000;
			uni.setStorageSync('appCache', this.data.appCache);
			this.setCartNum(value.member.cart_num);
			uni.$emit('cartNumChange', {});
		},
		setTokenInfo(value: any) {
			this.data.appCache.accessToken = this.data.accessToken = value.access_token;
			this.data.appCache.refreshToken = this.data.refreshToken = value.refresh_token;
			this.data.appCache.expirationTime = this.data.expirationTime = value.expiration_time;
			this.setCartNum(value.member.cart_num);
		},
		setLastCaptchaTimeStamp(key: string, value: number) {
			this.data[key] = value;
			uni.setStorageSync('appCache', this.data);
		},
		setLastInputMobile(value: string) {
			this.data.lastInputMobile = value;
			uni.setStorageSync('appCache', this.data);
		},
		setLastSelectMobileArea(value: string) {
			this.data.lastSelectMobileArea = value;
			uni.setStorageSync('appCache', this.data);
		},
		setWechatMpLogin(value: Boolean) {
			this.data.appCache.wechatMpLogin = this.data.wechatMpLogin = value;
			uni.setStorageSync('appCache', this.data);
		},
		setWechatMpScene(value: number) {
			this.data.appCache.wechatMpScene = this.data.wechatMpScene = value;
			uni.setStorageSync('appCache', this.data);
		},
		setUpdateWechatMpUserInfo(value: Boolean) {
			this.data.appCache.updateWechatMpUserInfo = this.data.updateWechatMpUserInfo = value;
			uni.setStorageSync('appCache', this.data);
		},
		setShopSetting(value: Object) {
			this.data.appCache.shopSetting = this.data.shopSetting = value;
			uni.setStorageSync('appCache', this.data);
		},
		setThirdPartyUserInfo(value: Object) {
			this.data.thirdPartyUserInfo = value;
		},
		setUserHeadPortrait(value: string) {
			this.data.appCache.userInfo.head_portrait = this.data.userInfo.head_portrait = value;
			uni.setStorageSync('appCache', this.data);
		},
		setUserNickname(value: string) {
			this.data.appCache.userInfo.nickname = this.data.userInfo.nickname = value;
			uni.setStorageSync('appCache', this.data);
		},
		setUserMobile(value: string) {
			this.data.appCache.userInfo.mobile = this.data.userInfo.mobile = value;
			uni.setStorageSync('appCache', this.data);
		},
		setUserMobileArea(value: string) {
			this.data.appCache.userInfo.mobile_area = this.data.userInfo.mobile_area = value;
			uni.setStorageSync('appCache', this.data);
		},
		setPromoCode(value: string) {
			this.data.appCache.promoCode = this.data.promoCode = value;
			uni.setStorageSync('appCache', this.data);
		},
		setDealerCode(value: string) {
			this.data.appCache.dealerCode = this.data.dealerCode = value;
			uni.setStorageSync('appCache', this.data);
		},
		setStoreId(value: string) {
			this.data.appCache.storeId = this.data.storeId = value;
			uni.setStorageSync('appCache', this.data);
		},
		setUserInfo(value: Object) {
			this.data.appCache.userInfo = this.data.userInfo = value;
			this.data.appCache.userPromoter = this.data.userPromoter = value?.promoter || {};
			uni.setStorageSync('appCache', this.data);
		},
		setLoadingType(value: string) {
			this.data.appCache.styleLoadingType = this.data.styleLoadingType = value;
			uni.setStorageSync('appCache', this.data);
		},
		setTabbarList(value: any) {
			this.data.tabbarList = value;
			this.setCartNum(this.data.cartNum);
		},
		setProductSearch(value: []) {
			this.data.appCache.productSearch = this.data.productSearch = value;
			uni.setStorageSync('appCache', this.data);
		},
		setProductSearchDefault(value: string) {
			this.data.appCache.productSearchDefault = this.data.productSearchDefault = value;
			uni.setStorageSync('appCache', this.data);
		},
		setProductSearchHot(value: []) {
			this.data.appCache.productSearchHot = this.data.productSearchHot = value;
			uni.setStorageSync('appCache', this.data);
		},
		setCartNum(value: string) {
			this.data.appCache.cartNum = this.data.cartNum = value;
			this.data.appCache.userInfo.cart_num = this.data.userInfo.cart_num = value;
			uni.setStorageSync('appCache', this.data.appCache);
			if (appConfig.cartBarIndex > -1) {
				// 原生tabbar
				// if (parseInt(value) == 0) {
				// 	uni.removeTabBarBadge({
				// 		index: appConfig.cartBarIndex
				// 	})
				// } else {
				// 	uni.setTabBarBadge({
				// 		index: appConfig.cartBarIndex,
				// 		text: String(value)
				// 	})
				// }
				// 非原生tabbar
				if (this.data.tabbarList.component == 'dz-tabbar') {
					this.data.tabbarList.props.list.forEach((item: any, index: number) => {
						if (item.pagePath == '/pages/main/cart/cart') {
							this.data.tabbarList.props.list[index].count = value;
						}
					});
				} else {
					if (this.data.tabbarList.length > appConfig.cartBarIndex) {
						this.data.tabbarList[appConfig.cartBarIndex].count = value;
					}
				}
			}
		},
		setCartPageListen(value: boolean) {
			this.data.cartPageListen = value;
		},
		setCustomerTheme(value: string) {
			this.data.appCache.customerTheme = this.data.customerTheme = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		setTheme(value: object) {
			// this.data.appCache.theme=this.data.theme = {...theme,...value};
			this.data.appCache.theme = this.data.theme = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		setCustomerServiceUnread(value: number) {
			this.data.customerServiceUnread = value;
		},
		setIosWxConfig(value: boolean) {
			this.data.iosWxConfig = value;
		},
		setProfileNoticeTime(value: number) {
			this.data.appCache.profileNoticeTime = this.data.profileNoticeTime = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		setSigninTime(value: number) {
			this.data.appCache.signinTime = this.data.signinTime = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		setWechatTip(value: boolean) {
			this.data.appCache.wechatTip = this.data.wechatTip = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		setPopupAdvTime(value: number) {
			this.data.appCache.popupAdvTime = this.data.popupAdvTime = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		setIsPopAdv(value: boolean) {
			this.data.appCache.isPopAdv = this.data.isPopAdv = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		setIsGuide(value: boolean) {
			this.data.appCache.isGuide = this.data.isGuide = value;
			uni.setStorageSync('appCache', this.data.appCache);
		},
		logout() {
			this.data.appCache.accessToken = this.data.accessToken = '';
			this.data.appCache.refreshToken = this.data.refreshToken = '';
			this.data.appCache.userInfo = this.data.userInfo = {};
			this.data.appCache.userPromoter = this.data.userPromoter = {};
			this.data.appCache.wechatMpLogin = this.data.wechatMpLogin = null;
			uni.setStorageSync('appCache', this.data.appCache);
			this.setCartNum('0');
			uni.$emit('cartNumChange', {});
		},
		reLogin() {
			this.logout();
			router.push({
				route: routesConfig.login,
			});
		},
	},
});

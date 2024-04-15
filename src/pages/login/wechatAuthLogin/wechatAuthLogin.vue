<template>
	<view>
		<dz-navbar title="授权登录" :isBack="false">
			<template #left>
				<view class="dz-nav-slot">
					<block v-if="currentPages.length > 1">
						<dz-icon name="back_light" size="40" @click="goBack('back')"></dz-icon>
						<dz-line direction="col" :hairline="false" length="32" margin="0 8px"></dz-line>
					</block>
					<dz-icon name="home" size="38" @click="goBack('home')"></dz-icon>
				</view>
			</template>
			<template #right>
				<view style="padding-right: 24rpx; font-size: 28rpx" @tap="handleHelper()">帮助 </view>
			</template>
		</dz-navbar>
		<view class="container">
			<view class="dz-flex dz-row-center">
				<dz-image :src="logo" :width="170" :height="170" :borderRadius="20"></dz-image>
			</view>
			<view class="form-wrap">
				<view class="dz-m-t-60">
					<dz-button
						v-if="!closeLogin"
						:custom-style="{ width: '100%', height: '95rpx', background: theme.dzBaseDisabled, color: theme.dzBaseFontColor }"
						hover-class="none"
						shape="circle"
						:border="false"
						:disabled="true"
						>应用暂时关闭登录</dz-button
					>
					<dz-button
						v-else
						:custom-style="{
							width: '100%',
							height: '95rpx',
							background: theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						shape="circle"
						:border="false"
						hover-class="none"
						open-type="getUserInfo|agreePrivacyAuthorization"
						@click="wechatSubmit"
					>
						{{ language.login.wechatAuthLoginSubmit }}
					</dz-button>
				</view>
				<view class="dz-m-t-30 dz-font-24 dz-main-color">
					<block v-if="agreeMode == 0">
						{{ language.login.loginAgree + appName }}

						<text class="dz-tips-color dz-text-underline" @tap="protocal(language.login.userAgreement, 'register')">{{
							language.login.userAgreement
						}}</text>
						、
						<text class="dz-tips-color dz-text-underline" @tap="protocal(language.login.privacyAgreement, 'privacy')">{{
							language.login.privacyAgreement
						}}</text>

						{{ api.formatString(language.login.grantAuthorization, appName) }}
					</block>
					<block v-else>
						<view class="dz-flex dz-row-center">
							<dz-checkbox-group v-model="agreeCheck" shape="circle" :activeColor="theme.dzBaseColor">
								<dz-checkbox label="我已仔细阅读并同意" />
							</dz-checkbox-group>
							<view>
								<text class="dz-m-l-6 dz-tips-color dz-text-underline" @tap="protocal(language.login.userAgreement, 'register')"
									>《{{ language.login.userAgreement }}》</text
								>
								、
								<text class="dz-tips-color dz-text-underline" @tap="protocal(language.login.privacyAgreement, 'privacy')"
									>《{{ language.login.privacyAgreement }}》</text
								>
							</view>
						</view>
					</block>
				</view>
			</view>
			<view v-if="isMobileLogin || passwordLogin || usernamePasswordLogin" class="dz-text-center dz-m-t-80 dz-tips-color dz-font-26">其它登录方式</view>
			<view class="dz-flex dz-row-center dz-m-t-20">
				<view v-if="isMobileLogin" class="dz-p-l-20 dz-p-r-20">
					<dz-button
						hover-class="none"
						:border="false"
						shape="circle"
						:custom-style="{ width: '86rpx', height: '86rpx', background: api.colorToRgba(theme.dzBaseDisabled, 0.2), color: theme.dzBaseColor }"
						@click="handelMobileLogin()"
					>
						<dz-icon name="more" size="40"></dz-icon>
					</dz-button>
				</view>
				<view v-if="passwordLogin" class="dz-p-l-20 dz-p-r-20">
					<dz-button
						hover-class="none"
						:border="false"
						shape="circle"
						:custom-style="{ width: '86rpx', height: '86rpx', background: api.colorToRgba(theme.dzBaseDisabled, 0.2), color: theme.dzBaseColor }"
						@click="handelPasswordLogin()"
					>
						<dz-icon name="mobilefill" size="40"></dz-icon>
					</dz-button>
				</view>
				<view v-if="usernamePasswordLogin" class="dz-p-l-20 dz-p-r-20">
					<dz-button
						hover-class="none"
						:border="false"
						shape="circle"
						:custom-style="{ width: '86rpx', height: '86rpx', background: api.colorToRgba(theme.dzBaseDisabled, 0.2), color: theme.dzBaseColor }"
						@click="handelusernamePasswordLogin()"
					>
						<dz-icon name="my_fill_light" size="40"></dz-icon>
					</dz-button>
				</view>
				<!-- #ifdef APP-PLUS -->
				<view v-if="showAppleLogin && appAppleLogin" class="dz-p-l-20 dz-p-r-20">
					<dz-button
						hover-class="none"
						:border="false"
						shape="circle"
						:custom-style="{ width: '86rpx', height: '86rpx', background: api.colorToRgba(theme.dzBaseDisabled, 0.2), color: theme.dzBaseColor }"
						@click="appleSubmit()"
					>
						<dz-icon name="iOS" size="40"></dz-icon>
					</dz-button>
				</view>
				<!-- #endif -->
			</view>
		</view>
		<!--获取手机号码-->
		<dz-modal v-model:show="modelShow" :show-cancel-button="true" :title="'手机授权'" :content="appName + ' 需要您的手机授权信息完成注册'">
			<template #confirm-button>
				<dz-button
					type="info"
					shape="rightAngle"
					:border="false"
					:custom-style="{ width: '100%', height: '100rpx' }"
					open-type="getPhoneNumber|agreePrivacyAuthorization"
					@getphonenumber="getPhoneNumber"
				>
					确认授权
				</dz-button>
			</template>
		</dz-modal>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const language = uni.$api.language;
const userStore = useUserStore();
const { promoCode, dealerCode, storeId, thirdPartyUserInfo } = userStore.getData;
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});
const theme = computed(() => {
	return userStore.getTheme;
});
const canIUseProfile = ref<Boolean>(false);
const logo = ref<String>(shopSetting.value.store_logo || uni.$api.assetsConfig.logo);
const appName = ref<String>(shopSetting.value.store_name);
const agreeMode = ref<Number>(parseInt(shopSetting.value.app_agreement_default_select));
const closeLogin = ref<Boolean>(parseInt(shopSetting.value.login_is_open) == 1);
// 微信公众号
const wechat_login_mode = ref<String[]>(shopSetting.value.wechat_login_mode);
const wechat_login_default = ref<String>(parseInt(shopSetting.value.wechat_login_default));
// 小程序
const mini_program_login_mode = ref<String[]>(shopSetting.value.mini_program_login_mode);
const mini_program_login_default = ref<String>(shopSetting.value.mini_program_login_default);
// h5
const h5_login_mode = ref<String[]>(shopSetting.value.h5_login_mode);
const h5_login_default = ref<String>(shopSetting.value.h5_login_default);
// app
const app_login_mode = ref<String[]>(shopSetting.value.app_login_mode);
const app_login_default = ref<String>(shopSetting.value.app_login_default);
// 苹果
const showAppleLogin = ref<Boolean>(false);
const appAppleLogin = ref<Number>(parseInt(shopSetting.value.mobile_show_apple_login) == 1);

const agreeCheck = ref<number[]>();
const isMobileLogin = ref<Boolean>(false);
const passwordLogin = ref<Boolean>(false);
const usernamePasswordLogin = ref<Boolean>(false);
const modelShow = ref<Boolean>(false);
const currentPages = ref<any>([]);

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.language.login.titleLogin,
	});
	currentPages.value = getCurrentPages();
	// #ifdef MP-WEIXIN
	// 新版小程序登录判断
	if (uni.getUserProfile) {
		canIUseProfile.value = true;
	}
	// #endif
	if (agreeMode.value == 0) {
		agreeCheck.value = [1];
	} else if (agreeMode.value == 1) {
		agreeCheck.value = [1];
	} else if (agreeMode.value == 2) {
		agreeCheck.value = [];
	}
	initMobileLogin();
	initPasswordLogin();
	initUsernamePasswordLogin();
	initThirdPartyLogin();
});

function initMobileLogin() {
	isMobileLogin.value = false;
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '' && (wechat_login_mode.value.includes(0) || parseInt(wechat_login_default.value) === 0)) {
		isMobileLogin.value = true;
	} else if (h5_login_mode.value.includes(0) || h5_login_default.value == 0) {
		isMobileLogin.value = true;
	}
	// #endif

	// #ifdef MP-WEIXIN
	if (mini_program_login_mode.value.includes(0) || mini_program_login_default.value == 0) {
		isMobileLogin.value = true;
	}
	// #endif

	// #ifdef APP-PLUS
	if (app_login_mode.value.includes(0) || app_login_default.value == 0) {
		isMobileLogin.value = true;
	}
	// #endif
}

// 账号密码登录
function initPasswordLogin() {
	passwordLogin.value = false;
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '' && (wechat_login_mode.value.includes(2) || parseInt(wechat_login_default.value) === 2)) {
		passwordLogin.value = true;
	} else if ((h5_login_mode.value.includes(2) || h5_login_default.value == 2) && !uni.$api.h5IsWechat()) {
		passwordLogin.value = true;
	}
	// #endif

	// #ifdef MP-WEIXIN
	if (mini_program_login_mode.value.includes(2) || mini_program_login_default.value == 2) {
		passwordLogin.value = true;
	}
	// #endif

	// #ifdef APP-PLUS
	if (app_login_mode.value.includes(2) || app_login_default.value == 2) {
		passwordLogin.value = true;
	}
	// #endif
}

// 用户名密码登录
function initUsernamePasswordLogin() {
	usernamePasswordLogin.value = false;
	// #ifdef H5
	if (h5_login_mode.value.includes(10) || h5_login_default.value == 10) {
		usernamePasswordLogin.value = true;
	}
	// #endif

	// #ifdef MP-WEIXIN
	if (mini_program_login_mode.value.includes(10) || mini_program_login_default.value == 10) {
		usernamePasswordLogin.value = true;
	}
	// #endif

	// #ifdef APP-PLUS
	if (app_login_mode.value.includes(10) || app_login_default.value == 10) {
		usernamePasswordLogin.value = true;
	}
	// #endif
}

function initThirdPartyLogin() {
	showAppleLogin.value = false;

	// #ifdef APP-PLUS
	if (uni.$api.systemInfo.osName == 'ios') {
		showAppleLogin.value = true;
	}
	// #endif
}

function handleHelper() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.helper,
	});
}

function handelMobileLogin() {
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.mobileLogin,
	});
}

function handelPasswordLogin() {
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.passwordLogin,
	});
}

function handelusernamePasswordLogin() {
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.usernamepasswordLogin,
	});
}

//协议
function protocal(title: string, field: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.protocolDetail,
		query: {
			title,
			field,
		},
	});
}

//微信登录
function wechatSubmit() {
	if (!closeLogin.value) {
		uni.$api.toast('应用暂时关闭登录');
		return;
	}

	if (!agreeCheck.value.length) {
		uni.$api.toast('请仔细阅读并勾选会员协议');
		return;
	}

	uni.showLoading({
		title: uni.$api.language.login.wechatLoading,
		mask: true,
	});

	// #ifdef APP-PLUS
	plus.oauth.getServices(
		function (services) {
			let weixinService;
			if (services && services.length > 0) {
				for (let i = 0; i < services.length; i++) {
					if (services[i].id === 'weixin') {
						weixinService = services[i];
						break;
					}
				}
				if (!weixinService) {
					uni.hideLoading();
					uni.$api.toast(uni.$api.language.login.uninstallWechatAuthService);
					return;
				}
				weixinService.authorize(
					(e) => {
						let authApi = `${uni.$api.apiMember.wechatOpenPlatformLogin}?code=${e.code || ''}&promo_code=${promoCode || ''}&dealer_code=${
							dealerCode || ''
						}&store_id=${storeId || ''}`;
						wechatAuthLogin(authApi);
					},
					function (err) {
						uni.hideLoading();
						uni.$api.toast(err.message.split(',')[0]);
					}
				);
			} else {
				uni.hideLoading();
				uni.$api.toast(uni.$api.language.login.getAuthServiceError);
			}
		},
		function () {
			// 获取 services 失败
			uni.hideLoading();
			uni.$api.toast(uni.$api.language.thirdPartyLogin.getWechatAuthServiceError);
		}
	);
	// #endif

	// #ifdef MP-WEIXIN
	if (canIUseProfile.value) {
		uni.getUserProfile({
			desc: 'Wexin',
			success: (profileRes) => {
				uni.login({
					provider: 'weixin',
					success: function (loginRes) {
						uni.getUserInfo({
							provider: 'weixin',
							success: function (infoRes) {
								let params = {};
								params.signature = infoRes.signature;
								params.encryptedData = infoRes.encryptedData;
								params.rawData = infoRes.rawData;
								params.iv = infoRes.iv;
								params.code = loginRes.code;
								params.userInfo = profileRes.rawData;
								let authApi =
									uni.$api.apiMember.wechatMiniProgramV2Login +
									'?promo_code=' +
									(promoCode || '') +
									'&dealer_code=' +
									(dealerCode || '') +
									'&store_id=' +
									(storeId || '');
								wechatAuthLogin(authApi, params);
							},
							fail: function () {
								uni.hideLoading();
								uni.$api.toast('获取微信手机授权失败');
							},
						});
					},
					fail: function () {
						uni.hideLoading();
						uni.$api.toast('获取微信授权服务失败');
					},
				});
			},
			fail: () => {
				uni.$api.toast('获取微信授权服务失败');
			},
		});
	} else {
		uni.login({
			provider: 'weixin',
			success: function (loginRes) {
				uni.getUserInfo({
					provider: 'weixin',
					success: function (infoRes) {
						let params = {};
						let authApi =
							uni.$api.apiMember.wechatMiniProgramLogin +
							'?promo_code=' +
							(promoCode || '') +
							'&dealer_code=' +
							(dealerCode || '') +
							'&store_id=' +
							(storeId || '');
						params = { ...infoRes, ...params };
						params.code = loginRes.code;
						wechatAuthLogin(authApi, params);
					},
					fail: function () {
						uni.hideLoading();
						uni.$api.toast(uni.$api.language.thirdPartyLogin.getWechatAuthInfoError);
					},
				});
			},
			fail: function () {
				uni.hideLoading();
				uni.$api.toast(uni.$api.language.login.getWechatAuthServiceError);
			},
		});
	}
	// #endif

	// #ifdef H5
	setTimeout(() => {
		uni.hideLoading();
	}, 2000);
	let h5LoginUrl = uni.$api.appConfig.h5Domain;
	if (h5LoginUrl.endsWith('/')) {
		h5LoginUrl = h5LoginUrl.substr(0, h5LoginUrl.length - 1);
	}
	h5LoginUrl += uni.$api.routesConfig.loginWechat.path;
	//避免缓存
	h5LoginUrl += '?r=' + uni.$api.guid(16);
	h5LoginUrl = encodeURIComponent(h5LoginUrl);
	let jumpUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?
														appid=${shopSetting.value.wechat_appid}&
														redirect_uri=${h5LoginUrl}&
														response_type=code&
														scope=snsapi_userinfo&
														forcePopup=true&
														state=STATE#wechat_redirect`;
	window.location.href = jumpUrl;
	// #endif
}

//微信授权
async function wechatAuthLogin(authApi, params = {}) {
	await uni.$api.http
		.post(authApi, params)
		.then((res) => {
			uni.hideLoading();

			if (!res.data.login) {
				userStore.setThirdPartyUserInfo({
					type: 'wechat',
					userInfo: res.data.user_info,
				});
				// #ifndef MP-WEIXIN
				uni.$api.router.push({
					route: uni.$api.routesConfig.thirdPartyLogin,
				});
				// #endif
				// #ifdef MP-WEIXIN
				modelShow.value = true;
				// #endif
			} else {
				userStore.login(res.data.user_info);

				//是否小程序登录
				// #ifdef MP-WEIXIN
				userStore.setWechatMpLogin(true);
				// #endif

				let pages = getCurrentPages();
				if (pages.length < 2) {
					uni.reLaunch({
						url: uni.$api.appConfig.indexPath,
					});
				} else {
					uni.$api.router.back();
				}
			}
		})
		.catch(() => {
			uni.hideLoading();
		});
}

//小程序微信手机号授权
async function getPhoneNumber(e: Event) {
	uni.showLoading({
		title: uni.$api.language.thirdPartyLogin.authLoading,
		mask: true,
	});
	let pages = getCurrentPages();
	uni.login({
		provider: 'weixin',
		success: async function (loginRes) {
			await uni.$api.http
				.post(
					uni.$api.apiMember.wechatMiniProgramLoginWithMobile +
						'?promo_code=' +
						(promoCode || '') +
						'&dealer_code=' +
						(dealerCode || '') +
						'&store_id=' +
						(storeId || ''),
					{
						encryptedData: e.detail.encryptedData,
						iv: e.detail.iv,
						code: loginRes.code,
						userInfo: userStore.getThirdPartyUserInfo.userInfo,
					}
				)
				.then(async (res) => {
					modelShow.value = false;
					userStore.login(res.data.user_info);
					userStore.setWechatMpLogin(true);
					await authBinding();
					uni.hideLoading();
					let pageBack = 1;
					if (pages.length < pageBack) {
						uni.reLaunch({
							url: uni.$api.appConfig.indexPath,
						});
					} else {
						uni.$api.router.back();
					}
				})
				.catch((err) => {
					uni.hideLoading();
					uni.$api.toast(uni.$api.language.thirdPartyLogin.getWechatAuthInfoError);
				});
		},
		fail: function () {
			uni.hideLoading();
			uni.$api.toast(uni.$api.language.thirdPartyLogin.getWechatAuthServiceError);
		},
	});
}

//第三方登录绑定
async function authBinding() {
	let auth = userStore.getThirdPartyUserInfo;
	let authType = auth.type;
	let authInfo = auth.userInfo;
	let authClient;
	// #ifdef APP-PLUS
	if (authType == 'apple') {
		authClient = 'apple';
	} else if (authType == 'wechat') {
		authClient = 'wechatOP';
	}
	// #endif
	// #ifdef H5
	if (authType == 'wechat') {
		authClient = 'wechat';
	}
	// #endif
	// #ifdef MP-WEIXIN
	if (authType == 'wechat') {
		authClient = 'wechatMp';
	}
	// #endif
	await uni.$api.http
		.post(uni.$api.apiMember.authCreate, {
			...authInfo,
			oauth_client: authClient,
			unionid: authInfo.unionid || '',
			gender: authInfo.sex || authInfo.gender,
			oauth_client_user_id: authInfo.user || authInfo.openid || authInfo.openId,
			head_portrait: authInfo.headimgurl || authInfo.avatarUrl,
			nickname: authInfo.nickname || authInfo.nickName,
		})
		.then(() => {
			if (authInfo.nickname || authInfo.nickName) {
				userStore.setUserNickname(authInfo.nickname || authInfo.nickName);
			}
			if (authInfo.headimgurl || authInfo.avatarUrl) {
				userStore.setUserHeadPortrait(authInfo.headimgurl || authInfo.avatarUrl);
			}
		})
		.catch(() => {
			uni.hideLoading();
		});
}

//苹果登录
function appleSubmit() {
	if (!closeLogin.value) {
		uni.$api.toast('应用暂时关闭登录');
		return;
	}

	if (!agreeCheck.value.length) {
		uni.$api.toast('请仔细阅读并勾选会员协议');
		return;
	}

	uni.showLoading({
		title: uni.$api.language.login.iosLoading,
	});

	plus.oauth.getServices(
		function (services) {
			let appleService;
			if (services && services.length > 0) {
				for (let i = 0; i < services.length; i++) {
					if (services[i].id === 'apple') {
						appleService = services[i];
						break;
					}
				}
				if (!appleService) {
					uni.hideLoading();
					uni.$api.toast(uni.$api.language.login.uninstallIosAuthService);
					return;
				}
				appleService.login(
					async (e) => {
						await uni.$api.http
							.post(
								uni.$api.apiMember.appleLocalLogin +
									'?promo_code=' +
									(promoCode || '') +
									'&dealer_code=' +
									(dealerCode || '') +
									'&store_id=' +
									(storeId || ''),
								{
									...e.target.appleInfo,
								}
							)
							.then((res) => {
								uni.hideLoading();
								if (!res.data.login) {
									userStore.setThirdPartyUserInfo({
										type: 'apple',
										userInfo: res.data.user_info,
									});
									uni.$api.router.push({
										route: uni.$api.routesConfig.thirdPartyLogin,
									});
								} else {
									userStore.login(res.data.user_info);
									if (parseInt(uni.$api.shopSetting.app_service_type) > 0) {
									}
									let pages = getCurrentPages();
									if (pages.length < 2) {
										uni.reLaunch({
											url: uni.$api.appConfig.indexPath,
										});
									} else {
										uni.$api.router.back();
									}
								}
							})
							.catch(() => {
								uni.hideLoading();
								uni.$api.toast(uni.$api.language.login.getIosAuthInfoError);
							});
					},
					function () {
						//  授权失败
						uni.hideLoading();
						uni.$api.toast(uni.$api.language.login.getIosAuthServiceError);
					}
				);
			}
		},
		function () {
			// 获取 services 失败
			uni.hideLoading();
			uni.$api.toast(uni.$api.language.login.getIosAuthServiceError);
		}
	);
}

function goBack(type: string) {
	// 获取当前页面栈，如果页面栈为1，则直接跳转到首页;
	if (currentPages.value.length == 1 || type == 'home') {
		uni.reLaunch({
			url: uni.$api.appConfig.indexPath,
		});
	} else {
		uni.navigateBack({
			delta: 1,
		});
	}
}
</script>

<style lang="scss">
page {
	height: 100%;
	background-color: #fff;
}

.container {
	margin-top: 80rpx;

	.form-wrap {
		padding: 20rpx 36rpx;
	}
}
</style>

<template>
	<view>
		<dz-navbar :is-fixed="true" :title="language.thirdPartyLogin.titleLogin"></dz-navbar>
		<block v-if="mobileBindShow">
			<view class="form-content">
				<dz-form ref="formRef" :model="form" :label-width="140">
					<dz-form-item :label="language.thirdPartyLogin.labelMobile" prop="mobile" :borderBottom="true">
						<dz-input v-model="form.mobile" placeholder="请输入手机号码" clearable border="none">
							<template #prefix>
								<view class="dz-m-r-15" @tap="handleArea">
									{{ areaCodeLabel }}
									<dz-icon name="unfold"></dz-icon>
								</view>
							</template>
						</dz-input>
					</dz-form-item>
					<dz-form-item :label="language.thirdPartyLogin.labelCode" prop="code">
						<dz-input type="text" v-model="form.code" :disabled="isLoaidng" :placeholder="language.thirdPartyLogin.codeHolder" border="none">
							<template #suffix>
								<dz-button
									type="info"
									size="mini"
									hover-class="none"
									shape="circle"
									:border="false"
									:custom-style="{
										background: codeDisabled() || isLoaidng ? theme.dzBaseDisabled : theme.dzBaseColor,
										color: theme.dzBaseFontColor,
									}"
									:disabled="codeDisabled() || waitingCaptcha"
									@click="getCode()"
								>
									{{
										waitingCaptcha
											? api.formatString(language.thirdPartyLogin.getCaptchaLater, waitingSecond)
											: language.thirdPartyLogin.getCaptcha
									}}
								</dz-button>
							</template>
						</dz-input>
					</dz-form-item>
				</dz-form>
			</view>
			<view class="tip">{{ language.thirdPartyLogin.mobileLoginTips }}</view>
			<view class="button" style="margin-top: 100rpx">
				<dz-button
					hover-class="none"
					shape="circle"
					:border="false"
					:custom-style="{
						background: codeDisabled() || !form.code || isBtnLoaidng ? theme.dzBaseDisabled : theme.dzBaseColor,
						color: theme.dzBaseFontColor,
					}"
					:disabled="codeDisabled() || !form.code || isBtnLoaidng"
					:loading="isBtnLoaidng"
					@click="submit"
				>
					{{ language.thirdPartyLogin.submit }}
				</dz-button>
			</view>
		</block>
		<!-- #ifdef MP-WEIXIN -->
		<view class="button" style="margin-top: 50rpx" v-if="wechatMpBindMobile">
			<dz-button type="success" shape="circle" :border="false" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">{{
				language.thirdPartyLogin.mpSubmit
			}}</dz-button>
		</view>
		<!-- #endif -->
		<!--手机号码地区选择-->
		<dz-select
			mode="single-column"
			v-model="areaSelectShow"
			:defaultValue="areaDefaultValue"
			:safe-area-inset-bottom="true"
			:list="mobileAreaInfo"
			@confirm="areaConfirm"
		></dz-select>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';

const language = uni.$api.language;
const formRef = ref(null);
const wechatMpBindMobile = uni.$api.appConfig.wechatMpBindMobile;
const mobilePattern = uni.$api.dataConfig.mobilePattern;
const mobileAreaInfo = ref([]);
const areaDefaultValue = ref<number[]>([]);
const areaCodeLabel = ref<string>('');
const userStore = useUserStore();
const groupData = useGroup();
const theme = computed(() => {
	return userStore.getTheme;
});

const promoCode = computed(() => {
	return userStore.getPromoCode;
});

const dealerCode = computed(() => {
	return userStore.getDealerCode;
});

const storeId = computed(() => {
	return userStore.getStoreId;
});

const lastInputMobile = computed(() => {
	return userStore.getLastInputMobile;
});

const lastSelectMobileArea = computed(() => {
	return userStore.getLastSelectMobileArea;
});

const lastThirdPartyLCaptchaTimeStamp = computed(() => {
	return userStore.getLastThirdPartyLCaptchaTimeStamp;
});

const thirdPartyUserInfo = computed(() => {
	return userStore.getThirdPartyUserInfo;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref(null);
const isLoaidng = ref<Boolean>(false);
const isBtnLoaidng = ref<Boolean>(false);
const mobileBindShow = ref<Boolean>(false);
const areaSelectShow = ref<Boolean>(false);
const source = ref<string>('');

const form = reactive({
	mobile: lastInputMobile.value,
	mobile_area: lastSelectMobileArea.value || '86',
	code: '',
});

const rules = {
	mobile: [
		{
			type: 'string',
			required: true,
			message: '请输入手机号',
			trigger: ['blur', 'change'],
		},
		{
			validator: (rule, value, callback) => {
				return uni.$api.isMobile(form.mobile_area + value, form.mobile_area);
			},
			message: '请输入正确的手机号',
			trigger: ['change', 'blur'],
		},
	],

	code: {
		type: 'string',
		required: true,
		message: '请输入验证码',
		trigger: ['blur'],
	},
};

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.thirdPartyLogin.titleLogin,
	});
	areaCodeLabel.value = mobilePattern[form.mobile_area].label;
	for (let area in mobilePattern) {
		mobileAreaInfo.value.push({ value: area, label: mobilePattern[area].label });
	}
	source.value = options.source || '';
	//判断数据
	// if (thirdPartyUserInfo.value && !thirdPartyUserInfo.value.type) {
	// 	uni.$api.router.redirectTo({
	// 		route: uni.$api.routesConfig.fail,
	// 		query: {},
	// 	});
	// }
	// #ifndef MP-WEIXIN
	mobileBindShow.value = true;
	// #endif
	// #ifdef MP-WEIXIN
	mobileBindShow.value = !uni.$api.appConfig.wechatMpOnlyBindMobile;
	// #endif
});

onReady(() => {
	unref(formRef).setRules(rules);
});

onShow(() => {
	computeLastCaptcha();
});

function codeDisabled() {
	if (uni.$api.isMobile(form.mobile_area + form.mobile, form.mobile_area)) {
		return false;
	}
	return true;
}

function computeLastCaptcha() {
	if (timeInterval.value) {
		return;
	}
	const lastCaptchaTimeStamp = lastThirdPartyLCaptchaTimeStamp.value;
	let timeNow = parseInt(new Date().getTime() / 1000);
	let timeDiff = timeNow - lastCaptchaTimeStamp;
	if (timeDiff < uni.$api.appConfig.loginCodeSecond && timeDiff >= 0) {
		waitingCaptcha.value = true;
		waitingSecond.value = uni.$api.appConfig.loginCodeSecond - timeDiff;
		timeInterval.value = setInterval(() => {
			waitingSecond.value--;
			if (waitingSecond.value <= 0) {
				waitingCaptcha.value = false;
				clearInterval(timeInterval.value);
				timeInterval.value = null;
			}
		}, 1000);
	} else {
		waitingCaptcha.value = false;
	}
}

function handleArea() {
	const findIndex = mobileAreaInfo.value.findIndex((item) => item.value == form.mobile_area);
	if (findIndex != -1) {
		areaDefaultValue.value = [findIndex];
	}
	areaSelectShow.value = true;
}

function areaConfirm(e) {
	form.mobile_area = e[0].value;
	areaCodeLabel.value = e[0].label;
}

function getCode() {
	uni.showLoading({
		title: language.thirdPartyLogin.codeLoading,
		mask: true,
	});
	if (uni.$api.isMobile(String(form.mobile_area) + form.mobile, form.mobile_area)) {
		uni.$api.http
			.post(uni.$api.apiMember.smsCode, {
				mobile: form.mobile,
				mobile_area: form.mobile_area,
				usage: 'register-or-login',
			})
			.then(() => {
				uni.hideLoading();
				userStore.setLastCaptchaTimeStamp('lastThirdPartyLCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
				userStore.setLastInputMobile(form.mobile);
				userStore.setLastSelectMobileArea(form.mobile_area);
				computeLastCaptcha();
			})
			.catch(() => {
				uni.hideLoading();
			});
	} else {
		uni.$api.toast(uni.$api.language.thirdPartyLogin.mobileError);
		uni.hideLoading();
	}
}

//微信小程序手机号授权
function getPhoneNumber(e) {
	uni.showLoading({
		title: uni.$api.language.thirdPartyLogin.authLoading,
		mask: true,
	});
	let pages = getCurrentPages();
	uni.login({
		provider: 'weixin',
		success: async function (loginRes) {
			await uni.$api.http
				.post(uni.$api.apiMember.wechatMiniProgramLoginWithMobile, {
					encryptedData: e.detail.encryptedData,
					iv: e.detail.iv,
					code: loginRes.code,
					promo_code: promoCode.value,
					dealer_code: dealerCode.value,
					store_id: storeId.value,
					userInfo: userStore.getThirdPartyUserInfo.userInfo,
				})
				.then(async (res) => {
					userStore.login(res.data.user_info);
					userStore.setWechatMpLogin(true);
					await authBinding();
					uni.hideLoading();
					// let pageBack = 1;
					// if (source.value == 'autoLogin') {
					// 	pageBack = 1;
					// } else {
					// 	pageBack = 2;
					// }
					// if (pages.length <= pageBack) {
					// 	uni.reLaunch({
					// 		url: uni.$api.appConfig.indexPath,
					// 	});
					// } else {
					// 	uni.$api.router.back(pageBack);
					// }
				})
				.catch(() => {
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

//绑定手机号注册
function submit() {
	unref(formRef)
		.validate()
		.then(async () => {
			if (isBtnLoaidng.value) {
				return;
			}

			isBtnLoaidng.value = true;
			uni.showLoading({
				mask: true,
			});
			let formData = {
				mobile: form.mobile,
				mobile_area: form.mobile_area,
				code: form.code,
				promo_code: promoCode.value,
				dealer_code: dealerCode.value,
				store_id: storeId.value,
				nickname: '+' + form.mobile_area + ' ' + uni.$api.maskCode(form.mobile, 3, 4),
				group: groupData.group,
			};

			await uni.$api.http
				.post(uni.$api.apiMember.mobileCodeLogin, {
					...formData,
				})
				.then(async (res) => {
					userStore.login(res.data);
					// 是否小程序登录
					if (res.data.member && res.data.member.auth && res.data.member.auth.wechatMp) {
						userStore.setWechatMpLogin(true);
					}
					await authBinding();
					isBtnLoaidng.value = false;
					// uni.hideLoading();
					// // 获取当前页面栈，如果页面栈小于3，则直接跳转到首页
					// let pages = getCurrentPages();
					// if (pages.length < 3) {
					// 	uni.reLaunch({
					// 		url: uni.$api.appConfig.indexPath,
					// 	});
					// } else {
					// 	uni.$api.router.back(2);
					// }
				})
				.catch(() => {
					isBtnLoaidng.value = false;
					uni.hideLoading();
				});
		});
}

//第三方登录绑定
async function authBinding() {
	let auth = thirdPartyUserInfo.value;
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
		.then((res) => {
			const _userInfo = userInfo.value;
			if (authInfo.nickname || authInfo.nickName) {
				userStore.setUserNickname(authInfo.nickname || _userInfo.nickName);
			}
			if (authInfo.headimgurl || authInfo.avatarUrl) {
				userStore.setUserHeadPortrait(authInfo.headimgurl || authInfo.avatarUrl);
			}
			uni.$api.toast('绑定成功');
			setTimeout(() => {
				uni.reLaunch({
					url: uni.$api.routesConfig.profile.path,
				});
			}, 300);
		})
		.catch(() => {
			isBtnLoaidng.value = false;
			uni.hideLoading();
		});
}
</script>

<style lang="scss" scoped>
.form-content {
	margin: 20rpx;
	padding: 10rpx 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
}
.tip {
	margin-top: 30rpx;
	text-align: center;
	color: $dz-tips-color;
	font-size: 24rpx;
}
.button {
	margin: 0 30rpx;
}
</style>

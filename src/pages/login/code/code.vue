<template>
	<view>
		<dz-navbar title="验证码登录"></dz-navbar>
		<view class="key-input dz-main-color">
			<view class="dz-font-50">请输入验证码</view>
			<view class="dz-m-t-20">{{ api.formatString('验证码已发送至{0}', maskMobile) }}</view>
		</view>
		<dz-code-input
			:disabled-keyboard="true"
			:value="code"
			:active-color="theme.dzBaseColor"
			@finish="codeFinish"
			mode="bottomLine"
			:maxlength="maxlength"
		></dz-code-input>
		<dz-keyboard
			v-model="keyboardShow"
			mode="number"
			:z-index="api.zIndex.navbar - 1"
			:dot-enabled="false"
			:tips="waitingCaptcha ? api.formatString(language.loginCode.getCaptchaLater, waitingSecond) : language.loginCode.noCaptcha"
			:tips-color="waitingCaptcha ? theme.dzMainColor : theme.dzBaseColor"
			:show-tips="true"
			:cancel-btn="false"
			:confirm-btn="false"
			:mask="false"
			:safe-area-inset-bottom="true"
			:mask-close-able="false"
			@change="keyboardChange"
			@backspace="keyboardBackspace"
			@tipsClick="keyboardTipsClick"
		></dz-keyboard>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';

const userStore = useUserStore();
const groupData = useGroup();
const language = uni.$api.language;
const code = ref<string>('');
const keyboardShow = ref<Boolean>(true);
const isLoading = ref<Boolean>(false);
const mobile = ref<string>('');
const mobile_area = ref<string>('');
const maskMobile = ref<string>('');
const maxlength = ref<number>(4);
const { promoCode, dealerCode, storeId, lastLoginCaptchaTimeStamp } = userStore.getData;
const lastCaptchaTimeStamp = ref(lastLoginCaptchaTimeStamp);
const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref();

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	mobile.value = uni.$api.strDecode(options.mobile);
	mobile_area.value = uni.$api.strDecode(options.mobile_area);
	maskMobile.value = '+' + mobile_area.value + ' ' + uni.$api.maskCode(mobile.value, 3, 4);
	computeLastCaptcha();

	if (options.code) {
		uni.$api.toast('您的验证码是:' + options.code);
	}
});

function computeLastCaptcha() {
	if (timeInterval.value) {
		return;
	}
	lastCaptchaTimeStamp.value = lastLoginCaptchaTimeStamp;
	let timeNow = parseInt(new Date().getTime() / 1000);
	let timeDiff = timeNow - lastCaptchaTimeStamp.value;
	if (timeDiff < 60 && timeDiff >= 0) {
		waitingCaptcha.value = true;
		waitingSecond.value = 60 - timeDiff;
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

function keyboardChange(e) {
	if (code.value.length >= maxlength.value) {
		return;
	}
	code.value += e;
}
function keyboardBackspace() {
	if (code.value.length) {
		code.value = code.value.substr(0, code.value.length - 1);
	}
}

function keyboardTipsClick() {
	if (waitingCaptcha.value) {
		return;
	}
	if (isLoading.value) {
		return;
	}
	isLoading.value = true;
	uni.showLoading({
		mask: true,
	});
	if (uni.$api.isMobile(mobile.value)) {
		uni.$api.http
			.post(uni.$api.apiMember.smsCode, {
				mobile: mobile.value,
				mobile_area: mobile_area.value,
				usage: 'register-or-login',
			})
			.then((res) => {
				if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
					code.value = res.data;
					uni.$api.toast(res.data);
				}
				userStore.setLastCaptchaTimeStamp('lastLoginCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
				computeLastCaptcha();
				isLoading.value = false;
				uni.hideLoading();
				uni.$api.toast(uni.$api.language.loginCode.codeSend);
			})
			.catch(() => {
				uni.hideLoading();
				isLoading.value = false;
			});
	} else {
		uni.hideLoading();
		isLoading.value = false;
		uni.$api.toast(uni.$api.language.loginCode.mobileError);
	}
}

// 输入完验证码最后一位执行
function codeFinish() {
	if (isLoading.value) {
		return;
	}
	isLoading.value = true;
	uni.showLoading({
		mask: true,
	});
	let formData = {
		mobile: mobile.value,
		mobile_area: mobile_area.value,
		code: code.value,
		promo_code: promoCode,
		dealer_code: dealerCode,
		store_id: storeId,
		group: groupData.group,
	};

	uni.$api.http
		.post(uni.$api.apiMember.mobileCodeLogin, {
			...formData,
		})
		.then((res) => {
			userStore.login(res.data);
			// 是否小程序登录
			if (res.data.member && res.data.member.auth && res.data.member.auth.wechatMp) {
				userStore.setWechatMpLogin(true);
			}
			isLoading.value = false;
			uni.hideLoading();
			// 获取当前页面栈，如果页面栈小于1，则直接跳转到首页
			let pages = getCurrentPages();
			console.log(pages);
			if (pages.length <= 1) {
				uni.reLaunch({
					url: uni.$api.appConfig.indexPath,
				});
			} else {
				uni.$api.router.back();
			}
		})
		.catch(() => {
			keyboardShow.value = true;
			isLoading.value = false;
			uni.hideLoading();
		});
}
</script>

<style lang="scss">
page {
	background-color: #fff;
}

.key-input {
	padding: 110rpx 80rpx 80rpx 80rpx;
}
</style>

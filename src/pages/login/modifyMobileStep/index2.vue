<template>
	<view>
		<dz-navbar :title="language.modifyMobile.titleModifyMobile"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" :label-width="140">
				<dz-form-item :label="language.modifyMobile.labelMobile" prop="mobile" :borderBottom="true">
					<dz-input v-model="form.mobile" placeholder="请输入手机号码" clearable border="none">
						<template #prefix>
							<view class="dz-m-r-15" @tap="handleArea">
								{{ areaName }}
								<dz-icon name="unfold"></dz-icon>
							</view>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item :label="language.modifyMobile.labelCode" prop="code">
					<dz-input type="text" v-model="form.code" :disabled="isLoaidng" :placeholder="language.modifyMobile.codeHolder" border="none">
						<template #suffix>
							<dz-button
								shape="circle"
								type="info"
								size="mini"
								hover-class="none"
								:border="false"
								:custom-style="{
									background: codeDisabled() || isLoaidng ? theme.dzBaseDisabled : theme.dzBaseColor,
									color: theme.dzBaseFontColor,
								}"
								:disabled="codeDisabled() || waitingCaptcha"
								@click="getCode"
							>
								{{ waitingCaptcha ? api.formatString(language.bindMobile.getCaptchaLater, waitingSecond) : language.bindMobile.getCaptcha }}
							</dz-button>
						</template>
					</dz-input>
				</dz-form-item>
			</dz-form>
		</view>
		<view class="button" style="margin-top: 100rpx">
			<dz-button
				shape="circle"
				:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
				:border="false"
				hover-class="none"
				@click="submit"
			>
				{{ language.modifyMobile.submit }}
			</dz-button>
		</view>
		<!-- #ifdef MP-WEIXIN -->
		<view class="button" style="margin-top: 30rpx">
			<dz-button type="success" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">{{ language.thirdPartyLogin.mpSubmit }}</dz-button>
		</view>
		<!-- #endif -->
		<dz-select v-model="pickerShow" mode="single-column" :safe-area-inset-bottom="true" :list="mobileAreaInfo" @confirm="areaConfirm"> </dz-select>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';

const userStore = useUserStore();
const groupData = useGroup();
const language = uni.$api.language;

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const lastInputMobile = computed(() => {
	return userStore.getLastInputMobile;
});

const lastSelectMobileArea = computed(() => {
	return userStore.getLastSelectMobileArea;
});

const lastMobileReBindCaptchaTimeStamp = computed(() => {
	return userStore.getLastMobileReBindCaptchaTimeStamp;
});

const formRef = ref(null);
const type = ref<string>('');
const pickerShow = ref<boolean>(false);
const mobilePattern = uni.$api.dataConfig.mobilePattern;
const mobileAreaInfo = ref([]);
const areaName = ref('');
const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref();
const isLoaidng = ref<Boolean>(false);
const form = reactive({
	mobile: lastInputMobile.value || userInfo.value.mobile,
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
		title: language.modifyMobile.titleModifyMobile,
	});
	type.value = options.type;
	for (let area in mobilePattern) {
		mobileAreaInfo.value.push({
			value: area,
			label: mobilePattern[area].label,
		});
	}
	areaName.value = mobilePattern[form.mobile_area].label;
});

onShow(() => {
	computeLastCaptcha();
});

onReady(() => {
	unref(formRef).setRules(rules);
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
	let timeNow = parseInt(new Date().getTime() / 1000);
	let timeDiff = timeNow - lastMobileReBindCaptchaTimeStamp.value;
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

function handleArea() {
	pickerShow.value = true;
}

function getCode() {
	if (isLoaidng.value) return;
	if (!form.mobile) {
		uni.$api.toast(uni.$api.language.bindMobile.bindError);
		return;
	}
	uni.showLoading({
		title: language.thirdPartyLogin.codeLoading,
	});

	if (!uni.$api.isMobile(form.mobile_area + form.mobile, form.mobile_area)) {
		uni.$api.toast(uni.$api.language.loginCode.mobileError);
		return;
	}
	isLoaidng.value = true;
	//发送验证码并跳转
	uni.$api.http
		.post(uni.$api.apiMember.smsCode, {
			mobile: form.mobile,
			mobile_area: form.mobile_area,
			usage: 'rebind',
		})
		.then((res) => {
			userStore.setLastCaptchaTimeStamp('lastMobileReBindCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			userStore.setLastInputMobile(form.mobile);
			userStore.setLastSelectMobileArea(form.mobile_area);
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				form.code = res.data;
			}
			computeLastCaptcha();
		})
		.finally(() => {
			uni.hideLoading();
			isLoaidng.value = false;
		});
}

function areaConfirm(e: any) {
	form.mobile_area = e[0].value;
	areaName.value = e[0].label;
}

//微信小程序手机号授权
function getPhoneNumber(e: Event) {
	uni.showLoading({
		title: language.thirdPartyLogin.authLoading,
		mask: true,
	});
	uni.login({
		provider: 'weixin',
		success: async function (loginRes) {
			await uni.$api.http
				.post(uni.$api.apiShop.mpWechatMobileModify, {
					encryptedData: e.detail.encryptedData,
					iv: e.detail.iv,
					code: loginRes.code,
				})
				.then((res) => {
					uni.hideLoading();
					useStore.setUserMobile(res.data);
					useStore.setUserMobileArea('86');
					let pages = getCurrentPages();
					if (pages.length < 2) {
						uni.reLaunch({
							url: uni.$api.appConfig.indexPath,
						});
					} else {
						uni.$api.router.back();
					}
				})
				.catch(() => {
					uni.hideLoading();
				});
		},
		fail: function () {
			uni.hideLoading();
			uni.$api.toast(language.thirdPartyLogin.getWechatAuthServiceError);
		},
	});
}

//修改手机号码
function submit(e: any) {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isLoaidng.value) {
				return;
			}
			isLoaidng.value = true;
			uni.showLoading({
				mask: true,
			});
			let formData = {
				...form,
				id: userInfo.value.id,
				group: groupData.group,
			};

			uni.$api.http
				.post(uni.$api.apiMember.mobileRebind, {
					...formData,
				})
				.then(() => {
					isLoaidng.value = false;
					userStore.setUserMobile(e.mobile);
					userStore.setUserMobileArea(e.mobile_area);
					if (type.value) {
						uni.$emit('updateMoible');
					}
					let pages = getCurrentPages();
					if (pages.length < 2) {
						uni.reLaunch({
							url: uni.$api.appConfig.indexPath,
						});
					} else {
						uni.$api.router.back();
					}
				})
				.finally(() => {
					isLoaidng.value = false;
					uni.hideLoading();
				});
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

.button {
	margin: 0 30rpx;
}
</style>

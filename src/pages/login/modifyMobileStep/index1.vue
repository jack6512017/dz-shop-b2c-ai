<template>
	<view>
		<dz-navbar :title="language.modifyMobile.titleModifyMobile"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" :label-width="140">
				<dz-form-item :required="false" label="原手机号" :borderBottom="true">
					<dz-input
						type="text"
						:modelValue="'+' + String(form.mobile_area) + '-' + form.mobile"
						:disabled="true"
						border="none"
						:customStyle="{ background: 'transparent' }"
					/>
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelCode" prop="code">
					<dz-input type="text" v-model="form.code" :disabled="isLoaidng" :placeholder="language.modifyPassword.codeHolder" border="none">
						<template #suffix>
							<dz-button
								shape="circle"
								type="info"
								size="mini"
								hover-class="none"
								:border="false"
								:custom-style="{ background: isLoaidng ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
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
				:border="false"
				:custom-style="{ width: '100%', background: isLoaidng ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				hover-class="none"
				shape="circle"
				:loading="isLoaidng"
				@click="submit"
			>
				{{ language.modifyMobile.submitVerify }}
			</dz-button>
		</view>
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

const lastSelectMobileArea = computed(() => {
	return userStore.getLastSelectMobileArea;
});

const lastMobileUnBindCaptchaTimeStamp = computed(() => {
	return userStore.getLastMobileUnBindCaptchaTimeStamp;
});

const formRef = ref(null);
const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref();
const isLoaidng = ref<Boolean>(false);
const form = reactive({
	mobile: userInfo.value.mobile,
	mobile_area: lastSelectMobileArea.value || '86',
	code: '',
});

const rules = {
	code: {
		type: 'string',
		required: true,
		message: '请输入验证码',
		trigger: ['blur'],
	},
};

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.modifyMobile.titleModifyMobile,
	});
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
	let timeDiff = timeNow - lastMobileUnBindCaptchaTimeStamp.value;
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
			usage: 'unbind',
		})
		.then((res) => {
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				form.code = res.data;
			}
			userStore.setLastCaptchaTimeStamp('lastMobileUnBindCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			userStore.setLastInputMobile(form.mobile);
			userStore.setLastSelectMobileArea(form.mobile_area);
			computeLastCaptcha();
		})
		.finally(() => {
			uni.hideLoading();
			isLoaidng.value = false;
		});
}

//修改手机号码
function submit() {
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
				.post(uni.$api.apiMember.mobileUnbind, {
					...formData,
				})
				.then(() => {
					//跳转到第二步
					uni.$api.router.redirectTo({
						route: uni.$api.routesConfig.modifyMobileStep2,
					});
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

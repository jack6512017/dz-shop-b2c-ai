<template>
	<view>
		<dz-navbar :title="language.modifyPassword.titleModifyPassword"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" :label-width="140">
				<dz-form-item :required="false" :label="language.modifyPassword.labelMobile" :borderBottom="true">
					<dz-input
						type="text"
						:modelValue="'+' + String(form.mobile_area) + '-' + form.mobile"
						:disabled="true"
						border="none"
						:customStyle="{ background: 'transparent' }"
					/>
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelPassword" prop="password" :borderBottom="true">
					<dz-input type="password" v-model="form.password" maxlength="20" border="none" clearable placeholder="请输入密码" />
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelConfirmPassword" prop="password_repetition" :borderBottom="true">
					<dz-input type="password" v-model="form.password_repetition" maxlength="20" border="none" clearable placeholder="请输入确认密码" />
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelCode" prop="code">
					<dz-input type="text" v-model="form.code" :disabled="isLoaidng" :placeholder="language.modifyPassword.codeHolder" border="none" clearable>
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
								@click="getCode"
							>
								{{
									waitingCaptcha
										? api.formatString(language.modifyPassword.getCaptchaLater, waitingSecond)
										: language.modifyPassword.getCaptcha
								}}
							</dz-button>
						</template>
					</dz-input>
				</dz-form-item>
			</dz-form>
		</view>
		<view class="button" style="margin-top: 100rpx">
			<dz-button
				:border="false"
				:custom-style="{ background: isLoaidng ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				hover-class="none"
				shape="circle"
				:loading="isLoaidng"
				@click="submit"
			>
				{{ language.modifyPassword.submit }}
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

const lastInputMobile = computed(() => {
	return userStore.getLastInputMobile;
});

const lastSelectMobileArea = computed(() => {
	return userStore.getLastSelectMobileArea;
});

const lastUpdatePasswordCaptchaTimeStamp = computed(() => {
	return userStore.getLastUpdatePasswordCaptchaTimeStamp;
});

const formRef = ref(null);
const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref();
const isLoaidng = ref<Boolean>(false);
const form = reactive({
	mobile: lastInputMobile.value || unref(userInfo)?.mobile,
	mobile_area: lastSelectMobileArea.value || '86',
	password: '',
	password_repetition: '',
	code: '',
});

const rules = {
	password: {
		type: 'string',
		required: true,
		message: '请输入密码',
		trigger: ['blur'],
	},
	password_repetition: [
		{
			type: 'string',
			required: true,
			message: '请输入密码',
			trigger: ['blur', 'change'],
		},
		{
			// 此为同步验证，可以直接返回true或者false，如果是异步验证，稍微不同，见下方说明
			validator: (rule, value, callback) => {
				// 调用uView自带的js验证规则，详见：https://www.uviewui.com/js/test.html
				return value == form.password;
			},
			message: '两次输入的密码不一致',
			// 触发器可以同时用blur和change，二者之间用英文逗号隔开
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
	let timeDiff = timeNow - lastUpdatePasswordCaptchaTimeStamp.value;
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
			usage: 'up-pwd',
		})
		.then((res) => {
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				form.code = res.data;
			}
			userStore.setLastCaptchaTimeStamp('lastUpdatePasswordCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			userStore.setLastInputMobile(form.mobile);
			userStore.setLastSelectMobileArea(form.mobile_area);
			computeLastCaptcha();
		})
		.finally(() => {
			uni.hideLoading();
			isLoaidng.value = false;
		});
}

//修改密码
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
				.post(uni.$api.apiMember.updatePassword, {
					...formData,
				})
				.then((res) => {
					isLoaidng.value = false;
					uni.$api.toast('密码修改成功');
					userStore.login(res.data);
				})
				.finally(() => {
					isLoaidng.value = false;
					uni.hideLoading();
				});
		})
		.catch((errors) => {
			uni.$api.toast('校验失败');
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

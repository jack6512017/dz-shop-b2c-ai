<template>
	<view>
		<dz-navbar :is-fixed="true" :title="title" titleWidth="290"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="手机号" prop="mobile" borderBottom="true">
					<dz-input v-model="form.mobile" placeholder="请输入手机号" disabled border="none" disabledColor="transparent">
						<template #prefix>
							<view class="dz-m-r-15"> +{{ areaCode }} </view>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelPassword" prop="pay_password" borderBottom="true">
					<dz-input type="password" v-model="form.pay_password" maxlength="20" border="none" clearable placeholder="请输入密码" />
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelConfirmPassword" prop="pay_password_repetition" borderBottom="true">
					<dz-input type="password" v-model="form.pay_password_repetition" clearable maxlength="20" border="none" placeholder="请输入确认密码" />
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelCode" prop="code">
					<dz-input type="text" v-model="form.code" :disabled="isLoading" clearable :placeholder="language.modifyPassword.codeHolder" border="none">
						<template #suffix>
							<dz-button
								type="info"
								size="mini"
								hover-class="none"
								:border="false"
								shape="circle"
								:custom-style="{ background: isLoading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
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
				:custom-style="{ width: '100%', background: isButtonLoading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				hover-class="none"
				shape="circle"
				:loading="isButtonLoading"
				@click="submit"
			>
				确定
			</dz-button>
		</view>
		<dz-modal
			v-model:show="bindMoible"
			:title="language.application.modalTitle"
			content="请您先绑定手机号再进行其它操作"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="false"
			@confirm="toPage('bindMobile')"
		></dz-modal>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';

const userStore = useUserStore();
const groupData = useGroup();
const language = uni.$api.language;
const formRef = ref(null);
const { lastInputMobile, lastSelectMobileArea, lastUpdatePayPasswordCaptchaTimeStamp } = userStore.getData;
const title = ref<string>();
const type = ref<string>();
const path = ref<string>();
let query = null;
const lastCaptchaTimeStamp = ref(lastUpdatePayPasswordCaptchaTimeStamp);
const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref();
const isLoading = ref<Boolean>(false);
const isButtonLoading = ref<Boolean>(false);
const bindMoible = ref<Boolean>(false);

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const data = reactive({
	form: {
		mobile: lastInputMobile || userInfo.value.mobile,
		pay_password: '',
		pay_password_repetition: '',
		code: '',
	},
});

const areaCode = ref(userInfo.value.mobile_area);
const rules = {
	pay_password: {
		type: 'string',
		required: true,
		message: '请输入密码',
		trigger: ['blur'],
	},
	pay_password_repetition: [
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
				return value == data.form.pay_password;
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

onLoad(async (options) => {
	await uni.$onLaunched;
	title.value = '设置支付密码';
	if (options.type) {
		type.value = options.type;
	}
	if (options.path) {
		path.value = options.path;
	}
	if (options.query) {
		query = JSON.parse(options.query);
	}
	uni.setNavigationBarTitle({
		title: title.value,
	});
	uni.$on('updateMoible', (data) => {
		areaCode.value = userInfo.value.mobile_area;
		data.form.mobile = userInfo.value.mobile;
		waitingSecond.value = uni.$api.appConfig.loginCodeSecond;
	});
	if (!data.form.mobile) {
		bindMoible.value = true;
	}
});

onShow(() => {
	computeLastCaptcha();
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function codeDisabled() {
	if (uni.$api.isMobile(areaCode.value + data.form.mobile, areaCode.value)) {
		return false;
	}
	return true;
}

function computeLastCaptcha() {
	if (timeInterval.value) {
		return;
	}
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

function getCode() {
	if (isLoading.value) return;
	if (!data.form.mobile) {
		uni.$api.toast(uni.$api.language.bindMobile.bindError);
		return;
	}
	uni.showLoading({
		title: language.thirdPartyLogin.codeLoading,
	});

	if (!uni.$api.isMobile(areaCode.value + data.form.mobile, areaCode.value)) {
		uni.$api.toast(uni.$api.language.loginCode.mobileError);
		return;
	}
	isLoading.value = true;
	//发送验证码并跳转
	uni.$api.http
		.post(uni.$api.apiMember.smsCode, {
			mobile: data.form.mobile,
			mobile_area: areaCode.value,
			usage: 'set-pay-pwd',
		})
		.then((res) => {
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				data.form.code = res.data;
			}
			userStore.setLastCaptchaTimeStamp('lastUpdatePayPasswordCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			computeLastCaptcha();
		})
		.finally(() => {
			uni.hideLoading();
			isLoading.value = false;
		});
}

//修改手机号码
function submit(e: any) {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isButtonLoading.value) {
				return;
			}
			isButtonLoading.value = true;
			uni.showLoading({
				mask: true,
			});
			let formData = {
				...data.form,
				id: userInfo.value.id,
				group: groupData.group,
			};

			uni.$api.http
				.post(uni.$api.apiMember.setPayPassword, {
					...formData,
				})
				.then((res) => {
					isButtonLoading.value = false;
					if (title.value == '设置支付密码') {
						uni.$api.toast('设置密码成功');
						uni.$emit('memberChange', {});
						setTimeout(() => {
							if (type.value == 'add' && path.value) {
								uni.$api.router.redirectTo({
									route: uni.$api.routesConfig[path.value],
									query: {
										...query,
									},
								});
							} else {
								uni.$api.router.redirectTo({
									route: uni.$api.routesConfig.brokerageTransfer,
									query: {
										type: type.value == 'add' ? '' : type.value,
									},
								});
							}
						}, 300);
					} else {
						uni.$api.toast('密码修改成功');
						setTimeout(() => {
							uni.$api.router.back();
						}, 300);
					}
				})
				.catch((err) => {
					isButtonLoading.value = false;
					uni.$api.toast(err);
				});

			uni.hideLoading();
		});
}

const { form } = { ...toRefs(data) };
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

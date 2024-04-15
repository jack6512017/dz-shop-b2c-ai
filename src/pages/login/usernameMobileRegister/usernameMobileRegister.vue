<template>
	<view>
		<dz-navbar title="注册"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" :label-width="140">
				<dz-form-item label="用户名" prop="username" :borderBottom="true">
					<dz-input v-model="form.username" maxlength="20" border="none" clearable placeholder="请输入用户名" />
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelPassword" prop="password" :borderBottom="true">
					<dz-input :password="isPassword" v-model="form.password" maxlength="20" border="none" clearable placeholder="请输入密码">
						<template #suffix>
							<dz-icon class="dz-p-6" :name="isPassword ? 'attentionforbidfill' : 'attentionfill'" size="32" @click="passwordChange(1)"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelConfirmPassword" prop="password_repetition" :borderBottom="true">
					<dz-input
						:password="isPasswordRepetition"
						v-model="form.password_repetition"
						maxlength="20"
						clearable
						placeholder="请输入确认密码"
						border="none"
					>
						<template #suffix>
							<dz-icon
								class="dz-p-6"
								:name="isPasswordRepetition ? 'attentionforbidfill' : 'attentionfill'"
								size="32"
								@click="passwordChange(2)"
							></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="手机号" prop="mobile" :borderBottom="true">
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
					<dz-input type="text" v-model="form.code" :disabled="isLoading" :placeholder="language.modifyMobile.codeHolder" border="none">
						<template #suffix>
							<dz-button
								type="info"
								shape="circle"
								size="mini"
								hover-class="none"
								:border="false"
								:custom-style="{
									background: codeDisabled() || isLoading ? theme.dzBaseDisabled : theme.dzBaseColor,
									color: theme.dzBaseFontColor,
								}"
								:disabled="codeDisabled() || waitingCaptcha"
								@click="getIsMobileRegiste()"
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
				:loading="isBtnLoading"
				@click="submit"
			>
				确定
			</dz-button>
		</view>
		<dz-select v-model="selectShow" mode="single-column" :safe-area-inset-bottom="true" :list="mobileAreaInfo" @confirm="areaConfirm"> </dz-select>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';

const userStore = useUserStore();
const groupData = useGroup();

const lastInputMobile = computed(() => {
	return userStore.getLastInputMobile;
});

const lastSelectMobileArea = computed(() => {
	return userStore.getLastSelectMobileArea;
});

const language = uni.$api.language;
const formRef = ref(null);
const isPassword = ref<Boolean>(true);
const isPasswordRepetition = ref<Boolean>(true);
const selectShow = ref<boolean>(false);
const mobilePattern = uni.$api.dataConfig.mobilePattern;
const mobileAreaInfo = ref([]);
const areaName = ref('');
const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref(null);
const isLoading = ref<Boolean>(false);
const isBtnLoading = ref<Boolean>(false);
const form = reactive({
	username: '',
	password: '',
	mobile: lastInputMobile.value,
	password_repetition: '',
	mobile_area: lastSelectMobileArea.value || '86',
	code: '',
});

const rules = {
	username: [
		{
			type: 'string',
			required: true,
			message: '请输入用户名',
			trigger: ['blur', 'change'],
		},

		{
			pattern: /^[_\w\d]{6,20}$/iu,
			transform(value) {
				return String(value);
			},
			message: '用户名由英文大小写、数字和下划线组成，6-20位',
			trigger: ['blur', 'change'],
		},
		{ min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: ['blur', 'change'] },
	],
	password: {
		type: 'string',
		required: true,
		message: '请输入密码',
		trigger: ['blur', 'change'],
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

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: '注册' });
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

function passwordChange(type: number) {
	if (type === 1) {
		isPassword.value = !isPassword.value;
	} else {
		isPasswordRepetition.value = !isPasswordRepetition.value;
	}
}

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
	const lastCaptchaTimeStamp = userStore.getLastUsernameMobileRegisterCaptchaTimeStamp;
	let timeNow = parseInt(new Date().getTime() / 1000);
	let timeDiff = timeNow - lastCaptchaTimeStamp;
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
	selectShow.value = true;
}

function getIsMobileRegiste() {
	if (isLoading.value) return;
	uni.$api.http
		.post(uni.$api.apiMember.isMobileRegister, {
			mobile: form.mobile,
			mobile_area: form.mobile_area,
		})
		.then(() => {
			getCode();
		})
		.finally(() => {
			isLoading.value = false;
		});
}

function getCode() {
	if (isLoading.value) return;
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
	isLoading.value = true;
	uni.$api.http
		.post(uni.$api.apiMember.smsCode, {
			mobile: form.mobile,
			mobile_area: form.mobile_area,
			usage: 'register',
		})
		.then((res) => {
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				uni.$api.toast(res.data);
			}
			userStore.setLastCaptchaTimeStamp('lastUsernameMobileRegisterCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			userStore.setLastInputMobile(form.mobile);
			userStore.setLastSelectMobileArea(form.mobile_area);
			computeLastCaptcha();
		})
		.finally(() => {
			uni.hideLoading();
			isLoading.value = false;
		});
}

function areaConfirm(e) {
	form.mobile_area = e[0].value;
	areaName.value = e[0].label;
}

//修改手机号码
function submit() {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isBtnLoading.value) {
				return;
			}
			isBtnLoading.value = true;
			uni.showLoading({
				mask: true,
			});
			let formData = {
				...form,
				group: groupData.group,
				promo_code: userStore.getPromoCode || '',
				dealer_code: userStore.getDealerCode || '',
				store_id: userStore.getStoreId || '',
			};

			uni.$api.http
				.post(uni.$api.apiMember.usernameMobileRegister, {
					...formData,
				})
				.then((res) => {
					userStore.setUserMobile(form.mobile);
					userStore.setUserMobileArea(form.mobile_area);
					userStore.login(res.data);
					// 是否小程序登录
					if (res.data.member && res.data.member.auth && res.data.member.auth.wechatMp) {
						userStore.setWechatMpLogin(true);
					}

					let pages = getCurrentPages();
					if (pages.length < 2) {
						uni.reLaunch({
							url: uni.$api.appConfig.indexPath,
						});
					} else {
						uni.$api.router.back(2);
					}
				})
				.finally(() => {
					isBtnLoading.value = false;
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

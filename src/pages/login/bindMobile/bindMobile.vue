<template>
	<view>
		<dz-navbar title="绑定手机号"></dz-navbar>
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

const language = uni.$api.language;
const formRef = ref(null);
const type = ref<string>('');
const selectShow = ref<boolean>(false);
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
	uni.setNavigationBarTitle({ title: uni.$api.language.notice.successTitle });
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
	const lastCaptchaTimeStamp = userStore.getLastBindMobileCaptchaTimeStamp;
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
			usage: 'up-mobile',
		})
		.then((res) => {
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				uni.$api.toast(res.data);
			}
			userStore.setLastCaptchaTimeStamp('lastBindMobileCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			userStore.setLastInputMobile(form.mobile);
			userStore.setLastSelectMobileArea(form.mobile_area);
			computeLastCaptcha();
		})
		.finally(() => {
			uni.hideLoading();
			isLoaidng.value = false;
		});
}

function areaConfirm(e: number[]) {
	form.mobile_area = e[0].value;
	areaName.value = e[0].label;
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
				.post(uni.$api.apiMember.mobileBind, {
					...formData,
				})
				.then(() => {
					isLoaidng.value = false;
					userStore.setUserMobile(res.mobile);
					userStore.setUserMobileArea(res.mobile_area);
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
					getMemberInfo();
				})
				.finally(() => {
					isLoaidng.value = false;
					uni.hideLoading();
				});
		});
}

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
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

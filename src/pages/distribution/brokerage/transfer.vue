<template>
	<view>
		<dz-navbar :title="type ? '货款转赠' : shopSetting.commission_front_name + '转赠'"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="160">
				<dz-form-item label="收款人ID" prop="receiver_id" borderBottom="true">
					<dz-input v-model="form.receiver_id" clearable border="none" placeholder="请输入收款人ID">
						<template #suffix>
							<dz-button
								size="mini"
								:border="false"
								:custom-style="{ marginLeft: '16rpx', background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
								hover-class="none"
								shape="circle"
								@click="verification"
							>
								验证
							</dz-button>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="收款人信息" :required="false" v-if="showReciver" borderBottom="true">
					<view class="user-info">
						<image :src="reciverInfo.head_portrait || missingFace"></image>
						<view>
							<view class="light">
								<view class="dz-m-r-6">用户名:</view>
								<view class="dz-line-1" style="max-width: 290rpx">{{ reciverInfo.nickname }}</view>
							</view>
							<view class="light">
								<view class="dz-m-r-6">手机号:</view>
								<view>{{ reciverInfo.mobile }}</view>
							</view>
						</view>
					</view>
				</dz-form-item>
				<dz-form-item label="转赠金额" prop="money" borderBottom="true">
					<dz-input v-model="form.money" clearable placeholder="请输入转赠金额" border="none"></dz-input>
				</dz-form-item>
				<dz-form-item label="支付密码" prop="pay_password" borderBottom="true">
					<dz-input :password="isPassword" v-model="form.pay_password" clearable placeholder="请输入支付密码" border="none">
						<template #suffix>
							<dz-icon class="dz-p-6" :name="isPassword ? 'attentionforbidfill' : 'attentionfill'" size="32" @click="passwordChange"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="验证码" prop="code">
					<dz-input type="text" v-model="form.code" clearable :placeholder="language.modifyPassword.codeHolder" border="none">
						<template #suffix>
							<dz-button
								size="mini"
								:border="false"
								:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
								hover-class="none"
								shape="circle"
								:disabled="waitingCaptcha"
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
		<view class="tip" :style="{ color: theme.dzBaseColor }">
			<view>可赠{{ type ? '货款' : shopSetting.commission_front_name }}：{{ transferConfig.promoter && transferConfig.promoter.user_brokerage }}</view>
			<view>
				单次转赠金额范围：{{ parseFloat(transferConfig.brokerage_transfer_lowest_money).toFixed(2) }}
				<text class="dz-color-9 dz-p-6">-</text>
				<text>
					{{
						parseFloat(transferConfig.brokerage_transfer_highest_money) > 0
							? parseFloat(transferConfig.brokerage_transfer_highest_money).toFixed(2)
							: '不限'
					}}
				</text>
			</view>
		</view>
		<view v-if="transferConfig.brokerage_transfer_desc" class="dz-p-l-30 dz-p-r-30 dz-color-9">
			<view v-for="(item, index) in transferConfig.brokerage_transfer_desc" :key="index">{{ item }}</view>
		</view>
		<view class="footer">
			<dz-button
				:border="false"
				:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor, marginBottom: '20rpx' }"
				hover-class="none"
				shape="circle"
				:loading="isLoading"
				@click="submit"
			>
				确定
			</dz-button>
			<text @tap="toPage('setPayPassword')">修改支付密码</text>
		</view>
		<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onShow, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const formRef = ref<InstanceType<typeof dzForm> | null>(null);
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const lastBrokerageTransfeCaptchaTimeStamp = computed(() => {
	return userStore.getLastBrokerageTransfeCaptchaTimeStamp;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const data = reactive({
	type: '',
	waitingCaptcha: false,
	waitingSecond: uni.$api.appConfig.loginCodeSecond,
	timeInterval: null,
	reciverInfo: {},
	user_brokerage: '',
	showReciver: false,
	areaCode: userInfo.value.mobile_area,
	transferConfig: {},
	loadingShow: true,
	pageLoadingStatus: 'loading',
	form: {
		receiver_id: '',
		code: '',
		money: '',
		pay_password: '',
	},
	isPassword: true,
});

const isLoading = ref<boolean>(false);

const rules = {
	receiver_id: {
		type: 'string',
		required: true,
		message: '请输入收款人ID',
		trigger: ['blur'],
	},
	money: {
		type: 'number',
		required: true,
		message: '请输入转赠金额',
		trigger: ['change', 'blur'],
	},
	pay_password: {
		type: 'string',
		required: true,
		message: '请输入支付密码',
		trigger: ['blur'],
	},
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
		title: options.type ? '货款转赠' : shopSetting.value.commission_front_name + '转赠',
	});
	if (options.type) {
		data.type = options.type;
	}
	getConfig();
});

onShow(() => {
	computeLastCaptcha();
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function loadingClick() {
	getConfig();
}

function computeLastCaptcha() {
	if (data.timeInterval) {
		return;
	}
	data.lastCaptchaTimeStamp = lastBrokerageTransfeCaptchaTimeStamp.value;
	let timeNow = parseInt(new Date().getTime() / 1000);
	let timeDiff = timeNow - data.lastCaptchaTimeStamp;
	if (timeDiff < uni.$api.appConfig.loginCodeSecond && timeDiff >= 0) {
		data.waitingCaptcha = true;
		data.waitingSecond = uni.$api.appConfig.loginCodeSecond - timeDiff;
		data.timeInterval = setInterval(() => {
			data.waitingSecond--;
			if (data.waitingSecond <= 0) {
				data.waitingCaptcha = false;
				clearInterval(data.timeInterval);
				data.timeInterval = null;
			}
		}, 1000);
	} else {
		data.waitingCaptcha = false;
	}
}

async function getCode() {
	if (!data.form.receiver_id) return uni.$api.toast('请输入收款人ID');
	if (data.form.receiver_id == userInfo.value.id) return uni.$api.toast('收款人不能为自己');
	if (!data.showReciver) return uni.$api.toast('请先验证收款人');
	if (Number(data.user_brokerage) < Number(data.form.money)) return uni.$api.toast(`${shopSetting.value.commission_front_name}余额不足`);
	if (data.form.pay_password.length == 0) return uni.$api.toast('请输入支付密码');
	if (data.form.pay_password.length < 6) return uni.$api.toast('请输入正确的支付密码');
	uni.showLoading({
		title: uni.$api.language.thirdPartyLogin.codeLoading,
	});
	uni.$api.http
		.post(uni.$api.apiMember.smsCode, {
			mobile: userInfo.value.mobile,
			mobile_area: data.areaCode,
			usage: 'transfer-commission',
		})
		.then((res) => {
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				uni.$api.toast(res.data);
			}
			uni.hideLoading();
			userStore.setLastCaptchaTimeStamp('lastBrokerageTransfeCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			computeLastCaptcha();
		})
		.catch(() => {
			uni.hideLoading();
		});
}

async function verification() {
	if (!data.form.receiver_id) {
		uni.$api.toast('请输入收款人ID');
		return;
	}
	if (data.form.receiver_id == userInfo.value.id) {
		uni.$api.toast('收款人不能为自己');
		return;
	}
	uni.showLoading({ title: '加载中...' });
	await uni.$api.http
		.get(uni.$api.apiMember.memberFindById, {
			params: {
				id: data.form.receiver_id,
			},
		})
		.then((res) => {
			if (res.data.id == null) {
				uni.$api.toast('请输入正确的ID');
				data.showReciver = false;
				return;
			}
			data.reciverInfo = res.data;
			data.showReciver = true;
		})
		.finally(() => {
			uni.hideLoading();
		});
}

function passwordChange() {
	data.isPassword = !data.isPassword;
}

function submit() {
	unref(formRef)
		.validate()
		.then(async () => {
			if (!data.form.receiver_id) return uni.$api.toast('请输入收款人ID');
			if (data.form.receiver_id == userInfo.value.id) return uni.$api.toast('收款人不能为自己');
			if (!data.showReciver) return uni.$api.toast('请先验证收款人');
			if (isLoading.value) return;
			isLoading.value = true;
			const formData = {
				...data.form,
				id: userInfo.value.id,
			};

			await uni.$api.http
				.post(uni.$api.apiMember.brokerageTransferCreate, formData)
				.then((res) => {
					uni.$api.toast('转赠成功');
					setTimeout(() => {
						uni.$api.router.redirectTo({
							route: uni.$api.routesConfig[data.type ? 'cloudWarehouse' : 'distribution'],
						});
					}, 1000);
				})
				.finally(() => {
					isLoading.value = false;
				});
		});
}

async function getConfig() {
	data.loadingShow = true;
	await uni.$api.http
		.get(uni.$api.apiMember.brokerageTransferConfig)
		.then((res) => {
			data.transferConfig = res.data;
			const regex = /[\n]/g;
			if (data.transferConfig.brokerage_transfer_desc && regex.test(data.transferConfig.brokerage_transfer_desc)) {
				data.transferConfig.brokerage_transfer_desc.split(regex);
			} else {
				data.transferConfig.brokerage_transfer_desc = [data.transferConfig.brokerage_transfer_desc];
			}
			data.user_brokerage = data.transferConfig.promoter.user_brokerage;
			data.transfer_min_balance = res.data.brokerage_transfer_lowest_money;
			data.loadingShow = false;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

function toPage(url, type) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			type,
		},
	});
}

const { type, showReciver, reciverInfo, transferConfig, waitingCaptcha, waitingSecond, loadingShow, pageLoadingStatus, form, isPassword } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.form-content {
	margin: 20rpx 20rpx 0;
	padding: 10rpx 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
}

.button {
	margin: 0 30rpx;
}

.user-info {
	display: flex;
	align-items: center;

	image {
		width: 80rpx;
		height: 80rpx;
		margin-right: 20rpx;
		border-radius: 40rpx;
	}

	color: #333;

	text {
		margin-right: 6rpx;
		color: #999;
	}

	.light {
		display: flex;
		align-items: center;
		height: 40rpx;
	}
}

.tip {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	font-size: 24rpx;
}

.footer {
	padding: 0 30rpx;
	margin-top: 60rpx;
	text-align: right;

	text {
		color: #999;
	}
}
</style>

<template>
	<view>
		<dz-navbar title="申请提现"></dz-navbar>
		<view class="content">
			<dz-cell-item
				title="暂不支持提现"
				:border-bottom="false"
				hover-class="none"
				:arrow="false"
				v-if="parseInt(withdrawConfig.brokerage_withdraw_is_open) == 0"
			></dz-cell-item>
			<view v-if="!type" class="dz-p-30" :style="{ color: theme.dzBaseColor }">
				<view>
					可提现至：
					<text class="dz-m-r-10" v-if="parseInt(withdrawConfig.brokerage_withdraw_balance) === 1">余额</text>
					<text class="dz-m-r-10" v-if="parseInt(withdrawConfig.brokerage_withdraw_union) === 1">银行卡</text>
					<text class="dz-m-r-10" v-if="parseInt(withdrawConfig.brokerage_withdraw_wechat) === 1">微信</text>
					<text class="dz-m-r-10" v-if="parseInt(withdrawConfig.brokerage_withdraw_ali) === 1">支付宝</text>
				</view>
			</view>
			<view v-if="type == 'yunzhanghu'" class="dz-p-30" :style="{ color: theme.dzBaseColor }">
				<view>
					可提现至：
					<text class="dz-m-r-10" v-if="parseInt(withdrawConfig.brokerage_withdraw_yunzhanghu_union) === 1">银行卡</text>
					<text class="dz-m-r-10" v-if="parseInt(withdrawConfig.brokerage_withdraw_yunzhanghu_wechat) === 1">微信</text>
					<text class="dz-m-r-10" v-if="parseInt(withdrawConfig.brokerage_withdraw_yunzhanghu_ali) === 1">支付宝</text>
				</view>
			</view>
			<view v-if="type == 'yunhuotec'" class="dz-p-30" :style="{ color: theme.dzBaseColor }">
				<view>
					可提现至：
					<text class="dz-m-r-10">银行卡</text>
				</view>
			</view>
			<dz-cell-group :border="false">
				<dz-cell-item
					v-if="withdrawData"
					icon="round_redpacket_fill"
					icon-size="60"
					:icon-style="{ color: '#FDC561', 'margin-right': '30rpx' }"
					:title="type == 'yunhuotec' ? `${withdrawData.account_number}` : `${withdrawData.account_type_name}  ${withdrawData.account_number}`"
					:label="
						type ? `手机号：${withdrawData.mobile || ''}` : `${withdrawData.realname}  ${withdrawData.branch_bank_name}  ${withdrawData.mobile}`
					"
					:border-bottom="false"
					hover-class="none"
					@tap="toWithdraw"
				></dz-cell-item>
				<dz-cell-item
					v-else
					icon="round_redpacket_fill"
					icon-size="60"
					:icon-style="{ color: '#FDC561', 'margin-right': '30rpx' }"
					title="请选择提现账号"
					:border-bottom="false"
					hover-class="none"
					@tap="toWithdraw"
				></dz-cell-item>
			</dz-cell-group>
			<dz-field label-width="90" label=" ￥" v-model="money" placeholder="请输入提现金额" :border-bottom="false"></dz-field>
		</view>
		<view class="tip" :style="{ color: theme.dzBaseColor }">
			<view>可提金额：{{ withdrawConfig.promoter && withdrawConfig.promoter.user_brokerage }}元</view>
			<view>起提金额：{{ withdrawConfig.brokerage_withdraw_lowest_money }}元</view>
			<view
				>单次可提：{{
					parseFloat(withdrawConfig.brokerage_withdraw_highest_money) > 0 ? withdrawConfig.brokerage_withdraw_highest_money + '元' : '不限'
				}}</view
			>
		</view>
		<view class="dz-p-l-30 dz-p-r-30 dz-color-9">
			<view v-for="(item, index) in withdrawConfig.brokerage_withdraw_desc" :key="index">{{ item }}</view>
		</view>
		<view class="dz-m-t-80 dz-flex dz-row-center">
			<view style="width: 90%">
				<dz-button
					:custom-style="{
						width: '100%',
						background: parseInt(withdrawConfig.withdraw_is_open) == 0 || submitting ? theme.dzBaseDisabled : theme.dzBaseColor,
						color: theme.dzBaseFontColor,
					}"
					:border="false"
					hover-class="none"
					shape="circle"
					:disabled="parseInt(withdrawConfig.withdraw_is_open) == 0 || submitting"
					:loading="submitting"
					@click="withdrawCreate"
				>
					{{
						parseInt(withdrawConfig.brokerage_withdraw_is_open) == 0
							? language.distribution.withdrawalClosed
							: language.distribution.immediateWithdrawal
					}}
				</dz-button>
			</view>
		</view>
		<dz-page-loading :show="loadingShow" :status="loadingStatus" @click="getWithdrawConfig"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const language = uni.$api.language;
const userStore = useUserStore();
const theme = computed(() => {
	return userStore.getTheme;
});
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const data = reactive({
	type: '',
	withdrawConfig: {},
	withdrawData: null,
	money: null,
	loadingShow: true,
	loadingStatus: 'loading',
	submitting: false,
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '申请提现',
	});
	data.type = options.type;
	uni.$on('getBankAccount', (v) => {
		data.withdrawData = v;
	});
	uni.$on('updateBankAccount', (v) => {
		getWithdrawConfig();
	});
	getWithdrawConfig();
});

onUnload(() => {
	uni.$off(['getBankAccount', 'updateBankAccount']);
});

function getWithdrawConfig() {
	uni.$api.http
		.get(uni.$api.apiMember.brokerageWithdrawConfig)
		.then((res) => {
			data.withdrawConfig = res.data;
			if (!data.type && res.data.default_bank_account && uni.$api.isObject(res.data.default_bank_account)) {
				data.withdrawData = res.data.default_bank_account;
			}
			if (data.type === 'yunzhanghu' && res.data.default_yunzhanghu_card && uni.$api.isObject(res.data.default_yunzhanghu_card)) {
				data.withdrawData = res.data.default_yunzhanghu_card;
			}
			if (data.type === 'yunhuotec' && res.data.default_yunhuotec_card && uni.$api.isObject(res.data.default_yunhuotec_card)) {
				data.withdrawData = res.data.default_yunhuotec_card;
			}
			const regex = /[\n]/g;
			if (data.withdrawConfig.brokerage_withdraw_desc && regex.test(data.withdrawConfig.brokerage_withdraw_desc)) {
				data.withdrawConfig.brokerage_withdraw_desc.split(regex);
			} else {
				data.withdrawConfig.brokerage_withdraw_desc = [data.withdrawConfig.brokerage_withdraw_desc];
			}
			data.loadingShow = false;
		})
		.catch(() => {
			setTimeout(() => {
				uni.$api.router.back();
			}, 1000);
			return;
		});
}

function toWithdraw() {
	let path = 'bankAccount';
	switch (data.type) {
		case 'yunzhanghu':
			path = 'yunzhanghuMemberCard';
			break;
		case 'yunhuotec':
			path = 'yunhuotecMemberCard';
			break;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[path],
		query: {
			source: 1,
		},
	});
}

// 申请提现
function withdrawCreate() {
	if (data.submitting) {
		return;
	}
	data.money = parseFloat(data.money) || '';
	if (!data.withdrawData) {
		uni.$api.toast('请选择提现账号');
		return;
	}
	if (!data.money) {
		uni.$api.toast('请输入提现金额');
		data.money = '';
		return;
	}
	if (data.money < parseFloat(data.withdrawConfig.brokerage_withdraw_lowest_money)) {
		uni.$api.toast(`至少提现：${data.withdrawConfig.brokerage_withdraw_lowest_money}元`);
		return;
	}
	if (parseFloat(data.withdrawConfig.brokerage_withdraw_highest_money) > 0 && data.money > parseFloat(data.withdrawConfig.brokerage_withdraw_highest_money)) {
		uni.$api.toast(`单次只能提现：${data.withdrawConfig.brokerage_withdraw_highest_money}元`);
		return;
	}
	if (data.money > parseFloat(data.withdrawConfig.promoter.user_brokerage)) {
		uni.$api.toast('您的可提金额不够啊');
		return;
	}
	data.submitting = true;
	const params = {};
	params.bank_account_id = data.withdrawData.id;
	params.money = data.money;

	// #ifdef APP-PLUS
	let platform = uni.$api.systemInfo.osName;
	if (platform == 'ios') {
		params.group = 'ios';
	} else if (platform == 'android') {
		params.group = 'android';
	} else {
		params.group = 'app';
	}
	// #endif

	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		params.group = 'wechat';
	} else {
		params.group = 'h5';
	}
	// #endif

	// #ifdef  MP-WEIXIN
	params.group = 'wechatMp';
	// #endif

	// #ifdef  MP-QQ
	params.group = 'qqMp';
	// #endif

	// #ifdef MP-ALIPAY
	params.group = 'aliMp';
	// #endif

	// #ifdef MP-BAIDU
	params.group = 'baiduMp';
	// #endif

	// #ifdef MP-TOUTIAO
	params.group = 'touTiaoMp';
	// #endif

	// #ifdef MP-360
	params.group = '360Mp';
	// #endif

	uni.$api.http
		.post(uni.$api.apiMember.brokerageWithdrawCreate, params)
		.then((res) => {
			data.submitting = false;
			uni.$api.toast('提交成功');
			setTimeout(() => {
				uni.$api.router.push({
					route: uni.$api.routesConfig.brokerage,
				});
			}, 1000);
		})
		.catch((err) => {
			data.submitting = false;
		});
}

const { type, withdrawConfig, withdrawData, money, submitting, loadingShow, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.content {
	padding: 20rpx 0;
	background-color: #ffffff;
}
.tip {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	font-size: 24rpx;
}
</style>

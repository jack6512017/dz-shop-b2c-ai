<template>
	<view>
		<dz-navbar :title="language.recharge.titleRecharge" :borderBottom="false"></dz-navbar>
		<view class="head">
			<view class="dz-p-20 dz-text-center dz-font-weight dz-font-lg" :style="{ color: theme.dzBaseColor }"
				>账户{{ shopSetting.balance_front_name }}：{{ userInfo.account.user_money }}</view
			>
			<view v-if="rechargeQuickList.length > 0">
				<dz-row gutter="16">
					<dz-col span="4" v-for="(item, index) in rechargeQuickList" :key="index" @click="quickClick(index)">
						<view
							class="layout"
							:style="{
								background: index == rechargeQuickIndex ? '#fff' : theme.dzBgColor,
								borderColor: index == rechargeQuickIndex ? theme.dzBaseColor : theme.dzBgColor,
								color: index == rechargeQuickIndex ? theme.dzBaseColor : '#333',
							}"
						>
							<view class="dz-font-md dz-text-center">{{ language.application.moneySymbol }}{{ item.price }}</view>
							<view class="dz-font-xs dz-text-center dz-color-9" v-if="parseFloat(item.give_price) > 0">
								赠{{ language.application.moneySymbol }}{{ item.give_price }}
							</view>
							<view class="dz-font-xs dz-text-center" v-else>无优惠</view>
						</view>
					</dz-col>
				</dz-row>
			</view>
			<view><dz-field v-model="inputAmount" label="充值金额" type="number" placeholder="请选择或者输入充值金额"></dz-field></view>
			<view class="dz-flex dz-row-center dz-p-30 dz-font-24">
				<dz-checkbox-group v-model="agreeCheck">
					<dz-checkbox shape="circle" size="30" :name="1" :activeColor="theme.dzBaseColor" label="已经阅读并且同意"> </dz-checkbox>
				</dz-checkbox-group>
				<text :style="{ marginTop: '-4rpx', color: theme.dzTypePrimary }" @tap.stop="protocal('充值协议', 'recharge')">《用户充值协议》</text>
			</view>
		</view>
		<dz-radio-group ref="radioGroup" v-model="checkType">
			<view v-if="parseInt(payConfig[`pay_${payGroup}_wechatpay`]) > 0 || parseInt(payConfig[`pay_${payGroup}_alipay`]) > 0" class="pay-type-list">
				<dz-cell-item
					v-if="parseInt(payConfig[`pay_${payGroup}_wechatpay`]) > 0"
					:borderBottom="false"
					center
					hoverClass="none"
					:arrow="false"
					:title="language.orderPay.wechatPay"
					icon="wechat"
					iconSize="60"
					:icon-style="{ color: '#42E38D', 'margin-right': '30rpx' }"
					@click="checkboxChange(1)"
				>
					<template v-if="payConfig[`pay_${payGroup}_wechatpay_option`].is_rand_sub == 1" #label>
						<view style="color: #e61128"
							>最高可随机立减{{ parseInt(payConfig[`pay_${payGroup}_wechatpay_option`].rand_sub_highest_money) / 100 }}元</view
						>
					</template>
					<template #value>
						<view class="dz-inline-block">
							<dz-radio :name="1" :active-color="theme.dzBaseColor"></dz-radio>
						</view>
					</template>
				</dz-cell-item>
				<dz-cell-item
					v-if="parseInt(payConfig[`pay_${payGroup}_alipay`]) > 0"
					:borderBottom="false"
					center
					:arrow="false"
					hoverClass="none"
					:title="language.orderPay.aliPay"
					icon="alip"
					iconSize="60"
					:icon-style="{ color: '#2EAFFF', 'margin-right': '30rpx' }"
					@click="checkboxChange(2)"
				>
					<template v-if="payConfig[`pay_${payGroup}_alipay_option`].is_rand_sub == 1" #label>
						<view style="color: #e61128"
							>最高可随机立减{{ parseInt(payConfig[`pay_${payGroup}_alipay_option`].rand_sub_highest_money) / 100 }}元</view
						>
					</template>
					<template #value>
						<view class="dz-inline-block">
							<dz-radio :name="2" :active-color="theme.dzBaseColor"></dz-radio>
						</view>
					</template>
				</dz-cell-item>
				<!--快捷支付-->
				<dz-cell-item
					v-if="parseInt(payConfig[`pay_${payGroup}_quick`]) > 0"
					:borderBottom="false"
					center
					:arrow="false"
					hoverClass="none"
					title="银行卡支付"
					icon="card_fill"
					iconSize="60"
					:icon-style="{ color: '#E61128', 'margin-right': '30rpx' }"
					@click="checkboxChange(8)"
				>
					<template #label>
						<view class="dz-flex">
							<view style="color: #2979ff" @tap="handleCard">可支持银行</view>
							<view v-if="payConfig[`pay_${payGroup}_quick_option`].is_rand_sub == 1" style="color: #e61128; margin-left: 10rpx"
								>最高可随机立减{{ parseInt(payConfig[`pay_${payGroup}_quick_option`].rand_sub_highest_money) / 100 }}元</view
							>
						</view>
					</template>
					<template #value>
						<view class="dz-inline-block">
							<dz-radio :name="8" :active-color="theme.dzBaseColor"></dz-radio>
						</view>
					</template>
				</dz-cell-item>
			</view>
		</dz-radio-group>
		<view class="footer">
			<view class="footer-btn">
				<view style="width: 90%">
					<dz-button
						:custom-style="{
							width: '100%',
							background: submitting || isDisabled ? theme.dzBaseDisabled : theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						hover-class="none"
						shape="circle"
						:border="false"
						:loading="submitting"
						:disabled="isDisabled"
						@click="paySubmit"
					>
						{{ language.recharge.confirmPay }}
					</dz-button>
				</view>
			</view>
		</view>

		<!--点击唤起支付宝-->
		<dz-popup v-model:show="allinpaySchemeShow" mode="center" width="90%" border-radius="30" :closeable="true">
			<view class="dz-p-t-40 dz-p-b-40 dz-p-l-20 dz-p-r-20">
				<view class="dz-text-center dz-font-24 dz-p-30 dz-tips-color">点击下方按钮打开支付宝</view>
				<a target="_blank" class="link" :href="allinpaySchemeAlipay" @tap="allinpaySchemeAlipayClick">
					<dz-button
						:custom-style="{
							background: theme.dzBaseColor,
							color: theme.dzBaseFontColor,
							marginTop: '50rpx',
							marginLeft: '20rpx',
							marginRight: '20rpx',
						}"
						hover-class="none"
						:border="false"
						@click="allinpaySchemeAlipayClick"
					>
						打开支付宝
					</dz-button>
				</a>
			</view>
		</dz-popup>
		<!--支付宝支付确认-->
		<dz-popup v-model:show="allinpayAliPayShow" mode="center" width="90%" border-radius="30" :closeable="true">
			<view class="dz-p-t-40 dz-p-b-40 dz-p-l-20 dz-p-r-20">
				<view class="dz-text-center dz-font-24 dz-p-30 dz-tips-color">{{ language.orderPay.allinpayAlipayTip }}</view>
				<dz-button
					:custom-style="{
						background: allinpayBankCardPaySubmitting ? theme.dzBaseDisabled : theme.dzBaseColor,
						color: theme.dzBaseFontColor,
						marginTop: '50rpx',
						marginLeft: '20rpx',
						marginRight: '20rpx',
					}"
					:border="false"
					hover-class="none"
					:loading="allinpayBankCardPaySubmitting"
					@click="getPayResult()"
				>
					{{ language.orderPay.allinpayAlipayConfirm }}
				</dz-button>
			</view>
		</dz-popup>
		<!-- 支付风控提示 -->
		<dz-modal
			v-model:show="riskModalShow"
			:showTitle="false"
			:content="riskData && riskData.tip"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="riskData && riskData.type == 'count_suggest'"
			:confirmText="riskData && riskData.type == 'count_suggest' ? '继续支付' : '确定'"
			cancelText="关闭"
			@confirm="handleRiskPay"
			:contentStyle="{ padding: '48rpx', fontSize: '30rpx', textAlign: 'center', color: theme.dzContentColor }"
		>
			<block v-if="riskData">
				<view class="countdown" v-if="parseInt(riskData.countdown) > 0">
					<view class="time">
						可支付时间倒计时
						<dz-count-down
							class="dz-m-l-10"
							:timestamp="riskData.countdown"
							:show-days="false"
							color="#B17337"
							separator-color="#B17337"
							:bg-color="'transparent'"
							@timeEnd="riskEnd"
						></dz-count-down>
					</view>
				</view>
				<view>
					{{ riskData.tip }}
				</view>
			</block>
		</dz-modal>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
		<!-- 银行列表 -->
		<quickCard v-model="cardShow" />
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs, ref, unref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';
import quickCard from './components/quickCard/quickCard.vue';

const radioGroup = ref(null);
const userStore = useUserStore();
const groupData = useGroup();
const language = uni.$api.language;
const data = reactive({
	rechargeQuickList: [], //快捷充值列表
	rechargeQuickIndex: -1, //快捷充值选择索引
	inputAmount: '',
	inputAmountGive: '',
	rechargeMoney: 0,
	agreeCheck: [],
	checkType: 0,
	orderInfo: {}, //订单信息
	orderGroup: 'recharge',
	payConfig: {},
	group: groupData.group,
	payGroup: groupData.payGroup,
	apiUrl: uni.$api.apiPay.payCreate,
	payProductOptionId: '',
	allinpaySchemeShow: false,
	allinpayAliPayShow: false,
	pageLoadingShow: true,
	pageLoadingStatus: 'loading',
	submitting: false,
	riskData: null,
	riskModalShow: false,
	cardShow: false,
});

const theme = computed(() => {
	return userStore.getTheme;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const isDisabled = computed(() => {
	return (
		(parseInt(data.payConfig[`pay_${data.payGroup}_wechatpay`]) == 0 || parseInt(data.payConfig[`pay_${data.payGroup}_alipay`]) == 0) && !data.inputAmount
	);
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.rechargeMoney = options.recharge;
	initData();
});

onShow(() => {
	getMemberInfo();
});

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

//初始化公共数据
async function initData() {
	//获取支付配置
	await uni.$api.http
		.get(uni.$api.apiPay.payConfig, {
			params: {
				group: data.group,
			},
		})
		.then((res) => {
			data.payConfig = res.data;
			payModeAutoSelect();
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
			return;
		});

	//微信公众号配置注册
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.wxHelper.wxConfig(window.location.href);
	}
	// #endif
	initOrder();
}

//支付类型自动选择
function payModeAutoSelect() {
	if (parseInt(data.payConfig[`pay_${data.payGroup}_wechatpay`]) > 0) {
		data.checkType = 1;
		return;
	}
	if (parseInt(data.payConfig[`pay_${data.payGroup}_alipay`]) > 0) {
		data.checkType = 2;
		return;
	}
	if (parseInt(data.payConfig[`pay_${data.payGroup}_quick`]) > 0) {
		data.checkType = 8;
		return;
	}
}

//协议
function protocal(title, field) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.protocolDetail,
		query: {
			title,
			field,
		},
	});
}

//充值选择
function quickClick(index, item) {
	data.rechargeQuickIndex = index;
	data.inputAmount = data.rechargeQuickList[index].price;
	data.inputAmountGive = data.rechargeQuickList[index].give_price;
}

async function initOrder() {
	// 获取快捷充值列表
	await uni.$api.http
		.get(uni.$api.apiMember.rechargeIndex)
		.then((res) => {
			data.rechargeQuickList = res.data;
			if (data.rechargeQuickList.length > 0) {
				data.rechargeQuickIndex = 0;
				data.inputAmount = data.rechargeQuickList[0].price;
				data.inputAmountGive = data.rechargeQuickList[0].give_price;
			}
		})
		.catch((err) => {
			data.pageLoadingStatus = 'error';
			return;
		});
	data.pageLoadingShow = false;
	if (data.auto && data.auto == 'wechat') {
		data.checkType = 1;
		paySubmit();
	}
}

function pageLoadingClick() {
	initOrder();
}

//可支付时间倒计时结束
function riskEnd() {
	data.riskData.countdown = 0;
	data.riskModalShow = false;
}

function checkboxChange(e: number) {
	if (e == data.checkType) return;
	const item = unref(radioGroup)?.children.find((item) => item.name == e);
	if (!item) return;
	item.checked = true;
	unref(radioGroup).unCheckedOther(item);
}

//支付提交
function paySubmit() {
	if (parseInt(shopSetting.value.is_open_recharge) !== 1) return uni.$api.toast('充值已关闭，请联系工作人员');
	if (!data.agreeCheck.length) {
		uni.$api.toast('请仔细阅读并勾选用户充值协议');
		return;
	}
	if (data.submitting) {
		return;
	}

	if (parseFloat(data.inputAmount) <= 0) {
		uni.$api.toast('请输入正确充值金额');
		return;
	}
	if (data.checkType <= 0) {
		uni.$api.toast('请选择支付方式');
		return;
	}
	data.submitting = true;
	data.orderInfo.money = parseFloat(data.inputAmount);
	data.wxAutoParam = { recharge: data.inputAmount };
	data.submitQuery = {
		id: data.id,
		orderGroup: data.orderGroup,
	};
	if (data.checkType === 1) {
		//微信支付
		wechatPaySubmit();
	} else if (data.checkType === 2) {
		//支付宝支付
		aliPaySubmit();
	} else if (data.checkType === 8) {
		//快捷支付
		quickPaySubmit();
	}
}

//微信支付
async function wechatPaySubmit() {
	let orderWechatMethod = data.payConfig[`pay_${data.payGroup}_wechatpay_option_id`];
	let orderWechatOption = data.payConfig[`pay_${data.payGroup}_wechatpay_option`];
	if (!orderWechatMethod.length && !orderWechatOption) {
		//支付关闭
		uni.$api.toast(uni.$api.language.orderPay.payMethodClosed);
		data.submitting = false;
		return;
	}
	let thirdpartyPayMode = orderWechatOption.mode;
	data.payProductOptionId = orderWechatOption.id;
	if (thirdpartyPayMode === 1) {
		//原生微信支付
		//公众号
		// #ifdef H5
		if (uni.$api.h5IsWechat() && hopSetting.value.wechat_appid != '') {
			normalNativePayInWechat();
		} else {
			uni.$api.toast(uni.$api.language.orderPay.wechatPayH5Tip);
			data.submitting = false;
			return;
		}
		// #endif
		//小程序
		// #ifdef MP-WEIXIN
		normalNativePayInWechatMp();
		// #endif
		//APP
		// #ifdef APP-PLUS
		normalNativePayWxInApp();
		// #endif
	} else if (thirdpartyPayMode === 2) {
		//通联微信基础支付
		switch (orderWechatOption.method) {
			case 'h5_cashier':
				//公众号
				// #ifdef H5
				if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
					allinpayCashierOrgPayInWechat();
				} else {
					uni.$api.toast(uni.$api.language.orderPay.wechatPayH5Tip);
					data.submitting = false;
					return;
				}
				// #endif
				// #ifdef MP || APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.wechatPayH5Tip);
				data.submitting = false;
				// #endif
				break;
			case 'miniprogram':
				// 微信小程序支付（收银宝）集团
				// #ifdef MP-WEIXIN
				normalNativePayInWechatMp();
				// #endif
				// #ifdef APP-PLUS
				allinpayMiniprogramCashierOrgPayInApp();
				// #endif
				// #ifndef MP-WEIXIN || APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.payNotInAppOrWechatMp);
				data.submitting = false;
				// #endif
				break;
			case 'miniprogram_cashier':
				// 微信小程序支付（收银台）集团
				// #ifdef MP-WEIXIN
				miniprogramCashierPayInWechatMp();
				// #endif
				// #ifndef MP-WEIXIN
				uni.$api.toast(uni.$api.language.orderPay.payNotInAppOrWechatMp);
				data.submitting = false;
				// #endif
				break;
			// 微信JS支付（公众号）
			case 'js':
				//微信JS支付(公众号)_集团
				// #ifdef H5
				if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
					normalNativePayInWechat();
				} else {
					uni.$api.toast(uni.$api.language.orderPay.payNotInWechat);
					data.submitting = false;
				}
				// #endif
				// #ifndef H5
				uni.$api.toast(uni.$api.language.orderPay.payNotInWechat);
				data.submitting = false;
				// #endif
				break;
		}
	} else if (thirdpartyPayMode === 3) {
		//杉德支付
		switch (orderWechatOption.method) {
			case 'h5_cashier':
				//公众号
				// #ifdef H5
				if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
					allinpayCashierOrgPayInWechat();
				} else {
					uni.$api.toast(uni.$api.language.orderPay.wechatPayH5Tip);
					data.submitting = false;
					return;
				}
				// #endif
				// #ifdef MP || APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.wechatPayH5Tip);
				data.submitting = false;
				// #endif
				break;
			case 'miniprogram':
				// 微信小程序支付（收银宝）集团
				// #ifdef MP-WEIXIN
				normalNativePayInWechatMp();
				// #endif
				// #ifdef APP-PLUS
				allinpayMiniprogramCashierOrgPayInApp();
				// #endif
				// #ifndef MP-WEIXIN || APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.payNotInAppOrWechatMp);
				data.submitting = false;
				// #endif
				break;
			case 'miniprogram_cashier':
				// 微信小程序支付（收银台）集团
				// #ifdef MP-WEIXIN
				miniprogramCashierPayInWechatMp();
				// #endif
				// #ifndef MP-WEIXIN
				uni.$api.toast(uni.$api.language.orderPay.payNotInAppOrWechatMp);
				data.submitting = false;
				// #endif
				break;
		}
	} else if (thirdpartyPayMode === 4) {
		//杉德河马支付
		switch (orderWechatOption.method) {
			case 'js':
				// #ifdef H5
				if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
					normalNativePayInWechat();
				} else {
					uni.$api.toast(uni.$api.language.orderPay.wechatPayH5Tip);
					data.submitting = false;
					return;
				}
				// #endif
				break;
			case 'miniprogram':
				//小程序
				// #ifdef MP-WEIXIN
				normalNativePayInWechatMp();
				// #endif
				break;
		}
	}
}

//微信公众号原生支付
async function normalNativePayInWechat() {
	let wxOpenid = '';
	await uni.$api.http
		.get(uni.$api.apiMember.isBinding, {
			params: {
				oauth_client: 'wechat',
			},
		})
		.then((res) => {
			wxOpenid = res.data.openid;
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
	if (wxOpenid) {
		//如果已授权
		await data.$api.http
			.post(data.apiUrl, {
				order_group: data.orderGroup,
				group: data.group,
				pay_type: 1,
				openid: wxOpenid,
				pay_product_option_id: data.payProductOptionId,
				data: JSON.stringify(data.orderInfo),
			})
			.then(async (res) => {
				if (res.data.payStatus === true) {
					uni.$api.toast(uni.$api.language.orderPay.orderPaid);
					return;
				}
				data.payTradeno = res.data.out_trade_no;
				uni.$api.jweixin.ready(() => {
					uni.$api.jweixin.chooseWXPay({
						...res.data.config,
						success(res) {
							data.submitting = false;
							getPayResult();
						},
						fail(err) {
							data.submitting = false;
							uni.$api.toast(uni.$api.language.orderPay.wxPayFailTip);
						},
						cancel(msg) {
							data.submitting = false;
						},
					});
				});
			})
			.catch((err) => {
				data.submitting = false;
				handleRisk(err);
			});
	} else {
		//如果未授权，获取code
		if (data.wxCode) {
			console.log('wxCode got and pay');
			await uni.$api.http
				.post(
					data.apiUrl,
					{
						order_group: data.orderGroup,
						group: data.group,
						pay_type: 1,
						pay_product_option_id: data.payProductOptionId,
						data: JSON.stringify(data.orderInfo),
					},
					{ params: { code: data.wxCode } }
				)
				.then(async (res) => {
					if (res.data.payStatus === true) {
						uni.$api.toast(uni.$api.language.orderPay.orderPaid);
						return;
					}
					data.payTradeno = res.data.out_trade_no;
					uni.$api.jweixin.ready(() => {
						uni.$api.jweixin.chooseWXPay({
							...res.data.config,
							success(res) {
								data.wxCode = '';
								data.submitting = false;
								getPayResult();
							},
							fail(res) {
								data.wxCode = '';
								data.submitting = false;
								uni.$api.toast(uni.$api.language.orderPay.wxPayFailTip);
							},
							cancel(msg) {
								data.wxCode = '';
								data.submitting = false;
							},
						});
					});
				})
				.catch((err) => {
					data.submitting = false;
					handleRisk(err);
				});
		} else {
			//向微信申请CODE
			let h5Url = uni.$api.delAllUrlParams(window.location.href);
			let url = uni.$api.objParseUrlAndParam(h5Url, { ...data.wxAutoParam, auto: 'wechat', r: uni.$api.guid(16) });
			//避免缓存
			url = encodeURIComponent(url);
			window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?
																				appid=${shopSetting.value.wechat_appid}&
																				redirect_uri=${url}&
																				response_type=code&
																				scope=snsapi_userinfo&
																				forcePopup=true&
																				state=STATE#wechat_redirect`;
		}
	}
}

//小程序原生支付
async function normalNativePayInWechatMp() {
	let mpOpenid = '';
	await uni.$api.http
		.get(uni.$api.apiMember.isBinding, {
			params: {
				oauth_client: 'wechatMp',
			},
		})
		.then((res) => {
			mpOpenid = res.data.openid;
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
	if (mpOpenid) {
		//如果已授权
		await uni.$api.http
			.post(data.apiUrl, {
				order_group: data.orderGroup,
				group: data.group,
				pay_type: 1,
				openid: mpOpenid,
				pay_product_option_id: data.payProductOptionId,
				data: JSON.stringify(data.orderInfo),
			})
			.then((res) => {
				if (res.data.payStatus === true) {
					uni.$api.toast(uni.$api.language.orderPay.orderPaid);
					return;
				}
				data.payTradeno = res.data.out_trade_no;
				uni.requestPayment({
					...res.data.config,
					timeStamp: res.data.config.timestamp,
					success: () => {
						data.submitting = false;
						getPayResult();
					},
					fail: (paymentErr) => {
						console.log(JSON.stringify(paymentErr));
						data.submitting = false;
					},
				});
			})
			.catch((err) => {
				data.submitting = false;
				handleRisk(err);
			});
	} else {
		//如果未授权，获取code
		uni.login({
			provider: 'weixin',
			success: (loginRes) => {
				uni.$api.http
					.post(
						data.apiUrl,
						{
							order_group: data.orderGroup,
							group: data.group,
							pay_type: 1,
							pay_product_option_id: data.payProductOptionId,
							data: JSON.stringify(data.orderInfo),
						},
						{ params: { code: loginRes.code } }
					)
					.then((res) => {
						if (res.data.payStatus === true) {
							uni.$api.toast(uni.$api.language.orderPay.orderPaid);
							return;
						}
						data.payTradeno = res.data.out_trade_no;
						uni.requestPayment({
							...res.data.config,
							timeStamp: res.data.config.timestamp,
							success: () => {
								data.submitting = false;
								getPayResult();
							},
							fail: (paymentErr) => {
								console.log(JSON.stringify(paymentErr));
								data.submitting = false;
							},
						});
					})
					.catch((err) => {
						data.submitting = false;
						handleRisk(err);
					});
			},
			fail: (loginErr) => {
				console.log(JSON.stringify(loginErr));
				data.submitting = false;
				uni.$api.toast(uni.$api.language.orderPay.payFailTip + loginErr.errMsg);
			},
		});
	}
}

// 微信小程序支付（收银台）
async function miniprogramCashierPayInWechatMp() {
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 1,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			data.payTradeno = res.data.out_trade_no;
			uni.navigateToMiniProgram({
				appId: 'wxef277996acc166c3',
				extraData: res.data.config.params,
				success: () => {
					data.submitting = false;
					getPayResult();
				},
				fail: (paymentErr) => {
					console.log(JSON.stringify(paymentErr));
					data.submitting = false;
				},
			});
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

//APP原生微信支付
async function normalNativePayWxInApp() {
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 1,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			data.payTradeno = res.data.out_trade_no;
			uni.requestPayment({
				provider: 'wxpay',
				orderInfo: res.data.config,
				success: () => {
					data.submitting = false;
					getPayResult();
				},
				fail: (paymentErr) => {
					console.log(JSON.stringify(paymentErr));
					data.submitting = false;
				},
			});
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

/**
 * 通商云收银台集团/通联基础收银台
 * 微信公众号中支付
 */
async function allinpayCashierOrgPayInWechat() {
	//请求创建支付订单
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 1,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			data.payTradeno = res.data.out_trade_no;
			data.submitting = false;
			window.location.href = res.data.config;
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

// 通联基础APP中跳转小程序支付
function allinpayMiniprogramCashierOrgPayInApp() {
	uni.showLoading();
	plus.share.getServices(
		(serviceRes) => {
			let sweixin = null;
			for (let i = 0; i < serviceRes.length; i++) {
				let t = serviceRes[i];
				if (t.id == 'weixin') {
					sweixin = t;
					break;
				}
			}
			if (!sweixin) {
				uni.$api.toast(uni.$api.language.orderPay.launchMiniProgrameError);
				data.submitting = false;
				uni.hideLoading();
				return;
			}
			//todo:这一句有点问题，这里仅仅针对普通订单
			sweixin.launchMiniProgram({
				id: shopSetting.value.miniprogram_id,
				type: shopSetting.value.miniprogram_type,
				path: uni.$api.routesConfig.allinpayAppWxPay.path + '?order_id=' + data.orderInfo.order_id + '&member_id=' + data.orderInfo.member_id,
			});
			data.submitting = false;
			uni.hideLoading();
		},
		(serviceErr) => {
			console.log(JSON.stringify(serviceErr), '10');
			uni.$api.toast(uni.$api.language.orderPay.payFailTip + serviceErr.message);
			data.submitting = false;
			uni.hideLoading();
		}
	);
}

//支付宝支付
function aliPaySubmit() {
	let orderAliMethod = data.payConfig[`pay_${data.payGroup}_alipay_option_id`];
	let orderAliOption = data.payConfig[`pay_${data.payGroup}_alipay_option`];
	if (!orderAliMethod.length && !orderAliOption) {
		//支付关闭
		uni.$api.toast(uni.$api.language.orderPay.payMethodClosed);
		data.submitting = false;
		return;
	}
	let thirdpartyPayMode = orderAliOption.mode;
	data.payProductOptionId = orderAliOption.id;
	if (thirdpartyPayMode === 1) {
		//原生支付宝支付
		// #ifdef H5
		if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
			uni.$api.toast(uni.$api.language.orderPay.payNotInH5);
			data.submitting = false;
		} else {
			normalNativePayAliInH5();
		}
		// #endif
		// #ifdef APP-PLUS
		normalNativePayAliInApp();
		// #endif
		// #ifndef H5 || APP-PLUS
		uni.$api.toast(uni.$api.language.orderPay.payNotInH5OrApp);
		data.submitting = false;
		// #endif
	} else if (thirdpartyPayMode === 2) {
		//通联基础收银台支付
		switch (orderAliOption.method) {
			case 'h5_cashier':
				// #ifdef H5
				allinpayAlipayCashierOrgInH5();
				// #endif
				// #ifdef APP-PLUS
				allinpayAlipayCashierOrgInApp();
				// #endif
				// #ifndef H5 || APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.payNotInH5OrApp);
				data.submitting = false;
				// #endif
				break;
			case 'app':
				//收银宝支付宝APP支付_集团
				//TODO 暂未支持
				uni.$api.toast(uni.$api.language.orderPay.payMethodNoSupported);
				this.submitting = false;
				break;
			case 'js':
				// 支付宝JS支付（生活号）
				//支付宝JS支付(生活号)_集团
				allinpayAlipayCashierOrgInH5();
				data.submitting = false;
				break;
		}
	} else if (thirdpartyPayMode === 3) {
		// 杉德收银台支付
		switch (orderAliOption.method) {
			case 'h5_cashier':
				// #ifdef H5
				allinpayAlipayCashierOrgInH5();
				// #endif
				// #ifdef APP-PLUS
				allinpayAlipayCashierOrgInApp();
				// #endif
				// #ifndef H5 || APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.payNotInH5OrApp);
				data.submitting = false;
				// #endif
				break;
		}
	}
}

//H5原生支付宝支付
async function normalNativePayAliInH5() {
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 2,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			data.submitting = false;
			data.payTradeno = res.data.out_trade_no;
			window.location.href = res.data.config.config;
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

//APP原生支付宝支付
async function normalNativePayAliInApp() {
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 2,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			data.payTradeno = res.data.out_trade_no;
			uni.requestPayment({
				provider: 'alipay',
				orderInfo: res.data.config.config,
				success: () => {
					data.submitting = false;
					getPayResult();
				},
				fail: (paymentErr) => {
					console.log(JSON.stringify(paymentErr));
					data.submitting = false;
				},
			});
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

/**
 * 通联收银台集团支付宝H5/通联基础收银台
 */
async function allinpayAlipayCashierOrgInH5() {
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 2,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			//跳转到支付宝打开支付页面
			data.submitting = false;
			data.payTradeno = res.data.out_trade_no;
			uni.$api.router.redirectTo({
				route: uni.$api.routesConfig.aliMiddle,
				query: { ...data.submitQuery, out_trade_no: data.payTradeno, url: encodeURIComponent(res.data.config) },
			});
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

/**
 * 通联标准版收银台集团支付宝H5/通联基础收银台
 */
async function allinpayAlipayCashierOrgInApp() {
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 2,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			data.submitting = false;
			data.payTradeno = res.data.out_trade_no;
			let payUrl = 'alipays://platformapi/startapp?appId=20000067&url=' + encodeURIComponent(res.data.config);
			data.allinpayAliPayShow = true;
			plus.runtime.openURL(payUrl, (error) => {
				uni.$api.toast(uni.$api.language.orderPay.openAlipayError);
				data.allinpayAliPayShow = false;
			});
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

//收银台支付返回路径
function returnPath() {
	let domain = uni.$api.appConfig.h5Domain;
	let url = '';
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	url = `${domain}${uni.$api.routesConfig.payComplete.path}?type=recharge`;
	return url;
}

// 快捷支付
function quickPaySubmit() {
	let orderQuickMethod = data.payConfig[`pay_${data.payGroup}_quick_option_id`];
	let orderQuickOption = data.payConfig[`pay_${data.payGroup}_quick_option`];
	if (!orderQuickMethod.length && !orderQuickOption) {
		//支付关闭
		uni.$api.toast(uni.$api.language.orderPay.payMethodClosed);
		data.submitting = false;
		return;
	}
	let thirdpartyPayMode = orderQuickOption.mode;
	data.payProductOptionId = orderQuickOption.id;
	if (thirdpartyPayMode === 3) {
		// 杉德
		switch (orderQuickOption.method) {
			// 借记卡
			case 'debit':
				// #ifdef H5 || APP-PLUS
				quickDebit();
				// #endif
				// #ifndef H5 || APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.payNotInH5OrApp);
				data.submitting = false;
				// #endif
				break;
		}
	}
}

// H5/App快捷借记卡支付
async function quickDebit() {
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 8,
			pay_product_option_id: data.payProductOptionId,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			if (res.data.payStatus === true) {
				uni.$api.toast(uni.$api.language.orderPay.orderPaid);
				return;
			}
			data.submitting = false;
			data.payTradeno = res.data.out_trade_no;
			if (!res.data.config.server_url) return;
			// #ifdef H5
			window.location.href = res.data.config.server_url;
			// #endif
			// #ifdef APP-PLUS
			uni.$api.router.push({
				route: uni.$api.routesConfig.webview,
				query: {
					url: uni.$api.strEncode(res.data.config.server_url),
				},
			});
			// #endif
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
}

function handleCard() {
	data.cardShow = !data.cardShow;
}

// 支付风控继续支付
function handleRiskPay() {
	if (data.riskData && data.riskData.type == 'count_suggest') {
		paySubmit();
	}
	data.riskModalShow = false;
}

// 支付风控处理
function handleRisk(e: any) {
	if (e && e.code == 423) {
		data.riskData = e.data;
		if (e.data.tip) {
			data.riskModalShow = true;
		}
	}
}

const {
	rechargeQuickList,
	rechargeQuickIndex,
	inputAmount,
	agreeCheck,
	payConfig,
	payGroup,
	checkType,
	allinpaySchemeShow,
	allinpayAliPayShow,
	pageLoadingShow,
	pageLoadingStatus,
	submitting,
	riskData,
	riskModalShow,
	cardShow,
} = {
	...toRefs(data),
};
</script>

<style lang="scss" scoped>
.head {
	background-color: #ffffff;
	margin: 24rpx;
	padding: 10rpx 20rpx;
	border-radius: 20rpx;
}

.layout {
	margin: 20rpx 0;
	padding: 10rpx;
	border-radius: 15rpx;
	border: 1rpx solid #fff;
}
.pay-type-list {
	width: 100%;
	background-color: #ffffff;
	margin: 24rpx;
	padding: 10rpx 0;
	border-radius: 20rpx;
	overflow: hidden;
}

.countdown {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 40rpx;
	margin-bottom: 20rpx;
	.time {
		padding: 0 12rpx;
		color: #b17337;
		background-color: #ffe1b3;
		border-radius: 20rpx;
	}
}

.footer {
	width: 100%;
	position: fixed;
	z-index: 99;
	background-color: #fff;
	bottom: 0;
}
.footer-btn {
	width: 100%;
	height: 120rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: env(safe-area-inset-bottom);
}
.bankcardList {
	padding: 30rpx;
}
.bankcardTip {
	padding-bottom: 20rpx;
}
.link {
	text-decoration: none;
}
</style>

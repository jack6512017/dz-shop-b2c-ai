<template>
	<view>
		<dz-navbar :title="language.orderPay.titleOrderPay" :borderBottom="false"></dz-navbar>
		<view class="price-box" :style="{ color: theme.dzBaseColor }">
			<view class="dz-flex dz-row-center">
				<view>{{ language.application.moneySymbol }}</view>
				<view class="price">{{ money }}</view>
			</view>
			<view class="time" v-if="parseInt(orderDetail.order_status) !== 1 && parseInt(orderDetail.close_left_time) > 0">
				{{ language.orderPay.payLeftTime }}
				<dz-count-down
					class="dz-m-l-10"
					:timestamp="orderDetail.close_left_time"
					:show-days="false"
					:color="theme.dzBaseColor"
					:separator-color="theme.dzBaseColor"
					:bg-color="'transparent'"
					@timeEnd="orderEnd"
				></dz-count-down>
			</view>
		</view>

		<dz-radio-group ref="radioGroup" v-model="checkType">
			<view class="pay-type-list">
				<!--微信支付-->
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
				<!--支付宝支付-->
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
				<!-- 余额支付 -->
				<dz-cell-item
					v-if="parseInt(payConfig[`pay_${payGroup}_balance`]) === 1"
					:borderBottom="false"
					center
					hoverClass="none"
					:title="api.formatString(language.orderPay.balancePay, shopSetting.balance_front_name)"
					:arrow="false"
					icon="commission"
					iconSize="60"
					:icon-style="{ color: '#FDC561', 'margin-right': '30rpx' }"
					@click="checkboxChange(5)"
				>
					<template #label>
						<text>{{ api.formatString(language.orderPay.userBalance, shopSetting.balance_front_name, userInfo.account.user_money) }}</text>
						<text @tap="rechargeClick" class="dz-m-l-10" style="color: #2979ff" v-if="parseInt(shopSetting.is_open_recharge) === 1">{{
							language.orderPay.recharge
						}}</text>
					</template>
					<template #value>
						<view class="dz-inline-block">
							<dz-radio :name="5" :active-color="theme.dzBaseColor"></dz-radio>
						</view>
					</template>
				</dz-cell-item>
				<!--佣金支付-->
				<dz-cell-item
					v-if="
						parseInt(payConfig[`pay_${payGroup}_brokerage`]) === 1 &&
						userInfo.promoter &&
						(userInfo.promoter.promoterFission ||
							userInfo.promoter.promoterRegional ||
							userInfo.promoter.promoterStore ||
							userInfo.promoter.promoterWarehouse)
					"
					center
					:title="
						userInfo.promoter.promoterWarehouse ? '货款支付' : api.formatString(language.orderPay.brokeragePay, shopSetting.commission_front_name)
					"
					:label="
						userInfo.promoter && userInfo.promoter.user_brokerage
							? userInfo.promoter.promoterWarehouse
								? api.formatString(language.orderPay.userWarehouseBrokerage, userInfo.promoter.user_brokerage)
								: api.formatString(language.orderPay.userBrokerage, shopSetting.commission_front_name, userInfo.promoter.user_brokerage)
							: userInfo.promoter.promoterWarehouse
							? api.formatString(language.orderPay.userWarehouseBrokerage, '0.00')
							: api.formatString(language.orderPay.userBrokerage, shopSetting.commission_front_name, '0.00')
					"
					icon="balance"
					hoverClass="none"
					iconSize="60"
					:icon-style="{ color: '#FFC43F', 'margin-right': '30rpx' }"
					:border-bottom="false"
					:arrow="false"
					@click="checkboxChange(7)"
				>
					<template #value>
						<view class="dz-inline-block">
							<dz-radio :name="7" :active-color="theme.dzBaseColor"></dz-radio>
						</view>
					</template>
				</dz-cell-item>
			</view>
		</dz-radio-group>
		<view class="footer">
			<view class="footer-btn">
				<view style="width: 90%">
					<!-- 预售 -->
					<dz-button
						v-if="parseInt(orderDetail.order_status) === 202"
						:custom-style="{
							width: '100%',
							background: submitting ? theme.dzBaseDisabled : theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						hover-class="none"
						shape="circle"
						:border="false"
						:loading="submitting"
						@click="paySubmit"
					>
						{{ language.orderPay.confirmPay + language.application.moneySymbol + money }}
					</dz-button>
					<dz-button
						v-else
						:custom-style="{
							width: '100%',
							background:
								parseInt(orderDetail.order_status) !== 0 || parseInt(orderDetail.close_left_time || submitting) <= 0
									? theme.dzBaseDisabled
									: theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						hover-class="none"
						shape="circle"
						:border="false"
						:loading="submitting"
						@click="paySubmit"
						:disabled="parseInt(orderDetail.order_status) !== 0 || parseInt(orderDetail.close_left_time) <= 0"
					>
						{{ language.orderPay.confirmPay + language.application.moneySymbol + money }}
					</dz-button>
				</view>
			</view>
		</view>
		<!--通商云支付宝支付确认-->
		<dz-popup v-model:show="allinpayAliPayShow" mode="center" width="90%" border-radius="30" :closeable="true">
			<view class="dz-p-t-40 dz-p-b-40 dz-p-l-20 dz-p-r-20">
				<view class="dz-text-center dz-font-24 dz-p-30 dz-tips-color">{{ language.orderPay.allinpayAlipayTip }}</view>
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
			:custom-color="theme.dzBaseColor"
			:show-cancel-button="riskData && riskData.type == 'count_suggest'"
			:show-custom-button="riskData && riskData.type == 'count_suggest'"
			:confirmText="riskData && riskData.type == 'count_suggest' ? '继续支付' : '确定'"
			cancelText="关闭"
			customText="充值"
			@confirm="handleRiskPay"
			@custom="rechargeClick"
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
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';
import quickCard from './components/quickCard/quickCard.vue';

const language = uni.$api.language;
const userStore = useUserStore();
const groupData = useGroup();
const radioGroup = ref(null);
const data = reactive({
	submitting: false,
	pageLoadingStatus: 'loading',
	pageLoadingShow: true,
	id: '',
	type: '', //公众号使用
	auto: '', //公众号使用
	wxCode: '', //公众号使用
	money: 0, //支付金额
	checkType: 0, //支付类型
	payConfig: {}, //支付配置
	payGroup: groupData.payGroup, //支付组别
	orderInfo: {}, //订单信息
	orderGroup: '', //订单组别
	group: groupData.group, //客户端组别
	payTradeno: '', //支付流水号
	submitQuery: {}, //提交参数
	apiUrl: uni.$api.apiPay.payCreate, //API提交地址
	payProductOptionId: '',
	wxAutoParam: {}, //微信自动登录带入参数
	orderDetail: {},
	allinpayAliPayShow: false,
	riskData: null,
	riskModalShow: false,
	cardShow: false,
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

onLoad(async (options) => {
	await uni.$onLaunched;
	data.id = options.id;
	uni.setNavigationBarTitle({
		title: uni.$api.language.orderPay.titleOrderPay,
	});
	data.type = options.type;
	data.auto = options.auto;
	data.wxCode = options.code || '';
	data.orderGroup = options.orderGroup || 'order';
	initData();
	initOrder();
});

onShow(() => {
	getMemberInfo();
});

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

//页面重新载入
function pageLoadingClick() {
	data.pageLoadingStatus = 'loading';
	initData();
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
	if (parseInt(data.payConfig[`pay_${data.payGroup}_balance`]) > 0) {
		data.checkType = 5;
		return;
	}
	if (parseInt(data.payConfig[`pay_${data.payGroup}_quick`]) > 0) {
		data.checkType = 8;
		return;
	}
	if (parseInt(data.payConfig[`pay_${data.payGroup}_brokerage`]) > 0) {
		data.checkType = 7;
		return;
	}
}

//获取订单信息
async function initOrder() {
	if (data.orderGroup == 'order') {
		await uni.$api.http
			.get(uni.$api.apiMember.orderView, {
				params: {
					id: data.id,
					simplify: 1,
				},
			})
			.then((res: any) => {
				data.orderDetail = res.data;
				data.money = res.data.order_status == '202' ? res.data.final_payment_money : res.data.pay_money;
				data.pageLoadingShow = false;
			})
			.catch(() => {
				data.pageLoadingStatus = 'error';
				return;
			});
	} else {
		await uni.$api.http
			.get(uni.$api.apiShop.distributionWarehousePurchaseOrderView, {
				params: {
					id: data.id,
				},
			})
			.then((res: any) => {
				data.orderDetail = res.data;
				data.money = res.data.pay_money;
				data.pageLoadingShow = false;
			})
			.catch(() => {
				data.pageLoadingStatus = 'error';
				return;
			});
	}

	if (data.auto && data.auto == 'wechat') {
		data.checkType = 1;
		paySubmit();
	}
}

//倒计时结束
function orderEnd() {
	initData();
}

//可支付时间倒计时结束
function riskEnd() {
	data.riskData.countdown = 0;
	data.riskModalShow = false;
}

//支付方式切换
function checkboxChange(e: number) {
	if (e == data.checkType) return;
	const item = unref(radioGroup)?.children.find((item) => item.name == e);
	if (!item) return;
	item.checked = true;
	unref(radioGroup).unCheckedOther(item);
}

//支付提交
function paySubmit() {
	if (data.submitting) {
		return;
	}
	if (parseInt(data.orderDetail.order_status) !== 0 && parseInt(data.orderDetail.order_status) !== 202 && parseInt(data.orderDetail.close_left_time) <= 0) {
		return;
	}
	if (data.checkType <= 0) {
		return uni.$api.toast(uni.$api.language.orderPay.payTypeError);
	}
	data.submitting = true;
	data.orderInfo.order_id = data.id;
	data.orderInfo.member_id = userInfo.value.id;
	data.submitQuery = {
		id: data.id,
		type: data.type,
		wholesale_id: data.orderDetail.wholesale_id,
		orderGroup: data.orderGroup == 'order' ? '' : data.orderGroup,
	};
	data.wxAutoParam = {
		id: data.id,
		type: data.type,
	};
	if (data.checkType === 5) {
		//余额支付
		balancePaySubmit();
	} else if (data.checkType === 7) {
		//佣金支付
		brokeragePaySubmit();
	} else if (data.checkType === 1) {
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

//余额支付
async function balancePaySubmit() {
	if (parseFloat(userInfo.value.account.user_money) < data.money) {
		uni.$api.toast(uni.$api.formatString(uni.$api.language.orderPay.balanceError, shopSetting.value.balance_front_name));
		data.submitting = false;
		return;
	}
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 5,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			data.payTradeno = res.data.out_trade_no;
			let post = {
				...data.submitQuery,
				out_trade_no: data.payTradeno,
			};
			uni.$api.router.redirectTo({
				route: uni.$api.routesConfig.paySuccess,
				query: post,
			});
		})
		.catch(() => {
			data.submitting = false;
		});
}

//佣金支付
async function brokeragePaySubmit() {
	if (
		!(
			userInfo.value.promoter &&
			(userInfo.value.promoter.promoterFission ||
				userInfo.value.promoter.promoterRegional ||
				userInfo.value.promoter.promoterStore ||
				userInfo.value.promoter.promoterWarehouse)
		)
	) {
		uni.$api.toast(uni.$api.formatString(uni.$api.language.orderPay.commissionError, shopSetting.value.commission_front_name));
		data.submitting = false;
		return;
	}
	if (!userInfo.value.promoter || !userInfo.value.promoter.user_brokerage || parseFloat(userInfo.value.promoter.user_brokerage) < data.money) {
		uni.$api.toast(uni.$api.formatString(uni.$api.language.orderPay.brokerageError, shopSetting.value.commission_front_name));
		data.submitting = false;
		return;
	}
	await uni.$api.http
		.post(data.apiUrl, {
			order_group: data.orderGroup,
			group: data.group,
			pay_type: 7,
			data: JSON.stringify(data.orderInfo),
		})
		.then((res) => {
			data.payTradeno = res.data.out_trade_no;
			let post = {
				...data.submitQuery,
				out_trade_no: data.payTradeno,
			};
			uni.$api.router.redirectTo({
				route: uni.$api.routesConfig.paySuccess,
				query: post,
			});
		})
		.catch(() => {
			data.submitting = false;
		});
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
		console.log('normalNativePayInWechat');
		// #ifdef H5
		if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
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
					uni.$api.toast(uni.$api.language.orderPay.payNotInWechat);
					data.submitting = false;
					// normalNativePayInWechat();
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
		await uni.$api.http
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
						success() {
							data.submitting = false;
							getPayResult();
						},
						fail() {
							data.submitting = false;
							uni.$api.toast(uni.$api.language.orderPay.wxPayFailTip);
						},
						cancel() {
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
					{
						params: {
							code: data.wxCode,
						},
					}
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
							success() {
								data.wxCode = '';
								data.submitting = false;
								getPayResult();
							},
							fail() {
								data.wxCode = '';
								data.submitting = false;
								uni.$api.toast(uni.$api.language.orderPay.wxPayFailTip);
							},
							cancel() {
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
			let url = uni.$api.objParseUrlAndParam(h5Url, {
				...data.wxAutoParam,
				auto: 'wechat',
				r: uni.$api.helper.guid(16),
			});
			//避免缓存
			url = encodeURIComponent(url);
			window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?
																				appid=${shopSetting.value.wechat_appid}&
																				redirect_uri=${url}&
																				response_type=code&
																				scope=snsapi_userinfo&
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
						{
							params: {
								code: loginRes.code,
							},
						}
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
				// #ifdef APP-PLUS
				normalNativePayAliInApp();
				// #endif
				//TODO 暂未支持
				// #ifndef APP-PLUS
				uni.$api.toast(uni.$api.language.orderPay.payMethodNoSupported);
				data.submitting = false;
				// #endif
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
				query: {
					...data.submitQuery,
					out_trade_no: data.payTradeno,
					url: encodeURIComponent(res.data.config),
				},
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
			plus.runtime.openURL(payUrl, () => {
				uni.$api.toast(uni.$api.language.orderPay.openAlipayError);
				data.allinpayAliPayShow = false;
			});
		})
		.catch((err) => {
			data.submitting = false;
			handleRisk(err);
		});
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

//查询支付结果
function getPayResult() {
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.payComplete,
		query: {
			...data.submitQuery,
			out_trade_no: data.payTradeno,
		},
	});
}

function handleCard() {
	data.cardShow = !data.cardShow;
}

//充值
function rechargeClick() {
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.recharge,
		query: {},
	});
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
	payGroup,
	payConfig,
	orderDetail,
	money,
	checkType,
	submitting,
	pageLoadingShow,
	pageLoadingStatus,
	allinpayAliPayShow,
	riskData,
	riskModalShow,
	cardShow,
} = {
	...toRefs(data),
};
</script>

<style lang="scss" scoped>
.price-box {
	margin: 80rpx 0 60rpx;
	text-align: center;
	.price {
		font-size: 60rpx;
		font-weight: 700;
	}
	.tip {
		font-size: 24rpx;
	}
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
.pay-type-list {
	width: 100%;
	background-color: #ffffff;
	margin: 24rpx;
	padding: 10rpx 0;
	border-radius: 20rpx;
	overflow: hidden;
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

.dz-transparent-btn {
	display: block;
	background: transparent;
	margin: 0;
	padding: 0;
	border-radius: 0;
	border: 0;
}

.dz-transparent-btn::after {
	border: 0;
}
</style>

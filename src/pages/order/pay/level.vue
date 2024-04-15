<template>
	<view>
		<dz-navbar title="会员卡"></dz-navbar>
		<view class="container">
			<view v-for="(item, index) in level" :key="index" class="item dz-font-28" :class="index != level.length - 1 ? 'dz-m-b-24' : ''">
				<dz-image :src="item.card_picture" :width="702" :height="320" :borderRadius="30"></dz-image>
				<view class="content">
					<view v-if="member.vip_level == item.id" class="tip" :style="{ background: theme.dzBaseDisabled }">当前等级</view>
					<view class="top">
						<view class="dz-font-50">
							{{ item.name }}
							<text class="dz-font-24" @tap="handleModalShow(item.detail)">规则 <dz-icon name="question" color="#fff"> </dz-icon></text>
						</view>
						<view class="time dz-font-24 dz-m-t-8">
							{{ member.vip_level == item.id && member.vip_expired_time ? api.timeFormat(member.vip_expired_time, 'yyyy-mm-dd') + '到期' : '' }}
						</view>
					</view>
					<view class="bottom">
						<block v-if="member.memberLevel && member.memberLevel.level > item.level"> 当前高于该等级 </block>
						<block v-else>
							<view class="dz-font-50 dz-font-weight"> {{ item.discount }}<text class="dz-m-l-10 dz-font-24">%减除折扣</text> </view>
							<view
								><dz-button
									:custom-style="{
										background: theme.dzBaseColor,
										color: theme.dzBaseFontColor,
										width: '150rpx',
										height: '60rpx',
										borderRadius: '30rpx',
										fontSize: '26rpx',
									}"
									size="mini"
									shape="circle"
									hover-class="none"
									:border="false"
									@click="handlePrice(item)"
								>
									{{ member.memberLevel ? (member.vip_level != item.id ? '去升级' : '立即续费') : '立即开通' }}
								</dz-button></view
							>
						</block>
					</view>
				</view>
			</view>
			<dz-empty v-if="!level.length" :src="empty" margin-top="160"></dz-empty>
			<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
		</view>

		<dz-modal
			v-model:show="modalShow"
			:mask-close-able="false"
			title="会员卡介绍"
			:confirm-color="theme.dzBaseColor"
			confirmText="我知道了"
			width="90%"
			@confirm="handleModalShow()"
		>
			<view class="dz-p-30 dz-font-24">
				{{ detail }}
			</view>
		</dz-modal>

		<dz-popup v-model:show="priceShow" mode="bottom" :closeable="true" border-radius="40" closeIcon="roundclose" closeIconSize="40">
			<view class="dz-text-center dz-p-t-30 dz-font-weight dz-font-30">请选择支付方式</view>

			<view class="dz-flex dz-row-center dz-p-t-30">
				<dz-image :src="levelConfig.picture" width="120" height="120"></dz-image>
			</view>
			<view class="dz-text-center dz-p-20">{{ levelConfig.name }}</view>
			<dz-grid :border="false" :col="3" customStyle="padding:20rpx">
				<dz-grid-item v-for="(item, index) in levelConfig.option" :key="index" @click="active = index" customStyle="padding:10px">
					<view
						class="layout"
						:style="{
							background: active == index ? theme.dzBaseFontColor : theme.dzBgColor,
							borderColor: active == index ? theme.dzBaseColor : theme.dzBgColor,
							color: active == index ? theme.dzBaseColor : '',
						}"
					>
						<view class="dz-font-40 dz-font-weight"><text class="dz-m-r-2 dz-font-price dz-font-24"></text>{{ item.value }}</view>
						<view class="dz-font-sm dz-m-t-10">{{ item.label }}</view>
					</view>
				</dz-grid-item>

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
								userInfo.promoter.promoterWarehouse
									? '货款支付'
									: api.formatString(language.orderPay.brokeragePay, shopSetting.commission_front_name)
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
			</dz-grid>

			<view class="dz-p-20 btn">
				<dz-button
					:border="false"
					hoverClass="none"
					:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '100%', height: '90rpx' }"
					shape="circle"
					:loading="submitting"
					@click="paySubmit()"
				>
					确定
				</dz-button>
			</view>
		</dz-popup>

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
		<!-- 银行列表 -->
		<quickCard v-model="cardShow" />
	</view>
</template>

<script setup lang="ts">
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';
import quickCard from './components/quickCard/quickCard.vue';

const userStore = useUserStore();
const groupData = useGroup();
const language = uni.$api.language;
const empty = uni.$api.assetsConfig.emptyOrder;

const theme = computed(() => {
	return userStore.getTheme;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const data = reactive({
	loadingShow: true,
	pageLoadingStatus: 'loading',
	level: [],
	member: {},
	detail: '',
	modalShow: false,
	priceShow: false,
	active: 0,
	levelConfig: {
		id: '',
		picture: '',
		name: '',
		option: [
			{ label: '月费', value: '', type: 'month' },
			{ label: '季费', value: '', type: 'season' },
			{ label: '年费', value: '', type: 'year' },
		],
	},
	submitting: false,
	checkType: 0, //支付类型
	payConfig: {}, //支付配置
	payGroup: groupData.payGroup, //支付组别
	orderInfo: {}, //订单信息
	orderGroup: 'vip', //订单组别
	group: groupData.group, //客户端组别
	payTradeno: '', //支付流水号
	submitQuery: {}, //提交参数
	apiUrl: uni.$api.apiMember.memberLevelPaySubmit, //API提交地址
	payProductOptionId: '',
	wxAutoParam: {}, //微信自动登录带入参数
	allinpayAliPayShow: false,
	riskData: null,
	riskModalShow: false,
	cardShow: false,
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '会员卡',
	});
	getMemberLevelIndex();
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

function loadingClick() {
	getMemberLevelIndex();
}

function getMemberLevelIndex() {
	uni.$api.http
		.get(uni.$api.apiMember.memberLevelIndex)
		.then((res) => {
			data.loadingShow = false;
			data.level = res.data.level;
			data.member = res.data.member;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
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
}

//可支付时间倒计时结束
function riskEnd() {
	data.riskData.countdown = 0;
	data.riskModalShow = false;
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

//支付方式切换
function checkboxChange(e: number) {
	if (e == data.checkType) return;
	data.checkType = e;
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

//支付提交
function paySubmit() {
	if (data.submitting) {
		return;
	}
	if (data.checkType <= 0) {
		return uni.$api.toast(uni.$api.language.orderPay.payTypeError);
	}
	data.submitting = true;
	data.orderInfo.level_id = data.levelConfig.id;
	data.orderInfo.duration = data.levelConfig.option[data.active].type;
	data.orderInfo.member_id = userInfo.value.id;
	data.submitQuery = {
		type: 'vip_buy',
		orderGroup: data.orderGroup,
	};
	data.wxAutoParam = {
		type: 'vip_buy',
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

function handleModalShow(e) {
	data.detail = e ? e : '';
	data.modalShow = !data.modalShow;
}

function handlePrice(item) {
	const { id, picture, name, card_month_price, card_season_price, card_year_price } = item;

	data.levelConfig.id = id;
	data.levelConfig.picture = picture;
	data.levelConfig.name = name;
	data.levelConfig.option[0].value = card_month_price;
	data.levelConfig.option[1].value = card_season_price;
	data.levelConfig.option[2].value = card_year_price;
	data.priceShow = true;
}
const {
	level,
	member,
	detail,
	modalShow,
	priceShow,
	active,
	levelConfig,
	checkType,
	payConfig,
	payGroup,
	allinpayAliPayShow,
	submitting,
	loadingShow,
	pageLoadingStatus,
	riskData,
	riskModalShow,
	cardShow,
} = {
	...toRefs(data),
};
</script>

<style lang="scss">
.container {
	margin: 24rpx;
	.item {
		position: relative;
		border-radius: 30rpx;
		color: #fff;
		.content {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			padding: 40rpx;
			.tip {
				position: absolute;
				top: 0;
				left: 0;
				padding: 4rpx 10rpx;
				font-size: 24rpx;
				border-radius: 20rpx 0 20rpx 0;
			}
			.time {
				height: 32rpx;
			}
			.bottom {
				display: flex;
				justify-content: space-between;
				width: 100%;
				height: 60rpx;
				margin-top: 86rpx;
			}
		}
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
}

.btn {
	margin-bottom: env(safe-area-inset-bottom);
}
.layout {
	width: 100%;
	padding: 20rpx 5rpx;
	border: 4rpx solid #fff;
	border-radius: 20rpx;
	text-align: center;
}
</style>

<template>
	<view>
		<dz-navbar title="创建提货订单"></dz-navbar>
		<view class="order" v-if="orderDetail.products">
			<!--选择地址-->
			<view class="dz-address-section" @tap="choiceAddress">
				<view class="order-content">
					<view class="dz-flex">
						<view class="dzicon-iconfont dzicon-round_location_fill"></view>
						<view v-if="addressData" class="address">
							<view class="top">
								<text class="name">{{ addressData.realname }}</text>
								<text class="mobile">+{{ addressData.mobile_area + ' ' + api.maskCode(addressData.mobile, 3, 4) }}</text>
							</view>
							<text class="address-detail dz-inline-1">{{ addressData.address_name }} {{ addressData.address_details }}</text>
						</view>
						<view class="no-default-address" v-else>{{ language.orderCreate.pleaseShippingAddress }}</view>
					</view>
					<text class="dzicon-iconfont dzicon-right"></text>
				</view>
				<view class="address-line-box">
					<view class="address-line" v-for="index in 12" :key="index"></view>
				</view>
			</view>
			<!--商品列表-->
			<view class="dz-goods-section">
				<view class="g-header">
					<text class="name dz-m-r-10">{{ language.orderCreate.shopList }}</text>
					<dz-tag :show="orderType ? true : false" size="mini" :text="orderType"></dz-tag>
				</view>
				<view class="line">
					<dz-line></dz-line>
				</view>
				<!-- 商品列表 -->
				<block v-for="(item, index) in orderDetail.products" :key="index">
					<view v-if="index < moreNum" class="g-item" @tap="gotoProduct(item.product_id)">
						<image :src="item.product_picture" mode="aspectFill"></image>
						<view class="right">
							<view class="title dz-inline-2">
								<dz-tag
									:show="parseInt(item.gift_flag) > 0 ? true : false"
									class="dz-m-r-10"
									size="mini"
									:bg-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:color="theme.dzBaseFontColor"
									:text="language.orderCreate.giveaways"
								></dz-tag>
								{{ item.product_name }}
							</view>
							<text class="spec">{{ item.sku_name || language.orderCreate.theDefaultParagraph }} x {{ item.num }}</text>
							<view class="price-box" :style="{ color: theme.dzBaseColor }">
								<text class="dz-font-24">￥</text>
								<text class="price"> {{ item.price }}</text>
								<text class="number" :style="{ color: theme.dzBaseColor }"></text>
							</view>
						</view>
					</view>
				</block>
				<view v-if="orderDetail.products.length > 2 && moreNum == 2" class="dz-p-20 dz-text-center dz-font-24 dz-tips-color" @tap="moreTap()">
					展开(共{{ orderDetail.products.length }}件)
					<dz-icon class="dz-m-l-6" name="unfold"></dz-icon>
				</view>

				<view
					v-if="orderDetail.products.length > 2 && moreNum == orderDetail.products.length"
					class="dz-p-20 dz-text-center dz-font-24 dz-tips-color"
					@tap="topTap()"
				>
					收起(共{{ orderDetail.products.length }}件)
					<dz-icon class="dz-m-l-6" name="fold"></dz-icon>
				</view>
			</view>
			<view class="dz-list">
				<dz-cell-item center title="备注" :arrow="false" :border-bottom="false" hover-class="none" :customStyle="{ padding: '10rpx 20rpx' }">
					<template #value>
						<view class="dz-m-l-60">
							<dz-input
								v-model="buyerMessage"
								:maxlength="45"
								inputAlign="right"
								border="none"
								clearable
								placeholder="输入备注信息，45字内"
								:customStyle="{ height: '54rpx', background: 'transparent' }"
							></dz-input>
						</view>
					</template>
				</dz-cell-item>
				<!-- 优惠券 -->
				<dz-cell-item
					@tap="toggleMask()"
					center
					:title="language.orderCreate.discountCoupon"
					:arrow="true"
					:value="couponItem.title || language.orderCreate.pleaseDiscountCoupon"
					:border-bottom="false"
					hover-class="none"
					v-if="couponTabs.length > 0 && isShowConpon"
					:customStyle="{ padding: '10rpx 20rpx' }"
				></dz-cell-item>
				<!--配送模式选择，未关闭全部配送方式，同时开启物流方式，自提方式-->
				<dz-cell-item
					v-if="
						orderDetail.close_all_logistics == 0 &&
						orderDetail.is_open_logistics == 1 &&
						orderDetail.pickup_point_config &&
						orderDetail.pickup_point_config.buyer_self_lifting == 1
					"
					@tap="showSinglePicker"
					center
					:title="language.orderCreate.modeOfDistribution"
					:arrow="true"
					:border-bottom="false"
					hover-class="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value="currentShippingType.label || language.orderCreate.selectDeliveryMode"
				></dz-cell-item>
				<dz-cell-item
					v-if="
						orderDetail.close_all_logistics == 0 &&
						orderDetail.is_open_logistics == 1 &&
						orderDetail.pickup_point_config &&
						orderDetail.pickup_point_config.buyer_self_lifting == 0
					"
					center
					:title="language.orderCreate.modeOfDistribution"
					:arrow="false"
					:border-bottom="false"
					hover-class="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					value="快递配送"
				></dz-cell-item>
				<dz-cell-item
					v-if="
						orderDetail.close_all_logistics == 0 &&
						orderDetail.is_open_logistics == 0 &&
						orderDetail.pickup_point_config &&
						orderDetail.pickup_point_config.buyer_self_lifting == 1
					"
					center
					:title="language.orderCreate.modeOfDistribution"
					:arrow="false"
					:border-bottom="false"
					hover-class="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value="'买家自提'"
				></dz-cell-item>
				<!--自提点选择，未关闭全部配送方式，同时开启自提方式-->
				<dz-cell-item
					v-if="
						orderDetail.close_all_logistics == 0 &&
						orderDetail.pickup_point_config &&
						orderDetail.pickup_point_config.buyer_self_lifting == 1 &&
						currentShippingType.value == 2 &&
						orderDetail.pickup_point_config.list.length > 0
					"
					@tap="showPickupPointPicker"
					center
					:title="language.orderCreate.storePickUpPoint"
					:arrow="true"
					:border-bottom="false"
					hover-class="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value="(currentPickupPoint && currentPickupPoint.label) || language.orderCreate.storePickUpPoint"
				></dz-cell-item>
				<!--暂无自提点-->
				<dz-cell-item
					v-if="
						orderDetail.close_all_logistics == 0 &&
						orderDetail.pickup_point_config &&
						orderDetail.pickup_point_config.buyer_self_lifting == 1 &&
						currentShippingType.value == 2 &&
						orderDetail.pickup_point_config.list.length == 0
					"
					center
					:title="language.orderCreate.storePickUpPoint"
					:arrow="false"
					:border-bottom="false"
					hover-class="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					value="暂无自提点"
				></dz-cell-item>
				<!--必须积分-->
				<dz-cell-item
					v-if="pointExchangeType[0] == 2 || pointExchangeType[0] == 4"
					center
					:title="api.formatString(language.orderCreate.needIntegrals, shopSetting.point_front_name)"
					:arrow="false"
					:border-bottom="false"
					hover-class="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value="
						api.formatString(
							language.orderCreate.youNeedToUseIntegrals,
							orderDetail.preview && orderDetail.preview.point,
							shopSetting.point_front_name
						)
					"
				></dz-cell-item>
				<!--积分抵扣-->
				<dz-cell-item
					v-if="pointExchangeType[0] == 1 && pointConfig && pointConfig.point_to_cash_is_open == 1 && orderDetail.max_use_point > 0"
					center
					:title="
						orderDetail.products[0].point_exchange_type && orderDetail.products[0].point_exchange_type == 4
							? `使用${maxUsePoint}${shopSetting.point_front_name}`
							: api.formatString(language.orderCreate.usePoint, maxUsePoint, shopSetting.point_front_name, maxUsePointFee)
					"
					:arrow="false"
					:border-bottom="false"
					hover-class="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
				>
					<template #right-icon>
						<dz-switch v-model="isUsePoint" :activeColor="theme.dzBaseColor" @change="handleIsUsePoint"></dz-switch>
					</template>
				</dz-cell-item>
			</view>
			<!-- 金额明细 -->
			<view class="dz-list ios-bottom">
				<dz-cell-item
					center
					:title="language.orderCreate.amountGoods"
					:value="api.formatString(language.orderCreate.price, api.toFloat(productOriginalMoney, 2).toFixed(2))"
					:arrow="false"
					:border-bottom="false"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value-style="{ color: theme.dzBaseColor }"
					hover-class="none"
				></dz-cell-item>
				<dz-cell-item
					center
					:title="currentShippingType.value == 2 ? language.orderCreate.packageMoney : language.orderCreate.shippingMoney"
					:value="shippingMoney == 0 ? language.orderCreate.freeShippingMoney : api.formatString(language.orderCreate.price, shippingMoney)"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value-style="{ color: theme.dzBaseColor }"
					:arrow="false"
					:border-bottom="false"
					hoverClass="none"
				></dz-cell-item>
				<dz-cell-item
					center
					:title="language.orderCreate.invoiceAmount"
					:value="api.formatString(language.orderCreate.price, invoiceAmount)"
					:arrow="false"
					:border-bottom="false"
					hoverClass="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value-style="{ color: theme.dzMainColor }"
				></dz-cell-item>
				<dz-cell-item
					center
					integral
					:title="api.formatString(language.orderCreate.givePoint, shopSetting.point_front_name)"
					:value="
						orderDetail.preview && api.formatString(language.orderCreate.integral, orderDetail.preview.give_point, shopSetting.point_front_name)
					"
					:arrow="false"
					:border-bottom="false"
					hoverClass="none"
					:customStyle="{ padding: '10rpx 20rpx' }"
					:value-style="{ color: theme.dzMainColor }"
				></dz-cell-item>
				<view>
					<block v-if="parseInt(shopSetting.order_invoice_is_open) === 1">
						<dz-cell-item
							v-if="invoiceItem.type"
							center
							:title="language.orderCreate.issueAnInvoice"
							:border-bottom="false"
							:arrow="false"
							hoverClass="none"
							@tap="gotoInvoice"
							:value="isInvoice()"
							:customStyle="{ padding: '10rpx 20rpx' }"
							:value-style="{ color: theme.dzMainColor }"
						>
							<template #right-icon>
								<view @tap.stop="invoiceDelete">
									<dz-icon
										class="dz-m-l-20"
										:size="32"
										name="delete"
										:color="theme.dzMainColor"
										:customStyle="{ padding: '10rpx 20rpx' }"
									></dz-icon>
								</view>
							</template>
						</dz-cell-item>
						<dz-cell-item
							center
							hoverClass="none"
							:title="language.orderCreate.issueAnInvoice"
							@tap="gotoInvoice"
							:value="language.orderCreate.noIssueAnInvoice"
							:border-bottom="false"
							:customStyle="{ padding: '10rpx 20rpx' }"
							:value-style="{ color: theme.dzMainColor }"
							v-else
						></dz-cell-item>
					</block>
				</view>
			</view>
			<!-- 底部 -->
			<view class="footer">
				<view class="footer-bottom">
					<view class="price-content dz-inline-1">
						<text>{{ language.orderCreate.actualPayment }}</text>
						<text class="price-tip" :style="{ color: theme.dzBaseColor }">￥</text>
						<text class="price text-bold" :style="{ color: theme.dzBaseColor }">
							{{ `${realAmount}` }}
						</text>
					</view>
					<dz-button
						:custom-style="{
							width: '260rpx',
							height: '80rpx',
							marginRight: '20rpx',
							background: btnLoading || !submitEnabled ? theme.dzBaseDisabled : theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						hover-class="none"
						@click="submit"
						shape="circle"
						:border="false"
						:disabled="btnLoading || !submitEnabled"
						:loading="btnLoading"
						v-if="orderDetail.preview && userInfo.account.user_integral >= orderDetail.preview.point"
					>
						<template v-if="parseInt(orderDetail.close_all_logistics) === 1">配送已关闭</template>
						<template v-else>
							<template v-if="currentShippingType.value == 1">
								<template v-if="!addressData || !addressData.realname">请选择配送地址</template>
								<template v-if="addressData && addressData.realname && shippingIsSupport == 0">{{
									shippingIsSupportMsg || '物流已关闭'
								}}</template>
								<template v-if="addressData && addressData.realname && shippingIsSupport > 0">{{ language.orderCreate.submitOrder }}</template>
							</template>
							<template v-else-if="currentShippingType.value == 2">
								<template v-if="orderDetail.pickup_point_config.list.length == 0">自提点未配置</template>
								<template v-else>{{ language.orderCreate.submitOrder }}</template>
							</template>
							<template v-else>{{ language.orderCreate.submitOrder }}</template>
						</template>
					</dz-button>
					<dz-button
						v-else
						type="info"
						:custom-style="{
							width: '260rpx',
							height: '80rpx',
							marginRight: '20rpx',
						}"
						@click="submit"
						shape="circle"
						:disabled="true"
						:loading="btnLoading"
					>
						{{ api.formatString(language.orderCreate.noIntegral, shopSetting.point_front_name) }}
					</dz-button>
				</view>
			</view>
		</view>
		<!-- 优惠券面板 -->
		<dz-popup v-model:show="isShow" mode="bottom" border-radius="40" closeIcon="roundclose" closeIconSize="40" :closeable="true">
			<view class="dz-coupon__box">
				<view class="dz-coupon__title">
					<text class="dz-font-32 dz-font-weight">优惠券</text>
				</view>
				<dz-tabs
					v-if="couponTabs.length"
					:list="couponTabs"
					:current="couponCurrent"
					:scrollable="false"
					lineHeight="4"
					:activeStyle="{
						color: theme.dzBaseColor,
						fontWeight: 'bold',
					}"
					bgColor="transpare"
					:lineColor="theme.dzBaseColor"
					@change="tabsChange"
				></dz-tabs>
				<scroll-view v-if="couponTabs.length && couponTabs[couponCurrent].key" scroll-y class="dz-coupon__list">
					<view v-if="couponCurrent != 1" class="dz-not-used dz-m-t-20 dz-color-9">
						<block v-if="activeCoupon.type">
							<text v-if="defaultCouponId != activeCoupon.id">已选择一张优惠劵</text>
							<text v-else>
								已为您选择
								<text :style="{ color: theme.dzBaseColor }">最佳优惠</text>
							</text>
							<text class="dz-m-l-10">
								可
								<text :style="{ color: theme.dzBaseColor }">抵扣￥{{ couponViewMoney }}</text>
							</text>
						</block>
						<block v-else>请选择推荐优惠</block>
					</view>
					<block v-for="(item, index) in coupon[couponTabs[couponCurrent].key]" :key="index">
						<dz-coupon-item :coupon="item" :isButton="couponCurrent != 1" customStyle="margin-top:20rpx" @click="selectCoupon">
							<template #checkbox>
								<view class="dz-flex dz-row-right">
									<dz-checkbox-group :activeColor="theme.dzBaseColor" shape="circle" @change="selectCoupon(item)">
										<dz-checkbox
											v-if="activeCoupon.id === item.id"
											:checked="true"
											:disabled="parseFloat(amountGoods) < parseFloat(item.at_least)"
										></dz-checkbox>

										<dz-checkbox v-else :checked="false" :disabled="parseFloat(amountGoods) < parseFloat(item.at_least)"></dz-checkbox>
									</dz-checkbox-group>
								</view>
							</template>
						</dz-coupon-item>
					</block>
					<view style="height: 20rpx"></view>
				</scroll-view>
				<view v-if="couponCurrent != 1" class="dz-p-20">
					<dz-button
						:custom-style="{
							width: '100%',
							background: theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						shape="circle"
						hover-class="none"
						:border="false"
						@click="couponSubmit"
					>
						确定
					</dz-button>
				</view>
			</view>
		</dz-popup>
		<!-- 优惠价格 -->
		<dz-popup v-model:show="discountAmountShow" mode="bottom" :border-radius="40" closeIcon="roundclose" :closeIconSize="40" :closeable="true">
			<view class="dz-discount-amount">
				<view class="dz-m-b-60 dz-text-center dz-font-32 dz-font-weight">优惠金额</view>
				<scroll-view scroll-y style="min-height: 600rpx; color: #666">
					<view v-for="(item, index) in orderDetail.marketing_full_details" :key="index" class="dz-flex dz-row-between dz-m-b-20">
						<text>{{ item.marketing_name }}</text>
						<text>{{ item.marketing_condition }}</text>
					</view>
					<view v-if="couponTabs.length > 0 && isShowConpon" class="dz-flex dz-row-between">
						<text>{{ couponItem.title }}</text>
						<text>￥{{ couponItem.money }}</text>
					</view>
				</scroll-view>
			</view>
		</dz-popup>
		<!-- 配送方式 -->
		<dz-select v-model="shippingShow" :defaultValue="shippingDefaultValue" mode="single-column" @confirm="onShippingConfirm" :list="pickerShippingType" />
		<!-- 门店自提 -->
		<dz-select
			v-model="pickupPintShow"
			:defaultValue="pickupDefaultValue"
			mode="single-column"
			@confirm="onPickupPointConfirm"
			:list="orderDetail.pickup_point_config && orderDetail.pickup_point_config.list"
		/>
		<!-- 填写推荐码 -->
		<dz-modal
			ref="modalRef"
			v-model:show="promoCodeShow"
			title="填写推荐码"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="showCancelButton"
			:async-close="true"
			@confirm="promoCodeConfirm"
		>
			<dz-field
				v-model="setPromoCode"
				label="推荐码"
				placeholder="请输入推荐码"
				:border-bottom="false"
				maxlength="12"
				style="margin: 20rpx 0 10rpx"
			></dz-field>
		</dz-modal>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, toRefs } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const isFullPayment = ref<number>(0); //是否全款预定
const isShow = ref<boolean>(false); // 优惠券面板显示状态
const isShowConpon = ref<boolean>(true); // 是否显示优惠券选择
const orderType = ref<string>(''); //购买类型
const pointExchangeType = ref<[]>([]);
const pickerShippingType = ref<[]>([]);
const btnLoading = ref<boolean>(false);
const shippingInfo = ref<[]>([]); //可用的物流信息
const shippingMoney = ref<number>(0);
const isUsePoint = ref<boolean>(false);
const use_point = ref<number>(0);
const buyerMessage = ref<string>('');
const shippingShow = ref<boolean>(false); //是否显示选择配送方式
const shippingDefaultValue = ref([]);
const pickupPintShow = ref<boolean>(false); // 选择自提
const pickupDefaultValue = ref([]);
const pageLoadingStatus = ref<string>('loading');
const pageLoadingShow = ref<boolean>(true);
const shippingIsSupport = ref<number>(null); // 是否支持物流配送
const shippingIsSupportMsg = ref<string>(''); //物流不支持提示信息
const defaultCouponId = ref<string>('');
const couponTabs = ref<array>([
	{
		name: '可用优惠劵',
		key: 'coupon',
	},
]);
const couponCurrent = ref<number>(0);
const data = reactive({
	orderDetail: {},
	currentShippingType: {},
	currentCompany: {},
	currentPickupPoint: {},
	invoiceItem: {},
	addressData: {},
	couponItem: {},
	pointConfig: null,
	params: null,
	coupon: {
		couponList: [],
		disabledCoupon: [],
	},
	activeCoupon: {},
	showCancelButton: true,
	promoCodeShow: false,
	setPromoCode: '',
});

const discountAmountShow = ref<boolean>(false);
const moreNum = ref<number>(2);

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const promoCode = computed(() => {
	return userStore.getPromoCode;
});

const cartPageListen = computed(() => {
	return userStore.getCartPageListen;
});

// 原本商品金额
const productOriginalMoney = computed(() => {
	let money = 0.0;
	if (data.orderDetail.products && data.orderDetail.products.length) {
		data.orderDetail.products.forEach((item) => {
			money += item.product_original_money ? parseFloat(item.product_original_money) : 0;
		});
	}
	return money;
});

// 计算商品金额
const amountGoods = computed(() => {
	if (data.params && data.params.type == 'presell_buy' && parseInt(isFullPayment.value) === 1) {
		return data.orderDetail.full_payment;
	} else {
		return data.orderDetail.preview && data.orderDetail.preview.product_money;
	}
});

// 显示优惠金额
const discountAmountView = computed(() => {
	return parseInt(data.couponItem.type, 10) === 2
		? discountAmount.value
		: data.couponItem.money
		? parseFloat(data.couponItem.money) + productMoney.value
		: productMoney.value;
});

// 弹窗显示优惠金额
const couponViewMoney = computed(() => {
	const couponData = data.activeCoupon.type ? data.activeCoupon : data.couponItem;
	const discountMoney = floor(((100 - couponData.discount) / 100) * amountGoods.value);
	return parseInt(couponData.type, 10) === 2 ? discountMoney + productMoney.value : couponData.money || productMoney.value;
});

// 计算优惠金额
const discountAmount = computed(() => {
	const discountMoney = floor(((100 - data.couponItem.discount) / 100) * amountGoods.value);
	return parseInt(data.couponItem.type, 10) === 2 ? discountMoney + productMoney.value : data.couponItem.money || productMoney.value;
});

// 商品优惠金额
const productMoney = computed(() => {
	let originalMoney = 0;
	let _productMoney = 0;
	if (data.orderDetail && data.orderDetail.preview) {
		originalMoney = parseFloat(data.orderDetail.preview.product_original_money) * 10;
		_productMoney = parseFloat(data.orderDetail.preview.product_money) * 10;
	}
	return (Math.floor((originalMoney || 0) * 10) - Math.floor((_productMoney || 0) * 10)) / 100;
});

// 计算实付金额
const realAmount = computed(() => {
	let isDiscoDnt = false;
	if (data.params && (data.params.type == 'discount' || data.params.type == 'buy_now' || data.params.type == 'cart') && data.couponItem.type == 1) {
		isDiscoDnt = true;
	}
	let _realAmount =
		amountGoods.value -
		discountAmount.value +
		parseFloat(shippingMoney.value) -
		(isUsePoint.value ? maxUsePointFee.value : 0) +
		(isDiscoDnt ? 0 : productMoney.value);
	_realAmount = parseFloat(invoiceAmount.value) + _realAmount;
	return (Math.round((_realAmount || 0) * 100) / 100).toFixed(2);
});

// 计算发票税费
const invoiceAmount = computed(() => {
	const _realAmount = amountGoods.value - discountAmount.value - (isUsePoint.value ? maxUsePointFee.value : 0);
	return data.invoiceItem.type ? floor((data.orderDetail.invoice.order_invoice_tax / 100) * _realAmount) : 0;
});

// 计算可用积分
const maxUsePoint = computed(() => {
	if (data.pointConfig && parseInt(data.pointConfig.point_to_cash_is_open) === 1) {
		let point =
			data.orderDetail.max_use_point > userInfo.value.account.user_integral ? userInfo.value.account.user_integral : data.orderDetail.max_use_point;
		let fee = point * data.pointConfig.point_to_cash_convert_rate;
		let _realAmount = amountGoods.value - discountAmount.value;
		if (fee > _realAmount) {
			point = _realAmount / data.pointConfig.point_to_cash_convert_rate;
		}
		if (point < 0) {
			point = Math.abs(point);
		}
		return parseInt(point);
	} else {
		return 0;
	}
});

// 计算最大积分可抵扣金额
const maxUsePointFee = computed(() => {
	if (data.pointConfig && parseInt(data.pointConfig.point_to_cash_is_open) === 1) {
		return Math.round(maxUsePoint.value * parseFloat(data.pointConfig.point_to_cash_convert_rate) * 100) / 100;
	} else {
		return 0;
	}
});

// 计算是否可以下一步
const submitEnabled = computed(() => {
	//物流配送全部被关闭
	if (parseInt(data.orderDetail.close_all_logistics) === 1) {
		return false;
	}
	let shippingValue = data.currentShippingType.value;
	//物流配送
	if (shippingValue == 1) {
		//没有地址
		if (!data.addressData || !data.addressData.realname) {
			return false;
		}
		if (shippingIsSupport.value == 0) {
			return false;
		}
	}
	//自提
	if (shippingValue == 2) {
		//没有自提地点
		if (data.orderDetail.pickup_point_config.list.length == 0) {
			return false;
		}
	}
	return true;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '确定订单',
	});

	if (!options.data) {
		pageLoadingStatus.value = 'error';
	}
	data.params = JSON.parse(options.data);
	if (!data.params) {
		pageLoadingStatus.value = 'error';
	}

	const conponType = ['wholesale', 'combination', 'group_buy', 'point_exchange'];
	if (conponType.includes(data.params.type)) {
		isShowConpon.value = false;
	}

	orderType.value = uni.$api.dataConfig.orderType[data.params.type];
	uni.$on('getAddressData', (e) => {
		data.addressData = e;
		if (data.addressData && data.addressData.realname) {
			getOrderFreightFee();
		}
	});
	uni.$on('getInvoice', (e) => {
		data.invoiceItem = e;
	});
	data.setPromoCode = parseInt(userInfo.value.pid) == 0 ? '' : userInfo.value.pid;
	getOrderDetail();
});

onUnload(() => {
	uni.$off(['getAddressData', 'getInvoice']);
});

function pageLoadingClick() {
	pageLoadingStatus.value = 'loading';
	getOrderDetail();
}

function isInvoice() {
	if (data.invoiceItem.type) {
		return `${language.orderCreate.electronicInvoice} - ${
			parseInt(data.invoiceItem.type, 10) === 1 ? language.orderCreate.company : language.orderCreate.name
		} - ${data.invoiceItem.title}`;
	}
}

function choiceAddress() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.address,
		query: {
			source: 'orderCreate',
		},
	});
}

function gotoProduct(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id: id,
		},
	});
}

function gotoInvoice() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.invoice,
		query: {
			source: 'orderCreate',
		},
	});
}

// 向下取整
function floor(val) {
	return Math.floor(val * 100) / 100;
}

// 是否使用积分抵扣
function handleIsUsePoint(value) {
	if (value) {
		isUsePoint.value = true;
		use_point.value = maxUsePoint.value;
	} else {
		isUsePoint.value = false;
		use_point.value = 0;
	}
}

// 选择物流
function showSinglePicker() {
	if (pickerShippingType.value.length) {
		const list = pickerShippingType.value;
		const findIndex = list.findIndex((item) => item.value == data.currentShippingType.value);
		if (findIndex != -1) {
			shippingDefaultValue.value = [findIndex];
		}
	}
	shippingShow.value = true;
}

// 选择自提点
function showPickupPointPicker() {
	if (data.orderDetail.pickup_point_config && data.orderDetail.pickup_point_config.list) {
		const list = data.orderDetail.pickup_point_config.list;
		const findIndex = list.findIndex((item) => item.id == data.currentPickupPoint.value);
		if (findIndex != -1) {
			pickupDefaultValue.value = [findIndex];
		}
	}
	pickupPintShow.value = true;
}

// 确定选择物流配送方式
function onShippingConfirm(e) {
	data.currentShippingType = e[0];
	if (data.currentShippingType.value == 2) {
		//自提
		if (parseInt(data.orderDetail.pickup_point_config.pickup_point_is_open) == 1) {
			if (parseFloat(realAmount.value) > parseFloat(data.orderDetail.pickup_point_config.pickup_point_freight)) {
				shippingMoney.value = 0;
			} else {
				shippingMoney.value = parseFloat(data.orderDetail.pickup_point_config.pickup_point_fee) || 0;
			}
		} else {
			shippingMoney.value = 0;
		}
	} else {
		//物流配送
		getOrderFreightFee();
	}
}

// 确定选择自提点
async function onPickupPointConfirm(e) {
	data.currentPickupPoint = e[0];
	if (data.currentPickupPoint) {
		if (parseInt(data.orderDetail.pickup_point_config.pickup_point_is_open) == 1) {
			if (parseFloat(realAmount.value) > parseFloat(data.orderDetail.pickup_point_config.pickup_point_freight)) {
				shippingMoney.value = 0;
			} else {
				shippingMoney.value = parseFloat(data.orderDetail.pickup_point_config.pickup_point_fee) || 0;
			}
		} else {
			shippingMoney.value = 0;
		}
	}
}

// 计算快递运费
async function getOrderFreightFee() {
	const params = {};
	if (data.addressData) {
		params.address_id = data.addressData.id;
	}

	await uni.$api.http
		.get(uni.$api.apiShop.distributionWarehousePickUpOrderFreightFee, {
			params: {
				...params,
				...data.params,
			},
		})
		.then((res) => {
			shippingInfo.value = [];
			data.currentCompany = {};
			shippingMoney.value = res.data.shipping_money;
			// 是否支持物流配送
			shippingIsSupport.value = res.data.shipping_is_support;
			// shippingIsSupport.value = 1;
			// 是否支持物流配送提示信息
			shippingIsSupportMsg.value = res.data.shipping_not_support_msg;
			//以下2句必须，否则computer不执行
			data.currentShippingType.value = 1;
		});
}

// 获取订单详情
async function getOrderDetail() {
	await uni.$api.http
		.get(uni.$api.apiShop.distributionWarehousePickUpOrderPreview, {
			params: {
				...data.params,
			},
		})
		.then((res) => {
			data.orderDetail = res.data;
			//积分
			data.pointConfig = data.orderDetail.point_config;
			//收货地址
			data.addressData = data.orderDetail.address;
			// 邮费
			shippingMoney.value = res.data.preview.shipping_money || 0;
			// 是否支持物流配送
			shippingIsSupport.value = res.data.shipping_is_support;
			// 是否支持物流配送提示信息
			shippingIsSupportMsg.value = res.data.shipping_not_support_msg;

			//优惠券
			if ('combination,wholesale,group_buy'.indexOf(data.params.type) !== -1) {
				data.couponItem = {};
			} else {
				let couponFee = [];
				let couponArr = [];
				data.coupon.couponList = [];
				data.coupon.disabledCoupon = [];
				if (data.orderDetail.coupons && data.orderDetail.coupons.length > 0) {
					data.orderDetail.coupons.forEach((item) => {
						if (parseFloat(data.orderDetail.preview.product_money) >= parseFloat(item.at_least)) {
							couponArr.push(item);
							data.coupon.couponList.push(item);
						} else {
							data.coupon.disabledCoupon.push(item);
						}
					});
				}
				if (couponArr.length > 0) {
					couponArr.forEach((item) => {
						if (parseInt(item.type) === 1) {
							couponFee.push(parseFloat(item.money));
						} else {
							couponFee.push((data.orderDetail.preview.product_money * (100 - item.discount)) / 100);
						}
					});
				}
				if (couponFee.length > 0) {
					data.couponItem = couponArr[uni.$api.getMaxIndex(couponFee)];
					defaultCouponId.value = data.couponItem.id;
				}

				if (data.coupon.couponList.length) {
					couponTabs.value[0] = {
						name: `可用优惠劵(${data.coupon.couponList.length})`,
						key: 'couponList',
					};
				} else {
					couponTabs.value = [];
				}
				if (data.coupon.disabledCoupon.length && data.coupon.couponList.length) {
					couponTabs.value[1] = {
						name: `不可用优惠劵(${data.coupon.disabledCoupon.length})`,
						key: 'disabledCoupon',
					};
				}
			}

			//积分兑换
			pointExchangeType.value = [];
			data.orderDetail.products.forEach((item) => {
				pointExchangeType.value.push(item.point_exchange_type);
			});
			//开启了快递配送
			if (parseInt(data.orderDetail.is_open_logistics) === 1) {
				pickerShippingType.value.push({
					label: language.orderCreate.logisticsDistribution,
					value: 1,
				});
				getOrderFreightFee();
			}
			//开启了自提配送
			if (data.orderDetail.pickup_point_config && parseInt(data.orderDetail.pickup_point_config.buyer_self_lifting) === 1) {
				data.orderDetail.pickup_point_config.list.forEach((item) => {
					item.label = `${item.name || language.orderCreate.uncharted} - ${item.address || language.orderCreate.uncharted}`;
					item.value = item.id;
				});
				data.currentPickupPoint = data.orderDetail.pickup_point_config.list[0] || {};
				pickerShippingType.value.push({
					label: language.orderCreate.theBuyerToThe,
					value: 2,
				});
			} else {
				data.orderDetail.pickup_point_config.list = [];
			}

			//配送方式选择
			if (pickerShippingType.value.length > 0) {
				data.currentShippingType = pickerShippingType.value[0];
			}
			//关闭加载窗口
			pageLoadingShow.value = false;
		})
		.catch(() => {
			pageLoadingStatus.value = 'error';
		});
}

function moreTap() {
	moreNum.value = data.orderDetail.products.length;
}

function topTap() {
	moreNum.value = 2;
}

// 显示优惠券面板
function toggleMask(type) {
	if ('combination,wholesale,group_buy'.indexOf(data.params.type) !== -1) {
		uni.$api.toast(uni.$api.language.orderCreate.couponUnsupported);
		return;
	}
	if (data.orderDetail.coupons.length === 0) {
		uni.$api.toast(uni.$api.language.orderCreate.noCoupon);
		return;
	}
	data.activeCoupon = data.couponItem;
	isShow.value = true;
}

// 显示优惠金额面板
function discountAmountTab() {
	if (parseFloat(discountAmount.value) > 0 || (couponTabs.value.length > 0 && isShowConpon.value)) {
		discountAmountShow.value = true;
	}
}

function promoCodeConfirm() {
	data.showCancelButton = false;
	if (!data.setPromoCode) {
		data.promoCodeShow = true;
		data.showCancelButton = true;
		unref(modalRef)?.clearLoading();
		uni.$api.toast('推荐码不能为空');
		return;
	}
	uni.$api.http
		.post(uni.$api.apiMember.setParent, {
			promo_code: data.setPromoCode,
		})
		.then(() => {
			userStore.setPromoCode(data.setPromoCode);
		})
		.finally(() => {
			data.promoCodeShow = false;
			data.showCancelButton = true;
		});
}

// 提交订单
async function submit() {
	if ([2, 3].includes(parseInt(shopSetting.value.member_parent_type)) && !data.setPromoCode) {
		uni.$api.toast('温馨提示：系统检查到您当前账号未绑定推荐人，请绑定推荐人才可以购物');
		data.promoCodeShow = true;
		return;
	}
	if (parseInt(data.orderDetail.close_all_logistics) === 1) {
		uni.$api.toast(uni.$api.language.orderCreate.logisticsClose);
		return;
	}
	const params = {};
	params.buyer_message = buyerMessage.value;
	if (promoCode.value) {
		params.promo_code = promoCode.value;
	}
	if (data.couponItem && data.couponItem.id) {
		params.coupon_record_id = data.couponItem.id;
	}
	if (data.invoiceItem && data.invoiceItem.id) {
		params.invoice_id = data.invoiceItem.id;
	}
	if (data.currentShippingType && data.currentShippingType.value) {
		params.shipping_type = data.currentShippingType.value;
		if (parseInt(data.currentShippingType.value) === 1) {
			if (data.currentCompany && data.currentCompany.value) {
				params.company_id = data.currentCompany.value;
			}
			if (data.addressData && data.addressData.id) {
				params.address_id = data.addressData.id;
			} else {
				uni.$api.toast(uni.$api.language.orderCreate.pleaseShippingAddress);
				return;
			}
		}
		if (parseInt(data.currentShippingType.value) === 2) {
			if (data.currentPickupPoint && data.currentPickupPoint.value) {
				params.pickup_id = data.currentPickupPoint.value;
			}
		}
	}
	if (use_point.value) {
		params.use_point = use_point.value;
	}
	if (data.params.type === 'presell_buy') {
		params.is_full_payment = isFullPayment.value;
	}
	btnLoading.value = true;
	await uni.$api.http
		.post(uni.$api.apiShop.distributionWarehousePickUpOrderCreate, {
			...params,
			...data.params,
			data: JSON.stringify(data.params.data),
		})
		.then(async (res) => {
			if (data.params.type == 'cart') {
				//清空购物车
				await clearCartItem();
			}
			if (parseInt(res.data.pay_status) === 1) {
				uni.$api.router.redirectTo({
					route: uni.$api.routesConfig.paySuccess,
					query: {
						id: res.data.id,
						type: data.params.type,
					},
				});
			} else {
				uni.$api.router.redirectTo({
					route: uni.$api.routesConfig.pay,
					query: {
						id: res.data.id,
						type: data.params.type,
					},
				});
			}
			btnLoading.value = false;
		})
		.catch(() => {
			btnLoading.value = false;
		});
}

function clearCartItem() {
	if (cartPageListen.value) {
		uni.$emit('cartNumChange', {});
	} else {
		uni.$api.http.get(uni.$api.apiMember.cartItemCount).then((res) => {
			userStore.setCartNum(res.data);
		});
	}
}

function selectCoupon(item) {
	if (couponCurrent.value == 1) return;
	if (item) {
		if (parseFloat(amountGoods.value) < parseFloat(item.at_least)) {
			uni.$api.toast(uni.$api.language.orderCreate.doNotDiscountCoupon);
			return;
		}
		if (item.id == data.activeCoupon.id) {
			return (data.activeCoupon = {});
		}
		data.activeCoupon = item;
	} else {
		data.activeCoupon = {};
	}
}

function couponSubmit() {
	data.couponItem = data.activeCoupon;
	isShow.value = false;
}

function tabsChange(e) {
	couponCurrent.value = e.index;
}

function invoiceDelete() {
	data.invoiceItem = {};
}

const {
	orderDetail,
	addressData,
	currentShippingType,
	params,
	currentPickupPoint,
	pointConfig,
	couponItem,
	invoiceItem,
	coupon,
	activeCoupon,
	showCancelButton,
	promoCodeShow,
	setPromoCode,
} = {
	...toRefs(data),
};
</script>

<style lang="scss" scoped>
.order {
	padding: 10rpx 20rpx 130rpx;
	margin-bottom: env(safe-area-inset-bottom);
}
.dz-address-section {
	padding: 20rpx 20rpx 26rpx;
	background: #fff;
	position: relative;
	border-radius: 20rpx;
	overflow: hidden;
	.order-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.dzicon-round_location_fill {
		font-size: 72rpx;
		margin-right: 20rpx;
	}
	.no-default-address {
		color: $dz-main-color;
		font-size: 32rpx;
	}

	.dzicon-right {
		color: $dz-tips-color;
	}

	.address {
		display: flex;
		flex-direction: column;
		flex: 1;
		font-size: 28rpx;
		color: $dz-main-color;
	}

	.name {
		font-size: 34rpx;
		margin-right: 24rpx;
	}

	.mobile {
		font-size: 34rpx;
	}

	.address-detail {
		font-size: 24rpx;
		margin-top: 16rpx;
		margin-right: 20rpx;
		color: $dz-tips-color;
	}

	.address-line {
		background: #ff7967;
		border-radius: 1rpx 1rpx 0 0;
		flex: 1;
		height: 6rpx;
		transform: skew(-30deg);
		width: 55rpx;
	}

	.address-line-box {
		display: flex;
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 0;
	}

	.address-line:not(:first-child) {
		margin-left: 20rpx;
	}
	.address-line:nth-child(even) {
		background: #7ca8ff;
	}
}

.dz-goods-section {
	margin-top: 20rpx;
	background: #fff;
	padding-bottom: 1px;
	border-radius: 20rpx;
	.g-header {
		display: flex;
		align-items: center;
		height: 84rpx;
		padding: 0 20rpx;
		position: relative;
	}
	.line {
		margin: 0 20rpx;
	}

	.name {
		font-size: 30rpx;
		color: $dz-main-color;
	}

	.g-item {
		display: flex;
		margin: 20rpx;
		image {
			flex-shrink: 0;
			display: block;
			width: 172rpx;
			height: 172rpx;
			border-radius: 15rpx;
			background-color: $dz-bg-color;
		}
		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding-left: 16rpx;
			overflow: hidden;
		}
		.title {
			font-size: 28rpx;
			color: $dz-main-color;
			line-height: 40rpx;
			height: 80rpx;
			display: block;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}
		.spec {
			font-size: 22rpx;
			color: $dz-tips-color;
		}

		.price-box {
			display: flex;
			align-items: center;

			.price {
				font-size: 30rpx;
				font-weight: 500;
			}
			.number {
				font-size: 26rpx;
				margin-left: 20rpx;
			}
		}
	}
}

// 优惠券样式
.dz-coupon__box {
	width: 100%;
}

.dz-coupon__title {
	width: 100%;
	padding: 30rpx 30rpx 20rpx;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.dz-icon-close {
	position: absolute;
	right: 30rpx;
	top: 50%;
	transform: translateY(-50%);
}

.dz-coupon__list {
	width: 100%;
	max-height: 640rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
	background-color: $dz-bg-color;
}
.dz-not-used {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: $dz-main-color;
	background: #fff;
	padding: 20rpx 30rpx;
	box-sizing: border-box;
	border-radius: 10rpx;
}

.dz-coupon-title {
	font-size: 28rpx;
	line-height: 28rpx;
}

.dz-list {
	margin-top: 20rpx;
	background: #fff;
	border-radius: 20rpx;
}

// 优惠金额
.dz-discount-amount {
	padding: 30rpx 30rpx 20rpx;
	width: 100%;
}

.ios-bottom {
	margin-bottom: env(safe-area-inset-bottom);
}

.footer {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 98;
	width: 100%;
	font-size: 30rpx;
	background: #fff;
	color: $dz-main-color;
	.footer-bottom {
		display: flex;
		align-items: center;
		width: 100%;
		height: 110rpx;
		justify-content: space-between;
		margin-bottom: env(safe-area-inset-bottom);
	}
	.price-content {
		padding-left: 20rpx;
	}
	.price-tip {
		margin-left: 8rpx;
		font-size: 24rpx;
	}
	.price {
		font-size: 36rpx;
		font-weight: 500;
	}
}
</style>

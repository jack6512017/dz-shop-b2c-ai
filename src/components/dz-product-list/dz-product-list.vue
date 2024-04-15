<template>
	<view
		class="dz-product-list"
		:class="[isList ? 'dz-product-bg-list' : '']"
		:style="{
			margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
			borderRadius: isList ? `${borderRadius}rpx` : '',
			overflow: 'hidden',
		}"
	>
		<view class="dz-product-list-container" :style="{ marginRight: isList ? 0 : '20rpx' }">
			<block v-for="(item, index) in list" :key="index">
				<!--商品列表-->
				<view
					v-if="(index + 1) % 2 !== 0 || isList"
					class="dz-product-item dz-content-bg-color"
					@tap.stop="productTab(item.id)"
					:class="[isList ? 'dz-product-flex-list' : '']"
					hover-class="hover"
					:hover-start-time="150"
				>
					<view class="dz-product-image-wrapper">
						<image
							:src="item.picture"
							:mode="isList ? 'aspectFill' : 'widthFix'"
							:preview="false"
							:class="[isList ? 'dz-product-list-img' : 'dz-product-img']"
						></image>
						<view
							class="triangle-wrapper"
							v-if="
								parseInt(item.shipping_type) === 1 ||
								parseInt(item.is_virtual) === 1 ||
								item.commissionRate ||
								parseInt(item.is_open_presell) === 1
							"
							><image class="triangle-tag" :src="filterTagName(item)"></image
						></view>
					</view>
					<view class="dz-pro-content" v-if="item" :style="{ marginRight: isList ? 0 : '10rpx' }">
						<view class="dz-pro-tit">
							<dz-icon
								class="dz-m-r-10"
								:color="theme.dzBaseColor"
								name="memberDiscount"
								v-if="parseInt(item.is_open_member_discount) === 1"
							></dz-icon>
							<dz-icon class="dz-m-r-10" :color="theme.dzBaseColor" name="virtualProduct" v-if="parseInt(item.is_virtual) === 1"></dz-icon>
							{{ item.name }}
						</view>
						<view>
							<view class="dz-pro-price">
								<text class="dz-sale-price" :style="{ color: theme.dzBaseColor }">
									<text :class="[parseInt(item.point_exchange_type) > 2 ? '' : 'dz-font-price dz-font-24']"></text>
									<text>
										{{
											parseInt(item.point_exchange_type) > 2
												? item.point_exchange + api.formatString(language.shopProductList.point, shopSetting.point_front_name)
												: currentPrice(item)
										}}</text
									>
								</text>

								<text class="dz-factory-price dz-font-price" v-if="marketPriceShow == 1 && item.market_price">
									{{ api.toFloat(item.market_price).toFixed(2) }}
								</text>
							</view>
							<view class="dz-pro-pay" v-if="item">
								<text>
									<text :style="{ color: theme.dzBaseColor }">
										{{ filterTotalSales(item.total_sales) }}
									</text>
									{{ language.shopProductList.paidNumber }}
								</text>
							</view>
							<view
								v-if="cart.status == 1"
								class="cart dz-flex dz-row-center"
								:style="{
									background: cart.color,
									borderRadius: `${cart.radius * 2}rpx`,
								}"
								@tap.stop="toggleSpec(item)"
							>
								<dz-icon :name="cart.type == 'add' ? 'add2' : 'cart'" color="#fff" :size="36"></dz-icon>
							</view>
						</view>
					</view>
				</view>
				<!--商品列表-->
			</block>
		</view>

		<view class="dz-product-list-container" v-if="!isList" style="margin-right: 0">
			<block v-for="(item, index) in list" :key="index">
				<!--商品列表-->
				<view
					v-if="(index + 1) % 2 === 0"
					class="dz-product-item dz-content-bg-color"
					@tap.stop="productTab(item.id)"
					:class="[isList ? 'dz-product-flex-list' : '']"
					hover-class="hover"
					:hover-start-time="150"
				>
					<view class="dz-product-image-wrapper">
						<image
							:src="item.picture"
							:mode="isList ? 'aspectFill' : 'widthFix'"
							:preview="false"
							:class="[isList ? 'dz-product-list-img' : 'dz-product-img']"
						></image>
						<view
							class="triangle-wrapper"
							v-if="
								parseInt(item.shipping_type) === 1 ||
								parseInt(item.is_virtual) === 1 ||
								item.commissionRate ||
								parseInt(item.is_open_presell) === 1
							"
						>
							<image class="triangle-tag" :src="filterTagName(item)"></image>
						</view>
					</view>
					<view class="dz-pro-content" v-if="item">
						<view class="dz-pro-tit">
							<dz-icon
								class="dz-m-r-10"
								:color="theme.dzBaseColor"
								name="memberDiscount"
								v-if="parseInt(item.is_open_member_discount) === 1"
							></dz-icon>
							<dz-icon class="dz-m-r-10" :color="theme.dzBaseColor" name="virtualProduct" v-if="parseInt(item.is_virtual) === 1"></dz-icon>
							{{ item.name }}
						</view>
						<view>
							<view class="dz-pro-price">
								<text class="dz-sale-price" :style="{ color: theme.dzBaseColor }">
									<text :class="[parseInt(item.point_exchange_type) > 2 ? '' : 'dz-font-price dz-font-24']"></text>
									<text>
										{{
											parseInt(item.point_exchange_type) > 2
												? item.point_exchange + api.formatString(language.shopProductList.point, shopSetting.point_front_name)
												: currentPrice(item)
										}}
									</text>
								</text>
								<text class="dz-factory-price dz-font-price" v-if="marketPriceShow == 1 && item.market_price">
									{{ api.toFloat(item.market_price).toFixed(2) }}
								</text>
							</view>
							<view class="dz-pro-pay" v-if="item">
								<text>
									<text :style="{ color: theme.dzBaseColor }">{{ filterTotalSales(item.total_sales) }}</text>
									{{ language.shopProductList.paidNumber }}
								</text>
							</view>
						</view>
						<view
							v-if="cart.status == 1"
							class="cart dz-flex dz-row-center"
							:style="{
								background: cart.color,
								borderRadius: `${cart.radius * 2}rpx`,
							}"
							@tap.stop="toggleSpec(item)"
						>
							<dz-icon :name="cart.type == 'add' ? 'add2' : 'cart'" color="#fff" :size="36"></dz-icon>
						</view>
					</view>
				</view>
				<!--商品列表-->
			</block>
		</view>
		<!-- 规格弹窗 -->
		<dz-popup v-model:show="specShow" mode="bottom" border-radius="40" closeIcon="roundclose" closeIconSize="40" :closeable="true">
			<dz-attr-content :product="productDetail" :buyNumber="currentNumber" buttonName="加入购物车" @confirm="attrConfirmClick"></dz-attr-content>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import assetsConfig from '@/core/config/assetsConfig';
import { useUserStore } from '@/state/modules/user';

const specShow = ref<boolean>(false);
const currentNumber = ref<number>(1);
const currentSkuId = ref<string>();
const currentSkuNumber = ref<string>();
const productDetail = reactive<any>({});
const userStore = useUserStore();
const language = uni.$api.language;
const { cartPageListen } = userStore.getData;

defineProps({
	// 列表
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 是否以列表展示 | 列表或大图
	isList: {
		type: Boolean,
		default: false,
	},
	borderRadius: {
		type: [String, Number],
		default: 0,
	},
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 0,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 0,
	},
	marginLeftRight: {
		type: [String, Number],
		default: 0,
	},
	cart: {
		type: Object,
		default() {
			return {};
		},
	},
	// 是否显示划线价格
	marketPriceShow: {
		type: [String, Number],
		default: 1,
	},
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

function filterTotalSales(val) {
	if (val > 10000) {
		val = `${(val / 10000).toFixed(2)}w`;
	}
	return val;
}

function filterTagName(val: any): string {
	if (val.commissionRate) {
		// 分销商品
		return assetsConfig.distribution;
	} else if (parseInt(val.is_open_presell) === 1) {
		// 预售商品
		return assetsConfig.presale;
	} else if (parseInt(val.is_virtual) === 1) {
		// 虚拟产品
		return assetsConfig.virtual;
	} else if (parseInt(val.shopping_type) === 1) {
		// 包邮产品
		return assetsConfig.pinkage;
	}
}

function productTab(id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id: id,
		},
	});
}

// 计算价格
function currentPrice(item: any) {
	let price = item.price;
	// 云仓分销进货价格
	let level_id =
		(userInfo.value &&
			userInfo.value.promoter &&
			userInfo.value.promoter.promoterWarehouse &&
			userInfo.value.promoter.promoterWarehouse.state == 1 &&
			userInfo.value.promoter.promoterWarehouse.level_id) ||
		'';
	if (item.warehouseCommissionRate && item.warehouseCommissionRate.is_distribution == 1 && level_id) {
		let commission_rate = item.warehouseCommissionRate.commission_rate;
		let skus = [];
		for (let key in commission_rate) {
			if (commission_rate[key][level_id] && parseFloat(commission_rate[key][level_id].brokerage) > 0) {
				skus.push(commission_rate[key][level_id].brokerage);
			}
		}
		price = skus.length ? get_min(skus) : item.price;
	}
	if (item.memberDiscount && parseFloat(item.memberDiscount.discount) > 0) {
		//会员折扣
		price = parseFloat(price * (1 - parseFloat(item.memberDiscount.discount) / 100));
	}
	return parseFloat(price).toFixed(2);
}

function get_min(list: array): array {
	return Math.min.apply(
		Math,
		list.map((item) => {
			return parseFloat(item);
		})
	);
}

//打开属性选择
function toggleSpec(row: any) {
	if (parseInt(row.status) === 0) {
		uni.$api.toast(language.cart.notSale);
		return;
	}
	if (!userStore.hasLogin) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.login,
		});
		return;
	}
	getProductDetail(row);
}

//属性选择确认
function attrConfirmClick(data: any) {
	currentSkuId.value = data.skuId;
	currentSkuNumber.value = data.skuNumber;
	addToCart();
}

//获取商品详情
async function getProductDetail(row: any) {
	currentSkuId.value = row.sku_id;
	currentNumber.value = row.number;
	await uni.$api.http
		.get(uni.$api.apiShop.productView, {
			params: {
				id: row.product_id || row.id,
			},
		})
		.then((res) => {
			let data = res.data;
			data.sku_name = row.sku_name;
			data.sku_data = res.data.sku.length ? res.data.sku[0].data : '';
			for (const key in data) {
				productDetail[key] = data[key];
			}
			specShow.value = true;
		});
}

//加入购物车
async function addToCart() {
	if (!userStore.hasLogin) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.login,
		});
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(language.product.choiceProductAttribute);
		return;
	}
	await uni.$api.http
		.post(uni.$api.apiShop.cartItemCreate, {
			sku_id: currentSkuId.value,
			num: currentSkuNumber.value,
		})
		.then(() => {
			uni.$api.toast(language.product.addToCartSuccess);
			specShow.value = false;
			//购物车页面打开的情况下发送事件
			if (cartPageListen) {
				uni.$emit('cartNumChange', {});
			} else {
				getCartCount();
			}
		});
}
//获取购物车数量
async function getCartCount() {
	uni.$api.http.get(uni.$api.apiShop.cartItemCount).then((res) => {
		userStore.setCartNum(res.data);
	});
}
</script>

<style lang="scss" scoped>
.dz-product-list {
	display: flex;
	justify-content: space-between;
	flex-direction: row;
	flex-wrap: wrap;
	box-sizing: border-box;
	.dz-product-list-container {
		flex: 1;
		margin-right: 20rpx;
	}
	.dz-product-list-container:last-child {
		margin-right: 0rpx !important;
	}
	.dz-product-item {
		width: 100%;
		margin-bottom: 20rpx;
		box-sizing: border-box;
		border-radius: 20rpx;
		overflow: hidden;
		transition: all 0.15s ease-in-out;
	}
	.dz-product-list-item {
		width: 100%;
		box-sizing: border-box;
	}
	.dz-product-flex-list {
		width: 100%;
		display: flex;
		padding: 20rpx 0 2rpx !important;
	}
	.dz-product-image-wrapper {
		overflow: hidden;
		position: relative;
		flex-shrink: 0;
		.dz-product-img {
			width: 100%;
			display: block;
		}
		.dz-product-list-img {
			border-radius: 19rpx;
			width: 252rpx;
			height: 252rpx !important;
			display: block;
			flex-shrink: 0;
			background-color: $dz-bg-color;
		}
		.sketch {
			width: 100%;
			background-color: rgba(0, 0, 0, 0.4);
			position: absolute;
			border-bottom-left-radius: 6rpx;
			bottom: 0;
			padding: 0 8rpx;
			right: 0;
			color: #fff;
			font-size: 24rpx;
		}
		.triangle-wrapper {
			border-top-left-radius: 6rpx;
			position: absolute;
			overflow: hidden;
			top: 0;
			left: 0;
			.triangle-tag {
				width: 64rpx;
				height: 64rpx;
			}
		}
	}
	.dz-pro-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		box-sizing: border-box;
		padding: 20rpx;
		.dz-pro-tit {
			height: 64rpx; //这里的高度必须为line-height*显示行数
			color: $dz-main-color;
			font-size: 26rpx;
			line-height: 32rpx;
			word-break: break-all;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
		}
		.dz-pro-price {
			padding-top: 18rpx;
		}
		.dz-sale-price {
			font-size: 34rpx;
			font-weight: 500;
		}
		.dz-factory-price {
			font-size: 24rpx;
			color: $dz-tips-color;
			text-decoration: line-through;
			padding-left: 12rpx;
		}
		.dz-pro-pay {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-top: 10rpx;
			font-size: 24rpx;
			color: $dz-content-color;
			.iconfont {
				font-size: 38rpx;
				padding: 0 10rpx;
			}
		}
		.cart {
			position: absolute;
			right: 20rpx;
			bottom: 20rpx;
			width: 52rpx;
			height: 52rpx;
		}
	}
}

.dz-product-bg-list {
	padding: 4rpx 0rpx 2rpx 24rpx;
	background: #ffffff;
}
</style>

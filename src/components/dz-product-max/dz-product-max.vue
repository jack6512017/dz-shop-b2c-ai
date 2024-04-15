<template>
	<view class="product-box">
		<view
			class="product-item dz-content-bg-color"
			v-for="(item, index) in list"
			:key="index"
			@tap="productTab(item.id)"
			:style="{
				margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
				borderRadius: `${borderRadius}rpx`,
				overflow: 'hidden',
			}"
		>
			<view
				class="image"
				:style="{
					height: dataSource == 'manual' ? `${maxHeight}rpx` : '320rpx',
				}"
			>
				<dz-image
					:src="dataSource == 'manual' ? diyPicture(index) : item.picture"
					width="100%"
					:height="dataSource == 'manual' ? maxHeight : 320"
				></dz-image>
			</view>
			<view class="dz-p-20 dz-relative">
				<view class="flex">
					<view class="name dz-line-2 dz-main-color">
						<dz-icon
							class="dz-m-r-10"
							:color="theme.dzBaseColor"
							name="memberDiscount"
							v-if="parseInt(item.is_open_member_discount) === 1"
						></dz-icon>
						{{ item.name }}
					</view>
					<view class="sum dz-tips-color">{{ item.total_sales }}人购买</view>
				</view>
				<view class="tip dz-tips-color">{{ item.sketch }}</view>
				<view class="dz-flex">
					<text class="dz-font-34 dz-font-weight-light" :style="{ color: theme.dzBaseColor }">
						<text class="dz-font-price dz-font-24 dz-m-r-2"></text>{{ currentPrice(item) }}</text
					>
					<text
						v-if="marketPriceShow == 1 && item.market_price"
						style="margin-left: 12rpx; text-decoration: line-through; font-size: 24rpx; color: #999"
					>
						￥{{ api.toFloat(item.market_price).toFixed(2) }}
					</text>
					<dz-tag
						class="dz-m-l-10"
						:bg-color="theme.dzBaseColor"
						:border-color="theme.dzBaseColor"
						:color="theme.dzBaseFontColor"
						:show="item.is_commission_product == 1"
						mode="dark"
						size="mini"
						text="升级产品"
					></dz-tag>
					<dz-tag
						class="dz-m-l-10"
						:bg-color="theme.dzBaseColor"
						:border-color="theme.dzBaseColor"
						:color="theme.dzBaseFontColor"
						:show="item.is_open_presell == 1"
						mode="dark"
						size="mini"
						text="预售"
					></dz-tag>
					<dz-tag
						class="dz-m-l-10"
						:bg-color="theme.dzBaseColor"
						:border-color="theme.dzBaseColor"
						:color="theme.dzBaseFontColor"
						:show="item.min_buy > 1"
						mode="dark"
						size="mini"
						:text="`${item.min_buy}件起售`"
					></dz-tag>
					<dz-tag
						class="dz-m-l-10"
						:bg-color="theme.dzBaseColor"
						:border-color="theme.dzBaseColor"
						:color="theme.dzBaseFontColor"
						:show="item.max_buy > 0"
						mode="dark"
						size="mini"
						:text="`限购${item.max_buy}件`"
					></dz-tag>
					<dz-tag
						class="dz-m-l-10"
						:bg-color="theme.dzBaseColor"
						:border-color="theme.dzBaseColor"
						:color="theme.dzBaseFontColor"
						:show="item.give_point > 0"
						mode="dark"
						size="mini"
						:text="`赠送${shopSetting.point_front_name}`"
					></dz-tag>
					<dz-tag
						class="dz-m-l-10"
						:bg-color="theme.dzBaseColor"
						:border-color="theme.dzBaseColor"
						:color="theme.dzBaseFontColor"
						:show="item.max_use_point > 0"
						mode="dark"
						size="mini"
						:text="`${shopSetting.point_front_name}抵现`"
					></dz-tag>
				</view>
				<view
					v-if="cart.status == 1"
					class="cart dz-flex dz-row-center"
					:style="{
						background: cart.color,
						borderRadius: `${cart.borderRadius * 2}rpx`,
					}"
					@tap.stop="toggleSpec(item)"
				>
					<dz-icon :name="cart.type == 'add' ? 'add2' : 'cart'" color="#fff" :size="36"></dz-icon>
				</view>
			</view>
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

const props = defineProps({
	// 商品
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 是否显示标签  比如: 分销商品,预售商品等
	isTag: {
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
	defaultList: {
		type: Array,
		default() {
			return [];
		},
	},
	dataSource: {
		type: String,
		default: 'default',
	},
	// 上下边距
	maxHeight: {
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

const specShow = ref<boolean>(false);
const currentNumber = ref<number>(1);
const currentSkuId = ref<string>();
const currentSkuNumber = ref<string>();
const productDetail = reactive<any>({});
const userStore = useUserStore();
const language = uni.$api.language;

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

function diyPicture(index: number): string {
	let picture = props.list[index].picture;
	if (props.defaultList.length && props.defaultList[index].picture) {
		picture = props.defaultList[index].diyPicture ? props.defaultList[index].diyPicture : props.list[index].picture;
	}
	return picture;
}

function get_min(list: array): array {
	return Math.min.apply(
		Math,
		list.map((item) => {
			return parseFloat(item);
		})
	);
}

function productTab(id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id: id,
		},
	});
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
		.get(uni.$api.apiShop.productDetail, {
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
.product-box {
	.product-item {
		.image {
			width: 100%;
			height: 320rpx;
		}
		.flex {
			display: flex;
			justify-content: space-between;
			.sum {
				flex-shrink: 0;
				margin-left: 10rpx;
				font-size: 26rpx;
			}
		}
		.name {
			font-size: 26rpx;
		}
		.tip {
			padding: 10rpx 0;
			font-size: 26rpx;
			color: #999;
		}
	}
}
.cart {
	position: absolute;
	right: 20rpx;
	bottom: 20rpx;
	width: 52rpx;
	height: 52rpx;
}
</style>

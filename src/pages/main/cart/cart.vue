<template>
	<view>
		<dz-navbar :is-fixed="true" :is-back="false" input-align="center" :title="barTitle">
			<template #right>
				<view class="navbar-right" v-if="slotRight">
					<view class="right-item">
						<dz-icon
							name="settings_light"
							size="38"
							:label="cartSetting ? language.cart.complete : language.cart.manage"
							color="#000"
							@click="cartSettingClick"
						></dz-icon>
					</view>
				</view>
			</template>
		</dz-navbar>
		<!-- 未登录 -->
		<view v-if="!userStore.hasLogin"><dz-empty :src="missingFace" margin-top="200" text="登录查看" iconSize="120" @click="loginClick"></dz-empty></view>
		<!-- 购物车为空 -->
		<view v-if="userStore.hasLogin && cartList.length == 0 && !loading">
			<dz-empty margin-top="80" :text="language.cart.cartEmpty" @click="emptyClick" :src="emptyCart" iconSize="360"></dz-empty>
		</view>
		<!-- 购物车列表 -->
		<view v-if="userStore.hasLogin && cartList.length > 0">
			<!-- #ifdef MP -->
			<view class="dz-edit-goods">
				<view>{{ api.formatString(language.cart.cartTotal, cartList.length) }}</view>
				<view>
					<dz-button
						:custom-style="{ background: theme.dzBaseColor, color: api.theme.dzBaseFontColor }"
						hover-class="none"
						:plain="true"
						:border="false"
						size="mini"
						shape="circle"
						throttleTime="200"
						@click="cartSettingClick"
					>
						{{ cartSetting ? language.cart.complete : language.cart.manage }}
					</dz-button>
				</view>
			</view>
			<!-- #endif -->
			<view class="dz-cart">
				<dz-checkbox-group ref="checkboxGroup">
					<view style="width: 100%">
						<view class="dz-cart-cell dz-m-b-20" v-for="(item, index) in cartList" :key="index">
							<!-- 可销售商品 -->
							<view v-if="parseInt(item.status) != 0">
								<!-- 赠品或其它信息 -->
								<dz-swipe-action :index="index" :actions="actionOptions" @click="actionClick">
									<template #content>
										<view class="dz-goods-item">
											<label class="dz-checkbox">
												<dz-checkbox
													shape="circle"
													:active-color="theme.dzBaseColor"
													:checked="item.selected == 0 ? false : true"
													:name="index"
													@change="checkboxChange(index, $event)"
												></dz-checkbox>
											</label>
											<view class="dz-goods-img" @tap.stop="productTap(item.product_id)">
												<dz-image :src="item.product_img" :borderRadius="12" :width="200" :height="200"></dz-image>
											</view>

											<view class="dz-goods-info">
												<view class="dz-goods-title" @tap.stop="productTap(item.product_id)">
													<dz-icon
														v-if="item.memberDiscount && item.memberDiscount.discount && item.memberDiscount.discount > 0"
														class="dz-m-r-10"
														size="26"
														:color="theme.dzBaseColor"
														name="memberDiscount"
													></dz-icon>
													{{ item.product_name }}
												</view>
												<view class="dz-goods-model" @tap.stop="toggleSpec(item)">
													<view class="dz-model-text">{{ item.sku_name || singleSkuText }}</view>
													<dz-icon name="unfold" :size="24" :color="theme.dzMainColor"></dz-icon>
												</view>
												<view class="dz-price-box">
													<view class="dz-goods-price dz-font-price" :style="{ color: api.theme.dzBaseColor }">{{
														currentPrice(item)
													}}</view>
													<dz-number-box v-model="item.number" @change="numberChange(index, $event)"></dz-number-box>
												</view>
											</view>
										</view>
									</template>
								</dz-swipe-action>
							</view>
							<!-- 过期商品 -->
							<view v-if="parseInt(item.status) == 0">
								<dz-swipe-action :index="index" :actions="actionDeleteOptions" @click="actionDeleteClick">
									<template #content>
										<view class="dz-goods-item">
											<view class="dz-checkbox">
												<view class="dz-invalid-text">{{ language.cart.invalid }}</view>
											</view>
											<view class="dz-goods-img"
												><dz-image :src="item.product_img" borderRadius="12" width="200" height="200"></dz-image
											></view>
											<view class="dz-goods-info">
												<view class="dz-goods-title dz-gray">{{ item.product_name }}</view>
												<view class="dz-price-box dz-flex-center">
													<view class="dz-goods-invalid">{{ item.remark || language.cart.invalidProduct }}</view>
												</view>
											</view>
										</view>
									</template>
								</dz-swipe-action>
							</view>
						</view>
					</view>
				</dz-checkbox-group>
			</view>
		</view>
		<!-- 底部操作bar -->
		<view
			class="footer"
			v-if="userStore.hasLogin && cartList.length > 0"
			:style="{
				height: `calc(100rpx + ${parseInt(shopSetting.app_tabbar_midbutton) === 1 && tabbarList.length % 2 === 1 ? 48 : 0}rpx)`,
				paddingBottom: parseInt(shopSetting.app_tabbar_midbutton) === 1 && tabbarList.length % 2 === 1 ? '48rpx' : 0,
			}"
		>
			<dz-line></dz-line>
			<view class="content">
				<dz-checkbox-group v-model="isAllselected" @change="allSelectedChange">
					<dz-checkbox shape="circle" :active-color="theme.dzBaseColor" :name="1" :label="language.application.selectAll"> </dz-checkbox>
				</dz-checkbox-group>

				<view class="right" v-if="cartSetting">
					<view class="del-btn" :style="{ color: theme.dzBaseColor }" @tap="clearLose">{{ language.cart.invalidClear }}</view>
					<view class="del-btn" :style="{ color: theme.dzBaseColor }" @tap="clearCart">{{ language.application.deleteAll }}</view>
					<view class="del-btn" :style="{ color: theme.dzBaseColor }" @tap="deleteCartItem">{{ language.application.deleteSelected }}</view>
				</view>
				<view class="right" v-if="!cartSetting">
					<view class="sum dz-line-1">
						{{ language.cart.total }}
						<text class="money dz-font-price">{{ sumPrice }}</text>
					</view>
					<view
						class="btn"
						:style="{
							background: theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						@tap="createOrder"
					>
						{{ language.cart.buy }}({{ selectedList.length }})
					</view>
				</view>
			</view>
		</view>
		<!-- 规格弹窗 -->
		<dz-popup v-model:show="specShow" mode="bottom" border-radius="40" closeIcon="roundclose" closeIconSize="40" :closeable="true">
			<dz-attr-content :product="productDetail" :buyNumber="currentNumber" buttonName="确定" @confirm="attrConfirmClick"></dz-attr-content>
		</dz-popup>
		<!-- 删除提醒 -->
		<dz-modal
			v-model:show="modalShow"
			:mask-close-able="false"
			:content="modalContent"
			:confirm-value="modalValue"
			:show-cancel-button="!modalLoading"
			:confirm-color="theme.dzBaseColor"
			:async-close="true"
			@cancel="modalCancel"
			@confirm="modalConfirm"
		></dz-modal>
		<view v-if="!userStore.hasLogin || (userStore.hasLogin && cartList.length == 0)" class="dz-m-20">
			<dz-title v-if="guessYouLikeList.length" title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
			<dz-product-list :list="guessYouLikeList"></dz-product-list>
			<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360" text="暂无推荐商品"></dz-empty>
			<view v-if="loadingStatus == 'loading'">
				<dz-loadmore :status="loadingStatus" margin-top="20" margin-bottom="160"></dz-loadmore>
			</view>
		</view>
		<dz-tabbar
			v-if="tabbarList.props && tabbarList.props.dataSource != 'default'"
			value="/pages/main/cart/cart"
			:list="tabbarList.props.list.slice(0, tabbarList.props.num)"
			:bgColor="tabbarList.props.bgColor"
			:inactiveColor="tabbarList.props.inactiveColor"
			:activeColor="tabbarList.props.activeColor || theme.dzBaseColor"
		>
		</dz-tabbar>
		<dz-tabbar v-else value="/pages/main/cart/cart" :list="defaultTabbarList" :activeColor="theme.dzBaseColor"></dz-tabbar>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, toRefs, unref } from 'vue';
import { onLoad, onShow, onUnload, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import tabbarConfig from '@/core/config/tabbarConfig';

const barTitle = ref<string>();
const checkboxGroup = ref(null);
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const emptyCart = uni.$api.assetsConfig.emptyCart;
const empty = uni.$api.assetsConfig.empty;
const loading = ref<boolean>(false);
// #ifdef MP
const slotRight = ref<boolean>(false);
// #endif
// #ifndef MP
const slotRight = ref<boolean>(true);
// #endif
const cartSetting = ref<boolean>(false);
const cartList = ref<array>([]);
const selectedList = ref<array>([]);
const isAllselected = ref<array>([]);
const specShow = ref<boolean>(false);
const modalShow = ref<boolean>(false);
const modalContent = ref<string>(uni.$api.language.cart.clearCartConfirm);
const modalValue = ref<string>();
const modalLoading = ref<boolean>(false);
const currentSkuId = ref<string>();
const currentNumber = ref<number>(1);
const sumPrice = ref<string>('0.00');
const singleSkuText = uni.$api.language.cart.defaultSkuName;
const delActionIndex = ref<number>(0);
const loadingStatus = ref<string>('loading');
const page = ref<number>(1);
const guessYouLikeList = ref<array>([]);
const defaultTabbarList = tabbarConfig.tabbarList;
const data = reactive({
	productDetail: {},
});

const userStore = useUserStore();

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});
const tabbarList = computed(() => {
	return userStore.getTabbarList;
});

const actionOptions = [
	{
		name: uni.$api.language.application.collection,
		color: '#fff',
		fontsize: 30, //单位rpx
		width: 80, //单位px
		background: theme.value.dzTypeWarning,
	},
	{
		name: uni.$api.language.application.delete,
		color: '#fff',
		fontsize: 30, //单位rpx
		width: 80, //单位px
		background: theme.value.dzTypeError,
	},
];

const actionDeleteOptions = [
	{
		name: uni.$api.language.application.delete,
		color: '#fff',
		fontsize: 30, //单位rpx
		width: 80, //单位px
		background: theme.value.dzTypeError,
	},
];

onLoad(async () => {
	await uni.$onLaunched;
	const pages = getCurrentPages();
	if (pages[pages.length - 1].route != 'pages/main/cart/cart') return;
	barTitle.value = uni.$api.language.cart.titleCart;
	if (tabbarList.value.props && tabbarList.value.props.dataSource != 'default') {
		const list = tabbarList.value.props.list;
		const route = list.filter((item) => item.pagePath == `/${pages[pages.length - 1].route}`);

		barTitle.value = route[0].text;
	}
	uni.setNavigationBarTitle({ title: barTitle.value });

	uni.$on('cartNumChange', async () => {
		await initData();
		if (cartList.value.length == 0) {
			await getGuessYouLikeList();
		}
	});
	userStore.setCartPageListen(true);
});

onShow(async () => {
	await initData();
	if ((!userStore.hasLogin || cartList.value.length == 0) && !guessYouLikeList.value.length) {
		page.value = 1;
		guessYouLikeList.value = [];
		getGuessYouLikeList();
	}
});

onUnload(() => {
	uni.$off(['cartNumChange', 'themeChange']);
	userStore.setCartPageListen(false);
});

onPullDownRefresh(() => {
	initData();
	if (!userStore.hasLogin || (userStore.hasLogin && cartList.value.length == 0)) {
		page.value = 1;
		guessYouLikeList.value = [];
		getGuessYouLikeList();
	}
});

onReachBottom(() => {
	if (userStore.hasLogin && cartList.value > 0) return;
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getGuessYouLikeList();
});

function cartSettingClick() {
	if (!userStore.hasLogin) {
		loginClick();
		return;
	}
	cartSetting.value = !cartSetting.value;
}

async function initData() {
	if (userStore.hasLogin) {
		await getMemberIndex();
		await getCartItemList();
	} else {
		cartList.value = [];
		userStore.setCartNum(0);
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 500);
	}
}

async function getMemberIndex() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}
//获取购物车
async function getCartItemList() {
	if (unref(checkboxGroup)) {
		unref(checkboxGroup).children.forEach((item) => {
			item.isChecked = false;
		});
	}
	if (loading.value) return;
	loading.value = true;
	cartSetting.value = false;
	selectedList.value = [];
	isAllselected.value = [];
	sumPrice.value = '0.00';
	await uni.$api.http
		.get(uni.$api.apiMember.cartItemIndex)
		.then((res) => {
			loading.value = false;
			let cartNum = 0;
			// 云仓分销进货价格
			let level_id =
				(userInfo.value &&
					userInfo.value.promoter &&
					userInfo.value.promoter.promoterWarehouse &&
					userInfo.value.promoter.promoterWarehouse.state == 1 &&
					userInfo.value.promoter.promoterWarehouse.level_id) ||
				'';
			res.data.forEach((item) => {
				item.number = parseInt(item.number);
				if (parseInt(item.status) == 1) {
					cartNum += 1;
				}
				if (item.warehouseCommissionRate && item.warehouseCommissionRate.is_distribution == 1 && level_id) {
					let commission_rate = item.warehouseCommissionRate.commission_rate;
					for (let key in commission_rate) {
						if (item.sku_id == key) {
							item.price = item.sku.price =
								commission_rate[item.sku_id][level_id] && commission_rate[item.sku_id][level_id].brokerage > 0
									? commission_rate[item.sku_id][level_id].brokerage
									: item.sku.price;
						}
					}
				}
				if (item.memberDiscount && parseFloat(item.memberDiscount.discount) > 0) {
					//会员折扣
					item.price = parseFloat(parseFloat(item.price) * (1 - parseFloat(item.memberDiscount.discount) / 100)).toFixed(2);
				}
			});
			let list = res.data;
			for (let i = 0; i < list.length; i++) {
				list[i].selected = 0;
			}
			cartList.value = list;
			userStore.setCartNum(cartNum);
		})
		.catch((err) => {
			console.log(err);
			loading.value = false;
			cartList.value = [];
			uni.stopPullDownRefresh();
		});
	uni.stopPullDownRefresh();
}

// 计算价格
function currentPrice(item) {
	let price = item.sku && item.sku.price;
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
		for (let key in commission_rate) {
			if (item.sku_id == key) {
				price =
					commission_rate[item.sku_id][level_id] && commission_rate[item.sku_id][level_id].brokerage > 0
						? commission_rate[item.sku_id][level_id].brokerage
						: item.sku.price;
			}
		}
	}
	if (item.memberDiscount && parseFloat(item.memberDiscount.discount) > 0) {
		//会员折扣
		price = parseFloat(parseFloat(price) * (1 - parseFloat(item.memberDiscount.discount) / 100)).toFixed(2);
	}
	return parseFloat(price).toFixed(2);
}

//登录点击
function loginClick() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
	});
}

//空购物车点击
function emptyClick() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.index,
	});
}

//跳转到商品
function productTap(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id,
		},
	});
}

//删除已勾选商品
function deleteCartItem() {
	modalContent.value = uni.$api.language.cart.deleteCartConfirm;
	modalValue.value = 1;
	modalShow.value = true;
}

//清除购物车
function clearCart() {
	modalContent.value = uni.$api.language.cart.clearCartConfirm;
	modalValue.value = 3;
	modalShow.value = true;
}

//清除无效商品
function clearLose() {
	modalContent.value = uni.$api.language.cart.clearinvalidConfirm;
	modalValue.value = 2;
	modalShow.value = true;
}

//创建订单
function createOrder() {
	if (selectedList.value.length == 0) {
		return;
	}
	const data = {};
	const ids = [];
	let len = cartList.value.length;
	for (let i = 0; i < len; i++) {
		if (cartList.value[i].selected == 1) {
			ids.push(parseInt(cartList.value[i].id));
		}
	}
	data.type = 'cart';
	data.data = ids.join(',');
	cartSetting.value = false;
	selectedList.value.length = 0;
	isAllselected.value = [];
	for (let i = 0; i < cartList.value.length; i++) {
		if (parseInt(cartList.value[i].status) != 0) {
			cartList.value[i].selected = 0;
		}
	}
	sumPrice.value = '0.00';
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(data)),
		},
	});
}

async function actionClick(index, action) {
	if (action == 0) {
		//收藏
		// todo
		await uni.$api.http
			.post(uni.$api.apiShop.collectCreate, {
				topic_id: cartList.value[index].product_id,
				topic_type: 'product',
			})
			.then(() => {
				uni.$api.toast(uni.$api.language.product.collectSuccess);
			});
	} else {
		//删除
		delActionIndex.value = index;
		modalContent.value = uni.$api.language.cart.deleteCurrentCartConfirm;
		modalValue.value = 4;
		modalShow.value = true;
	}
}

async function actionDeleteClick(index, action) {
	//删除过期商品
	delActionIndex.value = index;
	modalContent.value = uni.$api.language.cart.deleteCurrentCartConfirm;
	modalValue.value = 4;
	modalShow.value = true;
}

//选择变动
function checkboxChange(index: number, value: boolean) {
	if (parseInt(cartList.value[index].status) === 0) {
		return;
	}
	unref(checkboxGroup).children[index].isChecked = value;
	cartList.value[index].selected = value ? 1 : 0;
	let i = selectedList.value.indexOf(cartList.value[index].id);
	if (value) {
		if (i === -1) {
			selectedList.value.push(cartList.value[index].id);
		}
	} else {
		if (i > -1) {
			selectedList.value.splice(i, 1);
		}
	}
	let enabledlength = 0;
	for (let i = 0; i < cartList.value.length; i++) {
		if (parseInt(cartList.value[i].status) !== 0) {
			enabledlength++;
		}
	}
	isAllselected.value = selectedList.value.length === enabledlength ? [1] : [];
	sum();
}

//全选
function allSelectedChange(e) {
	const isChecked = e.length ? true : false;
	let len = cartList.value.length;
	let arr = [];
	selectedList.value = [];
	for (let i = 0; i < len; i++) {
		if (parseInt(cartList.value[i].status) != 0) {
			cartList.value[i].selected = isChecked ? 1 : 0;
			unref(checkboxGroup).children[i].isChecked = isChecked;
			arr.push(cartList.value[i].id);
		}
	}
	selectedList.value = isChecked ? arr : [];
	if (arr.length > 0) {
		sum();
	}
}

//更新商品数量
async function updateNumber(index, value) {
	cartList.value[index].number = value;
	await uni.$api.http
		.post(uni.$api.apiMember.cartItemUpdateNum, {
			sku_id: cartList.value[index].sku_id,
			num: cartList.value[index].number,
		})
		.then((res) => {
			sum();
		});
}

function numberBlur(e) {
	updateNumber(e.index, e.value);
}

function numberChange(index, e) {
	updateNumber(index, e.value);
}

function numberMinus(e) {
	updateNumber(e.index, e.value);
}

function numberPlus(e) {
	updateNumber(e.index, e.value);
}

//计算商品总价
function sum() {
	sumPrice.value = 0;
	let len = cartList.value.length;
	const arr = [];
	for (let i = 0; i < len; i++) {
		if (cartList.value[i].selected == 1) {
			arr.push(cartList.value[i]);
			sumPrice.value = arrSort(arr);
		}
	}
	if (isNaN(sumPrice.value)) {
		sumPrice.value = 0.0;
	} else {
		sumPrice.value = parseFloat(sumPrice.value).toFixed(2);
	}
}

// 计算相同商品不同规格价格
function arrSort(arr) {
	const map = {},
		dest = [];
	for (let i = 0; i < arr.length; i++) {
		const ai = arr[i];
		if (!map[ai.product.id]) {
			dest.push({
				id: ai.product.id,
				num: 0,
				price: 0,
				data: [ai],
			});
			map[ai.product.id] = ai;
		} else {
			for (let j = 0; j < dest.length; j++) {
				const dj = dest[j];
				if (dj.data[0].product.id === ai.product.id) {
					dj.data.push(ai);
					break;
				}
			}
		}
	}
	const discountArr = [];
	dest.forEach((item) => {
		item.data.forEach((item2) => {
			item.num += parseInt(item2.number);
			item.price += parseInt(item2.number) * item2.price;
		});
		const ladderPreferential = item.data[0].ladderProduct;
		for (let i = 0; i < ladderPreferential.length; i++) {
			if (item.num >= parseInt(ladderPreferential[i].quantity)) {
				ladderPreferential[i].num = item.num;
				ladderPreferential[i].itemPrice = item.data[0].price;
				ladderPreferential[i].totalPrice = item.price;
				discountArr.push(ladderPreferential[i]);
				break;
			}
		}
	});
	let amount = 0;
	let discount = 0;
	discountArr.forEach((item2) => {
		if (parseInt(item2.type) == 1) {
			discount += item2.price * item2.num;
		} else {
			discount += item2.totalPrice - floor((item2.itemPrice * item2.price) / 100) * item2.num;
		}
	});
	dest.forEach((item) => {
		amount += item.price;
	});
	return amount - discount;
}

//打开属性选择
function toggleSpec(row) {
	if (parseInt(row.status) === 0) {
		uni.$api.toast(uni.$api.language.cart.notSale);
		return;
	}
	if (!userStore.hasLogin) {
		loginClick();
		return;
	}
	getProductDetail(row);
}

//属性选择确认
function attrConfirmClick(e) {
	handleCartItemUpdateSku(currentSkuId.value, e.skuId, e.skuNumber);
}

//获取商品详情
async function getProductDetail(row) {
	currentSkuId.value = row.sku_id;
	currentNumber.value = row.number;
	await uni.$api.http
		.get(uni.$api.apiShop.productView, {
			params: {
				id: row.product_id,
			},
		})
		.then((res) => {
			const _data = res.data;
			_data.sku_data = row.sku.data;
			data.productDetail = _data;
			specShow.value = true;
		});
}

//更新产品属性
async function handleCartItemUpdateSku(skuId, newSkuId, newSkuNum) {
	await uni.$api.http
		.post(uni.$api.apiMember.cartItemUpdateSku, {
			sku_id: skuId,
			new_sku_id: newSkuId,
			new_sku_num: newSkuNum,
		})
		.then((res) => {
			let skuId = currentSkuId.value;
			// 云仓分销进货价格
			let level_id =
				(userInfo.value &&
					userInfo.value.promoter &&
					userInfo.value.promoter.promoterWarehouse &&
					userInfo.value.promoter.promoterWarehouse.state == 1 &&
					userInfo.value.promoter.promoterWarehouse.level_id) ||
				'';
			specShow.value = false;
			//属性刷新
			cartList.value.some((item, index) => {
				if (parseInt(item.sku_id) === parseInt(skuId)) {
					let data = { ...item, ...res.data };
					if (data.warehouseCommissionRate && data.warehouseCommissionRate.is_distribution == 1 && level_id) {
						let commission_rate = data.warehouseCommissionRate.commission_rate;
						for (let key in commission_rate) {
							if (data.sku_id == key) {
								data.sku.price = data.price =
									commission_rate[data.sku_id][level_id] && commission_rate[data.sku_id][level_id].brokerage > 0
										? commission_rate[data.sku_id][level_id].brokerage
										: data.sku.price;
							}
						}
					}
					cartList.value[index] = data;
					return true;
				}
			});
		});
}

//关闭删除确认款
function modalCancel() {
	if (!modalLoading.value) {
		modalShow.value = false;
	}
}

//删除确认框
async function modalConfirm(e: number) {
	modalLoading.value = true;
	if (e == 1) {
		//删除选择商品
		const skuIds = [];
		for (let i = 0; i < cartList.value.length; i++) {
			if (cartList.value[i].selected == 1) {
				skuIds.push(parseInt(cartList.value[i].sku_id));
			}
		}
		if (skuIds.length == 0) {
			modalShow.value = false;
			uni.$api.toast(uni.$api.language.cart.cartEmptyTip);
			return;
		}
		try {
			await uni.$api.http.post(uni.$api.apiMember.cartItemDeleteIds, {
				sku_ids: skuIds,
			});
			uni.$emit('cartNumChange', {});
			modalShow.value = false;
		} catch (e) {
			console.log(e);
			modalShow.value = false;
		}
	} else if (e == 2) {
		//清空失效商品
		try {
			await uni.$api.http.post(uni.$api.apiMember.cartItemClear, {
				lose_status: 1,
			});
			uni.$emit('cartNumChange', {});
			modalShow.value = false;
		} catch (e) {
			console.log(e);
			modalShow.value = false;
		}
	} else if (e == 3) {
		//清空购物车
		try {
			await uni.$api.http.post(uni.$api.apiMember.cartItemClear);
			uni.$emit('cartNumChange', {});
			modalShow.value = false;
		} catch (e) {
			console.log(e);
			modalShow.value = false;
		}
	} else if (e == 4) {
		//删除左滑的商品
		if (!delActionIndex.value && delActionIndex.value != 0) {
			return;
		}
		try {
			await uni.$api.http.post(uni.$api.apiMember.cartItemDeleteIds, {
				sku_ids: [cartList.value[delActionIndex.value].sku_id],
			});
			uni.$emit('cartNumChange', {});
			modalShow.value = false;
		} catch (e) {
			console.log(e);
			modalShow.value = false;
		}
	}
	modalLoading.value = false;
}

// 猜我喜欢
async function getGuessYouLikeList() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			guessYouLikeList.value = [...guessYouLikeList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

const { productDetail } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.navbar-right {
	margin-right: 24rpx;
	display: flex;
}

.dz-edit-goods {
	width: 100%;
	border-radius: 12rpx;
	overflow: hidden;
	padding: 24rpx 30rpx 0 30rpx;
	box-sizing: border-box;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: $dz-main-color;
	font-size: 24rpx;
}

.dz-goods-num {
	margin: 0 10rpx;
	font-weight: bold;
}

.dz-cart {
	margin: 20rpx 20rpx 100rpx;
}

.dz-cart-cell {
	width: 100%;
	border-radius: 20rpx;
	background: #ffffff;
	padding: 30rpx 0;
}

.dz-activity {
	font-size: 24rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx 20rpx 100rpx;
	box-sizing: border-box;
}

.dz-goods-item {
	display: flex;
	width: 100%;
	padding-right: 20rpx;
	box-sizing: border-box;
}

.dz-buy {
	display: flex;
	align-items: center;
}

.dz-bold {
	font-weight: bold;
}

.dz-checkbox {
	min-width: 80rpx;
	margin-left: 8rpx;
	display: flex;
	align-items: center;
}

.dz-goods-img {
	width: 200rpx;
	height: 200rpx !important;
	border-radius: 12rpx;
	flex-shrink: 0;
	display: block;
	background: $dz-bg-color;
}

.dz-pro-img {
	width: 100%;

	display: block;
}

.dz-goods-info {
	width: 100%;
	padding-left: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: space-between;
	box-sizing: border-box;
	overflow: hidden;
}

.dz-goods-title {
	white-space: normal;
	word-break: break-all;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	color: $dz-main-color;
}

.dz-goods-model {
	max-width: 100%;
	color: $dz-main-color;
	background: $dz-bg-color;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 16rpx;
	box-sizing: border-box;
}

.dz-model-text {
	max-width: 100%;
	transform: scale(0.9);
	transform-origin: 0 center;
	font-size: 24rpx;
	line-height: 32rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.dz-price-box {
	width: 100%;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
}

.dz-goods-price {
	font-size: 34rpx;
	font-weight: 500;
}

.dz-sub-info {
	max-width: 532rpx;
	font-size: 24rpx;
	line-height: 24rpx;
	padding: 20rpx 30rpx 10rpx 30rpx;
	box-sizing: border-box;
	color: $dz-main-color;
	transform: scale(0.8);
	transform-origin: 100% center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-left: auto;
}

.dz-invalid-text {
	width: 66rpx;
	margin-right: 4rpx;
	text-align: center;
	font-size: 24rpx;
	color: #fff;
	background: rgba(0, 0, 0, 0.3);
	transform: scale(0.8);
	transform-origin: center center;
	border-radius: 4rpx;
	flex-shrink: 0;
}

.dz-gray {
	color: $dz-light-color !important;
}

.dz-flex-center {
	align-items: center !important;
}

.dz-goods-invalid {
	color: $dz-content-color;
	font-size: 24rpx;
}

.footer {
	width: 100%;
	background-color: #fff;
	height: 100rpx;
	position: fixed;
	bottom: 50px;
	margin-bottom: env(safe-area-inset-bottom);
	z-index: 5;

	.content {
		width: 100%;
		height: 99rpx;
		padding: 0 2%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		.right {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			.sum {
				font-size: 32rpx;
				display: flex;
				justify-content: flex-end;
				align-items: center;

				.money {
					font-weight: 600;
				}
			}
			.btn {
				padding: 0 18rpx;
				margin-left: 20rpx;
				height: 50rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 30rpx;
			}
			.del-btn {
				border: solid 1rpx;
				padding: 10rpx 24rpx;
				margin-left: 20rpx;
				height: 50rpx;
				border-radius: 30rpx;
				font-size: 24rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}
		}
	}
}
</style>

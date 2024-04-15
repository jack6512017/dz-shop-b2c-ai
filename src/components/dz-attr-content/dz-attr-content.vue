<template>
	<view class="dz-arrr-content">
		<view class="dz-product-box dz-padding">
			<view class="dz-popup-img" @tap.stop="previewImgs(currentSkuPicture || product.picture, [currentSkuPicture || product.picture])">
				<dz-image :src="currentSkuPicture || product.picture" :width="200" :height="200" :borderRadius="20"></dz-image>
			</view>
			<view class="dz-popup-price">
				<view class="dz-popup-title dz-line-2 dz-font-weight">{{ product.name }}</view>
				<view class="dz-amount dz-font-weight" :style="{ color: theme.dzBaseColor }">
					<!--会员折扣标记-->
					<dz-icon
						v-if="product.memberDiscount && product.memberDiscount.discount && product.memberDiscount.discount > 0"
						class="dz-m-r-10"
						size="40"
						:color="theme.dzBaseColor"
						name="memberDiscount"
					></dz-icon>
					<text class="dz-font-28"> {{ language.application.moneySymbol }}</text
					>{{ currentPrice }}
				</view>
				<view v-if="selectArr.some((item) => item != '')" class="dz-number">
					{{ language.product.sku }}：
					<text class="selected-text dz-m-r-10" style="line-height: 32rpx" v-for="(item, index) in selectArr" :key="index">{{ item }}</text>
				</view>
				<view class="dz-number" v-if="currentSkuStock !== null && parseInt(product.is_stock_visible) == 1">
					<text class="selected-text">{{ language.product.store }}：{{ currentSkuStock }} {{ product.unit || language.application.unit }}</text>
				</view>
			</view>
		</view>
		<scroll-view scroll-y class="dz-popup-scroll">
			<view class="dz-scrollview-box">
				<block v-for="(item, index) in specList" :key="index">
					<view class="dz-font-weight dz-attr-title">{{ item.title }}</view>
					<view class="dz-attr-box">
						<block v-if="parseInt(item.show_type) === 3">
							<dz-row>
								<block v-for="(childItem, childIndex) in specChildList" :key="childIndex">
									<dz-col v-if="childItem.spec_id === item.id" :gutter="0" :span="4">
										<view
											class="dz-sku"
											:style="{
												color: subIndex[index] == childIndex ? theme.dzBaseColor : '',
												borderColor: subIndex[index] == childIndex ? theme.dzBaseColor : '#f7f7f7',
												fontWeight: subIndex[index] == childIndex ? 'bold' : 500,
											}"
											:class="[childItem.ishow ? '' : 'dz-pic-disabled', item.value.length > 3 ? 'dz-m-b-20' : '']"
											@tap="skuClick(childItem, index, childIndex, item.show_type)"
										>
											<dz-image :src="childItem.data || product.picture" :width="190" :height="190" :borderRadius="20"></dz-image>
											<view class="sku-name dz-line-1">{{ childItem.title }}</view>
											<view class="icon" @tap.stop="previewImgs(childItem.data || product.picture, [childItem.data || product.picture])">
												<dz-icon name="change" size="28" color="#fff"></dz-icon>
											</view>
										</view>
									</dz-col>
								</block>
							</dz-row>
						</block>
						<block v-else-if="parseInt(item.show_type) === 2">
							<!--颜色属性-->
							<block v-for="(childItem, childIndex) in specChildList" :key="childIndex">
								<view
									class="dz-attr-item"
									:style="{
										color: subIndex[index] == childIndex ? theme.dzBaseColor : '',
									}"
									:class="[childItem.ishow ? '' : 'dz-pic-disabled', subIndex[index] == childIndex ? 'dz-attr-active' : '']"
									v-if="childItem.spec_id === item.id"
									@tap="skuClick(childItem, index, childIndex, item.show_type)"
								>
									<view
										v-if="childItem.data"
										class="attr-color"
										:style="{
											backgroundColor: childItem.data,
										}"
									></view>
									{{ childItem.title }}
								</view>
							</block>
						</block>
						<block v-else>
							<!--文字属性-->
							<block v-for="(childItem, childIndex) in specChildList" :key="childIndex">
								<view
									v-if="childItem.spec_id === item.id"
									class="dz-attr-item"
									:style="{
										color: subIndex[index] == childIndex ? theme.dzBaseColor : '',
										borderColor: subIndex[index] == childIndex ? theme.dzBaseColor : '',
									}"
									:class="[childItem.ishow ? '' : 'dz-disabled', subIndex[index] == childIndex ? 'dz-attr-active' : '']"
									@tap="skuClick(childItem, index, childIndex, item.show_type)"
								>
									{{ childItem.title }}
								</view>
							</block>
						</block>
					</view>
				</block>
			</view>
		</scroll-view>
		<dz-line></dz-line>
		<view class="dz-number-box dz-font-weight dz-attr-title">
			<view class="dz-attr-title">{{ language.product.number }}</view>
			<dz-number-box
				:max="maxNum === 0 ? parseInt(currentSkuStock) : maxNum > parseInt(currentSkuStock) ? parseInt(currentSkuStock) : maxNum"
				:min="minNum"
				:disabled="parseInt(currentSkuStock) === 0"
				size="34"
				input-width="100"
				v-model="currentSkuNumber"
			></dz-number-box>
		</view>
		<view class="dz-operation-ios">
			<view class="dz-operation dz-operation-right dz-right-flex dz-popup-btn dz-p-20">
				<!--纯积分换购-->
				<view class="dz-flex-1" v-if="parseInt(product.point_exchange_type) === 3 || parseInt(product.point_exchange_type) === 4">
					<dz-button
						:custom-style="{
							background: parseInt(currentSkuStock) === 0 ? theme.dzSubDisabled : theme.dzSubColor,
							color: theme.dzBaseFontColor,
							width: '100%',
							borderRadius: parseInt(product.point_exchange_type) === 4 ? '40rpx' : '40rpx 0 0 40rpx',
						}"
						hover-class="none"
						:disabled="parseInt(currentSkuStock) === 0"
						:border="false"
						shape="rightAngle"
						@click="pointExchange"
					>
						<view class="dz-btn__box">
							<view>
								{{
									parseInt(currentSkuStock) === 0
										? language.product.outOfStock
										: api.formatString(language.product.exchangeByPoints, shopSetting.point_front_name)
								}}
							</view>
							<view class="dz-flex-end">
								<view class="dz-size-32">{{ product.point_exchange }}</view>
								<view class="dz-size-26 dz-m-l-5">{{ api.formatString(language.product.point, shopSetting.point_front_name) }}</view>
							</view>
						</view>
					</dz-button>
				</view>
				<!--积分加钱-->
				<view class="dz-flex-1" v-if="parseInt(product.point_exchange_type) === 2">
					<dz-button
						:custom-style="{
							background: parseInt(currentSkuStock) === 0 ? theme.dzBaseDisabled : theme.dzBaseColor,
							color: theme.dzBaseFontColor,
							width: '100%',
							borderRadius: '40rpx',
						}"
						hover-class="none"
						:disabled="parseInt(currentSkuStock) === 0"
						:border="false"
						shape="rightAngle"
						@click="pointExchange"
					>
						<view class="dz-btn__box">
							<view>{{ parseInt(currentSkuStock) === 0 ? language.product.outOfStock : language.product.directBuy }}</view>
							<view class="dz-flex-end">
								<view class="dz-size-26">
									{{ api.formatString(language.product.needPointTip, product.point_exchange, shopSetting.point_front_name) }}
								</view>
							</view>
						</view>
					</dz-button>
				</view>
				<view
					class="dz-flex-1"
					v-if="
						parseInt(product.point_exchange_type) === 0 ||
						parseInt(product.point_exchange_type) === 1 ||
						parseInt(product.point_exchange_type) === 3
					"
				>
					<dz-button
						:custom-style="{
							background: parseInt(currentSkuStock) === 0 || parseInt(product.is_virtual) === 1 ? theme.dzBaseDisabled : theme.dzBaseColor,
							color: theme.dzBaseFontColor,
							width: '100%',
						}"
						hover-class="none"
						:disabled="parseInt(currentSkuStock) === 0 || parseInt(product.is_virtual) === 1"
						:border="false"
						shape="circle"
						@click="confirmClick"
					>
						<!--有会员折扣-->
						<block v-if="product.memberDiscount && product.memberDiscount.length > 0 && product.memberDiscount.discount > 0">
							<view class="dz-btn__box">
								<view>{{ parseInt(currentSkuStock) === 0 ? language.product.outOfStock : buttonName }}</view>
								<view class="dz-flex-end">
									<view class="dz-size-26">{{ language.product.memberDiscount }} {{ language.application.moneySymbol }}</view>
									<view class="dz-size-32">{{ currentPrice }}</view>
								</view>
							</view>
						</block>
						<!--无会员折扣-->
						<block v-else>{{ parseInt(currentSkuStock) === 0 ? language.product.outOfStock : buttonName }}</block>
					</dz-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch } from 'vue';
import { useUserStore } from '@/state/modules/user';

const props = defineProps({
	product: {
		type: Object,
		default() {
			return {};
		},
	},
	mode: {
		type: String,
		default: 'default',
	},
	buyNumber: {
		type: Number,
		default() {
			return 1;
		},
	},
	buttonName: {
		type: String,
		default: '确定',
	},
	// 最小购买量
	currentMinMum: {
		type: Number,
		default: 0,
	},
});

const emit = defineEmits(['confirm', 'pointExchange']);
const userStore = useUserStore();
const language = uni.$api.language;
const minNum = ref<number>(1); //当前最小购买数量
const maxNum = ref<number>(0); //当前最大购买数量
const currentSkuStock = ref<number>(); //当前选中规格库存
const currentSkuId = ref<string>(); //当前选中规格ID
const currentSkuPrice = ref<string>(); //当前选中规格产品价格
const currentSkuName = ref<string>(); //当前选中规格名称
const currentSkuPicture = ref<string>(); //当前选中的规格图片
const currentSkuNumber = ref<number>(1); //当前选中规格的数量
const specList = ref<array>([]); //属性列表
const specChildList = ref<array>([]); //属性内容
const difference = ref<array>([]); //sku列表
const selectArr = ref<array>([]); //存放被选中的值
const subIndex = ref<array>([]); //是否选中 因为不确定是多规格还是但规格，所以这里定义数组来判断
const warehouseDistribution = ref<boolean>(false); // 是否是云仓分销

const data = reactive<object>({
	//存放要和选中的值进行匹配的数据
	shopItemInfo: {},
	//存放最后选中的商品
	selectShop: {},
});

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

//计算购买按钮是否不可用
const buyBtnDisabled = computed(() => {
	if (Object.keys(props.product).length === 0) {
		return true;
	}
	return parseInt(currentSkuStock.value || props.product.stock) === 0;
});

//计算当前规格购买价格
const currentPrice = computed(() => {
	if (Object.keys(props.product).length === 0) {
		return 0.0;
	}
	let price = currentSkuPrice.value || props.product.minSkuPrice;
	//直接购买模式
	if (props.product.memberDiscount && parseFloat(props.product.memberDiscount.discount) > 0) {
		//会员折扣
		return parseFloat(price * (1 - parseFloat(props.product.memberDiscount.discount) / 100)).toFixed(2);
	} else {
		return parseFloat(price).toFixed(2);
	}
});

watch(
	() => props.product,
	(val) => {
		if (Object.keys(val).length === 0) {
			return;
		}
		if (props.currentMinMum > 0) {
			minNum.value = props.currentMinMum;
		} else {
			minNum.value = currentSkuNumber.value = parseInt(val.min_buy) || 1;
		}
		maxNum.value = parseInt(val.max_buy);
		//初始化商品属性
		//这里要做deepclone，否则会触发多次watch
		specList.value = uni.$api.deepClone(val.base_attribute_format);
		specChildList.value = [];
		specList.value.forEach((item) => {
			specChildList.value = [...specChildList.value, ...item.value];
		});

		difference.value = val.sku;
		// 云仓进货价格
		warehouseDistribution.value = val.warehouseCommissionRate && val.warehouseCommissionRate.is_distribution == 1;
		const { userInfo } = userStore.getData;
		let level_id = (userInfo && userInfo.promoter && userInfo.promoter.promoterWarehouse && userInfo.promoter.promoterWarehouse.level_id) || '';
		if (warehouseDistribution.value && level_id) {
			const commissionRate = val.warehouseCommissionRate.commission_rate;
			difference.value.forEach((item) => {
				for (let key in commissionRate) {
					if (item.id == key && commissionRate[key][level_id] && commissionRate[key][level_id].brokerage > 0) {
						item.price = commissionRate[key][level_id].brokerage;
					}
				}
			});
			currentSkuPrice.value = get_min(difference.value).toFixed(2);
			let minWarehouse = get_min(difference.value).toFixed(2);
			let maxWarehouse = get_max(difference.value).toFixed(2);
			if (val.memberDiscount && parseFloat(val.memberDiscount.discount) > 0) {
				//会员折扣
				minWarehouse = parseFloat(parseFloat(minWarehouse) * (1 - parseFloat(val.memberDiscount.discount) / 100)).toFixed(2);
				maxWarehouse = parseFloat(parseFloat(maxWarehouse) * (1 - parseFloat(val.memberDiscount.discount) / 100)).toFixed(2);
			}
		}

		if (difference.value.length == 1) {
			currentSkuPicture.value = difference.value[0].picture;
			currentSkuPrice.value = difference.value[0].price;
			currentSkuId.value = difference.value[0].id;
			currentSkuName.value = difference.value[0].name;
			currentSkuStock.value = parseInt(difference.value[0].stock);
		}
		difference.value.forEach((item) => {
			item.difference = [];
			item.difference = specIdsFormat(item.data, specChildList.value);
		});
		init();
		if (val.sku_data) {
			selectSku(specIdsFormat(val.sku_data, specChildList.value));
		}
		currentSkuNumber.value = props.buyNumber;
	},
	{
		immediate: true,
	}
);

watch(
	() => props.buyNumber,
	(val) => {
		currentSkuNumber.value = val || 1;
	},
	{
		immediate: true,
	}
);

// 初始化
function init() {
	// 清空之前的数据
	selectArr.value = [];
	subIndex.value = [];
	data.selectShop = {};
	data.shopItemInfo = {};
	specList.value.map(() => {
		selectArr.value.push('');
		subIndex.value.push(-1);
	});
	checkItem(); //计算sku里面规格形成路径
	checkInpath(-1); //传-1是为了不跳过循环
}

function get_min(list: array): string {
	return Math.min.apply(
		Math,
		list.map((item) => {
			return parseFloat(item.price);
		})
	);
}

function get_max(list: array): string {
	return Math.max.apply(
		Math,
		list.map((item) => {
			return parseFloat(item.price);
		})
	);
}

/* 主动方法 - 设置sku */
function selectSku(arr = []) {
	let skuArr = arr;
	let specListArr = specList.value;

	if (skuArr && specListArr.length === skuArr.length) {
		// 先清空
		let skuClickArr = [];
		let clickKey = true;

		for (let index = 0; index < skuArr.length; index++) {
			let skuName = skuArr[index];
			let specList = specChildList.value;
			let index1 = index;
			let index2 = getListIndex(specList, 'title', skuName);
			if (index2 == -1) {
				clickKey = false;
				break;
			}
			skuClickArr.push({
				spec: specList[index2],
				index1: index1,
				index2: index2,
			});
		}
		if (clickKey) {
			init();
			skuClickArr.map((item) => {
				skuClick(item.spec, item.index1, item.index2);
			});
		}
	}
}

function getListIndex(list: array, key: string, value: string): number {
	let index = -1;
	for (let i = 0; i < list.length; i++) {
		if (list[i][key] === value) {
			index = i;
			break;
		}
	}
	return index;
}

function specIdsFormat(sku: array, list: array): array {
	let arr = [];
	let sotr = [];
	let skuIds = sku.split('-');
	sotr = list.filter((item) => skuIds.indexOf(item.id + '') > -1);
	if (sotr.length > 0) {
		sotr.forEach((item) => {
			arr.push(item.title);
		});
	}
	return arr;
}

function skuClick(value, index1, index2) {
	data.selectShop = {};
	currentSkuId.value = '';
	currentSkuName.value = '';
	if (value.ishow) {
		if (selectArr.value[index1] != value.title) {
			selectArr.value[index1] = value.title;
			subIndex.value[index1] = index2;
		} else {
			selectArr.value[index1] = '';
			subIndex.value[index1] = -1;
		}
		checkInpath(index1);
		//如果全部选完
		if (selectArr.value.every((item) => item != '')) {
			data.selectShop = data.shopItemInfo[selectArr.value];
			currentSkuPicture.value = data.selectShop.picture;
			currentSkuStock.value = parseInt(data.selectShop.stock);
			currentSkuPrice.value = props.product.commission_price ? props.product.commission_price : data.selectShop.price;
			currentSkuId.value = data.selectShop.id;
			currentSkuName.value = data.selectShop.name;
		} else {
			currentSkuPrice.value = warehouseDistribution.value ? get_min(difference.value) : props.product.commission_price;
			currentSkuStock.value = props.product.stock;
		}
	}
}

function checkInpath(clickIndex: string) {
	//循环所有属性判断哪些属性可选
	//当前选中的兄弟节点和已选中属性不需要循环
	for (let i = 0, len = specList.value.length; i < len; i++) {
		if (i == clickIndex) {
			continue;
		}
		let len2 = specList.value[i].value.length;
		for (let j = 0; j < len2; j++) {
			if (subIndex.value[i] != -1 && j == subIndex.value[i]) {
				continue;
			}
			let choosed_copy = [...selectArr.value];
			choosed_copy[i] = specList.value[i].value[j].title;
			let choosed_copy2 = choosed_copy.filter((item) => item !== '' && typeof item !== 'undefined');
			if (data.shopItemInfo.hasOwnProperty(choosed_copy2)) {
				specList.value[i].value[j].ishow = true;
			} else {
				specList.value[i].value[j].ishow = false;
			}
		}
	}
}

function checkItem() {
	//计算有多小种可选路径
	let result = difference.value.reduce(
		(arrs, items) => {
			return arrs.concat(
				items.difference.reduce(
					(arr, item) => {
						return arr.concat(
							arr.map((item2) => {
								//利用对象属性的唯一性实现二维数组去重
								if (!data.shopItemInfo.hasOwnProperty([...item2, item])) {
									data.shopItemInfo[[...item2, item]] = items;
								}
								return [...item2, item];
							})
						);
					},
					[[]]
				)
			);
		},
		[[]]
	);
}

function previewImgs(img: string, imgList: array) {
	// 预览图片
	uni.previewImage({
		current: img,
		urls: imgList,
	});
}

function confirmClick() {
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.shopAttrContent.specificationsTip);
		return;
	}
	if (currentSkuStock.value < 1) {
		uni.$api.toast(uni.$api.language.shopAttrContent.outOfStock);
		return;
	}
	emit('confirm', {
		skuStock: currentSkuStock.value,
		skuId: currentSkuId.value,
		skuNumber: currentSkuNumber.value,
		skuName: currentSkuName.value || uni.$api.language.application.defaultSkuName,
		skuPrice: currentSkuPrice.value,
	});
}

//积分换购
function pointExchange() {
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	let params = {};
	params.type = 'point_exchange';
	params.point_exchange_type = props.product.point_exchange_type;
	params.data = JSON.stringify({
		sku_id: currentSkuId.value,
		num: currentSkuNumber.value,
	});
	emit('pointExchange', params);
}
</script>

<style scoped lang="scss">
.dz-arrr-content {
	position: relative;
	padding: 30rpx 30rpx 140rpx 30rpx;
}

.dz-popup-btn {
	width: 100%;
	position: absolute;
	left: 0;
	bottom: 0;
}

.dz-product-box {
	display: flex;
	align-items: flex-start;
	font-size: 24rpx;
	padding-bottom: 30rpx;
}

.dz-popup-img {
	flex-shrink: 0;
	height: 200rpx;
	width: 200rpx;
	border-radius: 20rpx;
	display: block;
	background-color: $dz-bg-color;
}

.dz-popup-price {
	padding-left: 20rpx;
	padding-bottom: 8rpx;
}

.dz-popup-title {
	line-height: 1.4;
	font-size: 28rpx;
	width: 430rpx;
	color: $dz-main-color;
}

.dz-amount {
	font-size: 36rpx;
}

.dz-number {
	font-size: 24rpx;
	line-height: 24rpx;
	padding-top: 16rpx;
	color: $dz-tips-color;
}

.dz-popup-scroll {
	max-height: calc(60vh - 220rpx);
	font-size: 26rpx;
}

.dz-scrollview-box {
	padding-bottom: 30rpx;
	box-sizing: border-box;
}

.dz-attr-title {
	padding: 10rpx 0;
	font-size: 28rpx;
	color: $dz-main-color;
}

.dz-attr-box {
	font-size: 0;
	padding: 20rpx 0;
}

.dz-attr-item {
	max-width: 100%;
	min-width: 64rpx;
	height: 64rpx;
	display: -webkit-inline-flex;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background-color: $dz-bg-color;
	padding: 0 26rpx;
	box-sizing: border-box;
	border-radius: 10rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;
	font-size: 26rpx;
	color: $dz-main-color;
}

.dz-attr-active {
	background: #fff !important;
	font-weight: bold;
	position: relative;
}

.dz-attr-active::after {
	content: '';
	position: absolute;
	border-width: 1rpx;
	border-style: solid;
	width: 100%;
	height: 100%;
	border-radius: 10rpx;
	left: 0;
	top: 0;
}

.dz-disabled {
	color: #d1d1d1 !important;
	background: #f8f8f8 !important;
}

.dz-sku {
	position: relative;
	width: 194rpx;
	background: #f7f7f7;
	border-radius: 20rpx;
	border: 1px solid #f7f7f7;
	.sku-name {
		text-align: center;
		margin: 15rpx 10rpx;
		font-size: 24rpx;
	}
	.icon {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 16rpx;
		right: 16rpx;
		width: 46rpx;
		height: 46rpx;
		border-radius: 23rpx;
		background: rgba(17, 17, 17, 0.7);
	}
}

.attr-color {
	width: 35rpx;
	height: 35rpx;
	margin-right: 10rpx;
	border-radius: 6rpx;
}

.dz-pic-disabled {
	position: relative;
}
.dz-pic-disabled::after {
	content: '';
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 10rpx;
	background: rgba(243, 244, 246, 0.6);
	left: 0;
	top: 0;
}

.dz-number-box {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0rpx 30rpx 0rpx;
	box-sizing: border-box;
	margin-bottom: env(safe-area-inset-bottom);
}

.dz-operation-ios {
	width: 100%;
	position: fixed;
	z-index: 10;
	bottom: 0;
	left: 0;
	background: rgba(255, 255, 255, 0.98);
}

.dz-operation {
	width: 100%;
	height: 140rpx;
	background: rgba(255, 255, 255, 0.98);
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: env(safe-area-inset-bottom);
}

.dz-operation::before {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	// border-top: 1rpx solid $dz-border-color;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
}

.dz-operation-right {
	height: 140rpx;
	padding-top: 0;
}

.dz-right-flex {
	display: flex;
	align-items: center;
	justify-content: center;
}

.dz-flex-1 {
	flex: 1;
}

.dz-btn__box {
	height: 98rpx;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-direction: column;
	line-height: 28rpx;
	padding: 18rpx 0 14rpx 0;
	box-sizing: border-box;
}

.dz-size-26 {
	font-size: 26rpx;
	line-height: 26rpx;
	padding-top: 4rpx;
}

.dz-size-32 {
	font-size: 32rpx;
	line-height: 28rpx;
	font-weight: 700;
}

.dz-size-36 {
	font-size: 36rpx;
	line-height: 34rpx;
	font-weight: 500;
}

.dz-flex-end {
	display: flex;
	align-items: flex-end;
}
</style>

<template>
	<view>
		<dz-navbar :title="language.combination.combinationTitle"></dz-navbar>
		<view class="content">
			<view class="banner" v-if="combinationDetail.combinationProduct.length > 0"
				><dz-image :src="combinationDetail.cover" width="100%" mode="widthFix"></dz-image
			></view>
			<view class="product-card" v-if="combinationDetail.combinationProduct.length > 0">
				<view class="title">{{ combinationDetail.name }}</view>
				<view class="item" v-for="(item, index) in combinationDetail.combinationProduct" :key="index" @tap.stop="productView(index)">
					<image :src="item.product.picture"></image>
					<view class="right">
						<view>
							<view class="name">{{ item.product.name }}</view>
							<view class="tip">{{ item.product.sku_name || language.application.defaultSkuName }} x 1</view>
						</view>
						<view class="price-box">
							<view class="price">
								<view class="price-content" :style="{ color: theme.dzBaseColor }">
									<text class="price-l">{{ language.application.moneySymbol }}</text>
									<text class="price-r">{{ item.product.sku_price || item.product.price }}</text>
								</view>
								<view class="text">
									{{ language.application.moneySymbol
									}}{{ item.product.sku_market_price || item.product.market_price || item.product.cost_price }}
								</view>
							</view>
							<view class="btn" v-if="item.product.sku.length > 1">
								<dz-button
									type="warning"
									size="medium"
									hover-class="none"
									:custom-style="{ width: '160rpx', height: '50rpx' }"
									@click="changeSku(index)"
								>
									{{ language.combination.changeSku }}
								</dz-button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!--底部操作栏-->
		<view class="dz-operation dz-p-20" style="min-height: 120rpx">
			<view class="dz-operation-left dz-col-7">
				{{ language.combination.originalPrice }}{{ language.application.moneySymbol }}{{ originalPrice }},
				{{ language.combination.price }}
				<text class="text-base" :style="{ color: theme.dzBaseColor }">{{ language.application.moneySymbol }}{{ combinationDetail.price }}</text>
			</view>
			<view class="dz-operation-right dz-right-flex dz-col-3">
				<view class="dz-flex-1">
					<dz-button
						:custom-style="{
							background: submiting ? theme.dzBaseDisabled : theme.dzBaseColor,
							color: theme.dzBaseFontColor,
							width: '100%',
						}"
						hover-class="none"
						:border="false"
						shape="circle"
						:loading="submiting"
						@click="buy"
					>
						<view class="dz-btn__box">
							<view>{{ language.combination.buy }}</view>
							<view class="dz-flex-end">
								<view class="dz-size-24">{{ language.combination.savePrice }}{{ language.application.moneySymbol }}{{ saveThePrice }}</view>
							</view>
						</view>
					</dz-button>
				</view>
			</view>
		</view>
		<!--底部弹出选择层-->
		<dz-popup v-model:show="popupShow" mode="bottom" border-radius="30" closeIcon="roundclose" closeIconSize="36" :closeable="true">
			<view class="dz-popup-box">
				<view class="dz-product-box dz-padding">
					<image class="dz-popup-img" mode="aspectFill" :src="currentSkuPicture || currentProduct.picture"></image>
					<view class="dz-popup-price">
						<view class="dz-popup-title dz-line-2">{{ currentProduct.name }}</view>
						<view class="dz-amount dz-bold" :style="{ color: theme.dzBaseColor }">
							{{ language.application.moneySymbol }}{{ currentSkuPrice || currentProduct.price }}
						</view>
						<view v-if="selectArr.some((item) => item != '')" class="dz-number">
							<dz-tag type="info" size="mini" :bgColor="theme.dzBgColor" :borderColor="theme.dzBgColor">
								{{ language.product.sku }}：
								<text class="selected-text dz-m-r-10" style="line-height: 32rpx" v-for="(item, index) in selectArr" :key="index">{{
									item
								}}</text>
							</dz-tag>
						</view>
						<view class="dz-number" v-if="currentSkuStock !== null">
							<text class="selected-text"
								>{{ language.product.store }}：{{ currentSkuStock }}{{ currentProduct.unit || language.application.unit }}</text
							>
						</view>
					</view>
				</view>
				<scroll-view scroll-y class="dz-popup-scroll">
					<view class="dz-scrollview-box">
						<block v-for="(item, index) in specList" :key="index">
							<view class="dz-bold dz-attr-title">{{ item.title }}</view>
							<view class="dz-attr-box">
								<block v-if="parseInt(item.show_type) === 3">
									<dz-row gutter="0">
										<block v-for="(childItem, childIndex) in specChildList" :key="childIndex">
											<dz-col v-if="childItem.spec_id === item.id" :span="4">
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
													<dz-image :src="childItem.data || product.picture" borderRadius="20" width="190" height="190"></dz-image>
													<view class="sku-name dz-line-1">{{ childItem.title }}</view>
													<view
														class="icon"
														@tap.stop="previewImgs(childItem.data || product.picture, [childItem.data || product.picture])"
													>
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
											v-if="childItem.spec_id === item.id"
											:style="{
												color: subIndex[index] == childIndex ? theme.dzBaseColor : '#333',
											}"
											:class="[childItem.ishow ? '' : 'dz-pic-disabled', subIndex[index] == childIndex ? 'dz-attr-active' : '']"
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
											class="dz-attr-item"
											v-if="childItem.spec_id === item.id"
											:style="{
												color: subIndex[index] == childIndex ? theme.dzBaseColor : '#333',
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
				<view class="dz-operation dz-operation-right dz-right-flex dz-popup-btn dz-p-20" style="height: 140rpx">
					<view class="dz-flex-1">
						<dz-button
							:custom-style="{
								background: parseInt(currentSkuStock) === 0 ? theme.dzBaseDisabled : theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '100%',
								height: '100%',
							}"
							hover-class="none"
							:disabled="parseInt(currentSkuStock) === 0"
							:border="false"
							shape="circle"
							@click="finish"
						>
							{{ language.combination.finish }}
						</dz-button>
					</view>
				</view>
			</view>
		</dz-popup>
		<!--底部弹出选择层-->
		<!--加载-->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;

const data = reactive({
	pageLoadingShow: true,
	pageLoadingStatus: 'loading',
	id: null,
	combinationDetail: {
		combinationProduct: [],
	},
	skuIds: [],
	currentIndex: '',
	currentSpecChildList: [],
	currentSpecList: [],
	currentSpecSelected: [],
	currentProduct: {},
	currentSkuId: '',
	currentSkuName: '',
	currentSkuPicture: '',
	currentSkuStock: '',
	currentSkuPrice: '',
	popupShow: false,
	submiting: false,
	currentSkuData: '',
	specList: [],
	difference: '', //sku列表
	shopItemInfo: {}, //存放要和选中的值进行匹配的数据
	selectArr: [], //存放被选中的值
	subIndex: [], //是否选中 因为不确定是多规格还是但规格，所以这里定义数组来判断
	selectshop: {}, //存放最后选中的商品
	specChildList: [],
});

const theme = computed(() => {
	return userStore.getTheme;
});

const originalPrice = computed(() => {
	let price = 0;
	data.combinationDetail.combinationProduct.map((item) => (price += parseFloat(item.product.price)));
	return (Math.round((price || 0) * 100) / 100).toFixed(2);
});

const saveThePrice = computed(() => {
	const price = originalPrice.value - data.combinationDetail.price;
	return (Math.round((price || 0) * 100) / 100).toFixed(2);
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.combination.combinationTitle,
	});
	data.id = options.id;
	getCombinationView();
});

function pageLoadingClick() {
	data.pageLoadingStatus = 'loading';
	getCombinationView();
}

function initAttrContent(row) {
	if (row.sku.length > 0) {
		row.sku_name = row.sku[0].name;
		row.sku_id = row.sku[0].id;
		row.sku_price = row.sku[0].price;
		row.data = row.sku[0].data;
		row.sku_market_price = row.sku[0].market_price;
	}
}

async function getCombinationView() {
	await uni.$api.http
		.get(uni.$api.apiShop.combinationView, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			if (res.data.length === 0) return;
			data.combinationDetail = res.data;
			data.combinationDetail.combinationProduct.forEach((item) => {
				initAttrContent(item.product);
				data.skuIds.push(item.product.sku[0].id);
			});
			uni.stopPullDownRefresh();
			data.pageLoadingShow = false;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
			uni.stopPullDownRefresh();
		});
}

function productView(index: number) {
	let id = data.combinationDetail.combinationProduct[index].product.id;
	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id: id,
		},
	});
}

function changeSku(index) {
	data.currentIndex = index;
	data.currentProduct = data.combinationDetail.combinationProduct[index].product;
	data.specList = uni.$api.deepClone(data.currentProduct.base_attribute_format);
	data.specChildList = [];
	data.specList.forEach((item) => {
		data.specChildList = [...data.specChildList, ...item.value];
	});

	data.difference = data.currentProduct.sku;
	if (data.difference.length == 1) {
		data.currentSkuPicture = data.difference[0].picture;
		data.currentSkuPrice = data.difference[0].price;
		data.currentSkuId = data.difference[0].id;
		data.currentSkuName = data.difference[0].name;
		data.currentSkuData = data.difference[0].data;
		data.currentSkuStock = parseInt(data.difference[0].stock);
	}
	data.difference.forEach((item) => {
		item.difference = [];
		item.difference = specIdsFormat(item.data, data.specChildList);
	});
	init();
	if (data.currentProduct.data) {
		selectSku(specIdsFormat(data.currentProduct.data, data.specChildList));
	}
	data.popupShow = true;
}

// 初始化
function init() {
	// 清空之前的数据
	data.selectArr = [];
	data.subIndex = [];
	data.selectShop = {};
	data.shopItemInfo = {};
	data.specList.map((item) => {
		data.selectArr.push('');
		data.subIndex.push(-1);
	});
	checkItem(); //计算sku里面规格形成路径
	checkInpath(-1); //传-1是为了不跳过循环
}

/* 主动方法 - 设置sku */
function selectSku(arr = []) {
	let skuArr = arr;
	let specListArr = data.specList;

	if (skuArr && specListArr.length === skuArr.length) {
		// 先清空
		let skuClickArr = [];
		let clickKey = true;

		for (let index = 0; index < skuArr.length; index++) {
			let skuName = skuArr[index];
			let specList = data.specChildList;

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

function getListIndex(list, key, value) {
	let index = -1;
	for (let i = 0; i < list.length; i++) {
		if (list[i][key] === value) {
			index = i;
			break;
		}
	}
	return index;
}

function specIdsFormat(sku, list) {
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

function skuClick(value, index1, index2, type) {
	let list = data.specChildList;
	// 图片
	if (type && parseInt(type) === 3) {
		data.currentPicture = list[index1].data;
	}
	data.selectshop = {};
	data.currentSkuId = '';
	data.currentSkuName = '';
	data.currentSkuData = '';
	if (value.ishow) {
		if (data.selectArr[index1] != value.title) {
			data.selectArr[index1] = value.title;
			data.subIndex[index1] = index2;
		} else {
			data.selectArr[index1] = '';
			data.subIndex[index1] = -1;
		}
		checkInpath(index1);
		//如果全部选完
		if (data.selectArr.every((item) => item != '')) {
			data.selectshop = data.shopItemInfo[data.selectArr];
			data.currentSkuPicture = data.selectshop.picture;
			data.currentSkuStock = parseInt(data.selectshop.stock);
			data.currentSkuPrice = data.selectshop.price;
			data.currentSkuId = data.selectshop.id;
			data.currentSkuName = data.selectshop.name;
			data.currentSkuData = data.selectshop.data;
		} else {
			data.currentSkuPrice = data.currentProduct.commission_price;
			data.currentSkuStock = data.currentProduct.stock;
		}
	}
}
function checkInpath(clickIndex) {
	//循环所有属性判断哪些属性可选
	//当前选中的兄弟节点和已选中属性不需要循环
	for (let i = 0, len = data.specList.length; i < len; i++) {
		if (i == clickIndex) {
			continue;
		}
		let len2 = data.specList[i].value.length;
		for (let j = 0; j < len2; j++) {
			if (data.subIndex[i] != -1 && j == data.subIndex[i]) {
				continue;
			}
			let choosed_copy = [...data.selectArr];
			choosed_copy[i] = data.specList[i].value[j].title;
			let choosed_copy2 = choosed_copy.filter((item) => item !== '' && typeof item !== 'undefined');
			if (data.shopItemInfo.hasOwnProperty(choosed_copy2)) {
				data.specList[i].value[j].ishow = true;
			} else {
				data.specList[i].value[j].ishow = false;
			}
		}
	}
}

function checkItem() {
	//计算有多小种可选路径
	let result = data.difference.reduce(
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

function previewImgs(img, imgList) {
	// 预览图片
	uni.previewImage({
		current: img,
		urls: imgList,
	});
}

function finish() {
	if (!data.currentSkuId) {
		uni.$api.toast(language.product.choiceProductAttribute);
		return;
	}
	data.currentProduct.sku_name = data.currentSkuName;
	data.currentProduct.sku_id = data.currentSkuId;
	data.currentProduct.sku_price = data.currentProduct.price = data.currentSkuPrice;
	data.currentProduct.data = data.currentSkuData;
	data.popupShow = false;
}

function buy() {
	data.submiting = true;
	let params = {};
	let skuIds = [];
	data.combinationDetail.combinationProduct.forEach((item) => {
		skuIds.push(item.product.sku_id);
	});
	params.data = skuIds.join(',');
	params.type = 'combination';
	params.combination_id = data.id;
	params.combination_num = 1;
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	data.submiting = false;
}

const {
	combinationDetail,
	submiting,
	currentProduct,
	currentSkuPicture,
	currentSkuPrice,
	selectArr,
	popupShow,
	specList,
	specChildList,
	subIndex,
	currentSkuStock,
	pageLoadingShow,
	pageLoadingStatus,
} = {
	...toRefs(data),
};
</script>

<style lang="scss" scoped>
.content {
	width: 100%;
	padding-bottom: 60rpx;
	.banner {
		image {
			width: 100%;
		}
	}

	.product-card {
		position: relative;
		top: -60rpx;
		margin: 0 20rpx;
		padding: 20rpx;
		border-radius: 20rpx;
		background-color: #fff;
		.title {
			margin-bottom: 30rpx;
			font-size: 36rpx;
			font-weight: 700;
			color: $dz-main-color;
		}
		.item {
			display: flex;
			margin-bottom: 40rpx;
			image {
				flex-shrink: 0;
				width: 180rpx;
				height: 180rpx;
				border-radius: 10rpx;
			}
			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				margin-left: 20rpx;
				.name {
					width: 451rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
					font-size: 28rpx;
					color: $dz-main-color;
				}
				.tip {
					width: 451rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					font-size: 24rpx;
					padding-top: 10rpx;
					color: $dz-tips-color;
				}
				.price-box {
					display: flex;
					justify-content: space-between;
					align-items: flex-end;
					.price {
						display: flex;
						align-items: flex-end;
						.price-content {
							.price-l {
								font-size: 24rpx;
							}
							.price-r {
								font-size: 32rpx;
								font-weight: bold;
							}
						}
						.text {
							color: $dz-tips-color;
							font-size: 24rpx;
							font-weight: 400;
							margin-left: 10rpx;
							text-decoration: line-through;
						}
					}
				}
			}
		}
		.item:last-child {
			margin-bottom: 20rpx;
		}
	}
}

/*底部操作栏*/

.dz-col-7 {
	width: 70%;
}

.dz-col-3 {
	width: 30%;
}

.dz-operation {
	width: 100%;
	height: 100rpx;
	background: rgba(255, 255, 255, 0.98);
	position: fixed;
	display: flex;
	align-items: center;
	justify-content: space-between;
	z-index: 10;
	bottom: 0;
	left: 0;
	margin-bottom: env(safe-area-inset-bottom);
}

.dz-safearea-bottom {
	width: 100%;
	height: env(safe-area-inset-bottom);
}

.dz-operation::before {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	// border-top: 1rpx solid #eaeef1;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
}

.dz-operation-left {
	display: flex;
	align-items: center;
}

.dz-operation-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	position: relative;
}

.dz-operation-text {
	font-size: 22rpx;
	color: $dz-main-color;
}

.dz-opacity {
	opacity: 0.5;
}

.dz-scale-small {
	transform: scale(0.9);
	transform-origin: center center;
}

.dz-operation-right {
	height: 100rpx;
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
	line-height: 26rpx;
	padding: 18rpx 0 14rpx 0;
	box-sizing: border-box;
}

.dz-size-24 {
	font-size: 24rpx;
	line-height: 24rpx;
	padding-top: 4rpx;
}

.dz-size-26 {
	font-size: 26rpx;
	line-height: 26rpx;
	padding-top: 4rpx;
}

.dz-size-32 {
	font-size: 32rpx;
	line-height: 28rpx;
	font-weight: 300;
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

.text-base {
	font-weight: 600;
}

/*底部操作栏*/

/*底部选择弹层*/

.dz-popup-class {
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	padding-bottom: env(safe-area-inset-bottom);
}

.dz-popup-box {
	position: relative;
	padding: 30rpx 20rpx 100rpx 20rpx;
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
	height: 200rpx;
	width: 200rpx;
	border-radius: 24rpx;
	display: block;
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
	padding: 0 30rpx 60rpx 30rpx;
	box-sizing: border-box;
}

.dz-attr-title {
	padding: 10rpx 0;
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
	background: #f7f7f7;
	padding: 0 26rpx;
	box-sizing: border-box;
	border-radius: 10rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;
	font-size: 26rpx;
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

.dz-attr-color-active {
	font-weight: bold;
	position: relative;
}

.dz-attr-color-active::after {
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

.dz-attr-image-item {
	width: 90rpx;
	height: 90rpx;
	display: -webkit-inline-flex;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: #f7f7f7;
	padding: 0 26rpx;
	box-sizing: border-box;
	border-radius: 10rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;

	.image {
		width: 90rpx;
		height: 90rpx;
	}
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
	padding: 20rpx 30rpx 30rpx 30rpx;
	box-sizing: border-box;
}
/*底部选择弹层*/
</style>

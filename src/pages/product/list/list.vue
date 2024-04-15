<template>
	<view>
		<!-- 搜索栏 -->
		<dz-navbar :is-fixed="true" :is-back="true" input-align="center">
			<view class="slot-wrap">
				<view class="search-wrap" @tap="searchTap">
					<dz-search placeholder="." :show-action="false" :disabled="true" inputAlign="right" placeholderColor="#f2f2f2"></dz-search>
					<view class="search-tip" :style="[searchStyle]">
						<text class="dz-m-r-10 dz-line-1">{{ searchDefault }}</text>
						<dz-icon name="close" color="#fff"></dz-icon>
					</view>
				</view>
			</view>
		</dz-navbar>
		<!-- 筛选 -->
		<view class="dz-header-screen" :style="[{ top: topHeight + 'px' }]">
			<view class="dz-screen-top">
				<view
					class="dz-top-item dz-icon-ml"
					:style="{ color: tabIndex == 0 ? theme.dzBaseColor : '' }"
					:class="[tabIndex == 0 ? 'dz-font-weight' : '']"
					data-index="0"
					@tap="dropdownTap"
				>
					<text class="dz-m-r-6">{{ selectedName }}</text>
					<text
						class="dzicon-iconfont"
						:class="selectHeight > 0 ? 'dzicon-fold' : 'dzicon-unfold'"
						:style="{ color: tabIndex == 0 ? theme.dzBaseColor : '#444' }"
					></text>
				</view>
				<view
					class="dz-top-item"
					:style="{ color: tabIndex == 1 ? theme.dzBaseColor : '' }"
					:class="[tabIndex == 1 ? 'dz-font-weight' : '']"
					@tap="dropdownTap"
					data-index="1"
				>
					{{ language.productList.sellNum }}
				</view>
				<view class="dz-top-item" @tap="dropdownTap" data-index="2">
					<text class="dzicon-iconfont dz-font-36" :class="isList > 0 ? 'dzicon-list' : 'dzicon-cascades'"></text>
				</view>
				<view class="dz-top-item dz-icon-ml" @tap="dropdownTap" data-index="3">
					<text>{{ language.productList.filter }}</text>
				</view>
				<view class="dz-dropdownlist" :class="[selectHeight > 0 ? 'dz-dropdownlist-show' : '']" :style="{ height: selectHeight + 'rpx' }">
					<view
						class="dz-dropdownlist-item dz-icon-middle"
						:class="[item.selected ? 'dz-font-weight' : '']"
						v-for="(item, index) in dropdownList"
						:key="index"
						@tap.stop="dropdownItemTap"
						:data-index="index"
					>
						<text class="dz-ml dz-middle">{{ item.name }}</text>
						<text class="dzicon-iconfont dzicon-check" :style="{ color: theme.dzBaseColor }" v-if="item.selected"></text>
					</view>
				</view>
				<view class="dz-dropdownlist-mask" :class="[selectHeight > 0 ? 'dz-mask-show' : '']" @tap.stop="hideDropdownList"></view>
			</view>
			<view class="dz-screen-bottom">
				<block v-for="(item, index) in attrArr" :key="index">
					<view
						class="dz-bottom-item dz-icon-ml"
						:style="{
							background: item.isActive ? theme.dzBaseColor : '',
							color: item.isActive ? theme.dzBaseFontColor : '',
						}"
						:class="[item.isActive ? 'dz-btmItem-active' : 'dz-btmItem-normal', attrIndex == index ? 'dz-btmItem-tap' : '']"
						:data-index="index"
						@tap="typeChange"
					>
						<view class="dz-bottom-text" :class="[attrIndex == index ? 'dz-active' : '']">{{ item.isActive ? item.selectedName : item.name }}</view>
						<text
							class="dzicon-iconfont"
							:class="attrIndex == index ? 'dzicon-fold' : 'dzicon-unfold'"
							:size="14"
							:style="{
								color: attrIndex == index || item.isActive ? theme.dzBaseColor : theme.dzContentColor,
							}"
							dz-icon-class="dz-ml"
							v-if="item.list.length > 0"
						></text>
					</view>
				</block>
			</view>
		</view>
		<!--产品内容-->
		<view class="dz-product dz-ios-p-safe-bottom">
			<dz-product-list :list="productList" :isList="isList" :marginLeftRight="!isList ? '20' : '0'"></dz-product-list>
			<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="0" margin-bottom="20"></dz-loadmore>
		</view>
		<!--筛选抽屉-->
		<dz-popup v-model:show="drawer" mode="right" :mask="false" :safe-area-inset-bottom="true" :z-index="popZindex">
			<view class="dz-drawer-box" :style="[{ paddingTop: topHeight + 'px' }]">
				<scroll-view scroll-y :style="{ height: drawerHeight + 'px' }">
					<view class="dz-drawer-title">
						<text class="dz-title-bold">{{ language.productList.priceRange }}</text>
						<view class="dz-attr-right" :style="{ color: theme.dzBaseColor }">
							<text>{{ language.productList.priceRangeTip }}</text>
						</view>
					</view>
					<view class="dz-drawer-content">
						<input
							placeholder-class="dz-phcolor"
							v-model="minPrice"
							class="dz-input"
							:placeholder="language.productList.lowestPrices"
							maxlength="11"
							type="number"
						/>
						<text>-</text>
						<input
							placeholder-class="dz-phcolor"
							v-model="maxPrice"
							class="dz-input"
							:placeholder="language.productList.highestPrice"
							maxlength="11"
							type="number"
						/>
					</view>
					<view class="dz-drawer-title">
						<text class="dz-title-bold">{{ language.productList.allCategories }}</text>
						<view class="dz-all-box dz-icon-ml">
							<view class="dz-attr-right" :style="{ color: theme.dzBaseColor }">{{ currentCateStr }}</view>
						</view>
					</view>
					<view class="dz-drawer-content dz-flex-attr">
						<view
							class="dz-attr-item"
							:style="{
								background: item.isActive ? theme.dzBaseColor : '',
								color: item.isActive ? theme.dzBaseFontColor : '',
							}"
							:class="[item.isActive ? '' : 'dz-btmItem-normal']"
							v-for="(item, index) in productCateList"
							:key="item.id"
							@tap.stop="cateBtnSelected(index)"
						>
							<view class="dz-attr-ellipsis">{{ item.title }}</view>
						</view>
					</view>
					<view class="dz-drawer-title">
						<text class="dz-title-bold">{{ language.productList.brand }}</text>
						<view class="dz-all-box dz-icon-ml">
							<view class="dz-attr-right" :style="{ color: theme.dzBaseColor }">{{ currentBrandStr }}</view>
						</view>
					</view>
					<view class="dz-drawer-content dz-flex-attr">
						<view
							class="dz-attr-item"
							:style="{
								background: item.isActive ? theme.dzBaseColor : '',
								color: item.isActive ? theme.dzBaseFontColor : '',
							}"
							:class="[item.isActive ? '' : 'dz-btmItem-normal']"
							v-for="(item, index) in brandList"
							:key="item.id"
							@tap.stop="brandBtnSelected(index)"
						>
							<view class="dz-attr-ellipsis">{{ item.title }}</view>
						</view>
					</view>
					<view class="dz-safearea-bottom"></view>
				</scroll-view>
				<view class="dz-attr-btnbox">
					<view class="dz-attr-safearea">
						<view
							class="dz-drawer-btn dz-drawerbtn-black"
							:style="{ color: theme.dzBaseColor }"
							hover-class="dz-white-hover"
							:hover-stay-time="150"
							@tap="resetTap"
						>
							{{ language.application.reset }}
						</view>
						<view
							class="dz-drawer-btn dz-drawerbtn-primary"
							:style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
							}"
							@tap="closeDrawer"
						>
							{{ language.application.confirm }}
						</view>
					</view>
				</view>
			</view>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import type { CSSProperties } from 'vue';

// 获取系统状态栏的高度
let systemInfo = uni.getSystemInfoSync();
let menuButtonInfo = {};
// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
menuButtonInfo = uni.getMenuButtonBoundingClientRect();
// #endif

const userStore = useUserStore();
const language = uni.$api.language;
const searchDefault = ref<string>(uni.$api.language.application.searchHold);
const loading = ref<boolean>(false);
const loadingStatus = ref<string>('loading');
const keyword = ref<string>('');
const tabIndex = ref<number>(0);
const selectedName = ref<string>(uni.$api.language.productList.multiple);
const empty = uni.$api.assetsConfig.empty;
const selectHeight = ref<number>(0);
const isList = ref<boolean>(false);
const attrIndex = ref<number>(-1);
const drawer = ref<boolean>(false);
const drawerHeight = ref<number>(0);
const page = ref<number>(1);
const productList = ref<array>([]);
const productCateList = ref<array>([]);
const brandList = ref<array>([]);
const cateId = ref<string>('');
const brandId = ref<string>('');
const loadCateId = ref<string>('');
const loadBrandId = ref<string>('');
const minPrice = ref<string>('');
const maxPrice = ref<string>('');
const priceSort = ref<string>('');
const salesSort = ref<string>('');
let typePrams = reactive<any>({});
const currentCateStr = ref<string>('');
const currentBrandStr = ref<string>('');
const topHeight = ref<number>(0);
const popZindex = ref<number>(979);
const dropdownList = ref<array>([
	{
		name: uni.$api.language.productList.multiple,
		selected: true,
		param: '',
	},
	{
		name: uni.$api.language.productList.priceAsc,
		selected: false,
		param: 'asc',
	},
	{
		name: uni.$api.language.productList.priceDesc,
		selected: false,
		param: 'desc',
	},
]);
const attrArr = ref<array>([
	{
		name: uni.$api.language.productList.all,
		selectedName: uni.$api.language.productList.all,
		isActive: true,
		params: {},
		list: [],
	},
	{
		name: uni.$api.language.productList.newProduct,
		selectedName: uni.$api.language.productList.newProduct,
		isActive: false,
		params: { is_new: 1 },
		list: [],
	},
	{
		name: uni.$api.language.productList.recommendProduct,
		selectedName: uni.$api.language.productList.recommendProduct,
		isActive: false,
		params: { is_recommend: 1 },
		list: [],
	},
	{
		name: uni.$api.language.productList.hotProduct,
		selectedName: uni.$api.language.productList.hotProduct,
		isActive: false,
		params: { is_hot: 1 },
		list: [],
	},
]);

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.language.productList.titleProductList,
	});
	if (options.keyword) {
		searchDefault.value = keyword.value = options.keyword;
	}
	if (options.cate_id) {
		loadCateId.value = cateId.value = options.cate_id;
	}
	if (options.brand_id) {
		loadBrandId.value = brandId.value = options.brand_id;
	}
	if (options.is_new || options.is_recommend || options.is_hot) {
		let params = {};
		attrArr.value[0].isActive = false;
		attrArr.value[1].isActive = options.is_new ? true : false;
		attrArr.value[2].isActive = options.is_recommend ? true : false;
		attrArr.value[3].isActive = options.is_hot ? true : false;
		if (options.is_new) {
			params.is_new = options.is_new;
		}
		if (options.is_recommend) {
			params.is_recommend = options.is_recommend;
		}
		if (options.is_hot) {
			params.is_hot = options.is_hot;
		}
		typePrams = params;
	}
	if (options.min_price && uni.$api.isAmount(options.min_price)) {
		minPrice.value = options.min_price;
	}
	if (options.max_price && uni.$api.isAmount(options.max_price)) {
		maxPrice.value = options.max_price;
	}
	if (options.price_sort && ['asc', 'desc'].includes(options.price_sort)) {
		priceSort.value = options.price_sort;
		if (options.price_sort == 'asc') {
			dropdownList.value[0].selected = false;
			dropdownList.value[1].selected = true;
			dropdownList.value[2].selected = false;
		} else {
			dropdownList.value[0].selected = false;
			dropdownList.value[1].selected = false;
			dropdownList.value[2].selected = true;
		}
	} else {
		dropdownList.value[0].selected = true;
		dropdownList.value[1].selected = false;
		dropdownList.value[2].selected = false;
	}
	if (options.sales_sort && ['asc', 'desc'].includes(options.sales_sort)) {
		salesSort.value = options.sales_sort;
		if (options.sales_sort == 'asc') {
			tabIndex.value = 1;
		}
	}
	// #ifndef MP
	if (uni.$api.systemInfo.osName == 'android') {
		topHeight.value = uni.$api.systemInfo.statusBarHeight + 44;
	} else {
		topHeight.value = uni.$api.systemInfo.statusBarHeight + 45;
	}
	// #endif

	// #ifdef MP-WEIXIN
	let custom = wx.getMenuButtonBoundingClientRect();
	topHeight.value = custom.bottom + custom.top - uni.$api.systemInfo.statusBarHeight + 4;
	// #endif

	// #ifdef MP-ALIPAY
	topHeight.value = uni.$api.systemInfo.statusBarHeight + uni.$api.systemInfo.titleBarHeight;
	// #endif

	drawerHeight.value = uni.$api.systemInfo.windowHeight - topHeight.value;

	// #ifndef MP-WEIXIN
	drawerHeight.value = drawerHeight.value - uni.upx2px(100);
	// #endif
	getProductList();
	if (userStore.hasLogin) {
		getMemberInfo();
	}
});
// 搜索语的样式
const searchStyle = computed((): CSSProperties => {
	let style = {};
	// // 如果是各家小程序，导航栏内部的宽度需要减少右边胶囊的宽度
	// #ifdef MP
	let rightButtonWidth = systemInfo.windowWidth - menuButtonInfo.left;
	style.maxWidth = 520 - rightButtonWidth * 2 + 'rpx';
	// #endif
	// #ifndef MP
	style.maxWidth = '520rpx';
	// #endif
	return style;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onPullDownRefresh(() => {
	page.value = 1;
	productList.value = [];
	getProductList();
	if (userStore.hasLogin) {
		getMemberInfo();
	}
});
onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getProductList();
});

function getBaseParams() {
	let params = {};
	if (keyword.value) {
		params.keyword = keyword.value;
	}
	if (cateId.value) {
		params.cate_id = cateId.value;
	}
	if (brandId.value) {
		params.brand_id = brandId.value;
	}
	if (minPrice.value) {
		params.min_price = minPrice.value;
	}
	if (maxPrice.value) {
		params.max_price = maxPrice.value;
	}
	if (priceSort.value) {
		params.price = priceSort.value;
	}
	if (salesSort.value) {
		params.total_sales = salesSort.value;
	}
	params = { ...params, ...typePrams };
	return params;
}

async function getProductList() {
	if (loading.value) {
		uni.stopPullDownRefresh();
		return;
	}
	loading.value = true;
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productIndex, {
			params: {
				...getBaseParams(),
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loading.value = false;
			uni.stopPullDownRefresh();
			loadingStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			productList.value = [...productList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		})
		.catch(() => {
			uni.stopPullDownRefresh();
			loading.value = false;
			loadingStatus.value = 'loadmore';
		});
}

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

async function getBrandList() {
	await uni.$api.http.get(uni.$api.apiShop.productBrandIndex).then((res) => {
		brandList.value = res.data;
	});
}

async function getProductCate() {
	await uni.$api.http.get(uni.$api.apiShop.productCateIndex).then((res) => {
		productCateList.value = res.data;
	});
}

function searchTap() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.search,
	});
}

function dropdownItemTap(e: Event) {
	let index = parseInt(e.currentTarget.dataset.index);
	let list = dropdownList.value;
	for (let i = 0; i < list.length; i++) {
		if (i === index) {
			list[i].selected = true;
		} else {
			list[i].selected = false;
		}
	}
	dropdownList.value = list;
	selectedName.value =
		index === 0 ? uni.$api.language.productList.multiple : index === 1 ? uni.$api.language.productList.priceAsc : uni.$api.language.productList.priceDesc;
	selectHeight.value = 0;
	page.value = 1;
	productList.value = [];
	priceSort.value = dropdownList.value[index].param;
	getProductList();
}

function dropdownTap(e: Event) {
	let index = parseInt(e.currentTarget.dataset.index);
	if (index === 0) {
		showDropdownList();
	} else if (index === 1) {
		let params = {};
		if (tabIndex.value === 1) {
			tabIndex.value = null;
			salesSort.value = 'asc';
		} else {
			tabIndex.value = 1;
			salesSort.value = 'desc';
		}
		page.value = 1;
		productList.value = [];
		getProductList();
	} else if (index === 2) {
		if (!productList.value.length) return;
		isList.value = !isList.value;
	} else if (index === 3) {
		if (productCateList.value.length === 0) {
			getProductCate();
		}
		if (brandList.value.length === 0) {
			getBrandList();
		}
		drawer.value = true;
	}
}

function showDropdownList() {
	selectHeight.value = 246;
	tabIndex.value = 0;
	salesSort.value = '';
}

function hideDropdownList() {
	selectHeight.value = 0;
}

function typeChange(e: Event) {
	let index = parseInt(e.currentTarget.dataset.index);
	let arr = JSON.parse(JSON.stringify(attrArr.value[index].list));
	if (arr.length === 0) {
		attrArr.value[index].isActive = !attrArr.value[index].isActive;
		if (attrArr.value[index].isActive && index === 0) {
			attrArr.value[1].isActive = false;
			attrArr.value[2].isActive = false;
			attrArr.value[3].isActive = false;
		}
		if (attrArr.value[1].isActive || attrArr.value[2].isActive || attrArr.value[3].isActive) {
			attrArr.value[0].isActive = false;
		}
		if (!attrArr.value[1].isActive && !attrArr.value[2].isActive && !attrArr.value[3].isActive) {
			attrArr.value[0].isActive = true;
		}
	} else {
		attrIndex.value = index;
		dropScreenShow.value = true;
		attrArr.value[index].isActive = false;
	}
	let params = {};
	attrArr.value.forEach((item) => {
		if (item.isActive) {
			params = { ...params, ...item.params };
		}
	});
	typePrams = params;

	page.value = 1;
	productList.value = [];
	getProductList();
}

function cateBtnSelected(index: number) {
	currentCateStr.value = '';
	productCateList.value[index].isActive = !productCateList.value[index].isActive;
	const productCateArr = [];
	productCateList.value.forEach((item) => {
		if (item.isActive) {
			productCateArr.push(item.title);
		}
	});
	currentCateStr.value = productCateArr.join(',');
}

function brandBtnSelected(index) {
	currentBrandStr.value = '';
	brandList.value[index].isActive = !brandList.value[index].isActive;
	const brandArr = [];
	brandList.value.forEach((item) => {
		if (item.isActive) {
			brandArr.push(item.title);
		}
	});
	currentBrandStr.value = brandArr.join(',');
}

async function resetTap() {
	currentBrandStr.value = '';
	currentCateStr.value = '';
	minPrice.value = '';
	maxPrice.value = '';
	await getBrandList();
	await getProductCate();
}

function closeDrawer() {
	drawer.value = false;
	const brandArr = [];
	brandList.value.forEach((item) => {
		if (item.isActive) {
			brandArr.push(item.id);
		}
	});
	brandId.value = brandArr.length ? brandArr.join(',') : '';
	const cateArr = [];
	productCateList.value.forEach((item) => {
		if (item.isActive) {
			cateArr.push(item.id);
		}
	});
	cateId.value = cateArr.length ? cateArr.join(',') : '';
	page.value = 1;
	productList.value = [];
	getProductList();
}
</script>

<style lang="scss" scoped>
//搜索
.slot-wrap {
	display: flex;
	align-items: center;
	flex: 1;

	.search-wrap {
		margin: 0 20rpx;
		flex: 1;
		position: relative;
	}
	.search-tip {
		position: absolute;
		height: 50rpx;
		max-width: 100%;
		top: 50%;
		transform: translateY(-50%);
		left: 60rpx;
		display: flex;
		align-items: center;
		padding: 0rpx 20rpx;
		border-radius: 25rpx;
		background-color: rgba(17, 17, 17, 0.6);
		color: #fff;
		font-size: 24rpx;
	}
}

.dz-header-screen {
	width: 100%;
	background: #fff;
	position: fixed;
	z-index: 99;
	.dz-screen-top,
	.dz-screen-bottom {
		border: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 28rpx;
		color: $dz-main-color;
	}
	.dz-screen-top {
		height: 88rpx;
		line-height: 88rpx;
		position: relative;
		background: #fff;
	}
	.dz-top-item {
		height: 28rpx;
		line-height: 28rpx;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		.iconfont {
			font-size: 36rpx;
			font-weight: 500;
		}
	}
	.dz-screen-bottom {
		height: 100rpx;
		padding: 0 30rpx;
		box-sizing: border-box;
		font-size: 24rpx;
		align-items: center;
		overflow: hidden;
	}
	.dz-bottom-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.dz-bottom-item {
		flex: 1;
		width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 12rpx;
		box-sizing: border-box;
		margin-right: 20rpx;
		white-space: nowrap;
		height: 60rpx;
		border-radius: 40rpx;
	}
	.dz-bottom-item:last-child {
		margin-right: 0;
	}
	.dz-icon-ml .dz-icon-class {
		margin-left: 6rpx;
	}
	.dz-ml {
		margin-left: 6rpx;
	}
	.dz-icon-middle .dz-icon-class {
		vertical-align: middle;
	}
	.dz-middle {
		vertical-align: middle;
	}
}

.dz-dropdownlist {
	width: 100%;
	position: absolute;
	background: #fff;
	border-bottom-left-radius: 40rpx;
	border-bottom-right-radius: 40rpx;
	overflow: hidden;
	box-sizing: border-box;
	padding-top: 10rpx;
	padding-bottom: 26rpx;
	left: 0;
	top: 88rpx;
	visibility: hidden;
	transition: all 0.2s ease-in-out;
	z-index: 99;
	.iconcheck {
		font-size: 32rpx;
		line-height: 88rpx;
	}
}
.dz-dropdownlist-show {
	visibility: visible;
}
.dz-dropdownlist-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: -1;
	transition: all 0.2s ease-in-out;
	opacity: 0;
	visibility: hidden;
}
.dz-mask-show {
	opacity: 1;
	visibility: visible;
}
.dz-dropdownlist-item {
	color: $dz-main-color;
	height: 70rpx;
	font-size: 28rpx;
	padding: 0 40rpx;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.dz-btmItem-active {
	border-radius: 32rpx;
	font-weight: bold;
	position: relative;
}
.dz-btmItem-normal {
	border: 1rpx solid rgba(0, 0, 0, 0.12);
	position: relative;
}
.dz-btmItem-active::after {
	content: '';
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 40rpx;
	left: 0;
	top: 0;
}
.dz-btmItem-tap {
	position: relative;
	border-bottom-left-radius: 0;
	border-bottom-right-radius: 0;
}
.dz-btmItem-tap::after {
	content: '';
	position: absolute;
	width: 100%;
	height: 22rpx;
	background: #f7f7f7;
	left: 0;
	top: 58rpx;
}

.dz-drawer-box {
	width: 580rpx;
	font-size: 24rpx;
	overflow: hidden;
	position: relative;
	padding-bottom: 100rpx;
}
.dz-drawer-title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx;
	box-sizing: border-box;
	height: 80rpx;
}
.dz-title-bold {
	font-size: 26rpx;
	font-weight: bold;
	flex-shrink: 0;
}
.dz-attr-right {
	width: 70%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: right;
}
.dz-all-box {
	width: 90%;
	white-space: nowrap;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}
.dz-drawer-content {
	padding: 16rpx 30rpx 30rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
}
.dz-input {
	border: 0;
	height: 64rpx;
	border-radius: 32rpx;
	width: 45%;
	background: #f7f7f7;
	text-align: center;
	font-size: 28rpx;
	color: $dz-main-color;
}
.dz-phcolor {
	text-align: center;
	color: $dz-light-color;
	font-size: 24rpx;
}
.dz-flex-attr {
	flex-wrap: wrap;
	justify-content: flex-start;
}
.dz-attr-item {
	width: 30%;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 4rpx;
	box-sizing: border-box;
	border-radius: 32rpx;
	margin-right: 5%;
	margin-bottom: 5%;
}
.dz-attr-ellipsis {
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	width: 96%;
	text-align: center;
}
.dz-attr-item:nth-of-type(3n) {
	margin-right: 0%;
}
.dz-attr-btnbox {
	width: 100%;
	position: absolute;
	left: 0;
	bottom: 0;
	box-sizing: border-box;
	padding: 0 30rpx;
	background: #fff;
}
.dz-attr-safearea {
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	/*padding-bottom: env(safe-area-inset-bottom);*/
}
.dz-safearea-bottom {
	width: 100%;
	height: env(safe-area-inset-bottom);
}
.dz-attr-btnbox::before {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	border-top: 1rpx solid $dz-border-color;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
}
.dz-drawer-btn {
	width: 47%;
	text-align: center;
	height: 60rpx;
	border-radius: 30rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}
.dz-drawerbtn-black {
	border: 1rpx solid;
}

.dz-product {
	margin-top: 208rpx;
}
</style>

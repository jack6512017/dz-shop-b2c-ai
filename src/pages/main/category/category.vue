<template>
	<view class="dz-wrap">
		<dz-navbar :is-fixed="true" :is-back="false" input-align="center">
			<view class="slot-wrap">
				<view class="search-wrap" @tap="searchTap"
					><dz-search :placeholder="searchDefault" :show-action="false" :disabled="true" input-align="center"></dz-search
				></view>
			</view>
		</dz-navbar>
		<!-- 搜索栏 -->
		<!-- 一级分类样式1 -->
		<view class="dz-menu-wrap" v-if="categoryLevel == '1-1'">
			<view class="page-view" style="width: 100%">
				<view class="class-item">
					<view class="item-container">
						<view class="thumb-box-one" v-for="(item, index) in categoryList" :key="index" @tap="categoryTab(item)">
							<view class="item-menu-image"
								><dz-image :src="item.cover || iconCategoryDefault" :width="132" :height="132" :borderRadius="15"></dz-image
							></view>
							<view class="item-menu-name dz-main-color dz-line-1 dz-m-t-10">{{ item.title }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 一级分类样式2 -->
		<view class="dz-menu-wrap" v-if="categoryLevel == '1-2'">
			<scroll-view scroll-y :scroll-with-animation="isTap" scroll-anchoring class="dz-tab-view dz-bg-color" :scroll-into-view="scrollView_leftId">
				<view
					:id="`left_${index}`"
					v-for="(item, index) in categoryList"
					:key="index"
					class="dz-tab-item dz-bg-color"
					:data-current="index"
					@tap.stop="tapChange(index, item.id)"
				>
					<text
						class="dz-line-1 dz-tab-item-active"
						:style="{
							background: currentTab == index ? 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')' : '',
							color: currentTab == index ? theme.dzBaseFontColor : '',
						}"
					>
						{{ item.title }}
					</text>
				</view>
			</scroll-view>
			<scroll-view
				@scroll="scroll"
				scroll-anchoring
				scroll-y
				scroll-with-animation
				class="right-box dz-content-bg-color"
				:scroll-into-view="scrollView_rightId"
				@scrolltolower="scrolltolower"
			>
				<view
					class="dz-flex dz-col-center dz-row-between dz-p-20 dz-content-bg-color"
					:style="{ top: statusBarHeight + 44 + 'px' }"
					style="width: 550rpx; position: fixed; z-index: 999"
				>
					<view class="dz-font-28 dz-main-color">推荐</view>
					<view class="dz-flex dz-font-28">
						<view class="dz-flex dz-tips-color" @tap="salesChange()">
							<view class="dz-m-r-10" :style="{ color: total_sales ? theme.dzBaseColor : '' }">销量</view>
							<view v-if="!total_sales" class="dz-flex dz-flex-column">
								<dz-icon name="triangleupfill" size="20"></dz-icon>
								<dz-icon name="triangledownfill" size="20" style="margin-top: -6rpx"></dz-icon>
							</view>
							<view v-else class="dz-flex dz-flex-column">
								<dz-icon v-if="total_sales == 'asc'" name="triangleupfill" size="20" :color="theme.dzBaseColor"></dz-icon>
								<dz-icon v-else name="triangledownfill" size="20" :color="theme.dzBaseColor" style="margin-top: -6rpx"></dz-icon>
							</view>
						</view>
						<view class="dz-flex dz-m-l-20 dz-tips-color" @tap="priceChange()">
							<view class="dz-m-r-10" :style="{ color: price ? theme.dzBaseColor : '' }">价格</view>
							<view v-if="!price" class="dz-flex dz-flex-column">
								<dz-icon name="triangleupfill" size="20"></dz-icon>
								<dz-icon name="triangledownfill" size="20" style="margin-top: -6rpx"></dz-icon>
							</view>
							<view v-else class="dz-flex dz-flex-column">
								<dz-icon v-if="price == 'asc'" name="triangleupfill" size="20" :color="theme.dzBaseColor"></dz-icon>
								<dz-icon v-else name="triangledownfill" size="20" :color="theme.dzBaseColor" style="margin-top: -6rpx"></dz-icon>
							</view>
						</view>
					</view>
				</view>
				<view class="dz-p-t-80">
					<block v-for="(item, index) in productList" :key="index">
						<view class="product-item" @tap="productTab(item.id)">
							<view class="image"><dz-image :src="item.picture" :width="180" :height="180" :borderRadius="15"></dz-image></view>
							<view class="product-right dz-m-l-20">
								<view class="name">
									<dz-icon
										class="dz-m-r-10"
										:color="theme.dzBaseColor"
										name="memberDiscount"
										v-if="parseInt(item.is_open_member_discount) === 1"
									></dz-icon>
									{{ item.name }}
								</view>
								<view class="dz-flex dz-row-between">
									<view class="dz-m-r-10">
										<text class="dz-font-32 dz-m-r-10" :style="{ color: theme.dzBaseColor }">￥{{ currentPrice(item) }}</text>
										<text v-if="item.market_price > 0" class="market_price">￥{{ item.market_price }}</text>
									</view>
									<view @tap.stop="toggleSpec(item)"><dz-icon name="cart" size="40" :color="theme.dzBaseColor"></dz-icon></view>
								</view>
							</view>
						</view>
					</block>
					<dz-empty v-if="loadingStatus == 'noData'" text="暂无商品数据哦~" margin-top="80" :src="empty" :iconSize="360"></dz-empty>
					<view v-if="loadingStatus == 'loading'">
						<dz-loadmore :status="loadingStatus" :line="loadingStatus == 'loading' ? false : true" :height="40"></dz-loadmore>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 二级分类样式1 -->
		<view class="dz-menu-wrap" v-if="categoryLevel == '2-1'">
			<scroll-view scroll-y :scroll-with-animation="isTap" scroll-anchoring class="dz-tab-view dz-content-bg-color" :scroll-into-view="scrollView_leftId">
				<view
					:id="`left_${index}`"
					v-for="(item, index) in categoryList"
					:key="index"
					class="dz-tab-item dz-content-bg-color"
					:data-current="index"
					@tap.stop="swichNav"
				>
					<text
						class="dz-line-1 dz-tab-item-active"
						:style="{
							background: currentTab == index ? 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')' : '',
							color: currentTab == index ? theme.dzBaseFontColor : '',
						}"
					>
						{{ item.title }}
					</text>
				</view>
			</scroll-view>
			<scroll-view @scroll="scroll" scroll-anchoring scroll-y scroll-with-animation class="right-box" :scroll-into-view="scrollView_rightId">
				<block v-for="(item, index) in categoryList" :key="index">
					<dz-linkage :recalc="1" :scrollTop="scrollTop" :index="index" @linkage="linkage">
						<view class="page-view" :id="`right_${index}`">
							<view class="class-item">
								<view class="item-title">
									<text>{{ item.title }}</text>
								</view>
								<view class="item-container">
									<view class="thumb-box" v-for="(item1, index1) in item.child" :key="index1" @tap.stop="categoryTab(item1)">
										<view class="item-menu-image">
											<dz-image
												:src="item1.cover ? item1.cover : item.cover ? item.cover : iconCategoryDefault"
												:width="132"
												:height="132"
												borderRadius="15"
											></dz-image>
										</view>
										<view class="item-menu-name dz-m-t-10 dz-line-1 dz-content-color">{{ item1.title }}</view>
									</view>
								</view>
							</view>
						</view>
					</dz-linkage>
				</block>
			</scroll-view>
		</view>
		<!-- 二级分样式2 -->
		<view class="dz-menu-wrap" v-if="categoryLevel == '2-2'">
			<scroll-view scroll-y :scroll-with-animation="isTap" scroll-anchoring class="dz-tab-view dz-bg-color" :scroll-into-view="scrollView_leftId">
				<view
					:id="`left_${index}`"
					v-for="(item, index) in categoryList"
					:key="index"
					class="dz-tab-item"
					:data-current="index"
					@tap.stop="tapChange(index, item.id)"
				>
					<text
						class="dz-line-1 dz-tab-item-active"
						:style="{
							background: currentTab == index ? 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')' : '',
							color: currentTab == index ? theme.dzBaseFontColor : '',
						}"
					>
						{{ item.title }}
					</text>
				</view>
			</scroll-view>
			<scroll-view
				@scroll="scroll"
				scroll-anchoring
				scroll-y
				scroll-with-animation
				class="right-box dz-content-bg-color"
				:scroll-into-view="scrollView_rightId"
				@scrolltolower="scrolltolower"
			>
				<view class="dz-content-bg-color" :style="{ top: statusBarHeight + 44 + 'px' }" style="width: 550rpx; position: fixed; z-index: 999">
					<view class="dz-m-l-20 dz-m-t-20">
						<dz-cate-tab
							:list="categoryTowList"
							:pCover="categoryList.length > 0 ? categoryList[currentTab].cover : ''"
							:activeColor="theme.dzBaseColor"
							:bgColor="theme.dzBgColor"
							:activeIndex="currentCateIndex"
							@click="tabsChange"
						></dz-cate-tab>
					</view>
					<view v-if="productList.length > 0" class="dz-flex dz-col-center dz-row-between dz-p-20">
						<view class="dz-font-28 dz-main-color">推荐</view>
						<view class="dz-flex dz-font-28">
							<view class="dz-flex dz-tips-color" @tap="salesChange()">
								<view class="dz-m-r-10" :style="{ color: total_sales ? theme.dzBaseColor : '' }">销量</view>
								<view v-if="!total_sales" class="dz-flex dz-flex-column">
									<dz-icon name="triangleupfill" size="20"></dz-icon>
									<dz-icon name="triangledownfill" size="20" style="margin-top: -6rpx"></dz-icon>
								</view>
								<view v-else class="dz-flex dz-flex-column">
									<dz-icon v-if="total_sales == 'asc'" name="triangleupfill" size="20" :color="theme.dzBaseColor"></dz-icon>
									<dz-icon v-else name="triangledownfill" size="20" :color="theme.dzBaseColor" style="margin-top: -6rpx"></dz-icon>
								</view>
							</view>
							<view class="dz-flex dz-m-l-20 dz-tips-color" @tap="priceChange()">
								<view class="dz-m-r-10" :style="{ color: price ? theme.dzBaseColor : '' }">价格</view>
								<view v-if="!price" class="dz-flex dz-flex-column">
									<dz-icon name="triangleupfill" size="20"></dz-icon>
									<dz-icon name="triangledownfill" size="20" style="margin-top: -6rpx"></dz-icon>
								</view>
								<view v-else class="dz-flex dz-flex-column">
									<dz-icon v-if="price == 'asc'" name="triangleupfill" size="20" :color="theme.dzBaseColor"></dz-icon>
									<dz-icon v-else name="triangledownfill" size="20" :color="theme.dzBaseColor" style="margin-top: -6rpx"></dz-icon>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view :style="[towTowStyle]">
					<block v-for="(item, index) in productList" :key="index">
						<view class="product-item" @tap="productTab(item.id)">
							<view class="image"><dz-image :src="item.picture" borderRadius="12" width="180" height="180"></dz-image></view>
							<view class="product-right dz-m-l-20">
								<view class="name dz-line-2"
									><dz-icon
										class="dz-m-r-10"
										:color="theme.dzBaseColor"
										name="memberDiscount"
										v-if="parseInt(item.is_open_member_discount) === 1"
									></dz-icon
									>{{ item.name }}</view
								>
								<view class="dz-flex dz-row-between">
									<view class="dz-m-r-10">
										<text class="dz-font-32 dz-m-r-10" :style="{ color: theme.dzBaseColor }">￥{{ currentPrice(item) }}</text>
										<text v-if="item.market_price > 0" class="market_price">￥{{ item.market_price }}</text>
									</view>
									<view @tap.stop="toggleSpec(item)"><dz-icon name="cart" size="50" :color="theme.dzBaseColor"></dz-icon></view>
								</view>
							</view>
						</view>
					</block>
					<dz-empty v-if="loadingStatus == 'noData'" text="暂无商品数据哦~" margin-top="80" :src="empty" iconSize="360"></dz-empty>
					<view v-if="loadingStatus == 'loading'">
						<dz-loadmore :status="loadingStatus" :line="loadingStatus == 'loading' ? false : true" :height="40"></dz-loadmore>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 分类样式3 -->
		<view class="dz-menu-wrap" v-if="categoryLevel == '3-1'">
			<scroll-view scroll-y :scroll-with-animation="isTap" scroll-anchoring class="dz-tab-view dz-content-bg-color" :scroll-into-view="scrollView_leftId">
				<view
					:id="`left_${index}`"
					v-for="(item, index) in categoryList"
					:key="index"
					class="dz-tab-item dz-content-bg-color"
					:data-current="index"
					@tap.stop="swichNav"
				>
					<text
						class="dz-line-1 dz-tab-item-active"
						:style="{
							background: currentTab == index ? 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')' : '',
							color: currentTab == index ? theme.dzBaseFontColor : '',
						}"
					>
						{{ item.title }}
					</text>
				</view>
			</scroll-view>
			<scroll-view @scroll="scroll" scroll-anchoring scroll-y scroll-with-animation class="right-box" :scroll-into-view="scrollView_rightId">
				<block v-for="(item, index) in categoryList" :key="index">
					<dz-linkage :recalc="1" :scrollTop="scrollTop" :index="index" @linkage="linkage">
						<view class="page-view" :id="`right_${index}`">
							<view class="class-item">
								<block v-for="(item1, index1) in item.child" :key="index1">
									<view class="item-sub-title">
										<text>{{ item1.title }}</text>
									</view>
									<view class="item-container">
										<view class="thumb-box" v-for="(item2, index2) in item1.child" :key="index2" @tap.stop="categoryTab(item2)">
											<view class="item-menu-image">
												<dz-image
													:src="item2.cover ? item2.cover : item1.cover ? item1.cover : item.cover ? item.cover : iconCategoryDefault"
													width="132"
													height="132"
													borderRadius="15"
												></dz-image>
											</view>
											<view class="item-menu-name dz-m-t-10 dz-line-1 dz-tips-color">{{ item2.title }}</view>
										</view>
									</view>
								</block>
							</view>
						</view>
					</dz-linkage>
				</block>
			</scroll-view>
		</view>
		<!-- 规格弹窗 -->

		<dz-popup v-model:show="specShow" mode="bottom" border-radius="40" closeIcon="roundclose" closeIconSize="40" :closeable="true">
			<dz-attr-content
				:product="data.productDetail"
				:buyNumber="currentNumber"
				buttonName="加入购物车"
				@confirm="attrConfirmClick"
				@pointExchange="pointExchange"
			></dz-attr-content>
		</dz-popup>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="getInfo"></dz-page-loading>
		<!-- tabbar -->
		<dz-tabbar
			v-if="tabbarList.props && tabbarList.props.dataSource != 'default'"
			value="/pages/main/category/category"
			:list="tabbarList.props.list.slice(0, tabbarList.props.num)"
			:bgColor="tabbarList.props.bgColor"
			:inactiveColor="tabbarList.props.inactiveColor"
			:activeColor="tabbarList.props.activeColor || theme.dzBaseColor"
		>
		</dz-tabbar>
		<dz-tabbar v-else value="/pages/main/category/category" :list="defaultTabbarList" :activeColor="theme.dzBaseColor"></dz-tabbar>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, nextTick } from 'vue';
import type { CSSProperties } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
// 获取系统状态栏的高度
let systemInfo = uni.getSystemInfoSync();
import tabbarConfig from '@/core/config/tabbarConfig';

const userStore = useUserStore();
const pageLoadingStatus = ref<string>('loading');
const pageLoadingShow = ref<boolean>(true);
const categoryLevel = ref<string>('');
const categoryList = ref<array>([]);
const iconCategoryDefault = uni.$api.assetsConfig.iconCategoryDefault;
const isTap = ref<boolean>(true);
const isScroll = ref<boolean>(true);
const scrollView_leftId = ref<string>('left_0');
const scrollView_rightId = ref<string>('right_0');
const currentTab = ref<number>(0);
const scrollTop = ref<number>(0); //tab标题的滚动条位置
const statusBarHeight = systemInfo.statusBarHeight;
const page = ref<number>(1);
const loadingStatus = ref<string>('loading');
const empty = uni.$api.assetsConfig.empty;
const productList = ref<array>([]);
const categoryTowList = ref<array>([]);
const currentCateIndex = ref<number>(0);
const cateId = ref<string>('');
const defaultCateId = ref<string>('');
const total_sales = ref<string>('');
const price = ref<string>('');
const specShow = ref<boolean>(false);
const currentNumber = ref<number>(0);
const currentSkuId = ref<string>('');
const currentSkuNumber = ref<string>('');
const data = reactive<any>({
	productDetail: {},
});
const defaultTabbarList = tabbarConfig.tabbarList;
const barTitle = ref<string>(uni.$api.language.category.titleCategory);

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const tabbarList = computed(() => {
	return userStore.getTabbarList;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const productSearchDefault = computed(() => {
	return userStore.getProductSearchDefault;
});

const cartPageListen = computed(() => {
	return userStore.getCartPageListen;
});

const searchDefault = productSearchDefault.value || uni.$api.language.searchHold;

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.hideTabBar();
	const pages = getCurrentPages();
	if (tabbarList.value.props && tabbarList.value.props.dataSource != 'default') {
		const list = tabbarList.value.props.list;
		const route = list.filter((item) => item.pagePath == `/${pages[pages.length - 1].route}`);
		barTitle.value = route[0].text;
	}
	uni.setNavigationBarTitle({ title: barTitle.value });
	if (options && options.cate_id) {
		defaultCateId.value = options.cate_id;
	}
	getInfo();
});

onPullDownRefresh(() => {
	pageLoadingStatus.value = 'loading';
	pageLoadingShow.value = true;
	categoryTowList.value = [];
	productList.value = [];
	currentTab.value = 0;
	cateId.value = '';
	page.value = 1;
	price.value = '';
	total_sales.value = '';
	getInfo();
});

const towTowStyle = computed((): CSSProperties => {
	return {
		paddingTop: categoryTowList.value.length == 0 ? '84rpx' : '258rpx',
	};
});

async function getInfo() {
	if (userStore.hasLogin) {
		await getMemberIndex();
	}
	await getCustomCate();
	await getCategoryList();
}

async function getMemberIndex() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

async function getCustomCate() {
	await uni.$api.http
		.get(uni.$api.apiShop.diyCateIndex)
		.then((res) => {
			if (!res.data.style_cate_type) return;
			categoryLevel.value = res.data.style_cate_type;
		})
		.catch((err) => {
			pageLoadingStatus.value = 'error';
			if (err) return;
			uni.$api.toast('网络请求错误,请检查网络是否正常!');
		});
}

async function getCategoryList() {
	await uni.$api.http
		.get(uni.$api.apiShop.productCateIndex)
		.then((res) => {
			categoryList.value = res.data;
			const findIndex = categoryList.value.findIndex((item) => item.id == defaultCateId.value);
			if (categoryLevel.value != '' && categoryLevel.value == '2-2' && categoryList.value.length) {
				categoryList.value.forEach((item) => {
					if (item.child.length > 0) {
						item.child.unshift({
							title: '全部',
							id: item.id,
						});
					}
				});
				categoryTowList.value = res.data[0].child;
				cateId.value = res.data[0].id;
				if (findIndex != -1) {
					categoryTowList.value = res.data[findIndex].child;
					cateId.value = res.data[findIndex].id;
					tapChange(findIndex, defaultCateId.value);
				}
				getProductList();
			} else {
				loadingStatus.value = 'noData';
			}

			if (categoryLevel.value && categoryLevel.value == '1-2') {
				cateId.value = res.data[0].id;
				if (findIndex != -1) {
					cateId.value = res.data[findIndex].id;
					tapChange(findIndex, defaultCateId.value);
				}
				getProductList();
			}
			setTimeout(() => {
				if (findIndex != -1) {
					if (categoryLevel.value && ['2-1', '3-1'].includes(categoryLevel.value)) {
						swichNav({
							currentTarget: {
								dataset: {
									current: findIndex,
								},
							},
						});
					}
				}
			}, 30);
			uni.stopPullDownRefresh();
			setTimeout(() => {
				pageLoadingShow.value = false;
			}, 100);
		})
		.catch(() => {
			pageLoadingStatus.value = 'error';
			uni.stopPullDownRefresh();
		});
}

// 计算价格
function currentPrice(item) {
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
		price = parseFloat(price * (1 - parseFloat(item.memberDiscount.discount) / 100)).toFixed(2);
	}
	return price;
}

function get_min(list) {
	return Math.min.apply(
		Math,
		list.map((item) => {
			return parseFloat(item);
		})
	);
}

function swichNav(e: Event) {
	uni.$api.throttle(() => {
		let cur = e.currentTarget.dataset.current;
		if (currentTab.value == cur) {
			return false;
		} else {
			currentTab.value = cur;
			checkCor(false);
		}
	}, 300);
}

function checkCor(is: boolean) {
	if (!is) {
		isScroll.value = false;
		isTap.value = true;
		if (currentTab.value > 6) {
			scrollView_leftId.value = `left_${currentTab.value - 2}`;
		} else {
			scrollView_leftId.value = `left_0`;
		}
		scrollView_rightId.value = `right_${currentTab.value}`;
	} else {
		scrollView_leftId.value = `left_${currentTab.value}`;
	}
}

function scroll(e: Event) {
	//动画时长固定300ms
	if (!isScroll.value) {
		setTimeout(() => {
			isScroll.value = true;
		}, 300);
	} else {
		scrollTop.value = e.detail.scrollTop;
	}
}

function linkage(e: any) {
	if (e.isLinkage && e.index != currentTab.value) {
		isTap.value = false;
		currentTab.value = e.index;
		checkCor(true);
	}
}

function categoryTab(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.productList,
		query: {
			cate_id: item.id,
		},
	});
}

function searchTap() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.search,
		query: {},
	});
}

function tapChange(index, id) {
	let cur = index;
	if (currentTab.value == cur) {
		return false;
	} else {
		categoryTowList.value = [];
		productList.value = [];
		currentTab.value = cur;
		cateId.value = id;
		page.value = 1;
		price.value = '';
		total_sales.value = '';
		if (categoryLevel.value == '2-2') {
			nextTick(() => {
				categoryTowList.value = categoryList.value[currentTab.value].child;
				currentCateIndex.value = 0;
			});
		}
		getProductList();
	}
}

function tabsChange(index) {
	if (index === currentCateIndex.value) {
		return;
	}
	currentCateIndex.value = index;
	cateId.value = categoryTowList.value[index].id;
	page.value = 1;
	price.value = '';
	total_sales.value = '';
	loadingStatus.value = 'loading';
	productList.value = [];
	getProductList();
}

function productTab(id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id: id,
		},
	});
}

function salesChange() {
	if (productList.value.length == 0) return;
	total_sales.value = total_sales.value === 'asc' ? 'desc' : 'asc';
	price.value = '';
	page.value = 1;
	productList.value = [];
	getProductList();
}

function priceChange() {
	if (productList.value.length == 0) return;
	price.value = price.value === 'asc' ? 'desc' : 'asc';
	total_sales.value = '';
	page.value = 1;
	productList.value = [];
	getProductList();
}

function scrolltolower() {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getProductList();
}

async function getProductList() {
	let params = {};
	loadingStatus.value = 'loading';
	if (cateId.value) {
		params.cate_id = cateId.value;
	}
	if (total_sales.value) {
		params.total_sales = total_sales.value;
	}
	if (price.value) {
		params.price = price.value;
	}
	await uni.$api.http
		.get(uni.$api.apiShop.productIndex, {
			params: {
				...params,
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then(async (res) => {
			loadingStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			productList.value = [...productList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		})
		.catch(() => {
			uni.stopPullDownRefresh();
			loadingStatus.value = 'loadmore';
			loadingStatus.value = 'error';
		});
}

//打开属性选择
function toggleSpec(row: object) {
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
function attrConfirmClick(data: any) {
	currentSkuId.value = data.skuId;
	currentSkuNumber.value = data.skuNumber;
	addToCart();
}

//获取商品详情
async function getProductDetail(row: any) {
	uni.showLoading({ title: '加载中...' });
	currentSkuId.value = row.sku_id;
	currentNumber.value = row.min_buy;
	await uni.$api.http
		.get(uni.$api.apiShop.productView, {
			params: {
				id: row.product_id || row.id,
			},
		})
		.then((res) => {
			const _data = res.data;
			_data.sku_name = row.sku_name;
			_data.sku_data = res.data.sku.length ? res.data.sku[0].data : '';
			data.productDetail = _data;
			specShow.value = true;
		})
		.finally(() => {
			uni.hideLoading();
		});
}

//加入购物车
async function addToCart() {
	if (!userStore.hasLogin) {
		loginClick();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	await uni.$api.http
		.post(uni.$api.apiMember.cartItemCreate, {
			sku_id: currentSkuId.value,
			num: currentSkuNumber.value,
		})
		.then(() => {
			uni.$api.toast(uni.$api.language.product.addToCartSuccess);
			specShow.value = false;
			//购物车页面打开的情况下发送事件
			if (cartPageListen.value) {
				uni.$emit('cartNumChange', {});
			} else {
				getCartCount();
			}
		});
}

//获取购物车数量
async function getCartCount() {
	uni.$api.http.get(uni.$api.apiMember.cartItemCount).then((res) => {
		userStore.setCartNum(res.data.count);
	});
}

//积分换购
function pointExchange(params: any) {
	if (!userStore.hasLogin) {
		loginClick();
		return;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	specShow.value = false;
}

//登录点击
function loginClick() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
	});
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
	}
}

.dz-wrap {
	height: calc(100vh);
	/* #ifdef H5 */
	height: calc(100vh - var(--window-top));
	/* #endif */
	display: flex;
	flex-direction: column;
}

.dz-menu-wrap {
	flex: 1;
	display: flex;
	overflow: hidden;
}

.dz-tab-view {
	flex-shrink: 0;
	width: 186rpx;
	height: 100%;
}

.dz-tab-item {
	height: 110rpx;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 26rpx;
	color: $dz-main-color;
	font-weight: 400;
	line-height: 1;
}

.dz-tab-item-active {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 148rpx;
	height: 50rpx;
	border-radius: 25rpx;
}

.right-box {
	padding-bottom: 16rpx;
}

.page-view {
	padding: 16rpx 16rpx 0 16rpx;
}

.class-item {
	padding: 16rpx;
	border-radius: 20rpx;
	background-color: #fff;
}

.item-title {
	font-size: 26rpx;
	color: $dz-main-color;
	font-weight: bold;
}

.item-sub-title {
	font-size: 24rpx;
	padding: 20rpx 15rpx 5rpx 15rpx;
	color: $dz-content-color;
	font-weight: bold;
}

.item-menu-name {
	font-weight: normal;
	font-size: 24rpx;
	color: $dz-main-color;
}

.item-container {
	display: flex;
	flex-wrap: wrap;
}

.thumb-box {
	width: 33.333333%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	margin-top: 20rpx;
}

.thumb-box-one {
	width: 25%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	margin-top: 20rpx;
}

.item-menu-image {
	width: 132rpx;
	height: 132rpx;
	background: $dz-bg-color;
	border-radius: 15rpx;
}
.product-item {
	display: flex;
	width: 564rpx;
	padding: 20rpx;
	background: #ffffff;
	.image {
		flex-shrink: 0;
		width: 180rpx;
		height: 180rpx;
		border-radius: 12rpx;
		background: $dz-bg-color;
	}
	.product-right {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		.name {
			width: 314rpx;
			height: 64rpx;
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
		.market_price {
			text-decoration: line-through;
			color: $dz-tips-color;
			font-size: 24rpx;
		}
	}
}
</style>

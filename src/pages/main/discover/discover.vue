<template>
	<view>
		<dz-navbar-immersive splitLine scrollRatio="0.3" :isCustom="true" :scrollTop="scrollTop" :isOpacity="true" :dropDownHide="true">
			<dz-navbar :title="title" :isBack="false" :borderBottom="false">
				<template #right>
					<view v-if="!cateList.length" class="dz-m-r-32"><dz-icon name="like" size="48" @click="likeFill"></dz-icon></view>
				</template>
			</dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			:isBack="false"
			:title="title"
			:is-fixed="false"
			:background="{ background: 'linear-gradient(90deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')' }"
			:title-color="theme.dzBaseFontColor"
			:border-bottom="false"
		>
			<template #right>
				<view v-if="!cateList.length" class="dz-m-r-32"
					><dz-icon name="like" size="48" :color="theme.dzBaseFontColor" @click="likeFill"></dz-icon
				></view>
			</template>
		</dz-navbar>
		<view class="pure_top" v-if="shareBannerList.length > 0">
			<view
				class="pure_top-view"
				:style="{
					background: 'linear-gradient(90deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')',
					color: theme.dzBaseFontColor,
				}"
			></view>
		</view>
		<view class="swiper-box" v-if="shareBannerList.length > 0">
			<dz-swiper
				:list="shareBannerList"
				name="cover"
				border-radius="20"
				height="272"
				mode="slider"
				bg-color="transparent"
				@click="swiperClick"
			></dz-swiper>
		</view>
		<view class="content" :style="[contentStyle]">
			<view class="tap" v-if="cateList.length > 0">
				<view>
					<scroll-view scroll-x class="scroll-tap">
						<view class="scroll-item" @tap="likeFill()">
							<view
								class="icon"
								:style="{
									background: theme.dzBaseColor,
									color: theme.dzBaseFontColor,
								}"
							>
								<view class="dz-flex dz-row-center dz-col-center">
									<view class="dzicon-iconfont dzicon-likefill" :style="{ color: theme.dzBaseFontColor }"></view>
								</view>
							</view>
							<view class="text dz-line-1">{{ language.application.collection }}</view>
						</view>
						<block v-for="(item, index) in cateList" :key="index">
							<view class="scroll-item" @tap="cateTap(item)">
								<view class="image"><dz-image :src="item.cover || missingFace" :borderRadius="50" :width="90" :height="90"></dz-image></view>
								<view class="text dz-line-1">{{ item.title }}</view>
							</view>
						</block>
					</scroll-view>
				</view>
			</view>
			<content-list ref="contentListRef" :list="shareContentList"></content-list>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="180" :src="empty" iconSize="360"></dz-empty>
		<view>
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
		<dz-tabbar
			v-if="tabbarList.props && tabbarList.props.dataSource != 'default'"
			value="/pages/main/discover/discover"
			:list="tabbarList.props.list.slice(0, tabbarList.props.num)"
			:bgColor="tabbarList.props.bgColor"
			:inactiveColor="tabbarList.props.inactiveColor"
			:activeColor="tabbarList.props.activeColor || theme.dzBaseColor"
		>
		</dz-tabbar>
		<dz-tabbar v-else value="/pages/main/discover/discover" :list="defaultTabbarList" :activeColor="theme.dzBaseColor"></dz-tabbar>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { onLoad, onUnload, onPullDownRefresh, onReachBottom, onPageScroll } from '@dcloudio/uni-app';
import tabbarConfig from '@/core/config/tabbarConfig';
import { useUserStore } from '@/state/modules/user';
import contentList from '@/pages/main/discover/components/content-list/content-list.vue';

const language = uni.$api.language;
const title = ref<string>();
const missingFace = ref<string>();
const shareBannerList = ref<array>([]);
const cateList = ref<array>([]);
const page = ref<number>(1);
const shareContentList = ref<array>([]);
const loadingStatus = ref<string>();
const scrollTop = ref<number>(0);
const opacity = ref<number>(0);
const empty = uni.$api.assetsConfig.empty;
const defaultTabbarList = tabbarConfig.tabbarList;
const userStore = useUserStore();
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});
const contentListRef = ref(null);
const theme = computed(() => {
	return userStore.getTheme;
});
const tabbarList = computed(() => {
	return userStore.getTabbarList;
});

const navbarStyle = computed(() => {
	let style = {};
	style.opacity = opacity.value;
	return style;
});

const contentStyle = computed(() => {
	let style = {};
	style.marginTop = shareBannerList.value.length ? '70rpx' : '24rpx';
	return style;
});

onLoad(async () => {
	await uni.$onLaunched;
	let pages = getCurrentPages();
	if (pages[pages.length - 1].route != 'pages/main/discover/discover') return;
	title.value = uni.$api.language.discover.titleDiscover;
	if (tabbarList.value.props && tabbarList.value.props.dataSource != 'default') {
		const list = tabbarList.value.props.list;
		const route = list.filter((item) => item.pagePath == `/${pages[pages.length - 1].route}`);
		title.value = route[0].text;
	}
	uni.setNavigationBarTitle({ title: title.value });
	missingFace.value = shopSetting.value.store_logo;
	getShareContent();
	getShareIndex();

	uni.$on('collectionLikeChange', () => {
		page.value = 1;
		shareContentList.value = [];
		getShareContent();
	});
});

onUnload(() => {
	unref(contentListRef)?.videoPauseAll();
	uni.$off('collectionLikeChange');
});

function tabbarChange() {
	unref(contentListRef)?.videoPauseAll();
}

onPullDownRefresh(() => {
	page.value = 1;
	shareContentList.value = [];
	getShareContent();
	getShareIndex();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getShareContent();
});

onPageScroll((e) => {
	scrollTop.value = e.scrollTop;
});

function opacityChange(e) {
	opacity.value = e.opacity;
}

function swiperClick(index) {
	let item = shareBannerList.value[index];
	tabbarChange();
	uni.$api.shop.advNavigate(item.jump_type, item.jump_link, item.id);
}

function likeFill() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.shareCollection,
	});
	tabbarChange();
}

async function getShareIndex() {
	await uni.$api.http.get(uni.$api.apiShare.shareIndex).then((res) => {
		shareBannerList.value = res.data.adv;
		cateList.value = res.data.cate;
	});
	uni.stopPullDownRefresh();
}

async function getShareContent() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShare.contentIndex, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			shareContentList.value = [...shareContentList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		})
		.catch((err) => {
			loadingStatus.value = 'loadmore';
		});
}

function cateTap(item) {
	tabbarChange();
	uni.$api.router.push({
		route: uni.$api.routesConfig.shareList,
		query: {
			id: item.id,
			title: item.title,
		},
	});
}
</script>

<style lang="scss" scoped>
.pure_top {
	width: 100%;
	height: 220rpx;
	position: relative;
	z-index: 0;
	overflow: hidden;
}

.pure_top-view {
	content: '';
	width: 180%;
	height: 220rpx;
	position: absolute;
	left: -40%;
	top: 0;
	border-radius: 0 0 50% 50%;
	background: pink;
}

.swiper-box {
	padding: 0 24rpx 24rpx;
	margin-top: -220rpx;
	height: 220rpx;
	position: relative;
	z-index: 1;
}

.content {
	margin-top: 70rpx;
	padding: 0 24rpx;
}

.tap {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding-top: 20rpx;
	margin-bottom: 20rpx;

	.title {
		padding: 20rpx;
		font-size: 32rpx;
		color: $dz-main-color;
	}

	.scroll-tap {
		white-space: nowrap;

		.scroll-item {
			display: inline-block;
			text-align: center;
			width: 160rpx;
			padding: 0 20rpx;

			.image,
			.icon {
				width: 90rpx;
				height: 90rpx;
				border-radius: 50%;
			}

			.image {
				vertical-align: bottom;
				margin: 0 auto;
			}

			.icon {
				display: inline-block;

				> view {
					height: 100%;
				}

				.dzicon-likefill {
					font-size: 50rpx;
				}
			}

			.text {
				font-size: 28rpx;
				color: $dz-tips-color;
				margin: 10rpx 0 20rpx;
			}
		}
	}
}
</style>

<template>
	<view v-if="member">
		<dz-navbar-immersive
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar title="会员中心"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			title="会员中心"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
			:border-bottom="false"
			:background="{ background: '#000' }"
		></dz-navbar>
		<view class="header" :style="{ background: '#000' }">
			<view class="content">
				<view class="left">
					<view class="img"
						><dz-avatar :src="member.head_portrait || missingFace" size="large" :isBorder="true" :borderColor="'rgba(255,255,255,0.6)'"></dz-avatar
					></view>
					<view class="dz-text-left">
						<view class="dz-flex">
							<view class="dz-font-36 dz-font-weight dz-line-1 dz-m-r-6" style="max-width: 480rpx">
								{{ member.nickname || member.realname || language.distribution.noName }}
							</view>
							<dz-image
								v-if="member.memberLevel && member.memberLevel.picture"
								:src="member.memberLevel.picture"
								:width="42"
								:height="42"
							></dz-image>
						</view>

						<view class="dz-font-24 dz-m-t-8">
							{{ member.vip_expired_time ? api.timeFormat(member.vip_expired_time, 'yyyy-mm-dd') + '到期' : '---' }}
						</view>
					</view>
				</view>
				<view v-if="member.memberLevel" class="dz-p-r-30 dz-p-t-10" @tap="handleModalShow">规则 <dz-icon name="question"> </dz-icon></view>
			</view>
			<view class="header-bottom">
				<view>{{ member.memberLevel && member.memberLevel.name ? member.memberLevel.name : '未开通' }}</view>
				<view>
					<dz-button
						:custom-style="{
							width: '150rpx',
							height: '60rpx',
							borderRadius: '30rpx',
							fontSize: '26rpx',
							backgroundImage: 'linear-gradient(4.71239rad, rgb(255, 225, 206), rgb(255, 240, 229))',
							color: 'rgb(113, 48, 9)',
						}"
						hover-class="none"
						:border="false"
						size="mini"
						shape="circle"
						@click="toPage('memberLevel')"
					>
						立即{{ member.memberLevel ? '续费' : '开通' }}
					</dz-button>
				</view>
			</view>
		</view>
		<view class="data"></view>
		<view class="dz-font-32 dz-m-l-24" style="margin-top: -130rpx">会员专享权益</view>
		<dz-grid-menu :list="menuList" name="icon" title="title" :col="4" :widthHeight="80" :isPage="false"></dz-grid-menu>
		<view v-if="couponData.length" class="card-box">
			<view class="card-item">
				<dz-cell-item
					title="每月专享劵"
					:arrow="false"
					:border-bottom="false"
					:title-style="{
						'font-size': '32rpx',
						color: theme.dzMainColor,
					}"
					:customStyle="{ padding: '10rpx 20rpx' }"
					hover-class="none"
				></dz-cell-item>
				<coupon :list="couponData" @click="getCoupon"></coupon>
			</view>
		</view>
		<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
		<dz-title v-if="productList.length" class="dz-m-t-40" title="会员折扣专区" mode="linear" :barWidth="60" :barHeight="10" barColor="#000"></dz-title>
		<dz-product-list :list="productList" :marginTop="30" :marginLeftRight="20" :marginBottom="20"></dz-product-list>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
		<dz-modal
			v-model:show="modalShow"
			:mask-close-able="false"
			title="会员卡介绍"
			:confirm-color="theme.dzBaseColor"
			confirmText="我知道了"
			width="90%"
			@confirm="handleModalShow"
		>
			<view v-if="member.memberLevel" class="dz-p-30 dz-font-24">
				{{ member.memberLevel.detail }}
			</view>
		</dz-modal>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onShow, onPageScroll, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import coupon from './components/coupon.vue';

const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const empty = uni.$api.assetsConfig.empty;
const menuList = [
	{ title: '会员商品', icon: uni.$api.assetsConfig.memberLevelProduct },
	{ title: '会员折上折', icon: uni.$api.assetsConfig.memberLevelDiscount },
	{ title: '专享优惠劵', icon: uni.$api.assetsConfig.memberLevelCoupon },
	{ title: '专属客服', icon: uni.$api.assetsConfig.memberLevelCustomerService },
];
const data = reactive({
	scrollTop: 0,
	opacity: 0,
	loadingShow: true,
	pageLoadingStatus: 'loading',
	loadingStatus: 'loading',
	page: 1,
	productList: [],
	member: null,
	modalShow: false,
	couponData: [],
});

const userStore = useUserStore();

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '会员中心',
	});
});

onShow(() => {
	data.page = 1;
	data.productList = [];
	getMemberLevelIndex();
});

onPageScroll((e) => {
	data.scrollTop = e.scrollTop;
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getProductList();
});

const navbarStyle = computed(() => {
	let style = {};
	style.opacity = data.opacity;
	return style;
});

const theme = computed(() => {
	return userStore.getTheme;
});

function loadingClick() {
	getMemberLevelIndex();
}
function opacityChange(e) {
	data.opacity = e.opacity;
}

function getMemberLevelIndex() {
	uni.$api.http
		.get(uni.$api.apiMember.memberLevelIndex)
		.then((res) => {
			data.loadingShow = false;
			data.member = res.data.member;
			if (data.member.vip_level && res.data.level) {
				const level = res.data.level.find((item) => item.id == data.member.vip_level);
				data.couponData = level.coupon;
				data.couponData.forEach((item, index) => {
					data.couponData[index] = { ...item, ...item.coupon };
				});
			}
			console.log(data.couponData);
		})
		.catch((err) => {
			data.pageLoadingStatus = 'error';
			return;
		});
	getProductList();
}

async function getProductList() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productIndex, {
			params: {
				page: data.page,
				is_open_member_discount: 1,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.productList = [...data.productList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch((err) => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

function handleModalShow() {
	data.modalShow = !data.modalShow;
}

// 领取优惠券
async function getCoupon({ index, item }) {
	await uni.$api.http
		.post(uni.$api.apiMember.memberLevelCreateCoupon, {
			id: item.id,
		})
		.then((res) => {
			if (data.couponData[index]) {
				if (!item.myGet) {
					data.couponData[index].myGet = {
						count: 1,
					};
				} else {
					data.couponData[index].myGet.count = parseInt(item.myGet.count) + 1;
				}
				if (
					parseInt(data.couponData[index].max_fetch) > 0 &&
					data.couponData[index].myGet &&
					data.couponData[index].myGet.count == parseInt(data.couponData[index].max_fetch)
				) {
					data.couponData[index].is_get = 0;
				} else {
					data.couponData[index].is_get = 1;
				}
			}
			uni.$api.toast(uni.$api.language.product.couponGetSuccess);
		});
}

function toPage(url: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
	});
}

const { scrollTop, member, couponData, loadingShow, loadingStatus, pageLoadingStatus, productList, modalShow } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.header {
	height: 400rpx;
	padding: 30rpx 20rpx;
	color: #fff;
	.content {
		display: flex;
		justify-content: space-between;
	}
	.left {
		display: flex;
		align-items: center;

		.img {
			flex-shrink: 0;
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			margin-right: 20rpx;
			overflow: hidden;
		}
	}
	.header-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
	}
}

.data {
	height: 150rpx;
	background: $dz-bg-color;
	border-radius: 40rpx 40rpx 0 0;
	margin-top: -150rpx;
}

.card-box {
	margin: -10rpx 24rpx 24rpx;
	.card-item {
		background-color: #ffffff;
		margin-top: 24rpx;
		border-radius: 20rpx;
		overflow: hidden;
	}
}

.icon-bg {
	display: flex;
	justify-content: center;
	align-items: center;

	margin-bottom: 10rpx;

	border-radius: 40rpx;
}

.grid-item-text {
	display: block;
	text-align: center;
	font-size: 24rpx;
}
</style>

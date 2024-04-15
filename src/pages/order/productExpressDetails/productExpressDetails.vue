<template>
	<view>
		<dz-navbar-immersive
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar :title="'物流信息'"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			:title="'物流信息'"
			:isFixed="true"
			:background="{ background: theme.dzBaseColor }"
			:border-bottom="false"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
		></dz-navbar>
		<view>
			<view class="banner-bg" :style="{ background: theme.dzBaseColor }"></view>
			<view class="product-boxs">
				<view class="card-item" v-for="(item, index) in shippingDetail" :key="index" @tap="tabExpress(index)">
					<view class="shipping" v-if="item.shipping_type == 1">
						<view class="left">
							<view class="title" :style="{ fontWeight: checked == index ? 'bold' : '', color: checked == index ? theme.dzBaseColor : '' }">
								<view v-if="checked == index" class="dzicon-iconfont dzicon-activityfill"></view>
								<view>{{ item.express_name || '' }}</view>
							</view>
							<view class="tip">{{ item.express_no || '' }}</view>
						</view>
						<view class="btn">
							<dz-button
								:plain="true"
								type="info"
								size="mini"
								shape="circle"
								hoverClass="none"
								:border="false"
								:custom-style="{ height: '40rpx', background: '#fff', border: '1rpx solid rgba(0, 0, 0, 0.12)' }"
								@click="copy(item.express_no)"
							>
								复制
							</dz-button>
						</view>
					</view>
					<view class="product" v-if="item.order_product.length == 1">
						<view class="image"
							><dz-image :src="item.order_product[0].product_picture" :borderRadius="15" :width="120" :height="120"></dz-image
						></view>
						<view class="right">
							<view class="dz-line-2">{{ item.order_product[0].product_name }}</view>
						</view>
					</view>
					<view class="products" v-else>
						<view class="dzicon-iconfont dzicon-right icon" v-if="item.order_product.length > 2"></view>
						<scroll-view scroll-x class="scroll-box">
							<view class="item" v-for="(v, index1) in item.order_product" :key="index1">
								<view class="card product">
									<view class="image"><dz-image :src="v.product_picture" :borderRadius="10" :width="120" :height="120"></dz-image></view>
									<view class="name">
										<view>{{ v.product_name }}</view>
									</view>
								</view>
							</view>
						</scroll-view>
					</view>
				</view>
			</view>
			<view class="trace">
				<dz-time-line v-if="trace.length">
					<block v-for="(item, index2) in trace" :key="index2">
						<dz-time-line-item nodeTop="2" v-if="index2 == 0">
							<!-- 此处自定义了左边内容，用一个图标替代 -->
							<template #node>
								<view class="dz-node" :style="{ background: theme.dzBaseColor }"
									><dz-icon name="deliver_fill" color="#fff" :size="46"></dz-icon
								></view>
							</template>
							<template #content>
								<view>
									<!-- <view class="dz-order-title">待取件</view> -->
									<view class="dz-order-desc">{{ item.remark }}</view>
									<view class="dz-order-time">{{ item.datetime }}</view>
								</view>
							</template>
						</dz-time-line-item>
						<dz-time-line-item v-else>
							<!-- 此处没有自定义左边的内容，会默认显示一个点 -->
							<template #content>
								<view>
									<view class="dz-order-desc">{{ item.remark }}</view>
									<view class="dz-order-time">{{ item.datetime }}</view>
								</view>
							</template>
						</dz-time-line-item>
					</block>
				</dz-time-line>
				<dz-empty v-if="trace && trace.length == 0" margin-top="80" text="暂无物流信息" :src="emptyOrder" iconSize="360"></dz-empty>
			</view>
		</view>
		<!-- 猜你喜欢 -->
		<dz-title title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
		<dz-product-list class="dz-m-20" :list="guessYouLikeList"></dz-product-list>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onReachBottom, onPageScroll } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const empty = uni.$api.assetsConfig.empty;
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const data = reactive({
	shippingDetail: [],
	loadingStatus: 'loading',
	page: 1,
	guessYouLikeList: [],
	scrollTop: 0,
	opacity: 0,
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	id: '',
	trace: [],
	checked: 0, // 物流选中
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.id = options.id;
	getOrderDetail();
	getGuessYouLikeList();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	etGuessYouLikeList();
});

onPageScroll((e) => {
	data.scrollTop = e.scrollTop;
});
const navbarStyle = computed(() => {
	let style = {};
	style.opacity = data.opacity;
	return style;
});

const theme = computed(() => {
	return userStore.getTheme;
});

function pageLoadingClick() {
	getOrderDetail();
	getGuessYouLikeList();
}

function opacityChange(e) {
	data.opacity = e.opacity;
}

async function getOrderDetail() {
	data.pageLoadingShow = true;
	await uni.$api.http
		.get(uni.$api.apiMember.orderProductExpressDetails, {
			params: {
				order_id: data.id,
			},
		})
		.then((res) => {
			data.pageLoadingShow = false;
			res.data.forEach((item) => {
				if (item.shipping_type == 1) {
					data.shippingDetail.push(item);
				}
			});
			data.trace = data.shippingDetail[data.checked].trace;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

// 复制
function copy(val) {
	uni.$api.copy(val);
	uni.$api.toast('订单号已复制到剪贴板');
}

// 切换物流

function tabExpress(index: number) {
	if (data.shippingDetail[index].shipping_type == 0) return;
	if (data.checked == index) return;
	data.checked = index;
	data.trace = data.shippingDetail[index].trace;
	uni.$api.toast(`已切换到${data.shippingDetail[index].express_name}`);
}

async function getGuessYouLikeList() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.guessYouLikeList = [...data.guessYouLikeList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
}

const { scrollTop, shippingDetail, checked, trace, pageLoadingShow, pageLoadingStatus, loadingStatus, guessYouLikeList } = { ...toRefs(data) };
</script>

<style lang="scss">
.banner-bg {
	height: 200rpx;
	border-radius: 0 0 5% 5%;
}
.product-boxs {
	margin: -160rpx 24rpx 24rpx;
	.card-item {
		position: relative;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-radius: 20rpx;
		background-color: #fff;
	}
	.icon {
		position: absolute;
		right: 10rpx;
		bottom: 75rpx;
	}
	.product {
		display: flex;
		.image {
			flex-shrink: 0;
			width: 120rpx;
			height: 120rpx;
			border-radius: 10rpx;
			background-color: $dz-bg-color;
		}
		.right {
			margin-left: 20rpx;
			display: flex;
			align-items: center;
			font-size: 28rpx;
			color: $dz-main-color;
		}
	}
	.scroll-box {
		white-space: nowrap;
		.item {
			display: inline-block;
			margin-right: 20rpx;
			.product {
				width: 310rpx;
				align-items: center;
				.name {
					margin-left: 20rpx;
					white-space: normal;
					font-size: 24rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}
			}
		}
		.item:last-child {
			margin-right: 0;
		}
	}
	.shipping {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		.title {
			display: flex;
			align-items: center;
			font-size: 28rpx;
			color: $dz-main-color;
		}
		.tip {
			font-size: 24rpx;
			color: $dz-tips-color;
			margin-top: 10rpx;
		}
	}
}
.trace {
	margin: 0 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
	height: auto;
	padding: 30rpx 30rpx 30rpx 60rpx;
}
.dz-node {
	width: 68rpx;
	height: 68rpx;
	border-radius: 100rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #d0d0d0;
}

.dz-order-title {
	color: $dz-main-color;
	font-weight: bold;
	font-size: 32rpx;
}

.dz-order-desc {
	margin-left: 20rpx;
	color: rgb(150, 150, 150);
	font-size: 28rpx;
	margin-bottom: 6rpx;
}

.dz-order-time {
	color: rgb(200, 200, 200);
	font-size: 26rpx;
}
</style>

<template>
	<view class="haggle-address">
		<dz-navbar :title="'选择收货地址'" :borderBottom="false">
			<template #right>
				<view @tap.stop="addAddress('add')"><dz-icon name="roundadd" size="44" style="margin-right: 30rpx"></dz-icon></view>
			</template>
		</dz-navbar>
		<view class="address-tab" v-if="showTab">
			<dz-tabs
				:list="tabData"
				:scrollable="false"
				:current="currentCateIndex"
				font-size="28"
				height="80"
				lineHeight="4"
				:activeStyle="{
					color: theme.dzBaseColor,
					fontSize: '32rpx',
					fontWeight: 'bold',
				}"
				:lineColor="theme.dzBaseColor"
				@change="tabsChange"
			></dz-tabs>
		</view>
		<view class="content" :style="{ marginTop: showTab ? '86rpx' : '0' }">
			<view class="address-box" v-show="currentCateIndex == 0">
				<view v-if="addressList.length > 0">
					<view class="list">
						<view
							class="row"
							:class="index != addressList.length - 1 ? 'dz-border-bottom' : ''"
							v-for="(row, index) in addressList"
							:key="index"
							@tap="submit(row, 'address')"
						>
							<view class="center">
								<view class="name-tel">
									<view class="dz-font-weight">{{ row.realname }}</view>
									<view class="tel">{{ row.mobile }}</view>
									<view class="default" :style="{ color: theme.dzBaseColor, borderColor: theme.dzBaseColor }" v-if="row.is_default == 1">
										{{ language.address.defaultAddress }}
									</view>
								</view>
								<view class="address">{{ row.address_name }} {{ row.address_details }}</view>
							</view>
							<view class="right">
								<dz-button
									:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
									hover-class="none"
									:border="false"
									size="mini"
									shape="circle"
									@click="submit(row, 'address')"
								>
									选择
								</dz-button>
							</view>
						</view>
					</view>
				</view>
				<view class="dz-ios-p-safe-bottom">
					<dz-loadmore v-if="loadingType == 'loading'" :status="loadingType" margin-top="20" magrin-bottom="20"></dz-loadmore>
				</view>
				<view v-if="loadingType == 'nodata'"
					><dz-empty :text="language.address.noAddress" marginTop="80" :src="emptyAddress" iconSize="360"></dz-empty
				></view>
			</view>
			<view v-show="currentCateIndex == 1">
				<view class="haggle-shop">
					<view
						class="shop-item"
						:class="index != pickupPoint.length - 1 ? 'dz-border-bottom' : ''"
						v-for="(item, index) in pickupPoint"
						:key="index"
						@tap="submit(item)"
					>
						<view class="item-left">
							<view class="shop-title">
								<text class="dz-font-weight">{{ item.name }}</text>
								<text class="moble">{{ item.mobile }}</text>
							</view>
							<view class="shop-address">
								<text class="dzicon-iconfont dzicon-round_location_fill dz-font-40 dz-m-r-10"></text>
								<text class="shop-tip">地址: {{ item.address_name }}{{ item.address }}</text>
							</view>
						</view>
						<view class="item-right" style="margin-left: 10rpx">
							<dz-button
								:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '90%' }"
								hover-class="none"
								:border="false"
								size="mini"
								shape="circle"
								@click="submit(item)"
							>
								选择
							</dz-button>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const tabData = [{ name: '选择地址' }, { name: '门店自提' }];
const emptyAddress = uni.$api.assetsConfig.emptyAddress;
const data = reactive({
	currentCateIndex: 0,
	page: 1,
	addressList: [],
	loadingType: 'loading',
	params: null,
	product: null,
	pickupPoint: [],
	showTab: false,
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '收货地址',
	});
	if (options.data) {
		data.params = JSON.parse(options.data);
	}
	data.product = options;
	getPickupPointIndex();
});

onShow(() => {
	data.page = 1;
	data.addressList = [];
	data.loadingType = 'loading';
	getAddress();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.loadingType = 'loading';
	data.addressList = [];
	getAddress();
});

onReachBottom(() => {
	if (data.loadingType === 'nomore') return;
	data.page++;
	getAddress();
});

async function submit(item, type) {
	let params = {};
	if (data.product) {
		params.haggle_id = JSON.parse(data.product.product).haggle_id;
	}
	if (type) {
		params.address_id = item.id;
		params.shipping_type = 1;
	}
	// 自提
	if (data.pickupPoint.length > 0 && !type) {
		params.shipping_type = 2;
		params.pickup_id = item.id;
	}
	await uni.$api.http
		.post(uni.$api.apiShop.haggleLaunchCreate, {
			type: data.params.type,
			sku_id: JSON.parse(data.params.data).sku_id,
			...params,
		})
		.then((res) => {
			uni.$api.router.redirectTo({
				route: uni.$api.routesConfig.haggleDetails,
				query: {
					id: res.data.id,
					source: 1,
				},
			});
		});
}
function tabsChange({ index }) {
	data.currentCateIndex = index;
	if (index === 0) {
		return;
	}
}
async function getAddress() {
	data.loadingType = 'loading';
	await uni.$api.http
		.get(uni.$api.apiMember.addressIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingType = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.addressList = [...data.addressList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingType = 'nodata';
			}
			uni.stopPullDownRefresh();
		})
		.catch(() => {
			uni.stopPullDownRefresh();
		});
}
function addAddress(type: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.addressUpdate,
		query: {
			type: type,
		},
	});
}
// 获取自提门店地址
function getPickupPointIndex() {
	uni.$api.http.get(uni.$api.apiShop.productPickupPointIndex).then((res) => {
		data.pickupPoint = res.data;
		if (data.pickupPoint.length > 0) {
			data.showTab = true;
		}
	});
}

const { showTab, currentCateIndex, addressList, loadingType, pickupPoint } = { ...toRefs(data) };
</script>

<style lang="scss">
.address-tab {
	width: 100%;
	position: fixed;
	z-index: 992;
}
.list {
	flex-wrap: wrap;
	.row {
		display: flex;
		width: 100%;
		padding: 20rpx 2%;
		background-color: #ffffff;
		.center {
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			padding-left: 10rpx;
			.name-tel {
				display: flex;
				width: 100%;
				align-items: baseline;
				.tel {
					margin-left: 20rpx;
					font-size: 24rpx;
				}

				.default {
					font-size: 22rpx;
					padding: 0 18rpx;
					border-radius: 24rpx;
					margin-left: 20rpx;
					border-width: 1rpx;
					border-style: solid;
				}
			}

			.address {
				width: 100%;
				padding: 10rpx 0;
				font-size: 24rpx;
				display: flex;
				line-height: 1.5;
				align-items: baseline;
				color: $dz-tips-color;
			}
		}
		.right {
			display: flex;
			align-items: center;
			margin-right: 10rpx;
		}
	}
}
.haggle-shop {
	.shop-item {
		padding: 20rpx 2%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #fff;
		.shop-title {
			color: $dz-main-color;
			font-size: 28rpx;
			.moble {
				margin-left: 20rpx;
				font-size: 24rpx;
			}
		}
		.shop-address {
			display: flex;
			align-items: center;
			margin-top: 10rpx;
			.shop-tip {
				font-size: 24rpx;
				color: $dz-tips-color;
			}
		}
	}
}
</style>

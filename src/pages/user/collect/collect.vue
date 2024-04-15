<template>
	<view>
		<dz-navbar :title="language.profile.myCollection"></dz-navbar>
		<view class="content" v-if="collectList.length > 0">
			<block v-for="(item, index) in collectList" :key="index">
				<view v-if="item.product" class="item" @tap="toProductDetail(item)">
					<view class="img">
						<view class="image"><dz-image :src="item.product.picture" :borderRadius="15" :width="180" :height="180"></dz-image></view>
						<!-- <view class="status" v-if="parseInt(item.product.product_status) == 0">{{ language.user.theShelves }}</view> -->
					</view>
					<view class="right">
						<view class="name">
							<view class="title">
								<dz-icon
									class="dz-m-r-10"
									:color="theme.dzBaseColor"
									name="memberDiscount"
									v-if="item.memberDiscount && item.memberDiscount.discount && item.memberDiscount.discount > 0"
								></dz-icon>
								{{ item.product.name }}
							</view>
							<view class="tip" v-if="item.marketing_type">
								<dz-tag :bg-color="theme.dzBaseColor" :color="theme.dzBaseFontColor" size="mini" mode="dark">{{
									marketingType(item.marketing_type)
								}}</dz-tag>
							</view>
						</view>
						<view class="price-box" :style="{ color: theme.dzBaseColor }">
							<view class="icon">{{ language.application.moneySymbol }}</view>
							<view class="price">{{ currentPrice(item) }}</view>
						</view>
					</view>
				</view>
			</block>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" :text="language.user.noCollection" margin-top="80" :src="empty" iconSize="360"></dz-empty>
		<view v-if="loadingStatus == 'loading'">
			<dz-loadmore :status="loadingStatus" :margin-top="20" :margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const empty = uni.$api.assetsConfig.empty;
const loadingStatus = ref<string>('loading');
const page = ref<number>(1);
const collectList = ref<array>([]);

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.profile.myCollection,
	});
	getCollectList();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getCollectList();
});

function getCollectList() {
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiMember.collectIndex, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			collectList.value = [...collectList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		});
}

// 计算价格
function currentPrice(item) {
	let price = item.product.minPriceSku.price;
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
		price = skus.length ? get_min(skus) : item.product.minPriceSku.price;
	}
	if (item.memberDiscount && parseFloat(item.memberDiscount.discount) > 0) {
		//会员折扣
		price = parseFloat(price * (1 - parseFloat(item.memberDiscount.discount) / 100)).toFixed(2);
	}
	return parseFloat(price).toFixed(2);
}

function get_min(list) {
	return Math.min.apply(
		Math,
		list.map((item) => {
			return parseFloat(item);
		})
	);
}

function marketingType(val) {
	let type;
	switch (val) {
		case 'haggle':
			type = language.user.haggle;
			break;
		case 'discount':
			type = language.user.discount;
			break;
		case 'wholesale':
			type = language.user.wholesale;
			break;
		case 'group_buy':
			type = language.user.group;
			break;
	}
	return type;
}

function toProductDetail(item) {
	if (parseInt(item.product.product_status) == 0) return uni.$api.toast(language.user.productTheShelves);
	let url;
	if (item.marketing_type) {
		if (item.marketing_type == 'group_buy') {
			url = 'groupProduct';
		} else {
			url = `${item.marketing_type}Product`;
		}
	} else {
		url = 'product';
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			id: item.product.minPriceSku.product_id,
		},
	});
}
</script>

<style lang="scss" scoped>
.item {
	display: flex;
	padding: 20rpx;
	background-color: #fff;
	border-bottom: 1rpx solid $dz-border-color;

	.img {
		flex-shrink: 0;
		width: 180rpx;
		height: 180rpx;
		border-radius: 15rpx;
		position: relative;
		overflow: hidden;

		.image {
			width: 180rpx;
			height: 180rpx;
			background-color: $dz-bg-color;
		}

		.status {
			position: absolute;
			width: 100%;
			padding: 10rpx 0;
			text-align: center;
			background-color: rgba(0, 0, 0, 0.6);
			bottom: 0;
			z-index: 2;
			font-size: 28rpx;
			color: #fff;
		}
	}

	.right {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-left: 20rpx;

		.name {
			.title {
				width: 510rpx;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
				font-size: 28rpx;
			}

			.tip {
				width: 510rpx;
				padding: 10rpx 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				font-size: 24rpx;
				color: $dz-tips-color;
			}
		}

		.price-box {
			display: flex;
			align-items: center;

			.icon {
				font-size: 24rpx;
			}

			.price {
				font-size: 32rpx;
			}
		}
	}
}

.item:last-child {
	border-bottom: 0px;
}
</style>

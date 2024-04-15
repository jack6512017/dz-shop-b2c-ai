<template>
	<view>
		<dz-navbar :title="language.user.footprintTitle"></dz-navbar>
		<view>
			<view v-for="(item, index) in footprintList" :key="index" class="content">
				<dz-swipe-action :index="index" :show="item.show" :key="item.id" :actions="actionOptions" @click="actionClick(item.id, index)" @open="open">
					<template #content>
						<view class="item" @tap="toProductDetail(item)">
							<view class="img">
								<view class="image"><dz-image :src="item.product.picture" :borderRadius="15" :width="180" :height="180"></dz-image></view>
								<view class="status" v-if="parseInt(item.product.product_status) == 0">{{ language.user.theShelves }}</view>
							</view>
							<view class="right">
								<view class="name">
									<view class="title-box">
										<dz-icon
											class="dz-m-r-10"
											:color="theme.dzBaseColor"
											name="memberDiscount"
											v-if="item.memberDiscount && item.memberDiscount.discount && item.memberDiscount.discount > 0"
										></dz-icon>
										<view class="title dz-line-2"> {{ item.product.name }}</view>
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
					</template>
				</dz-swipe-action>
			</view>
			<dz-empty v-if="loadingStatus == 'noData'" :text="language.user.record" :margin-top="80" :src="emptyFootprint" iconSize="360"></dz-empty>
			<view v-if="loadingStatus == 'loading'">
				<dz-loadmore :status="loadingStatus" :margin-top="20" :margin-bottom="20"></dz-loadmore>
			</view>
		</view>

		<dz-title v-if="guessYouLikeList.length" title="猜你喜欢" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
		<dz-product-list :list="guessYouLikeList" :topBottom="20" :leftRight="20"></dz-product-list>
		<dz-empty
			v-if="loadingStatus == 'noData' && loadingProductStatus == 'noData' && footprintList.length == 0"
			:margin-top="80"
			:src="empty"
			iconSize="360"
		></dz-empty>
		<view v-if="loadingStatus == 'noData' && loadingProductStatus == 'laoding' && footprintList.length == 0">
			<dz-loadmore :status="loadingProductStatus" :margin-top="20" :margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const emptyFootprint = uni.$api.assetsConfig.emptyFootprint;
const empty = uni.$api.assetsConfig.empty;
const page = ref<number>(1);
const loadingStatus = ref<string>('loading');
const footprintList = ref<array>([]);
const actionOptions = [
	{
		name: '删除',
		color: '#fff',
		fontsize: 30,
		width: 66,
		background: uni.$api.theme.dzTypeError,
	},
];
const loadingProductStatus = ref<string>('');
const guessYouLikeList = ref<array>([]);

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: uni.$api.language.user.footprintTitle });
	getFootprint();
});

onReachBottom(() => {
	if (footprintList.value.length > 0) {
		if (loadingStatus.value == 'nomore') return;
		page.value++;
		getFootprint();
	} else {
		if (loadingProductStatus.value == 'nomore') return;
		page.value++;
		getGuessYouLikeList();
	}
});

function getFootprint() {
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiMember.footprintIndex, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			res.data.forEach((item) => {
				item.show = false;
			});
			loadingStatus.value = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			footprintList.value = [...footprintList.value, ...res.data];
			if (page.value == 1 && res.data.length === 0) {
				loadingStatus.value = 'noData';
				getGuessYouLikeList();
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
}

// 计算价格
function currentPrice(item: any) {
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

function marketingType(val: string): string {
	let type;
	switch (val) {
		case 'haggle':
			type = language.user.haggle;
			break;
		case 'discount':
			type = language.user.discount;
			break;
		case 'join_buy':
			type = language.user.joinBuy;
			break;
		case 'group_buy':
			type = language.user.group;
			break;
	}
	return type;
}

function open(index: number) {
	footprintList.value[index].show = true;
	footprintList.value.map((val, key) => {
		if (index != key) footprintList.value[key].show = false;
	});
}

// 删除商品
function actionClick(id, index) {
	uni.$api.http
		.delete(
			uni.$api.apiMember.footprintDelete,
			{},
			{
				params: {
					id,
				},
			}
		)
		.then(() => {
			footprintList.value.splice(index, 1);
			uni.$api.toast(uni.$api.language.user.delProduct);
			if (footprintList.value.length == 0) {
				loadingStatus.value = 'noData';
				page.value = 1;
				getGuessYouLikeList();
			}
		});
}

function toProductDetail(item) {
	if (parseInt(item.product.product_status) == 0) return uni.$api.toast(uni.$api.language.user.productTheShelves);
	let url;
	if (item.marketing_type) {
		if (item.marketing_type == 'join_buy') {
			url = 'joinBuyProduct';
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

async function getGuessYouLikeList() {
	loadingProductStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingProductStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			guessYouLikeList.value = [...guessYouLikeList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingProductStatus.value = 'nodata';
			}
		})
		.catch((err) => {
			loadingProductStatus.value = 'loadmore';
			console.log(err);
		});
}
</script>

<style lang="scss" scoped>
.content {
	border-bottom: 1rpx solid $dz-border-color;
}

.item {
	display: flex;
	padding: 20rpx;
	background: #fff;
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
			.title-box {
				display: flex;
			}
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
</style>

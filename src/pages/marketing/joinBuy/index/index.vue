<template>
	<view>
		<dz-navbar input-align="center" :title="language.joinBuy.joinBuyTitle" class="navbar"></dz-navbar>
		<view class="content">
			<swiper :disable-touch="true" :autoplay="true" :vertical="true" circular class="dz-swiper" v-if="joinBuyGroupStateList.length > 0">
				<swiper-item class="dz-swiper-item" v-for="(item, index) in joinBuyGroupStateList" :key="index">
					<view class="notice">
						<image :src="item.member_head_portrait || missingFace"></image>
						<text>
							{{ item.member_nickname }}
							{{ api.formatString(language.joinBuy.groupPrice, item.price || item.product_money) }}{{ item.product_name }}
						</text>
					</view>
				</swiper-item>
			</swiper>
			<view v-if="advList.length > 0"
				><dz-swiper :list="advList" borderRadius="0" name="cover" height="320" img-mode="scaleToFill" @click="swiperClick"></dz-swiper
			></view>
			<view v-if="joinBuyGroupStateList.length && !advList.length" style="height: 100rpx"></view>
			<view v-if="joinBuyList.length" class="marketing-list">
				<view class="item" v-for="(item, index) in joinBuyList" :key="index" @tap="toGroup(item.product.id)">
					<view class="img"><dz-image :src="item.product.picture" width="220" height="220" borderRadius="15"></dz-image></view>
					<view class="right">
						<view>
							<view class="title dz-line-2 dz-m-b-6">{{ item.product.name }}</view>
							<dz-tag
								class="text"
								size="mini"
								:borderColor="theme.dzBaseColor"
								:color="theme.dzBaseColor"
								mode="plain"
								customStyle="padding: 2rpx 4rpx;"
							>
								{{ item.num }}{{ language.joinBuy.yesGroup }}
							</dz-tag>
						</view>
						<view class="price-box">
							<view class="price">
								<view :style="{ color: theme.dzBaseColor }">
									<text class="dz-font-24">{{ language.application.moneySymbol }}</text>
									<text class="dz-font-weight dz-font-36">{{ item.product.join_buy_price }}</text>
									<text class="market-price">
										{{ language.application.moneySymbol }}{{ item.product.market_price || item.product.price }}
									</text>
								</view>
							</view>
							<view>
								<dz-button
									:custom-style="{ width: '130rpx', height: '60rpx', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
									hover-class="none"
									size="medium"
									:border="false"
									shape="circle"
									@click="toGroup(item.product.id)"
								>
									{{ language.joinBuy.toJoinBuy }}
								</dz-button>
							</view>
						</view>
					</view>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" magrin-bottom="20"></dz-loadmore>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const empty = uni.$api.assetsConfig.empty;
const data = reactive({
	page: 1,
	loading: false,
	loadingStatus: 'loading',
	joinBuyList: [],
	joinBuyGroupStateList: [],
	advList: [],
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: language.joinBuy.joinBuyTitle });
	await getAdvList();
	await getWholesaleGroupState();
	await getWholesaleList();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.joinBuyList = [];
	data.joinBuyGroupStateList = [];
	getWholesaleGroupState();
	getWholesaleList();
});

onReachBottom(() => {
	if (data.loadingStatus === 'nomore') return;
	data.page++;
	getWholesaleList();
});

async function getWholesaleList() {
	if (data.loading) {
		return;
	}
	data.loading = true;
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.joinBuyProductIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loading = false;
			data.loadingStatus = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.joinBuyList = [...data.joinBuyList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loading = false;
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

async function getWholesaleGroupState() {
	await uni.$api.http
		.get(uni.$api.apiShop.joinBuyStateGroup, {
			params: {
				page: data.page,
				state: '0,1,2,3',
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			res.data.forEach((item) => {
				data.joinBuyGroupStateList.push(...item.list);
			});
		});
}
async function getAdvList() {
	await uni.$api.http
		.get(uni.$api.apiBase.advIndex, {
			params: {
				location: 'join_buy_top',
			},
		})
		.then((res) => {
			data.advList = res.data.join_buy_top;
		});
}

function swiperClick(index) {
	let item = data.advList[index];
	if (item.jump_type && item.jump_type == 'product_view' && uni.$api.isNumber(item.jump_link)) {
		toGroup(item.jump_link);
		return;
	}
	uni.$api.advNavigate(item.jump_type, item.jump_link, item.id);
}

// 去开团
function toGroup(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.joinBuyProduct,
		query: {
			id,
		},
	});
}

const { joinBuyGroupStateList, advList, joinBuyList, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.content {
	background-color: #f5f5f5;

	.dz-swiper {
		width: 100%;
		height: 100rpx;
		position: fixed;
		z-index: 99;
		background-color: rgba(0, 0, 0, 0.2);
	}

	.notice {
		width: 100%;
		height: 100rpx;

		display: flex;
		align-items: center;
		padding: 0 30rpx;

		image {
			flex-shrink: 0;
			width: 72rpx;
			height: 72rpx;
			border-radius: 50%;
			margin-right: 20rpx;
		}

		text {
			color: #ffffff;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.marketing-list {
		padding: 20rpx;

		.item {
			display: flex;
			background-color: #ffffff;
			border-radius: 20rpx;
			overflow: hidden;
			margin-bottom: 20rpx;
			padding: 20rpx;
			.img {
				width: 220rpx;
				height: 220rpx;
				border-radius: 15rpx;
				flex-shrink: 0;
			}

			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				margin-left: 20rpx;

				.title {
					font-size: 28rpx;
					color: $dz-main-color;
				}

				.text {
					font-size: 24rpx;
				}

				.price-box {
					display: flex;
					align-items: flex-end;
					justify-content: space-between;

					.price {
						.market-price {
							margin-left: 10rpx;
							font-size: 24rpx;
							color: $dz-tips-color;
							text-decoration: line-through;
						}
					}
				}
			}
		}
	}
}
</style>

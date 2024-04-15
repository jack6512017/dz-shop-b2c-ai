<template>
	<view
		class="three-line"
		:style="{
			margin: `${marginTop}rpx ${marginLeftRight - clearance / 2}rpx ${marginBottom - clearance}rpx`,
		}"
	>
		<dz-row>
			<dz-col v-for="(item, index) in list" :key="index" :gutter="clearance" :span="4">
				<view class="item dz-content-bg-color" :style="{ marginBottom: clearance + 'rpx' }" @tap="productTab(item.id)">
					<dz-image :src="item.picture" width="100%" :height="(width - marginLeftRight * 2 - clearance * 2) / 3"></dz-image>
					<view class="center-view">
						<view
							class="name dz-line-2 dz-font-24 dz-main-color"
							:style="{
								width: `${(width - marginLeftRight * 2 - clearance * 2) / 3 - 24}rpx`,
							}"
						>
							<dz-icon
								class="dz-m-r-10"
								:color="theme.dzBaseColor"
								name="memberDiscount"
								v-if="parseInt(item.is_open_member_discount) === 1"
							></dz-icon>
							{{ item.name }}
						</view>
						<view class="dz-line-1 dz-m-t-20">
							<text
								class="dz-font-24"
								:style="{ color: theme.dzBaseColor }"
								:class="[parseInt(item.point_exchange_type) > 2 ? '' : 'dz-font-price']"
							></text>
							<text class="dz-font-28 dz-font-weight" :style="{ color: theme.dzBaseColor }">
								{{
									parseInt(item.point_exchange_type) > 2
										? item.point_exchange + api.formatString(language.shopProductList.point, shopSetting.point_front_name)
										: currentPrice(item)
								}}
							</text>
							<text
								v-if="marketPriceShow == 1 && item.market_price"
								class="dz-tips-color"
								style="text-decoration: line-through; transform: scale(0.8)"
							>
								<text class="dz-font-24">￥</text>
								<text class="dz-font-24">{{ api.toFloat(item.market_price).toFixed(2) }}</text>
							</text>
						</view>
					</view>
				</view>
			</dz-col>
		</dz-row>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/state/modules/user';

// 获取系统状态栏的高度
let systemInfo = uni.getSystemInfoSync();

defineProps({
	// 商品
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 是否显示标签  比如: 分销商品,预售商品等
	isTag: {
		type: Boolean,
		default: false,
	},
	radius: {
		type: [String, Number],
		default: 0,
	},
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 0,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 0,
	},
	marginLeftRight: {
		type: [String, Number],
		default: 0,
	},
	dataSource: {
		type: String,
		default: 'default',
	},
	// 是否显示划线价格
	marketPriceShow: {
		type: [String, Number],
		default: 1,
	},
	// 井模式缝隙
	clearance: {
		type: Number,
		default: 12,
	},
});

const userStore = useUserStore();
const width = ref<number>(750);
const language = uni.$api.language;

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onMounted(() => {
	width.value = systemInfo && systemInfo.safeArea.windowWidth ? systemInfo.safeArea.windowWidth * 2 : 750;
});

// 计算价格
function currentPrice(item: any) {
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
		price = parseFloat(price * (1 - parseFloat(item.memberDiscount.discount) / 100));
	}
	return parseFloat(price).toFixed(2);
}

function get_min(list: array): array {
	return Math.min.apply(
		Math,
		list.map((item) => {
			return parseFloat(item);
		})
	);
}

function productTab(id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id: id,
		},
	});
}
</script>

<style lang="scss" scoped>
.cart {
	position: absolute;
	right: 20rpx;
	bottom: 20rpx;
	width: 52rpx;
	height: 52rpx;
}
.three-line {
	.item {
		overflow: hidden;
		border-radius: 18rpx;
		.center-view {
			padding: 6rpx 12rpx 12rpx;
			.name {
				height: 64rpx;
				line-height: 32rpx;
			}
		}
	}
}
</style>

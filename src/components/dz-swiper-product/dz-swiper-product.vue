<template>
	<view
		class="dz-swiper-box"
		:style="{
			backgroundColor: bgColor,
			margin: `${marginTop}px ${marginLeftRight}px ${marginBottom}px`,
		}"
	>
		<swiper :autoplay="false" :circular="true" :interval="interval" :style="[swiperHeight]">
			<swiper-item
				v-for="(item, index) in list"
				:key="index"
				:class="`dz-w-${parseInt(cardWidth) * 2} dz-p-r-${parseInt(config.clearance) * 2}`"
				@tap="productTab(item.id)"
			>
				<view class="carousel__item" :style="{ marginRight: config.clearance + 'px', borderRadius: config.radius + 'px' }">
					<view class="dz-relative">
						<dz-image
							:src="dataSource === 'manual' ? diyData(item, 'picture') : item.picture"
							:width="parseInt(cardWidth) * 2"
							:height="parseInt(config.height) * 2"
						/>
						<view
							v-if="dataSource === 'manual' && config.isTag == 1 && diyData(item, 'tag')"
							class="tag dz-flex dz-row-center dz-col-center"
							:style="[tagStyle]"
						>
							{{ diyData(item, 'tag') }}
						</view>
					</view>
					<view
						:style="{
							padding: `${config.contentStyle.top}px ${config.contentStyle.leftRight}px ${config.contentStyle.bottom}px`,
						}"
					>
						<view v-if="config.isName == 1" :style="[nameStyle]" :class="`dz-line-${config.nameStyle.line}`">
							{{ dataSource === 'manual' ? diyData(item, 'title') : item.name }}</view
						>
						<view
							v-if="config.isPrice"
							:style="{
								color: theme.dzBaseColor,
								marginTop: `${config.priceStyle.top}px`,
								textAlign: config.priceStyle.textAlign,
								fontSize: `${config.priceStyle.fontSize}px`,
							}"
						>
							<text style="transform: scale(0.8)" :class="[parseInt(item.point_exchange_type) > 2 ? '' : 'dz-font-price']"> </text>
							<text>
								{{
									parseInt(item.point_exchange_type) > 2
										? item.point_exchange + api.formatString(language.shopProductList.point, shopSetting.point_front_name)
										: currentPrice(item)
								}}
							</text>
							<text
								v-if="config.marketPriceShow == 1 && item.market_price && item.market_price != ''"
								style="text-decoration: line-through; transform: scale(0.8)"
							>
								<text class="dz-color-9">￥</text>
								<text class="dz-color-9">
									{{ parseFloat(item.market_price).toFixed(2) }}
								</text>
							</text>
						</view>
						<view v-if="config.isBtn" class="dz-flex dz-row-center dz-col-center" :style="[btnStyle]">立即购买</view>
					</view>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref, getCurrentInstance, onMounted } from 'vue';
import type { CSSProperties } from 'vue';
import { useUserStore } from '@/state/modules/user';

const props = defineProps({
	list: {
		type: Array,
		default() {
			return [
				{
					name: '商品',
					picture: '',
					price: '9.9',
					market_price: '99',
					total_sales: 1,
				},
			];
		},
	},
	defaultList: {
		type: Array,
		default() {
			return [];
		},
	},
	dataSource: {
		type: String,
		default: 'default',
	},
	// list的高度，单位px
	height: {
		type: [Number, String],
		default: 160,
	},
	// 是否自动播放
	autoplay: {
		type: Boolean,
		default: true,
	},
	// 自动轮播时间间隔，单位ms
	interval: {
		type: [Number, String],
		default: 500,
	},
	// 一屏显示多个商品
	col: {
		type: [Number, String],
		default: 2.5,
	},
	config: {
		type: Object,
		default: () => {},
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: 'transparent',
	},
	// 上边距
	marginTop: {
		type: [Number, String],
		default: 0,
	},
	//下边距
	marginBottom: {
		type: [Number, String],
		default: 0,
	},
	// 左右边距
	marginLeftRight: {
		type: [Number, String],
		default: 0,
	},
});

const userStore = useUserStore();
const proxy = getCurrentInstance()?.proxy ?? null;
const height = ref<number>(0);

const cardWidth = computed(() => {
	return (375 - props.marginLeftRight * 2) / parseFloat(props.col);
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const swiperHeight = computed((): CSSProperties => {
	const style = {};

	if (Object.keys(props.config).length !== 0) {
		style.height = `${height.value}px`;
	}

	return style;
});

onMounted(async () => {
	const carousel = await getSize('carousel__item');
	height.value = carousel.height;
});

// 获取导航菜单的尺寸
function getSize(el) {
	return new Promise((resolve) => {
		uni.$api.getRect(`.${el}`, false, proxy).then((size) => {
			resolve(size);
		});
	});
}

const nameStyle = computed((): CSSProperties => {
	const style = {};
	if (Object.keys(props.config).length !== 0) {
		style.color = props.config.nameStyle.color;
		style.fontSize = `${props.config.nameStyle.fontSize}px`;
		style.lineHeight = `${props.config.nameStyle.lineHeight}px`;
		style.textAlign = props.config.nameStyle.textAlign;
		style.height = `${props.config.nameStyle.lineHeight * props.config.nameStyle.line}px`;
	}

	return style;
});

const tagStyle = computed((): CSSProperties => {
	const style = {};
	if (Object.keys(props.config).length !== 0) {
		style.color = props.config.tagStyle.color;
		style.fontSize = `${props.config.tagStyle.fontSize}px`;
		style.width = `${props.config.tagStyle.width}px`;
		style.height = `${props.config.tagStyle.height}px`;
		style.borderRadius = `${props.config.tagStyle.radius}px`;
		style.backgroundColor = props.config.tagStyle.backgroundColor;
	}

	return style;
});

const btnStyle = computed((): CSSProperties => {
	const style = {};
	if (Object.keys(props.config).length !== 0) {
		style.color = props.config.btnStyle.color;
		style.fontSize = `${props.config.btnStyle.fontSize}px`;
		style.width = `100%`;
		style.height = `${props.config.btnStyle.height}px`;
		style.marginTop = `${props.config.btnStyle.top}px`;
		style.borderRadius = `${props.config.btnStyle.radius}px`;
		style.backgroundColor = props.config.btnStyle.backgroundColor;
	}

	return style;
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

function diyData(item: any, key: string): string {
	let value = '';
	if (props.defaultList.length) {
		const findItem = props.defaultList.find((v) => v.id == item.id);
		switch (key) {
			case 'picture':
				value = findItem.diyPicture ? findItem.diyPicture : item.picture;
				break;
			case 'title':
				value = findItem.diyName ? findItem.diyName : item.name;
				break;
			case 'tag':
				value = findItem.diyTag ? findItem.diyTag : '';
				break;
		}
	}
	return value;
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

<script lang="ts">
export default { options: { virtualHost: true } };
</script>

<style lang="scss" scoped>
.carousel__item {
	position: relative;
	width: 100%;
	background-color: #fff;
	border-radius: 10px;
	transition: all 800ms cubic-bezier(0.39, 0.575, 0.565, 1) 0s;
	overflow: hidden;
}

.tag {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	bottom: 5px;
}
</style>

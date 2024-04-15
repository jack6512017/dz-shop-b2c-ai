<template>
	<view :style="{ padding: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx` }">
		<view class="coupon">
			<scroll-view scroll-x class="scroll-coupon dz-relative" style="height: 218rpx">
				<view v-for="(item, index) in list" :key="index" class="coupon-item" @tap="onCoupon(index, item)">
					<view class="content dz-col-center dz-row-center dz-flex-col dz-relative">
						<view class="decorate left"></view>
						<view class="decorate right"></view>
						<view class="price" :style="{ fontSize: `${priceSize}rpx` }">
							<text v-if="item.type == 2"> {{ parseInt(item.discount) / 10 }}折 </text>
							<text v-else><text class="dz-font-price dz-font-24"></text>{{ item.money }}</text></view
						>
						<view class="tip" :style="{ fontSize: `${tipSize}rpx` }">满{{ item.at_least }}可用</view>
					</view>
					<view
						class="btn"
						:style="{
							opacity:
								parseInt(item.is_get) == 0 && item.myGet && parseInt(item.max_fetch) > 0 && parseInt(item.max_fetch) == item.myGet.count
									? '0.4'
									: '0.7',
						}"
					>
						{{
							parseInt(item.is_get) == 0 && item.myGet && parseInt(item.max_fetch) > 0 && parseInt(item.max_fetch) == item.myGet.count
								? '已领取'
								: '立即领取'
						}}</view
					>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
defineProps({
	list: {
		type: Array,
		default: () => [],
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '#e22b48',
	},
	// 副色
	deputyColor: {
		type: String,
		default: '#fff3ea',
	},
	// 主字体大小
	priceSize: {
		type: [String, Number],
		default: 48,
	},
	// 主字体颜色
	priceColor: {
		type: String,
		default: '#e22b48',
	},
	// 附字体大小
	tipSize: {
		type: [String, Number],
		default: 24,
	},
	// 附字体颜色
	tipColor: {
		type: String,
		default: '#333',
	},
	// 按钮背景颜色
	btnBgColor: {
		type: String,
		default: '#f092a7',
	},
	// 按钮字体颜色
	btnColor: {
		type: String,
		default: '#fff',
	},
	// 四边圆角
	borderRadius: {
		type: [String, Number],
		default: 24,
	},
	// 左右边距
	marginLeftRight: {
		type: [String, Number],
		default: 20,
	},
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 0,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 20,
	},
});

const emit = defineEmits('click');
function toPage(path) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[path],
	});
}

function onCoupon(index, item: object) {
	if (!userStore.hasLogin) toPage('login');
	if (parseInt(item.is_get) == 0 && item.myGet && parseInt(item.max_fetch) == item.myGet.count) return;
	emit('click', { index, item });
}
</script>

<style lang="scss" scoped>
.coupon {
	.scroll-coupon {
		white-space: nowrap; /*实现子元素不换行*/
	}
	.price {
		font-size: 28px;
		font-weight: 700;
		color: rgb(113, 48, 9);
	}
	.tip {
		color: rgb(113, 48, 9);
	}
}

.coupon {
	.coupon-item {
		display: inline-block;
		width: 232rpx;
		margin-right: 24rpx;
		border-radius: 20rpx;
		background-image: linear-gradient(4.71239rad, rgb(255, 225, 206), rgb(255, 240, 229));
		.content {
			width: 232rpx;
			height: 132rpx;
			text-align: center;
			border-radius: 24rpx;
		}
		.decorate {
			position: absolute;
			bottom: 10rpx;
			width: 16rpx;
			height: 16rpx;
			border-radius: 50%;
			background: #fff;
		}
		.left {
			left: -8rpx;
		}
		.right {
			right: -8rpx;
		}

		.btn {
			width: 180rpx;
			height: 56rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 10rpx auto 20rpx;
			color: #c45f23;
			background-color: rgb(255, 255, 255);
			border-radius: 28rpx;
		}
	}
	.coupon-item:last-child {
		margin-right: 0rpx !important;
	}
}
.more {
	padding: 6rpx 15rpx;
	background: #fff;
}
</style>

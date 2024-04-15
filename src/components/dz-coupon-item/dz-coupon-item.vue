<template>
	<view class="item" :style="[api.addStyle(customStyle)]" @tap="handleClick()">
		<view class="item-content">
			<view class="decorate top"></view>
			<view class="decorate bottom"></view>
			<view class="dz-coupon-item-left">
				<view class="money">
					<view class="money-l" :style="{ color: theme.dzBaseColor }" v-if="parseInt(coupon.type) === 1">
						<text style="font-size: 30rpx; font-weight: 400">{{ language.application.moneySymbol }}</text>
						<text class="price">{{ coupon.money }}</text>
					</view>
					<view class="money-l" :style="{ color: theme.dzBaseColor }" v-if="parseInt(coupon.type) === 2">
						<text class="price">{{ coupon.discount / 10 }}</text>
						<text style="font-size: 30rpx; font-weight: 400">{{ language.orderCreate.discount }}券</text>
					</view>
				</view>
				<view v-if="coupon.usableProduct && coupon.usableProduct.length == 0 && parseFloat(coupon.at_least) == 0">{{
					language.coupon.noThreshold
				}}</view>
				<view v-else-if="coupon.usableProduct && coupon.usableProduct.length > 0 && parseFloat(coupon.at_least) == 0">{{
					language.coupon.someGoodsAvailable
				}}</view>
				<view v-else class="dz-coupon-intro">{{ api.formatString(language.product.couponCondition, coupon.at_least) }}</view>
			</view>
			<view class="line"></view>
			<view class="dz-coupon-item-right">
				<view class="left">
					<view class="top">
						<view class="name">
							<view class="text">{{ coupon.title }}</view>
						</view>
						<view v-if="isButton" class="btn">
							<slot v-if="$slots.checkbox" name="checkbox"> </slot>
							<dz-button
								v-else
								:custom-style="{
									width: '136rpx',
									background:
										parseInt(coupon.is_get) == 0 &&
										coupon.myGet &&
										parseInt(coupon.max_fetch) > 0 &&
										parseInt(coupon.max_fetch) == coupon.myGet.count
											? '#f3f4f6'
											: theme.dzBaseColor,
									color: theme.dzBaseFontColor,
								}"
								:disabled="parseInt(coupon.is_get) == 0 && coupon.myGet && parseInt(coupon.max_fetch) == coupon.myGet.count"
								hover-class="none"
								size="mini"
								shape="circle"
								:border="false"
								@click="handleClick()"
							>
								{{
									parseInt(coupon.is_get) == 0 &&
									coupon.myGet &&
									parseInt(coupon.max_fetch) > 0 &&
									parseInt(coupon.max_fetch) == coupon.myGet.count
										? '已领取'
										: language.product.couponGet
								}}
							</dz-button>
						</view>
					</view>
					<view class="dz-rule-box">
						<text class="dz-coupon-text">{{
							(coupon.coupon && parseInt(coupon.coupon.range_type) === 1) || parseInt(coupon.range_type) == 1 ? '全场商品可用' : '部分商品可用'
						}}</text>
					</view>
					<view class="dz-rule-box">
						<view class="dz-coupon-text">
							<text v-if="parseInt(coupon.term_of_validity_type) === 1">{{
								api.formatString(language.product.couponValidity, coupon.fixed_term)
							}}</text>
							<text v-else> 有效期至 {{ api.timeFormat(coupon.end_time) }} </text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view
			class="tips"
			:style="{
				background: theme.dzBaseDisabled,
				color: theme.dzBaseFontColor,
			}"
		>
			{{ coupon.remark || coupon.coupon.remark }}
		</view>
	</view>
</template>

<script lang="ts">
export default { options: { virtualHost: true } };
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { useUserStore } from '@/state/modules/user';

const props = defineProps({
	coupon: {
		type: Object,
		default: () => {},
	},
	isButton: {
		type: Boolean,
		default: false,
	},
	customStyle: {
		type: [Object, String],
		default: () => ({}),
	},
});

const emit = defineEmits(['click']);

const language = uni.$api.language;
const userStore = useUserStore();

const theme = computed(() => {
	return userStore.getTheme;
});

function handleClick() {
	if (!props.isButton) return;
	emit('click', props.coupon);
}
</script>

<style lang="scss" scoped>
.item {
	position: relative;
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
}
.item-content {
	width: 100%;
	min-height: 180rpx;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	overflow: hidden;
	border-radius: 20rpx;
	.dz-coupon-bg {
		width: 100%;
		height: 180rpx;
		position: absolute;
		left: 0;
		top: 0;
		z-index: 1;
	}
	.decorate {
		position: absolute;
		left: 209rpx;
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: #f5f5f5;
	}
	.top {
		top: -10rpx;
	}
	.bottom {
		bottom: -10rpx;
	}

	.line {
		height: 190rpx;
		border-right: 3rpx dashed #f5f5f5;
	}
	.dz-coupon-item-left {
		width: 218rpx;
		height: 180rpx;
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
		.money {
			display: flex;
			align-items: center;
			justify-content: center;
			.money-l {
				font-size: 58rpx;
				font-weight: bold;
			}
		}
		.dz-coupon-intro {
			padding: 8rpx 10rpx;
			font-size: 26rpx;
			line-height: 26rpx;
			font-weight: 400;
			margin-top: 18rpx;
			border-radius: 6rpx;
		}
	}
	.dz-coupon-item-right {
		flex: 1;
		height: 180rpx;
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		padding: 0 24rpx;
		box-sizing: border-box;
		overflow: hidden;
		.left {
			width: 100%;
			.top {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			.name {
				display: flex;
				margin-bottom: 30rpx;
				font-size: 28rpx;
				.dz-coupon-tip {
					width: 60rpx;
					height: 38rpx;
					font-size: 25rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					transform: scale(0.9);
					transform-origin: 0 center;
					border-radius: 4rpx;
					flex-shrink: 0;
				}
			}
			.coupon-tip,
			.time {
				font-size: 24rpx;
			}
			.dz-rule-box {
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 24rpx;
				transform-origin: 0 100%;
			}

			.dz-padding-btm {
				padding-bottom: 6rpx;
			}
		}
		.btn {
			flex-shrink: 0;
			width: 128rpx;
		}
	}
}
.tips {
	padding: 15rpx;
	font-size: 24rpx;
}
</style>

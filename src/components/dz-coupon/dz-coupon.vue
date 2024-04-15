<template>
	<view :style="{ padding: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx` }">
		<!-- 横 -->
		<view v-if="mode == 'card'" class="coupon-1">
			<scroll-view scroll-x class="scroll-coupon dz-relative" style="height: 140rpx">
				<block v-for="(item, index) in list" :key="index">
					<view class="coupon-item" :style="{ background: bgColor, borderRadius: `${borderRadius}rpx` }" @tap="onCoupon(item)">
						<view class="dz-flex">
							<view
								class="left dz-col-center dz-row-center dz-flex-col"
								:style="{
									background: deputyColor,
									borderRadius: `${borderRadius}rpx`,
								}"
							>
								<view class="price" :style="{ fontSize: `${priceSize}rpx`, color: priceColor }">
									<text v-if="item.type == 2"> {{ parseInt(item.discount) / 10 }}折 </text>
									<text v-else>{{ item.money }}</text>
								</view>
								<view class="tip" :style="{ fontSize: `${tipSize}rpx`, color: tipColor }">{{ item.title }}</view>
							</view>
							<view class="right dz-col-center dz-row-center dz-flex-col">
								<view>立即</view>
								<view>领取</view>
							</view>
						</view>
					</view>
				</block>
				<view class="dz-inline-block" v-if="list.length > 6">
					<view
						class="dz-absolute dz-font-12 more dz-col-center dz-row-center dz-flex-col"
						style="top: 0px; height: 140rpx"
						:style="{ borderRadius: `${borderRadius}rpx` }"
						@tap="toPage('couponList')"
					>
						<dz-icon name="roundright" size="40" color="#333"></dz-icon>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 竖 -->
		<view v-if="mode == 'button'" class="coupon-2">
			<scroll-view scroll-x class="scroll-coupon dz-relative" style="height: 258rpx">
				<view
					v-for="(item, index) in list"
					:key="index"
					class="coupon-item-2"
					:style="{ background: bgColor, borderRadius: `${borderRadius}rpx` }"
					@tap="onCoupon(item)"
				>
					<view class="content dz-col-center dz-row-center dz-flex-col" :style="{ background: deputyColor, borderRadius: `${borderRadius}rpx` }">
						<view class="price" :style="{ fontSize: `${priceSize}rpx`, color: priceColor }">
							<text v-if="item.type == 2"> {{ parseInt(item.discount) / 10 }}折 </text>
							<text v-else>{{ item.money }}</text></view
						>
						<view class="tip" :style="{ fontSize: `${tipSize}rpx`, color: tipColor }">{{ item.title }}</view>
					</view>
					<view class="btn" :style="{ background: btnBgColor, color: btnColor }">立即领取</view>
				</view>
				<view class="dz-inline-block" v-if="list.length > 6">
					<view
						class="dz-absolute dz-font-12 more dz-col-center dz-row-center dz-flex-col"
						style="top: 0px; height: 258rpx"
						:style="{ borderRadius: `${borderRadius}rpx` }"
						@tap="toPage('couponList')"
					>
						<view>查</view>
						<view>看</view>
						<view>更</view>
						<view>多</view>
						<dz-icon name="roundright" size="28" color="#333"></dz-icon>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
defineProps({
	list: {
		type: Array,
		default: () => [],
	},
	// 模式选择
	mode: {
		type: String,
		default: 'card',
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
		default: 56,
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
});

const isLoading = ref<boolean>(false);

function toPage(path) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[path],
	});
}

function onCoupon(item: object) {
	if (!userStore.hasLogin) toPage('login');
	if (isLoading.value) return;
	isLoading.value = true;
	uni.$api.http
		.post(uni.$api.apiShop.couponCreate, {
			id: item.id,
		})
		.then(() => {
			uni.$api.toast(uni.$api.language.product.couponGetSuccess);
		})
		.finally(() => {
			isLoading.value = false;
		});
}
</script>

<style lang="scss" scoped>
.coupon-1,
.coupon-2 {
	.scroll-coupon {
		white-space: nowrap; /*实现子元素不换行*/
	}
	.price {
		font-size: 28px;
		font-weight: 700;
		color: #e22b48;
	}
	.tip {
		color: #333;
	}
}
.coupon-1 {
	.coupon-item {
		display: inline-block;
		width: 340rpx;
		height: 140rpx;
		margin-right: 20rpx;
		color: #fff;
		background: #e22b48;
		border-radius: 20rpx;
		.left {
			width: 220rpx;
			height: 140rpx;
			color: #e22b48;
			background: #fff3ea;
			border-radius: 20rpx;
		}
		.right {
			flex: 1;
			font-size: 32rpx;
		}
	}
}
.coupon-2 {
	.coupon-item-2 {
		display: inline-block;
		width: 232rpx;
		margin-right: 24rpx;
		border-radius: 20rpx;
		.content {
			width: 232rpx;
			height: 152rpx;
			text-align: center;
			background: #fff3ea;
			border-radius: 24rpx;
		}
		.btn {
			width: 184rpx;
			height: 56rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			margin: 30rpx auto 20rpx;
			color: #fff;
			background: #f092a7;
			border-radius: 28rpx 28rpx 28rpx 0;
		}
	}
}
.more {
	padding: 6rpx 15rpx;
	background: #fff;
}
</style>

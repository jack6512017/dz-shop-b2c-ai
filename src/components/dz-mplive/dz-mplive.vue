<template>
	<view
		:style="{
			margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
			backgroundColor: isDark ? 'rgb(20, 20, 21)' : bgColor,
			borderRadius: `${borderRadius}rpx`,
			overflow: 'hidden',
		}"
	>
		<view v-if="list.length > 0 && propsConfig.styleGroup == 'oneLine'" style="position: relative" @tap="liveIndexClick">
			<dz-image :src="list[0] && list[0].cover" :height="320"></dz-image>
			<view
				class="tag dz-flex"
				:style="{
					background: parseInt(list[0].live_status) === 102 ? api.theme.ysBaseDisabled : 'rgba(0, 0, 0, 0.5)',
				}"
			>
				<dz-loading v-if="parseInt(list[0].live_status) === 101" mode="loading-7"></dz-loading>
				<text v-if="parseInt(list[0].live_status) === 101" class="dz-m-l-6">直播中</text>
				<text v-if="parseInt(list[0].live_status) === 102" class="dz-m-l-6">预告</text>
				<text v-if="parseInt(list[0].live_status) === 103" class="dz-m-l-6">已结束</text>
			</view>
			<view class="user-info">
				<view class="dz-line-2 dz-m-b-6">{{ list[0].name }}</view>
				<view>直播时间: {{ api.timeFormat(list[0].start_time, 'mm-dd hh:MM') }}</view>
			</view>
		</view>
		<view v-else class="mplive">
			<dz-cell-item
				v-if="propsConfig.titleShow == 1"
				:title="propsConfig.title"
				:icon="propsConfig.coverShow == 1 ? propsConfig.titleCover : ''"
				:iconSize="propsConfig.coverSize * 2"
				:borderBottom="false"
				hover-class="none"
				:value="propsConfig.titleRight"
				:bgColor="isDark ? 'rgb(20, 20, 21)' : bgColor"
				:title-style="{
					fontSize: `${propsConfig.titleSize * 2}rpx`,
					fontWeight: propsConfig.isBold == 1 ? 'bold' : '500',
					color: isDark ? '#fff' : propsConfig.titleColor,
				}"
				:value-style="{
					fontSize: `${propsConfig.titleRightSize * 2}rpx`,
					color: isDark ? '#909399' : propsConfig.titleRightColor,
				}"
				:rightColor="isDark ? '#909399' : propsConfig.titleRightColor"
				:rightSize="propsConfig.titleRightSize * 2"
				@click="liveIndexClick"
			></dz-cell-item>
			<scroll-view scroll-x class="h-list" :class="[list.length === 0 ? 'dz-box-shadow' : '', propsConfig.titleShow == 0 ? 'dz-m-t-10' : '']">
				<view class="h-item" v-for="(item, index) in list" :key="index" @tap.stop="productTab(item)">
					<view class="img-box">
						<view class="h-item-img"><dz-image :src="item.cover" :width="192" :height="192" borderRadius="15"></dz-image></view>
						<view v-if="item.live_status == '101'" class="status dz-flex dz-row-center">
							<view><dz-loading mode="loading-7"></dz-loading></view>
							<text class="dz-m-l-8">直播中</text>
						</view>
						<view v-if="item.live_status == '102'" class="status">直播时间: {{ api.timeFormat(item.start_time, 'hh:MM') }}</view>
						<view v-if="item.live_status == '103'" class="status">已结束</view>
						<view
							v-if="parseInt(item.live_status) === 102"
							class="tip"
							:style="{
								background: api.theme.ysBaseColor,
								color: api.theme.ysBaseFontColor,
							}"
						>
							预告 {{ api.timeFormat(item.start_time, 'hh:MM') }}
						</view>
					</view>
					<view class="title dz-line-1">{{ item.name }}</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script lang="ts" setup>
defineProps({
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	// 背景颜色
	bgColor: {
		type: String,
		default: '#fff',
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
	// 圆角
	borderRadius: {
		type: [Number, String],
		default: 12,
	},
	propsConfig: {
		type: Object,
		default() {
			return {};
		},
	},
});

//直播首页
function liveIndexClick() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.miniProgramLive,
	});
}
//直播房间
function liveTap(roomId) {
	uni.$api.shop.liveNavigate(roomId);
}
</script>

<style lang="scss" scoped>
.tag {
	position: absolute;
	top: 20rpx;
	left: 20rpx;
	height: 52rpx;
	padding: 0 12rpx;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 26rpx 26rpx 26rpx 0;
	font-size: 28rpx;
}
.user-info {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: 14rpx 20rpx;
	color: #fff;
	font-size: 28rpx;
	background-color: rgba(0, 0, 0, 0.5);
}
.mplive {
	.h-list {
		padding: 0 10rpx;
		margin-top: -20rpx;
		background-color: #ffffff;
		white-space: nowrap;
		.h-item {
			margin: 10rpx 10rpx 10rpx 10rpx;
			padding: 10rpx 0 5rpx;
			display: inline-block;
			background-color: #ffffff;
			font-size: 22rpx;
			width: 192rpx;
			border-radius: 6rpx;
			.h-item-img {
				display: inline-block;
				width: 192rpx;
				height: 192rpx;
				border-radius: 15rpx;
				overflow: hidden;
				border-bottom: 1rpx solid rgba(0, 0, 0, 0.01);
			}
			.img-box {
				width: 100%;
				position: relative;
				width: 192rpx;
				height: 192rpx;
				border-radius: 15rpx;
				overflow: hidden;
				.status {
					position: absolute;
					bottom: 0;
					width: 100%;
					padding: 10rpx 0;
					text-align: center;
					background-color: rgba(0, 0, 0, 0.4);
					z-index: 2;
					font-size: 24rpx;
					color: #fff;
				}
				.tip {
					position: absolute;
					left: 0;
					top: 0;
					padding: 4rpx 8rpx;
					font-size: 24rpx;
					border-radius: 0 0 15rpx 0;
				}
			}
			.title {
				width: 192rpx;
				white-space: normal;
				line-height: 28rpx;
				font-size: 22rpx;
				padding: 0 10rpx;
				margin: 10rpx 0;
				color: $dz-main-color;
			}
		}
	}
}
</style>

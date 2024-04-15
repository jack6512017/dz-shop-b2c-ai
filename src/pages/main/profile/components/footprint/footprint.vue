<template>
	<view
		:style="{
			padding: `${parseInt(config.props.marginTop) * 2}rpx ${parseInt(config.props.marginLeftRight) * 2}rpx ${
				parseInt(config.props.marginBottom) * 2
			}rpx`,
		}"
	>
		<view
			class="dz-footprint"
			:style="{
				backgroundColor: config.props.bgColor,
				borderRadius: parseInt(config.props.borderRadius) * 2 + 'rpx',
			}"
		>
			<dz-cell-item
				v-if="config.props.isCellItem == 1"
				:title="config.props.title"
				:value="config.props.value"
				:arrow="config.props.arrow == 1 ? true : false"
				:title-style="{
					'font-size': parseInt(config.props.fontSize) * 2 + 'rpx',
					color: '#333',
					'font-weight': config.props.isBold == 1 ? '700' : '500',
				}"
				:border-bottom="false"
				hover-class="none"
				@click="click('footprint')"
			></dz-cell-item>
			<view style="margin-top: -20rpx">
				<scroll-view scroll-x class="h-list-history" v-if="list.length > 0">
					<view class="h-item-history dz-tips-color" v-for="item in list" :key="item.id" @tap.stop="navToProduct(item, item.product.id)">
						<view class="h-item-img dz-bg-color"
							><dz-image :src="item.product.picture" :borderRadius="12" :width="180" :height="180" mode="aspectFill"></dz-image
						></view>
						<image v-if="item.marketing_type" class="tag" :src="marketingTypeTag(item.marketing_type)" mode="aspectFill"></image>
						<view class="h-item-text dz-main-color">{{ item.product.name }}</view>
					</view>
				</scroll-view>
				<view class="no-foot-print" v-else-if="list.length === 0" @tap="click('productList')">
					<dz-icon name="footprint" size="46"></dz-icon>
					<text class="dz-m-l-20">{{ api.language.profile.goShopping }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import $mAssetsConfig from '@/core/config/assetsConfig';

defineProps({
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	config: {
		type: Object,
		default() {
			return {};
		},
	},
});

const emit = defineEmits(['click']);

function marketingTypeTag(marketingType: string): string {
	let tag;
	switch (marketingType) {
		case 'discount':
			tag = $mAssetsConfig.discountTag;
			break;
		case 'haggle':
			tag = $mAssetsConfig.haggleTag;
			break;
		case 'join_buy':
			tag = $mAssetsConfig.joinBuyTag;
			break;
		case 'limited':
			tag = $mAssetsConfig.limitedBuyTag;
			break;
	}
	return tag;
}

function click(path) {
	emit('click', path);
}

function navToProduct(type, id) {
	if (parseInt(type.product.product_status) == 0) return uni.$api.toast(uni.$api.language.user.productTheShelves);
	let url;
	if (type.marketing_type) {
		if (type.marketing_type == 'join_buy') {
			url = 'joinBuyProduct';
		} else {
			url = `${type.marketing_type}Product`;
		}
	} else {
		url = 'product';
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			id: id,
		},
	});
}
</script>

<style lang="scss" scoped>
.dz-footprint {
	overflow: hidden;
}
.h-list-history {
	margin: 0;
	padding-left: 20rpx;
	border-radius: 10rpx;
	white-space: nowrap;
	.h-item-history {
		display: inline-block;
		font-size: 24rpx;
		width: 180rpx;
		margin: 20rpx 20rpx 0 0;
		border-radius: 10upx;
		position: relative;
		top: 0;
		overflow: hidden;
		.h-item-img {
			width: 100%;
			height: 180rpx;
			border-radius: 12rpx;
		}
		.tag {
			position: absolute;
			border-top-left-radius: 12rpx;
			top: 0;
			left: 0;
			width: 60rpx;
			height: 60rpx;
		}
		.h-item-text {
			display: flex;
			white-space: normal;
			width: 170rpx;
			height: 52rpx;
			line-height: 26rpx;
			font-size: 20rpx;
			margin: 10rpx 6rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}
	}
}
.no-foot-print {
	text-align: center;
	padding: 48rpx 0;
}
</style>

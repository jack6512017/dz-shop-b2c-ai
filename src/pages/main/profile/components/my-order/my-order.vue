<template>
	<view
		:style="{
			padding: `${parseInt(config.props.marginTop) * 2}rpx ${parseInt(config.props.marginLeftRight) * 2}rpx ${
				parseInt(config.props.marginBottom) * 2
			}rpx`,
		}"
	>
		<view
			class="dz-my-order"
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
				@tap="myOrder(1)"
			></dz-cell-item>
			<view :style="{ marginTop: `-${parseInt(config.props.menuPushTop) * 2}rpx` }">
				<dz-grid :border="false" col="5" style="margin-top: -20rpx">
					<block v-for="(item, index) in config.props.list" :key="index">
						<dz-grid-item v-if="item.checked" @tap="toLinkJump(item)" customStyle="padding-top: 15px; padding-bottom: 15px">
							<dz-image
								v-if="item.cover"
								:src="item.cover"
								:borderRadius="parseInt(config.props.menuRadius) * 2"
								:width="parseInt(config.props.widthHeight) * 2"
								:height="parseInt(config.props.widthHeight) * 2"
								mode="widthFix"
							></dz-image>
							<dz-icon v-else :name="item.icon" :size="parseInt(config.props.widthHeight) * 2"></dz-icon>
							<dz-badge
								v-if="hasLogin"
								:offset="[20, 25]"
								:count="userInfo.order_synthesize_num[item.order_synthesize_key]"
								:color="config.props.badegColor"
								:bgColor="config.props.badegBgColor"
								style="padding: 8rpx 12rpx"
							></dz-badge>
							<view v-if="config.props.isName == 1" class="dz-m-t-6 dz-font-sm dz-main-color">{{ item.title }}</view>
						</dz-grid-item>
					</block>
				</dz-grid>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

defineProps({
	config: {
		type: Object,
		default() {
			return {};
		},
	},
	userInfo: {
		type: Object,
		default() {
			return {};
		},
	},
	hasLogin: {
		type: Boolean,
		default() {
			return {};
		},
	},
});

function myOrder(val) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderIndex,
		query: {
			status: val,
		},
	});
}

function toLinkJump(item) {
	uni.$api.shop.linkJump(item);
}
</script>

<style lang="scss" scoped>
.dz-my-order {
	overflow: hidden;
	position: relative;
}
</style>

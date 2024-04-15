<template>
	<view
		:style="{
			padding: `${parseInt(config.props.marginTop) * 2}rpx ${parseInt(config.props.marginLeftRight) * 2}rpx ${
				parseInt(config.props.marginBottom) * 2
			}rpx`,
		}"
	>
		<view
			class="dz-statistics-meun"
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
				hoverClass="none"
			></dz-cell-item>
			<dz-grid
				:style="{
					marginTop: `-${parseInt(config.props.paddingPushTop) * 2}rpx`,
				}"
				:col="config.props.col"
				v-if="hasLogin"
			>
				<block v-for="(item, index) in config.props.list" :key="index">
					<dz-grid-item v-if="item.checked" customStyle="padding-top: 15px; padding-bottom: 15px">
						<view class="dz-text-center" :style="{ color: config.props.color }" @tap.stop="click(item.path)">
							<view
								class="dz-font-weight"
								:class="item.path == 'account' ? 'dz-font-price' : ''"
								:style="{
									'font-size': parseInt(config.props.numFontSize) * 2 + 'rpx',
								}"
							>
								<text v-if="item.path == 'account'">{{ (userInfo.account && userInfo.account.user_money) || 0 }}</text>
								<text v-if="item.path == 'integral'">{{ (userInfo.account && userInfo.account.user_integral) || 0 }}</text>
								<text v-if="item.path == 'coupon'">{{ userInfo.coupon_num || 0 }}</text>
								<text v-if="item.path == 'cart'">{{ cartNum || 0 }}</text>
							</view>
							<view
								class="dz-m-t-4"
								:style="{
									'font-size': parseInt(config.props.titleFontSize) * 2 + 'rpx',
								}"
								>{{ titleReplace(item) }}</view
							>
						</view>
					</dz-grid-item>
				</block>
			</dz-grid>
		</view>
	</view>
</template>

<script lang="ts" setup>
const props = defineProps({
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
	shopSetting: {
		type: Object,
		default() {
			return {};
		},
	},
	hasLogin: {
		type: Boolean,
		default: false,
	},
	cartNum: {
		type: Number,
		default: 0,
	},
});

const emit = defineEmits(['click']);

function click(value: string) {
	emit('click', value);
}
function titleReplace(item: object): string {
	if (item.path == 'account') {
		return item.title.replace('余额', props.shopSetting.balance_front_name || '余额');
	} else if (item.path == 'integral') {
		return item.title.replace('积分', props.shopSetting.point_front_name || '积分');
	} else {
		return item.title;
	}
}
</script>

<style lang="scss" scoped>
.dz-statistics-meun {
	overflow: hidden;
}
</style>

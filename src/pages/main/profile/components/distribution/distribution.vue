<template>
	<view
		class="dz-main-color"
		:style="{
			padding: `${parseInt(config.props.marginTop) * 2}rpx ${parseInt(config.props.marginLeftRight) * 2}rpx ${
				parseInt(config.props.marginBottom) * 2
			}rpx`,
		}"
	>
		<view
			:style="{
				backgroundColor: config.props.bgColor,
				borderRadius: parseInt(config.props.borderRadius) * 2 + 'rpx',
				overflow: 'hidden',
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
				hover-class="none"
				:border-bottom="false"
				@tap="click"
			></dz-cell-item>
			<dz-grid :border="false" style="margin-top: -20rpx" v-if="userPromoter" :col="config.props.cell">
				<block v-if="config.props.mode == 'warehouse'">
					<dz-grid-item v-if="config.props.warehouse[0].checked" customStyle="padding-top: 10px; padding-bottom: 15px">
						<view class="dz-text-center">
							<view class="dz-font-price">{{ estimateStat[0] ? estimateStat[0].warehouse.toFixed(2) : '0.00' }}</view>
							<view class="dz-font-sm">今日货款收益</view>
						</view>
					</dz-grid-item>
					<dz-grid-item v-if="config.props.warehouse[1].checked" customStyle="padding-top: 10px; padding-bottom: 15px">
						<view class="dz-text-center">
							<view class="dz-font-price">{{ estimateStat[1] ? estimateStat[1].warehouse.toFixed(2) : '0.00' }}</view>
							<view class="dz-font-sm">本月货款收益</view>
						</view>
					</dz-grid-item>
					<dz-grid-item v-if="config.props.warehouse[2].checked" customStyle="padding-top: 10px; padding-bottom: 15px">
						<view class="dz-text-center">
							<view>{{ userInfo && userInfo.sale_stock ? userInfo.sale_stock : 0 }}</view>
							<view class="dz-font-sm">销货笔数</view>
						</view>
					</dz-grid-item>
					<dz-grid-item v-if="config.props.warehouse[3].checked" customStyle="padding-top: 10px; padding-bottom: 15px">
						<view class="dz-text-center">
							<view class="dz-font-price">{{ userInfo && userInfo.promoter ? userInfo.promoter.accumulate_brokerage : '0.00' }}</view>
							<view class="dz-font-sm">累计货款收益</view>
						</view>
					</dz-grid-item>
				</block>
				<block v-if="['store', 'fission'].includes(config.props.mode)">
					<dz-grid-item v-if="config.props[config.props.mode][0].checked" customStyle="padding-top: 10px; padding-bottom: 15px">
						<view class="dz-text-center">
							<view class="dz-font-price">{{ userPromoter.accumulate_brokerage || '0.00' }}</view>
							<view class="dz-font-sm">{{ api.formatString(language.profile.totalCommission, shopSetting.commission_front_name) }}</view>
						</view>
					</dz-grid-item>
					<dz-grid-item v-if="config.props[config.props.mode][1].checked" customStyle="padding-top: 10px; padding-bottom: 15px">
						<view class="dz-text-center">
							<view class="dz-font-price">{{ userPromoter.user_brokerage || '0.00' }}</view>
							<view class="dz-font-sm">{{ api.formatString(language.profile.leftCommission, shopSetting.commission_front_name) }}</view>
						</view>
					</dz-grid-item>
					<dz-grid-item
						v-if="config.props[config.props.mode][2].checked"
						customStyle="padding-top: 10px; padding-bottom: 15px"
						@click="frozenCommissionClick"
					>
						<view class="dz-text-center">
							<view class="dz-font-price">{{ userPromoter.frozen_brokerage || '0.00' }}</view>
							<view class="dz-font-sm">
								{{ api.formatString(language.profile.frozenCommission, shopSetting.commission_front_name) }}
								<dz-icon style="margin-left: 10rpx" name="questionfill" size="28"></dz-icon>
							</view>
						</view>
					</dz-grid-item>
					<dz-grid-item v-if="config.props[config.props.mode][3].checked" customStyle="padding-top: 10px; padding-bottom: 15px">
						<view class="dz-text-center">
							<view class="dz-font-price">{{ userPromoter.amount_drawn_brokerage || '0.00' }}</view>
							<view class="dz-font-sm">{{ language.profile.outCommission }}</view>
						</view>
					</dz-grid-item>
				</block>
			</dz-grid>
			<dz-modal
				v-model:show="frozenCommissionModalShow"
				:showTitle="false"
				:content="api.formatString(language.profile.frozenCommissionTip, shopSetting.commission_front_name)"
				:confirm-color="theme.dzBaseColor"
				:show-cancel-button="false"
				@confirm="frozenCommissionClick"
			></dz-modal>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/state/modules/user';

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
	userPromoter: {
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
	estimateStat: {
		type: Array,
		default() {
			return [];
		},
	},
});

const emit = defineEmits(['click']);
const language = uni.$api.language;
const frozenCommissionModalShow = ref<boolean>(false);
const userStore = useUserStore();

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

function click() {
	let value = props.config.props.mode == 'warehouse' ? 'warehouse' : 'distribution';
	emit('click', value);
}

function frozenCommissionClick() {
	frozenCommissionModalShow.value = !frozenCommissionModalShow.value;
}
</script>

<template>
	<view>
		<dz-navbar title="区域代理"></dz-navbar>
		<dz-image v-if="data.regionalConfig.promoter_regional_banner" :src="data.regionalConfig.promoter_regional_banner" width="100%" :height="320"></dz-image>
		<view class="head">
			<view style="font-size: 35rpx; font-weight: 700">负责区域</view>
			<view class="dz-tips-color" @click="history">申请历史</view>
		</view>
		<dz-page-loading :show="loadingShow" :status="loadingStatus" @click="getPromoterInfo"></dz-page-loading>
		<view>
			<dz-empty v-if="!list.length" text="暂无负责区域" :src="empty" iconSize="360"></dz-empty>
			<view class="card" v-for="(item, i) in list" :key="i">
				<view class="dz-flex">
					<text class="dz-tips-color dz-m-r-20">等级 </text>
					<text :style="{ color: level[item.level].color }"> {{ level[item.level].label }}</text>
				</view>
				<view class="dz-flex dz-m-t-4">
					<text class="dz-tips-color dz-m-r-20">区域 </text>
					<text class="dz-main-color">{{ item.address_name }}</text>
				</view>
			</view>
			<view class="fixed">
				<view class="fonter-bottom">
					<dz-button
						:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
						hover-class="none"
						shape="circle"
						@click="application('add')"
						:border="false"
					>
						申请代理
					</dz-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const empty = uni.$api.assetsConfig.empty;
const data = reactive({
	regionalConfig: {},
});
const loadingShow = ref<boolean>(false);
const loadingStatus = ref<string>('loading');
const list = ref<array>([]);
const level = {
	1: {
		label: '省代',
		color: '#fdc561',
	},
	2: {
		label: '市代',
		color: '#42e38d',
	},
	3: {
		label: '区代',
		color: '#2eafff',
	},
};

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const wechatMpLogin = computed(() => {
	return userStore.getShopSetting;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '区域代理',
	});
	getPromoterInfo();
});

async function getPromoterInfo() {
	loadingShow.value = true;
	try {
		await getRegionalLevelConfig();
		await getRegionalAgentApplySchedule();
		loadingShow.value = false;
	} catch (e) {
		loadingStatus.value = 'error';
		//TODO handle the exception
	}
}

async function getRegionalLevelConfig() {
	await uni.$api.http.get(uni.$api.apiShop.distributionPromoterRegionalConfig).then((res) => {
		data.regionalConfig = res.data;
	});
}

async function getRegionalAgentApplySchedule() {
	await uni.$api.http.get(uni.$api.apiShop.distributionPromoterRegionalIndex).then((res) => {
		list.value = [];
		res.data.forEach((item) => {
			if (item.state == 1) {
				list.value.push(item);
			}
		});
	});
}

// 申请代理
function application() {
	// #ifdef MP
	if (
		wechatMpLogin.value &&
		shopSetting.value.notify_miniprogram_sub &&
		(shopSetting.value.notify_miniprogram_sub.promoter_audit ||
			shopSetting.value.notify_miniprogram_sub.promoter_done ||
			shopSetting.value.notify_miniprogram_sub.promoter_level_change)
	) {
		let tmplIds = [];
		// 分销商审核通知
		shopSetting.value.notify_miniprogram_sub.promoter_audit && tmplIds.push(shopSetting.value.notify_miniprogram_sub.promoter_audit);
		// 成为分销商通知
		shopSetting.value.notify_miniprogram_sub.promoter_done && tmplIds.push(shopSetting.value.notify_miniprogram_sub.promoter_done);
		// 分销商等级变更通知
		shopSetting.value.notify_miniprogram_sub.promoter_level_change && tmplIds.push(shopSetting.value.notify_miniprogram_sub.promoter_level_change);
		wx.requestSubscribeMessage({
			tmplIds: tmplIds,
			success: () => {
				uni.$api.router.push({
					route: uni.$api.routesConfig.distributionApplyAgncy,
				});
			},
			fail() {
				uni.$api.router.push({
					route: uni.$api.routesConfig.distributionApplyAgncy,
				});
			},
		});
	} else {
		uni.$api.router.push({
			route: uni.$api.routesConfig.distributionApplyAgncy,
		});
	}
	// #endif
	// #ifndef MP
	uni.$api.router.push({
		route: uni.$api.routesConfig.distributionApplyAgncy,
	});
	// #endif
}

// 申请历史
function history() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.distributionApplyHistory,
	});
}
</script>

<style lang="scss" scoped>
.card {
	background: #fff;
	border-radius: 20rpx;
	margin: 20rpx;
	padding: 20rpx;
}

.head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 40rpx 20rpx 0 20rpx;
}

.fixed {
	margin-top: 20rpx;
	position: fixed;
	z-index: 99;
	width: 100%;
	background: #fff;
	bottom: -4rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

	.fonter-bottom {
		width: 100%;
		height: 120rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: env(safe-area-inset-bottom);
	}
}
</style>

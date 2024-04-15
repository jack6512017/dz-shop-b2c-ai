<template>
	<view>
		<dz-navbar title="申请历史" :followTheme="false"></dz-navbar>
		<view>
			<dz-empty v-if="!list.length" text="暂无申请记录" :src="empty" iconSize="360"></dz-empty>
			<view class="card" v-for="(item, i) in list" :key="i">
				<view class="dz-flex">
					<text class="dz-tips-color dz-m-r-20">申请等级 </text>
					<text :style="{ color: level[item.level].color }"> {{ level[item.level].label }}</text>
				</view>
				<view class="dz-flex dz-m-t-4">
					<text class="dz-tips-color dz-m-r-20">申请区域 </text>
					<text> {{ item.address_name }}</text>
				</view>
				<view class="dz-flex dz-m-t-4">
					<text class="dz-tips-color dz-m-r-20">申请时间 </text>
					<text> {{ api.timeFormat(item.created_at) }}</text>
				</view>

				<view class="dz-flex dz-m-t-4">
					<text class="dz-tips-color dz-m-r-20">结果 </text>
					<view class="dz-flex">
						<view class="dzicon-iconfont dzicon-round_rank_fill" v-if="parseInt(item.state) == 0"></view>
						<view class="dzicon-iconfont dzicon-infofill" v-if="parseInt(item.state) == -1"></view>
						<view class="dzicon-iconfont dzicon-roundcheckfill" v-if="parseInt(item.state) == 1"></view>
						<view class="dz-m-l-6">{{ stateFilters(item.state) }}</view></view
					>
				</view>
			</view>
		</view>
		<dz-page-loading :show="loadingShow" :status="loadingStatus" @click="getRegionalAgentApplySchedule"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const empty = uni.$api.assetsConfig.empty;
const loadingShow = ref<boolean>(true);
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

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '申请区域代理',
	});
	getRegionalAgentApplySchedule();
});

function stateFilters(val) {
	switch (parseInt(val)) {
		case 0:
			return '待审核';
		case -1:
			return '已拒绝';
		case 1:
			return '已通过';
	}
}

async function getRegionalAgentApplySchedule() {
	await uni.$api.http
		.get(uni.$api.apiShop.distributionPromoterRegionalIndex)
		.then((res) => {
			list.value = res.data;
			loadingShow.value = false;
		})
		.catch((err) => {
			loadingStatus.value = 'error';
		});
}
</script>

<style lang="scss" scoped>
.card {
	border-radius: 20rpx;
	margin: 20rpx;
	padding: 20rpx;
	background: #fff;
	color: $dz-main-color;
}

.dzicon-round_rank_fill {
	color: $dz-type-warning-disabled;
}

.dzicon-roundcheckfill {
	color: $dz-type-success;
}

.dzicon-infofill {
	color: $dz-type-error;
}
</style>

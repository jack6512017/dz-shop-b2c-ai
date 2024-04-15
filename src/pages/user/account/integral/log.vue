<template>
	<view>
		<dz-navbar :title="`${shopSetting.point_front_name}明细`"></dz-navbar>
		<view class="content">
			<view class="item dz-content-bg-color" v-for="(item, index) in list" :key="index">
				<view>
					<view class="dz-line-2 dz-main-color">{{ item.remark }}</view>
					<view class="dz-m-t-15 dz-tips-color">{{ api.timeFormat(item.created_time) }}</view>
				</view>
				<view
					class="dz-flex-s dz-font-36 dz-font-weight"
					:style="{
						color: item.num < 0 ? theme.dzBaseColor : theme.dzBaseColor,
					}"
					>{{ numFilter(item.num) }}</view
				>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="160" text="暂无记录" :src="emptyOrder" iconSize="360"></dz-empty>
		<view class="dz-ios-m-bline"
			><dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="20" :margin-bottom="20"></dz-loadmore
		></view>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();

const page = ref<number>(1);
const list = ref<array>([]);
const loadingStatus = ref<string>('loading');
const emptyOrder = uni.$api.assetsConfig.emptyOrder;

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: shopSetting.value.point_front_name + '明细',
	});
	getCreditsLogList();
});

onPullDownRefresh(() => {
	page.value = 1;
	list.value = [];
	getCreditsLogList();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getCreditsLogList();
});

function getCreditsLogList() {
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiMember.integralLogIndex, {
			params: {
				page: page.value,
				page_size: 15,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == 15 ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}

function numFilter(val) {
	return val >= 0 ? `+${val.toString()}` : val;
}
</script>

<style lang="scss">
.content {
	padding-bottom: 1rpx;
}
.item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 24rpx;
	padding: 20rpx;
	border-radius: 20rpx;
}
</style>

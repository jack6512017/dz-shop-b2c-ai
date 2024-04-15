<template>
	<view>
		<dz-navbar :title="api.language.coupon.myCoupon"></dz-navbar>
		<view class="content">
			<block v-for="(item, index) in list" :key="index">
				<dz-coupon-item :coupon="item" :isButton="true" customStyle="margin-bottom:20rpx">
					<template #checkbox>
						<dz-tag v-if="item.state == 0" text="未使用" :bgColor="theme.dzBaseColor" mode="dark" shape="circle"></dz-tag>
						<dz-tag v-if="item.state == 1" text="已使用" :bgColor="theme.dzTypeInfoDisabled" mode="dark" shape="circle"></dz-tag>
						<dz-tag v-if="item.state == 2" text="已过期" :bgColor="theme.dzTypeInfo" mode="dark" shape="circle"></dz-tag>
					</template>
				</dz-coupon-item>
			</block>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" :src="emptyCoupon" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const emptyCoupon = uni.$api.assetsConfig.emptyCoupon;
const page = ref<number>(1);
const list = ref<array>([]);
const loadingStatus = ref<string>('loading');
const userStore = useUserStore();

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.language.coupon.myCoupon,
	});
	getList();
});

onPullDownRefresh(() => {
	page.value = 1;
	list.value = [];
	getList();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getList();
});

const theme = computed(() => {
	return userStore.getTheme;
});

function getList() {
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiShop.couponRecord, {
			params: {
				page: page.value,
				page_size: uni.$api.appConfig.pageSzie,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
	uni.stopPullDownRefresh();
}
</script>

<style lang="scss">
.content {
	padding: 20rpx 20rpx 1rpx;
}
</style>

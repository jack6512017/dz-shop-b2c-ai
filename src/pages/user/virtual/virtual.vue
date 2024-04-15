<template>
	<view>
		<dz-navbar title="我的虚拟码" :borderBottom="false"></dz-navbar>
		<dz-tabs
			:list="tabList"
			:current="current"
			:scrollable="false"
			lineHeight="4"
			:activeStyle="{
				color: theme.dzBaseColor,
				fontSize: '32rpx',
				fontWeight: 'bold',
			}"
			:lineColor="theme.dzBaseColor"
			style="position: fixed; width: 100%; z-index: 2"
			@change="tabChange"
		></dz-tabs>
		<view class="cell-content">
			<view class="cell-card" v-for="(item, index) in tabList[current].list" :key="index" @tap="handleTap(item)">
				<view class="image"><dz-image :src="item.orderProduct.product_picture" :borderRadius="15" :width="160" :height="160"></dz-image></view>
				<view class="right">
					<view>
						<view class="title"> {{ item.product_name }} </view>
						<view class="sku dz-m-t-6">
							<view>{{ item.orderProduct.sku_name || '默认款' }}</view>
							<view> x{{ item.orderProduct.num }} </view>
						</view>
					</view>

					<view class="sku">
						<view
							>实付
							<text class="money">
								{{ language.application.moneySymbol }}<text class="dz-font-28">{{ item.money }}</text></text
							></view
						>
						<text
							>可用次数
							<text :style="{ color: theme.dzBaseColor, fontWeight: 'bold' }">{{
								parseInt(item.confine_use_number) === 0 ? language.virtual.noLimit : item.confine_use_number
							}}</text></text
						>
					</view>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData' && !tabList[current].list.length" margin-top="160" text="暂无虚拟码" :src="empty" iconSize="360"></dz-empty>
		<view class="dz-ios-m-bline"
			><dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="0" :margin-bottom="20"></dz-loadmore
		></view>
	</view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const tabList = ref([
	{
		page: 1,
		state: 0,
		name: '待使用',
		list: [],
	},
	{
		page: 1,
		state: 1,
		name: '已使用',
		list: [],
	},
	{
		page: 1,
		state: -1,
		name: '已过期',
		list: [],
	},
]);
const current = ref<number>(0);
const state = ref<number | string>(0);
const loadingStatus = ref<string>('loading');
const empty = uni.$api.assetsConfig.empty;
const language = uni.$api.language;

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '我的虚拟码',
	});
	getList();
});

onPullDownRefresh(() => {
	tabList.value[current.value].page = 1;
	tabList.value[current.value].list = [];
	getList();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	tabList.value[current.value].page++;
	getList();
});

const theme = computed(() => {
	return userStore.getTheme;
});

function tabChange(e: any) {
	current.value = e.index;
	if (tabList.value[e.index].list.length) return;
	state.value = tabList.value[e.index].state;
	getList();
}

function getList() {
	loadingStatus.value = 'loading';
	uni.$api.http
		.get(uni.$api.apiMember.orderProductVirtualIndex, {
			params: {
				state: state.value,
				page: tabList.value[current.value].page,
				page_size: 15,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == 15 ? 'loadmore' : 'nomore';
			tabList.value[current.value].list = [...tabList.value[current.value].list, ...res.data];
			if (tabList.value[current.value].page == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}

function handleTap(item: any) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.virtualDetail,
		query: {
			id: item.id,
		},
	});
}
</script>

<style lang="scss" scoped>
.cell-content {
	margin-top: 88rpx;
	padding: 20rpx;
	padding-bottom: 1rpx;
}

.cell-card {
	display: flex;
	padding: 20rpx;
	margin-bottom: 20rpx;
	background-color: #ffffff;
	border-radius: 15rpx;
	.image {
		flex-shrink: 0;
		width: 160rpx;
		height: 160rpx;
		border-radius: 10rpx;
		background-color: $dz-bg-color;
	}

	.right {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		.title {
			font-size: 28rpx;
			color: $dz-main-color;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}
		.sku {
			display: flex;
			justify-content: space-between;
			font-size: 24rpx;
			color: $dz-tips-color;
			.money {
				color: $dz-main-color;
			}
		}
	}
}
</style>

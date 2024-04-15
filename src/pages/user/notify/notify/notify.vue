<template>
	<view>
		<dz-navbar :title="title"></dz-navbar>
		<block v-for="(item, index) in notifyList" :key="index">
			<view class="notify">
				<view class="time">{{ api.timeFormat(item.notify.created_time) }}</view>
				<view class="item" @tap="handleTabPage(item, index)" v-if="item.notify">
					<view class="title">
						<view class="name">{{ item.notify.title }}</view>
						<view class="message" :style="{ background: api.theme.dzBaseColor }" v-if="parseInt(item.is_read) == 0"></view>
					</view>
					<view class="tip dz-m-t-20">{{ item.notify.content }}</view>
				</view>
			</view>
		</block>
		<dz-empty v-if="loadingStatus == 'noData'" text="还没有消息" margin-top="160" :src="emptyMsg" iconSize="360"></dz-empty>
		<view v-if="loadingStatus == 'loading'" class="dz-p-20"><dz-loadmore :status="loadingStatus"></dz-loadmore></view>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';

const page = ref<number>(1);
const title = ref<string>('');
const targetType = ref<string>('');
const notifyList = ref<array>([]);
const emptyMsg = uni.$api.assetsConfig.emptyMsg;
const loadingStatus = ref<string>('loading');

onLoad(async (options) => {
	await uni.$onLaunched;
	switch (options.type) {
		case 'announce':
			title.value = '售后服务';
			targetType.value = 'order_return_apply,order_return_customer_apply,order_return_money  ';
			break;
		case 'remind':
			title.value = '交易物流';
			targetType.value = 'order_consign';
			break;
		case 'message':
			title.value = '服务通知';
			targetType.value =
				'order_pay,order_join_buy_open,order_join_buy_join,order_join_buy_accomplish,order_join_buy_close,order_haggle_friend_join,order_haggle_accomplish,order_haggle_close';
			break;
	}
	uni.setNavigationBarTitle({
		title: title.value,
	});
	getNotifyIndex();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getNotifyIndex();
});

async function getNotifyIndex() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiMember.notifyIndex, {
			params: {
				target_type: targetType.value,
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			notifyList.value = [...notifyList.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'noData';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		});
}

function handleTabPage(item: object, index: number) {
	uni.$api.http
		.get(uni.$api.apiMember.notifyUnReadRead, {
			params: {
				notify_id: item.notify_id,
			},
		})
		.then((res) => {
			notifyList.value[index].is_read = 1;
			uni.$api.shop.navTo(item.notify);
		});
}
</script>

<style lang="scss">
.notify {
	padding: 20rpx 20rpx 0 20rpx;
	.time {
		text-align: center;
		margin-bottom: 20rpx;
		color: $dz-tips-color;
	}
	.item {
		border-radius: 15rpx;
		margin-bottom: 30rpx;
		padding: 20rpx;
		position: relative;
		overflow: hidden;
		background-color: #fff;
	}
	.title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		.name {
			font-size: 32rpx;
			display: -webkit-box;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.message {
			flex-shrink: 0;
			margin-left: 20rpx;
			width: 15rpx;
			height: 15rpx;
			border-radius: 50%;
		}
	}
	.tip {
		font-size: 24rpx;
		color: $dz-tips-color;
	}
}
</style>

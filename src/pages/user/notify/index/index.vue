<template>
	<view>
		<dz-navbar :title="`消息${setCount(count)}`">
			<!-- #ifndef MP-WEIXIN -->
			<template #right>
				<view class="navbar-right">
					<view class="dzicon-iconfont dzicon-icon dz-font-36"></view>
					<view @tap="tapNotifyReadAll" class="dz-m-l-10 dz-font-28">全部已读</view>
				</view>
			</template>
			<!-- #endif -->
		</dz-navbar>
		<!-- #ifdef MP -->
		<view class="dz-edit-notify">
			<view>共有 {{ setCount(count) }} 条未读消息</view>
			<view>
				<dz-button
					:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					size="mini"
					shape="circle"
					:border="false"
					hover-class="none"
					@click="tapNotifyReadAll"
					>全部已读</dz-button
				>
			</view>
		</view>
		<!-- #endif -->
		<view class="content">
			<view class="tap">
				<view class="item" @tap="handleTapPage('announce')">
					<view class="icon"
						><text class="dzicon-iconfont dzicon-servicefill"></text>
						<dz-badge :count="announce" :offset="[-2, -2]"></dz-badge>
					</view>
					<view class="text">售后服务</view>
				</view>
				<view class="item" @tap="handleTapPage('remind')">
					<view class="icon icon-color"
						><text class="dzicon-iconfont dzicon-deliver_fill"></text>
						<dz-badge :count="remind" :offset="[-2, -2]"></dz-badge>
					</view>
					<view class="text">交易物流</view>
				</view>
				<view class="item" @tap="handleTapPage('message')">
					<view class="icon icon-color2"
						><text class="dzicon-iconfont dzicon-notificationfill"></text>
						<dz-badge :count="message" :offset="[-2, -2]"></dz-badge>
					</view>
					<view class="text">服务通知</view>
				</view>
			</view>
			<view class="notify">
				<block v-for="(item, index) in notifyList" :key="index">
					<view class="notify-item" @tap="navTap(item, index)">
						<view class="title">
							<view class="name">{{ item.title }}</view>
							<view class="time">
								<view>{{ api.timeFormat(item.created_time) }}</view>
								<view class="message" :style="{ background: theme.dzBaseColor }" v-if="parseInt(item.is_read) == 0"></view>
							</view>
						</view>
						<view class="tip">{{ item.content }}</view>
					</view>
				</block>
				<dz-empty v-if="loadingStatus == 'noData'" text="还没有消息" margin-top="160" :src="emptyMsg" iconSize="360"></dz-empty>
				<view v-if="loadingStatus == 'loading'"><dz-loadmore :status="loadingStatus"></dz-loadmore></view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const count = ref<number>(0);
const announce = ref<number>(0);
const remind = ref<number>(0);
const message = ref<number>(0);
const page = ref<number>(1);
const notifyList = ref<array>([]);
const loadingStatus = ref<string>('loading');
const emptyMsg = uni.$api.assetsConfig.emptyMsg;
const theme = computed(() => userStore.getTheme);

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '消息中心',
	});
	getNotifyIndex();
});

onShow(() => {
	getNotifyUnRead();
});

onPullDownRefresh(() => {
	page.value = 1;
	notifyList.value = [];
	getNotifyIndex();
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getNotifyIndex();
});

function setCount(val: number | string): string {
	let num;
	if (parseInt(val) == 0) {
		num = '';
		// #ifdef MP
		num = 0;
		// #endif
	} else if (parseInt(val) > 99) {
		num = '(' + '99' + '+' + ')';
	} else {
		num = `(${val})`;
	}
	return num;
}

async function getNotifyUnRead() {
	await uni.$api.http.get(uni.$api.apiMember.notifyUnReadCount).then((res) => {
		count.value = res.data.count;
	});
}

async function tapNotifyReadAll() {
	if (parseInt(count.value) == 0) return uni.$api.toast('暂无未读消息');
	await uni.$api.http.get(uni.$api.apiMember.notifyUnReadReadAll).then((res) => {
		for (let i = 0; i < notifyList.value.length; i++) {
			notifyList.value[i].is_read = 1;
		}
		getNotifyUnRead();
	});
}

async function getNotifyIndex() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiMember.notifyIndex, {
			params: {
				type: 2,
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
	uni.stopPullDownRefresh();
}

function handleTapPage(type: string, id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.notify,
		query: {
			type,
			id: id,
		},
	});
}

function navTap(item: object, index: number) {
	uni.$api.http.post(uni.$api.apiMember.notifyUnReadRead, { id: item.id }).then(() => {
		notifyList.value[index].is_read = 1;
		// uni.$api.shop.navTo(item.notify);
	});
}
</script>

<style lang="scss" scoped>
.navbar-right {
	display: flex;
	align-items: center;
	padding-right: 32rpx;
}

.dz-edit-notify {
	width: 100%;
	border-radius: 12rpx;
	overflow: hidden;
	padding: 24rpx 30rpx 0 30rpx;
	box-sizing: border-box;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 24rpx;
}

.content {
	padding: 20rpx;
}

.tap {
	display: flex;
	justify-content: space-between;
	background-color: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;

	.item {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 20rpx;

		.dzicon-icon {
			font-size: 48rpx;
		}

		.icon {
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			width: 100rpx;
			height: 100rpx;
			margin: 10rpx;
			border-radius: 50%;
			background-color: rgba(64, 158, 255, 0.21);
			font-size: 52rpx;
			color: #409eff;
		}

		.icon-color {
			color: #e80f2e;
			background-color: rgba(247, 165, 165, 0.28);
		}

		.icon-color2 {
			color: #ffc20e;
			background-color: rgba(255, 194, 14, 0.25098);
		}

		.text {
			font-size: 28rpx;
		}
	}
}

.notify {
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
			margin-right: 20rpx;
		}

		.time {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: $dz-content-color;

			.message {
				margin-left: 10rpx;
				width: 15rpx;
				height: 15rpx;
				border-radius: 50%;
			}
		}
	}

	.tip {
		padding: 20rpx 0 0 0;
		font-size: 24rpx;
		color: $dz-tips-color;
	}
}

.notify-item {
	background-color: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	padding: 20rpx;
	position: relative;
	overflow: hidden;
}
</style>

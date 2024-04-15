<template>
	<view>
		<view class="container">
			<dz-navbar title="排行榜"></dz-navbar>
			<view class="fixed-box">
				<view class="tip"><view class="dz-text-center">数据统计截止至前一日</view></view>
				<view class="dz-m-t-20">
					<dz-tabs
						:list="tabList"
						:current="current"
						:scrollable="false"
						:inactiveStyle="{
							color: '#333',
						}"
						:activeStyle="{
							fontSize: '40rpx',
							fontWeight: 'bold',
							color: theme.dzBaseColor,
						}"
						lineWidth="15"
						lineHeight="4"
						bgColor=""
						:lineColor="theme.dzBaseColor"
						@change="tabCheckedChange"
					></dz-tabs>
				</view>
			</view>
			<view class="row-content">
				<dz-row v-if="rankingList.length > 1" gutter="40">
					<dz-col span="4">
						<view v-if="rankingList[2]" class="col">
							<view class="head_portrait" style="border-color: #b2c4d2">
								<dz-image :src="rankingList[2].member.head_portrait || missingFace" width="120" height="120" border-radius="60"></dz-image>
								<view class="icon">
									<view class="dzicon-iconfont dzicon-crown-fill color2"><view class="top">2</view></view>
								</view>
							</view>
							<view class="dz-m-t-20">
								<view class="dz-line-1 name dz-text-center">{{ rankingList[2].member.nickname }}</view>
							</view>
							<view class="dz-m-t-6 dz-font-32 dz-font-weight-light" :style="{ color: theme.dzBaseColor }">{{ rankingList[2].num }}</view>
						</view>
					</dz-col>
					<dz-col span="4">
						<view v-if="rankingList[1]" class="col">
							<view class="head_portrait" style="border-color: #ffcd26">
								<dz-image :src="rankingList[1].member.head_portrait || missingFace" :width="160" :height="160" :border-radius="80"></dz-image>
								<view class="icon" style="top: -70rpx">
									<view class="dzicon-iconfont dzicon-crown-fill color1"><view class="top">1</view></view>
								</view>
							</view>
							<view class="dz-m-t-20">
								<view class="dz-line-1 name dz-text-center">{{ rankingList[1].member.nickname }}</view>
							</view>
							<view class="dz-m-t-6 dz-font-32 dz-font-weight-light" :style="{ color: theme.dzBaseColor }">{{ rankingList[1].num }}</view>
						</view>
					</dz-col>
					<dz-col span="4">
						<view v-if="rankingList[3]" class="col">
							<view class="head_portrait" style="border-color: #de8f56">
								<dz-image :src="rankingList[3].head_portrait || missingFace" :width="120" :height="120" :border-radius="60"></dz-image>
								<view class="icon">
									<view class="dzicon-iconfont dzicon-crown-fill color3"><view class="top">3</view></view>
								</view>
							</view>
							<view class="dz-m-t-20">
								<view class="dz-line-1 name dz-text-center">{{ rankingList[3].member.nickname }}</view>
							</view>
							<view class="dz-m-t-6 dz-font-32 dz-font-weight-light" :style="{ color: theme.dzBaseColor }">{{ rankingList[3].num }}</view>
						</view>
					</dz-col>
				</dz-row>
			</view>
			<view v-if="rankingList.length > 3" style="padding-bottom: 130rpx">
				<view class="ranking-box dz-m-t-40">
					<block v-for="(item, index) in rankingList" :key="index">
						<view class="item" v-if="index > 3">
							<view class="sum flex-1">
								<view class="radius" :style="{ background: theme.dzBaseDisabled }">
									<view class="top">{{ index }}</view>
								</view>
							</view>
							<view class="user-info flex-3">
								<image :src="item.member.head_portrait || missingFace"></image>
								<view class="name dz-m-r-30">{{ item.member.nickname || item.member.realname || item.member.mobile }}</view>
							</view>
							<view class="flex-2 num dz-font-26">
								销量:
								<text class="dz-m-l-15" :style="{ color: theme.dzBaseColor }">{{ item.num }}</text>
							</view>
						</view>
						<!-- <dz-line v-if="index > 3 && index != rankingList.length - 1" color="#dedfe6"></dz-line> -->
					</block>
				</view>
			</view>
			<view v-if="rankingList.length == 1 && loadingStatus != 'loading'" class="dz-flex dz-flex-column dz-row-center">
				<view class="dz-m-b-20"><dz-icon name="crown-fill" size="200" color="#FFCD26"></dz-icon></view>
				<text class="dz-color-9">空空如也~</text>
			</view>
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus"></dz-loadmore>

			<view v-if="rankingList.length" class="footer-bottom">
				<view class="item">
					<view class="sum flex-1">
						<view class="dz-font-24 dz-color-9" v-if="rankingList[0].num < rankingList[rankingList.length - 1].num || rankingList[0].rownum == '--'"
							>未上榜</view
						>

						<view v-else class="radius" :style="{ background: theme.dzBaseColor }">
							<view class="top">{{ rankingList[0].rownum }}</view>
						</view>
					</view>
					<view class="user-info flex-3">
						<image :src="rankingList[0].member.head_portrait || missingFace"></image>
						<view class="name dz-m-r-30">{{ rankingList[0].member.nickname }}</view>
					</view>
					<view class="flex-2 num dz-font-26">
						<view class="dz-line">
							销量:
							<text class="dz-m-l-10 dz-font-weight-light" :style="{ color: theme.dzBaseColor }">{{ rankingList[0].num }}</text>
						</view>
						<view v-if="rankingList[0].num < rankingList[rankingList.length - 1].num || rankingList[0].rownum == '--'" class="dz-line">
							距上榜还差
							<text class="dz-m-l-10 dz-font-weight-light" :style="{ color: theme.dzBaseColor }">
								{{ rankingList[rankingList.length - 1].num > 0 ? rankingList[rankingList.length - 1].num - rankingList[0].num : 1 }}
							</text>
						</view>
					</view>
				</view>
			</view>
			<dz-page-loading :show="loadingShow" :status="pageLoadingStatus" @click="loadingClick"></dz-page-loading>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const missingFace = uni.$api.assetsConfig.missingFace;
const tabList = [
	{ name: '昨天', id: 1 },
	{ name: '上周', id: 2 },
	{ name: '上月', id: 3 },
	{ name: '累计', id: 4 },
];
const data = reactive({
	current: 0,
	rankingList: [],
	loadingShow: true,
	pageLoadingStatus: 'loading',
	loadingStatus: 'noData',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '排行榜',
	});
	getRankingIndex();
});

onPullDownRefresh(() => {
	data.loadingStatus = 'loading';
	data.rankingList = [];
	getRankingIndex();
});

function loadingClick() {
	getRankingIndex();
}

async function getRankingIndex() {
	await uni.$api.http
		.get(uni.$api.apiShop.distributionWarehouseRankingIndex, {
			params: {
				type: 'all',
				timespan: tabList[data.current].id,
			},
		})
		.then((res) => {
			data.rankingList = res.data;
			data.loadingShow = false;

			if (res.data.length > 0) {
				data.loadingStatus = 'noData';
			}
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
	uni.stopPullDownRefresh();
}

// 二级
function tabCheckedChange({ index }) {
	data.current = index;
	data.rankingList = [];
	data.loadingStatus = 'loading';
	getRankingIndex();
}

const { current, rankingList, loadingShow, pageLoadingStatus, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.container {
	height: 100%;
	background: #fff;
}
.fixed-box {
	position: fixed;
	background: #fff;
	width: 100%;
	z-index: 1;
}
.tip {
	padding: 20rpx 20rpx 0;
	color: #999;
	font-size: 26rpx;
}

.flex-1 {
	flex: 2;
}
.flex-2 {
	flex: 5;
}
.flex-3 {
	flex: 8;
}
.row-content {
	margin-top: 210rpx;
	.col {
		height: 280rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;

		.head_portrait {
			position: relative;
			border-radius: 50%;
			border: 6rpx solid pink;
		}
		.icon {
			position: absolute;
			top: -60rpx;
			left: 50%;
			transform: translateX(-50%);
		}

		.dzicon-crown-fill {
			position: relative;
			font-size: 60rpx;

			.top {
				position: absolute;
				left: 50%;
				top: 77%;
				transform: translate(-50%, -50%);
				color: #fff;
				font-size: 22rpx;
				font-weight: 700;
			}
		}
		.color1 {
			color: #ffcd26;
			font-size: 70rpx;
		}
		.color2 {
			color: #b2c4d2;
		}
		.color3 {
			color: #de8f56;
		}
		.name {
			width: 210rpx;
		}
	}
}
.ranking-box {
	padding: 0 20rpx;
	background-color: #fff;
	border-radius: 40rpx 40rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
}
.item {
	display: flex;
	align-items: center;
	line-height: 90rpx;
	background-color: #f5f5f5;
	border-radius: 75rpx;
	margin-bottom: 20rpx;
	.sum {
		display: flex;
		justify-content: center;
		.radius {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 36rpx;
			height: 36rpx;
			border-radius: 9rpx;
			.top {
				color: #fff;
				font-size: 24rpx;
			}
		}
	}
	.user-info {
		display: flex;
		align-items: center;
		image {
			width: 70rpx;
			height: 70rpx;
			flex-shrink: 0;
			border-radius: 35rpx;
			margin: 0 20rpx;
		}
		.name {
			width: 280rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.num {
		text-align: left;
	}
}
.sales {
	color: #fdc97d;
}
.footer-bottom {
	position: fixed;
	width: 100%;
	bottom: 0;
	padding: 0 30rpx;
	z-index: 1;
	background: #ffffff;
	box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
	.item {
		min-height: 120rpx;
		margin-bottom: env(safe-area-inset-bottom);
		background: #fff;
		.dz-line {
			line-height: 38rpx;
		}
	}
}
</style>

<template>
	<view>
		<dz-navbar-immersive
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar :title="title" :border-bottom="false"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			:title="title"
			:is-fixed="false"
			:borderBottom="false"
			:background="{ background: theme.dzBaseColor }"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
		></dz-navbar>
		<view class="price-box" :style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }" v-if="statInfo.all">
			<view class="price-item" v-if="statInfo.all">
				<view class="flex">
					<view class="dzicon-iconfont dzicon-round_rank_fill"></view>
					<view class="title" v-if="recordType == 'fission'">全部{{ shopSetting.commission_front_name }}笔数：{{ statInfo.all.fission_count }}</view>
					<view class="title" v-if="recordType == 'store'">全部{{ shopSetting.commission_front_name }}笔数：{{ statInfo.all.store_count }}</view>
				</view>
				<view class="price-tip">
					<!-- 	<view class="item">
						{{ shopSetting.commission_front_name }}总额：￥{{
							(parseFloat(statInfo.all.fission) + parseFloat(statInfo.all.store) + parseFloat(statInfo.all.regional)).toFixed(2)
						}}
					</view> -->
					<!-- 裂变分销 -->
					<view
						v-if="recordType == 'fission' && userInfo.promoter_fission_is_open == 1 && userInfo.promoter && userInfo.promoter.promoterFission"
						class="item"
					>
						总额：￥{{ statInfo.all.fission }}
					</view>
					<!-- 店铺分销 -->
					<view
						v-if="recordType == 'store' && userInfo.promoter_store_is_open == 1 && userInfo.promoter && userInfo.promoter.promoterStore"
						class="item"
					>
						总额：￥{{ statInfo.all.store }}
					</view>
					<!-- 	<view v-if="userInfo.promoter_regional_is_open == 1 && userInfo.promoter && userInfo.promoter.promoterRegional" class="item">
						区域分销：￥{{ statInfo.all.regional }}
					</view> -->
				</view>
			</view>
			<view class="price-item" v-if="statInfo.today">
				<view class="flex">
					<view class="dzicon-iconfont dzicon-timefill"></view>
					<view class="title" v-if="recordType == 'fission'"
						>今日{{ shopSetting.commission_front_name }}笔数：{{ statInfo.today.fission_count }}</view
					>
					<view class="title" v-if="recordType == 'store'">今日{{ shopSetting.commission_front_name }}笔数：{{ statInfo.today.store_count }}</view>
				</view>
				<view class="price-tip">
					<!-- <view class="item">
						{{ shopSetting.commission_front_name }}总额：￥{{
							(parseFloat(statInfo.today.fission) + parseFloat(statInfo.today.store) + parseFloat(statInfo.today.regional)).toFixed(2)
						}}
					</view> -->
					<!-- 裂变分销 -->
					<view
						v-if="recordType == 'fission' && userInfo.promoter_fission_is_open == 1 && userInfo.promoter && userInfo.promoter.promoterFission"
						class="item"
					>
						总额：￥{{ statInfo.today.fission }}
					</view>
					<!-- 店铺分销 -->
					<view
						v-if="recordType == 'store' && userInfo.promoter_store_is_open == 1 && userInfo.promoter && userInfo.promoter.promoterStore"
						class="item"
					>
						总额：￥{{ statInfo.today.store }}
					</view>
					<!-- 	<view v-if="userInfo.promoter_regional_is_open == 1 && userInfo.promoter && userInfo.promoter.promoterRegional" class="item">
						区域分销：￥{{ statInfo.today.regional }}
					</view> -->
				</view>
			</view>
		</view>
		<view class="order-list">
			<block v-for="(item, index) in promoterRecordTeamList" :key="index">
				<view class="item" v-if="parseFloat(item.commission_money) != 0">
					<view class="order-num">
						<view class="tip">订单号：{{ item.map_sn }}</view>
						<dz-tag v-if="item.state == 1" mode="dark" bgColor="#ECFBF4" color="#41CC8B">{{ filterStateText(item.state) }}</dz-tag>
						<dz-tag v-if="item.state == 0" mode="dark" bgColor="#FFF7EC" color="#E7A458">{{ filterStateText(item.state) }}</dz-tag>
						<dz-tag v-if="item.state == -1" mode="dark" bgColor="#FCF6F6" color="#FD5548">{{ filterStateText(item.state) }}</dz-tag>
					</view>
					<view class="user-info">
						<image :src="item.member && (item.member.head_portrait || missingFace)"></image>
						<view class="right">
							<view>{{ item.remark }}</view>
							<view class="dz-m-t-8">{{ (item.member && (item.member.nickname || item.member.realname || item.member.mobile)) || '匿名' }}</view>
							<view class="parent-info">
								<view v-if="statType">上级ID： {{ (item.member && item.member.parent && item.member.parent.id) || '无' }}</view>
								<view v-if="statType">上级昵称： {{ (item.member && item.member.parent && item.member.parent.nickname) || '无' }}</view>
								<view v-if="item.record_type">类型：{{ filterRecordType(item.record_type) }}</view>
								<view>时间：{{ api.timeFormat(item.created_time) }}</view>
							</view>
						</view>
					</view>
					<view class="price-tip dz-p-b-20">
						<text>产品金额：{{ item.map_money }}</text>
						<text class="dz-m-l-20">{{ shopSetting.commission_front_name }}金额：{{ item.commission_money }}</text>
					</view>
					<dz-line v-if="index != promoterRecordTeamList.length - 1"></dz-line>
				</view>
			</block>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" :src="emptyOrder" iconSize="360" text="暂无分销订单"></dz-empty>
		<view class="dz-ios-p-safe-bottom"
			><dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="20" :margin-bottom="20"></dz-loadmore
		></view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPageScroll, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const missingFace = uni.$api.assetsConfig.missingFace;
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const data = reactive({
	title: '',
	page: 1,
	promoterRecordTeamList: [],
	statInfo: {},
	loadingStatus: 'loading',
	statDetailShow: false,
	recordType: '',
	statType: '',
	scrollTop: 0,
	opacity: 0,
	api: '',
	statApi: '',
	memberInfo: {},
	stateTag: {},
});

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const navbarStyle = computed(() => {
	let style = {};
	style.opacity = data.opacity;
	return style;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.recordType = options.recordType;
	data.statType = options.type;
	data.statDetailShow = parseInt(shopSetting.value.show_distribution_stat_detail) == 1;
	initData();
});

onPageScroll((e) => {
	data.scrollTop = e.scrollTop;
});

onPullDownRefresh(() => {
	data.page = 1;
	data.promoterRecordTeamList = [];
	initData();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getPromoterRecordTeam();
});

function filterStateText(val) {
	switch (parseInt(val)) {
		case 1:
			return '已完成';
		case 0:
			return '待完成';
		case -1:
			return '已关闭';
	}
}

function filterRecordType(val) {
	switch (val) {
		case 'fission':
			return '裂变分销';
		case 'regional':
			return '区域分销';
		case 'store':
			return '店铺分销';
		case 'warehouse':
			return '云仓分销';
	}
}

function filterStateTag(val) {
	switch (parseInt(val)) {
		case 1:
			return (data.stateTag = {
				bgColor: '#ECFBF4',
				color: '#51C996',
			});
		case 0:
			return (data.stateTag = {
				bgColor: '#ECFBF4',
				color: '#51C996',
			});
		case -1:
			return (data.stateTag = {
				bgColor: '#ECFBF4',
				color: '#51C996',
			});
	}
}

function opacityChange(e) {
	data.opacity = e.opacity;
}

async function initData() {
	if (data.statType) {
		data.title = '团队订单';
		data.api = uni.$api.apiShop.distributionPromoterRecordTeam;
		data.statApi = uni.$api.apiShop.distributionPromoterRecordTeamStat;
	} else {
		data.title = '直推订单';
		data.api = uni.$api.apiShop.distributionPromoterRecordSelf;
		data.statApi = uni.$api.apiShop.distributionPromoterRecordSelfStat;
	}
	uni.setNavigationBarTitle({
		title: data.title,
	});
	await getPromoterRecordTeamStat();
	await getPromoterRecordTeam();
}

async function getPromoterRecordTeam() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(data.api, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
				record_type: data.recordType,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.promoterRecordTeamList = [...data.promoterRecordTeamList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		});
	uni.stopPullDownRefresh();
}

async function getPromoterRecordTeamStat() {
	await uni.$api.http.get(data.statApi).then((res) => {
		data.statInfo = res.data;
	});
}

const { scrollTop, title, statType, statInfo, recordType, promoterRecordTeamList, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.price-box {
	padding: 20rpx 36rpx;
	font-size: 30rpx;

	.price-item {
		display: flex;
		padding: 20rpx 0;
	}

	.flex {
		flex: 3;
		display: flex;
		align-items: center;
		line-height: 50rpx;

		.dzicon-iconfont {
			margin-right: 10rpx;
			font-size: 40rpx;
		}
	}

	.price-tip {
		flex: 2;
		margin-left: 20rpx;
		font-size: 28rpx;

		.item {
			line-height: 50rpx;
		}
	}
}

.order-list {
	.item {
		padding: 30rpx 30rpx 0 30rpx;
		background-color: #ffffff;

		.order-num {
			display: flex;
			justify-content: space-between;
			font-size: 28rpx;
			color: $dz-tips-color;

			.tip {
				color: $dz-main-color;
			}
		}

		.user-info {
			display: flex;
			padding: 20rpx 0;

			image {
				flex-shrink: 0;
				width: 90rpx;
				height: 90rpx;
				border-radius: 50%;
			}

			.right {
				margin-left: 20rpx;

				.parent-info {
					margin-top: 10rpx;
					font-size: 24rpx;
					color: $dz-tips-color;
				}
			}
		}

		.price-tip {
			text-align: right;
		}
	}
}
</style>

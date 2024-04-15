<template>
	<view>
		<dz-navbar title="中奖记录" :border-bottom="false"></dz-navbar>
		<view class="cell-content">
			<view class="cell-card" v-for="(item, index) in list" :key="index">
				<view>
					<view class="dz-flex">
						<dz-image :src="item.prize_picture" :width="60" :height="60"></dz-image>
						<text class="dz-m-l-10">{{ item.prize_title }}</text>
					</view>

					<view class="dz-m-t-15 dz-color-9">{{ api.timeFormat(item.created_time) }}</view>
				</view>
				<view v-if="item.shipping_type == 1 && item.prize_type == 1" class="dz-flex-s">
					<dz-button
						:border="false"
						:custom-style="{ marginLeft: '20rpx', background: '#FE743E', color: '#fff' }"
						hover-class="none"
						size="mini"
						shape="circle"
						@click="handleTab(item)"
					>
						{{ item.receiver_address != 0 ? '收货信息' : '填写收货地址' }}
					</dz-button>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无奖品" :src="emptyOrder" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
		<!-- 收货信息 -->
		<dz-popup v-model:show="popupShow" mode="bottom" border-radius="40" closeIcon="roundclose" closeIconSize="40" :closeable="true">
			<view class="dz-m-t-40">
				<view class="dz-m-b-60 dz-text-center dz-font-32 dz-font-weight">收货信息</view>
				<scroll-view scroll-y style="min-height: 600rpx; color: #666">
					<dz-cell-item
						center
						title="收件人"
						:arrow="false"
						:value="address.receiver_name"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						center
						title="电话号码"
						:arrow="false"
						:value="address.receiver_mobile"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						center
						title="详细地址"
						:arrow="false"
						:value="address.receiver_address"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						center
						title="快递公司"
						:arrow="false"
						:value="address.express_company || '--'"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item center title="快递单号" :arrow="false" :customStyle="{ padding: '10rpx 20rpx' }" :border-bottom="false" hover-class="none">
						<template #value>
							{{ address.express_no || '--' }}
							<dz-button
								v-if="address.express_no"
								:plain="true"
								type="info"
								size="mini"
								shape="circle"
								hoverClass="none"
								:border="false"
								:custom-style="{
									height: '40rpx',
									marginLeft: '10rpx',
									background: '#FFF',
									lineHeight: '40rpx',
									border: '1rpx solid rgba(0,0,0,0.12)',
								}"
								@click="copy(address.express_no)"
							>
								复制
							</dz-button>
						</template>
					</dz-cell-item>
					<view style="height: 20rpx"></view>
				</scroll-view>
				<view class="dz-m-20">
					<dz-button
						:custom-style="{
							width: '100%',
							background: '#FE743E',
							color: '#fff',
						}"
						shape="circle"
						hover-class="none"
						:border="false"
						@click="handleShow"
					>
						关闭
					</dz-button>
				</view>
			</view>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
import { reactive, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom, onUnload } from '@dcloudio/uni-app';

const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const data = reactive({
	page: 1,
	list: [],
	loadingStatus: 'loading',
	isLoading: false,
	popupShow: false,
	address: {},
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '中奖记录',
	});
	uni.$on('winAddressChange', () => {
		data.page = 1;
		data.list = [];
		getList();
	});
	getList();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.list = [];
	getList();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getList();
});

onUnload(() => {
	uni.$off('winAddressChange');
});

async function getList() {
	data.loadingStatus = 'loading';
	data.isLoading = true;
	await uni.$api.http
		.get(uni.$api.apiShop.luckyWheelWinList, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.list = [...data.list, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		})
		.finally(() => {
			data.isLoading = false;
		});
	uni.stopPullDownRefresh();
}

function handleTab(e: object) {
	if (!e.express_company_id && !e.receiver_address) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.luckyWheelupdateAddress,
			query: {
				code: e.id,
			},
		});
	} else {
		data.address = e;
		data.popupShow = true;
	}
}

function handleShow() {
	data.popupShow = false;
}

// 复制
function copy(val) {
	uni.$api.copy(val);
	uni.$api.toast('快递单号已复制到剪贴板');
}

const { list, loadingStatus, popupShow, address } = { ...toRefs(data) };
</script>

<style lang="scss">
.cell-content {
	padding-bottom: 1rpx;
}

.cell-card {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 24rpx;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
}
</style>

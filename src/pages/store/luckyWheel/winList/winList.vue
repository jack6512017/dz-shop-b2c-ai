<template>
	<view>
		<dz-navbar title="中奖记录" :border-bottom="false"></dz-navbar>
		<view class="cell-content">
			<view class="cell-card" v-for="(item, index) in list" :key="index">
				<view class="store">
					<view class="image-bg image-bg-store"> <dz-image :src="item.store.cover" :width="160" :height="160" :borderRadius="10"></dz-image></view>
					<view class="dz-m-l-20">
						<view class="dz-font-weight">{{ item.store.title }}</view>
						<view class="dz-font-24 dz-m-t-6 dz-m-b-6">{{ item.store.address }}</view>
						<view class="dz-font-24 dz-color-9">{{ JSON.parse(item.store.business_time)[0] }}-{{ JSON.parse(item.store.business_time)[1] }}</view>
					</view>
				</view>
				<view>
					<view class="dz-flex dz-row-center dz-m-t-40">
						<view class="dz-m-t-1 dz-font-24" v-if="parseInt(item.is_check) === 0 && item.time_left > 0">
							有效时间：
							<dz-count-down
								:timestamp="item.time_left"
								:show-border="true"
								:color="theme.dzBaseColor"
								:separator-color="theme.dzBaseColor"
								:border-color="theme.dzBaseFontColor"
								:bg-color="theme.dzBaseFontColor"
								font-size="30"
								@timeEnd="handleEnd(index)"
							></dz-count-down>
						</view>
					</view>
					<view class="dz-flex dz-flex-column dz-m-t-40 dz-m-b-80">
						<view class="image-bg image-bg-win" @tap.stop="previewImgs(item.prize_picture, [item.prize_picture])">
							<dz-image :src="item.prize_picture" :width="200" :height="200" :borderRadius="20"></dz-image>
						</view>
						<text class="dz-m-t-20">{{ item.prize_title }}</text>
					</view>
					<dz-cell-item title="使用状态" center :arrow="false" :customStyle="{ padding: '10rpx 0rpx' }" :border-bottom="false" hover-class="none">
						<template #value>
							<view class="dz-flex dz-row-right dz-col-center" @tap="spread(index)">
								<text v-if="item.time_left == 0 && item.is_check == 0" class="dz-font-24 dz-m-l-10 dz-m-r-10">已过期</text>
								<text v-if="item.is_check == 1" class="dz-font-24 dz-m-l-10 dz-m-r-10" style="color: #19be6b">已使用</text>
								<text v-if="item.is_check == 0 && item.time_left > 0" class="dz-font-24 dz-m-l-10 dz-m-r-10" style="color: #ff9900"
									>待使用<dz-icon :name="item.spread ? 'right' : 'unfold'"></dz-icon>
								</text>
							</view>
						</template>
					</dz-cell-item>
					<view class="dz-flex dz-row-center">
						<canvas v-show="item.spread" :id="'qrcode' + item.id" :canvas-id="'qrcode' + item.id" style="width: 200px; height: 200px" />
					</view>
					<view v-show="item.spread" class="dz-flex dz-row-center dz-m-b-40">
						<dz-tag shape="circle" :color="theme.dzMainColor" :bgColor="theme.dzBgColor" :borderColor="theme.dzBgColor"
							><text class="dz-font-30"><text class="dz-color-6">兑换码：</text>{{ api.addSpaces(item.v_code) }} </text></dz-tag
						>
					</view>

					<dz-cell-item
						title="创建时间"
						center
						:arrow="false"
						:customStyle="{ padding: '10rpx 0rpx' }"
						:border-bottom="false"
						hover-class="none"
						:value="api.timeFormat(item.created_time)"
					>
					</dz-cell-item>
				</view>
			</view>
		</view>

		<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无奖品" :src="emptyOrder" iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs, getCurrentInstance } from 'vue';
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import uQRCode from '@/core/utils/uqrcode';

const proxy = getCurrentInstance();
const userStore = useUserStore();
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const data = reactive({
	page: 1,
	list: [],
	loadingStatus: 'loading',
	isLoading: false,
	popupShow: false,
	address: {},
});

const storeId = computed(() => {
	return userStore.getStoreId;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '中奖记录',
	});
	if (storeId.value) {
		getList();
	} else {
		data.loadingStatus = 'noData';
	}
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

async function getList() {
	data.loadingStatus = 'loading';
	data.isLoading = true;
	await uni.$api.http
		.get(uni.$api.apiStore.luckyWheelWinList, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
				store_id: storeId.value || 1,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.list = [...data.list, ...res.data];

			data.list.forEach((item) => {
				item.spread = false;
			});

			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		})
		.finally(() => {
			data.isLoading = false;
		});
	uni.stopPullDownRefresh();
}

function previewImgs(img: string, imgList: array) {
	// 预览图片
	uni.previewImage({
		current: img,
		urls: imgList,
	});
}

function handleEnd(index: number) {
	data.list[index].time_left = 0;
}

function spread(index: number) {
	if (data.list[index].is_check == 0 && data.list[index].time_left > 0) {
		if (!data.list[index].spread) {
			setTimeout(() => {
				getQrCode(data.list[index]);
			}, 60);
		}
		data.list[index].spread = !data.list[index].spread;
	}
}

// 二维码生成工具
function getQrCode(item: any) {
	let domain = uni.$api.appConfig.h5Domain;
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	new Promise((resolve, reject) => {
		uQRCode.make({
			canvasId: 'qrcode' + item.id,
			componentInstance: proxy,
			text: `${domain}${uni.$api.routesConfig.storeLuckyWheelVerify.path}?wheel_code=${item.v_code}&store_id=${item.store_id}`,
			size: 200,
			margin: 20,
			backgroundColor: '#ffffff',
			foregroundColor: '#000000',
			fileType: 'jpg',
			correctLevel: 1,
			success: (res) => {
				resolve(res);
			},
			fail: (res) => {
				reject(res);
			},
		});
	});
}

const { list, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
.cell-content {
	padding-bottom: 1rpx;
}

.cell-card {
	margin: 24rpx;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
	.store {
		display: flex;
		justify-content: space-between;
	}
	.image-bg {
		flex-shrink: 0;
		display: block;
		background-color: $dz-bg-color;
	}
	.image-bg-store {
		height: 160rpx;
		width: 160rpx;
		border-radius: 15rpx;
	}
	.image-bg-win {
		height: 200rpx;
		width: 200rpx;
		border-radius: 20rpx;
	}
}
</style>

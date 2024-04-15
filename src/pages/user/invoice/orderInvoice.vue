<template>
	<view>
		<dz-navbar :title="language.invoice.invoiceHistory"></dz-navbar>
		<view class="container">
			<view v-for="(item, index) in list" :key="index" class="item dz-font-28" :class="index != list.length - 1 ? 'dz-m-b-24' : ''">
				<view class="dz-flex dz-row-between dz-m-b-20">
					<view class="dz-flex">
						<dz-button
							:custom-style="{
								background: item.is_default != 1 ? theme.dzBaseDisabled : theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '50rpx',
								height: '50rpx',
								borderRadius: '25rpx',
								fontSize: '26rpx',
							}"
							size="mini"
							shape="circle"
							hover-class="none"
							:border="false"
						>
							{{ item.type == 2 ? '个' : '企' }}
						</dz-button>
						<text class="dz-m-l-20 main-color dz-font-weight">{{ item.title }}</text>
					</view>
					<view :style="{ color: stateFilters(item.state, 'color') }"> {{ stateFilters(item.state, 'label') }}</view>
				</view>
				<dz-line></dz-line>
				<view class="dz-m-t-20 dz-m-b-20">
					<text class="tips-color">订单编号</text>
					<text class="dz-m-l-20 main-color">{{ item.order_sn }}</text>
				</view>
				<view class="dz-m-b-20">
					<text class="tips-color">开票税号</text>
					<text class="dz-m-l-20 main-color">{{ item.type == 2 ? '个人发票无税号' : item.duty_paragraph }}</text>
				</view>
				<view class="dz-m-b-20">
					<text class="tips-color">开票邮箱</text>
					<text class="dz-m-l-20 main-color">{{ item.email }}</text>
				</view>
				<view class="dz-m-b-20">
					<text class="tips-color">开票金额</text>
					<text class="dz-m-l-20 main-color">{{ item.tax_money }}</text>
				</view>
				<view>
					<text class="tips-color">开票时间</text>
					<text class="dz-m-l-20 main-color">{{ api.timeFormat(item.created_time) }}</text>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'nodata'" :src="empty" margin-top="160"></dz-empty>
			<view v-if="loadingStatus == 'loading'" class="dz-p-b-20">
				<dz-loadmore :status="loadingStatus" :line="loadingStatus == 'loading' ? false : true" :height="60"></dz-loadmore>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const loadingStatus = ref<string>('loading');
const list = ref<array>([]);
const page = ref<number>(1);
const empty = uni.$api.assetsConfig.emptyOrder;

const theme = computed(() => {
	return userStore.getTheme;
});

const stateOptions = {
	'0': { label: '未开票', color: 'color1' },
	'1': { label: '开票中', color: 'color2' },
	'2': { label: '已开票', color: 'color3' },
};

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.invoice.invoiceHistory,
	});
	getList();
});

// 加载更多
onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getList();
});

// 获取发票列表
async function getList() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiMember.orderInvoiceIndex, {
			params: {
				page: page.value,
				page_size: 10,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length === 10 ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		});
}

function stateFilters(val, key) {
	return stateOptions[val][key];
}
</script>

<style lang="scss">
.container {
	margin: 24rpx;
	.item {
		padding: 20rpx;
		border-radius: 20rpx;
		background-color: #fff;
		.main-color {
			color: #303133;
		}
		.tips-color {
			color: #909399;
		}
	}
}

.color1 {
	color: #41cc8b;
}
.color2 {
	color: rgb(255, 196, 63);
}
.color3 {
	color: #fd5548;
}
</style>

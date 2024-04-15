<template>
	<view class="container">
		<dz-navbar title="提现账号" :border-bottom="false"></dz-navbar>
		<view v-if="list.length" class="card dz-m-20 dz-content-bg-color">
			<dz-swipe-action v-for="(item, index) in list" :key="item.id" :index="index" :actions="actionOptions" @click="actionClick">
				<template #content>
					<view class="card_item" @tap="handleShelect(item)">
						<view class="mid">
							<view class="t-box">
								<text v-if="parseInt(item.is_default) === 1" class="tag" :style="{ color: theme.dzBaseColor, borderColor: theme.dzBaseColor }">
									{{ language.invoice.tolerant }}
								</text>

								<view class="dzicon-iconfont dzicon-card_fill" v-if="item.account_type == 1"></view>
								<view class="dzicon-iconfont dzicon-wechat" v-if="item.account_type == 2"></view>
								<view class="dzicon-iconfont dzicon-alip" v-if="item.account_type == 3"></view>
								<text class="dz-font-28">{{ item.account_type_name }}{{ item.account_number || '' }}</text>
							</view>
							<view class="u-box">
								<text>手机号：</text>
								<text>{{ item.mobile }}</text>
							</view>
						</view>
						<view class="dz-p-20" @tap.stop="handleUpdate('edit', item.id)">
							<dz-icon name="post"></dz-icon>
						</view>
					</view>
				</template>
			</dz-swipe-action>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata' || !list.length" margin-top="160" :src="empty"></dz-empty>
		<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" magrin-bottom="20"></dz-loadmore>
		<view class="ios-margin-bottom"></view>
		<view class="footer-btn">
			<view class="fonter-bottom">
				<view style="width: 90%">
					<dz-button
						:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
						hover-class="none"
						shape="circle"
						:border="false"
						@click="handleUpdate('add')"
					>
						新建账号
					</dz-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad, onUnload, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const language = uni.$api.language;
const empty = uni.$api.assetsConfig.emptyOrder;
const userStore = useUserStore();
const loadingStatus = ref<string>('loading');
const list = ref<object[]>([]);
const page = ref<number>(1);
const source = ref<string>('');

const theme = computed(() => {
	return userStore.getTheme;
});

const actionOptions = ref([
	{
		name: '删除',
		color: '#fff',
		fontsize: 30, //单位rpx
		width: 66, //单位px
		background: theme.value.dzTypeError,
	},
]);

const data = reactive({
	withdrawConfig: {},
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '提现账号',
	});
	source.value = options.source;
	uni.$on('bankAccountChange', () => {
		page.value = 1;
		list.value = [];
		getList();
	});
	getWithdrawConfig();
	getList();
});

onUnload(() => {
	uni.$off('bankAccountChange');
});

onPullDownRefresh(() => {
	page.value = 1;
	list.value = [];
	getList();
});

// 加载更多
onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getList();
});

function getWithdrawConfig() {
	uni.$api.http.get(uni.$api.apiMember.brokerageWithdrawConfig).then((res) => {
		data.withdrawConfig = res.data;
	});
}

// 获取列表
async function getList() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiPay.yunhuotecMmemberCardIndex, {
			params: {
				page: page.value,
				page_size: 15,
			},
		})
		.then((res) => {
			loadingStatus.value = res.data.length === 15 ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
			uni.stopPullDownRefresh();
		});
}

async function actionClick(index: number) {
	await uni.$api.http
		.post(
			uni.$api.apiPay.yunhuotecMmemberCardDelete,
			{},
			{
				params: {
					id: list.value[index].id,
				},
			}
		)
		.then(() => {
			uni.$api.toast('删除成功');
			uni.$emit('updateBankAccount');
			list.value.splice(index, 1);
		});
}

function handleShelect(e: object) {
	if (source.value) {
		uni.$emit('getBankAccount', e);
		uni.$api.router.back();
	}
}

function handleUpdate(type: string, id?: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.yunhuotecMemberCardUpdate,
		query: {
			type: type,
			id: id,
			source: source.value,
		},
	});
}
</script>

<style lang="scss">
.container {
	padding-bottom: env(safe-area-inset-bottom);
}

.card {
	border-radius: 20rpx;
	overflow: hidden;

	.card_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #ffffff;
		border-radius: 10rpx;
		margin: 20rpx;
	}
}

.t-box {
	display: flex;
	align-items: center;
	font-size: 30rpx;
	color: #303133;
	.tag {
		font-size: 22rpx;
		padding: 0 18rpx;
		border-radius: 24rpx;
		margin-right: 20rpx;
		border-width: 1rpx;
		border-style: solid;
	}
	.dzicon-iconfont {
		margin-right: 10rpx;
		font-size: 40rpx;
	}
	.dzicon-alip {
		color: #00a0e9;
	}
	.dzicon-card_fill,
	.dzicon-commission {
		color: #fdc561;
	}
	.dzicon-wechat {
		color: $dz-type-success;
	}
}
.u-box {
	font-size: 28rpx;
	color: $dz-tips-color;
	margin-top: 16rpx;
	.name {
		margin-right: 30rpx;
	}
}

.ios-margin-bottom {
	height: 120rpx;
}

.footer-btn {
	position: fixed;
	z-index: 99;
	width: 100%;
	background-color: #fff;
	bottom: 0;
	.fonter-bottom {
		width: 100%;
		height: 120rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: env(safe-area-inset-bottom);
	}
}
</style>

<template>
	<view class="container">
		<dz-navbar :title="language.invoice.invoiceManagement" :followTheme="false"></dz-navbar>
		<view class="card dz-m-20">
			<dz-swipe-action v-for="(item, index) in list" :key="item.id" :index="index" :actions="actionOptions" @click="actionClick">
				<template #content>
					<view class="card_item" @tap="handleShelect(item)">
						<view class="dz-flex">
							<dz-button
								:custom-style="{
									background: item.is_default != 1 ? theme.dzBaseDisabled : theme.dzBaseColor,
									color: theme.dzBaseFontColor,
									width: '60rpx',
									height: '60rpx',
									borderRadius: '30rpx',
									fontSize: '28rpx',
								}"
								size="mini"
								shape="circle"
								hover-class="none"
								:border="false"
							>
								{{ item.type == 2 ? '个' : '企' }}
							</dz-button>
							<view class="dz-m-l-20">
								<view class="dz-m-b-2 title dz-flex dz-font-weight">
									<text>{{ item.title }}</text>
									<dz-tag
										v-if="item.is_default == 1"
										class="dz-m-l-10"
										shape="circle"
										size="mini"
										:border-color="theme.dzBaseColor"
										:bgColor="theme.dzBaseColor"
										:color="theme.dzBaseFontColor"
										>默认</dz-tag
									></view
								>
								<view class="dz-font-24 tips">{{ item.type == 2 ? '个人发票无税号' : item.duty_paragraph }}</view>
							</view>
						</view>
						<view class="dz-p-20" @tap.stop="handleUpdate('edit', item.id)">
							<dz-icon name="post"></dz-icon>
						</view>
					</view>
				</template>
			</dz-swipe-action>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="160" :src="empty"></dz-empty>
		<view v-if="loadingStatus == 'loading'" class="dz-p-b-20">
			<dz-loadmore :status="loadingStatus" :line="loadingStatus == 'loading' ? false : true" marginTop="0"></dz-loadmore>
		</view>
		<view class="ios-margin-bottom"></view>
		<view class="footer-bottom">
			<view class="footer_content">
				<view class="dz-p-20">
					<dz-button
						:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
						hover-class="none"
						shape="circle"
						@click="handleUpdate('add')"
						:border="false"
					>
						添加发票
					</dz-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onUnload, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const empty = uni.$api.assetsConfig.emptyOrder;
const loadingStatus = ref<string>('loading');
const list = ref<array>([]);
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

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.invoice.invoiceManagement,
	});
	source.value = options.source;
	uni.$on('invoiceChange', () => {
		page.value = 1;
		list.value = [];
		getInvoiceList();
	});
	getInvoiceList();
});

onUnload(() => {
	uni.$off('invoiceChange');
});

// 加载更多
onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getInvoiceList();
});

// 获取发票列表
async function getInvoiceList() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiMember.invoiceIndex, {
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
		});
}

async function actionClick(index) {
	await uni.$api.http
		.delete(
			uni.$api.apiMember.invoiceDelete,
			{},
			{
				params: {
					id: list.value[index].id,
				},
			}
		)
		.then(() => {
			uni.$api.toast('删除成功');
			list.value.splice(index, 1);
		});
}

function handleShelect(e) {
	if (source.value) {
		uni.$emit('getInvoice', e);
		uni.$api.router.back();
	}
}
function handleUpdate(type: string, id?: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.invoiceUpdate,
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
	background-color: #fff;
	.card_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0 20rpx 20rpx;
		.title {
			color: #303133;
		}
		.tips {
			color: #909399;
		}
	}
}
.ios-margin-bottom {
	height: 120rpx;
}
.footer-bottom {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 98;
	width: 100%;
	min-height: 120rpx;
	background-color: #fff;
	.footer_content {
		width: 100%;
		margin-bottom: env(safe-area-inset-bottom);
	}
}
</style>

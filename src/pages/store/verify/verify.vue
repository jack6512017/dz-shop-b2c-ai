<template>
	<view class="container">
		<dz-navbar title="核销平台" :background="{ background: theme.dzBgColor }" :is-back="false" :border-bottom="false"></dz-navbar>
		<view class="header">
			<view class="avatar"><dz-image :src="storeInfo.cover || missingFace" :width="130" :height="130" :borderRadius="20"></dz-image></view>
			<view class="info">
				<view class="dz-font-30 dz-font-weight">{{ storeInfo.title || '--' }}</view>
				<view class="dz-m-t-4 dz-m-b-4">
					营业时间：
					<template v-if="storeInfo.business_time"
						>{{ JSON.parse(storeInfo.business_time)[0] }}-{{ JSON.parse(storeInfo.business_time)[1] }}</template
					>
					<template v-else>全天</template></view
				>
				<view>地址：{{ storeInfo.address }}</view>
			</view>
		</view>
		<view class="setting">
			<view class="card" @tap="handleTabModalWhellCode">
				<view><dz-icon name="write" size="60"></dz-icon></view>
				<view class="dz-m-t-15 dz-color-6">输码核销</view>
			</view>
			<view class="card dz-m-l-20" @tap="handleTapScan">
				<view> <dz-icon name="scan" size="60"></dz-icon></view>
				<view class="dz-m-t-15 dz-color-6">扫码核销</view>
			</view>
		</view>
		<dz-section title="核销记录" bgColor="" fontSize="30" marginTop="30" marginBottom="30" :lineColor="theme.dzBaseColor" :right="false"></dz-section>
		<!-- 未登录 -->
		<view v-if="!hasLogin"><dz-empty :src="missingFace" margin-top="200" text="登录查看" iconSize="120" @click="login"></dz-empty></view>
		<block v-else>
			<view class="cell-content">
				<view class="cell-card" v-for="(item, index) in list" :key="index">
					<view class="top">
						<dz-image :src="item.prize_picture" :width="120" :height="120" borderRadius="10"></dz-image>
						<view class="dz-m-l-20">
							<view class="dz-font-30 dz-font-weight">{{ item.prize_title }}</view>
							<view calss="dz-font-24">数量: 1</view>
						</view>
					</view>
					<view class="dz-m-t-20 dz-color-9">核销时间：{{ api.timeFormat(item.created_time) }}</view>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无奖品" :src="emptyOrder" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom">
				<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-buttom="20"></dz-loadmore>
			</view>
		</block>
		<dz-modal
			v-model:show="wheelCodeShow"
			title="输码核销"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="showCancelButton"
			:async-close="true"
			@confirm="handleConfirm"
		>
			<dz-field
				v-model="wheelCodeInput"
				label="核销码"
				placeholder="输入核销码"
				:border-bottom="false"
				maxlength="20"
				style="margin: 20rpx 0 10rpx"
			></dz-field>
		</dz-modal>

		<dz-modal v-model:show="stateShow" title="" :mask-close-able="false" :show-cancel-button="false" :showConfirmButton="false">
			<view class="dz-flex dz-row-center">
				<dz-icon
					:name="apiCode == 200 ? 'roundcheckfill' : 'roundclosefill'"
					size="160"
					:color="apiCode == 200 ? theme.dzTypeSuccess : theme.dzTypeWarning"
				></dz-icon>
			</view>
			<view class="dz-text-center dz-p-40">{{ message }}</view>
			<view class="dz-p-30">
				<dz-button
					:border="false"
					:custom-style="{
						width: '100%',
						height: '100rpx',

						background: theme.dzBaseColor,
						color: theme.dzBaseFontColor,
					}"
					hover-class="none"
					shape="circle"
					@click="handleTabModalStateShow"
				>
					确定
				</dz-button>
			</view>
		</dz-modal>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, toRefs } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const missingFace = uni.$api.assetsConfig.missingFace;
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const storeId = ref<string>('');
const wheelCode = ref<string>('');
const showCancelButton = ref<boolean>(true);
const data = reactive({
	storeInfo: '',
	page: 1,
	list: [],
	loadingStatus: 'noData',
	wheelCodeShow: false,
	wheelCodeInput: '',
	stateShow: false,
	apiCode: 200,
	message: '',
});

const theme = computed(() => {
	return userStore.getTheme;
});

const hasLogin = computed(() => {
	return userStore.hasLogin;
});

const shopSetting = computed(() => userStore.getShopSetting);

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: '核销平台' });
	if (options.store_id) {
		storeId.value = options.store_id;
		getStore();
	}
	if (options.wheel_code) {
		wheelCode.value = options.wheel_code;
		if (hasLogin.value) {
			handleCheck();
			getList();
		}
	}
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getList();
});

watch(
	() => userStore.hasLogin,
	() => {
		if (hasLogin.value && wheelCode.value) {
			handleCheck();
			getList();
		}
	}
);

function getStore() {
	uni.$api.http
		.get(uni.$api.apiStore.luckyWheelCheckStore, {
			params: {
				store_id: storeId.value,
			},
		})
		.then((res) => {
			data.storeInfo = res.data;
		});
}

async function handleCheck(type?: string) {
	if (!hasLogin.value) {
		login();
		return;
	}

	await uni.$api.http
		.post(
			uni.$api.apiStore.luckyWheelCheck,
			{},
			{
				params: {
					wheel_code: wheelCode.value,
				},
			}
		)
		.then((res) => {
			data.apiCode = 200;
			data.message = res.message;
			data.stateShow = true;
			data.page = 1;
			data.list = [];
			getList();
		})
		.finally((err) => {
			if (type) {
				data.wheelCodeInput = '';
				data.wheelCodeShow = false;
				showCancelButton.value = true;
			}
		})
		.catch((err) => {
			if (err.code == 422) {
				// data.apiCode = err.code;
				// data.message = err.message;
				// data.stateShow = true;
			}
			if (err.code == 405) {
				uni.reLaunch({
					url: uni.$api.appConfig.indexPath,
				});
			}
		});
}

function handleTabModalWhellCode() {
	if (!hasLogin.value) {
		login();
		return;
	}

	data.wheelCodeShow = !data.wheelCodeShow;
}

function handleConfirm() {
	if (!data.wheelCodeInput) {
		return uni.$api.toast('请输入核销码');
	}
	showCancelButton.value = false;
	wheelCode.value = data.wheelCodeInput;
	handleCheck('input');
}

function handleTabModalStateShow() {
	data.stateShow = !data.stateShow;
}

async function handleTapScan() {
	if (!hasLogin.value) {
		login();
		return;
	}
	/*  #ifndef H5  */
	uni.scanCode({
		success: (res) => {
			scan(res.result);
		},
		fail: () => {},
	});
	/*  #endif  */
	/*  #ifdef H5  */
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		//注意公众号jweixin方法仅支持异步
		uni.$api.jweixin.ready(() => {
			uni.$api.jweixin.scanQRCode({
				needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				success(res) {
					scan(res.resultStr);
				},
				fail(err) {
					uni.$api.toast(uni.$api.language.index.scanError + err.errMsg);
				},
			});
		});
	} else {
		uni.$api.toast(uni.$api.language.application.needOprationInWechat);
	}
	/*  #endif  */
}

function scan(e: any) {
	const params = uni.$api.getRequestParameters(e);
	if (params.wheel_code) {
		wheelCode.value = params.wheel_code;
		handleCheck();
	} else {
		uni.$api.toast('您当前扫的二维码不正确，选择对应的二维码进行扫码核销');
	}
}

async function getList() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiStore.luckyWheelCheckList, {
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
		});

	uni.stopPullDownRefresh();
}

function login() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
	});
	return;
}

const { storeInfo, list, loadingStatus, wheelCodeInput, wheelCodeShow, apiCode, stateShow, message } = { ...toRefs(data) };
</script>

<style lang="scss">
.container {
	padding: 24rpx 24rpx 0;
}
.header {
	display: flex;
	padding: 40rpx 30rpx 20rpx;
}

.info {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin-left: 20rpx;
	font-size: 24rpx;
}

.setting {
	display: flex;
	margin-top: 20rpx;
}

.card {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 30rpx;
	background: #fff;
	border-radius: 20rpx;
}

.cell-content {
	padding-bottom: 1rpx;
}

.cell-card {
	padding: 30rpx;
	background-color: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
}

.top {
	display: flex;
}
</style>

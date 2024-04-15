<template>
	<view>
		<!-- 我的佣金 -->
		<dz-navbar
			:title="api.formatString(language.distribution.myCommission, shopSetting.commission_front_name)"
			:title-color="theme.dzBaseFontColor"
			back-icon-color="#fff"
			:border-bottom="false"
			:background="{ background: theme.dzBaseColor }"
		></dz-navbar>
		<view class="pure_top" :style="{ background: theme.dzBaseColor }">
			<view class="card" :style="{ color: theme.dzBaseFontColor }">
				<view class="price-box">
					<view>
						<text>{{ language.application.moneySymbol }}</text>
						<text class="price">{{ memberInfo.promoter ? memberInfo.promoter.user_brokerage : '0.00' }}</text>
					</view>
					<!-- 可提现佣金金额 -->
					<view class="dz-m-t-10">{{
						api.formatString(language.distribution.amountOfCommissionAvailableForWithdrawal, shopSetting.commission_front_name)
					}}</view>
					<view class="btn" @tap="toPage('brokerageIndex')">{{ language.distribution.theDetail }}</view>
				</view>
				<dz-row gutter="16" justify="space-between" class="dz-m-t-20">
					<dz-col span="3">
						<!-- 累计佣金 -->
						<view class="card-item">
							<text>{{ memberInfo.promoter ? memberInfo.promoter.accumulate_brokerage : '0.00' }}</text>
							<text class="dz-m-t-10">{{ api.formatString(language.profile.totalCommission, shopSetting.commission_front_name) }}</text>
						</view>
					</dz-col>
					<dz-col span="3">
						<!-- 可用佣金 -->
						<view class="card-item">
							<text>{{ memberInfo.promoter ? memberInfo.promoter.user_brokerage : '0.00' }}</text>
							<text class="dz-m-t-10">{{ api.formatString(language.profile.leftCommission, shopSetting.commission_front_name) }}</text>
						</view>
					</dz-col>
					<dz-col span="3">
						<!-- 销售笔数 -->
						<view class="card-item">
							<text>{{ memberInfo.promoter ? memberInfo.promoter.sell_num : '0.00' }}</text>
							<text class="dz-m-t-10">{{ language.distribution.salesNumber }}</text>
						</view>
					</dz-col>
					<dz-col span="3">
						<!-- 销售金额 -->
						<view class="card-item">
							<text>{{ memberInfo.promoter ? memberInfo.promoter.sell_money : '0.00' }}</text>
							<text class="dz-m-t-10">{{ language.distribution.theSalesAmount }}</text>
						</view>
					</dz-col>
				</dz-row>
			</view>
		</view>
		<view class="dz-m-t-80 dz-flex dz-row-center">
			<view style="width: 90%">
				<!-- 立即提现 -->
				<dz-button
					:disabled="parseInt(withdrawConfig.brokerage_withdraw_is_open) == 0"
					:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					hover-class="none"
					shape="circle"
					:border="false"
					@click="withdrawClick"
				>
					{{
						parseInt(withdrawConfig.brokerage_withdraw_is_open) == 0
							? language.distribution.withdrawalClosed
							: language.distribution.immediateWithdrawal
					}}
				</dz-button>
			</view>
		</view>
		<!-- 云账户签约 -->
		<dz-popup v-model:show="yunzhanghuShow" mode="center" width="90%" :closeable="true" closeIcon="close" border-radius="20">
			<view class="dz-text-center dz-font-32 dz-font-weight dz-p-t-30 dz-m-b-20">用户签约</view>
			<view class="member-type">
				<view class="card dz-m-r-30" @tap="handleSign(1)"> 中国人 </view>
				<view class="card" @tap="handleSign(2)">
					外籍人
					<text v-if="yunzhanghu_member_exempted" class="dz-font-24" :style="{ color: stateColorFilters(yunzhanghu_member_exempted.state) }"
						>({{ stateFilters(yunzhanghu_member_exempted.state) }})</text
					>
				</view>
			</view>
		</dz-popup>
		<!-- 新国都签约 -->
		<dz-modal
			v-model:show="yunhuotecShow"
			content="系统检查到您未签约，请签约后在重试"
			:show-cancel-button="true"
			@confirm="yunhuotecConfirm"
			:confirm-color="theme.dzBaseColor"
		></dz-modal>
		<dz-page-loading :show="loadingShow" :status="loadingStatus" :click="getMemberIndex"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh, onUnload } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const language = uni.$api.language;
const userStore = useUserStore();
const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const data = reactive({
	memberInfo: {},
	withdrawConfig: null,
	loadingShow: false,
	loadingStatus: 'loading',
	yunzhanghu_member_exempted: null,
	yunzhanghu_member: null,
	yunzhanghuShow: false,
	yunhuotec_member: null,
	yunhuotecShow: false,
});

const isYunhuotec = computed(() => {
	return data.yunhuotec_member ? true : false;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.formatString(language.distribution.myCommission, shopSetting.value.commission_front_name),
	});
	getMemberIndex();
	getWithdrawConfig();
	uni.$on('yunzhanghuMemberChange', () => {
		getWithdrawConfig();
	});
});

onPullDownRefresh(() => {
	data.memberInfo = {};
	getMemberIndex();
	getWithdrawConfig();
});

onUnload(() => {
	uni.$off(['yunzhanghuMemberChange']);
});

async function getMemberIndex() {
	data.loadingShow = true;
	await uni.$api.http
		.get(uni.$api.apiShop.distributionMemberIndex)
		.then((res) => {
			data.memberInfo = res.data;
		})
		.catch((err) => {
			data.loadingStatus = 'error';
			return;
		});
	data.loadingShow = false;
	uni.stopPullDownRefresh();
}

function toPage(url: string, type?: string) {
	const params = {};
	if (type) {
		params.type = type;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: params,
	});
}

//提现申请
async function withdrawClick() {
	if (!data.withdrawConfig) {
		uni.showLoading({
			mask: true,
		});
		let loaded = await getWithdrawConfig();
		uni.hideLoading();
		// 加载配置失败
		if (!data.withdrawConfig) {
			uni.$api.toast(language.profile.failedToLoadConfiguration);
			return;
		}
	}
	if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 0) {
		//普通提现账号
		toPage('brokerageCreate');
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 1) {
		if (isYunzhanghu()) {
			toPage('brokerageCreate', 'yunzhanghu');
		} else {
			data.yunzhanghuShow = true;
		}
	} else if (parseInt(data.withdrawConfig.brokerage_withdraw_mode) === 2) {
		if (isYunhuotec.value) {
			toPage('brokerageCreate', 'yunhuotec');
		} else {
			data.yunhuotecShow = true;
		}
	}
}

//获取提现配置
async function getWithdrawConfig() {
	await uni.$api.http
		.get(uni.$api.apiMember.brokerageWithdrawConfig)
		.then((res) => {
			data.withdrawConfig = res.data;
			data.yunzhanghu_member_exempted = res.data.yunzhanghu_member_exempted;
			data.yunzhanghu_member = res.data.yunzhanghu_member;
			data.yunhuotec_member = res.data.yunhuotec_member;
			return true;
		})
		.catch((err) => {
			return false;
		});
	uni.stopPullDownRefresh();
}

function isYunzhanghu(): boolean {
	let state = false;
	if (data.yunzhanghu_member && (data.yunzhanghu_member.is_sign == 1 || data.yunzhanghu_member.is_exempted == 1)) {
		state = true;
	}
	return state;
}

function handleSign(e: number) {
	if (e == 2) {
		toPage('yunzhanghuMemberExempted');
	} else {
		toPage('yunzhanghuMemberSign');
	}
	data.yunzhanghuShow = false;
}

function stateFilters(val: number | string): string {
	switch (parseInt(val)) {
		case 0:
			return '待审核';
		case -1:
			return '已拒绝';
		case 1:
			return '已通过';
	}
}

function stateColorFilters(val: number | string): string {
	switch (parseInt(val)) {
		case 0:
			return '#ff9900';
		case -1:
			return '#fa3534';
		case 1:
			return '#19be6b';
	}
}

function yunhuotecConfirm() {
	toPage('yunhuotecMemberSign');
	data.yunhuotecShow = false;
}

const { memberInfo, withdrawConfig, loadingShow, loadingStatus, yunzhanghuShow, yunzhanghu_member_exempted, yunhuotecShow } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.pure_top {
	width: 100%;
	height: 360rpx;
	position: relative;
	z-index: 0;
	overflow: hidden;
}

.pure_top::after {
	content: '';
	width: 160%;
	height: 360rpx;
	position: absolute;
	left: -30%;
	top: 0;
	border-radius: 0 0 50% 50%;
}
.card {
	position: relative;
	z-index: 1;
	.price-box {
		text-align: center;
		position: relative;
		padding: 40rpx 0;
		.price {
			font-size: 48rpx;
		}
		.btn {
			position: absolute;
			height: 46rpx;
			top: 20rpx;
			right: 0;
			padding: 0 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			line-height: 46rpx;
			font-size: 28rpx;
			border-radius: 23rpx 0 0 23rpx;
			background-color: rgba(255, 255, 255, 0.4);
		}
	}
}
.card-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.content {
	position: relative;
	margin: -100rpx 24rpx 0;
	padding: 30rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
}
</style>

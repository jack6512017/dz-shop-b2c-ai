<template>
	<view>
		<dz-navbar title="会员等级"></dz-navbar>
		<view class="account-level">
			<view class="title">等级说明</view>
			<dz-table thHeight="80" tdHeight="120">
				<dz-tr>
					<dz-th width="25%">级别名称</dz-th>
					<dz-th width="33%">减除折扣</dz-th>
					<dz-th>升级条件(元)</dz-th>
				</dz-tr>

				<dz-tr v-for="(item, index) in memberLevelList" :key="index">
					<dz-td width="25%">{{ item.name }}</dz-td>
					<dz-td width="33%"> {{ item.discount }} 折 </dz-td>
					<dz-td>{{ item.upgrade_condition.toString() || '--' }}</dz-td>
				</dz-tr>
			</dz-table>
			<view class="title">保级说明</view>
			<dz-table thHeight="80" tdHeight="120">
				<dz-tr>
					<dz-th width="25%">级别名称</dz-th>
					<dz-th>会费</dz-th>
					<dz-th>有效期</dz-th>
				</dz-tr>
				<dz-tr v-for="(item, index) in memberLevelList" :key="index">
					<dz-td width="25%">{{ item.name }}</dz-td>
					<dz-td>
						<template v-if="[1, 2].includes(item.mode)">
							<view>月卡费用: {{ item.card_month_price }}</view>
							<view>季卡费用: {{ item.card_season_price }}</view>
							<view>年卡费用: {{ item.card_year_price }}</view>
						</template>
						<template v-else>--</template>
					</dz-td>
					<dz-td> {{ item.upgrade_expired_days == -1 ? '永久有效' : `有效天数${item.upgrade_expired_days}天` }}</dz-td>
				</dz-tr>
			</dz-table>
			<view class="dz-m-t-20 dz-font-24 dz-color-9">注：会员商品有折扣优惠</view>
			<!-- 	<view class="advance-area">
				<view class="flex-box tc thead">
					<view class="item-3">级别名称</view>
					<view class="item-3">升级条件(元)</view>
					<view class="item-3">说明</view>
				</view>
				<view class="flex-box table tc" v-for="(item, index) in memberLevelList" :key="index">
					<text class="item-3">{{ item.name }}</text>
					<text class="item-3">
						<text>{{ item.upgrade_condition.toString() }}</text>
					</text>
					<text class="item-3 font-sm"><text>会员商品有折扣优惠</text></text>
				</view>
			</view> -->
		</view>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStaus" @click="getMemberLevelIndex"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const pageLoadingShow = ref<boolean>(true);
const pageLoadingStaus = ref<string>('loading');
const memberLevelList = ref([]);

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '会员等级',
	});

	getMemberLevelIndex();
});

function getMemberLevelIndex() {
	uni.$api.http
		.get(uni.$api.apiMember.memberLevelIndex)
		.then((res) => {
			memberLevelList.value = res.data;
			pageLoadingShow.value = false;
		})
		.catch(() => {
			pageLoadingShow.value = 'error';
		});
}
</script>

<style lang="scss">
page {
	background-color: #ffffff;
}
.account-level {
	padding: 30rpx;
	display: flex;
	flex: 1;
	flex-direction: column;
	.flex-box {
		display: flex;
		flex-wrap: wrap;
	}
	.flex-box > .item-2 {
		flex: 0 0 50%;
	}
	.flex-box > .item-3 {
		flex: 0 0 33.3333%;
		height: 100rpx;
	}
	.flex-box > .item-4 {
		flex: 0 0 25%;
	}
	.title {
		margin: 30rpx 0;
		font-size: 32rpx;
		font-weight: 600;
		color: $dz-main-color;
	}
	//普通表格
	.genaral-area {
		.item-2 {
			font-size: 26rpx;
			border: 1rpx solid $dz-border-color;
			border-width: 1rpx 1rpx 0 0;
			padding: 16rpx 0;
			box-sizing: border-box;
			text-align: center;

			&:first-child {
				border-left-width: 1rpx;
			}

			&:last-child {
				border-right-width: 1rpx;
			}
		}

		.thead {
			.item-2 {
				font-weight: bold;

				box-sizing: border-box;
			}
		}

		.table {
			&:last-child {
				border-bottom: 1rpx solid $dz-border-color;
			}

			.item-2 {
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
			}
		}
	}
	// 多行合并表格
	.advance-area {
		.item-3,
		.item-4 {
			font-size: 26rpx;
			border: 1rpx solid $dz-border-color;
			border-width: 1rpx 1rpx 0 0;
			box-sizing: border-box;
			text-align: center;
			&:first-child {
				border-left-width: 1rpx;
			}

			&:last-child {
				border-right-width: 1rpx;
			}
		}
		.thead {
			.item-3,
			.item-4 {
				font-weight: bold;
				padding: 16rpx 0;
				box-sizing: border-box;
			}
		}
		.table {
			&:last-child {
				border-bottom: 1rpx solid $dz-border-color;
			}

			.item-3,
			.item-4 {
				display: flex;
				justify-content: center;
				align-items: center;
				box-sizing: border-box;
			}
		}
		.table-flex {
			flex: 1;

			.item {
				border-bottom: 1rpx solid $dz-border-color;
				padding: 10rpx 0;
				box-sizing: border-box;

				&:last-child {
					border-width: 0;
				}
			}
		}
		.font-sm {
			font-size: 24rpx;
			padding: 0 10rpx;
		}
	}
}
</style>

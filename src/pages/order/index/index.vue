<template>
	<view>
		<dz-navbar :title="language.order.myOrder" :borderBottom="false" :is-fixed="true"></dz-navbar>
		<view class="dz-tab">
			<view class="dz-search">
				<dz-input
					v-model="keyword"
					prefixIcon="search"
					prefixIconStyle="color:#606266"
					placeholder="输入商品名称"
					:clearable="true"
					border="none"
					:customStyle="{ padding: '8rpx 20rpx', borderRadius: '50rpx', background: theme.dzBgColor }"
					@confirm="search"
					@change="inputFocus"
				>
					<template #suffix>
						<view class="dz-content-color dz-p-b-2" @tap="search">搜索</view>
					</template>
				</dz-input>
				<dz-icon
					name="filter"
					label="筛选"
					size="32"
					:color="isFilter ? theme.dzBaseColor : theme.dzMainColor"
					customStyle="padding-left: 20rpx;"
					@click="dropdownTap"
				></dz-icon>
			</view>
			<view class="dz-dropdown" :class="[selectHeight > 0 ? 'dz-dropdown-show' : '']">
				<view class="dz-dropdown-content" :style="{ height: selectHeight + 'rpx' }">
					<view>
						<view class="dz-m-b-30 dz-font-weight-light">按时间选择</view>
						<dz-row>
							<dz-col :span="4" gutter="20" v-for="(item, index) in timeOption" :key="index">
								<dz-button
									:custom-style="{
										width: '100%',
										height: '64rpx',
										marginBottom: '20rpx',
										background: item.value == ativeTime ? theme.dzBaseColor : theme.dzBgColor,
										color: item.value == ativeTime ? theme.dzBaseFontColor : theme.dzMainColor,
									}"
									hover-class="none"
									:border="false"
									size="mini"
									shape="circle"
									throttleTime="100"
									@click="ativeClick('ativeTime', item.value)"
								>
									{{ item.label }}
								</dz-button>
							</dz-col>
						</dz-row>
						<view class="dz-flex dz-m-l-10 dz-m-r-10" @tap="timeSelect">
							<view class="dz-flex-1">
								<dz-button
									:border="false"
									:custom-style="{
										width: '100%',
										height: '64rpx',
										background: start_time ? theme.dzBaseColor : theme.dzBgColor,
										color: start_time ? theme.dzBaseFontColor : theme.dzMainColor,
									}"
									hover-class="none"
									size="mini"
									shape="circle"
									@click="timeSelect"
								>
									{{ start_time ? start_time : '结束时间' }}
								</dz-button>
							</view>
							<dz-icon name="move" custom-style="margin: 0 10rpx"></dz-icon>
							<view class="dz-flex-1">
								<dz-button
									:border="false"
									:custom-style="{
										width: '100%',
										height: '64rpx',
										background: end_time ? theme.dzBaseColor : theme.dzBgColor,
										color: end_time ? theme.dzBaseFontColor : theme.dzMainColor,
									}"
									hover-class="none"
									size="mini"
									shape="circle"
									@click="timeSelect"
								>
									{{ end_time ? end_time : '结束时间' }}
								</dz-button>
							</view>
						</view>
						<view class="dz-m-t-30 dz-m-b-30 dz-font-weight-light">按类型选择</view>
						<dz-row>
							<dz-col :span="4" gutter="20" v-for="(item, index) in orderTypeOption" :key="index">
								<dz-button
									:custom-style="{
										width: '100%',
										height: '64rpx',
										marginBottom: '20rpx',
										background: item.value == orderType ? theme.dzBaseColor : theme.dzBgColor,
										color: item.value == orderType ? theme.dzBaseFontColor : theme.dzMainColor,
									}"
									hover-class="none"
									:border="false"
									size="mini"
									shape="circle"
									throttleTime="100"
									@click="ativeClick('orderType', item.value)"
								>
									{{ item.label }}
								</dz-button>
							</dz-col>
						</dz-row>
					</view>
					<view class="dz-flex dz-m-t-40">
						<view class="dz-flex-1">
							<dz-button
								:border="false"
								:custom-style="{ width: '100%', height: '78rpx', background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
								hover-class="none"
								size="medium"
								shape="circle"
								@click="reset"
							>
								重置
							</dz-button>
						</view>
						<view class="dz-flex-1 dz-m-l-20">
							<dz-button
								:border="false"
								:custom-style="{ width: '100%', height: '78rpx', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
								hover-class="none"
								size="medium"
								shape="circle"
								@click="search"
							>
								确定
							</dz-button>
						</view>
					</view>
				</view>
			</view>
			<view class="dz-dropdown-mask" :class="[selectHeight > 0 ? 'dz-mask-show' : '']" @tap.stop="hideDropdownList"></view>
			<dz-tabs
				:list="list"
				:current="current"
				:scrollable="false"
				:activeStyle="{
					color: theme.dzBaseColor,
				}"
				:lineColor="theme.dzBaseColor"
				lineHeight="4"
				@change="tabsChange"
			></dz-tabs
		></view>
		<!--内容-->
		<view class="dz-content">
			<view class="dz-item" v-for="(item, index) in orderList" :key="index">
				<view class="top">
					<view class="sn" @tap.stop="copy(item.order_sn)">
						<dz-tag
							class="dz-m-r-10"
							:bg-color="theme.dzBaseDisabled"
							:color="theme.dzBaseFontColor"
							mode="dark"
							size="mini"
							v-if="item.marketing_type == 'combination'"
						>
							组合套餐
						</dz-tag>
						<dz-tag
							class="dz-m-r-10"
							:bg-color="theme.dzBaseDisabled"
							:color="theme.dzBaseFontColor"
							mode="dark"
							size="mini"
							v-if="item.marketing_type == 'join_buy'"
						>
							拼团
						</dz-tag>
						<dz-tag
							class="dz-m-r-10"
							:bg-color="theme.dzBaseDisabled"
							:color="theme.dzBaseFontColor"
							mode="dark"
							size="mini"
							v-if="item.marketing_type == 'limited_buy'"
						>
							限量购
						</dz-tag>
						<dz-tag
							class="dz-m-r-10"
							:bg-color="theme.dzBaseDisabled"
							:color="theme.dzBaseFontColor"
							mode="dark"
							size="mini"
							v-if="item.marketing_type == 'haggle'"
						>
							砍价
						</dz-tag>
						<dz-tag
							class="dz-m-r-10"
							:bg-color="theme.dzBaseDisabled"
							:color="theme.dzBaseFontColor"
							mode="dark"
							size="mini"
							v-if="item.marketing_type == 'discount'"
						>
							限时折扣
						</dz-tag>
						<dz-tag
							class="dz-m-r-10"
							:bg-color="theme.dzBaseDisabled"
							:color="theme.dzBaseFontColor"
							mode="dark"
							size="mini"
							v-if="item.order_type == '6'"
						>
							预售
						</dz-tag>
						<dz-tag
							class="dz-m-r-10"
							:bg-color="theme.dzBaseColor"
							:color="theme.dzBaseFontColor"
							mode="dark"
							size="mini"
							v-if="isPickupOrder(item, 1)"
						>
							提货订单
						</dz-tag>
						{{ item.order_sn }}
					</view>
					<!-- <view class="on-color" :style="{color:theme.dzBaseColor}" v-if="refundStatus(item)">售后商品 x{{refundStatus(item)}}</view> -->
					<view class="on-color" :style="{ color: theme.dzBaseColor }">{{ orderStatusFilter(item.order_status, item) }}</view>
					<view
						class="on-color"
						:style="{ color: theme.dzBaseColor }"
						v-if="item.order_status == 101 && item.close_left_time && item.close_left_time > 0"
					>
						正在开团中
					</view>
					<view
						class="on-color"
						:style="{ color: theme.dzBaseColor }"
						v-if="item.order_status == 101 && item.close_left_time && item.close_left_time < 0"
					>
						开团超时
					</view>
				</view>
				<view class="order-content" @tap="toOrderDetail(item)">
					<block v-for="(orderItem, orderIndex) in item.product" :key="orderIndex">
						<view v-if="orderIndex < item.moreNum" class="order-item">
							<view class="left">
								<view class="image"><dz-image :src="orderItem.product_picture" :borderRadius="15" :width="170" :height="170"></dz-image></view>
								<view class="title">
									<view class="name">
										<dz-tag
											class="dz-m-r-10"
											:bg-color="theme.dzBaseColor"
											:border-color="theme.dzBaseColor"
											:color="theme.dzBaseFontColor"
											mode="dark"
											size="mini"
											:show="parseInt(orderItem.gift_flag) > 0 ? true : false"
											:text="language.orderCreate.giveaways"
										></dz-tag>
										{{ orderItem.product_name }}
									</view>

									<view class="sku">{{ orderItem.sku_name || '默认款' }}</view>
								</view>
							</view>
							<view class="right">
								<view class="price-box">
									<view v-if="!isPickupOrder(item, 1)"
										>￥{{ item.marketing_type == 'combination' ? orderItem.product_original_money : orderItem.price }}</view
									>
									<view>x{{ orderItem.num }}</view>
								</view>
							</view>
						</view>
					</block>
				</view>
				<view v-if="item.product.length > item.moreNum" class="dz-font-24 dz-color-9" @tap="moreTap(index)">
					显示剩余{{ item.product.length - 2 }}种商品
					<dz-icon class="dz-m-l-6" name="unfold"></dz-icon>
				</view>
				<view class="tip" v-if="!isPickupOrder(item, 1)">
					<text>￥{{ item.pay_money }}</text>
					共{{ item.product_count }}件商品,总金额
				</view>
				<view class="tip" v-else>共{{ item.product_count }}件商品</view>
				<view
					class="bottom"
					:class="{
						'dz-m-t-40': item.order_status != 1 || item.marketing_type != '',
					}"
				>
					<!-- 拼团倒计时 -->
					<view v-if="item.order_status == 101 && item.close_left_time && item.close_left_time > 0">
						<text class="del">{{ language.joinBuyGroup.joinBuyLeftTime }}</text>
						<dz-count-down
							class="dz-m-l-10"
							:timestamp="item.close_left_time"
							:show-days="false"
							:color="theme.dzBaseColor"
							:separator-color="theme.dzBaseColor"
							:bg-color="'transparent'"
							@timeEnd="joinBuyTimeout(item.id)"
						></dz-count-down>
					</view>
					<!-- 后订单将关闭 -->
					<view
						v-if="parseInt(item.order_status) === 0 && item.close_left_time && item.close_left_time > 0"
						:class="[parseInt(item.order_status) === 0 ? 'on-color' : '']"
						:style="{
							color: parseInt(item.order_status) === 0 ? theme.dzBaseColor : '',
						}"
					>
						<dz-count-down
							:timestamp="item.close_left_time"
							:show-days="false"
							:show-hours="true"
							:color="theme.dzBaseColor"
							:separator-color="theme.dzBaseColor"
							@timeEnd="timeout(index)"
						></dz-count-down>
						后订单将关闭
					</view>
					<view v-if="deleteState(item)" class="del" @tap="OrderClose(item, index)"> 删除订单 </view>
					<view v-else></view>
					<view class="btn">
						<dz-button
							v-if="parseInt(item.order_status) === 4 || (parseInt(item.order_status) === -4 && !['join_buy'].includes(item.marketing_type))"
							type="info"
							size="mini"
							shape="circle"
							:border="false"
							hoverClass="none"
							:custom-style="{
								width: '120rpx',
								background: '#FFF',
								marginLeft: '20rpx',
								border: '1rpx solid rgba(0, 0, 0, 0.12)',
							}"
							@click="puy(item)"
						>
							再次购买
						</dz-button>
						<dz-button
							v-if="evaluateState(item)"
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '120rpx',
								marginLeft: '20rpx',
							}"
							hover-class="none"
							size="mini"
							shape="circle"
							:border="false"
							@click="toEvaluation(item)"
						>
							去评论
						</dz-button>
						<dz-button
							v-if="item.order_status == 0 || item.order_status == 202"
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '120rpx',
								marginLeft: '20rpx',
							}"
							hover-class="none"
							:border="false"
							size="mini"
							shape="circle"
							@click="pay(item)"
						>
							{{ item.order_status == 0 ? '去支付' : '支付余款' }}
						</dz-button>
						<dz-button
							v-if="shippingState(item)"
							type="info"
							size="mini"
							shape="circle"
							:border="false"
							hoverClass="none"
							:custom-style="{
								width: '120rpx',
								background: '#FFF',
								marginLeft: '20rpx',
								border: '1rpx solid rgba(0, 0, 0, 0.12)',
							}"
							@click="toShipping(item.id, 'shipping')"
						>
							查看物流
						</dz-button>
						<dz-button
							v-if="orderState(item, 2)"
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '120rpx',
								marginLeft: '20rpx',
							}"
							hover-class="none"
							:border="false"
							size="mini"
							shape="circle"
							@click="orderTakeDelivery(item, index)"
						>
							确认收货
						</dz-button>
						<dz-button
							v-if="item.marketing_type == 'join_buy'"
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '120rpx',
								marginLeft: '20rpx',
							}"
							hover-class="none"
							:border="false"
							size="mini"
							shape="circle"
							@click="toShipping(item.join_buy_id, 'joinBuyDetail')"
						>
							拼团详情
						</dz-button>
						<dz-button
							v-if="item.marketing_type == 'haggle'"
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '120rpx',
								marginLeft: '20rpx',
							}"
							hover-class="none"
							size="mini"
							shape="circle"
							:border="false"
							@click="toShipping(item.marketing_id, 'haggleDetails')"
						>
							砍价详情
						</dz-button>
					</view>
				</view>
			</view>
			<dz-empty v-if="loadingStatus == 'noData'" margin-top="80" text="暂无订单 ,去逛逛~" :src="emptyOrder" iconSize="360"></dz-empty>
			<view class="dz-ios-p-safe-bottom"><dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="0"></dz-loadmore></view>
		</view>
		<!-- 确定收货提醒 -->
		<dz-modal
			v-model:show="isShow"
			:mask-close-able="false"
			title="确认收货"
			content="请确定在收到商品后操作哦"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			:async-close="true"
			@cancel="takeDeliveryCancel"
			@confirm="takeDeliveryConfirm"
		></dz-modal>
		<!-- 取消订单提醒 -->
		<dz-modal
			v-model:show="closeShow"
			:mask-close-able="false"
			content="确定要取消该订单"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			:async-close="true"
			@cancel="orderCloseCancel"
			@confirm="orderCloseConfirm"
		></dz-modal>
		<dz-calendar
			v-model="timeShow"
			mode="range"
			:activeBgColor="theme.dzBaseColor"
			:activeBgDisabledColor="theme.dzBaseDisabled"
			:activeColor="theme.dzBaseFontColor"
			:rangeBgColor="api.colorToRgba(theme.dzBaseDisabled)"
			:rangeColor="theme.dzBaseColor"
			toolTip="选择时间"
			@change="timeConfirm"
		></dz-calendar>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onUnload, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const emptyOrder = uni.$api.assetsConfig.emptyOrder;
const timeOption = [
	{
		label: '近1个月',
		value: 1,
	},
	{
		label: '近3个月',
		value: 3,
	},
	{
		label: '近6个月',
		value: 6,
	},
];
const orderTypeOption = [
	{
		label: '普通订单',
		value: 1,
	},
	{
		label: '组合订单',
		value: 3,
	},
	{
		label: '拼团订单',
		value: 4,
	},
	{
		label: '限量购订单',
		value: 5,
	},
	{
		label: '预售订单',
		value: 6,
	},
	{
		label: '砍价订单',
		value: 7,
	},
];
const data = reactive({
	current: 0,
	list: [
		{
			status: null,
			name: '全部',
		},
		{
			status: 0,
			name: '待付款',
		},
		{
			status: 1,
			name: '待发货',
		},
		{
			status: 2,
			name: '待收货',
		},
		{
			status: 3,
			name: '评论',
		},
	],
	page: 1,
	orderList: [],
	loadingStatus: 'loading',
	orderStatus: uni.$api.dataConfig.orderStatus,
	takeDelivery: {}, // 确定参数
	isShow: false,
	closeShow: false,
	isKeyword: false,
	keyword: '',
	selectHeight: 0,
	orderType: null,
	ativeTime: '',
	timeShow: false,
	start_time: '',
	end_time: '',
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.language.order.myOrder,
	});
	if (options.status) {
		data.current = parseInt(options.status) - 1;
	}
	uni.$on('orderChange', (data) => {
		deleteOrder(data.id);
	});
	initOrderList();
});

onUnload(() => {
	uni.$off('orderChange');
});

onPullDownRefresh(() => {
	initOrderList();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getOrderList();
});

const theme = computed(() => {
	return userStore.getTheme;
});

const isFilter = computed(() => {
	return data.orderType || data.ativeTime || data.start_time || data.end_time ? true : false;
});

//删除指定订单
function deleteOrder(id: number) {
	if (!id) {
		return;
	}
	let orderId = parseInt(id);
	for (let i = 0; i < data.orderList.length; i++) {
		if (orderId == parseInt(data.orderList[i].id)) {
			data.orderList.splice(i, 1);
		}
	}
}

//初始化订单
function initOrderList() {
	data.page = 1;
	data.orderList = [];
	getOrderList();
}

//tabs滑动事件
function tabsChange({ index }) {
	if (data.current == index) return;
	data.current = index;
	initOrderList();
}

//获取订单
async function getOrderList() {
	data.loadingStatus = 'loading';
	const params = {};
	if (data.keyword) {
		params.keyword = data.keyword;
	}
	if (data.orderType) {
		params.order_type = data.orderType;
	}
	if (data.start_time && data.end_time) {
		params.start_time = data.start_time + ' 00:00:00';
		params.end_time = data.end_time + ' 23:59:59';
	}
	if (data.ativeTime) {
		params.start_time = uni.$api.getNewDate(data.ativeTime);
		params.end_time = uni.$api.timeFormat(new Date(), 'yyyy-mm-dd');
	}
	await uni.$api.http
		.get(uni.$api.apiMember.orderIndex, {
			params: {
				page: data.page,
				synthesize_status: data.list[data.current].status,
				page_size: uni.$api.appConfig.pageSize,
				...params,
			},
		})
		.then((res) => {
			res.data.forEach((item) => {
				item.moreNum = 2;
			});
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.orderList = [...data.orderList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'noData';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}

// 清除搜索
function inputFocus() {
	if (!data.keyword) {
		search();
	}
}

// 确定搜索
function search() {
	data.orderList = [];
	data.selectHeight = 0;
	getOrderList();
}

function dropdownTap() {
	data.selectHeight = 660;
}

function hideDropdownList() {
	data.selectHeight = 0;
}

function ativeClick(type: string, index: number) {
	if (data[type] == index) {
		data[type] = '';
		return;
	}
	data[type] = index;
}

function reset() {
	data.keyword = '';
	data.orderType = '';
	data.ativeTime = '';
	data.start_time = '';
	data.end_time = '';
}

function timeSelect() {
	data.timeShow = true;
}

function timeConfirm(e) {
	data.ativeTime = '';
	data.start_time = e.startDate;
	data.end_time = e.endDate;
}

// 提货订单状态
function isPickupOrder(val, state) {
	if (val.product) {
		return val.product.every((item) => parseInt(item.warehouse_is_pickup) === state);
	}
}

// 订单状态
function orderState(val, state) {
	if (val.product) {
		return val.product.every((item) => parseInt(item.order_status) === state);
	}
}

// 售后状态
function refundStaus(item, val) {
	if (item.product) {
		return item.product.every((res) => val.indexOf(parseInt(res.refund_status)) !== -1);
	}
}

//删除状态
function deleteState(item) {
	return orderState(item, -3) || orderState(item, -4) || (item.order_status == 101 && item.close_left_time && parseInt(item.close_left_time) < 0);
}

//评论状态
function evaluateState(item) {
	return (orderState(item, 3) || orderState(item, 4)) && isEvaluate(item, 0) && refundStaus(item, [0, 8]);
}

//物流状态
function shippingState(item) {
	return (
		(item.order_status == 4 || item.order_status == 3 || item.order_status == 2 || item.order_status == 12) &&
		item.is_virtual &&
		item.is_virtual != 1 &&
		item.shipping_type == 1
	);
}

function moreTap(index) {
	data.orderList[index].moreNum = data.orderList[index].product.length;
}

// 是否可评论
function isEvaluate(val, state) {
	if (val.product) {
		return val.product.every((item) => item.evaluate_status == state);
	}
}

function orderStatusFilter(status, item) {
	let state;
	data.orderStatus.forEach((orderItem) => {
		if (orderItem.key === parseInt(status)) {
			state = orderItem.value;
			if (item.shipping_type == 2) {
				switch (parseInt(status)) {
					case 1:
						state = '待提货';
						break;
					case 2:
						state = '已提货';
						break;
					case 3:
						state = '已提货';
						break;
				}
			}
		}
	});
	return state;
}

// refundStatus(val) {
// 	let status = 0;
// 	val.product.forEach(item=>{
// 		if(parseInt(item.refund_status) != 0) {
// 			status = status+1
// 		}
// 	})
// 	return status
// },

// 订单详情
function toOrderDetail(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderDetail,
		query: {
			id: item.id,
		},
	});
}

// 去评论
function toEvaluation(item, type) {
	if (item.product.length > 1) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.evaluationIndex,
			query: {
				id: item.id,
				type: type,
			},
		});
	} else {
		uni.$api.router.push({
			route: uni.$api.routesConfig.evaluation,
			query: {
				data: JSON.stringify(item),
				type: type,
			},
		});
	}
}

// 再次去购买
function puy(item) {
	let data = {};
	data.type = 'buy_again';
	data.buy_again_id = item.id;
	data.data = 'buy_again';
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(data)),
		},
	});
}

// 删除订单
async function OrderClose(item, index) {
	await uni.$api.http
		.delete(
			uni.$api.apiShop.orderDelete,
			{},
			{
				params: {
					id: item.id,
				},
			}
		)
		.then((res) => {
			data.orderList.splice(index, 1);
			uni.$api.toast('订单删除成功');
		});
}

// 确定收货
function orderTakeDelivery(item, index) {
	data.isShow = true;
	data.takeDelivery.id = item.id;
	data.takeDelivery.index = index;
}

// 取消收货
function takeDeliveryCancel() {
	data.isShow = false;
}

// 确认收货
async function takeDeliveryConfirm() {
	await uni.$api.http
		.get(uni.$api.apiMember.orderTakeDelivery, {
			params: {
				id: data.takeDelivery.id,
			},
		})
		.then((res) => {
			if (parseInt(data.current) == 3) {
				data.orderList.splice(data.takeDelivery.index);
				if (data.orderList.length == 0) {
					data.loadingStatus = 'noData';
				}
			} else {
				data.orderList[data.takeDelivery.index].product.forEach((item) => {
					item.order_status = 3;
				});
			}
			data.isShow = false;
			initOrderList();
		});
}

// 查看物流id
function toShipping(id, url) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			id,
		},
	});
}

// 取消订单
function orderClose(item, index) {
	data.closeShow = true;
	data.takeDelivery.id = item.id;
	data.takeDelivery.index = index;
}

function orderCloseCancel() {
	data.closeShow = false;
}

async function orderCloseConfirm() {
	await uni.$api.http
		.get(uni.$api.apiShop.orderClose, {
			params: {
				id: data.takeDelivery.id,
			},
		})
		.then(() => {
			data.orderList.splice(data.takeDelivery.index, 1);
			if (data.orderList.length == 0) {
				data.loadingStatus = 'noData';
			}
			data.closeShow = false;
		});
}

// 去支付
function pay(val) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.pay,
		query: {
			id: val.id,
		},
	});
}

//复制
function copy(text) {
	uni.$api.copy(text);
	uni.$api.toast(uni.$api.language.application.copySuccess);
}

//拼团超时
function joinBuyTimeout(id) {
	for (let i = 0; i < data.orderList.length; i++) {
		if (data.orderList[i].id === id) {
			data.orderList[i].close_left_time = -1;
			break;
		}
	}
}

function timeout(index: number) {
	data.orderList[index].close_left_time = -1;
	data.orderList[index].order_status = -4;
}

const { list, current, orderList, loadingStatus, isShow, closeShow, keyword, selectHeight, orderType, ativeTime, timeShow, start_time, end_time } = {
	...toRefs(data),
};
</script>

<style lang="scss">
.dz-tab {
	position: fixed;
	width: 100%;
	z-index: 2;
	background-color: #fff;
	.dz-search {
		display: flex;
		padding: 0 24rpx;
		background-color: #fff;
	}

	.dz-dropdown {
		width: 100%;
		position: absolute;
		background: #fff;
		border-bottom-left-radius: 40rpx;
		border-bottom-right-radius: 40rpx;
		overflow: hidden;
		box-sizing: border-box;
		padding-top: 10rpx;
		left: 0;
		top: 64rpx;
		visibility: hidden;
		transition: all 0.2s ease-in-out;
		z-index: 99;
	}
	.dz-dropdown-show {
		visibility: visible;
	}
	.dz-dropdown-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: -1;
		transition: all 0.2s ease-in-out;
		opacity: 0;
		visibility: hidden;
	}
	.dz-mask-show {
		opacity: 1;
		visibility: visible;
	}
	.dz-dropdown-content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 20rpx 20rpx 30rpx;
	}
}

.dz-content {
	margin-top: 150rpx;
	padding: 20rpx 20rpx 1rpx;
}

.dz-item {
	padding: 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	margin-bottom: 20rpx;

	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		.sn {
			display: flex;
			align-items: center;
			font-size: 28rpx;
			color: $dz-main-color;
			font-weight: bold;
		}
	}

	.marketing {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
}

.order-content {
	margin-top: 30rpx;
	.order-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		.left {
			display: flex;
			.image {
				flex-shrink: 0;
				width: 170rpx;
				height: 170rpx;
				border-radius: 10rpx;
				background-color: $dz-bg-color;
			}
			.title {
				margin-left: 20rpx;
				.name {
					line-height: 40rpx;
					color: $dz-main-color;
					font-size: 28rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}
				.sku {
					margin-top: 10rpx;
					font-size: 24rpx;
					color: $dz-content-color;
				}
			}
		}

		.right {
			.price-box {
				margin-left: 10rpx;
				text-align: right;
				font-size: 24rpx;
				color: $dz-tips-color;
			}
		}
	}
}

.tip {
	display: flex;
	flex-direction: row-reverse;
	align-items: center;
	width: 100;
	padding-top: 20rpx;
	font-size: 24rpx;
	color: $dz-tips-color;
	text {
		margin-left: 10rpx;
		font-size: 32rpx;
		color: $dz-main-color;
	}
}
.bottom {
	display: flex;
	justify-content: space-between;

	.del {
		color: $dz-content-color;
	}
}

.color {
	color: $dz-main-color;
}
</style>

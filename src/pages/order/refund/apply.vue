<template>
	<view>
		<dz-navbar title="申请退款"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="退款原因" prop="refund_reason" :borderBottom="true">
					<dz-input v-model="form.refund_reason" clearable border="none" placeholder="请输入退款原因"></dz-input>
				</dz-form-item>
				<dz-form-item :label="infoData.warehouse_is_pickup == 1 ? '退增库存' : '退款金额'" :borderBottom="true">
					<view class="price" :style="{ color: theme.dzBaseColor }">
						<text v-if="infoData.warehouse_is_pickup == 1">{{ infoData.num }}件</text>
						<text v-else>￥{{ money }}</text>
					</view>
				</dz-form-item>
				<dz-form-item label="问题描述(选填)" :borderBottom="true">
					<dz-textarea
						v-model="form.refund_explain"
						type="textarea"
						placeholder="申请售后具体原因,如商品物流服务的问题"
						border="none"
						:height="120"
						customStyle="padding:0rpx"
					>
					</dz-textarea>
				</dz-form-item>
				<view class="tip">
					<view>温馨提示: 订单退款金额已支付金额为准,不包括优惠劵抵扣金额,且订单申请退款后优惠劵将不会返还,请您谨慎操作</view>
					<view class="dz-m-t-10">无质量问题退货所产生的物流费用由买家承担,从退款中直接扣除</view>
				</view>
			</dz-form>
		</view>
		<view class="button" style="margin-top: 100rpx">
			<dz-button
				:custom-style="{ width: '100%', background: isLoading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				:border="false"
				hover-class="none"
				shape="circle"
				:loading="isLoading"
				@click="submit"
			>
				提交退款申请
			</dz-button>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, toRefs, unref } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const formRef = ref(null);
const form = reactive({
	refund_reason: '误购',
	refund_explain: '',
});

const data = reactive({
	isLoading: false,
	infoData: {},
	shipping_money: 0,
	money: 0,
});

const rules = {
	refund_reason: {
		type: 'string',
		required: true,
		message: '请输入退款原因',
		trigger: ['change', 'blur'],
	},
};

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '申请退款',
	});
	data.infoData = JSON.parse(options.data);
	data.shipping_money = options.shipping_money;
	data.shipping_money > 0
		? (data.money = (parseFloat(data.shipping_money) + parseFloat(data.infoData.product_money)).toFixed(2))
		: (data.money = data.infoData.product_money);
});

onReady(() => {
	unref(formRef).setRules(rules);
});

const theme = computed(() => {
	return userStore.getTheme;
});

function submit() {
	unref(formRef)
		.validate()
		.then(() => {
			if (data.isLoading) {
				return;
			}
			data.isLoading = true;
			const params = { ...form };
			params.id = data.infoData.id;
			params.refund_type = 1;
			uni.$api.http
				.post(uni.$api.apiMember.orderProductRefundApply, {
					...params,
				})
				.then(() => {
					uni.$api.toast('提交成功');
					setTimeout(() => {
						uni.$api.router.redirectTo({
							route: uni.$api.routesConfig.orderDetail,
							query: {
								id: data.infoData.order_id,
							},
						});
					}, 1000);
				});
		});
}

const { infoData, isLoading, money } = { ...toRefs(data) };
</script>

<style lang="scss">
.form-content {
	margin: 20rpx;
	padding: 10rpx 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
}

.tip {
	padding: 20rpx 0;
	font-size: 24rpx;
	color: $dz-tips-color;
}

.button {
	margin: 0 30rpx;
}
</style>

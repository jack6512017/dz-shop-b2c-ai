<template>
	<view>
		<dz-navbar title="填写物流信息"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="快递公司" prop="refund_shipping_company" :borderBottom="true">
					<dz-input v-model="form.refund_shipping_company" clearable border="none" placeholder="请输入快递公司"></dz-input>
				</dz-form-item>
				<dz-form-item label="快递单号" prop="refund_shipping_code">
					<dz-input v-model="form.refund_shipping_code" clearable border="none" placeholder="请输入快递单号"></dz-input>
				</dz-form-item>
			</dz-form>
		</view>

		<view class="button" style="margin-top: 100rpx">
			<dz-button
				:border="false"
				:custom-style="{ width: '100%', background: isLoading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				hover-class="none"
				shape="circle"
				:loading="isLoading"
				@click="submit"
			>
				确定
			</dz-button>
		</view>
		<!-- 确定物流提醒 -->
		<dz-modal
			v-model:show="isShow"
			:mask-close-able="false"
			content="请确定填写物流无误再提交哦"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			:async-close="true"
			@cancel="shippingCancel"
			@confirm="shippingConfirm"
		></dz-modal>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const theme = computed(() => {
	return userStore.getTheme;
});
const formRef = ref<InstanceType<typeof tmForm> | null>(null);
const data = reactive({
	isShow: false,
	orderProductId: '',
	orderId: '',
	orderStatus: '',
});
const isLoading = ref<boolean>(false);
const form = reactive({
	refund_shipping_code: '',
	refund_shipping_company: '',
});

const rules = {
	refund_shipping_company: {
		type: 'string',
		required: true,
		message: '请输入快递公司',
		trigger: ['blur'],
	},
	refund_shipping_code: {
		type: 'string',
		required: true,
		message: '请输入快递单号',
		trigger: ['blur'],
	},
};

onLoad(async (options) => {
	await uni.$onLaunched;
	data.orderProductId = options.id;
	data.orderId = options.order_id;
	data.orderStatus = options.order_status;
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function submit() {
	if (isLoading.value) return;
	isLoading.value = true;
	unref(formRef)
		.validate()
		.then(() => {
			isLoading.value = false;
			data.isShow = true;
		})
		.catch(() => {
			isLoading.value = false;
		});
}

function shippingCancel() {
	data.isShow = false;
}

function shippingConfirm() {
	(form.id = data.orderProductId),
		uni.$api.http
			.post(data.orderStatus == 4 ? uni.$api.apiMember.orderCustomerSalesReturn : uni.$api.apiMember.orderProductRefundSalesReturn, {
				id: data.orderProductId,
				...form,
			})
			.then((res) => {
				uni.$api.toast('提交成功');
				uni.$emit('refundChange', {});
				setTimeout(() => {
					uni.$api.router.back();
				}, 1000);
			});
	data.isShow = false;
}

const { isShow } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.form-content {
	margin: 20rpx;
	padding: 10rpx 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
}

.button {
	margin: 0 30rpx;
}
</style>

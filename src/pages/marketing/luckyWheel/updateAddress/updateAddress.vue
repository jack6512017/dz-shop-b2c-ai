<template>
	<view>
		<dz-navbar title="填写收货地址"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="收货人" prop="receiver_name" :borderBottom="true">
					<dz-input v-model="form.receiver_name" clearable border="none" placeholder="请输入收件人姓名"></dz-input>
				</dz-form-item>
				<dz-form-item label="手机号" prop="receiver_mobile" :borderBottom="true">
					<dz-input v-model="form.receiver_mobile" placeholder="请输入手机号" clearable border="none"></dz-input>
				</dz-form-item>
				<dz-form-item label="所在地区" prop="receiver_province" :borderBottom="true" @click="handleAddress">
					<dz-input v-model="address" disabled disabledColor="transparent" border="none" placeholder="请选择所在地区地址">
						<template #suffix>
							<dz-icon name="right"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="详细地址" prop="receiver_address">
					<dz-textarea v-model="form.receiver_address" type="textarea" placeholder="请输入详细地址" border="none" :height="120"> </dz-textarea>
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
		<dz-picker mode="region" v-model="pickerShow" @cancel="pickerCancel" @confirm="pickerConfirm" :areaCode="regionCode"></dz-picker>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const winId = ref<string>('');
const isLoading = ref<boolean>(false);
const formRef = ref(null);

const data = reactive({
	form: {
		receiver_name: '',
		receiver_mobile: '',
		receiver_province: '',
		receiver_city: '',
		receiver_area: '',
		receiver_address: '',
	},
});
const regionCode = ref([]);
const address = ref('');
const pickerShow = ref(false);

const theme = computed(() => {
	return userStore.getTheme;
});

const rules = {
	receiver_name: {
		type: 'string',
		required: true,
		message: '请输入收货人姓名',
		trigger: ['change', 'blur'],
	},
	receiver_mobile: [
		{
			type: 'string',
			required: true,
			message: '请输入手机号',
			trigger: ['blur', 'change'],
		},
		{
			validator: (rule, value, callback) => {
				return uni.$api.isMobile('86' + value, '86');
			},
			message: '请输入正确的手机号',
			trigger: ['change', 'blur'],
		},
	],
	receiver_province: {
		type: 'number',
		required: true,
		message: '请选择所在地区地址',
		trigger: ['change', 'blur'],
	},
	receiver_address: {
		type: 'string',
		required: true,
		message: '请输入详细地址',
		trigger: ['change', 'blur'],
	},
};

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '收货地址',
	});
	winId.value = options.code;
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function handleAddress() {
	pickerShow.value = !pickerShow.value;
}

function pickerCancel() {
	pickerShow.value = false;
}

function pickerConfirm(e: any) {
	address.value = e.province.title + ' ' + e.city.title + ' ' + e.area.title;
	data.form.receiver_province = parseInt(e.province.id);
	data.form.receiver_city = parseInt(e.city.id);
	data.form.receiver_area = parseInt(e.area.id);
	pickerShow.value = false;
}

function submit() {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isLoading.value) {
				return;
			}
			isLoading.value = true;
			handleUpdate(data.form);
		});
}

async function handleUpdate(params) {
	await uni.$api.http
		.post(uni.$api.apiShop.luckyWheelUpdateAddress, params, {
			params: {
				id: winId.value,
			},
		})
		.then(() => {
			uni.$api.toast('填写收货成功');
			setTimeout(() => {
				uni.$emit('winAddressChange', {});
				uni.$api.router.back();
			}, 1000);
		})
		.finally(() => {
			isLoading.value = false;
		});
}

const { form } = { ...toRefs(data) };
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

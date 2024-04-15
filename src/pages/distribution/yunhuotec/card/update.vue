<template>
	<view>
		<dz-navbar :title="title"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="165">
				<dz-form-item label="银行账号" prop="account_number" :borderBottom="true">
					<dz-input v-model="form.account_number" clearable border="none" placeholder="请输入银行账号"></dz-input>
				</dz-form-item>
				<dz-form-item label="手机号" prop="mobile" :borderBottom="true">
					<dz-input v-model="form.mobile" placeholder="请输入手机号" clearable border="none"> </dz-input>
				</dz-form-item>
				<dz-form-item label="设为默认" :required="false">
					<template #right>
						<dz-switch v-model="form.is_default" :activeValue="1" :inactiveValue="0" :activeColor="theme.dzBaseColor"></dz-switch>
					</template>
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
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, toRefs, unref } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const title = ref<string>('');
const updateType = ref<string>('');
const source = ref<string>('');
const isLoading = ref<boolean>(false);
const formRef = ref(null);

const theme = computed(() => {
	return userStore.getTheme;
});

const data = reactive({
	id: '',
	form: {
		account_type: null,
		account_number: '',
		mobile: '',
		is_default: 0,
	},
});

const rules = reactive({
	account_number: {
		type: 'string',
		required: true,
		message: `请输入账号`,
		trigger: ['blur'],
	},
	mobile: [
		{
			type: 'string',
			required: true,
			message: '请输入手机号',
			trigger: ['blur', 'change'],
		},
		{
			validator: (rule, value, callback) => {
				return /^1\d{10}$/.test(value);
			},
			message: '请输入正确的手机号',
			trigger: ['change', 'blur'],
		},
	],
});

onLoad(async (options) => {
	await uni.$onLaunched;
	title.value = '新增提现账号';
	if (options.type === 'edit') {
		title.value = '编辑提现账号';
	}
	uni.setNavigationBarTitle({
		title: title.value,
	});
	data.id = options.id;
	updateType.value = options.type;
	source.value = options.source;
	if (options.type && options.type == 'edit') {
		getDetail();
	}
});

onReady(() => {
	unref(formRef).setRules(rules);
});

async function getDetail() {
	await uni.$api.http
		.get(uni.$api.apiPay.yunhuotecMmemberCardView, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			data.form = res.data;
		});
}

//提交
function submit() {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isLoading.value) {
				return;
			}
			isLoading.value = true;
			if (updateType.value === 'edit') {
				handleUpdate(data.form);
			} else {
				handleCreate(data.form);
			}
		});
}

// 编辑
async function handleUpdate(params) {
	await uni.$api.http
		.put(uni.$api.apiPay.yunhuotecMmemberCardUpdate, params, {
			params: {
				id: params.id,
			},
		})
		.then((res) => {
			uni.$api.toast('修改成功');
			if (source.value) {
				uni.$emit('getBankAccount', res.data);
				uni.$api.router.back(2);
			} else {
				uni.$emit('bankAccountChange', {});
				uni.$api.router.back();
			}
		})
		.finally(() => {
			isLoading.value = false;
		});
}

// 新增
async function handleCreate(params) {
	await uni.$api.http
		.post(uni.$api.apiPay.yunhuotecMmemberCardCreate, params)
		.then((res) => {
			uni.$api.toast('添加成功');
			if (source.value) {
				uni.$emit('getBankAccount', res.data);
				uni.$api.router.back(2);
			} else {
				uni.$emit('bankAccountChange', {});
				uni.$api.router.back();
			}
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

<template>
	<view>
		<dz-navbar :title="title"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="发票类型" :required="false" :borderBottom="true">
					<dz-radio-group v-model="form.type" :activeColor="theme.dzBaseColor" @change="typeChange">
						<dz-radio :customStyle="{ marginRight: '16px' }" label="公司" :name="1"> </dz-radio>
						<dz-radio :customStyle="{ marginRight: '16px' }" label="个人" :name="2"> </dz-radio>
					</dz-radio-group>
				</dz-form-item>
				<dz-form-item :label="language.invoice.invoiceTitle" prop="title" :borderBottom="true">
					<dz-input v-model="form.title" clearable border="none" :placeholder="language.invoice.inputInvoiceTitle"></dz-input>
				</dz-form-item>
				<dz-form-item v-if="form.type == 1" :label="language.invoice.invoiceNumber" :prop="form.type == 1 ? 'duty_paragraph' : ''" :borderBottom="true">
					<dz-input v-model="form.duty_paragraph" clearable border="none" :placeholder="language.invoice.inputInvoiceNumber"></dz-input>
				</dz-form-item>
				<dz-form-item label="电子邮箱" prop="email" :borderBottom="true"
					><dz-input v-model="form.email" placeholder="请输入电子邮箱" clearable border="none"></dz-input
				></dz-form-item>
				<dz-form-item v-if="form.type == 1" label="手机号" :borderBottom="true"
					><dz-input v-model="form.mobile" placeholder="选填" clearable border="none"></dz-input
				></dz-form-item>
				<dz-form-item v-if="form.type == 1" label="开户行" :borderBottom="true"
					><dz-input v-model="form.opening_bank" placeholder="选填" clearable border="none"></dz-input
				></dz-form-item>
				<dz-form-item v-if="form.type == 1" label="地址" :borderBottom="true"
					><dz-input v-model="form.address" placeholder="选填" clearable border="none"></dz-input
				></dz-form-item>
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

const title = ref<string>('');
const language = uni.$api.language;
const updateType = ref<string>('');
const source = ref<string>('');
const invoiceId = ref<string>('');
const isLoading = ref<Boolean>(false);
const userStore = useUserStore();
const data = reactive({
	form: {
		type: 1,
		title: '',
		duty_paragraph: '',
		email: '',
		mobile: '',
		opening_bank: '',
		address: '',
		is_default: 0,
	},
});
const formRef = ref(null);
const theme = computed(() => {
	return userStore.getTheme;
});

const rules = {
	title: {
		type: 'string',
		required: true,
		message: language.invoice.inputInvoiceTitle,
		trigger: ['blur'],
	},
	duty_paragraph: {
		type: 'string',
		required: true,
		message: language.invoice.inputInvoiceNumber,
		trigger: ['blur'],
	},
	email: {
		type: 'string',
		required: true,
		message: '请输入电子邮箱',
		trigger: ['blur'],
	},
};

onLoad(async (options) => {
	await uni.$onLaunched;
	title.value = language.invoice.addInvoice;
	if (options.type === 'edit') {
		title.value = language.invoice.editInvoice;
	}
	uni.setNavigationBarTitle({
		title: title.value,
	});
	invoiceId.value = options.id;
	updateType.value = options.type;
	source.value = options.source;
	if (options.type && options.type == 'edit') {
		getInvoiceDetail();
	}
});

onReady(() => {
	unref(formRef).setRules(rules);
});

async function getInvoiceDetail() {
	await uni.$api.http
		.get(uni.$api.apiMember.invoiceView, {
			params: {
				id: invoiceId.value,
			},
		})
		.then((res) => {
			data.form = res.data;
		});
}

function typeChange(e: number) {
	rules.duty_paragraph.required = e == 1 ? true : false;
	unref(formRef).setRules(rules);
}

//修改手机号码
function submit() {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isLoading.value) {
				return;
			}
			isLoading.value = true;
			if (updateType.value === 'edit') {
				handleInvoiceUpdate(data.form);
			} else {
				handleInvoiceCreate(data.form);
			}
		});
}

// 编辑发票
async function handleInvoiceUpdate(params) {
	await uni.$api.http
		.put(uni.$api.apiMember.invoiceUpdate, params, {
			params: {
				id: params.id,
			},
		})
		.then((res) => {
			uni.$api.toast('修改成功');
			if (source.value) {
				uni.$emit('getInvoice', res.data);
				uni.$api.router.back(2);
			} else {
				uni.$emit('invoiceChange', {});
				uni.$api.router.back();
			}
		})
		.finally(() => {
			isLoading.value = false;
		});
}

// 新增发票
async function handleInvoiceCreate(params) {
	await uni.$api.http
		.post(uni.$api.apiMember.invoiceCreate, params)
		.then((res) => {
			uni.$api.toast('添加成功');
			if (source.value) {
				uni.$emit('getInvoice', res.data);
				uni.$api.router.back(2);
			} else {
				uni.$emit('invoiceChange', {});
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

<template>
	<view>
		<dz-navbar title="用户签约"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="真实姓名" prop="realname" :borderBottom="true">
					<dz-input v-model="form.realname" clearable border="none" placeholder="请输入真实姓名"></dz-input>
				</dz-form-item>
				<dz-form-item label="证件类型" :required="false" :borderBottom="true">
					<dz-radio-group v-model="form.card_type" :activeColor="theme.dzBaseColor" placement="column">
						<dz-radio :customStyle="{ marginBottom: '16px' }" label="身份证" name="idcard"> </dz-radio>
						<dz-radio :customStyle="{ marginBottom: '16px' }" label="护照" name="passport"> </dz-radio>
						<dz-radio :customStyle="{ marginBottom: '16px' }" label="港澳居民来往内地通行证" name="mtphkm"> </dz-radio>
						<dz-radio label="台湾居民来往大陆通行证(台胞证)" name="mtpt"> </dz-radio>
					</dz-radio-group>
				</dz-form-item>
				<dz-form-item label="证件号码" prop="identity_card" :borderBottom="true"
					><dz-input v-model="form.identity_card" placeholder="请输入证件号码" clearable border="none"></dz-input
				></dz-form-item>
				<dz-form-item label="">
					<view class="dz-flex dz-row-center">
						<dz-checkbox-group v-model="agreeCheck" shape="circle" :activeColor="theme.dzBaseColor">
							<dz-checkbox label="遵守并同意" :name="1"></dz-checkbox>
						</dz-checkbox-group>
						<text style="margin-left: 10rpx; color: #409eff" @tap="handleProtocal()">{{ signContract.title }}</text>
					</view>
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

const isLoading = ref<Boolean>(false);
const userStore = useUserStore();
const data = reactive({
	form: {
		realname: '',
		identity_card: '',
		card_type: 'idcard',
	},
	signContract: '',
	agreeCheck: [],
});
const formRef = ref(null);
const theme = computed(() => {
	return userStore.getTheme;
});

const rules = {
	realname: {
		type: 'string',
		required: true,
		message: '请输入真实姓名',
		trigger: ['blur'],
	},
	identity_card: [
		{
			type: 'string',
			required: true,
			message: '请输入证件号码',
			trigger: ['blur', 'change'],
		},
		{
			validator: (rule, value, callback) => {
				return data.form.card_type === 'idcard' && uni.$api.test.idCard(value);
			},
			message: '请输入正确证件号码',
			trigger: ['change', 'blur'],
		},
	],
};

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '用户签约',
	});
	getSignContract();
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function getSignContract() {
	uni.$api.http.get(uni.$api.apiPay.yunzhanghuMmemberSignContract).then((res) => {
		data.signContract = res.data;
	});
}

function handleProtocal() {
	if (!data.signContract.url) return;
	uni.$api.router.push({
		route: uni.$api.routesConfig.webview,
		query: {
			url: uni.$api.strEncode(data.signContract.url),
		},
	});
}

function submit() {
	if (!data.agreeCheck.length) {
		uni.$api.toast('请勾选并阅读该协议');
		return;
	}
	unref(formRef)
		.validate()
		.then(async () => {
			if (isLoading.value) {
				return;
			}
			isLoading.value = true;
			await uni.$api.http
				.post(uni.$api.apiPay.yunzhanghuMmemberSign, data.form)
				.then(() => {
					uni.$emit('yunzhanghuMemberChange', {});
					setTimeout(() => {
						uni.$api.router.back();
					}, 1000);
				})
				.finally(() => {
					isLoading.value = false;
				});
		});
}

const { form, signContract, agreeCheck } = { ...toRefs(data) };
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

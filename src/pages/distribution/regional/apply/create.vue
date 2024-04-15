<template>
	<view>
		<dz-navbar title="申请区域代理"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="175">
				<dz-form-item label="代理级别" :borderBottom="true">
					<dz-radio-group v-model="form.level" @change="levelChange">
						<dz-radio
							:active-color="theme.dzBaseColor"
							v-for="(item, index) in levelData"
							:key="index"
							:name="item.value"
							:label="item.name"
							:customStyle="{ marginRight: '20rpx' }"
						>
						</dz-radio>
					</dz-radio-group>
				</dz-form-item>
				<dz-form-item label="代理区域" prop="province_id" :borderBottom="true" @click="handleAddress">
					<dz-input v-model="address" disabled border="none" disabledColor="transparent" placeholder="请选择代理区域">
						<template #suffix>
							<dz-icon name="right"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="手机号码" prop="mobile" :borderBottom="true">
					<dz-input v-model="form.mobile" placeholder="请输入手机号码" clearable border="none"> </dz-input>
				</dz-form-item>
				<dz-form-item label="联系地址">
					<dz-textarea
						v-model="form.address_details"
						type="textarea"
						placeholder="请输入联系地址"
						border="none"
						:height="120"
						customStyle="padding:0rpx"
					>
					</dz-textarea>
				</dz-form-item>
			</dz-form>
		</view>
		<view class="button" style="margin-top: 100rpx">
			<dz-button
				:border="false"
				:custom-style="{ background: isLoading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				hover-class="none"
				shape="circle"
				:loading="isLoading"
				@click="submit"
			>
				确定
			</dz-button>
		</view>
		<dz-picker
			v-model="pickerShow"
			mode="region"
			:params="addressParams"
			:areaCode="regionCode"
			@cancel="cancelPicker"
			@confirm="pickerConfirm"
		></dz-picker>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, toRefs, unref } from 'vue';
import { useUserStore } from '@/state/modules/user';
import { onLoad, onReady } from '@dcloudio/uni-app';

const isLoading = ref<Boolean>(false);
const userStore = useUserStore();
const formRef = ref(null);
const data = reactive({
	form: {
		level: 1,
		mobile: '',
		province_id: '',
		city_id: '',
		area_id: '',
		address_details: '',
	},
	pickerShow: false,
	addressParams: {
		province: true,
		city: false,
		area: false,
	},
	address: '',
	regionCode: [],
});

const levelData = [
	{
		value: 1,
		name: '省代',
	},
	{
		value: 2,
		name: '市代',
	},
	{
		value: 3,
		name: '区代',
	},
];

const theme = computed(() => {
	return userStore.getTheme;
});

const rules = {
	province_id: {
		type: 'number',
		required: true,
		message: '请选择代理区域',
		trigger: ['change', 'blur'],
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
				return uni.$api.isMobile(86 + value, 86);
			},
			message: '请输入正确的手机号',
			trigger: ['change', 'blur'],
		},
	],
};

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '申请区域代理',
	});
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function levelChange(e: number) {
	data.addressParams.province = true;
	switch (e) {
		case 3:
			data.addressParams.city = true;
			data.addressParams.area = true;
			break;
		case 2:
			data.addressParams.city = true;
			data.addressParams.area = false;
			break;
		case 1:
			data.addressParams.city = false;
			data.addressParams.area = false;
			break;
	}
	data.address = '';
	data.form.province_id = 0;
	data.form.city_id = 0;
	data.form.area_id = 0;
}

function handleAddress() {
	data.pickerShow = !data.pickerShow;
}

function cancelPicker() {
	data.pickerShow = false;
}

function pickerConfirm(e: any) {
	const level = parseInt(data.form.level);
	if (level === 3) {
		data.address = e.province.title + ' ' + e.city.title + ' ' + e.area.title;
		data.form.province_id = e.province.id;
		data.form.city_id = e.city.id;
		data.form.area_id = e.area.id;
	} else if (level === 2) {
		data.address = e.province.title + ' ' + e.city.title;
		data.form.province_id = e.province.id;
		data.form.city_id = e.city.id;
		data.form.area_id = 0;
	} else if (level === 1) {
		data.address = e.province.title;
		data.form.province_id = e.province.id;
		data.form.city_id = 0;
		data.form.area_id = 0;
	}
	data.regionCode = [data.form.province_id, data.form.city_id, data.form.area_id];
	data.pickerShow = false;
}

function submit() {
	unref(formRef)
		.validate()
		.then(async () => {
			if (isLoading.value) {
				return;
			}
			isLoading.value = true;
			await uni.$api.http
				.post(uni.$api.apiShop.distributionPromoterRegionalCreate, data.form)
				.then((res) => {
					uni.$api.toast('提交成功，请等待审核');
					setTimeout(() => {
						uni.$api.router.back();
					}, 1000);
				})
				.finally(() => {
					isLoading.value = false;
				});
		});
}

const { form, addressParams, address, pickerShow, regionCode } = { ...toRefs(data) };
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

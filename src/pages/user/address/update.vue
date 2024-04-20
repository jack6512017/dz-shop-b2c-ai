<template>
	<view>
		<dz-navbar :title="title"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="收货人" prop="realname" :borderBottom="true">
					<dz-input v-model="form.realname" clearable border="none" placeholder="请输入收件人姓名"></dz-input>
				</dz-form-item>
				<dz-form-item label="手机号" prop="mobile" :borderBottom="true">
					<dz-input v-model="form.mobile" placeholder="请输入手机号" clearable border="none">
						<template #prefix>
							<view class="dz-m-r-15" @tap="handleArea">
								{{ areaName }}
								<dz-icon name="unfold"></dz-icon>
							</view>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="所在地区" prop="province_id" :borderBottom="true" @click="handleAddress">
					<dz-input v-model="address" disabled disabledColor="transparent" border="none" placeholder="请选择所在地区地址">
						<template #suffix>
							<dz-icon name="right"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="详细地址" prop="address_details" :borderBottom="true">
					<dz-textarea v-model="form.address_details" type="textarea" placeholder="请输入详细地址" border="none" :height="120"> </dz-textarea>
				</dz-form-item>
				<dz-form-item label="设为默认" :required="false" :borderBottom="true">
					<template #right>
						<dz-switch v-model="form.is_default" :activeValue="1" :inactiveValue="0" :activeColor="theme.dzBaseColor"></dz-switch>
					</template>
				</dz-form-item>
				<dz-form-item label="" :required="false">
					<view style="width: 100%">
						<dz-textarea
							v-model="distinguishValue"
							type="textarea"
							placeholder="试试粘贴收货人姓名,手机号,收货地址,可以快速识别您的收货信息"
							border="none"
							:height="140"
						>
						</dz-textarea>
						<view class="dz-flex dz-row-right dz-m-t-20 dz-p-t-30 dz-border-top">
							<view>
								<dz-button
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
									@click="handleClear()"
								>
									清空
								</dz-button>
							</view>
							<view>
								<dz-button
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
									@click="handleAddressParse()"
								>
									识别
								</dz-button>
							</view>
						</view>
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
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="getDetail"></dz-page-loading>
		<dz-select v-model="selectShow" mode="single-column" :safe-area-inset-bottom="true" :list="mobileAreaInfo" @confirm="areaConfirm"> </dz-select>
		<dz-picker mode="region" v-model="pickerShow" @cancel="pickerCancel" @confirm="pickerConfirm" :areaCode="regionCode"></dz-picker>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import addressParse from './zh-address-parse/address-parse';

const userStore = useUserStore();
const { lastSelectMobileArea } = userStore.getData;
const title = ref<string>('');
const updateType = ref<string>('');
const source = ref<string>('');
const addressId = ref<string>('');

const pageLoadingShow = ref<boolean>(false);
const pageLoadingStatus = ref<string>('loading');
const isLoading = ref<boolean>(false);
const formRef = ref(null);

const data = reactive({
	form: {
		realname: '',
		mobile_area: lastSelectMobileArea || '86',
		mobile: '',
		province_id: '',
		city_id: '',
		area_id: '',
		address_details: '',
		is_default: 0,
	},
});
const selectShow = ref<boolean>(false);
const mobilePattern = uni.$api.dataConfig.mobilePattern;
const mobileAreaInfo = ref([]);
const regionCode = ref([]);
const areaName = ref('');
const address = ref('');
const pickerShow = ref(false);
const distinguishValue = ref<string>('');

const theme = computed(() => {
	return userStore.getTheme;
});

const rules = {
	realname: {
		type: 'string',
		required: true,
		message: '请输入收件人姓名',
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
				return uni.$api.isMobile(data.form.mobile_area + value, data.form.mobile_area);
			},
			message: '请输入正确的手机号',
			trigger: ['change', 'blur'],
		},
	],
	province_id: {
		type: 'number',
		required: true,
		message: '请选择所在地区地址',
		trigger: ['change', 'blur'],
	},
	address_details: {
		type: 'string',
		required: true,
		message: '请输入详细地址',
		trigger: ['change', 'blur'],
	},
};

onLoad(async (options) => {
	await uni.$onLaunched;
	title.value = '新建收货地址';
	if (options.type === 'edit') {
		title.value = '编辑收货地址';
	}
	uni.setNavigationBarTitle({
		title: title.value,
	});
	for (let area in mobilePattern) {
		mobileAreaInfo.value.push({
			value: area,
			label: mobilePattern[area].label,
		});
	}
	areaName.value = mobilePattern[data.form.mobile_area].label;
	addressId.value = options.id;
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
	pageLoadingShow.value = true;
	await uni.$api.http
		.get(uni.$api.apiMember.addressView, {
			params: {
				id: addressId.value,
			},
		})
		.then((res) => {
			form.value = res.data;
			address.value = res.data.address_name;
			regionCode.value = [res.data.province_id, res.data.city_id, res.data.area_id];
			setTimeout(() => {
				unref(formRef)?.clearValidate();
			}, 30);

			pageLoadingShow.value = false;
		})
		.catch(() => {
			pageLoadingStatus.value = 'error';
		});
}

function handleArea() {
	selectShow.value = true;
}

function areaConfirm(e: any) {
	data.form.mobile_area = e[0].value;
	areaName.value = e[0].label;
}

function handleAddress() {
	pickerShow.value = !pickerShow.value;
}

function pickerCancel() {
	pickerShow.value = false;
}

function pickerConfirm(e: any) {
	address.value = e.province.title + ' ' + e.city.title + ' ' + e.area.title;
	data.form.province_id = parseInt(e.province.id);
	data.form.city_id = parseInt(e.city.id);
	data.form.area_id = parseInt(e.area.id);
	pickerShow.value = false;
}

function handleClear() {
	distinguishValue.value = '';
}

function handleAddressParse() {
	if (!distinguishValue.value) return uni.$api.toast(uni.$api.language.address.noContent);

	let options = {
		type: 1, // 哪种方式解析，0：正则，1：树查找
		textFilter: [], // 预清洗的字段
		nameMaxLength: 4, // 查找最大的中文名字长度
	};
	let parseResult = addressParse(distinguishValue.value, options);
	data.form.realname = parseResult.name || '';
	data.form.mobile = parseResult.phone || '';
	data.form.address_details = parseResult.detail || '';
	//获取区域
	if (parseResult.area) {
		const province_id = parseResult.province.id;
		const city_id = parseResult.city.id;
		regionCode.value = [province_id, city_id, parseResult.area.id];
		address.value = parseResult.province.title + ' ' + parseResult.city.title + ' ' + parseResult.area.title;
		data.form.province_id = parseResult.province.id;
		data.form.city_id = parseResult.city.id;
		data.form.area_id = parseResult.area.id;
	}
}

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

async function handleUpdate(params) {
	await uni.$api.http
		.put(uni.$api.apiMember.addressUpdate, params, {
			params: {
				id: addressId.value,
			},
		})
		.then((res) => {
			uni.$api.toast('修改成功');
			setTimeout(() => {
				if (source.value) {
					uni.$emit('getAddressData', res.data);
					uni.$api.router.back(2);
				} else {
					uni.$emit('addressChange', {});
					uni.$api.router.back();
				}
			}, 500);
		})
		.finally(() => {
			isLoading.value = false;
		});
}

async function handleCreate(params) {
	await uni.$api.http
		.post(uni.$api.apiMember.addressCreate, params)
		.then((res) => {
			uni.$api.toast('新建收货地址成功');
			setTimeout(() => {
				if (source.value) {
					uni.$emit('getAddressData', res.data);
					uni.$api.router.back(2);
				} else {
					uni.$emit('addressChange', {});
					uni.$api.router.back();
				}
			}, 500);
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

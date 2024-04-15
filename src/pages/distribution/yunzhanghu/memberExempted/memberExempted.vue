<template>
	<view>
		<dz-navbar title="上传免验证"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="180">
				<dz-form-item label="真实姓名" prop="realname" :borderBottom="true">
					<dz-input v-model="form.realname" clearable border="none" placeholder="请输入真实姓名"></dz-input>
				</dz-form-item>
				<dz-form-item label="证件类型" :required="false" :borderBottom="true">
					<dz-radio-group v-model="form.card_type" :activeColor="theme.dzBaseColor" placement="column">
						<dz-radio :customStyle="{ marginBottom: '16px' }" label="护照" name="passport"> </dz-radio>
						<dz-radio :customStyle="{ marginBottom: '16px' }" label="港澳居民来往内地通行证" name="mtphkm"> </dz-radio>
						<dz-radio label="台湾居民来往大陆通行证(台胞证)" name="mtpt"> </dz-radio>
					</dz-radio-group>
				</dz-form-item>
				<dz-form-item label="证件号码" prop="identity_card" :borderBottom="true"
					><dz-input v-model="form.identity_card" placeholder="请输入证件号码" clearable border="none"></dz-input
				></dz-form-item>
				<dz-form-item label="证件照正面" prop="identity_card_front" :borderBottom="true">
					<dz-upload
						:fileList="frontFileList"
						@afterRead="afterRead"
						@delete="deletePic"
						name="front"
						multiple
						:maxCount="1"
						width="250"
						height="150"
					></dz-upload>
				</dz-form-item>
				<dz-form-item label="证件照反面" prop="identity_card_back" :borderBottom="true">
					<dz-upload
						:fileList="backFileList"
						@afterRead="afterRead"
						@delete="deletePic"
						name="back"
						multiple
						:maxCount="1"
						width="250"
						height="150"
					></dz-upload>
				</dz-form-item>
				<dz-form-item label="申请备注" prop="comment_apply" :borderBottom="true">
					<dz-input v-model="form.comment_apply" type="textarea" placeholder="请输入申请备注" border="none"></dz-input>
				</dz-form-item>
				<dz-form-item label="国别" prop="country" :borderBottom="true" @click="handleCountrySelect">
					<dz-input v-show="false" v-model="form.country" disabled disabledColor="transparent" border="none"> </dz-input>
					<dz-input v-model="countryName" disabled disabledColor="transparent" border="none" placeholder="请选择国别">
						<template #suffix>
							<dz-icon name="right"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="性别" :required="false" :borderBottom="true">
					<dz-radio-group v-model="form.gender" :activeColor="theme.dzBaseColor">
						<dz-radio :customStyle="{ marginRight: '16px' }" label="男" :name="1"> </dz-radio>
						<dz-radio label="女" :name="2"> </dz-radio>
					</dz-radio-group>
				</dz-form-item>
				<dz-form-item label="出生年月" prop="birthday" @click="handleBirthdaySelect">
					<dz-input v-show="false" v-model="form.birthday" disabled disabledColor="transparent" border="none"> </dz-input>
					<dz-input v-model="birthdayValue" disabled disabledColor="transparent" border="none" placeholder="请选择出生年月">
						<template #suffix>
							<dz-icon name="right"></dz-icon>
						</template>
					</dz-input>
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
		<!-- 国别 -->
		<dz-select
			mode="single-column"
			v-model="countryShow"
			:safe-area-inset-bottom="true"
			:list="country"
			valueName="code"
			labelName="name"
			:defaultValue="defaultCountryValue"
			@confirm="countryConfirm"
		></dz-select>
		<!-- 出生年月 -->
		<dz-picker v-model="birthdayShow" :defaultTime="birthdayValue" start-year="1900" mode="time" @confirm="birthdayConfirm"></dz-picker>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, toRefs, unref } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import country from './country.json';

const isLoading = ref<Boolean>(false);
const userStore = useUserStore();
const { accessToken } = userStore.getData;
const data = reactive({
	form: {
		realname: '',
		identity_card: '',
		card_type: 'passport',
		comment_apply: '',
		identity_card_front: '',
		identity_card_back: '',
		country: '',
		birthday: '',
		gender: 1,
	},
	frontFileList: [],
	backFileList: [],
	countryShow: false,
	countryName: '',
	defaultCountryValue: [0],
	birthdayShow: false,
	birthdayValue: '',
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
	identity_card: {
		type: 'string',
		required: true,
		message: '请输入证件号码',
		trigger: ['blur', 'change'],
	},
	identity_card_front: {
		type: 'string',
		required: true,
		message: '请上传证件照正面',
		trigger: ['blur', 'change'],
	},
	identity_card_back: {
		type: 'string',
		required: true,
		message: '请上传证件照正面',
		trigger: ['blur', 'change'],
	},
	comment_apply: {
		type: 'string',
		required: true,
		message: '请输入申请备注',
		trigger: ['blur'],
	},
	country: {
		type: 'string',
		required: true,
		message: '请选择国别',
		trigger: ['blur', 'change'],
	},
	birthday: {
		type: 'number',
		required: true,
		message: '请选择出生年月',
		trigger: ['blur', 'change'],
	},
};

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '上传免验证',
	});
});

onReady(() => {
	unref(formRef).setRules(rules);
});

watch(
	() => data.frontFileList,
	(nVal) => {
		data.form.identity_card_front = nVal.length ? nVal[0].url : '';
	},
	{
		deep: true,
	}
);

watch(
	() => data.backFileList,
	(nVal) => {
		data.form.identity_card_back = nVal.length ? nVal[0].url : '';
	},
	{
		deep: true,
	}
);

async function afterRead(event: object) {
	// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
	let lists = [].concat(event.file);
	let fileListLen = data[`${event.name}FileList`].length;
	lists.map((item) => {
		data[`${event.name}FileList`].push({
			...item,
			status: 'uploading',
			message: '上传中',
		});
	});
	for (let i = 0; i < lists.length; i++) {
		const result = await uploadFilePromise(lists[i].url);
		let item = data[`${event.name}FileList`][fileListLen];
		data[`${event.name}FileList`].splice(
			fileListLen,
			1,
			Object.assign(item, {
				status: 'success',
				message: '',
				url: result,
			})
		);
		fileListLen++;
	}
}

function uploadFilePromise(url: string) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: `${uni.$api.appConfig.apiDomain}${uni.$api.apiCommon.fileImages}`,
			filePath: url,
			name: 'file',
			header: { 'x-api-key': accessToken },
			success: (res) => {
				setTimeout(() => {
					resolve(JSON.parse(res.data).data.url);
				}, 1000);
			},
		});
	});
}

function deletePic(event: object) {
	data[`${event.name}FileList`].splice(event.index, 1);
}

function handleCountrySelect() {
	const index = country.findIndex((item) => item.name == data.countryName);
	if (index != -1) {
		data.defaultCountryValue = [index];
	} else {
		data.defaultCountryValue = [0];
	}
	data.countryShow = true;
}

function countryConfirm(e: object[]) {
	data.countryName = e[0].label;
	data.form.country = e[0].value;
}

function handleBirthdaySelect() {
	data.birthdayShow = true;
}

function birthdayConfirm(e: object) {
	data.birthdayValue = `${e.year}-${e.month}-${e.day}`;
	data.form.birthday = e.timestamp;
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
				.post(uni.$api.apiPay.yunzhanghuMmemberExempted, data.form)
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

const { form, frontFileList, backFileList, countryName, countryShow, defaultCountryValue, birthdayValue, birthdayShow } = { ...toRefs(data) };
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
	padding-bottom: 30rpx;
}
</style>

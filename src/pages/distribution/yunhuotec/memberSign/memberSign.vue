<template>
	<view>
		<dz-navbar title="用户签约"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="180">
				<dz-form-item label="真实姓名" prop="realname" :borderBottom="true">
					<dz-input v-model="form.realname" clearable border="none" placeholder="请输入真实姓名"></dz-input>
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
				<dz-form-item label="证件地址" prop="identity_card_address" :borderBottom="false">
					<dz-input v-model="form.identity_card_address" type="textarea" placeholder="请输入证件地址" border="none"></dz-input>
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
import { ref, reactive, computed, watch, toRefs, unref } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const isLoading = ref<Boolean>(false);
const userStore = useUserStore();
const { accessToken } = userStore.getData;
const data = reactive({
	form: {
		realname: '',
		identity_card: '',
		identity_card_front: '',
		identity_card_back: '',
		identity_card_address: '',
	},
	frontFileList: [],
	backFileList: [],
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
	identity_card_address: {
		type: 'string',
		required: true,
		message: '请输入证件地址',
		trigger: ['blur'],
	},
};

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '用户签约',
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

function submit() {
	unref(formRef)
		.validate()
		.then(async () => {
			if (isLoading.value) {
				return;
			}
			isLoading.value = true;
			await uni.$api.http
				.post(uni.$api.apiPay.yunhuotecMmemberSign, data.form)
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

const { form, frontFileList, backFileList } = { ...toRefs(data) };
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

<template>
	<view>
		<dz-navbar :title="language.user.feedback" :followTheme="false"></dz-navbar>
		<view class="feedback-title dz-main-color">
			<text>{{ language.user.questionsAndComments }}</text>
			<view class="feedback-quick" @tap="chooseMsg">
				<text class="dz-m-r-10">{{ language.user.fastTyping }}</text>
				<dz-icon name="unfold" :fontSize="24"></dz-icon>
			</view>
		</view>
		<view class="feedback-body">
			<textarea :placeholder="language.user.fastTyping" v-model="form.content" class="feedback-textare" />
		</view>
		<view class="feedback-title dz-main-color">
			{{ language.user.inputFeedbackText }}
		</view>
		<view class="feedback-body">
			<view class="uni-uploader">
				<view class="uni-uploader-head">
					<view class="uni-uploader-title">{{ language.user.previewImage }}</view>
					<view class="uni-uploader-info">{{ fileList.length }}/9</view>
				</view>
				<dz-upload :fileList="fileList" @afterRead="afterRead" @delete="deletePic" multiple :maxCount="9"></dz-upload>
			</view>
		</view>
		<view class="feedback-title dz-main-color">
			<text>{{ language.user.feedbackType }}</text>
		</view>
		<view class="feedback-body" style="padding: 20rpx">
			<dz-radio-group v-model="form.type">
				<dz-radio
					v-for="(item, index) in feedbackType"
					:key="index"
					:customStyle="{ marginRight: '16px' }"
					:active-color="theme.dzBaseColor"
					:name="item.value"
					:label="item.name"
					@change="feedbackGroupChange(item)"
				>
				</dz-radio>
			</dz-radio-group>
		</view>
		<view class="feedback-title dz-main-color">
			<text>{{ language.user.qqEmailMobile }}</text>
		</view>
		<view class="feedback-body" style="padding: 10rpx 20rpx">
			<dz-input v-model="form.contact_way" border="none" :placeholder="language.user.contactWithYou" :custom-style="{ padding: '4rpx 0' }"></dz-input>
		</view>
		<view class="confirm-btn">
			<dz-button
				:custom-style="{ background: loading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor, width: '100%' }"
				hover-class="none"
				:border="false"
				:loading="loading"
				shape="circle"
				@click="send"
			>
				{{ language.user.submit }}
			</dz-button>
		</view>
		<dz-select v-model="pickerShow" :safe-area-inset-bottom="true" :list="msgContents" @confirm="msgConfirm"></dz-select>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const { accessToken } = userStore.getData;
const language = uni.$api.language;
const msgContents = [
	{
		value: '0',
		label: language.user.interfaceDisplayDisorder,
	},
	{
		value: '1',
		label: language.user.slowStart,
	},
	{
		value: '2',
		label: language.user.UI,
	},
	{
		value: '3',
		label: language.user.accidentalCollapse,
	},
	{
		value: '4',
		label: language.user.dataCalculationError,
	},
];
const pickerShow = ref<boolean>(false);
const fileList = ref<string[]>([]);
const feedbackType = [
	{
		value: '1',
		name: language.user.featureSuggestions,
	},
	{
		value: '2',
		name: language.user.bugFeedback,
	},
	{
		value: '3',
		name: language.user.information,
	},
];

const form = reactive<any>({
	type: '1',
	covers: '',
	content: '',
	contact_way: '',
});

const loading = ref<boolean>(false);

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.user.feedback,
	});
});

// 监听反馈类型事件
function feedbackGroupChange(e) {
	form.type = e.value;
}

async function afterRead(event) {
	// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
	let lists = [].concat(event.file);
	let fileListLen = fileList.value.length;
	lists.map((item) => {
		fileList.value.push({
			...item,
			status: 'uploading',
			message: '上传中',
		});
	});
	for (let i = 0; i < lists.length; i++) {
		const result = await uploadFilePromise(lists[i].url);

		let item = fileList.value[fileListLen];
		fileList.value.splice(
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

function uploadFilePromise(url) {
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

function deletePic(event) {
	fileList.value.splice(event.index, 1);
}

// 快速输入
function chooseMsg() {
	pickerShow.value = true;
}

function msgConfirm(e: any) {
	form.content = e[0].label;
}

// 发送反馈
async function send() {
	if (loading.value) {
		return;
	}
	if (!form.content) {
		uni.$api.toast('请输入反馈内容');
	}
	loading.value = true;
	const list = [];

	fileList.value.forEach((item) => {
		if (item.status == 'success') {
			list.push(item.url);
		}
	});
	form.covers = JSON.stringify(list);
	await uni.$api.http
		.post(uni.$api.apiBase.opinionCreate, {
			...form,
		})
		.then(() => {
			loading.value = false;
			uni.$api.toast(language.user.feedbackTip);
			setTimeout(() => {
				uni.$api.router.back();
			}, 1000);
		})
		.finally(() => {
			loading.value = false;
		});
}
</script>

<style lang="scss">
.feedback-title {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx;
	font-size: 28rpx;
}

.feedback-quick {
	display: flex;
	align-items: center;
	.iconfont {
		font-size: 24rpx;
	}
}

.feedback-body {
	margin: 0 24rpx;
	border-radius: 20rpx;
	background-color: #fff;
}
.feedback-textare {
	height: 200rpx;
	font-size: 28rpx;
	line-height: 50rpx;
	width: 100%;
	box-sizing: border-box;
	padding: 20rpx 30rpx 0;
}
.uni-textarea-placeholder {
	color: rgb(192, 196, 204);
}
/* 上传 */
.uni-uploader {
	flex: 1;
	flex-direction: column;
}

.uni-uploader-head {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	margin-bottom: 30rpx;
	color: rgb(192, 196, 204);
	font-size: 28rpx;
}
.uploaderBtn {
	width: 200rpx;
	height: 200rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: #f4f5f6;
	border-radius: 15rpx;
	overflow: hidden;
	margin: 10rpx;
	.dzicon-cameraadd {
		font-size: 48rpx;
	}
}

.uni-uploader {
	padding: 20rpx;
}
.confirm-btn {
	margin-top: 40rpx;
	padding: 0 20rpx;
}
</style>

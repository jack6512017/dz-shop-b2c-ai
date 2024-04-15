<template>
	<view>
		<dz-navbar title="申请售后"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="申请原因" prop="refund_reason" :borderBottom="true" @click="handleSelect">
					<dz-input v-model="form.refund_reason" border="none" disabled placeholder="选择申请原因" disabledColor="transparent">
						<template #suffix>
							<dz-icon name="right"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="问题描述(选填)" :borderBottom="true">
					<dz-textarea
						v-model="form.refund_explain"
						type="textarea"
						placeholder="申请售后具体原因,如商品物流服务的问题"
						border="none"
						:height="120"
						customStyle="padding:0rpx"
					>
					</dz-textarea>
				</dz-form-item>
				<dz-form-item label="上传凭证" :borderBottom="true">
					<dz-upload :fileList="fileList" @afterRead="afterRead" @delete="deletePic" multiple :maxCount="9"></dz-upload>
				</dz-form-item>
				<view class="upload-tip">为了更好的给你提供售后服务,请务必上传故障图片.</view>
				<view class="footer-tip">提交服务单后,售后专员可能与您电话沟通,请保持手机畅通</view>
			</dz-form>
		</view>
		<view class="button" style="margin-top: 100rpx">
			<dz-button
				:custom-style="{ width: '100%', background: isLoading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				:border="false"
				hover-class="none"
				shape="circle"
				:loading="isLoading"
				@click="submit"
			>
				提交售后申请
			</dz-button>
		</view>
		<dz-select
			v-model="selectShow"
			:safe-area-inset-bottom="true"
			:default-value="[defaultValue]"
			:list="columns[parseInt(refundData.refund_type) - 1]"
			@confirm="selectConfirm"
		></dz-select>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const formRef = ref(null);
const { accessToken } = userStore.getData;
const columns = [
	[
		{
			value: '0',
			label: '收货地址错误',
		},
		{
			value: '1',
			label: '多拍/排错/不想要',
		},
		{
			value: '2',
			label: '快递一直未送到',
		},
		{
			value: '3',
			label: '未按约定时间发货',
		},
		{
			value: '4',
			label: '快递无跟踪记录',
		},
		{
			value: '5',
			label: '其它渠道更便宜',
		},
		{
			value: '7',
			label: '其它',
		},
	],
	[
		{
			value: '0',
			label: '七天无理由',
		},
		{
			value: '1',
			label: '缺失配件',
		},
		{
			value: '2',
			label: '发错货',
		},
		{
			value: '3',
			label: '质量问题',
		},
		{
			value: '4',
			label: '商品与页面描述不符',
		},
		{
			value: '5',
			label: '商品到货损坏',
		},
		{
			value: '6',
			label: '促销降价(报价问题)',
		},
		{
			value: '7',
			label: '其它渠道更便宜',
		},
		{
			value: '8',
			label: '其它',
		},
	],
	[
		{
			value: '0',
			label: '缺失配件',
		},
		{
			value: '1',
			label: '发错货',
		},
		{
			value: '2',
			label: '质量问题',
		},
		{
			value: '3',
			label: '商品与页面描述不符',
		},
		{
			value: '4',
			label: '商品到货损坏',
		},
		{
			value: '5',
			label: '促销降价(报价问题)',
		},
		{
			value: '6',
			label: '更换尺码',
		},
		{
			value: '7',
			label: '其它',
		},
	],
];

const data = reactive({
	selectShow: false,
	defaultValue: 0,
	fileList: [],
	refundData: {},
	isLoading: false,
});

const form = reactive({
	refund_reason: '',
	refund_explain: '',
	refund_evidence: '',
});

const theme = computed(() => {
	return userStore.getTheme;
});

const rules = {
	refund_reason: {
		type: 'string',
		required: true,
		message: '选择申请原因',
		trigger: ['change'],
	},
};
onLoad(async (options) => {
	await uni.$onLaunched;
	data.refundData = options;
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function handleSelect() {
	data.selectShow = true;
}

function selectConfirm(e) {
	data.defaultValue = e[0].value;
	form.refund_reason = e[0].label;
}

async function afterRead(event) {
	// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
	let lists = [].concat(event.file);
	let fileListLen = data.fileList.length;
	lists.map((item) => {
		data.fileList.push({
			...item,
			status: 'uploading',
			message: '上传中',
		});
	});
	for (let i = 0; i < lists.length; i++) {
		const result = await uploadFilePromise(lists[i].url);

		let item = data.fileList[fileListLen];
		data.fileList.splice(
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
	data.fileList.splice(event.index, 1);
}

function submit() {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isLoading.value) {
				return;
			}
			isLoading.value = true;
			form.id = data.refundData.id;
			form.refund_type = data.refundData.refund_type;
			const evidence = [];
			data.fileList.forEach((item) => {
				if (item.status == 'success') {
					evidence.push(item.url);
				}
			});
			form.refund_evidence = JSON.stringify(evidence);
			uni.$api.http
				.post(parseInt(data.refundData.order_status) == 4 ? uni.$api.apiMember.orderCustomerApply : uni.$api.apiMember.orderProductRefundApply, {
					...form,
				})
				.then(() => {
					uni.$api.toast('提交成功');
					uni.$emit('refundChange', {});
					setTimeout(() => {
						uni.$api.router.back();
					}, 1000);
				})
				.finally(() => {
					isLoading.value = false;
				});
		});
}

const { selectShow, refundData, defaultValue, fileList, isLoading } = { ...toRefs(data) };
</script>

<style lang="scss">
.form-content {
	margin: 20rpx;
	padding: 10rpx 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
}

.upload-tip {
	margin-top: 20rpx;
	font-size: 24rpx;
	color: $dz-tips-color;
}

.footer-tip {
	margin: 6rpx 0 24rpx;
	font-size: 24rpx;
	color: $dz-tips-color;
}

.button {
	margin: 0 30rpx;
}
</style>

<template>
	<view>
		<dz-navbar :title="title"></dz-navbar>
		<view class="content">
			<view class="product">
				<image :src="product.product_picture || (product.product && product.product[0].product_picture)"></image>
				<view class="name">{{ product.product_name || (product.product && product.product[0].product_name) }}</view>
			</view>
			<view v-if="evaluationType != 'add'" class="product-evaluation">
				<view>商品评价</view>
				<dz-rate
					class="rate-padding"
					gutter="10"
					size="40"
					:value="product.scores || 0"
					@change="rateChange"
					inactive-icon="favor_light"
					active-icon="favor_fill_light"
				></dz-rate>
				<view :style="{ color: theme.dzBaseColor }">{{ scoresText }}</view>
			</view>
			<view class="uploader-box">
				<dz-textarea
					v-model="product.content"
					placeholder="商品很棒,好评!"
					border="none"
					autoHeight
					:customStyle="{ padding: '15rpx', borderRadius: '12rpx', background: 'transparent' }"
				></dz-textarea>
				<view class="dz-uploader">
					<dz-upload
						:fileList="fileList"
						@afterRead="afterRead"
						@delete="deletePic"
						multiple
						:maxCount="9"
						uploadText="添加照片"
						:buttonCustomStyle="{
							border: ' 1px dashed #D3D4D6',
							background: theme.dzBgColor,
						}"
					></dz-upload>
				</view>
			</view>
		</view>
		<view class="evaluation-box">
			<view v-if="evaluationType == 'add'" class="item dz-m-b-50">
				<view>商品评价</view>
				<dz-rate
					class="rate-padding"
					gutter="10"
					size="40"
					:disabled="evaluationType == 'add'"
					:value="product.scores || 0"
					@change="rateChange"
					inactive-icon="favor_light"
					active-icon="favor_fill_light"
				></dz-rate>
				<view :style="{ color: theme.dzBaseColor }">{{ scoresText }}</view>
			</view>
			<view class="checked">
				<dz-checkbox-group v-model="check" :activeColor="theme.dzBaseColor" shape="circle" @change="checkboxChange">
					<dz-checkbox :name="1" label="匿名"></dz-checkbox>
				</dz-checkbox-group>
			</view>
		</view>
		<view class="footer-btn">
			<view style="width: 100%">
				<dz-button
					:border="false"
					:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '90%' }"
					hover-class="none"
					shape="circle"
					:loading="isLoading"
					@click="evaluateClick()"
				>
					提交
				</dz-button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const { accessToken } = userStore.getData;
const data = reactive({
	product: {},
	fileList: [],
	title: '',
	check: [1],
	is_anonymous: 1,
	evaluationType: '',
	scoresText: '',
	isLoading: false,
});
const scoresList = ['失望', '一般', '满意', '喜欢', '超爱'];
const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	getProduct(options);
	data.scoresText = scoresList[4];
});

function getProduct(option) {
	data.product = {};
	data.evaluationType = option.type;
	if (option.data) {
		data.product = JSON.parse(option.data);
		data.product.content = '';
		data.product.scores = 5;
		data.product.shipping_scores = 5;
		data.product.service_scores = 5;
	} else if (option.order_id) {
		data.orderId = option.order_id;
	}
	data.title = '评价晒单';
	if (option.type === 'add') {
		data.title = '追加评价';
	}
	uni.setNavigationBarTitle({
		title: data.title,
	});
}

function rateChange(e) {
	data.product.scores = e;
	data.scoresText = scoresList[parseInt(e) - 1];
}

function checkboxChange(e) {
	if (e.length) {
		data.is_anonymous = 1;
	} else {
		data.is_anonymous = 0;
	}
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

// 提交评价
async function evaluateClick() {
	if (data.isLoading) return;
	const params = {};
	if (!data.product.content) {
		return uni.$api.toast(data.evaluationType == 'add' ? '请填写追加内容' : '请填写内容');
	}
	const list = [];
	data.fileList.forEach((item) => {
		if (item.status == 'success') {
			list.push(item.url);
		}
	});
	if (data.evaluationType !== 'add') {
		if (!data.product.scores) {
			return uni.$api.toast('请对您购买的商品进行评分');
		}
		let item = [];
		item.push({
			order_product_id: data.product.product ? data.product.product[0].id : data.product.id,
			is_anonymous: data.is_anonymous,
			covers: list,
			scores: data.product.scores,
			shipping_scores: data.product.shipping_scores,
			service_scores: data.product.service_scores,
			content: data.product.content,
		});
		params.evaluate = JSON.stringify(item);
		data.isLoading = true;
		evaluateCreate(params);
	} else {
		data.isLoading = true;
		params.order_product_id = data.product.order_product_id ? data.product.order_product_id : data.product.id;
		params.again_content = data.product.content;
		params.again_covers = JSON.stringify(list);
		evaluateAgain(params);
	}
}

// 发表评价
async function evaluateCreate(params) {
	await uni.$api.http.post(uni.$api.apiShop.productEvaluateCreate, params).then((res) => {
		uni.$emit('evaluationStatus', {});
		uni.$api.router
			.redirectTo({
				route: uni.$api.routesConfig.evaluationStatus,
				query: {
					order_id: data.product.product ? data.product.product[0].order_id : data.product.order_id,
					product_id: data.product.product ? data.product.product[0].id : data.product.id,
				},
			})
			.finally(() => {
				data.isLoading = false;
			});
	});
}

// 追加评价
async function evaluateAgain(params) {
	await uni.$api.http
		.post(uni.$api.apiShop.productEvaluateAgain, params, {
			params: {
				order_product_id: params.order_product_id,
			},
		})
		.then((res) => {
			uni.$emit('evaluationStatus', {});
			uni.$api.router.redirectTo({
				route: uni.$api.routesConfig.evaluationStatus,
				query: {
					order_id: data.product.order_id,
					product_id: data.product.product ? data.product.product[0].id : data.product.order_product_id,
				},
			});
		})
		.finally(() => {
			data.isLoading = false;
		});
}

const { title, product, evaluationType, scoresText, fileList, check, isLoading } = { ...toRefs(data) };
</script>

<style lang="scss">
.content {
	padding: 20rpx;
	background-color: #fff;
}
.product-evaluation {
	display: flex;
	font-size: 28rpx;
	color: $dz-main-color;
	margin-top: 30rpx;
	.rate-padding {
		margin: 0 20rpx;
	}
}
.product {
	display: flex;
	align-items: center;
	image {
		flex-shrink: 0;
		width: 150rpx;
		height: 150rpx;
		border-radius: 15rpx;
	}
	.name {
		margin-left: 20rpx;
		font-size: 24rpx;
		color: $dz-main-color;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
.uploader-box {
	margin-top: 30rpx;
	background-color: $dz-bg-color;
	border-radius: 20rpx;
	.uni-textarea-placeholder,
	.uni-textarea-textarea {
		color: $dz-tips-color;
	}
	.dz-uploader {
		padding: 20rpx;
	}
}

.evaluation-box {
	margin-top: 20rpx;
	padding: 40rpx 20rpx;
	background-color: #ffffff;
	.item {
		display: flex;
		align-items: center;

		font-size: 28rpx;
		view {
			margin-right: 20rpx;
		}
	}
}
.checked {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin-top: 20rpx;
}
.footer-btn {
	margin-top: 60rpx;
	display: flex;
	justify-content: center;
}
</style>

<template>
	<view>
		<dz-navbar title="我的反馈"> </dz-navbar>
		<view class="container">
			<view class="label">问题和意见</view>
			<!-- <bolck v-for="(item, index) in data.detail.covers" :key="index">
				<view class="dz-inline-block dz-m-b-10 dz-m-r-10">
					<dz-image :src="item" :borderRadius="20" :width="190" :height="190"></dz-image>
				</view>
			</bolck> -->
			<dz-album :urls="data.detail.covers"></dz-album>
			<view class="value">
				{{ data.detail.content }}
			</view>
			<view class="label">反馈类型</view>
			<view class="value">
				{{ typeOption[data.detail.type] }}
			</view>
			<view class="label">QQ/邮箱/手机号</view>
			<view class="value">
				{{ data.detail.contact_way || '--' }}
			</view>
			<view class="label">平台回复</view>
			<view class="value">
				{{ data.detail.reply || '--' }}
			</view>
			<view class="label">反馈时间</view>
			<view class="value">
				{{ api.timeFormat(data.detail.created_time) }}
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';

const typeOption = {
	'1': '功能建议',
	'2': 'BUG反馈',
	'3': '业务咨询',
};
const data = reactive<any>({
	id: '',
	detail: {},
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.id = options.id;
	if (!options.id) return;
	getView();
});

async function getView() {
	uni.$api.http
		.get(uni.$api.apiBase.opinionView, {
			params: { id: data.id },
		})
		.then((res) => {
			data.detail = res.data;
		});
}

// 预览图片
function previewImgs(img, imgList) {
	uni.previewImage({
		current: img,
		urls: imgList,
	});
}
</script>

<style lang="scss">
.container {
	margin: 20rpx;
	padding: 20rpx;
	border-radius: 20rpx;
	background: #fff;
	.label {
		margin-bottom: 16rpx;
		color: $dz-tips-color;
	}
	.value {
		margin-bottom: 30rpx;
		padding: 10rpx;
		border-radius: 10rpx;
		color: $dz-content-color;
	}
}
</style>

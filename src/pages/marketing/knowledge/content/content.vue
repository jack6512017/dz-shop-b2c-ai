<template>
	<view class="diy-page">
		<dz-navbar title="内容"></dz-navbar>
		<view class="box">
			<view class="title">{{ view.title }}</view>
			<view class="content"><dz-parse :content="view.content" lazy-load></dz-parse></view>
		</view>
		<!-- 加载 -->
		<dz-page-loading :show="loadingShow" :status="loadingStatus" @click="getList"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const data = reactive({
	view: {},
	id: null,
	loadingShow: true,
	loadingStatus: 'loading',
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.id = options.id;
	getList();
});

function getList() {
	uni.$api.http
		.get(uni.$api.apiShop.knowledgeViewContent, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			data.view = res.data;
			data.loadingShow = false;
		})
		.catch(() => {
			data.loadingStatus = 'error';
		});
}
const { view, loadingShow, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
page,
.diy-page {
	height: 100%;
	background-color: #fff;
}
.box {
	width: 100%;
	padding: 10rpx;
	.title {
		text-align: center;
		font-weight: 520;
		color: #000;
		font-size: 35rpx;
	}
	.content {
		margin-top: 20rpx;
	}
}
</style>

<template>
	<view>
		<dz-navbar :title="detail.title"></dz-navbar>
		<view class="container">
			<view class="dz-news-title dz-main-color">{{ detail.title }}</view>
			<view class="dz-sub-info dz-tips-color">
				<view class="dz-sub-left">
					{{ api.timeFormat(detail.created_time) }}
				</view>
				<view class="dz-sub-right">已读 {{ detail.view ? parseInt(detail.view) + 1 : '' }}</view>
			</view>
			<view class="dz-news-content dz-main-color"><dz-parse :content="detail.content"></dz-parse></view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app';
import { reactive, toRefs } from 'vue';

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
		.get(uni.$api.apiBase.announceView, {
			params: { id: data.id },
		})
		.then((res) => {
			data.detail = res.data;
		});
}

const { detail } = { ...toRefs(data) };
</script>

<style lang="scss">
.container {
	padding: 40rpx 30rpx 110rpx 30rpx;
}

.dz-news-title {
	font-size: 48rpx;
	font-weight: 500;
}

.dz-sub-info {
	padding-top: 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 28rpx;
}

.dz-news-content {
	padding-top: 40rpx;
}
</style>

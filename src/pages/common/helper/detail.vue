<template>
	<view>
		<dz-navbar :title="title" :border-bottom="false"></dz-navbar>
		<view class="content">
			<view class="title">{{ title }}</view>
			<view><dz-parse :content="content"></dz-parse></view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const title = ref<string>('');
const content = ref<string>('');

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: options.title,
	});
	title.value = options.title;
	getHelperView(options.id);
});

function getHelperView(id) {
	uni.$api.http
		.get(uni.$api.apiBase.helperView, {
			params: {
				id,
			},
		})
		.then((res) => {
			content.value = res.data.content;
		});
}
</script>

<style lang="scss">
page {
	background-color: #ffffff;
}
.content {
	padding: 30rpx;
	.title {
		margin-bottom: 20rpx;
		color: $dz-main-color;
		font-size: 48rpx;
		font-weight: bold;
	}
	.time {
		padding: 20rpx 0 30rpx;
		font-size: 24rpx;
		color: $dz-tips-color;
	}
}
</style>

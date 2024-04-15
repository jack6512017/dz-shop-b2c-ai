<template>
	<view>
		<dz-navbar title="意见反馈"></dz-navbar>
		<dz-cell-group>
			<dz-cell-item center title="提交意见反馈" :border-bottom="false" @tap="cellTap('feedbackCreate')"></dz-cell-item>
			<dz-cell-item center title="我的反馈" :border-bottom="false" @tap="cellTap('feedbackList')"></dz-cell-item>
		</dz-cell-group>
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '意见反馈',
	});
});

function cellTap(path: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[path],
	});
}
</script>

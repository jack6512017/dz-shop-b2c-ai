<template>
	<view>
		<dz-navbar :title="language.user.protocolRule"></dz-navbar>
		<dz-cell-group>
			<dz-cell-item center title="注册协议" :border-bottom="false" @tap="cellTap('register')"></dz-cell-item>
			<dz-cell-item center title="隐私政策" :border-bottom="false" @tap="cellTap('privacy')"></dz-cell-item>
			<dz-cell-item center title="充值协议" :border-bottom="false" @tap="cellTap('recharge')"></dz-cell-item>
			<dz-cell-item center title="分销商协议" :border-bottom="false" @tap="cellTap('promoter')"></dz-cell-item>
		</dz-cell-group>
	</view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';

const language = uni.$api.language;
onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.user.protocolRule,
	});
});

function cellTap(val: string) {
	let title;
	switch (val) {
		case 'register':
			title = '注册协议';
			break;
		case 'privacy':
			title = language.user.privacyPolicy;
			break;
		case 'recharge':
			title = '充值协议';
			break;
		case 'promoter':
			title = '分销商协议';
			break;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig.protocolDetail,
		query: {
			field: val,
			title,
		},
	});
}
</script>

<template>
	<view><web-view :webview-styles="webviewStyles" :src="url" @message="handleMessage"></web-view></view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const data = reactive({
	url: '',
	webviewStyles: {
		progress: {
			color: theme.value.dzBaseColor,
		},
	},
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.url = uni.$api.strDecode(options.url);
	uni.setNavigationBarTitle({
		title: shopSetting.value.store_name,
	});
});

//H5需要使用window.postMessage
function handleMessage(e) {
	console.log('接收到的消息：' + JSON.stringify(e.detail.data));
}

const { url, webviewStyles } = { ...toRefs(data) };
</script>

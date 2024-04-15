<template>
	<view class="container"><video class="dz-video" :src="url" :enable-danmu="true" :danmu-btn="true" :controls="true" :autoplay="true"></video></view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const url = ref<string>('');
onLoad((options) => {
	url.value = JSON.parse(decodeURIComponent(options.url));
	uni.setNavigationBarTitle({
		title: '视频播放',
	});
});
</script>

<style lang="scss">
page,
.container {
	height: 100%;
	background-color: #000000;
}
.container {
	display: flex;
	align-items: center;
	justify-content: center;
}
.dz-video {
	width: 100%;
	height: 100%;
}
</style>

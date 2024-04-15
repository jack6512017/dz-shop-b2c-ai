<template>
	<view>
		<dz-navbar title="测评首页" :immersive="true"></dz-navbar>
		<view class="form-box" :style="{ width: '100%', height: parseInt(pageConfig.pictureHeight) + 'px' }">
			<image :src="list.cover" mode="aspectFit" />
			<view class="title">{{ list.title }}</view>
			<view class="btn">
				<dz-button
					:border="false"
					shape="circle"
					:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					hover-class="none"
					@click="open"
					>立即开启</dz-button
				>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const systemInfo = uni.getSystemInfoSync();
const data = reactive({
	id: '',
	list: {},
	pageConfig: {
		pictureHeight: 667,
	},
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.id = options.cate_id;
	getList();
});

function getList() {
	uni.$api.http
		.get(uni.$api.apiShop.testRecommendView, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			data.list = res.data;
			data.pageConfig.pictureHeight = systemInfo.windowHeight;
		});
}

function open() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.testRecommendContent,
		query: {
			cate_id: data.id,
		},
	});
}

const { list, pageConfig } = { ...toRefs(data) };
</script>

<style lang="scss">
.form-box {
	background: #fff;
	position: relative;
	display: flex;
	image {
		display: block;
		width: 750rpx;
		height: 750rpx;
		margin: auto 0;
	}

	.title {
		width: 100%;
		padding: 0 30rpx;
		position: absolute;
		font-size: 60rpx;
		top: 200rpx;
		text-align: center;
	}

	.btn {
		width: 50%;
		position: absolute;
		bottom: 150rpx;
		left: 25%;
	}
}
</style>

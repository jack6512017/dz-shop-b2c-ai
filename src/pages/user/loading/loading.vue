<template>
	<view>
		<dz-navbar title="Loading加载动画" :background="{ background: theme.dzBgColor }" :border-bottom="false"></dz-navbar>
		<view class="warp">
			<view class="content">
				<dz-page-loading-style :mode="style_loading_type" :color="theme.dzBaseColor" size="70"></dz-page-loading-style>
				<view v-if="style_loading_type != 'flower' && style_loading_type != 'loading-3'" class="tip dz-m-t-20">{{ loadingText }}</view>
			</view>
		</view>
		<view class="loading-content">
			<view class="dz-m-l-30 dz-m-t-30 dz-font-30 dz-font-weight">动画选择</view>
			<dz-row :gutter="16" class="dz-m-10">
				<dz-grid :border="false">
					<dz-grid-item
						v-for="(item, index) in loadingConfig"
						:key="index"
						@click="loadingChange(index, item.type)"
						customStyle="padding-top: 10px; padding-bottom: 10px"
					>
						<view class="layout" :style="{ borderColor: active == index ? theme.dzBaseColor : '#fff' }">
							<view
								class="layout-item"
								:style="{
									background: active == index ? '#fff' : theme.dzBgColor,
									borderColor: active == index ? theme.dzBaseColor : '',
									color: active == index ? theme.dzBaseColor : '',
								}"
							>
								{{ item.title }}
							</view>
						</view>
					</dz-grid-item>
				</dz-grid>
			</dz-row>
			<view class="dz-flex dz-row-between dz-p-b-40 dz-m-t-40">
				<view class="dz-flex-1">
					<dz-button
						:border="false"
						hoverClass="none"
						:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '90%', height: '90rpx' }"
						shape="circle"
						@click="loadingApply()"
					>
						应用
					</dz-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const { styleLoadingType } = userStore.getData;
const loadingText = '正在加载中...';
const active = ref<number>(0);
const style_loading_type = ref<string>(styleLoadingType);
const loadingConfig = [
	{
		title: '魔法圈',
		type: 'circle',
	},
	{
		title: '一朵花',
		type: 'flower',
	},
	{
		title: '浪漫的枕头',
		type: 'loading-1',
	},
	{
		title: '等等我就来',
		type: 'loading-2',
	},
	{
		title: '双圆点',
		type: 'loading-3',
	},
	{
		title: '音浪',
		type: 'loading-4',
	},
	{
		title: '辣椒',
		type: 'loading-5',
	},
	{
		title: '球球大作战',
		type: 'loading-6',
	},
	{
		title: '月牙湾',
		type: 'loading-8',
	},
];

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: 'Loading加载动画' });
	let index = loadingConfig.findIndex((item) => item.type == style_loading_type.value);
	if (index != -1) {
		active.value = index;
	}
});

function loadingChange(index: number, type: string) {
	active.value = index;
	style_loading_type.value = type;
}

function loadingApply() {
	userStore.setLoadingType(style_loading_type.value);
	uni.$api.router.back();
}
</script>

<style lang="scss" scoped>
.warp {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	margin-top: 30%;
	.content {
		text-align: center;
	}
	.tip {
		padding: 10rpx 20rpx;
		font-size: 22rpx;
		text-align: center;
		color: $dz-tips-color;
	}
}

.loading-content {
	position: fixed;
	width: 100%;
	bottom: 0;
	border-radius: 40rpx 40rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	background: #fff;
	.layout {
		border-radius: 15rpx;
		.layout-item {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 190rpx;
			height: 90rpx;
			border-radius: 20rpx;
			background: #f3f4f6;
			border: 4rpx solid transparent;
			font-size: 28rpx;
		}
	}
}

uni-view[data-theme='dark'] {
	.loading-content {
		.layout {
			.layout-item {
				color: #fff;
				background: #050505 !important;
			}
		}
	}
}
</style>

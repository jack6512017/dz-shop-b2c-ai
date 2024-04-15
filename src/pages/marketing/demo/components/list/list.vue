<template>
	<view
		v-for="(item, index) in shareContentList"
		:key="index"
		class="card"
		@tap="tapDetail(item)"
		:style="{ borderColor: active == index ? theme.dzBaseColor : theme.dzBaseFontColor }"
	>
		<view>
			<view class="name">测试店铺</view>
			<view class="dz-m-t-10 dz-m-b-12">
				<dz-tag shape="circle" size="mini" :color="theme.dzMainColor" :bgColor="theme.dzBgColor" :borderColor="theme.dzBgColor">营业中</dz-tag>
			</view>
			<view class="text"> 广东省广州市天河区 广东省广州市天河区广东省广州市天河区</view>
			<view class="text dz-m-t-10"> 营业时间 09:00-23:59 </view>
		</view>
		<view class="right">
			<view class="dz-text-right dz-font-24">10.3km</view>
			<view class="btn">
				<dz-button
					:plain="true"
					type="info"
					size="mini"
					shape="circle"
					hoverClass="none"
					:border="false"
					:custom-style="{
						width: '44rpx',
						height: '44rpx',
						background: '#FFF',
						lineHeight: '40rpx',
						border: '1rpx solid rgba(0,0,0,0.12)',
					}"
				>
					<dz-icon name="dizhi"></dz-icon>
				</dz-button>
				<dz-button
					:plain="true"
					type="info"
					size="mini"
					shape="circle"
					hoverClass="none"
					:border="false"
					:custom-style="{
						height: '44rpx',
						background: '#FFF',
						lineHeight: '44rpx',
						marginLeft: '12rpx',
						border: '1rpx solid rgba(0,0,0,0.12)',
					}"
				>
					导航<dz-icon name="dizhi"></dz-icon>
				</dz-button>
			</view>
		</view>
		<view class="check-icon" :style="{ background: active == index ? theme.dzBaseColor : theme.dzBaseFontColor }">
			<dz-icon name="check" :color="theme.dzBaseFontColor"></dz-icon>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, toRefs } from 'vue';
import { useUserStore } from '@/state/modules/user';

const props = defineProps({
	list: {
		type: Array,
		deflult: () => [],
	},
});

const emit = defineEmits(['collect']);

const userStore = useUserStore();
const shareContentList = ref<array>(props.list);

const theme = computed(() => {
	return userStore.getTheme;
});

const data = reactive<object>({
	downloadItem: {},
	downloadTask: null,
	active: 1,
});

watch(
	() => props.list,
	(newValue) => {
		shareContentList.value = newValue;
	}
);

//文章跳转
function tapDetail(item) {
	if (item.content_type == 0) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.shareDetail,
			query: {
				id: item.id,
				title: item.title,
			},
		});
	}
}

function login() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
	});
	return;
}

const { active } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.card {
	display: flex;
	justify-content: space-between;
	position: relative;
	background-color: #ffffff;
	margin: 20rpx;
	border-radius: 20rpx;
	padding: 20rpx;
	border: 2rpx solid #ffffff;
	overflow: hidden;
	.name {
		font-size: 30rpx;
		font-weight: 700;
	}
	.text {
		font-size: 24rpx;
		color: $dz-tips-color;
	}
	.check-icon {
		position: absolute;
		right: 0;
		bottom: 0;
		z-index: 999;
		width: 40rpx;
		height: 40rpx;
		padding-left: 10rpx;
		border-radius: 20px 0 0 0;
	}
	.right {
		width: 180rpx;
		display: flex;
		flex-direction: column;
		// align-items: center;
		justify-content: space-between;
		.btn {
			display: flex;
			justify-content: flex-end;
			margin-bottom: 20rpx;
		}
	}
}
</style>

<template>
	<view class="screen">
		<view class="warp">
			<view>
				<view class="dz-text-center"><dz-icon name="alip" size="100" color="rgb(0,164,233)"></dz-icon></view>
				<view class="dz-text-center dz-p-t-20 tip">点击“确认支付”会要求支付宝授权，请选择允许</view>
				<a target="_blank" class="link" :href="schemeAlipay" @tap="schemeAlipayClick"
					><dz-button class="dz-m-t-50" @click="schemeAlipayClick">确认支付</dz-button></a
				>
				<dz-button v-if="alipayResultShow" class="dz-m-t-50" @click="getPayResult">如已支付完成，点击查看支付结果</dz-button>
			</view>
		</view>
		<view v-if="wechatTipshow">
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="pay-tip">
				<view class="dz-content">
					<image :src="live" width="100%"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const data = reactive({
	wechatTipshow: false,
	live: uni.$api.assetsConfig.liveWechat,
	params: {},
	url: '',
	schemeAlipay: '',
	aliPayShow: false,
	alipayResultShow: false,
});

onLoad(async (options) => {
	uni.setNavigationBarTitle({
		title: '支付宝支付',
	});
	await uni.$onLaunched;
	// #ifdef H5
	if (uni.$api.h5IsWechat()) {
		data.wechatTipshow = true;
	}
	data.params = options;
	data.url = options.url;
	data.schemeAlipay = 'alipays://platformapi/startapp?appId=20000067&url=' + encodeURIComponent(data.url);
	// #endif
	// #ifndef H5
	console.log('not in browser');
	// #endif
});

function schemeAlipayClick() {
	data.alipayResultShow = true;
}

function getPayResult() {
	uni.$api.router.redirectTo({
		route: uni.$api.routesConfig.payComplete,
		query: { ...data.params },
	});
}

const { schemeAlipay, alipayResultShow, wechatTipshow, live } = { ...toRefs(data) };
</script>

<style lang="scss">
.screen {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: 1;
	background-color: #fff;
	transition: transform 0.3s;
}

.warp {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.tip {
	font-size: 26rpx;
	color: $dz-tips-color;
}

.mask {
	position: fixed;
	top: 0;
	width: 100%;
	height: 100%;
	z-index: 9999998;
	background-color: rgba(0, 0, 0, 0.6);
}

.pay-tip {
	position: fixed;
	z-index: 9999999;
	top: 20rpx;
	right: 30rpx;
}

.link {
	text-decoration: none;
}
</style>

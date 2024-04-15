<template>
	<view :style="{ margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx` }">
		<view v-if="h5IsWechat" class="tip">
			<view class="text">点击右上角按钮，在弹出的菜单中，点击浏览器中打开， 即可安装</view>
			<view class="icon"><img :src="guide" /></view>
		</view>
		<view class="dz-flex dz-row-center dz-flex-column">
			<dz-image v-if="isLogo" :src="logo" :width="logoSize" :height="logoSize" :borderRadius="logoRadius" />
			<view v-if="isName" :style="nameStyle">{{ name }}</view>
			<view :style="{ width: '100%', padding: `0  ${appBtnLeftRight}rpx` }">
				<dz-button v-if="isAndroid" :custom-style="androidBtnStyle" hoverClass="none" :border="false" @click="download(1)">
					<dz-icon name="androidfill" :size="nameFontSize + 2" :color="androidColor" />
					<text class="dz-m-l-12">Android版本下载</text>
				</dz-button>
				<dz-button v-if="isIos" :custom-style="iosBtnStyle" hoverClass="none" :border="false" @click="download(2)">
					<dz-icon name="iosfill" :size="nameFontSize + 2" :color="iosColor" />
					<text class="dz-m-l-12">iPhone版本下载</text>
				</dz-button>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 0,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 0,
	},
	// 左右边距
	marginLeftRight: {
		type: [String, Number],
		default: 0,
	},
	// 是否显logo
	isLogo: {
		type: Boolean,
		default: true,
	},
	// logo
	logo: {
		type: String,
		default: '',
	},
	// logo尺寸
	logoSize: {
		type: [Number, String],
		default: 160,
	},
	// logo圆角
	logoRadius: {
		type: [Number, String],
		default: 20,
	},
	// 是否显示名称
	isName: {
		type: Boolean,
		default: true,
	},
	// 名称信息
	name: {
		type: String,
		default: 'DzShop',
	},
	// 名称大小
	nameFontSize: {
		type: [Number, String],
		default: 60,
	},
	// 名称颜色
	nameColor: {
		type: String,
		default: '#303133',
	},
	// 名称是否加粗
	nameBold: {
		type: Boolean,
		default: true,
	},
	// 名称上边距
	nameTop: {
		type: [Number, String],
		default: 30,
	},
	// 按钮高度
	appBtnHeight: {
		type: [Number, String],
		default: 100,
	},
	// 按钮左右边距
	appBtnLeftRight: {
		type: [Number, String],
		default: 40,
	},
	// 按钮圆角
	appBtnRadius: {
		type: [Number, String],
		default: 50,
	},
	// 按钮字体大小
	appFontSize: {
		type: [Number, String],
		default: 28,
	},
	// 是否显示安卓
	isAndroid: {
		type: Boolean,
		default: true,
	},
	// 安卓按钮背景颜色
	androidBgColor: {
		type: String,
		default: '#FA3434',
	},
	// 安卓按钮字体颜色
	androidColor: {
		type: String,
		default: '#fff',
	},
	// 安卓按钮边框颜色
	androidBorderColor: {
		type: String,
		default: '#FA3434',
	},
	// 安卓按钮上边距
	androidTop: {
		type: [Number, String],
		default: 60,
	},
	// 是否显示ios
	isIos: {
		type: Boolean,
		default: true,
	},
	// ios按钮背景颜色
	iosBgColor: {
		type: String,
		default: '#FA3434',
	},
	// ios按钮字体颜色
	iosColor: {
		type: String,
		default: '#fff',
	},
	// ios按钮边框颜色
	iosBorderColor: {
		type: String,
		default: '#FA3434',
	},
	// ios按钮上边距
	iosTop: {
		type: [Number, String],
		default: 60,
	},
});
const emit = defineEmits(['copy']);
const downloadUrl = ref<string>('');
const guide = uni.$api.assetsConfig.guide;
const h5IsWechat = ref<boolean>(false);

onMounted(() => {
	if (uni.$api.h5IsWechat()) {
		h5IsWechat.value = true;
	}
});

const nameStyle = computed((): CSSProperties => {
	return {
		marginTop: props.nameTop + 'rpx',
		color: props.nameColor,
		fontSize: props.nameFontSize + 'rpx',
		fontWeight: props.nameBold ? 700 : 400,
	};
});

const androidBtnStyle = computed((): CSSProperties => {
	return {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: props.appBtnHeight + 'rpx',
		marginTop: props.androidTop + 'rpx',
		color: props.androidColor,
		backgroundColor: props.androidBgColor,
		fontSize: props.appFontSize + 'rpx',
		border: `1px solid ${props.androidBorderColor}`,
		borderRadius: props.appBtnRadius + 'rpx',
	};
});

const iosBtnStyle = computed((): CSSProperties => {
	return {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		height: props.appBtnHeight + 'rpx',
		marginTop: props.iosTop + 'rpx',
		color: props.iosColor,
		backgroundColor: props.iosBgColor,
		fontSize: props.appFontSize + 'rpx',
		border: `1px solid ${props.iosBorderColor}`,
		borderRadius: props.appBtnRadius + 'rpx',
	};
});

// 下载apk
async function download(type: number) {
	if (uni.$api.h5IsWechat()) {
		uni.$api.toast('点击右上角按钮，在弹出的菜单中，点击浏览器中打开， 即可安装');
		return;
	}
	await uni.$api.http
		.get(uni.$api.apiChannel.versionsIndex, {
			params: {
				type,
				version: '',
			},
		})
		.then((res) => {
			if (res.data) {
				downloadUrl.value = res.data.download_url;
			}
		});
	if (!downloadUrl.value) {
		uni.$api.toast('检测未有下载地址，请联系管理人员！');
		return;
	}
	// #ifdef MP-WEIXIN
	emit('copy');
	return;
	// #endif
	// #ifdef APP-PLUS
	plus.runtime.openURL(downloadUrl.value);
	return;
	// #endif
	let form = document.createElement('form');
	form.action = downloadUrl.value;
	document.getElementsByTagName('body')[0].appendChild(form);
	form.submit();
}
</script>

<style lang="scss" scoped>
.tip {
	display: flex;
	padding: 30rpx;
	margin-bottom: 30rpx;
	background: rgba(0, 0, 0, 0.9);
	color: #999;
	border-radius: 20rpx;
}
.text {
	font-size: 24rpx;
	line-height: 40rpx;
}
.icon {
	transform: rotateX(180deg);
	img {
		width: 126rpx;
		height: 80rpx;
	}
}
</style>

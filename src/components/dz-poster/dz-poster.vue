<template>
	<view @touchmove.stop.prevent>
		<view class="dz-modal-box" :class="[fadeIn || show ? 'dz-modal-normal' : 'dz-modal-scale', show ? 'dz-modal-show' : '']">
			<view class="dz-poster">
				<image class="poster-img" mode="widthFix" :src="poster" @longpress="saveImage"></image>
				<text class="tips" @tap="hidePoster">{{ api.language.application.pressSaveImage }}</text>
				<view class="dz-close" @tap="hidePoster"><text class="dzicon-iconfont dzicon-roundclosefill dz-icon"></text></view>
			</view>
		</view>
		<view class="dz-modal-mask" :class="[show ? 'dz-mask-show' : '']" @tap="hidePoster"></view>
	</view>
</template>

<script lang="ts" setup>
const props = defineProps({
	poster: {
		type: String,
		default: '',
	},
	//是否显示
	show: {
		type: Boolean,
		default: false,
	},

	//淡入效果
	fadeIn: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['hidePoster']);
function hidePoster() {
	emit('hidePoster');
}

function saveImage() {
	// #ifndef H5
	uni.saveImageToPhotosAlbum({
		filePath: props.poster,
		success() {
			uni.$api.toast('保存海报成功');
		},
	});
	// #endif
	// #ifdef H5
	uni.$api.toast('请长按松开后选择另存为保存到相册');
	// #endif
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-modal-box {
	position: fixed;
	left: 50%;
	top: 50%;
	margin: auto;
	z-index: 9999997;
	transition: all 0.3s linear 0s;
	opacity: 0;
	box-sizing: border-box;
	visibility: hidden;
}

.dz-modal-scale {
	transform: translate(-50%, -50%) scale(0);
}

.dz-modal-normal {
	transform: translate(-50%, -50%) scale(1);
}

.dz-modal-show {
	opacity: 1;
	visibility: visible;
}

.dz-modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	z-index: 9999996;
	transition: all 0.25s linear;
	opacity: 0;
	visibility: hidden;
}

.dz-mask-show {
	visibility: visible;
	opacity: 1;
}

.dz-poster {
	width: 100%;
	position: relative;
	margin-top: 20rpx;
	.poster-img {
		z-index: 9999998;
		/* #ifndef APP-NVUE */
		display: inline-block;
		/* #endif */
		width: 600rpx;
		border-radius: 40rpx;
		height: 1076rpx;
		overflow: hidden;
	}
	.tips {
		@include flex;
		margin-top: 30rpx;
		justify-content: center;
		color: #fff;
	}
}
.dz-close {
	width: 100%;
	@include flex;
	margin-top: 20rpx;
	justify-content: center;
	color: #fff;
}
.dz-icon {
	font-size: 70rpx;
}
</style>

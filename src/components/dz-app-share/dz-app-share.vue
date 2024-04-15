<template>
	<dz-popup v-model:show="_show" mode="bottom" border-radius="40">
		<view class="dz-p-20 dz-text-center">分享到</view>
		<scroll-view scroll-x class="scroll-tap">
			<block v-for="(item, index) in shareList" :key="index">
				<view class="scroll-item" @tap="cateTap(item)">
					<view class="image"><dz-image :src="item.icon" borderRadius="50" :width="100" :height="100"></dz-image></view>
					<view class="text dz-line-1">{{ item.text }}</view>
				</view>
			</block>
		</scroll-view>
		<view class="dz-p-30 dz-text-center" @tap="close()">取消</view>
	</dz-popup>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
	/**
	 * 显示状态
	 */
	show: {
		type: Boolean,
		default: false,
	},
	isPoster: {
		type: Boolean,
		default: true,
	},
	config: {
		type: Object,
		default: () => {},
	},
});

const emit = defineEmits(['update:show', 'onPoster']);
const _show = ref<boolean>(props.show);
const poster = [
	{
		icon: '/static/share/icon_poster.png',
		text: '生成海报',
		provider: 'poster',
		onClick: 'poster',
	},
];
const otherShareList = [
	{
		icon: '/static/share/icon_copy.png',
		text: '复制',
		provider: 'copy',
		onClick: 'copy',
	},
	{
		icon: '/static/share/icon_more.png',
		text: '更多',
		provider: 'more',
		onClick: 'more',
	},
];
let platformShareList = [];
let shareConfig = {};

watch(
	() => props.show,
	(val) => {
		_show.value = val;
	}
);

watch(
	() => _show.value,
	(val) => {
		if (!val) {
			emit('update:show', false);
		}
	}
);

const shareList = computed(() => {
	shareConfig = dataFactory(props.config);
	return platformFilter(shareConfig);
});

onMounted(() => {
	init();
});

function init() {
	// 获取服务商支持的分享
	uni.getProvider({
		service: 'share',
		success: function (res) {
			if (res.provider.includes('sinaweibo')) {
				platformShareList = [
					{
						icon: '/static/share/icon_weibo.png',
						text: '新浪微博',
						onClick: 'share',
						provider: 'sinaweibo',
						type: 0,
					},
				].concat(platformShareList);
			}
			if (res.provider.includes('qq')) {
				platformShareList = [
					{
						icon: '/static/share/icon_qq.png',
						text: 'QQ',
						onClick: 'share',
						provider: 'qq',
						type: 1,
					},
				].concat(platformShareList);
			}
			if (res.provider.includes('weixin')) {
				platformShareList = [
					{
						icon: '/static/share/icon_weixin.png',
						text: '微信好友',
						onClick: 'share',
						provider: 'weixin',
						scene: 'WXSceneSession',
						type: 0,
					},
					{
						icon: '/static/share/icon_pengyouquan.png',
						text: '朋友圈',
						onClick: 'share',
						provider: 'weixin',
						scene: 'WXSceneTimeline',
						type: 0,
					},
					{
						icon: '/static/share/ic_xiaochengxu.png',
						text: '小程序',
						onClick: 'share',
						provider: 'weixin',
						scene: 'WXSceneSession',
						type: 5,
					},
				].concat(platformShareList);
			}
		},
	});
}

// 复制
function onCopy(item?: object, shareInfo: object) {
	let copyInfo = shareInfo.shareUrl || shareInfo.shareContent || shareInfo.shareImg;
	if (copyInfo) {
		uni.setClipboardData({
			data: copyInfo,
			success: () => {
				uni.showToast({
					title: '已复制到剪贴板',
					icon: 'none',
				});
			},
		});
	}
}
// 更多
function onMore(item?: object, shareInfo: object) {
	plus.share.sendWithSystem(
		{
			type: 'text',
			title: shareInfo.shareTitle || '',
			href: shareInfo.shareUrl || '',
			content: shareInfo.shareContent || '',
		},
		function (err) {
			console.log(err);
		}
	);
}
// 分享
function onShare(item?: object, shareInfo: object) {
	if (shareInfo.type == undefined) {
		shareInfo.type = item.type;
	}
	uni.showLoading({
		mask: true,
		title: '分享中...',
	});
	let shareObj = {
		provider: item.provider,
		type: shareInfo.type,
		success: (res) => {
			console.log('success:' + JSON.stringify(res));
			uni.hideLoading();
		},
		fail: (err) => {
			console.log('分享失败，参数缺失 fail:' + JSON.stringify(err));
			uni.hideLoading();
		},
	};
	if (shareInfo.shareTitle) {
		shareObj.title = shareInfo.shareTitle;
	} else if (item.provider == 'qq') {
		uni.showToast({
			title: '缺失分享的标题',
			icon: 'none',
		});
		return;
	}
	if (shareInfo.type == 0 || item.provider == 'qq') {
		if (shareInfo.shareUrl) {
			shareObj.href = shareInfo.shareUrl;
		} else {
			uni.showToast({
				title: '缺失分享的地址',
				icon: 'none',
			});
			return;
		}
	}
	if ([0, 1, 3, 4].includes(shareInfo.type)) {
		if (shareInfo.shareContent) {
			shareObj.summary = shareInfo.shareContent;
		} else {
			uni.showToast({
				title: '缺失分享的描述',
				icon: 'none',
			});
			return;
		}
	}
	if ([0, 2, 5].includes(shareInfo.type)) {
		if (shareInfo.shareImg) {
			shareObj.imageUrl = shareInfo.shareImg;
		} else {
			uni.showToast({
				title: '缺失分享的图片',
				icon: 'none',
			});
			return;
		}
	}
	if ([3, 4].includes(shareInfo.type)) {
		if (shareInfo.mediaUrl) {
			shareObj.mediaUrl = shareInfo.mediaUrl;
		} else {
			uni.showToast({
				title: '缺失分享的音视频地址',
				icon: 'none',
			});
			return;
		}
	}
	if (shareInfo.type == 5) {
		if (shareInfo.appId && shareInfo.appPath && shareInfo.appWebUrl) {
			shareObj.miniProgram = {
				id: shareInfo.appId,
				path: shareInfo.appPath,
				webUrl: shareInfo.appWebUrl,
			};
			if (shareInfo.appType) {
				shareObj.miniProgram.type = shareInfo.appType;
			}
		} else {
			uni.showToast({
				title: '缺失分享小程序的参数',
				icon: 'none',
			});
			return;
		}
	}

	if (item.scene) {
		shareObj.scene = item.scene;
	}
	setTimeout(() => {
		uni.hideLoading();
	}, 300);
	uni.share(shareObj);
}

// 根据type类型过滤掉不支持的平台
function platformFilter(data: object) {
	let platformList = [];
	let supportList = [
		['weixin', 'sinaweibo'],
		['weixin', 'sinaweibo', 'qq'],
		['weixin', 'sinaweibo', 'qq'],
		['weixin', 'qq'],
		['weixin', 'sinaweibo'],
		['weixin'],
	];
	let currentSupport = [];
	if (data.type >= 0 && data.type <= 5) {
		currentSupport = supportList[data.type];
	}
	platformShareList.forEach((item, index) => {
		if (data.type >= 0 && data.type <= 5) {
			if (currentSupport.includes(item.provider)) {
				if (item.provider == 'weixin') {
					if (item.text == '小程序') {
						if (data.type == 5) {
							platformList.push(item);
						}
					} else if (data.type !== 5) {
						platformList.push(item);
					}
				} else {
					platformList.push(item);
				}
			}
		} else {
			if (item.provider == 'weixin') {
				if (item.text == '小程序') {
					if (data.appId && data.appPath) {
						platformList.push(item);
					}
				} else {
					platformList.push(item);
				}
			} else {
				platformList.push(item);
			}
		}
	});
	return platformList.concat(props.isPoster ? poster : []).concat(otherShareList);
}
// 数据处理
function dataFactory(shareInfo = {}) {
	let config = {
		...shareInfo,
	};
	config.shareUrl = shareInfo.shareUrl || '';
	config.shareContent = shareInfo.shareContent || '分享的描述';
	config.shareImg = shareInfo.shareImg || '分享的图片';
	return config;
}

function cateTap(item: object) {
	switch (item.onClick) {
		case 'share':
			onShare(item, shareConfig);
			break;
		case 'copy':
			onCopy(item, shareConfig);
			break;
		case 'more':
			onMore(item, shareConfig);
			break;
		case 'poster':
			emit('onPoster');
			break;
	}
	close();
}

function close() {
	emit('update:show', false);
}
</script>

<style lang="scss">
.scroll-tap {
	white-space: nowrap;
	.scroll-item {
		display: inline-block;
		text-align: center;
		width: 160rpx;
		padding: 0 20rpx;
		.image,
		.icon {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
		}
		.image {
			vertical-align: bottom;
			margin: 0 auto;
		}
		.icon {
			display: inline-block;
			> view {
				height: 100%;
			}
			.dzicon-likefill {
				font-size: 60rpx;
			}
		}
		.text {
			font-size: 28rpx;
			margin: 10rpx 0 20rpx;
		}
	}
}
</style>

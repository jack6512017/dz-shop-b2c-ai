<template>
	<canvas class="hideCanvas" canvas-id="qrcode" style="width: 250px; height: 250px" />
	<canvas class="hideCanvas" canvas-id="default_PosterCanvasId_product" id="default_PosterCanvasId_product" style="width: 750rpx; height: 1260rpx"></canvas>
	<!-- #ifdef H5 -->
	<dz-poster :show="posterShow" :poster="postPath" @hidePoster="hidePosterClick"></dz-poster>
	<!-- #endif -->
	<!-- #ifdef APP-PLUS || MP -->
	<dz-popup v-model:show="posterShow" mode="bottom" border-radius="40" :isHidden="false">
		<template #maskContent>
			<view class="poster" :class="posterShow ? 'show' : 'hidden'">
				<image class="poster-img" mode="widthFix" :src="postPath" @longpress="saveImage"></image>
			</view>
		</template>
		<view class="dz-p-20 dz-text-center">分享当前图片到</view>
		<!-- #ifdef APP-PLUS -->
		<scroll-view scroll-x class="scroll-tap">
			<block v-for="(item, index) in shareList" :key="index">
				<view class="scroll-item" @tap="cateTap(item)">
					<view class="image"><dz-image :src="item.icon" borderRadius="50" :width="100" :height="100"></dz-image></view>
					<view class="text dz-line-1">{{ item.text }}</view>
				</view>
			</block>
		</scroll-view>
		<!-- #endif -->
		<!-- #ifdef MP -->
		<view class="scroll-tap dz-flex">
			<view class="scroll-item dz-flex-1">
				<button class="dz-transparent-btn" open-type="share">
					<view class="image"><dz-image :src="iconWeixin" borderRadius="50" :width="100" :height="100"></dz-image></view>
					<view class="text dz-line-1 dz-main-color">微信好友</view>
				</button>
			</view>
			<view class="scroll-item dz-flex-1" @tap="saveImage">
				<view class="image"><dz-image :src="iconDownload" borderRadius="50" :width="100" :height="100"></dz-image></view>
				<view class="text dz-line-1">保存图片</view>
			</view>
		</view>
		<!-- #endif -->
		<view class="dz-p-30 dz-text-center" @tap="hidePosterClick()">取消</view>
	</dz-popup>
	<!-- #endif -->
</template>

<script lang="ts" setup>
import uQRCode from '@/core/utils/uqrcode';
import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';
import QSCanvas from 'qs-canvas';

const props = defineProps({
	//产品详情
	product: {
		type: Object,
		default() {
			return {
				memberDiscount: { discount: 0 },
			};
		},
	},
	//是否直接购买模式，如为true则不显示商品营销信息
	isBuyMode: {
		type: Boolean,
		default: true,
	},

	//分享数据
	shareData: {
		type: Object,
		default() {
			return {
				shareUrl: '',
				shareTitle: '',
				shareContent: '',
				shareImg: '',
			};
		},
	},
	warehouseDistribution: {
		type: Boolean,
		default: false,
	},
	currentPrice: {
		type: [String, Number],
		default: '',
	},
	marketingPrice: {
		type: String,
		default: '',
	},
	//是否显示
	show: {
		type: Boolean,
		default: false,
	},
});

const userStore = useUserStore();
const groupData = useGroup();
let platformShareList = [];
let shareConfig = {};
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});
const shareList = computed(() => {
	shareConfig = dataFactory(props.shareData);
	return platformFilter(shareConfig);
});

const { proxy } = getCurrentInstance();
const thirdPartyQrCodeImg = ref<string>('');
const wechatQrCodeImg = ref<string>('');
const postPath = ref<string>('');
const posterShow = ref<boolean>(false);
const iconWeixin = '/static/share/icon_weixin.png';
const iconDownload = '/static/share/icon_download.png';
const emit = defineEmits(['update:show']);

watch(
	() => props.show,
	(val) => {
		if (val) {
			posterClick();
		}
	}
);

watch(
	() => posterShow.value,
	(val) => {
		if (!val) {
			emit('update:show', false);
		}
	}
);

onMounted(() => {
	// #ifdef APP-PLUS
	init();
	// #endif
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
						type: 2,
					},
					{
						icon: '/static/share/icon_pengyouquan.png',
						text: '朋友圈',
						onClick: 'share',
						provider: 'weixin',
						scene: 'WXSceneTimeline',
						type: 2,
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

// 根据type类型过滤掉不支持的平台
function platformFilter(data) {
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
	return platformList.concat([
		{
			icon: '/static/share/icon_download.png',
			text: '保存图片',
			provider: 'download',
			onClick: 'download',
		},
	]);
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
			hidePosterClick();
			break;
		case 'download':
			saveImage();
			break;
	}
}

// 分享
function onShare(item, shareInfo) {
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
		if (postPath.value || shareInfo.shareImg) {
			shareObj.imageUrl = postPath.value;
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
	uni.share(shareObj);
}

//点击生成海报
async function posterClick() {
	if (postPath.value) return (posterShow.value = true);
	if (Object.keys(props.product).length === 0) {
		return;
	}
	uni.showLoading({
		mask: true,
		title: uni.$api.language.product.posterCreating,
	});

	try {
		let nickname = userInfo.value.nickname || shopSetting.value.store_name;
		let avatar = userInfo.value.head_portrait || shopSetting.value.store_logo;
		let shareTitle = props.shareData.shareTitle;
		let cover = props.product.picture;
		let price = `${uni.$api.language.application.moneySymbol}${props.product.minSkuPrice}`;
		let productname = props.product.name;
		if (props.isBuyMode || !props.product.marketing_type) {
			//直接购买模式
			let minSkuPrice, maxSkuPrice;
			if (props.product.memberDiscount && parseFloat(props.product.memberDiscount.discount) > 0) {
				//会员折扣
				minSkuPrice = parseFloat(parseFloat(props.product.minSkuPrice) * (1 - parseFloat(props.product.memberDiscount.discount) / 100)).toFixed(2);
				maxSkuPrice = props.product.maxSkuPrice
					? parseFloat(parseFloat(props.product.maxSkuPrice) * (1 - parseFloat(props.product.memberDiscount.discount / 100))).toFixed(2)
					: 0;
			} else {
				minSkuPrice = parseFloat(props.product.minSkuPrice).toFixed(2);
				maxSkuPrice = props.product.maxSkuPrice ? parseFloat(props.product.maxSkuPrice).toFixed(2) : 0;
			}
			price = maxSkuPrice && minSkuPrice !== maxSkuPrice ? minSkuPrice + ' ~ ' + maxSkuPrice : minSkuPrice;
		} else {
			if (props.product.maxSkuPrice && props.product.maxSkuPrice != props.product.minSkuPrice) {
				price = `${uni.$api.language.application.moneySymbol}${props.product.minSkuPrice} ~ ${props.product.maxSkuPrice}`;
			}
		}

		let level_id =
			(userInfo.value &&
				userInfo.value.promoter &&
				userInfo.value.promoter.promoterWarehouse &&
				userInfo.value.promoter.promoterWarehouse.state == 1 &&
				userInfo.value.promoter.promoterWarehouse.level_id) ||
			'';
		// 云仓进货价格
		if (props.warehouseDistribution && level_id) {
			price = props.currentProductPrice;
		}
		if (!props.isBuyMode && props.product.marketing_type) {
			price = props.currentPrice;
			if (props.product.marketing_type === 'haggle') {
				price = uni.$api.toFixed(props.marketingPrice - (1 - uni.$api.toFloat(props.product.marketing.min_rate / 100)) * props.marketingPrice, 2);
			}
		}
		price = `${uni.$api.language.application.moneySymbol}${price}`;
		// 积分商品
		if (props.product.point_exchange_type == 4) {
			price = props.product.point_exchange + shopSetting.value.point_front_name;
		}

		const qsc = new QSCanvas(
			{
				canvasId: 'default_PosterCanvasId_product',
				width: 750,
				height: 1260,
				setCanvasWH: (canvas) => {
					// options.height = canvas.height;
				},
			},
			proxy
		);
		// 绘制背景颜色
		qsc.setRect({ x: 0, y: 0, height: 1260, width: 750 });
		await qsc.saveAndSetPaintbrush({
			fillStyle: '#fff',
		});
		await qsc.fill();
		await qsc.restorePaintbrush();
		// 绘制用户头像
		qsc.setCircle({
			x: uni.upx2px(38),
			y: uni.upx2px(38),
			d: uni.upx2px(136),
			clip: true,
		});
		// 绘制图片
		await qsc.drawImg({
			val: avatar,
			x: uni.upx2px(38),
			y: uni.upx2px(38),
			height: uni.upx2px(136),
			width: uni.upx2px(136),
		});
		qsc.restore();
		// 用户昵称
		await qsc.drawText({
			val: nickname,
			x: uni.upx2px(210),
			y: uni.upx2px(shareTitle.length > 16 ? 50 : 65),
			paintbrushProps: { font: { fontSize: uni.upx2px(38) } },
		});
		// 分享标题
		await qsc.drawText({
			val: shareTitle,
			x: uni.upx2px(210),
			y: uni.upx2px(shareTitle.length > 16 ? 103 : 118),
			maxWidth: uni.upx2px(500),
			line: 2,
			lineHeight: uni.upx2px(12),
			paintbrushProps: {
				fillStyle: '#909399',
				font: { fontSize: uni.upx2px(30) },
			},
		});

		// 商品图片
		qsc.setRect({
			x: uni.upx2px(30),
			y: uni.upx2px(207),
			r: uni.upx2px(40),
			height: uni.upx2px(690),
			width: uni.upx2px(690),
			clip: true,
		});
		// 绘制图片
		await qsc.drawImg({
			val: cover,
			x: uni.upx2px(30),
			y: uni.upx2px(207),
			mode: 'aspectFill',
			height: uni.upx2px(690),
			width: uni.upx2px(690),
		});
		qsc.restore();

		await qsc.drawText({
			val: price,
			x: uni.upx2px(30),
			y: uni.upx2px(942),
			paintbrushProps: {
				fillStyle: '#ff0000',
				font: { fontSize: uni.upx2px(46) },
			},
		});

		await qsc.drawText({
			val: productname,
			x: uni.upx2px(30),
			y: uni.upx2px(1083),
			maxWidth: uni.upx2px(460),
			line: 2,
			lineHeight: uni.upx2px(18),
			paintbrushProps: { font: { fontSize: uni.upx2px(32) } },
		});
		let qrcode;
		const qrType = shopSetting.value.product_poster_qr_type;
		if (qrType == 'mini_program_qr' || (groupData.group == 'wechatMp' && qrType == 'platform')) {
			if (!thirdPartyQrCodeImg.value) {
				await uni.$api.http
					.get(uni.$api.apiCommon.wechatMiniProgramQrcodeByLink, {
						params: {
							link: props.shareData.shareUrl,
						},
					})
					.then((res) => {
						thirdPartyQrCodeImg.value = res.data.url;
					});
			}
			qrcode = thirdPartyQrCodeImg.value;
		} else if (qrType == 'wechat_qr' || (groupData.group == 'wechat' && qrType == 'platform')) {
			//公众号二维码
			if (!wechatQrCodeImg.value) {
				await uni.$api.http.get(uni.$api.apiCommon.wechatAttentionQrcode).then((res) => {
					wechatQrCodeImg.value = res.data.url;
				});
			}
			qrcode = wechatQrCodeImg.value;
		} else if (qrType == 'h5_qr' || (['h5', 'android', 'ios'].includes(groupData.group) && qrType == 'platform')) {
			// await qsc.drawQrCode({
			// 	val: props.shareData.shareUrl,
			// 	x: uni.upx2px(518),
			// 	y: uni.upx2px(973),
			// 	size: uni.upx2px(200),
			// });

			//H5二维码
			qrcode = await new Promise((resolve, reject) => {
				uQRCode.make({
					canvasId: 'qrcode',
					componentInstance: proxy,
					text: props.shareData.shareUrl,
					size: 230,
					margin: 10,
					backgroundColor: '#ffffff',
					foregroundColor: '#000000',
					fileType: 'jpg',
					correctLevel: uQRCode.defaults.correctLevel,
					success: (res) => {
						resolve(res);
					},
					fail: (res) => {
						reject(res);
					},
				});
			});
		}
		await qsc.drawImg({
			val: qrcode,
			x: uni.upx2px(518),
			y: uni.upx2px(973),
			height: uni.upx2px(200),
			width: uni.upx2px(200),
		});

		await qsc.drawText({
			val: '长按或扫描查看',
			x: uni.upx2px(516),
			y: uni.upx2px(1180),
			paintbrushProps: {
				fillStyle: '#909399',
				font: { fontSize: uni.upx2px(30) },
			},
		});

		await qsc.draw();
		// 延迟执行, 防止不稳定
		setTimeout(async () => {
			postPath.value = await qsc.toImage();
			uni.hideLoading();
		}, 100);
		setTimeout(() => {
			posterShow.value = true;
		}, 200);
	} catch (e) {
		console.log(e);
		uni.$api.toast(uni.$api.language.product.posterCreateError);
		uni.hideLoading();
	}
}

//隐藏海报
function hidePosterClick() {
	posterShow.value = false;
	emit('update:show', false);
}

function saveImage() {
	// #ifndef H5
	uni.saveImageToPhotosAlbum({
		filePath: postPath.value,
		success() {
			uni.$api.toast('图片已保存至相册');
		},
		fail: () => {
			uni.$api.toast('保存失败！请检查应用在手机上的照片及文件是否允许读取');
		},
	});
	// #endif
	// #ifdef H5
	uni.$api.toast('请长按松开后选择另存为保存到相册');
	// #endif
}
</script>

<style lang="scss" scoped>
.hideCanvas {
	position: fixed;
	top: -99999rpx;
	left: -99999rpx;
	z-index: -99999;
}

.poster {
	position: fixed;
	left: 50%;
	top: 0;
	z-index: 10076;
	transition: all 0.25s linear;
	transform: translate3D(0px, -100%);

	.poster-img {
		/* #ifndef APP-NVUE */
		display: inline-block;
		/* #endif */
		width: 600rpx;
		border-radius: 40rpx;
		height: 1000rpx;
		overflow: hidden;
	}
}

.show {
	transform: translate(-50%, 25%);
}

.hidden {
	transform: translate(-50%, -150%);
}

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
			/* #ifdef APP-PLUS */
			margin: 10rpx 0 20rpx;
			/* #endif */
			/* #ifdef MP */

			/* #endif */
			// margin-top: 10rpx;
			line-height: 70rpx;
		}
	}
}

.dz-transparent-btn {
	display: block;
	background: transparent;
	margin: 0;
	padding: 0;
	border-radius: 0;
	border: 0;
	font-weight: 400 !important;
}

.dz-transparent-btn::after {
	border: 0;
}
</style>

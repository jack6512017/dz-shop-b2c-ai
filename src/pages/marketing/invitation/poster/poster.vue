<template>
	<view class="container">
		<image class="register-bg" :src="invitationData.share_background_picture" mode="center" :style="{ width: '100%', height: '100%' }"></image>
		<view class="content">
			<view class="card">
				<view class="avatar"><dz-image :src="userInfo.head_portrait" width="150" height="150" borderRadius="75"></dz-image></view>
				<view class="name dz-text-center">来自 {{ userInfo.nickname }} 的邀请</view>
				<view class="tip dz-text-center">{{ invitationData.share_title }}</view>
				<view class="dz-flex dz-row-center dz-m-t-10"><dz-image :src="iconPic" width="450" height="180"></dz-image></view>
				<view class="qrcode dz-m-t-30">
					<dz-image :src="qrcode" width="200" height="200"></dz-image>
					<view class="dz-m-l-30 qrcode-text">
						<view>
							<view class="qr-text-1">邀请有礼</view>
							<view class="dz-m-t-4">{{ invitationData.share_description }}</view>
						</view>
						<view class="qr-text-2">扫码二维码查看详情</view>
					</view>
				</view>
				<dz-button
					hover-class="none"
					:border="false"
					:custom-style="{ marginTop: '20rpx', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					@click="sharePost"
				>
					保存图片分享
				</dz-button>
			</view>
		</view>
		<!--二维码-->
		<canvas class="hideCanvas" canvas-id="qrcode" style="width: 430px; height: 430px" />
		<canvas class="hideCanvas" canvas-id="my_PosterCanvasId" id="my_PosterCanvasId" style="width: 750rpx; height: 1334rpx"></canvas>
		<!-- 海报展示 -->
		<dz-poster :show="posterShow" :poster="postPath || ''" @hidePoster="hidePosterClick"></dz-poster>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, getCurrentInstance, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import uQRCode from '@/core/utils/uqrcode';
import QSCanvas from 'qs-canvas';

const language = uni.$api.language;
const iconPic = uni.$api.assetsConfig.posterPic;
const data = reactive({
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	shareData: {},
	qrcode: '',
	postPath: '',
	posterShow: false,
	invitationId: '',
	invitationData: '',
});
const proxy = getCurrentInstance();
const userStore = useUserStore();

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const hasLogin = computed(() => {
	return userStore.hasLogin;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '分享',
	});
	if (options.id) {
		data.invitationId = options.id;
		getInvitation();
	}
	data.qrcode = await getQrcode();
});

function pageLoadingClick() {
	this.pageLoadingStatus = 'loading';
	getInvitation();
}

function getInvitation() {
	data.pageLoadingShow = true;
	uni.$api.http
		.get(uni.$api.apiShop.invitationIndex, {
			params: {
				id: data.invitationId,
			},
		})
		.then((res) => {
			data.invitationData = res.data.invitation;
			data.pageLoadingShow = false;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

//隐藏海报
function hidePosterClick() {
	data.posterShow = false;
}

async function sharePost() {
	if (data.postPath) {
		data.posterShow = true;
		return;
	}
	uni.showLoading({
		mask: true,
		title: '正在生成海报',
	});
	let bgPic = data.invitationData.share_background_picture;
	let nickname = userInfo.value.nickname || userInfo.value.realname;
	let avatar = (userInfo.value && userInfo.value.head_portrait) || shopSetting.value.store_logo;
	let qrcode = data.qrcode;
	let invitationData = data.invitationData;

	try {
		const qsc = new QSCanvas(
			{
				canvasId: 'my_PosterCanvasId',
				width: 750,
				height: 1334,
				setCanvasWH: (canvas) => {
					// options.height = canvas.height;
				},
			},
			proxy
		);
		// 绘制背景图
		await qsc.drawImg({
			type: 'image',
			val: bgPic,
			x: 0,
			y: 0,
			width: 750 / 2,
			// // #ifdef MP
			// width: 1080 / 2,
			// // #endif
			// // #ifndef MP
			// width: 1132 / 2,
			// // #endif
			mode: 'widthFix',
			zIndex: 0,
		});
		await qsc.updateCanvasWH({
			width: 750,
			height: 1334,
		});

		// qsc.setRect({ x: 40, y: 480, height: 606 + 75, width: 670, clip: true });
		// await qsc.saveAndSetPaintbrush({
		// 	fillStyle: '#fff',
		// });
		qsc.setPaintbrush({
			x: 40,
			y: 480,
			height: 606 + 75,
			width: 670,
			fillStyle: '#fff',
		});
		await qsc.fill();
		await qsc.savePaintbrush();
		// 绘制用户头像
		qsc.setCircle({
			x: uni.upx2px(300),
			y: uni.upx2px(480 - 75),
			d: uni.upx2px(150),
			clip: true,
		});

		// 绘制图片
		await qsc.drawImg({
			val: avatar,
			x: uni.upx2px(300),
			y: uni.upx2px(480 - 75),
			height: uni.upx2px(150),
			width: uni.upx2px(150),
		});
		qsc.restore();

		// 二维码
		await qsc.drawImg({
			val: qrcode,
			x: uni.upx2px(60),
			y: uni.upx2px(709 + 225),
			width: uni.upx2px(200),
			height: uni.upx2px(200),
		});
		qsc.restore();

		await qsc.drawImg({
			val: iconPic,
			x: uni.upx2px(375 - 225),
			y: uni.upx2px(709),
			width: uni.upx2px(450),
			height: uni.upx2px(180),
		});
		qsc.restore();

		// 用户昵称
		await qsc.drawText({
			val: '来自 ' + nickname + ' 邀请',
			x: uni.upx2px(375),
			y: uni.upx2px(590),
			maxWidth: uni.upx2px(670),
			lineHeight: uni.upx2px(50),
			line: 2,
			paintbrushProps: {
				textAlign: 'center',
				fillStyle: '#333',
				font: { fontSize: uni.upx2px(32), fontWeight: 'bold' },
			},
		});

		// 分享标题
		await qsc.drawText({
			val: invitationData.share_title,
			x: uni.upx2px(375),
			y: uni.upx2px(653),
			maxWidth: uni.upx2px(670),
			lineHeight: uni.upx2px(50),
			line: 2,
			paintbrushProps: {
				textAlign: 'center',
				fillStyle: '#333',
				font: { fontSize: uni.upx2px(40), fontWeight: 'bold' },
			},
		});

		// 分享标题
		await qsc.drawText({
			val: invitationData.share_description,
			x: uni.upx2px(280),
			y: uni.upx2px(922 + 75),
			maxWidth: uni.upx2px(400),
			lineHeight: uni.upx2px(32),
			line: 2,
			paintbrushProps: {
				textAlign: 'left',
				font: { fontSize: uni.upx2px(28) },
			},
		});

		await qsc.drawText({
			val: '邀请有礼',
			x: uni.upx2px(280),
			y: uni.upx2px(869 + 75),
			maxWidth: uni.upx2px(400),
			paintbrushProps: {
				textAlign: 'left',
				font: { fontSize: uni.upx2px(32), fontWeight: 'bold' },
			},
		});

		await qsc.drawText({
			val: '扫码二维码查看详情',
			x: uni.upx2px(280),
			y: uni.upx2px(1021 + 75),
			maxWidth: uni.upx2px(400),
			paintbrushProps: {
				textAlign: 'left',
				font: { fontSize: uni.upx2px(28) },
			},
		});

		await qsc.draw();
		// 延迟执行, 防止不稳定
		setTimeout(async () => {
			data.postPath = await qsc.toImage();
			uni.hideLoading();
		}, 100);
		setTimeout(() => {
			data.posterShow = true;
		}, 200);
	} catch (e) {
		console.log(e);
		uni.$api.toast(uni.$api.language.product.posterCreateError);
		uni.hideLoading();
	}
}

function saveImage() {
	// #ifndef H5
	uni.saveImageToPhotosAlbum({
		filePath: data.postPath,
		success: (res) => {
			uni.$api.toast('保存成功');
		},
	});
	// #endif
	// #ifdef H5
	uni.$api.toast('请长按上方图片保存');
	// #endif
}

async function getQrcode() {
	let domain = uni.$api.appConfig.h5Domain;
	let url = '';
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.invitationPoster.path}?id=${data.invitationId}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + userInfo.value.promo_code;
		if (userInfo.value.store_id) {
			url = url + '&store_id=' + userInfo.value.store_id;
		}
	}
	return await new Promise((resolve, reject) => {
		uQRCode.make({
			canvasId: 'qrcode',
			componentInstance: proxy,
			text: url,
			size: 250,
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

const { invitationData, qrcode, postPath, posterShow, pageLoadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
page,
.container {
	width: 100vw;
	height: 100vh;
}
.register-bg {
	display: block;
}

.content {
	width: 100%;
	position: absolute;
	top: 50%;
	left: 0;
	transform: translateY(-50%);
	padding: 0 40rpx;
}

.card {
	position: relative;
	padding: 30rpx;
	background: #fff;
	border-radius: 30rpx;
	.avatar {
		width: 170rpx;
		height: 170rpx;
		margin: -115rpx auto 20rpx;
		border: 10rpx solid #fff;
		border-radius: 50%;
		background: #fff;
	}
	.name,
	.tip {
		font-weight: bold;
	}
	.name {
		font-size: 32rpx;
		color: #666;
	}
	.tip {
		margin-top: 20rpx;
		font-size: 40rpx;
	}
	.qrcode {
		display: flex;
	}
	.qrcode-text {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.qr-text-1 {
		font-size: 32rpx;
		font-weight: bold;
	}
	.qr-text-2 {
		color: #999;
	}
}

/*海报*/

.hideCanvas {
	position: fixed;
	top: -99999upx;
	left: -99999upx;
	z-index: -99999;
}
</style>

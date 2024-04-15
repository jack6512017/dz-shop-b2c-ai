<template>
	<view class="content" :style="{ background: theme.dzBaseColor }">
		<dz-navbar
			:title="'推广二维码'"
			:title-color="theme.dzBaseFontColor"
			:back-icon-color="theme.dzBaseFontColor"
			:border-bottom="false"
			:background="{ background: theme.dzBaseColor }"
		></dz-navbar>
		<view>
			<view class="banner"></view>
			<view class="content-bg">
				<view class="user-info">
					<image :src="logo"></image>
					<view>{{ userInfo.nickname || appName }}</view>
					<view class="dz-flex dz-row-center dz-m-t-20">
						<text>推广码: {{ code }}</text>
						<view>
							<dz-button
								:custom-style="{ height: '40rpx', marginLeft: '20rpx', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
								hover-class="none"
								:border="false"
								size="mini"
								shape="circle"
								@click="clickCode(code)"
							>
								复制
							</dz-button>
						</view>
					</view>
					<view class="cord_img">
						<image @longpress="long" :src="imgSrc" mode=""></image>
						<view class="code_tip">长按保存二维码</view>
					</view>
				</view>
			</view>
		</view>
		<!--海报-->
		<canvas class="hideCanvas" canvas-id="qrcode" style="width: 250px; height: 250px" />
		<dz-modal
			v-model:show="downloadShow"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="false"
			:async-close="true"
			:content="`正在下载（${downloadText}）`"
			@confirm="downloadCancel"
			:confirm-text="'取消'"
		></dz-modal>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs, getCurrentInstance } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';
import uQRCode from '@/core/utils/uqrcode';

const userStore = useUserStore();
const groupData = useGroup();
const proxy = getCurrentInstance();

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const hasLogin = computed(() => {
	return userStore.hasLogin;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const logo = shopSetting.value.store_logo || uni.$api.assetsConfig.logo;

const data = reactive({
	code: userInfo.value.promo_code,
	imgSrc: '',
	posterShow: false,
	postPath: '',
	thirdPartyQrCodeImg: '',
	wechatQrCodeImg: '',
	downloadText: '',
	downloadPercent: '',
	downloadShow: false,
	downloadTask: null,
	appName: shopSetting.value.store_name,
});

onLoad(async () => {
	await uni.$onLaunched;
	getCode();
});

async function getCode() {
	let wxLink = uni.$api.appConfig.indexPath;
	if (wxLink.startsWith('/')) {
		wxLink = wxLink.substr(1);
	}
	if (wxLink.endsWith('/')) {
		wxLink = wxLink.substr(0, wxLink.length - 1);
	}
	if (hasLogin.value) {
		wxLink = wxLink + '?promo_code=' + userInfo.value.promo_code;
	}
	wxLink = encodeURIComponent(wxLink);
	const qrType = shopSetting.value.product_poster_qr_type;
	if (qrType == 'mini_program_qr' || (groupData.group == 'wechatMp' && qrType == 'platform')) {
		if (!data.thirdPartyQrCodeImg) {
			await uni.$api.http
				.get(uni.$api.apiCommon.wechatMiniProgramQrcodeByLink, {
					params: {
						link: wxLink,
					},
				})
				.then((res) => {
					data.thirdPartyQrCodeImg = res.data.url;
				})
				.catch(() => {
					uni.hideLoading();
				});
		}
		data.imgSrc = data.thirdPartyQrCodeImg;
	} else if (qrType == 'wechat_qr' || (groupData.group == 'wechat' && qrType == 'platform')) {
		if (!data.wechatQrCodeImg) {
			await uni.$api.http
				.get(uni.$api.apiCommon.wechatAttentionQrcode)
				.then((res) => {
					data.wechatQrCodeImg = res.data.url;
				})
				.catch((err) => {});
		}
		data.imgSrc = data.wechatQrCodeImg;
	} else if (qrType == 'h5_qr' || (['h5', 'android', 'ios'].includes(groupData.group) && qrType == 'platform')) {
		let domain = uni.$api.appConfig.h5Domain;
		if (domain.endsWith('/')) {
			domain = domain.substr(0, domain.length - 1);
		}
		data.imgSrc = await new Promise((resolve, reject) => {
			uQRCode.make({
				canvasId: 'qrcode',
				componentInstance: proxy,
				text: `${domain}?promo_code=${data.code}`,
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
}

// 复制
function clickCode(val) {
	uni.$api.copy(val);
	uni.$api.toast('推荐码已复制到剪贴板');
}

function saveImg() {
	// #ifndef H5
	//如果是在线图片，下载并保存
	if (uni.$api.isUrl(data.imgSrc)) {
		data.downloadPercent = 0;
		data.downloadText = data.downloadPercent + '%';
		data.downloadShow = true;
		data.downloadTask = uni.downloadFile({
			url: data.imgSrc,
			success: (res) => {
				if (res.statusCode === 200) {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.$api.toast('已下载到您的手机相册');
							data.downloadShow = false;
						},
						fail: () => {
							uni.$api.toast('保存失败，请打开保存相册权限，再重试保存');
							data.downloadShow = false;
						},
					});
				}
			},
			fail: () => {
				uni.$api.toast('保存失败，请打开保存相册权限，再重试保存');
				data.downloadShow = false;
			},
		});

		data.downloadTask.onProgressUpdate((res) => {
			data.downloadPercent = res.progress;
			data.downloadText = res.progress + '%';
		});
	} else {
		uni.saveImageToPhotosAlbum({
			filePath: data.imgSrc,
			success() {
				uni.$api.toast('已保存到您的手机相册');
			},
		});
	}
	// #endif
	// #ifdef H5
	uni.$api.toast('请长按松开后选择另存为保存到相册');
	// #endif
}

function long() {
	uni.showActionSheet({
		itemList: ['保存到手机'],
		itemColor: '#0081FF',
		success: function (res) {
			if (res.tapIndex == 0) {
				saveImg();
			}
		},
	});
}

function downloadCancel() {
	try {
		data.downloadTask.abort();
	} catch (e) {
	} finally {
		data.downloadShow = false;
	}
}

const { appName, code, imgSrc, downloadShow, downloadText } = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.content {
	height: 100%;
}
.banner {
	height: 220rpx;
	image {
		width: 100%;
		height: 320rpx;
		display: block;
	}
}
.content-bg {
	padding: 15rpx;
	.user-info {
		margin: 0 30rpx;
		background-color: #ffffff;
		border-radius: 30rpx;
		text-align: center;
		image {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			border: 20rpx solid #ffffff;
			overflow: hidden;
			margin-top: -60rpx;
			background-color: #ffffff;
		}
	}
	.cord_img {
		padding: 30rpx 0 20rpx;
		image {
			border: none;
			border-radius: 0;
			width: 300rpx;
			height: 300rpx;
			margin-top: 0;
		}
	}
	.code_tip {
		padding-bottom: 30rpx;
		color: #909993;
	}
}
.hideCanvas {
	position: fixed;
	top: -999px;
	left: -999px;
	z-index: -99;
}
</style>

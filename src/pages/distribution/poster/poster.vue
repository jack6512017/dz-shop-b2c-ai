<template>
	<view>
		<dz-navbar :title="titleData[type]"></dz-navbar>
		<view v-if="posterList.length" class="dz-poster-list">
			<view class="dz-poster-container">
				<block v-for="(item, index) in posterList" :key="index">
					<view v-if="(index + 1) % 2 != 0">
						<view class="dz-pos-item" hover-class="hover" :hover-start-time="150" @tap="shareFc(item)">
							<image :src="item.cover" class="dz-pos-img" mode="widthFix" />
							<view class="dz-pos-content">
								<view class="dz-pos-tit">{{ item.title }}</view>
							</view>
						</view>
						<canvas
							class="hideCanvas"
							:canvas-id="'default_PosterCanvasId' + item.id"
							:id="'default_PosterCanvasId' + item.id"
							:style="{ width: parseInt(item.cover_width) * 0.4 + 'px', height: parseInt(item.cover_height) * 0.4 + 'px' }"
						></canvas>
					</view>
				</block>
			</view>
			<view class="dz-poster-container">
				<block v-for="(item, index) in posterList" :key="index">
					<view v-if="(index + 1) % 2 == 0">
						<view class="dz-pos-item" hover-class="hover" :hover-start-time="150" @tap="shareFc(item)">
							<image :src="item.cover" class="dz-pos-img" mode="widthFix" />
							<view class="dz-pos-content">
								<view class="dz-pos-tit">{{ item.title }}</view>
							</view>
						</view>
						<canvas
							class="hideCanvas"
							:canvas-id="'default_PosterCanvasId' + item.id"
							:id="'default_PosterCanvasId' + item.id"
							:style="{ width: parseInt(item.cover_width) * 0.4 + 'px', height: parseInt(item.cover_height) * 0.4 + 'px' }"
						></canvas>
					</view>
				</block>
			</view>
		</view>
		<!--二维码-->
		<canvas class="hideCanvas" canvas-id="qrcode" style="width: 250px; height: 250px" />
		<!-- 海报展示 -->
		<dz-poster :show="posterShow" :poster="postPath || ''" @hidePoster="hidePosterClick"></dz-poster>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="80" :src="empty" iconSize="360" text="暂无分享海报"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" :margin-top="!posterList.length ? 20 : 0" :margin-bottom="20"></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs, getCurrentInstance } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';
import uQRCode from '@/core/utils/uqrcode';
import QSCanvas from 'qs-canvas';

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

const empty = uni.$api.assetsConfig.empty;

const titleData = {
	store: '分销海报',
	cloud: '经销海报',
};
const data = reactive({
	type: '',
	posterList: [],
	qrShow: false,
	thirdPartyQrCodeImg: '', //小程序码
	wechatQrCodeImg: '', //关注公众号码
	postPath: '',
	logo: '',
	appName: '',
	loadingStatus: 'loading',
	page: 1,
	posterShow: false,
});

// 缩放
const reduce = 0.4;

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: titleData[options.type],
	});
	if (options.type) {
		data.type = options.type;
	}
	data.logo = shopSetting.value.store_logo;
	data.appName = shopSetting.value.store_name;
	getDistributionPosterIndex();
});

onPullDownRefresh(() => {
	data.page = 1;
	data.posterList = [];
	getDistributionPosterIndex();
});

onReachBottom(() => {
	if (data.loadingStatus == 'nomore') return;
	data.page++;
	getDistributionPosterIndex();
});

function getDistributionPosterIndex() {
	data.loadingStatus = 'loading';
	uni.$api.http
		.get(uni.$api.apiShop.distributionPosterIndex, {
			params: {
				page: data.page,
				page_size: uni.$api.appConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			data.posterList = [...data.posterList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		});
	uni.stopPullDownRefresh();
}

async function shareFc(item) {
	uni.showLoading({
		mask: true,
		title: uni.$api.language.product.posterCreating,
	});

	let bg = item.cover;
	let diyStyle = item.component;
	let qrsize = parseInt(diyStyle.qrcode_size) * 2 * reduce;
	let qrx = parseInt(diyStyle.qrcode_x) * 2 * reduce;
	let qry = parseInt(diyStyle.qrcode_y) * 2 * reduce;
	let nickname = userInfo.value.nickname || userInfo.value.realname;
	let avatar = (userInfo.value && userInfo.value.head_portrait) || data.logo;

	let logo = data.logo;
	let appName = data.appName;

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

	let qrcode;
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
				.catch((err) => {});
		}
		qrcode = data.thirdPartyQrCodeImg;
	} else if (qrType == 'wechat_qr' || (groupData.group == 'wechat' && qrType == 'platform')) {
		//公众号二维码
		if (!data.wechatQrCodeImg) {
			await uni.$api.http
				.get(uni.$api.apiCommon.wechatAttentionQrcode)
				.then((res) => {
					data.wechatQrCodeImg = res.data.url;
				})
				.catch((err) => {});
		}
		qrcode = data.wechatQrCodeImg;
	} else if (qrType == 'h5_qr' || (['h5', 'android', 'ios'].includes(groupData.group) && qrType == 'platform')) {
		let domain = uni.$api.appConfig.h5Domain;
		if (domain.endsWith('/')) {
			domain = domain.substr(0, domain.length - 1);
		}
		qrcode = await new Promise((resolve, reject) => {
			uQRCode.make({
				canvasId: 'qrcode',
				componentInstance: proxy,
				text: `${domain}?promo_code=${userInfo.value.promo_code}`,
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

	try {
		const qsc = new QSCanvas(
			{
				canvasId: 'default_PosterCanvasId' + item.id,
				width: parseInt(item.cover_width) * reduce,
				height: parseInt(item.cover_height) * reduce,
				setCanvasWH: (canvas) => {
					// options.height = canvas.height;
				},
			},
			proxy
		);
		// 绘制背景图
		await qsc.drawImg({
			type: 'image',
			val: bg,
			x: 0,
			y: 0,
			width: parseInt(item.cover_width) * reduce,
			mode: 'widthFix',
			zIndex: 0,
		});
		await qsc.updateCanvasWH({
			width: parseInt(item.cover_width) * reduce,
			height: parseInt(item.cover_height) * reduce,
		});

		// 绘制用户头像
		qsc.setCircle({
			x: parseInt(diyStyle.head_portrait_x) * 2 * reduce,
			y: parseInt(diyStyle.head_portrait_y) * 2 * reduce,
			d: parseInt(diyStyle.head_portrait_size) * 2 * reduce,
			clip: true,
		});

		// 绘制图片
		await qsc.drawImg({
			val: diyStyle.head_startUsing == 1 ? avatar : '',
			x: parseInt(diyStyle.head_portrait_x) * 2 * reduce,
			y: parseInt(diyStyle.head_portrait_y) * 2 * reduce,
			height: parseInt(diyStyle.head_portrait_size) * 2 * reduce,
			width: parseInt(diyStyle.head_portrait_size) * 2 * reduce,
		});
		qsc.restore();

		// logo
		qsc.setRect({
			x: parseInt(diyStyle.store_logo_x) * 2 * reduce,
			y: parseInt(diyStyle.store_logo_y) * 2 * reduce,
			r: parseInt(diyStyle.store_border_radius) * 2 * reduce,
			width: parseInt(diyStyle.store_logo_size) * 2 * reduce,
			height: parseInt(diyStyle.store_logo_size) * 2 * reduce,
			clip: true,
		});
		// 绘制图片
		await qsc.drawImg({
			val: diyStyle.store_status == 1 ? logo : '',
			x: parseInt(diyStyle.store_logo_x) * 2 * reduce,
			y: parseInt(diyStyle.store_logo_y) * 2 * reduce,
			width: parseInt(diyStyle.store_logo_size) * 2 * reduce,
			height: parseInt(diyStyle.store_logo_size) * 2 * reduce,
		});
		qsc.restore();

		// 二维码
		await qsc.drawImg({
			val: diyStyle.qrcode_startUsing == 1 ? qrcode : '',
			x: qrx,
			y: qry,
			width: qrsize,
			height: qrsize,
		});
		qsc.restore();

		// 用户昵称
		await qsc.drawText({
			val: diyStyle.head_startUsing == 1 ? '我是 ' + nickname : '',
			x: (diyStyle.head_portrait_size * 2 + 20 + diyStyle.head_portrait_x * 2) * reduce,
			y: (diyStyle.head_portrait_y * 2 + diyStyle.head_portrait_size - diyStyle.nickname_size) * reduce,
			paintbrushProps: {
				fillStyle: diyStyle.nickname_color,
				font: { fontSize: diyStyle.nickname_size * 2 * reduce, fontWeight: diyStyle.nickname_bold == 1 ? 'bold' : '400' },
			},
		});

		// 文案
		await qsc.drawText({
			val: diyStyle.text_startUsing == 1 ? diyStyle.text : '',
			x: diyStyle.text_x * 2 * reduce,
			y: diyStyle.text_y * 2 * reduce,
			maxWidth: item.cover_width - diyStyle.text_x * 2 * reduce,
			lineHeight: (diyStyle.text_size * 2 + 12) * reduce,
			paintbrushProps: {
				fillStyle: diyStyle.text_color,
				font: { fontSize: diyStyle.text_size * 2 * reduce, fontWeight: diyStyle.text_bold == 1 ? 'bold' : '400' },
			},
		});

		// 店铺信息
		await qsc.drawText({
			val: diyStyle.store_status == 1 ? appName : '',
			x: diyStyle.store_name_x * 2 * reduce,
			y: diyStyle.store_name_y * 2 * reduce,
			maxWidth: (item.cover_width - diyStyle.store_name_x * 2) * reduce,
			lineHeight: (diyStyle.store_name_size * 2 + 12) * reduce,
			paintbrushProps: {
				fillStyle: diyStyle.store_name_color,
				font: { fontSize: diyStyle.store_name_size * 2 * reduce, fontWeight: diyStyle.store_name_bold == 1 ? 'bold' : '400' },
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
	data.posterShow = false;
}

const { type, posterList, posterShow, postPath, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.dz-poster-list {
	display: flex;
	justify-content: space-between;
	flex-direction: row;
	flex-wrap: wrap;
	box-sizing: border-box;
	margin: 20rpx 20rpx;
}

.dz-poster-container {
	flex: 1;
	margin-right: 20rpx;
}

.dz-poster-container:last-child {
	margin-right: 0;
}

.dz-pos-item {
	width: 100%;
	margin-bottom: 20rpx;
	background: #fff;
	box-sizing: border-box;
	border-radius: 20rpx;
	overflow: hidden;
	transition: all 0.15s ease-in-out;
}

.dz-pos-img {
	width: 100%;
	display: block;
}

.dz-pos-content {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	box-sizing: border-box;
	padding: 20rpx;
}

.dz-pos-tit {
	color: $dz-main-color;
	font-size: 26rpx;
	word-break: break-all;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

/*海报*/

.hideCanvas {
	position: fixed;
	top: -99999upx;
	left: -99999upx;
	z-index: -99999;
}
</style>

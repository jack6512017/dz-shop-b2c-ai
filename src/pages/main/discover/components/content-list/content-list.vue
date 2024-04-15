<template>
	<view v-for="(item, index) in shareContentList" :key="index" class="card" @tap="tapDetail(item)">
		<view class="head">
			<view class="image"><dz-image :src="logo" :width="80" :height="80" :borderRadius="40"></dz-image></view>
			<view class="right">
				<view class="name">{{ item.title }}</view>
				<view class="time">{{ api.timeFormat(item.created_at) }}</view>
			</view>
		</view>
		<view class="tip" v-if="item.description">{{ item.description }}</view>
		<!-- 图片 -->
		<view class="image" v-if="item.content_type == 1">
			<view v-for="(items, indexs) in item.cover" :key="indexs" style="width: 220rpx; height: 220rpx" @tap.stop="previewImgs(items, item.cover)">
				<view class="img"><dz-image :src="items" :width="212" :height="212" :borderRadius="15"></dz-image></view>
			</view>
		</view>
		<!-- 文章 -->
		<view class="article" v-if="item.content_type == 0">
			<view class="image"
				><dz-image :src="item.cover[0]" style="width: 100%" width="100%" :height="320" :borderRadius="15" mode="widthFix"></dz-image
			></view>
			<text>{{ language.discover.article }}</text>
		</view>
		<!-- 视频 -->
		<view class="article" v-if="item.content_type == 2">
			<!-- #ifdef MP || APP-PLUS-->
			<view v-show="activeVideo != item.id" class="vedio-cover" @tap="videoPlayClick(item.id)">
				<dz-image v-if="item.video_cover" :src="item.video_cover" :height="400" mode="aspectFit"></dz-image>
				<view class="video-icon"><dz-icon name="videofill" color="rgba(255, 255, 255,0.9)" size="120"></dz-icon></view>
			</view>
			<!-- #ifdef MP  -->
			<video v-if="activeVideo == item.id" :src="item.cover" :id="item.id" autoplay style="width: 100%; height: 200px"></video>
			<!-- #endif -->

			<!-- #ifdef APP-PLUS  -->
			<view v-if="activeVideo == item.id" v-html="getAppVideo(item)" style="height: 200px; width: 100%"></view>
			<!-- #endif -->
			<!-- #endif -->

			<!-- #ifdef H5 -->
			<!--TODO APP端解决了层级问题，但是没有解决页面内只播放一个视频的问题，以及页面隐藏后停止所有视频的问题-->
			<dz-app-vedio
				ref="videoRef"
				:vedioIndex="index"
				:vedioId="item.id"
				:vedioCover="item.video_cover"
				:vedioUrl="item.cover"
				@videoPlaying="videoPlaying"
			></dz-app-vedio>
			<!-- #endif -->
		</view>
		<view class="footer">
			<view class="footer-flet">
				<view class="flex dz-m-r-20" @tap.stop="shareTap(item)" v-if="item.content_type == 0">
					<text class="dzicon-iconfont dzicon-forward"></text>
					<text>{{ language.discover.share }}</text>
				</view>
				<view class="flex" v-if="item.content_type == 1 || item.content_type == 2" @tap.stop="tapDownload(item)">
					<text class="dzicon-iconfont dzicon-down"></text>
					<text>{{ language.discover.download }}</text>
				</view>
			</view>
			<view class="footer-right">
				<view v-if="item.content_type == 1 || item.content_type == 2" class="flex dz-m-r-20" @tap.stop="copy(item.title + ' ' + item.description)">
					<text class="dzicon-iconfont dzicon-copy-line"></text>
					<text>文案</text>
				</view>
				<view class="flex dz-m-r-20" @tap.stop="tapCollection(index)">
					<text
						class="dzicon-iconfont"
						:class="[item.isCollection ? 'dzicon-likefill' : 'dzicon-like']"
						:style="{
							color: item.isCollection ? theme.dzBaseColor : '',
						}"
					></text>
					<text>{{ language.discover.collect }}</text>
				</view>

				<view class="flex" @tap.stop="tapLike(index)">
					<text
						class="dzicon-iconfont"
						:class="[item.isLike ? 'dzicon-appreciatefill' : 'dzicon-appreciate']"
						:style="{
							color: item.isLike ? theme.dzBaseColor : '',
						}"
					></text>
					<text>{{ item.like_count || 0 }}</text>
				</view>
			</view>
		</view>
		<dz-modal
			v-model:show="downloadShow"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="false"
			:async-close="true"
			:content="`${language.discover.downloading}（${downloadText}）`"
			@confirm="downloadConfirm"
			:confirm-text="language.discover.cancelDownload"
		>
			<view class="dz-p-20 dz-m-b-30 dz-m-t-20"><dz-line-progress :percent="vedioDownloadPercent"></dz-line-progress></view>
		</dz-modal>
		<dz-modal
			v-model:show="downloadVideoErrorShow"
			:mask-close-able="true"
			:show-cancel-button="true"
			:title="'提示'"
			:content="'微信小程序有下载大小限制，您可以点击复制下载链接，使用浏览器下载视频'"
			:confirm-text="'复制链接'"
			@confirm="copyVideoUrl"
		></dz-modal>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed } from 'vue';
import { useUserStore } from '@/state/modules/user';

const props = defineProps({
	list: {
		type: Array,
		deflult: () => [],
	},
});

const emit = defineEmits(['collect']);

defineExpose({
	videoPauseAll,
});

const userStore = useUserStore();
const shareContentList = ref<array>(props.list);
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});
const theme = computed(() => {
	return userStore.getTheme;
});
const logo = shopSetting.value.store_logo || uni.$api.assetsConfig.logo;
const language = uni.$api.language;
const downloadShow = ref<boolean>(false);
const downloadText = ref<string>();
const imgDownloadTotal = ref<number>(0);
const imgDownloadNum = ref<number>(0);
const vedioDownloadPercent = ref<number>(0);
const downloadVideoErrorShow = ref<boolean>(false);
const activeVideo = ref<string>();
const data = reactive<object>({
	downloadItem: {},
	downloadTask: null,
});

watch(
	() => props.list,
	(newValue) => {
		shareContentList.value = newValue;
	}
);

// 预览图片
function previewImgs(img: string, imgList: array) {
	uni.previewImage({
		current: img,
		urls: imgList,
	});
}

function getAppVideo(item: object) {
	return `<video style="width: 100%; height:200px"  controls="controls"  preload="metadata" autoplay="autoplay"> <source  src="${item.cover}"
    } type="video/mp4" />   Your browser does not support video</video>`;
}

// 分享
function shareTap(item: object) {
	tapDetail(item);
}

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

//收藏点击
function tapCollection(index) {
	if (!userStore.hasLogin) {
		login();
	} else {
		//节流防抖
		shareContentList.value[index].isCollection ? handleCollectDel(index) : handleCollectCreate(index);
	}
}

// 收藏
function handleCollectCreate(index) {
	uni.$api.http
		.post(uni.$api.apiShare.collectionCreate, {
			content_id: shareContentList.value[index].id,
		})
		.then(() => {
			uni.$api.toast('已加入收藏列表');
			shareContentList.value[index].isCollection = 1;
		});
}

// 取消收藏
function handleCollectDel(index) {
	uni.$api.http
		.delete(
			uni.$api.apiShare.collectionDelete,
			{},
			{
				params: {
					id: shareContentList.value[index].id,
				},
			}
		)
		.then(() => {
			shareContentList.value[index].isCollection = null;
			emit('collect', index);
			uni.$api.toast('已取消收藏');
		});
}

// 点赞
function tapLike(index) {
	if (!userStore.hasLogin) {
		login();
	} else {
		shareContentList.value[index].isLike ? handleLikeDel(index) : handleLikeCreate(index);
	}
}

// 点赞
function handleLikeCreate(index) {
	uni.$api.http
		.post(uni.$api.apiShare.likeCreate, {
			content_id: shareContentList.value[index].id,
		})
		.then(() => {
			shareContentList.value[index].isLike = 1;
			shareContentList.value[index].like_count = parseInt(shareContentList.value[index].like_count) + 1;
			uni.$api.toast('感谢客官的欣赏');
		});
}
// 取消点赞
function handleLikeDel(index) {
	uni.$api.http
		.delete(
			uni.$api.apiShare.likeDelete,
			{},
			{
				params: {
					id: shareContentList.value[index].id,
				},
			}
		)
		.then((res) => {
			shareContentList.value[index].isLike = '';
			shareContentList.value[index].like_count = parseInt(shareContentList.value[index].like_count) - 1;
			uni.$api.toast('在下会继续努力,让客官喜欢');
		});
}

//视频点击播放事件 MP | APP
function videoPlayClick(id: string) {
	activeVideo.value = id;
	uni.createVideoContext(String(id)).play();
	let list = shareContentList.value;
	for (let i = 0; i < list.length; i++) {
		if (parseInt(list[i].id) !== parseInt(id) && parseInt(list[i].content_type) === 2) {
			uni.createVideoContext(String(list[i].id)).pause();
		}
	}
}

//视频点击播放事件  H5
function videoPlaying(e: object) {
	let videos = document.getElementsByTagName('video');
	for (let i = 0; i < videos.length; i++) {
		if (videos[i].id != 'video-' + e.index) {
			videos[i].pause();
		}
	}
}

// 下载
function tapDownload(item) {
	if (!userStore.hasLogin) {
		uni.$api.router.push({
			route: uni.$api.routesConfig.login,
		});
		return;
	}
	data.downloadItem = item;
	download();
}

// 下载确认
function download() {
	vedioDownloadPercent.value = 0;
	if (data.downloadItem.content_type == 1) {
		// #ifdef APP-PLUS || MP
		downloadShow.value = true;
		imgDownloadTotal.value = data.downloadItem.cover.length;
		imgDownloadNum.value = 1;
		downloadText.value = imgDownloadNum.value + '/' + imgDownloadTotal.value;
		imgDownLoadProcess(imgDownloadNum.value);
		// #endif
		// #ifdef H5
		uni.$api.toast('请点击图片并长按保存到相册');
		// #endif
	} else if (data.downloadItem.content_type == 2) {
		downloadShow.value = true;
		downloadText.value = vedioDownloadPercent.value + '%';
		vedioDownloadProcess();
	}
}

// 下载图片
function imgDownLoadProcess(index) {
	data.downloadTask = uni.downloadFile({
		url: data.downloadItem.cover[index - 1],
		success: (res) => {
			if (res.statusCode === 200) {
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => {
						if (index == data.downloadItem.cover.length) {
							uni.$api.toast('已下载到您的手机相册');
							downloadShow.value = false;
						} else {
							imgDownloadNum.value = index + 1;
							downloadText.value = imgDownloadNum.value + '/' + imgDownloadTotal.value;
							imgDownLoadProcess(imgDownloadNum.value);
						}
						vedioDownloadPercent.value = ((imgDownloadNum.value / imgDownloadTotal.value) * 100).toFixed(2);
					},
					fail: () => {
						uni.$api.toast('下载失败，请重试');
						downloadShow.value = false;
					},
				});
			}
		},
		fail: () => {
			uni.$api.toast('下载失败，请重试');
			downloadShow.value = false;
		},
	});
}

// 下载视频
function vedioDownloadProcess() {
	let filePath = data.downloadItem.cover;
	let fileNames = filePath.split('/');
	let fileName = fileNames[fileNames.length - 1];

	data.downloadTask = uni.downloadFile({
		url: filePath,
		success: (res) => {
			if (res.statusCode === 200) {
				// #ifdef H5
				let linkElement = document.createElement('a');
				linkElement.setAttribute('href', res.tempFilePath);
				linkElement.setAttribute('downLoad', fileName);
				linkElement.click();
				linkElement.remove();
				setTimeout(() => {
					downloadShow.value = false;
				}, 500);
				// #endif
				// #ifdef APP-PLUS || MP
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => {
						uni.$api.toast('已下载到您的手机相册');
						downloadShow.value = false;
					},
					fail: () => {
						downloadShow.value = false;
						// #ifndef MP-WEIXIN
						uni.$api.toast('保存失败，请重试');
						// #endif
						// #ifdef MP-WEIXIN
						downloadVideoErrorShow.value = true;
						// #endif
					},
				});
				// #endif
			}
		},
		fail: () => {
			uni.$api.toast('下载失败，请重试');
			downloadShow.value = false;
		},
	});
	data.downloadTask.onProgressUpdate((res) => {
		vedioDownloadPercent.value = res.progress;
		downloadText.value = res.progress + '%';
	});
}

function copyVideoUrl() {
	uni.$api.copy(data.downloadItem.cover[0]);
	uni.$api.toast('视频链接已复制到剪贴板');
	downloadVideoErrorShow.value = false;
}

function copy(val: string) {
	uni.$api.copy(val);
	uni.$api.toast('文案内容已复制到剪贴板');
}

// 下载取消
function downloadConfirm() {
	abortDownload();
}

function abortDownload() {
	try {
		data.downloadTask.abort();
	} catch (e) {}
	downloadShow.value = false;
}

function login() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
	});
	return;
}

function videoPauseAll() {
	let list = shareContentList.value;
	activeVideo.value = '';
	// #ifdef MP
	for (let i = 0; i < list.length; i++) {
		if (parseInt(list[i].content_type) == 2) {
			uni.createVideoContext(String(list[i].id)).pause();
		}
	}
	// #endif
	// #ifdef H5
	let videos = document.getElementsByTagName('video');
	for (let i = 0; i < videos.length; i++) {
		videos[i].pause();
	}
	// #endif
}
</script>

<style lang="scss" scoped>
.card {
	background-color: #ffffff;
	margin-bottom: 20rpx;
	border-radius: 20rpx;
	padding: 20rpx;
	.head {
		display: flex;
		align-items: center;
		padding-bottom: 20rpx;
		.image {
			flex-shrink: 0;
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
		}
		.right {
			margin-left: 20rpx;
			.name {
				font-size: 30rpx;
				font-weight: bold;
				color: $dz-main-color;
			}
			.time {
				font-size: 24rpx;
				color: $dz-tips-color;
			}
		}
	}
	.tip {
		padding-bottom: 20rpx;
		font-size: 26rpx;
		color: $dz-main-color;
	}
	.image {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		margin-left: 2rpx;
		.img {
			width: 212rpx;
			height: 212rpx;
			display: block;
			margin: 5rpx;
		}
	}
	.article {
		position: relative;
		.image {
			width: 100%;
			height: 320rpx;
			border-radius: 15rpx;
		}
		text {
			position: absolute;
			display: flex;
			justify-content: center;
			align-items: center;
			top: 20rpx;
			right: 20rpx;
			width: 70rpx;
			height: 35rpx;
			font-size: 24rpx;
			border-radius: 6rpx;
			color: $dz-main-color;
			background-color: #ffffff;
		}
		.vedio-cover {
			position: relative;
			height: 400rpx;
			.video-icon {
				position: absolute;
				display: flex;
				justify-content: center;
				align-items: center;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				background-color: rgba(0, 0, 0, 0.3);
			}
		}
	}
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		padding: 30rpx 0 10rpx;
		color: $dz-tips-color;
		.dzicon-iconfont {
			font-size: 36rpx;
			margin-right: 10rpx;
		}
		.flex {
			display: flex;
			align-items: center;
		}
		.footer-right,
		.footer-flet {
			display: flex;
		}
	}
}
</style>

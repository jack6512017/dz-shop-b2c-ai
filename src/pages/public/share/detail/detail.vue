<template>
	<view class="share-container">
		<dz-navbar :title="title"></dz-navbar>
		<view>
			<view class="banner" v-if="shareContent.cover">
				<view class="image"><dz-image :src="shareContent.cover[0]" width="100%" :height="320" mode="widthFix"></dz-image></view>
			</view>
			<view class="content">
				<!-- 	<view class="dz-sub-info dz-tips-color">
					<view class="dz-sub-left">{{ api.timeFrom(shareContent.created_time) }}</view>
					<view class="dz-sub-right">
						<button class="dz-transparent-btn" open-type="share" @tap.stop="shareClick">
							<dz-icon name="forward" :size="30" label="分享"></dz-icon>
						</button>
					</view>
				</view> -->
				<view class="dz-sub-info dz-tips-color">
					<text class="dz-author">作者：{{ shareContent.author || shopSetting.store_name }}</text>
					<text>{{ api.timeFrom(shareContent.created_time) }}</text>
					<view class="dz-m-l-20">{{ shareContent.view_count }} 浏览</view>
				</view>
				<view class="title dz-main-color">{{ shareContent.title }}</view>
				<view class="dz-news-content dz-main-color">
					<dz-parse :content="shareContent.content" lazy-load></dz-parse>
				</view>
				<block v-if="shareContent.tags && shareContent.tags.length && isTags">
					<dz-icon name="tag" size="40" :top="6"></dz-icon>
					<block v-for="(item, index) in shareContent.tags" :key="index">
						<dz-tag
							:text="item.title"
							:bgColor="theme.dzBgColor"
							:borderColor="theme.dzBgColor"
							:color="theme.dzMainColor"
							customStyle="margin:10rpx"
						></dz-tag>
					</block>
				</block>
			</view>
		</view>
		<view class="dz-ios-p-safe-bottom"></view>
		<view class="footer">
			<view class="footer-bottom dz-flex">
				<view class="dz-flex-1 dz-flex dz-row-center dz-border-right" @tap="tapCollection">
					<dz-icon
						:name="shareContent.isCollection ? 'likefill' : 'like'"
						:size="40"
						:color="shareContent.isCollection ? theme.dzBaseColor : ''"
						:label="parseInt(shareContent.collection_count) > 0 ? shareContent.collection_count : ''"
					></dz-icon>
				</view>
				<view class="dz-flex-1 dz-flex dz-row-center dz-border-right" @tap="tapLike">
					<dz-icon
						:name="shareContent.isLike ? 'appreciatefill' : 'appreciate'"
						:size="40"
						:color="shareContent.isLike ? theme.dzBaseColor : ''"
						:label="parseInt(shareContent.like_count) > 0 ? shareContent.like_count : ''"
					></dz-icon>
				</view>

				<view class="dz-flex-1 dz-flex dz-row-center">
					<button class="dz-transparent-btn" open-type="share" @tap.stop="shareClick">
						<dz-icon name="forward" :size="40" label="分享"></dz-icon>
					</button>
				</view>
			</view>
		</view>
		<dz-app-share v-model:show="appShareShow" :isPoster="false" :config="shareData"></dz-app-share>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, toRefs } from 'vue';
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const id = ref<string>('');
const title = ref<string>();
const isTags = ref<boolean>(false);
const data = reactive<object>({
	shareContent: {},
	shareData: {},
});
const mpShare = reactive({
	title: '', // 默认为小程序名称
	path: '', // 默认为当前页面路径
	imageUrl: '', // 默认为当前页面的截图
});
const appShareShow = ref<boolean>(false);
const userStore = useUserStore();
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

watch(
	() => userStore.hasLogin,
	() => {
		updateShare();
	}
);

onLoad(async (options) => {
	await uni.$onLaunched;
	if (options.title) {
		title.value = options.title;
	}
	uni.setNavigationBarTitle({
		title: title.value,
	});
	if (options.id) {
		id.value = options.id;
		getShareContentView();
	}
	//保存推荐人
	if (options.promo_code) {
		userStore.setPromoCode(options.promo_code);
	}
	//保存经销商
	if (options.dealer_code) {
		userStore.setDealerCode(options.dealer_code);
	}
	//保存实体店
	if (options.store_id) {
		userStore.setStoreId(options.store_id);
	}
	//登录处理
	if (!userStore.hasLogin && parseInt(shopSetting.value.wechat_share_page_auto_login) == 1) {
		//公众号自动登录
		// #ifdef H5
		if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
			if (options.code) {
				uni.$api.wxAutoLoginHelper.wechatCodeLogin(options.code);
			} else {
				uni.$api.wxAutoLoginHelper.login();
			}
		}
		// #endif
	}
});

onShareAppMessage(() => {
	return mpShare;
});

// #ifdef MP-WEIXIN
onShareTimeline(() => {
	return mpShare;
});
// #endif

async function getShareContentView() {
	await uni.$api.http
		.get(uni.$api.apiShare.contentView, {
			params: {
				id: id.value,
			},
		})
		.then((res) => {
			data.shareContent = res.data;
			title.value = res.data.title;
			uni.setNavigationBarTitle({
				title: res.data.title,
			});
			// 分享
			updateShare();
			setTimeout(() => {
				isTags.value = true;
			}, 2000);
		});
}

//收藏点击
function tapCollection() {
	if (!userStore.hasLogin) {
		login();
	} else {
		//节流防抖
		data.shareContent.isCollection ? handleCollectDel() : handleCollectCreate();
	}
}

// 收藏
function handleCollectCreate() {
	uni.$api.http
		.post(uni.$api.apiShare.collectionCreate, {
			content_id: id.value,
		})
		.then(() => {
			uni.$api.toast('已加入收藏列表');
			data.shareContent.collection_count = parseInt(data.shareContent.collection_count) + 1;
			data.shareContent.isCollection = 1;
			uni.$emit('collectionLikeChange');
		});
}

// 取消收藏
function handleCollectDel() {
	uni.$api.http
		.delete(
			uni.$api.apiShare.collectionDelete,
			{},
			{
				params: {
					id: id.value,
				},
			}
		)
		.then(() => {
			data.shareContent.isCollection = null;
			data.shareContent.collection_count = parseInt(data.shareContent.collection_count) - 1;
			uni.$emit('collectionLikeChange');
			uni.$api.toast('已取消收藏');
		});
}

// 点赞
function tapLike() {
	if (!userStore.hasLogin) {
		login();
	} else {
		data.shareContent.isLike ? handleLikeDel() : handleLikeCreate();
	}
}

// 点赞
function handleLikeCreate() {
	uni.$api.http
		.post(uni.$api.apiShare.likeCreate, {
			content_id: id.value,
		})
		.then(() => {
			data.shareContent.isLike = 1;
			data.shareContent.like_count = parseInt(data.shareContent.like_count) + 1;
			uni.$emit('collectionLikeChange');
			uni.$api.toast('感谢客官的欣赏');
		});
}
// 取消点赞
function handleLikeDel() {
	uni.$api.http
		.delete(
			uni.$api.apiShare.likeDelete,
			{},
			{
				params: {
					id: id.value,
				},
			}
		)
		.then(() => {
			data.shareContent.isLike = '';
			data.shareContent.like_count = parseInt(data.shareContent.like_count) - 1;
			uni.$emit('collectionLikeChange');
			uni.$api.toast('在下会继续努力,让客官喜欢');
		});
}

function login() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
	});
	return;
}

//更新分享
function updateShare() {
	//初始化公众号分享
	// #ifdef H5
	if (uni.$api.h5IsWechat()) {
		uni.$api.wxHelper.wxShare(window.location.href, data.shareContent.title, data.shareContent.description, sharePath(), data.shareContent.cover[0]);
	}
	// #endif
	//初始化小程序分享
	mpShare.title = data.shareContent.title;
	mpShare.path = sharePath();
	mpShare.imageUrl = data.shareContent.cover[0];
	//初始化APP分享
	data.shareData = {
		shareUrl: sharePath(),
		shareTitle: data.shareContent.title,
		shareContent: data.shareContent.description,
		shareImg: data.shareContent.cover[0],
	};
}

//分享路径
function sharePath() {
	let domain = uni.$api.appConfig.h5Domain;
	let url = '';
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	// #ifdef MP
	url = `${uni.$api.routesConfig.shareDetail.path}?id=${data.shareContent.id}`;
	// #endif
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.shareDetail.path}?id=${data.shareContent.id}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + userInfo.value.promo_code;
		if (userInfo.value.store_id) {
			url = url + '&store_id=' + userInfo.value.store_id;
		}
	}
	return url;
}

function shareClick() {
	let url = data.shareData.shareUrl;
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.toast(uni.$api.language.application.wxshareTip);
	} else {
		if (uni.$api.copy(url)) {
			uni.$api.toast(uni.$api.language.application.shareUrlCopySuccess);
		}
	}
	// #endif
	// #ifdef APP-PLUS
	appShareShow.value = true;
	// #endif
}

const { shareContent, shareData } = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.share-container {
	height: 100%;
	background-color: #fff;
}

.share-container {
	.banner {
		width: 100%;
		.image {
			width: 100%;
			height: 320rpx;
			overflow: hidden;
		}
	}
	.title {
		font-size: 36rpx;
		font-weight: bold;
		padding: 30rpx 0 20rpx;
	}
	.content {
		padding: 40rpx 30rpx 110rpx 30rpx;
		box-sizing: border-box;
	}

	.dz-sub-info {
		display: flex;
		align-items: center;
		font-size: 28rpx;
	}

	.dz-author {
		padding-right: 20rpx;
	}

	button {
		width: 120rpx !important;
	}

	.dz-transparent-btn {
		display: block;
		background: transparent;
		margin: 0;
		padding: 0;
		border-radius: 0;
		border: 0;
	}

	.dz-transparent-btn::after {
		border: 0;
	}

	.footer {
		position: fixed;
		bottom: 0;
		width: 100%;
		background-color: #ffffff;

		.footer-bottom {
			width: 100%;
			height: 100rpx;
			display: flex;
			align-items: center;
			margin-bottom: env(safe-area-inset-bottom);
		}
	}
}
</style>

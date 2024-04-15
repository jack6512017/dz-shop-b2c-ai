<template>
	<view class="article-container">
		<dz-navbar :title="title"></dz-navbar>
		<view class="content">
			<view>
				<view class="dz-news-title">{{ article.title }}</view>
				<view class="dz-sub-info dz-tips-color">
					<text class="dz-author">作者：{{ article.author || shopSetting.store_name }}</text>
					<text>{{ api.timeFrom(article.created_time) }}</text>
					<view class="dz-m-l-20">{{ article.view_count }} 浏览</view>
				</view>
				<view class="dz-news-content"><dz-parse :content="article.content" :lazy-load="true"></dz-parse></view>
				<block v-if="article.tags && article.tags.length && isTags">
					<dz-icon name="tag" size="40" :top="6"></dz-icon>
					<block v-for="(item, index) in article.tags" :key="index">
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
				<view class="dz-flex-1 dz-flex dz-row-center dz-border-right" @tap="tapNice">
					<dz-icon
						:name="article.nice ? 'appreciatefill' : 'appreciate'"
						:color="article.nice ? theme.dzBaseColor : ''"
						:size="40"
						:label="parseInt(article.nice_num) > 0 ? article.nice_num : ''"
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
const title = ref<string>('文章详情');
const isLoading = ref<boolean>(false);
const isTags = ref<boolean>(false);
const data = reactive<object>({
	article: {},
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

const promoCode = computed(() => {
	return userStore.getPromoCode;
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
		loadArticle(options.id);
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

async function loadArticle(id: string) {
	await uni.$api.http
		.get(uni.$api.apiArticle.articleView, {
			params: {
				id,
			},
		})
		.then((res) => {
			data.article = res.data;
			if (!uni.$api.isObject(data.article.nice)) {
				data.article.nice = null;
			}
			uni.setNavigationBarTitle({
				title: data.article.title,
			});
			isLoading.value = false;
			//分享
			updateShare();
			setTimeout(() => {
				isTags.value = true;
			}, 2000);
		});
}

// 点赞
function tapNice() {
	if (!userStore.hasLogin) {
		login();
	} else {
		data.article.nice ? handleNiceDel() : handleNiceCreate();
	}
}

// 点赞
function handleNiceCreate() {
	uni.$api.http
		.post(uni.$api.apiMember.niceCreate, {
			topic_id: data.article.id,
			topic_type: 'article',
		})
		.then(() => {
			data.article.nice = 1;
			data.article.nice_num = parseInt(data.article.nice_num) + 1;
			uni.$api.toast('每一个赞都让我们更有品味');
			uni.$emit('niceChange');
		});
}
// 取消点赞
function handleNiceDel() {
	uni.$api.http
		.post(
			uni.$api.apiMember.niceDelete,
			{},
			{
				params: {
					id: data.article.nice.id,
				},
			}
		)
		.then(() => {
			data.article.nice = '';
			data.article.nice_num = parseInt(data.article.nice_num) - 1;
			uni.$emit('niceChange');
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
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.wxHelper.wxShare(
			window.location.href,
			data.article.title,
			data.article.description,
			sharePath(),
			data.article.cover || shopSetting.value.store_logo
		);
	}
	// #endif
	//初始化小程序分享
	mpShare.title = data.article.title;
	mpShare.path = sharePath();
	mpShare.imageUrl = data.article.cover || shopSetting.value.store_logo;
	//初始化APP分享
	data.shareData = {
		shareUrl: sharePath(),
		shareTitle: data.article.title,
		shareContent: data.article.description,
		shareImg: data.article.cover || shopSetting.value.store_logo,
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
	url = `${uni.$api.routesConfig.articleDetail.path}?id=${data.article.id}`;
	// #endif
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.articleDetail.path}?id=${data.article.id}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + promoCode.value;
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

const { article, shareData } = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.article-container {
	height: 100%;
	background-color: #fff;
}

.article-container {
	.content {
		padding: 40rpx 30rpx 110rpx 30rpx;
		box-sizing: border-box;
	}

	.dz-news-title {
		font-size: 48rpx;
		font-weight: 500;
		text-align: justify;
	}

	.dz-sub-info {
		padding-top: 30rpx;
		display: flex;
		align-items: center;
		font-size: 28rpx;
	}

	.dz-author {
		padding-right: 20rpx;
	}

	.dz-news-content {
		padding: 30rpx 0;
	}

	.dz-safearea-bottom {
		width: 100%;
		height: env(safe-area-inset-bottom);
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

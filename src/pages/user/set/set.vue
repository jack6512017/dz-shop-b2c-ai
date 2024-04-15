<template>
	<view>
		<dz-navbar :title="language.profile.setting"></dz-navbar>
		<dz-cell-group :border="false">
			<dz-cell-item @click="handelAvatarCropper" :borderBottom="false">
				<template #icon>
					<view class="head-portrait">
						<image :src="userInfo.head_portrait || missingFace" mode=""></image>
						<view class="user-name">{{ userInfo.nickname || userInfo.realname || userInfo.mobile }}</view>
					</view>
				</template>
			</dz-cell-item>
			<dz-cell-item :borderBottom="false" center :title="language.user.personalData" @click="handleTabPage('userInfo')"></dz-cell-item>
			<dz-cell-item
				v-if="!userInfo.mobile || userInfo.mobile == ''"
				:borderBottom="false"
				center
				:title="language.user.bindMobile"
				@click="handleTabPage('bindMobile')"
			></dz-cell-item>
			<dz-cell-item
				v-if="userInfo.mobile && userInfo.mobile != ''"
				:borderBottom="false"
				center
				:title="language.user.modifyMobile"
				@click="handleTabPage('modifyMobileStep1')"
			></dz-cell-item>
			<dz-cell-item :borderBottom="false" center :title="language.user.changePassword" @click="handleTabPage('modifyPassword')"></dz-cell-item>
			<dz-cell-item center title="帮助" :border-bottom="false" @click="handleTabPage('helper')"></dz-cell-item>
			<dz-cell-item center :title="language.user.protocolRule" :border-bottom="false" @click="handleTabPage('protocol')"></dz-cell-item>
		</dz-cell-group>
		<dz-cell-group class="dz-m-t-20" :border="false">
			<dz-cell-item :borderBottom="false" center :title="language.invoice.invoiceManagement" @click="handleTabPage('invoice')"></dz-cell-item>
			<dz-cell-item :borderBottom="false" center :title="language.invoice.invoiceHistory" @click="handleTabPage('orderInvoice')"></dz-cell-item>
			<dz-cell-item
				v-if="parseInt(shopSetting.style_loading_is_open) === 1"
				:borderBottom="false"
				center
				title="Loading加载动画"
				@click="handleTabPage('loading')"
			></dz-cell-item>
			<dz-cell-item
				v-if="parseInt(shopSetting.style_user_is_open) === 1"
				:borderBottom="false"
				center
				:title="language.user.theme"
				@click="themeTab()"
			></dz-cell-item>
			<dz-cell-item :borderBottom="false" center :title="language.user.wipeCache" :value="`${cacheSize}KB`" @tap="removeCache"></dz-cell-item>
			<dz-cell-item :borderBottom="false" center :title="language.user.currentVersion" :value="version" @tap="tapUpdate"></dz-cell-item>
			<dz-cell-item :borderBottom="false" center :title="language.user.feedback" @click="handleTabPage('feedback')"></dz-cell-item>
			<dz-cell-item v-if="userInfo.mobile" :borderBottom="false" center title="注销账号" @click="handelLogoff()"></dz-cell-item>
			<dz-cell-item center :title="language.user.notification" :border-bottom="false" :arrow="false">
				<template #right-icon>
					<dz-switch
						v-model="notifyPush"
						:activeValue="1"
						:inactiveValue="0"
						:active-color="theme.dzBaseColor"
						@change="onChangeNotifyPush(notifyPush)"
					></dz-switch>
				</template>
			</dz-cell-item>
		</dz-cell-group>
		<view class="dz-m-t-80 dz-p-b-50 dz-flex dz-row-center">
			<view class="btn" style="width: 90%">
				<dz-button
					:border="false"
					:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					hover-class="none"
					shape="circle"
					@click="handelLogout"
				>
					{{ language.user.logOut }}
				</dz-button>
			</view>
		</view>
		<dz-avatar-cropper
			mode="fixed"
			:width="300"
			:height="300"
			:maxWidth="1024"
			:maxHeight="1024"
			:url="avatarUrl"
			@cancel="oncancel"
			@ok="onok"
		></dz-avatar-cropper>
		<dz-popup v-model:show="userInfoShow" mode="bottom" :closeable="true" border-radius="40" closeIcon="roundclose" closeIconSize="40">
			<view class="dz-p-l-30 dz-p-t-30 dz-font-32 dz-font-weight">基础信息</view>
			<view class="dz-p-l-30 dz-m-t-6 dz-color-9 dz-font-24">99%+用户选择使用微信头像和昵称便于发货</view>
			<view class="user-info-container">
				<view class="avatar-wrapper">
					<button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
						<dz-image :src="headPortrait || missingFace" :width="120" :height="120" :borderRadius="60"></dz-image>
					</button>
				</view>
				<dz-input
					v-model="nickname"
					:height="90"
					placeholder="请输入昵称"
					clearable
					border="none"
					type="nickname"
					:customStyle="{ marginTop: '60rpx', padding: '22rpx 26rpx', borderRadius: '45rpx', background: '#F3F4F6' }"
				>
				</dz-input>
				<view class="dz-m-t-30 dz-p-b-40">
					<dz-button
						:custom-style="{
							width: '100%',
							height: '92rpx',
							background: !nickname ? theme.dzBaseDisabled : theme.dzBaseColor,
							color: theme.dzBaseFontColor,
						}"
						hover-class="none"
						shape="circle"
						:border="false"
						:disabled="!nickname"
						:loading="isLoading"
						@click="submit"
						>保存</dz-button
					>
				</view>
			</view>
		</dz-popup>
		<dz-popup v-model:show="themeShow" mode="bottom" :closeable="false" length="60%" border-radius="40">
			<view class="dz-m-l-30 dz-m-t-30 dz-font-32 dz-font-weight">色系选择</view>
			<dz-row gutter="16" class="dz-m-10">
				<dz-grid :border="false" :col="5">
					<dz-grid-item
						v-for="(item, index) in themeConfig"
						:key="index"
						@click="active = index"
						customStyle="padding-top: 10px; padding-bottom: 10px"
					>
						<view class="dz-flex dz-flex-column">
							<view
								class="layout"
								:style="{ borderColor: active == index ? item.colors.dzBaseColor : '#fff' }"
								:class="[active == index ? 'animation-scale-up animation-duration-03' : '']"
							>
								<view class="layout-item" :style="{ background: item.colors.dzBaseColor, color: item.colors.dzBaseFontColor }"></view>
							</view>
							<text class="dz-font-sm dz-color-6 dz-m-t-10">{{ item.title }}</text>
						</view>
					</dz-grid-item>
				</dz-grid>
			</dz-row>
			<view class="dz-flex dz-row-between dz-p-t-30 dz-m-r-40 dz-m-l-40 btn">
				<dz-button
					hoverClass="none"
					:border="false"
					:custom-style="{ background: theme.dzBgColor, borderColor: theme.dzBgColor, width: '320rpx', height: '90rpx' }"
					:plain="true"
					shape="circle"
					@click="themeShow = false"
				>
					取消
				</dz-button>
				<dz-button
					:border="false"
					hoverClass="none"
					:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '320rpx', height: '90rpx' }"
					shape="circle"
					@click="themeApply()"
				>
					应用
				</dz-button>
			</view>
		</dz-popup>
		<dz-modal
			v-model:show="cacheSizeShow"
			:mask-close-able="false"
			content="确定要清除缓存吗？"
			:show-cancel-button="!cacheLoading"
			:confirm-color="theme.dzBaseColor"
			:async-close="true"
			@cancel="cacheCancel"
			@confirm="cacheConfirm"
		></dz-modal>
		<dz-modal
			v-model:show="logoffShow"
			title="确定要注销账号吗？"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="!logoffLoading"
			@cancel="logoffCancel"
			@confirm="logoffConfirm"
		>
			<view style="padding: 20rpx">
				<dz-field :modelValue="`+ ${userInfo.mobile_area}  ${userInfo.mobile}`" label="手机号" disabled></dz-field>
				<dz-field v-model="code" label="验证码" placeholder="请输入验证码" :border-bottom="false">
					<template #right>
						<dz-button
							shape="circle"
							type="info"
							size="mini"
							hover-class="none"
							:border="false"
							:custom-style="{ background: isLoaidng ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
							:disabled="waitingCaptcha"
							@click="getCode()"
						>
							{{ waitingCaptcha ? api.formatString(language.bindMobile.getCaptchaLater, waitingSecond) : language.bindMobile.getCaptcha }}
						</dz-button>
					</template>
				</dz-field>
			</view>
		</dz-modal>
		<!-- 退出提醒 -->
		<dz-modal
			v-model:show="logoutShow"
			:mask-close-able="false"
			:showTitle="false"
			:content="logoutContent"
			:contentStyle="{ color: theme.dzMainColor, fontSize: '32rpx', fontWeight: 'bold' }"
			:show-cancel-button="!logoutLoading"
			:confirm-color="theme.dzBaseColor"
			:async-close="true"
			@cancel="logoutCancel"
			@confirm="logoutConfirm"
		></dz-modal>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import themeConfig from '@/core/config/themeConfig';

const userStore = useUserStore();
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const avatarUrl = ref<string>();
const themeShow = ref<boolean>(false);
const active = ref<string>();
const cacheSize = ref<number>(uni.getStorageInfoSync().currentSize);
const cacheSizeShow = ref<boolean>(false);
const cacheLoading = ref<boolean>(false);
const version = ref<string>('');
const notifyPush = ref<number>(0);
const logoffShow = ref<boolean>(false);
const logoffLoading = ref<boolean>(false);
const code = ref<string>('');
const waitingCaptcha = ref<Boolean>(false);
const waitingSecond = ref<Number>(60);
const timeInterval = ref();
const isLoaidng = ref<Boolean>(false);
const logoutShow = ref<boolean>(false);
const logoutContent = uni.$api.language.user.confirmLogOut;
const logoutLoading = ref<boolean>(false);

const userInfoShow = ref<boolean>(false);
const headPortrait = ref<string>('');
const nickname = ref<string>('');
const isLoading = ref<boolean>(false);

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.profile.setting,
	});
	// #ifdef APP-PLUS
	let wgtInfo = await uni.$api.getWgtInfoAsync();
	version.value = wgtInfo.version;
	// #endif
	// #ifndef APP-PLUS
	version.value = uni.$api.appConfig.version;
	// #endif
	getNotifySubscriptionConfigIndex();
});

onShow(() => {
	computeLastCaptcha();
});

function handleTabPage(url: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
	});
}

function oncancel() {
	avatarUrl.value = '';
}

function onok(e: any) {
	avatarUrl.value = '';
	// #ifdef H5
	headUpload64File(e.base64);
	// #endif
	// #ifndef H5
	headUploadFile(e.path);
	// #endif
}

function handelAvatarCropper() {
	// #ifdef MP
	nickname.value = userInfo.value.nickname;
	headPortrait.value = userInfo.value.head_portrait;
	userInfoShow.value = true;
	return;
	// #endif
	uni.chooseImage({
		count: 1,
		sizeType: ['original', 'compressed'],
		sourceType: ['album'],
		success: (res) => {
			avatarUrl.value = res.tempFilePaths[0];
		},
	});
}

async function headUploadFile(data: any) {
	let filePath = data;
	uni.$api.http
		.upload(uni.$api.apiCommon.fileImages, {
			filePath,
			name: 'file',
		})
		.then((res) => {
			userStore.setUserHeadPortrait(res.data.url);
			updateUserInfo({ head_portrait: res.data.url });
		});
}

async function headUpload64File(e: any) {
	let image = '';
	image = e.replace(/^data:image\/\w+;base64,/, '');
	uni.$api.http
		.post(uni.$api.apiCommon.fileBase64, {
			image,
		})
		.then((res) => {
			userStore.setUserHeadPortrait(res.data.url);
			updateUserInfo({ head_portrait: res.data.url });
		});
}

async function updateUserInfo(data) {
	await uni.$api.http.put(
		uni.$api.apiMember.updateInfo,
		{
			...data,
		},
		{
			params: {
				id: userInfo.value.id,
			},
		}
	);
}

function onChooseAvatar(e) {
	const image = wx.getFileSystemManager().readFileSync(e.detail.avatarUrl, 'base64');
	uni.$api.http
		.post(uni.$api.apiCommon.fileBase64, {
			image,
		})
		.then((res) => {
			headPortrait.value = res.data.url;
		});
}

async function submit() {
	if (isLoading.value) return;
	isLoading.value = true;
	uni.showLoading({
		title: '加载中...',
	});
	await uni.$api.http
		.put(
			uni.$api.apiMember.updateInfo,
			{
				head_portrait: headPortrait.value,
				nickname: nickname.value,
			},
			{
				params: {
					id: userInfo.value.id,
				},
			}
		)
		.then(() => {
			const user = userInfo.value;
			user.nickname = nickname.value;
			user.head_portrait = headPortrait.value;
			userStore.setUserInfo(user);
		})
		.finally(() => {
			uni.hideLoading();
			userInfoShow.value = false;
			isLoading.value = false;
		});
}

function themeTab() {
	for (let key in themeConfig) {
		if (themeConfig[key].colors.ysBaseColor == uni.$api.theme.ysBaseColor) {
			active.value = key;
		}
	}
	themeShow.value = true;
}

function themeApply() {
	uni.$api.theme = themeConfig[active.value].colors;
	userStore.setTheme(themeConfig[active.value].colors);
	userStore.setCustomerTheme(active.value);
	themeShow.value = false;
}

// 缓存
function removeCache() {
	if (cacheSize.value == 0) {
		return uni.$api.toast(language.user.noWipeCache);
	}
	cacheSizeShow.value = true;
}

function cacheCancel() {
	if (!cacheLoading.value) {
		cacheSizeShow.value = false;
	}
}

function cacheConfirm() {
	cacheLoading.value = true;

	uni.clearStorageSync();
	cacheSize.value = 0;
	setTimeout(() => {
		cacheSizeShow.value = false;
		cacheLoading.value = false;
	}, 500);
}

//检查更新
async function tapUpdate() {
	// #ifdef APP-PLUS
	if (!uni.$api.appConfig.appCheckUpdate) {
		return;
	}
	let type = plus.os.name == 'iOS' ? 2 : 1;
	try {
		const wgtInfo = await uni.$api.getWgtInfoAsync();
		const res = await uni.$api.http.get(uni.$api.apiVersions.appVersion, {
			params: {
				type: type,
				version: wgtInfo.version,
			},
		});
		if (res.data) {
			//验证跳过版本
			let jumpVersion = uni.getStorageSync('jumpUpdateVersion');
			let isUpdate = uni.$api.compareVersion(res.data.version, jumpVersion);
			if (isUpdate) {
				let updateData = {
					content: res.data.content,
					version: res.data.version,
					is_enforce: parseInt(res.data.is_enforce),
					download_url: res.data.download_url,
					progress: true,
					mask_click: false,
					buttonNum: 0,
				};
				uni.$api.appUpdate(updateData);
			}
		} else {
			uni.$api.toast('当前已是最新版本');
		}
	} catch (e) {
		console.log(e);
	}
	// #endif
	// #ifdef MP-WEIXIN
	if (uni.canIUse('getUpdateManager')) {
		const updateManager = uni.getUpdateManager();
		updateManager.onCheckForUpdate(function (res) {
			if (res.hasUpdate) {
				updateManager.onUpdateReady(function () {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success(res) {
							if (res.confirm) {
								updateManager.applyUpdate();
							}
						},
					});
				});
				updateManager.onUpdateFailed(function () {
					wx.showModal({
						title: '发现新版本',
						content: '新版本已经上线啦，请您删除当前小程序，重新搜索打开',
					});
				});
			} else {
				uni.$api.toast('当前已是最新版本');
			}
		});
	} else {
		uni.showModal({
			title: '提示',
			content: '当前微信版本过低，无法更好体验程序，请升级到最新微信版本后重试。',
			showCancel: false,
		});
	}
	// #endif
	// #ifndef APP-PLUS || MP-WEIXIN
	uni.$api.toast('当前已是最新版本');

	// #endif
}

async function getNotifySubscriptionConfigIndex() {
	await uni.$api.http.get(uni.$api.apiMember.notifySubscriptionConfigIndex).then((res) => {
		notifyPush.value = res.data.all;
	});
}

async function onChangeNotifyPush(e: number) {
	await uni.$api.http
		.post(uni.$api.apiMember.notifySubscriptionConfigUpdateConfig, {
			all: e,
		})
		.then(() => {
			uni.$api.toast(`${notifyPush.value == 1 ? '开启' : '关闭'}消息推送`);
		});
}

function computeLastCaptcha() {
	if (timeInterval.value) {
		return;
	}
	const lastCaptchaTimeStamp = userStore.getLastLogoffCaptchaTimeStamp;
	let timeNow = parseInt(new Date().getTime() / 1000);
	let timeDiff = timeNow - lastCaptchaTimeStamp;
	if (timeDiff < 60 && timeDiff >= 0) {
		waitingCaptcha.value = true;
		waitingSecond.value = 60 - timeDiff;
		timeInterval.value = setInterval(() => {
			waitingSecond.value--;
			if (waitingSecond.value <= 0) {
				waitingCaptcha.value = false;
				clearInterval(timeInterval.value);
				timeInterval.value = null;
			}
		}, 1000);
	} else {
		waitingCaptcha.value = false;
	}
}

function getCode() {
	if (isLoaidng.value) return;
	uni.showLoading({
		title: language.thirdPartyLogin.codeLoading,
	});
	isLoaidng.value = true;
	uni.$api.http
		.post(uni.$api.apiMember.smsCode, {
			mobile: userInfo.value.mobile,
			mobile_area: userInfo.value.mobile_area,
			usage: 'log-off',
		})
		.then((res) => {
			if (res.data && !res.data.queue_id && import.meta.env.NODE_ENV === 'development') {
				uni.$api.toast(res.data);
			}
			userStore.setLastCaptchaTimeStamp('lastLogoffCaptchaTimeStamp', parseInt(new Date().getTime() / 1000));
			computeLastCaptcha();
		})
		.finally(() => {
			uni.hideLoading();
			isLoaidng.value = false;
		});
}

function handelLogoff() {
	logoffShow.value = true;
}

//关闭
function logoffCancel() {
	if (!logoffLoading.value) {
		logoffShow.value = false;
	}
}

// 确认
function logoffConfirm() {
	if (!code.value) {
		logoffShow.value = true;
		uni.$api.toast('验证码不能为空');
		return;
	}
	logoffLoading.value = true;
	uni.$api.http
		.post(uni.$api.apiMember.logoff, {
			code: code.value,
		})
		.then(() => {
			userStore.logout();
			uni.$api.router.back();
			setTimeout(() => {
				uni.$api.toast('注销成功');
			}, 100);
		})
		.finally(() => {
			logoffShow.value = false;
		});
}

function handelLogout() {
	logoutShow.value = true;
}

//关闭
function logoutCancel() {
	if (!logoutLoading.value) {
		logoutShow.value = false;
	}
}

// 确认
function logoutConfirm() {
	logoutLoading.value = true;
	uni.$api.http
		.post(uni.$api.apiMember.logout)
		.then(() => {
			userStore.logout();
			uni.$api.router.back();
			setTimeout(() => {
				uni.$api.toast('退出成功');
			}, 100);
		})
		.finally(() => {
			logoutShow.value = false;
		});
}
</script>

<style lang="scss">
.head-portrait {
	display: flex;
	align-items: center;
	image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
	}
	.upload {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		overflow: hidden;
		background-color: $dz-content-color;
	}
	.user-name {
		margin-left: 20rpx;
		font-size: 32rpx;
		color: $dz-main-color;
	}
}

.user-info-container {
	margin-top: 30rpx;
	padding: 40rpx;
	.avatar-wrapper,
	.avatar-btn {
		display: flex;
		justify-content: center;
	}
	.avatar-btn {
		background: transparent;
		margin: 0;
		padding: 0;
		border-radius: 0;
		border: 0;
	}

	.avatar-btn::after {
		border: 0;
	}
}

.btn {
	margin-bottom: env(safe-area-inset-bottom);
}
.layout {
	padding: 8rpx 8rpx;
	border: 4rpx solid #fff;
	border-radius: 20rpx;
	.layout-item {
		width: 70rpx;
		height: 70rpx;
		border-radius: 35rpx;
	}
}
</style>

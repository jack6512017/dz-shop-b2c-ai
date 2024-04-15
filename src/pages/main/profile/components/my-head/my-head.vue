<template>
	<!--头部-->
	<view
		v-if="config.props"
		class="dz-my-head"
		:style="{
			height: `${parseInt(config.props.height + mpHeight) * 2}rpx`,
			background:
				config.props.isBottomRadius == 1
					? ''
					: config.props.colorType == 1
					? config.props.bgColor
					: config.props.linearColor
					? config.props.linearColor.color
					: config.props.bgColor,

			color: config.props.color,
		}"
	>
		<view
			v-if="config.props.isBottomRadius == 1 && !config.props.cover"
			class="pure_top_view"
			:style="{
				height: `${parseInt(config.props.height + mpHeight) * 2}rpx`,
				background:
					config.props.colorType == 1 ? config.props.bgColor : config.props.linearColor ? config.props.linearColor.color : config.props.bgColor,
			}"
		></view>
		<view v-if="config.props.cover" class="custom-bg-img">
			<img
				:src="config.props.cover"
				:style="{
					width: '100%',
					height: parseInt(config.props.height + mpHeight) * 2 + 'rpx',
				}"
			/>
		</view>
		<view class="dz-head-box">
			<view class="dz-user-info-box">
				<!-- 未登陆 -->
				<view v-if="!hasLogin" class="login-user-view">
					<view class="login-user-avatar-view"><dz-avatar :src="missingFace" size="large"></dz-avatar></view>
					<view class="dz-flex dz-row-center">
						<dz-button
							size="mini"
							type="info"
							shape="circle"
							throttleTime="200"
							@click="loginClick"
							hoverClass="none"
							:border="false"
							:customStyle="{
								width: `${parseInt(config.props.loginBtnWidth) * 2}rpx`,
								height: `${parseInt(config.props.loginBtnHeight) * 2}rpx`,
								fontSize: `${parseInt(config.props.loginBtnFontSize) * 2}rpx`,
								borderRadius: `${config.props.loginBtnHeight}rpx`,
								color: config.props.loginBtnColor,
								background: config.props.loginBtnBgColor,
							}"
						>
							{{ language.application.loginOrRegist }}
						</dz-button>
					</view>
				</view>
				<!-- 已登录 -->
				<view v-else>
					<view class="dz-flex dz-p-l-30 dz-p-r-30">
						<view class="dz-text-center dz-m-t-10">
							<dz-avatar
								:src="user.head_portrait || missingFace"
								:size="parseInt(config.props.avatarSize) * 2"
								:is-border="config.props.isAvatarBorder == 1 ? true : false"
								:border-size="parseInt(config.props.avatarBorderSize) * 2"
								:border-color="config.props.avatarBorderColor"
								@click="click('set')"
							></dz-avatar>
						</view>
						<view class="dz-flex-1 dz-font-weight dz-font-xl dz-relative dz-m-l-20">
							<view class="dz-line-1" :class="config.props.nicknameIsBold == 1 ? 'dz-font-weight' : ''" style="width: 400rpx">
								{{ user.nickname || user.realname || user.mobile }}
							</view>
							<view v-if="config.props.isMemberId == 1" class="dz-m-t-6 dz-font-24 dz-font-weight-light">
								ID: {{ user.id }}
								<dz-icon class="dz-m-l-6 dz-font-24" name="copy-line" @click="handleCopy(user.id)"></dz-icon>
							</view>
							<view v-if="config.props.isMemberLevel == 1" class="dz-flex dz-m-t-10">
								<view
									class="tag-level"
									:style="{
										color: config.props.levelColor,
										background: config.props.levelBgColor,
										borderColor: config.props.levelBgColor,
									}"
									@tap="click(config.props.memberLevelType == 1 ? 'memberLevelIndex' : config.props.memberLevelType)"
								>
									<view v-if="config.props.isLevelCaver == 1" class="icon"
										><dz-image :src="config.props.levelCaver || api.assetsConfig.memberLevel" width="32" height="32"></dz-image
									></view>
									<block v-if="config.props.memberLevelType == 1">{{
										user.memberLevel ? user.memberLevel.name : language.user.memberLevel
									}}</block>
									<block v-if="config.props.memberLevelType == 2">
										{{
											(user &&
												user.promoter &&
												user.promoter.promoterStore &&
												user.promoter.promoterStore.storeLevel &&
												user.promoter.promoterStore.storeLevel.name) ||
											'--'
										}}
									</block>
									<block v-if="config.props.memberLevelType == 3">
										{{
											(user &&
												user.promoter &&
												user.promoter.promoterWarehouse &&
												user.promoter.promoterWarehouse.warehouseLevel &&
												user.promoter.promoterWarehouse.warehouseLevel.name) ||
											'--'
										}}
									</block>
								</view>
							</view>
							<!-- #ifndef MP -->
							<view
								v-if="isShowSignin && config.props.isSignin == 1 && config.props.signinMode.includes('button')"
								class="signin-btn btn-absolute"
								:style="{
									width: '130rpx',
									background: config.props.sgninBgColor,
									color: config.props.sgninColor,
								}"
								@tap="click('signIn')"
							>
								<view class="dz-relative">
									<view class="singin-icon"><dz-icon name="singin-writefill" size="32" :color="config.props.sgninColor"></dz-icon></view>
								</view>
								<view class="dz-font-24 dz-font-weight dz-m-l-10">签到</view>
							</view>
							<!-- #endif -->
						</view>
						<!-- 小程序 -->
						<!-- #ifdef MP -->
						<view class="dz-text-right">
							<view class="dz-navbar-right">
								<view class="message-box right-item dz-main-color" @tap="click('notifyIndex')">
									<dz-icon name="message" size="48" :color="config.props.notifyColor"></dz-icon>
									<dz-badge
										:count="notifyUnRead"
										:color="config.props.badegColor"
										:bgColor="config.props.badegBgColor"
										:offset="[-10, -10]"
									></dz-badge>
								</view>
								<view
									v-if="hasLogin && config.props.isSignin == 1 && config.props.signinMode.includes('button')"
									class="signin-btn dz-m-t-16"
									:style="{
										width: '130rpx',
										background: config.props.sgninBgColor,
										color: config.props.sgninColor,
									}"
									@tap="click('signIn')"
								>
									<view class="dz-relative">
										<view class="singin-icon"><dz-icon name="singin-writefill" size="32" :color="config.props.sgninColor"></dz-icon></view>
									</view>
									<view class="dz-font-24 dz-font-weight dz-m-l-6">签到</view>
								</view>
							</view>
						</view>
						<!-- #endif -->
					</view>
				</view>
			</view>
		</view>
	</view>
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
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch, toRefs } from 'vue';
import { useUserStore } from '@/state/modules/user';

// 获取系统状态栏的高度
let systemInfo = uni.getSystemInfoSync();

const props = defineProps({
	config: {
		type: Object,
		default() {
			return {};
		},
	},
	userInfo: {
		type: Object,
		default() {
			return {};
		},
	},
	hasLogin: {
		type: Boolean,
		default: false,
	},
	isPromoterStore: {
		type: Boolean,
		default: false,
	},
	isPromoterWarehouse: {
		type: Boolean,
		default: false,
	},
	notifyUnRead: {
		type: [String, Number],
		default: 0,
	},
	signinToday: {
		type: Boolean,
		default: false,
	},
	signinStatus: {
		type: Boolean,
		default: false,
	},
	isShowSignin: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['click']);
const userStore = useUserStore();
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const data = reactive({
	user: props.userInfo,
});
const mpHeight = ref<number>(0);
const userInfoShow = ref<boolean>(false);
const headPortrait = ref<string>('');
const nickname = ref<string>('');
const isLoading = ref<boolean>(false);

const theme = computed(() => {
	return userStore.getTheme;
});

const updateWechatMpUserInfo = computed(() => {
	return userStore.getUpdateWechatMpUserInfo;
});

onMounted(() => {
	// #ifdef MP
	mpHeight.value = systemInfo.osName == 'ios' ? 44 : 48;
	// #endif
});

watch(
	() => props.userInfo,
	(nVal) => {
		data.user = nVal;
		// #ifdef MP
		if (updateWechatMpUserInfo.value && data.user.nickname == '微信用户' && props.hasLogin) {
			nickname.value = data.user.nickname;
			headPortrait.value = data.user.head_portrait;
			userInfoShow.value = true;
			userStore.setUpdateWechatMpUserInfo(false);
		}
		// #endif
	},
	{ deep: true }
);

function click(value) {
	if (value == 2 && !props.isPromoterStore) {
		return;
	}
	if (value == 3 && !props.isPromoterWarehouse) {
		return;
	}
	// #ifdef MP
	if (value === 'set') {
		nickname.value = data.user.nickname;
		headPortrait.value = data.user.head_portrait;
		userInfoShow.value = true;
		return;
	}
	// #endif
	emit('click', value);
}

function loginClick() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
		query: {},
	});
}

function handleCopy(val: number) {
	uni.$api.copy(val);
	uni.$api.toast('已复制到剪贴板');
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
					id: data.user.id,
				},
			}
		)
		.then(() => {
			data.user.nickname = nickname.value;
			data.user.head_portrait = headPortrait.value;
			userStore.setUserInfo(data.user);
		})
		.finally(() => {
			uni.hideLoading();
			userInfoShow.value = false;
			isLoading.value = false;
		});
}

const { user } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.dz-my-head {
	position: relative;
}
.pure_top_view {
	position: absolute;
	top: 0;
	left: -30%;
	width: 160%;
	content: '';
	border-radius: 0 0 50% 50%;
}
.dz-head-box {
	position: relative;
	padding-top: 80rpx;
	padding-bottom: 90rpx;
	.dz-user-info-box {
		/* #ifdef MP */
		padding-top: calc(var(--status-bar-height) + 50rpx);
		/* #endif */
		.login-user-view {
			position: relative;
			text-align: center;
			.login-user-avatar-view {
				position: relative;
				margin-bottom: 20rpx;
			}
		}
	}
}
.tag-level {
	display: flex;
	align-items: center;
	// justify-content: center;
	height: 36rpx;
	padding: 0 6rpx;
	border-radius: 18rpx;
	font-size: 24rpx;
	color: #ffffff;
	border-width: 1rpx;
	border-style: solid;
	position: relative;
	.icon {
		// position: absolute;
		// top: -16rpx;
		// left: -20rpx;
		// font-size: 60rpx;
	}
}
.dz-navbar-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}
.right-item {
	margin: 0 32rpx;
	position: relative;
	display: flex;
}
.custom-bg-img {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 0;
}
.signin-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 52rpx;
	border-radius: 26rpx;
	color: #333;
}
.btn-absolute {
	position: absolute;
	right: 0;
	top: 52rpx;
}
.singin-icon {
	transform: rotate(520deg);
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
</style>

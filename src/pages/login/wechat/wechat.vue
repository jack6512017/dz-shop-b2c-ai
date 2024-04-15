<template>
	<view class="screen dz-bg-color">
		<view class="warp">
			<view @tap="errorBack">
				<view class="dz-text-center"><dz-icon name="wechat" size="100" color="rgb(83,194,64)"></dz-icon></view>
				<view class="dz-flex dz-row-center dz-p-t-20 tip">
					<dz-loading />
					<text class="dz-m-l-15 dz-main-color">{{ tip }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const tip = ref<string>(uni.$api.language.wechatLogin.login);
const isLoading = ref<boolean>(true);

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.language.wechatLogin.titleLogin,
	});
	if (!options.code) {
		uni.$api.router.redirectTo({
			route: uni.$api.routesConfig.fail,
		});
		return;
	}
	wechatLogin(options.code);
});

async function wechatLogin(code) {
	await uni.$api.http
		.get(uni.$api.apiMember.wechatLogin, {
			params: {
				code: code,
				promo_code: userStore.getPromoCode,
				dealer_code: userStore.getDealerCode,
				store_id: userStore.getStoreId,
			},
		})
		.then((res) => {
			userStore.setWechatMpLogin(true);
			if (!res.data.login) {
				userStore.setThirdPartyUserInfo({
					type: 'wechat',
					userInfo: res.data.user_info,
				});
				uni.$api.router.redirectTo({
					route: uni.$api.routesConfig.thirdPartyLogin,
				});
			} else {
				userStore.login(res.data.user_info);
				let pages = getCurrentPages();
				if (pages.length < 2) {
					uni.reLaunch({
						url: uni.$api.appConfig.indexPath,
					});
				} else {
					uni.$api.router.back();
				}
			}
		})
		.catch(() => {
			isLoading.value = false;
			tip.value = uni.$api.language.wechatLogin.error;
		});
}

function errorBack() {
	if (isLoading.value) {
		return;
	}
	uni.$api.router.push({
		url: uni.$api.routesConfig.login,
	});
}
</script>

<style lang="scss">
.screen {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: 1;
	transition: transform 0.3s;
}

.warp {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: 100%;
}

.tip {
	font-weight: bold;
	font-size: 30rpx;
}
</style>

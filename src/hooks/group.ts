import { computed, unref } from 'vue';
import { useUserStore } from '@/state/modules/user';

export function useGroup() {
	const userStore = useUserStore();
	const shopSetting = computed(() => {
		return userStore.getShopSetting;
	});

	let group = null;
	let payGroup = null;
	// #ifdef APP-PLUS
	const platform = uni.$api.systemInfo.osName;
	if (platform == 'ios') {
		group = 'ios';
	} else if (platform == 'android') {
		group = 'android';
	} else {
		group = 'app';
	}
	payGroup = 'app';
	// #endif

	// #ifdef H5
	if (uni.$api.h5IsWechat() && unref(shopSetting).wechat_appid != '') {
		group = 'wechat';
		payGroup = 'wechat';
	} else {
		group = 'h5';
		payGroup = 'h5';
	}
	// #endif

	// #ifdef  MP-WEIXIN
	group = 'wechatMp';
	payGroup = 'miniprogram';
	// #endif

	// #ifdef  MP-QQ
	group = 'qqMp';
	// #endif

	// #ifdef MP-ALIPAY
	group = 'aliMp';
	// #endif

	// #ifdef MP-BAIDU
	group = 'baiduMp';
	// #endif

	// #ifdef MP-TOUTIAO
	group = 'touTiaoMp';
	// #endif

	// #ifdef MP-360
	group = '360Mp';
	// #endif

	return {
		group,
		payGroup,
	};
}
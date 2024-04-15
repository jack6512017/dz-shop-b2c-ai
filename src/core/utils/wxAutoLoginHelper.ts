//微信自动登录
import helper from '@/utils/helper';
import { request } from '@/utils/http';
import apiMember from '@/api/member';
import router from '@/core/utils/router';
import routesConfig from '@/core/config/routesConfig';
import { useUserStore } from '@/state/modules/user';

function login() {
	const userStore = useUserStore();
	const { shopSetting } = userStore.getData;
	if (userStore.hasLogin) {
		return;
	}
	// #ifdef H5
	if (helper.h5IsWechat()) {
		let url = window.location.href;
		url = helper.delUrlParams(url, 'code');
		url = encodeURIComponent(url);
		let jumpUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?
													appid=${shopSetting.wechat_appid}&
													redirect_uri=${url}&
													response_type=code&
													scope=snsapi_userinfo&
													forcePopup=true&
													state=STATE#wechat_redirect`;
		window.location.href = jumpUrl;
	}
	// #endif
}

async function wechatCodeLogin(code: string) {
	// #ifdef H5
	const userStore = useUserStore();
	const { shopSetting, promoCode, dealerCode, storeId } = userStore.getData;
	if (helper.h5IsWechat()) {
		await request
			.get(apiMember.api.wechatLogin, {
				params: {
					code,
					promo_code: promoCode,
					dealer_code: dealerCode,
					store_id: storeId,
				},
			})
			.then((res) => {
				if (!res.data.login) {
					userStore.setThirdPartyUserInfo({ type: 'wechat', userInfo: res.data.user_info });
					router.redirectTo({
						route: routesConfig.thirdPartyLogin,
						query: {
							source: 'autoLogin',
						},
					});
				} else {
					userStore.login(res.data.user_info);
					if (parseInt(shopSetting.app_service_type) > 0) {
					}
				}
			});
	}
	// #endif
}

export default {
	login,
	wechatCodeLogin,
};

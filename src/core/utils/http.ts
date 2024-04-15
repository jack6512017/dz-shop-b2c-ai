import $mRequest from 'luch-request';
import { Toast } from '@/utils/uniapi/prompt';
import { getBaseUrl } from '@/utils/env';
import { ResultEnum } from '@/enums/httpEnum';
import { useUserStore } from '@/state/modules/user';
import $mHelper from '@/utils/helper';

const BASE_URL = getBaseUrl();

const $mHttp = new $mRequest();
const info = uni.getSystemInfoSync();

$mHttp.setConfig((config) => {
	config.baseURL = BASE_URL;
	config.header['Content-Type'] = 'application/json';
	config.header['device-name'] = info.brand; // 设备名称
	config.header['width'] = info.screenWidth; // 屏幕宽度
	config.header['height'] = info.screenHeight; // 屏幕高度
	config.header['os'] = info.osName; // 客户端平台
	config.header['os-version'] = info.system; // 操作系统版本
	config.dataType = 'json';
	config.responseType = 'text';
	return config;
});

$mHttp.validateStatus = (statusCode) => {
	return statusCode === 200;
};

$mHttp.interceptors.request.use(
	(config) => {
		const userStore = useUserStore();
		config.data = config.data ? config.data : {};
		config.header['x-api-key'] = userStore.getAccessToken;
		// if ($mAppConfig.mutiMerchants) {
		// 	config.header['merchant-id'] = userStore.getUserInfo.merchant_id || 0;
		// }
		$mHelper.log(config);
		return config;
	},
	(config) => {
		return Promise.reject(config);
	}
);

$mHttp.interceptors.response.use(
	(response) => {
		$mHelper.log(response);
		const { data } = response;
		const { code, message } = data;
		const userStore = useUserStore();

		if (code === ResultEnum.SUCCESS) {
			return data as any;
		} else {
			switch (code) {
				case 401:
					Toast('您的登录令牌已过期,请重新登录~');
					userStore.reLogin();
					break;
				case 422:
					Toast(message);
					break;
				case 423:
					return Promise.reject(data);
					break;
				case 429:
					Toast('您操作的太快啦，休息一下吧~');
					break;
				case 400:
					if (message) {
						Toast(message);
					} else {
						Toast('错误的请求');
					}
					break;
				case 403:
					Toast('您的请求被拒绝了');
					break;
				case 404:
					if (message) {
						Toast(message);
					} else {
						Toast('资源错误');
					}
					break;
				case 405:
					Toast('当前操作不被允许');
					break;
				case 406:
					if (data.data) {
						Toast(data.data);
					} else {
						Toast('维护中...');
					}
					break;
				case 500:
					Toast('服务器打瞌睡了~');
					break;
				default:
					Toast(message);
					break;
			}
			return Promise.reject(data);
		}
	},
	(error) => {
		$mHelper.log(error);
		return Promise.reject(error);
	}
);

export default $mHttp;

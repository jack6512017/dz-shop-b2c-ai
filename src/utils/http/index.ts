import Request from 'luch-request';
import { assign } from 'lodash-es';
import { Toast } from '@/utils/uniapi/prompt';
import { getBaseUrl } from '@/utils/env';
import { useAuthStore } from '@/state/modules/auth';
import { ResultEnum } from '@/enums/httpEnum';
import { useUserStore } from '@/state/modules/user';

const BASE_URL = getBaseUrl();
const HEADER = {
	'Content-Type': 'application/json;charset=UTF-8;',
	Accept: 'application/json, text/plain, */*',
};

function createRequest() {
	return new Request({
		baseURL: BASE_URL,
		header: HEADER,
		timeout: 10000,
		// custom: {
		// 	auth: true,
		// },
	});
}

const request = createRequest();
/**
 * 请求拦截器
 */
// request.interceptors.request.use(
// 	(options) => {
// 		if (options.custom?.auth) {
// 			const authStore = useAuthStore();
// 			if (!authStore.isLogin) {
// 				Toast('请先登录');
// 				// token不存在跳转到登录页
// 				return Promise.reject(options);
// 			}
// 			options.header = assign(options.header, {
// 				authorization: `Bearer ${authStore.getToken}`,
// 			});
// 		}
// 		return options;
// 	},
// 	(options) => Promise.reject(options)
// );

request.interceptors.request.use(
	(options) => {
		const userStore = useUserStore();
		options.header['x-api-key'] = userStore.getAccessToken;
		// if (options.custom?.auth) {
		//   if (!authStore.isLogin) {
		//     Toast('请先登录');
		//     // token不存在跳转到登录页
		//     return Promise.reject(options);
		//   }
		//   // options.header = assign(options.header, {
		//   //   authorization: `Bearer ${authStore.getToken}`,
		//   // });
		// }
		return options;
	},
	(options) => Promise.reject(options)
);

/**
 * 响应拦截器
 */
request.interceptors.response.use(
	async (response) => {
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
				case 429:
					Toast('您操作的太快啦，休息一下吧~');
					break;
				case 400:
					Toast('错误的请求');
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
		}
		return Promise.reject(data);
	},
	(response) =>
		// 请求错误做点什么。可以使用async await 做异步操作
		// error('Request Error!');
		Promise.reject(response)
);

export { request };

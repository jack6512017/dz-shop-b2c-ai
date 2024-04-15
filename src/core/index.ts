import { App } from 'vue';
// import { request } from '@/utils/http';

//全局请求
import $mHttp from './utils/http';
import appConfig from './config/appConfig';
import helper from '@/utils/helper';
import router from '@/core/utils/router';
import dataConfig from './config/dataConfig';
import apiMember from '@/api/member';
import apiShare from '@/api/share';
import apiBase from '@/api/base';
import apiHome from '@/api/home';
import apiShop from '@/api/shop';
import apiCommon from '@/api/common';
import apiPay from '@/api/pay';
import apiChannel from '@/api/channel';
import apiArticle from '@/api/article';
import apiLive from '@/api/live';
import apiStore from '@/api/store';
import shopSetting from './config/shopSetting';
import language from './config/language';
import routesConfig from './config/routesConfig';
import assetsConfig from './config/assetsConfig';
import tabbarConfig from './config/tabbarConfig';
import throttle from './utils/throttle';
import components from './utils/components';
import appUpdate from '@/core/utils/appUpdate';
import theme from './config/theme';
import zIndex from './config/zIndex';
import test from './utils/test';
import wxHelper from './utils/wxHelper';

// #ifdef H5
import jweixin from 'weixin-js-sdk';
// #endif
import shop from '@/core/utils/shop';
import wxAutoLoginHelper from '@/core/utils/wxAutoLoginHelper';

const $api = {
	appConfig,
	http: $mHttp,
	...helper,
	router,
	dataConfig,
	apiMember: apiMember.api,
	apiShop: apiShop.api,
	apiCommon,
	apiChannel,
	apiArticle,
	apiShare,
	apiBase,
	apiHome,
	apiPay,
	apiLive,
	apiStore,
	systemInfo: uni.getSystemInfoSync(),
	shopSetting,
	language,
	routesConfig,
	assetsConfig,
	tabbarConfig,
	appUpdate,
	wxHelper,
	theme,
	...components,
	throttle,
	zIndex,
	//  #ifdef H5
	jweixin,
	//  #endif
	shop,
	test,
	wxAutoLoginHelper,
};

uni.$api = $api;
uni.$onLaunched = new Promise((resolve) => {
	uni.$isResolve = resolve;
});
export default {
	install: (app: App) => {
		app.config.globalProperties.api = $api;
	},
};

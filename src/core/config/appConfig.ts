import { getEnvValue } from '@/utils/env';

//系统配置
const CONFIG = {
	//缺省应用名称
	appName: {
		chs: '...',
		cht: '...',
		eng: 'mall',
	},
	//缺省h5访问地址
	h5Domain: getEnvValue('VITE_H5_DOMAIN'),
	//api访问地址
	apiDomain: getEnvValue('VITE_BASE_URL'),
	//静态资源路径(网络资源或者本地资源，小程序不支持本地资源)
	assetsPath: getEnvValue('VITE_ASSETS_PATH'),
	//默认语言包
	language: getEnvValue('VITE_LANGUAGE'),
	//手机注册默认区号
	mobileArea: getEnvValue('VITE_MOBILE_AREA'),
	//首页位置
	indexPath: getEnvValue('VITE_INDEX_PATH'),
	//如果购物车在底部导航栏，底部导航栏的索引，-1表示不在底部导航栏
	cartBarIndex: getEnvValue('VITE_CATR_BAR_INDEX'),
	//如果消息在底部导航栏，底部导航栏的索引，-1表示不在底部导航栏
	messageBarIndex: getEnvValue('VITE_MESSAGE_BAR_INDEX'),
	//默认每一页的数量
	pageSize: parseInt(getEnvValue('VITE_PAGE_SIZE')),
	//登录验证码倒计时
	loginCodeSecond: parseInt(getEnvValue('VITE_LOGIN_CODE_SECOND')),
	//APP是否检测自动升级
	appCheckUpdate: parseInt(getEnvValue('VITE_APP_CHECK_UPDATE')),
	//当前version，非APP的版本号，APP的版本号直接获取
	version: getEnvValue('VITE_VERSION'),
};

export default CONFIG;

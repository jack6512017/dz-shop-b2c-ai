<script setup lang="ts">
import { onLaunch, onShow, onHide, onError } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import themeConfig from '@/core/config/themeConfig';
import { getEnvValue } from '@/utils/env';

const userStore = useUserStore();
const { customerTheme, styleLoadingType } = userStore.getData;

onLaunch((options) => {
	console.log('App Launch');
	if (options.scene) {
		userStore.setWechatMpScene(options.scene);
	}
	init();
});

onShow(() => {
	console.log('App Show');
	uni.hideTabBar();
});
onHide(() => {
	console.log('App Hide');
});
onError(async (error) => {
	const errorInfo = error.toString() + '\n';
	const res = uni.getSystemInfoSync();
	let sysInfo = '';
	// #ifdef H5
	sysInfo = `设备：${res.deviceType}；系统：${res.osName}；浏览器：${res.browserName}；`;
	// #endif
	// #ifdef APP-PLUS
	sysInfo = `手机品牌：${res.deviceBrand}；手机型号：${res.deviceModel}；操作系统版本：${res.osVersion}；客户端平台：${res.osName}；错误描述：${error}；`;
	// #endif
	// #ifdef MP-WEIXIN
	sysInfo = `设备：${res.deviceType}；系统：${res.osName}；`;
	// #endif
	let pages = getCurrentPages();
	let page = pages[pages.length - 1];
	let pageInfo = 'page：' + page?.route + '；';

	await uni.$api.http.post(uni.$api.apiCommon.clientLogIndex, {
		client_name: 'APP',
		client_version: getEnvValue('VITE_VERSION'),
		error_msg: sysInfo + '\n' + pageInfo + '\n' + errorInfo,
	});
	//全局错误监听
	// #ifdef APP-PLUS
	plus.runtime.getProperty(plus.runtime.appid, () => {
		const res = uni.getSystemInfoSync();
		let errMsg = `手机品牌：${res.deviceBrand}；手机型号：${res.deviceModel}；操作系统版本：${res.osVersion}；客户端平台：${res.osName}；错误描述：${error}`;
		console.log('发生错误：' + errMsg);
	});
	// #endif
});

async function init() {
	//微信小程序升级
	// #ifdef MP-WEIXIN
	if (uni.canIUse('getUpdateManager')) {
		const updateManager = uni.getUpdateManager();
		updateManager.onCheckForUpdate(function (res) {
			if (res.hasUpdate) {
				updateManager.onUpdateReady(function (res) {
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
				updateManager.onUpdateFailed(function (res) {
					wx.showModal({
						title: '发现新版本',
						content: '新版本已经上线啦，请您删除当前小程序，重新搜索打开',
					});
				});
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

	// #ifdef APP-PLUS
	// 锁定方向
	plus.screen.lockOrientation('portrait-primary');
	// 监听推送点击事件
	plus.push.addEventListener(
		'click',
		(msg) => {
			uni.$api.shop.navTo(JSON.parse(msg.content), 'click');
		},
		false
	);
	// 监听在线消息事件
	plus.push.addEventListener(
		'receive',
		(msg) => {
			uni.$api.shop.navTo(JSON.parse(msg.content), 'receive');
		},
		false
	);
	// #endif

	// 配置初始化
	await getSettingList();

	//登录初始化 - 设备推送 由于获取clientid各个版本存在不稳定性，需要先进行判断
	if (userStore.hasLogin) {
		// #ifdef APP-PLUS
		let client = plus.push.getClientInfo();
		let clientid = (client && client.clientid) || '';
		if (clientid) {
			handleBindingEquipment(clientid, userStore.getAccessToken);
		}
		// #endif
	}

	//获取客服未读数量
	uni.$api.shop.getCustomerServiceUnread();

	//预加载页面
	// #ifdef H5 || APP-NVUE
	// for (let i = 0; i < uni.$api.tabbarConfig.tabbarList.length; i++) {
	// 	uni.preloadPage({ url: uni.$api.tabbarConfig.tabbarList[i].pagePath });
	// }
	// #endif

	//完成基础加载
	await uni.$isResolve();
	// 初始化底部导航栏
	await getDiyTabbar();
}

//推送
async function handleBindingEquipment(id: string, token: string) {
	const oauth_client = uni.getSystemInfoSync().osName;
	await uni.$api.http.post(uni.$api.apiShop.bindingEquipment, {
		token,
		oauth_client,
		oauth_client_user_id: id,
	});
}

// 获取全局配置
async function getSettingList() {
	let field = Object.keys(uni.$api.shopSetting).join(',');
	await uni.$api.http
		.get(uni.$api.apiCommon.configIndex, {
			params: {
				field: field,
			},
		})
		.then(async (res) => {
			initSetting(res.data);
		});
}

// 初始化全局配置
function initSetting(data: any) {
	let filed = Object.keys(uni.$api.shopSetting);
	for (let i = 0; i < filed.length; i++) {
		if (data[filed[i]]) {
			uni.$api.shopSetting[filed[i]] = data[filed[i]];
		}
	}
	userStore.setShopSetting(uni.$api.shopSetting);
	// 如果客户皮肤自定义
	if (data.style_user_is_open && parseInt(data.style_user_is_open) === 1) {
		let ct = customerTheme || data.style_type;
		if (ct && themeConfig[ct]) {
			uni.$api.theme = { ...uni.$api.theme, ...themeConfig[ct].colors };
			userStore.setTheme(themeConfig[ct].colors);
		} else {
			if (themeConfig[data.style_type]) {
				uni.$api.theme = {
					...uni.$api.theme,
					...themeConfig[data.style_type].colors,
				};
			}

			userStore.setTheme(themeConfig[data.style_type].colors);
		}
		userStore.setCustomerTheme(ct);
	} else {
		if (themeConfig[data.style_type]) {
			uni.$api.theme = {
				...uni.$api.theme,
				...themeConfig[data.style_type].colors,
			};
		}
		const styleType = customerTheme || data.style_type;
		userStore.setTheme(themeConfig[data.style_type].colors);
		userStore.setCustomerTheme(data.style_type);
	}

	//如果客户Loading自定义
	if (data.style_loading_is_open && parseInt(data.style_loading_is_open) == 1) {
		userStore.setLoadingType(styleLoadingType);
	} else {
		userStore.setLoadingType(data.style_loading_type);
	}
	//根据不同的应用切换默认登录地址
	// #ifdef APP-PLUS
	switch (parseInt(uni.$api.shopSetting.app_login_default)) {
		case 0:
			uni.$api.routesConfig.login.path = '/pages/login/login/login';
			break;
		case 1:
			uni.$api.routesConfig.login.path = '/pages/login/wechatAuthLogin/wechatAuthLogin';
			break;
		case 10:
			uni.$api.routesConfig.login.path = '/pages/login/passwordLogin/passwordLogin';
			break;
		case 2:
			uni.$api.routesConfig.login.path = '/pages/login/usernamePasswordLogin/usernamePasswordLogin';
			break;
	}
	// #endif
	// #ifdef H5
	if (uni.$api.h5IsWechat() && uni.$api.shopSetting.wechat_appid != '') {
		switch (parseInt(uni.$api.shopSetting.wechat_login_default)) {
			case 0:
				uni.$api.routesConfig.login.path = '/pages/login/login/login';
				break;
			case 1:
				uni.$api.routesConfig.login.path = '/pages/login/wechatAuthLogin/wechatAuthLogin';
				break;
			case 10:
				uni.$api.routesConfig.login.path = '/pages/login/passwordLogin/passwordLogin';
				break;
			case 2:
				uni.$api.routesConfig.login.path = '/pages/login/usernamePasswordLogin/usernamePasswordLogin';
				break;
		}
	} else {
		switch (parseInt(uni.$api.shopSetting.h5_login_default)) {
			case 0:
				uni.$api.routesConfig.login.path = '/pages/login/login/login';
				break;
			case 10:
				uni.$api.routesConfig.login.path = '/pages/login/passwordLogin/passwordLogin';
				break;
			case 2:
				uni.$api.routesConfig.login.path = '/pages/login/usernamePasswordLogin/usernamePasswordLogin';
				break;
		}
	}
	// #endif
	// #ifdef MP-WEIXIN
	switch (parseInt(uni.$api.shopSetting.mini_program_login_default)) {
		case 0:
			uni.$api.routesConfig.login.path = '/pages/login/login/login';
			break;
		case 1:
			uni.$api.routesConfig.login.path = '/pages/login/wechatAuthLogin/wechatAuthLogin';
			break;
		case 10:
			uni.$api.routesConfig.login.path = '/pages/login/passwordLogin/passwordLogin';
			break;
		case 2:
			uni.$api.routesConfig.login.path = '/pages/login/usernamePasswordLogin/usernamePasswordLogin';
			break;
	}
	// #endif
}
// 初始化底部导航栏
function getDiyTabbar() {
	uni.$api.http.get(uni.$api.apiShop.diyCustomTabIndex).then((res) => {
		if (res.data.component) {
			userStore.setTabbarList(res.data.component);
		}
	});
}
</script>
<style lang="scss">
/* 图标 */
@import '@/core/iconfont.css';
@import '@/assets/style/main.scss';
</style>

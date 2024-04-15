// /**
//  * 路由跳转方法，该方法相对于直接使用uni.xxx的好处是使用更加简单快捷
//  * 并且带有路由拦截功能
//  */
import $mHelper from '@/utils/helper';
import $routesConfig from '../config/routesConfig';
import $mTabbarConfig from '../config/tabbarConfig';
import { useUserStore } from '@/state/modules/user';

/*
 * 路由对象
 * 中心思想：需要路由鉴权,由于uni-app没有vue中的全局钩子函数，所以封装了Router对象。
 * 说明：应用中的路由跳转尽量使用该Router的方法，并配合config中的路由表对象进行跳转。
 * 如果在tabbarConfig中配置了tabbar页面，则switchTab方法可以不使用，这样可以尽量灵活
 *
 * 示例：this.$api.router.push({route:this.$api.routesConfig.index,query:{a:1}})
 *
 */

function tapRouter(type, options) {
	switch (type) {
		case 'navigateTo':
			uni.navigateTo(options);
			break;
		case 'redirectTo':
			uni.redirectTo(options);
			break;
		case 'reLaunch':
			uni.reLaunch(options);
			break;
		case 'switchTab':
			uni.switchTab(options);
			break;
		case 'navigateBack':
			uni.navigateBack(options);
			break;
		default:
			warn('navigate Error');
			break;
	}
}

class Router {
	constructor() {
		this.callBack = () => {};
	}

	beforeEach(callBack) {
		if (callBack instanceof Function) this.callBack = callBack;
	}

	checkSwitchTab(to) {
		let isSwitchTab = false;
		for (let i = 0; i < $mTabbarConfig.tabbarList.length; i++) {
			if ($mTabbarConfig.tabbarList[i].pagePath == to.route.path) {
				isSwitchTab = true;
				break;
			}
		}
		return isSwitchTab;
	}

	push(to) {
		console.log('push', to);
		if (this.checkSwitchTab(to)) {
			this.switchTab(to);
		} else {
			this.callBack('navigateTo', to);
		}
	}

	redirectTo(to) {
		console.log('redirectTo', to);
		if (this.checkSwitchTab(to)) {
			this.switchTab(to);
		} else {
			this.callBack('redirectTo', to);
		}
	}

	reLaunch(to) {
		console.log('reLaunch', to);
		this.callBack('reLaunch', to);
	}

	switchTab(to) {
		console.log('switchTab', to);
		this.callBack('switchTab', to);
	}

	back(delta) {
		console.log('back', delta);
		uni.navigateBack({
			delta: typeof delta === 'undefined' ? 1 : delta,
		});
	}
}

const $mRouter = new Router();

//路由请求
$mRouter.beforeEach((navType, to) => {
	console.log(navType, 'routerBeforeEach', to);
	if (to.route === undefined) {
		console.log('路由钩子函数中没有找到to.route对象，路由信息:' + JSON.stringify(to));
		return;
	}
	// 过滤需要权限的页面
	console.log(to.route.requiresAuth, uni, '17');
	if (to.route.requiresAuth) {
		const userStore = useUserStore();
		if (userStore.hasLogin) {
			console.log(navType, userStore.hasLogin, '2');
			// 已经登录

			tapRouter(navType, {
				url: $mHelper.objParseUrlAndParam(to.route.path, to.query),
				animationType: 'pop-in',
			});
		} else {
			console.log(navType, '1');

			tapRouter(navType, {
				url: $routesConfig.login.path,
				animationType: 'slide-in-bottom',
			});
		}
	} else {
		console.log(navType, '3');
		tapRouter(navType, {
			url: $mHelper.objParseUrlAndParam(to.route.path, to.query),
		});
	}
});

export default $mRouter;

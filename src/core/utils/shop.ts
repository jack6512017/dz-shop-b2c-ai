//商城专用方法
import $mRouter from './router';
import $mRoutesConfig from '../config/routesConfig';
import $mHelper from '@/utils/helper';
import { request } from '@/utils/http';
import $mApiCommon from '@/api/common';
import $mApiShop from '@/api/shop';
import $mLanguage from '../config/language';
import { useUserStore } from '@/state/modules/user';

/**
 * 广告跳转
 * @param {Object} type
 * @param {Object} id
 */
function advNavigate(type: string, id: string, advId: string, toType: string) {
	if (advId) {
		let api = toType ? 'advPopView' : 'advView';
		request.get($mApiShop.api[api], {
			params: {
				id: advId,
			},
		});
	}
	let page,
		param = {};
	switch (type) {
		case 'product_view': // 商品详情
			if ($mHelper.isNumber(id)) {
				page = $mRoutesConfig.product;
				param = {
					id: id,
				};
			}
			break;
		case 'mini_program_live_view': // 小程序直播
			if ($mHelper.isNumber(id)) {
				liveNavigate(id);
			}
			break;
		case 'notify_announce_view': // 公告详情
			if ($mHelper.isNumber(id)) {
				page = $mRoutesConfig.noticeDetail;
				param = {
					id: id,
				};
			}
			break;
		case 'helper_view': // 站点帮助
			if ($mHelper.isNumber(id)) {
				page = $mRoutesConfig.helperDetail;
				param = {
					id: id,
				};
			}
			break;
		case 'coupon_list': // 优惠券详情
			if ($mHelper.isNumber(id)) {
				page = $mRoutesConfig.couponList;
				param = {};
			}
			break;
		case 'combination_view': // 组合套餐
			page = $mRoutesConfig.combinationList;
			param = {
				id: id,
			};
			break;
		case 'topic_view': //专题活动
			break;
		case 'product_list_for_cate': // 某分类下产品列表
			page = $mRoutesConfig.productList;
			param = {
				cate_id: $mHelper.isNumber(id) ? id : '',
			};
			break;
		case 'discount_list': // 限时折扣首页
			page = $mRoutesConfig.discountIndex;
			break;
		case 'group_buy_list': // 团购首页
			page = $mRoutesConfig.groupIndex;
			break;
		case 'haggle_list': // 砍价首页
			page = $mRoutesConfig.haggleIndex;
			break;
		case 'wholesale_list': // 拼团首页
			page = $mRoutesConfig.wholesaleIndex;
			break;
		case 'article_list_for_cate': //某分类下的文章列表
			page = $mRoutesConfig.articleList;
			param = {
				id: $mHelper.isNumber(id) ? id : '',
			};
			break;

		case 'article_view': //文章详情
			if ($mHelper.isNumber(id)) {
				page = $mRoutesConfig.articleDetail;
				param = {
					id: id,
				};
			}
			break;
		case 'custom': //自定义链接
			if ($mHelper.isNumber(id)) {
				page = $mRoutesConfig.customPage;
				param = {
					code: id,
				};
			}
			break;
		default:
			break;
	}
	if (page) {
		$mRouter.push({
			route: page,
			query: param,
		});
	}
}

function navTo(item: object, navType: string = 'receive') {
	const userStore = useUserStore();
	const { userInfo, shopSetting } = userStore.getData;
	const id = item.target_id;
	const type = item.target_type;
	switch (type) {
		case 'order_consign':
			$mRouter.push({
				route: $mRoutesConfig.shipping,
				query: {
					id: id,
				},
			});
			break;
		case 'order_pay':
		case 'order_stock_up_accomplish':
		case 'order_return_money':
		case 'order_haggle_accomplish':
		case 'order_signin':
			$mRouter.push({
				route: $mRoutesConfig.orderDetail,
				query: {
					id: id,
				},
			});
			break;
		case 'order_wholesale_open':
		case 'order_wholesale_join':
		case 'order_wholesale_accomplish':
		case 'order_wholesale_close':
			$mRouter.push({
				route: $mRoutesConfig.wholesaleDetail,
				query: {
					id: id,
				},
			});
			break;
		case 'order_haggle_friend_join':
		case 'order_haggle_close':
			$mRouter.push({
				route: $mRoutesConfig.haggleDetail,
				query: {
					id: id,
				},
			});
			break;
		case 'coupon_give':
			$mRouter.push({
				route: $mRoutesConfig.coupon,
				query: {
					type: 1,
				},
			});
			break;
		case 'order_virtual':
		case 'order_virtual_card':
		case 'order_virtual_network_disk':
		case 'order_virtual_download':
			$mRouter.push({
				route: $mRoutesConfig.virtualDetail,
				query: {
					id: id,
				},
			});
			break;
		case 'zmxkf':
			//芝麻小客服推送事件
			if (navType == 'receive') {
				userStore.setCustomerServiceUnread(id);
			} else {
				if (userStore.hasLogin) {
					let params = {
						source: 'APP离线推送',
						openid: userInfo.id,
						mobile: userInfo.mobile,
						sex: userInfo.gender,
						nickName: userInfo.nickname,
					};
					let customerServiceUrl = shopSetting.app_service_zmxkf_url;
					if (customerServiceUrl) {
						request.get($mApiCommon.api.customerServiceClearUnread, {
							params: {
								member_id: userInfo.id,
							},
						});
						customerServiceUrl = $mHelper.objParseUrlAndParam(customerServiceUrl, params);
						$mRouter.push({
							route: $mRoutesConfig.webview,
							query: {
								url: $mHelper.strEncode(customerServiceUrl),
							},
						});
					}
				}
			}
			break;
	}
}

//获取客服未读数量
function getCustomerServiceUnread() {
	// #ifdef APP-PLUS || H5
	const userStore = useUserStore();
	const { userInfo, shopSetting } = userStore.getData;
	if (userStore.hasLogin && parseInt(shopSetting.app_service_type) > 2) {
		request
			.get($mApiCommon.customerServiceUnread, {
				params: {
					member_id: userInfo.id,
				},
			})
			.then((res) => {
				userStore.setCustomerServiceUnread(res.data.count);
			});
	}
	// #endif
}

//清除客服未读数量
function clearCustomerServiceRead() {
	// #ifdef APP-PLUS || H5
	const userStore = useUserStore();
	const { userInfo, shopSetting, customerServiceUnread } = userStore.getData;
	if (userStore.hasLogin && parseInt(shopSetting.app_service_type) > 2 && parseInt(customerServiceUnread) > 0) {
		request
			.get($mApiCommon.customerServiceClearUnread, {
				params: {
					member_id: userInfo.id,
				},
			})
			.then(() => {
				userStore.setCustomerServiceUnread(0);
			});
	}
	// #endif
}

/**
 * 产品跳转
 * @param {Object} data
 */
function productNavigate(data: object) {
	let page = $mRoutesConfig.product;
	if (data.marketing_type == 'haggle') {
		page = $mRoutesConfig.haggleProduct;
	} else if (data.marketing_type == 'discount') {
		page = $mRoutesConfig.discountProduct;
	} else if (data.marketing_type == 'group_buy') {
		page = $mRoutesConfig.groupProduct;
	} else if (data.marketing_type == 'wholesale') {
		page = $mRoutesConfig.wholesaleProduct;
	} else if (data.marketing_type == 'presale') {
		page = $mRoutesConfig.orderDetail;
	}
	$mRouter.push({
		route: page,
		query: {
			id: data.id,
		},
	});
}

/**
 * 直播跳转
 */
function liveNavigate(id: string) {
	//微信小程序直接打开直播间
	// #ifdef MP-WEIXIN
	uni.navigateTo({
		url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${id}`,
	});
	// #endif
	//APP打开小程序
	// #ifdef APP-PLUS
	const userStore = useUserStore();
	const { shopSetting } = userStore.getData;
	plus.share.getServices(
		(res) => {
			let sweixin = null;
			for (let i = 0; i < res.length; i++) {
				let t = res[i];
				if (t.id == 'weixin') {
					sweixin = t;
					break;
				}
			}
			if (sweixin) {
				sweixin.launchMiniProgram({
					id: shopSetting.miniprogram_id,
					type: shopSetting.miniprogram_type,
					path: $mRoutesConfig.miniProgramLive.path,
				});
			} else {
				toast($mLanguage.index.launchMiniProgramError);
			}
		},
		(err) => {
			toast($mLanguage.index.getWeixinServiceError);
		}
	);
	// #endif
	//H5提醒
	// #ifndef MP-WEIXIN || APP-PLUS
	$mHelper.toast($mLanguage.language.index.notInWechatOrApp);
	// #endif
}
//链接跳转
function linkJump(item: object) {
	if (!item.activeMenuType) return;
	// 商城页面
	if (item.activeMenuType == 'pageView') {
		const pathList = ['orderIndex-1', 'orderIndex-2', 'orderIndex-3', 'orderIndex-4', 'distributionOrder-group'];
		if (pathList.includes(item.pageView)) {
			let path = item.pageView.split('-');
			let params = {};
			if (path[0] == 'distributionOrder') {
				params.type = path[1];
			} else {
				params.status = path[1];
			}
			$mRouter.push({
				route: $mRoutesConfig[path[0]],
				query: {
					...params,
				},
			});
			return;
		}
		if (item.pageView.indexOf('productList') != -1) {
			let query = item.pageView.split('-');
			let params = {};
			if (query[1]) {
				params = JSON.parse(query[1]);
			}
			$mRouter.push({
				route: $mRoutesConfig[query[0]],
				query: {
					...params,
				},
			});
			return;
		}
		$mRouter.push({
			route: $mRoutesConfig[item.pageView],
		});
	}
	// 商品
	if (item.activeMenuType == 'product') {
		let url = item.activeMenuType;
		if (item.type) {
			url = `${item.type}Product`;
			if (item.type == 'product') {
				url = `product`;
			}
		}
		$mRouter.push({
			route: $mRoutesConfig[url],
			query: {
				id: item.id,
			},
		});
	}
	// 分类
	if (item.activeMenuType == 'cate') {
		if (item.active == -1 || !item.active) return;
		$mRouter.push({
			route: $mRoutesConfig.productList,
			query: {
				cate_id: item.active,
			},
		});
	}
	// 自定义链接
	if (item.activeMenuType == 'custom') {
		$mRouter.push({
			route: $mRoutesConfig.customPage,
			query: {
				code: item.id,
			},
		});
	}
	// 内部链接
	if (item.activeMenuType == 'innerLink') {
		let pathName = item.innerLink.split('/');
		if (pathName.length > 0 && (pathName[1] == 'main' || pathName[2] == 'main')) {
			uni.switchTab({
				url: item.innerLink,
			});
		} else {
			uni.navigateTo({
				url: item.innerLink,
			});
		}
	}
	// 测评
	if (item.activeMenuType == 'testRecommend') {
		$mRouter.push({
			route: $mRoutesConfig.testRecommendIndex,
			query: {
				cate_id: item.id,
			},
		});
	}
	// 知识付费首页
	if (item.activeMenuType == 'knowledgeIndex') {
		$mRouter.push({
			route: $mRoutesConfig.knowledgeIndex,
		});
	}
	// 知识付费详情
	if (item.activeMenuType == 'knowledge') {
		$mRouter.push({
			route: $mRoutesConfig.knowledgeDetails,
			query: {
				id: item.id,
			},
		});
	}
	// 自定义表单
	if (item.activeMenuType == 'customForm') {
		$mRouter.push({
			route: $mRoutesConfig.customForm,
			query: {
				code: item.id,
			},
		});
	}
	// 自定义表单
	if (item.activeMenuType == 'article') {
		$mRouter.push({
			route: $mRoutesConfig.articleDetail,
			query: {
				id: item.id,
			},
		});
	}
	// 外部链接
	if (item.activeMenuType == 'externalLink') {
		if ($mHelper.isUrl(item.externalLink)) {
			$mRouter.push({
				route: $mRoutesConfig.webview,
				query: {
					url: $mHelper.strEncode(item.externalLink),
				},
			});
		}
	}
}

export default {
	advNavigate,
	navTo,
	getCustomerServiceUnread,
	clearCustomerServiceRead,
	productNavigate,
	liveNavigate,
	linkJump,
};

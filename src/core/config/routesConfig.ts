/*
 * 路由表对象：
 * 该文件挂载在Vue
 * 作用：调用router对象的方法 传入以下对应的路由对象
 * 示例：this.$api.router.push({route:this.$api.routesConfig.main,query:{a:1}})
 * 注意：所有在pages目录下新建的页面都必须在"路由表"中进行声明，并且在框架的pages.json注册。
 *
 * 配置参数项说明：
 * name:可选配置 （路由名称）
 * path:必填配置 （路由地址）
 * requiresAuth:可选配置 （是否权限路由）
 */

export default {
	// --------------------------微商城路由----------------------------
	// tabbar
	index: {
		name: '首页',
		path: '/pages/main/index/index',
	},

	category: {
		name: '分类',
		path: '/pages/main/category/category',
	},

	discover: {
		name: '商学院',
		path: '/pages/main/discover/discover',
	},

	cart: {
		name: '购物车',
		path: '/pages/main/cart/cart',
	},
	profile: {
		name: '我的',
		path: '/pages/main/profile/profile',
	},

	//public
	search: {
		name: '搜索',
		path: '/pages/public/search/search',
	},
	notice: {
		name: '公告',
		path: '/pages/public/notice/index',
	},
	noticeDetail: {
		name: '公告详情',
		path: '/pages/public/notice/detail',
	},
	vedio: {
		name: '视频',
		path: '/pages/public/vedio/vedio',
	},
	webview: {
		name: '浏览器',
		path: '/pages/public/webview/webview',
	},
	helper: {
		name: '帮助',
		path: '/pages/common/helper/helper',
	},
	helperDetail: {
		name: '帮助详情',
		path: '/pages/common/helper/detail',
	},
	article: {
		name: '文章中心',
		path: '/pages/public/article/article',
		requiresAuth: false,
	},
	articleList: {
		name: '文章列表',
		path: '/pages/public/article/list',
		requiresAuth: false,
	},
	articleDetail: {
		name: '文章详情',
		path: '/pages/public/article/detail',
		requiresAuth: false,
	},
	customPage: {
		name: '自定义页面',
		path: '/pages/public/customPage/customPage',
	},
	customForm: {
		name: '自定义表单',
		path: '/pages/public/customForm/customForm',
	},
	//live
	miniProgramLive: {
		name: '微信直播',
		path: '/pages/public/live/miniProgramLive/miniProgramLive',
	},

	//login
	login: {
		name: '登录/注册',
		path: '/pages/login/login/login',
	},
	mobileLogin: {
		name: '手机登录',
		path: '/pages/login/login/login',
	},
	wechatAuthLogin: {
		name: '授权登录',
		path: '/pages/login/wechatAuthLogin/wechatAuthLogin',
	},
	loginCode: {
		name: '获取验证码',
		path: '/pages/login/code/code',
	},
	thirdPartyLogin: {
		name: '第三方绑定手机号/注册',
		path: '/pages/login/thirdPartyLogin/thirdPartyLogin',
	},
	bindMobile: {
		name: '绑定手机号',
		path: '/pages/login/bindMobile/bindMobile',
		requiresAuth: true,
	},
	modifyMobileStep1: {
		name: '修改手机号',
		path: '/pages/login/modifyMobileStep/index1',
		requiresAuth: true,
	},
	modifyMobileStep2: {
		name: '修改手机号',
		path: '/pages/login/modifyMobileStep/index2',
		requiresAuth: true,
	},
	loginWechat: {
		name: '公众号登录',
		path: '/pages/login/wechat/wechat',
	},
	mobileRegister: {
		name: '手机号注册',
		path: '/pages/login/mobileRegister/mobileRegister',
	},
	passwordLogin: {
		name: '密码登录',
		path: '/pages/login/passwordLogin/passwordLogin',
	},
	modifyPassword: {
		name: '设置/修改密码',
		path: '/pages/login/modifyPassword/modifyPassword',
		requiresAuth: true,
	},
	usernamepasswordLogin: {
		name: '用户名密码登录',
		path: '/pages/login/usernamePasswordLogin/usernamePasswordLogin',
	},
	usernameRegister: {
		name: '用户名注册',
		path: '/pages/login/usernameRegister/usernameRegister',
	},
	usernameMobileRegister: {
		name: '用户名+手机号注册',
		path: '/pages/login/usernameMobileRegister/usernameMobileRegister',
	},

	// notify
	notifyIndex: {
		name: '消息',
		path: '/pages/user/notify/index/index',
	},
	notifyLogistics: {
		name: '物流交易',
		path: '/pages/user/notify/logistics/logistics',
	},
	notifyRefund: {
		name: '售后服务',
		path: '/pages/user/notify/refund/refund',
	},
	notify: {
		name: '服务通知',
		path: '/pages/user/notify/notify/notify',
	},

	//product
	product: {
		name: '产品详情',
		path: '/pages/product/detail/detail',
	},
	productList: {
		name: '产品列表',
		path: '/pages/product/list/list',
	},
	evaluationList: {
		name: '评价列表',
		path: '/pages/product/evaluation/evaluation',
	},

	//haggle
	haggleIndex: {
		name: '砍价活动',
		path: '/pages/marketing/haggle/index/index',
	},
	haggleProduct: {
		name: '砍价商品详细',
		path: '/pages/marketing/haggle/product/product',
	},
	haggleList: {
		name: '砍价列表',
		path: '/pages/marketing/haggle/list/list',
	},
	haggleAddress: {
		name: '砍价地址选择',
		path: '/pages/marketing/haggle/address/address',
		requiresAuth: true,
	},
	haggleDetails: {
		name: '砍价详情',
		path: '/pages/marketing/haggle/details/details',
	},
	myHaggle: {
		name: '我的砍价',
		path: '/pages/marketing/haggle/my/my',
		requiresAuth: true,
	},

	//joinBuy
	joinBuyIndex: {
		name: '拼团活动',
		path: '/pages/marketing/joinBuy/index/index',
	},
	joinBuyGroup: {
		name: '拼团列表',
		path: '/pages/marketing/joinBuy/group/group',
		requiresAuth: true,
	},
	joinBuyProduct: {
		name: '拼团产品',
		path: '/pages/marketing/joinBuy/product/product',
	},
	joinBuyDetail: {
		name: '拼团详情',
		path: '/pages/marketing/joinBuy/detail/detail',
	},

	// limited
	limitedIndex: {
		name: '团购活动',
		path: '/pages/marketing/limited/index/index',
	},
	limitedProduct: {
		name: '团购产品',
		path: '/pages/marketing/limited/product/product',
	},

	// discount
	discountIndex: {
		name: '限时优惠',
		path: '/pages/marketing/discount/index/index',
	},
	discountActivity: {
		name: '活动列表',
		path: '/pages/marketing/discount/activityList/activityList',
	},
	discountProduct: {
		name: '折扣产品',
		path: '/pages/marketing/discount/product/product',
	},
	discountList: {
		name: '单个折扣活动列表',
		path: '/pages/marketing/discount/list/list',
	},

	//presale
	presaleIndex: {
		name: '预售',
		path: '/pages/marketing/presale/index/index',
	},

	//combination
	combinationList: {
		name: '组合套餐',
		path: '/pages/marketing/combination/list/list',
	},

	calculateIndex: {
		name: '人生测算',
		path: '/pages/marketing/calculate/index/index',
	},

	calculatePay: {
		name: '人生测算支付',
		path: '/pages/order/pay/calculatePay',
	},
	calculateResult: {
		name: '人生测算支付',
		path: '/pages/marketing/calculate/result/result',
	},

	//order
	orderCreate: {
		name: '创建订单',
		path: '/pages/order/create/create',
		requiresAuth: true,
	},
	orderIndex: {
		name: '我的订单',
		path: '/pages/order/index/index',
		requiresAuth: true,
	},
	orderDetail: {
		name: '订单详情',
		path: '/pages/order/detail/detail',
		requiresAuth: true,
	},
	pay: {
		name: '订单支付',
		path: '/pages/order/pay/pay',
		requiresAuth: true,
	},
	allinpayAppWxPay: {
		name: '订单支付',
		path: '/pages/order/allinpayAppWxPay/allinpayAppWxPay',
		requiresAuth: true,
	},
	aliMiddle: {
		name: '支付宝支付',
		path: '/pages/order/pay/aliMiddle',
		requiresAuth: true,
	},
	orderPickup: {
		name: '提货',
		path: '/pages/order/pickup/pickup',
		requiresAuth: true,
	},
	memberLevel: {
		name: '会员卡列表',
		path: '/pages/order/pay/level',
		requiresAuth: true,
	},

	//service
	serviceIndex: {
		name: '联系客服',
		path: '/pages/product/service/index/index',
		requiresAuth: true,
	},
	serviceDetail: {
		name: '客服详情',
		path: '/pages/product/service/detail/detail',
		requiresAuth: true,
	},
	service: {
		name: '客服',
		path: '/pages/product/service/service/service',
		requiresAuth: true,
	},

	//notice
	success: {
		name: '操作成功',
		path: '/pages/notice/success',
		requiresAuth: false,
	},
	fail: {
		name: '操作失败',
		path: '/pages/notice/fail/index',
		requiresAuth: false,
	},
	paySuccess: {
		name: '支付成功',
		path: '/pages/notice/paySuccess/paySuccess',
		requiresAuth: true,
	},
	payComplete: {
		name: '支付结果',
		path: '/pages/notice/payComplete/payComplete',
		requiresAuth: true,
	},
	allinpayAppWxPaySuccess: {
		name: '支付成功',
		path: '/pages/notice/allinpayAppWxPaySuccess',
		requiresAuth: false,
	},

	//user
	userInfo: {
		name: '用户资料',
		path: '/pages/user/userInfo/userInfo',
		requiresAuth: true,
	},
	collection: {
		name: '我的收藏',
		path: '/pages/user/collect/collect',
		requiresAuth: true,
	},
	footprint: {
		name: '我的足迹',
		path: '/pages/user/footprint/footprint',
		requiresAuth: true,
	},
	coupon: {
		name: '我的优惠券',
		path: '/pages/user/coupon/coupon',
		requiresAuth: true,
	},
	myCouponDetail: {
		name: '优惠券详情',
		path: '/pages/user/coupon/myCoupon',
		requiresAuth: true,
	},
	couponList: {
		name: '领劵中心',
		path: '/pages/user/coupon/list',
		requiresAuth: true,
	},
	address: {
		name: '收货地址',
		path: '/pages/user/address/address',
		requiresAuth: true,
	},
	addressUpdate: {
		name: '收货地址管理',
		path: '/pages/user/address/update',
		requiresAuth: true,
	},
	virtualIndex: {
		name: '虚拟码',
		path: '/pages/user/virtual/virtual',
		requiresAuth: true,
	},
	virtualDetail: {
		name: '虚拟码详情',
		path: '/pages/user/virtual/detail',
		requiresAuth: true,
	},
	recharge: {
		name: '充值',
		path: '/pages/order/pay/recharge',
		requiresAuth: true,
	},
	account: {
		name: '账户',
		path: '/pages/user/account/index/index',
		requiresAuth: true,
	},
	creditsLog: {
		name: '账单',
		path: '/pages/user/account/creditsLog/creditsLog',
		requiresAuth: true,
	},
	integral: {
		name: '积分',
		path: '/pages/user/account/integral/integral',
		requiresAuth: true,
	},
	integralDetail: {
		name: '积分明细',
		path: '/pages/user/account/integral/log',
		requiresAuth: true,
	},
	level: {
		name: '会员等级',
		path: '/pages/user/account/level/level',
		requiresAuth: true,
	},
	set: {
		name: '设置',
		path: '/pages/user/set/set',
		requiresAuth: true,
	},
	signIn: {
		name: '签到',
		path: '/pages/user/signin/signin',
		requiresAuth: true,
	},

	avatarCropper: {
		name: '头像裁剪',
		path: '/pages/user/avatarCropper/index',
		requiresAuth: true,
	},
	authorization: {
		name: '授权',
		path: '/pages/set/authorization/list',
		requiresAuth: true,
	},
	feedbackDetail: {
		name: '反馈详情',
		path: '/pages/user/feedback/detail',
		requiresAuth: true,
	},
	feedbackList: {
		name: '我的反馈',
		path: '/pages/user/feedback/list',
		requiresAuth: true,
	},
	feedback: {
		name: '意见反馈',
		path: '/pages/user/feedback/feedback',
		requiresAuth: true,
	},
	feedbackCreate: {
		name: '意见反馈',
		path: '/pages/user/feedback/create',
		requiresAuth: true,
	},
	loading: {
		name: 'Loading加载动画',
		path: '/pages/user/loading/loading',
	},
	orderInvoice: {
		name: '开票历史',
		path: '/pages/user/invoice/orderInvoice',
		requiresAuth: true,
	},
	invoice: {
		name: '开票管理',
		path: '/pages/user/invoice/invoice',
		requiresAuth: true,
	},
	invoiceUpdate: {
		name: '开票管理',
		path: '/pages/user/invoice/update',
		requiresAuth: true,
	},
	memberLevelIndex: {
		name: '会员中心',
		path: '/pages/user/memberLevel/memberLevel',
		requiresAuth: true,
	},
	updateBook: {
		name: '快速录入书本',
		path: '/pages/user/updateBook/updateBook',
		requiresAuth: true,
	},

	refundIndex: {
		name: '售后服务',
		path: '/pages/order/refund/index',
		requiresAuth: true,
	},
	refundList: {
		name: '售后主页',
		path: '/pages/order/refund/list',
		requiresAuth: true,
	},
	refund: {
		name: '售后',
		path: '/pages/order/refund/refund',
		requiresAuth: true,
	},
	refundDetail: {
		name: '售后详情页',
		path: '/pages/order/refund/detail',
		requiresAuth: true,
	},
	refundShipping: {
		name: '售后物流信息填写',
		path: '/pages/order/refund/shipping/shipping',
		requiresAuth: true,
	},
	orderRefundApply: {
		name: '申请退款',
		path: '/pages/order/refund/apply',
		requiresAuth: true,
	},
	customerIndex: {
		name: '售后服务',
		path: '/pages/order/customer/index/index',
		requiresAuth: true,
	},
	evaluation: {
		name: '评价',
		path: '/pages/order/evaluation/evaluation',
		requiresAuth: true,
	},
	evaluationIndex: {
		name: '评价列表',
		path: '/pages/order/evaluation/index/index',
		requiresAuth: true,
	},
	evaluationDetail: {
		name: '评价详情',
		path: '/pages/order/evaluation/detail/detail',
		requiresAuth: true,
	},
	evaluationStatus: {
		name: '评价状态',
		path: '/pages/order/evaluation/status/status',
		requiresAuth: true,
	},
	orderItem: {
		name: '订单商品列表',
		path: '/pages/order/item',
		requiresAuth: true,
	},
	productExpressDetails: {
		name: '订单物流',
		path: '/pages/order/productExpressDetails/productExpressDetails',
		requiresAuth: true,
	},
	shippingReturn: {
		name: '退货物流',
		path: '/pages/order/shipping/return',
		requiresAuth: true,
	},
	distribution: {
		name: '分销商',
		path: '/pages/distribution/index/index',
		requiresAuth: true,
	},
	brokerage: {
		name: '我的佣金',
		path: '/pages/distribution/brokerage/brokerage',
		requiresAuth: true,
	},
	brokerageLog: {
		name: '佣金明细',
		path: '/pages/distribution/brokerage/log',
		requiresAuth: true,
	},
	distributionApply: {
		name: '申请推广员',
		path: '/pages/distribution/regional/apply/apply',
		requiresAuth: true,
	},
	distributionApplyAgncy: {
		name: '申请区域代理',
		path: '/pages/distribution/regional/apply/create',
		requiresAuth: true,
	},
	distributionApplyHistory: {
		name: '申请历史',
		path: '/pages/distribution/regional/apply/log',
		requiresAuth: true,
	},
	distributionRegionalApply: {
		name: '区域代理',
		path: '/pages/distribution/regional/apply',
		requiresAuth: true,
	},
	distributionSpread: {
		name: '裂变分销信息',
		path: '/pages/distribution/spread/spread',
		requiresAuth: true,
	},
	distributionStore: {
		name: '店铺分销信息',
		path: '/pages/distribution/store/store',
		requiresAuth: true,
	},
	distributionChild: {
		name: '分销团队',
		path: '/pages/distribution/child/child',
		requiresAuth: true,
	},
	distributionPromoterRecord: {
		name: '直推订单',
		path: '/pages/distribution/promoterRecord/promoterRecord',
		requiresAuth: true,
	},
	distributionQrcode: {
		name: '推广二维码',
		path: '/pages/distribution/qrcode/qrcode',
		requiresAuth: true,
	},
	bankAccount: {
		name: '提现账号',
		path: '/pages/distribution/bankAccount/bankAccount',
		requiresAuth: true,
	},
	bankAccountUpdate: {
		name: '提现账号管理',
		path: '/pages/distribution/bankAccount/update',
		requiresAuth: true,
	},
	brokerageCreate: {
		name: '提现',
		path: '/pages/distribution/brokerage/create',
		requiresAuth: true,
	},
	brokerageIndex: {
		name: '提现记录',
		path: '/pages/distribution/brokerage/index',
		requiresAuth: true,
	},
	distributionPoster: {
		name: '推广海报',
		path: '/pages/distribution/poster/poster',
		requiresAuth: true,
	},
	brokerageTransfer: {
		name: '佣金转赠',
		path: '/pages/distribution/brokerage/transfer',
		requiresAuth: true,
	},
	setPayPassword: {
		name: '设置支付密码',
		path: '/pages/user/setPayPassword/setPayPassword',
		requiresAuth: true,
	},
	warehouseRanking: {
		name: '排行榜',
		path: '/pages/distribution/warehouse/ranking',
	},
	brokerageTransferLog: {
		name: '佣金转赠记录',
		path: '/pages/distribution/brokerage/transferLog',
		requiresAuth: true,
	},
	warehouse: {
		name: '云仓',
		path: '/pages/distribution/warehouse/warehouse',
		requiresAuth: true,
	},
	warehousePromoterRecord: {
		name: '货款收益',
		path: '/pages/distribution/warehouse/promoterRecord',
		requiresAuth: true,
	},
	warehouseStockLog: {
		name: '库存记录',
		path: '/pages/distribution/warehouse/stockLog',
		requiresAuth: true,
	},
	warehouseProduct: {
		name: '库存管理',
		path: '/pages/distribution/warehouse/product',
		requiresAuth: true,
	},
	warehousePurchaseOrder: {
		name: '进货',
		path: '/pages/distribution/warehouse/purchaseOrder',
		requiresAuth: true,
	},
	warehousePickUpOrderCreate: {
		name: '进货信息',
		path: '/pages/distribution/warehouse/pickUpOrderCreate',
	},
	warehousePickUpOrder: {
		name: '提货',
		path: '/pages/distribution/warehouse/pickUpOrder',
		requiresAuth: true,
	},
	warehouseLevelLog: {
		name: '升级日志',
		path: '/pages/distribution/warehouse/levelLog',
		requiresAuth: true,
	},

	// 云账户
	yunzhanghuMemberExempted: {
		name: '上传免验证',
		path: '/pages/distribution/yunzhanghu/memberExempted/memberExempted',
		requiresAuth: true,
	},
	yunzhanghuMemberSign: {
		name: '上传免验证',
		path: '/pages/distribution/yunzhanghu/memberSign/memberSign',
		requiresAuth: true,
	},
	yunzhanghuMemberCard: {
		name: '云账户银行卡',
		path: '/pages/distribution/yunzhanghu/card/card',
		requiresAuth: true,
	},
	yunzhanghuMemberCardUpdate: {
		name: '云账户银行卡',
		path: '/pages/distribution/yunzhanghu/card/update',
		requiresAuth: true,
	},

	// 新国都
	yunhuotecMemberSign: {
		name: '用户签约',
		path: '/pages/distribution/yunhuotec/memberSign/memberSign',
		requiresAuth: true,
	},
	yunhuotecMemberCard: {
		name: '新国都银行卡',
		path: '/pages/distribution/yunhuotec/card/card',
		requiresAuth: true,
	},
	yunhuotecMemberCardUpdate: {
		name: '新国都银行卡',
		path: '/pages/distribution/yunhuotec/card/update',
		requiresAuth: true,
	},

	//allinpay
	allinpayCard: {
		name: '银行卡',
		path: '/pages/allinpay/card/card',
		requiresAuth: true,
	},
	allinpayWithdraw: {
		name: '提现',
		path: '/pages/allinpay/withdraw/withdraw',
		requiresAuth: true,
	},

	// share
	shareCollection: {
		name: '我的收藏',
		path: '/pages/public/share/collection/collection',
		requiresAuth: true,
	},
	shareIndex: {
		name: '发现',
		path: '/pages/share/share',
		requiresAuth: false,
	},
	shareList: {
		name: '列表',
		path: '/pages/public/share/list/list',
		requiresAuth: false,
	},
	shareCate: {
		name: '全部分类',
		path: '/pages/share/cate',
		requiresAuth: false,
	},
	shareDetail: {
		name: '详情',
		path: '/pages/public/share/detail/detail',
		requiresAuth: false,
	},
	protocol: {
		name: '关于',
		path: '/pages/common/protocol/protocol',
	},
	protocolDetail: {
		name: '协议',
		path: '/pages/common/protocol/detail',
	},
	weappPay: {
		name: '微信小程序支付',
		path: '/pages/user/money/weappPay',
	},
	weappSuccess: {
		name: '支付成功',
		path: '/pages/user/money/weappSuccess',
	},
	couponDetail: {
		name: '优惠券详情',
		path: '/pages/user/coupon/detail',
		requiresAuth: false,
	},
	// 测评
	testRecommendIndex: {
		name: '测评首页',
		path: '/pages/marketing/testRecommend/index/index',
	},
	testRecommendContent: {
		name: '测评题目',
		path: '/pages/marketing/testRecommend/content/content',
	},
	testRecommendScope: {
		name: '测评结果',
		path: '/pages/marketing/testRecommend/scope/scope',
	},
	//知识付费
	knowledgeIndex: {
		name: '知识付费首页',
		path: '/pages/marketing/knowledge/index/index',
	},
	knowledgeDetails: {
		name: '知识付费详情',
		path: '/pages/marketing/knowledge/details/details',
	},
	knowledgeContent: {
		name: '知识付费内容',
		path: '/pages/marketing/knowledge/content/content',
	},
	knowledgePay: {
		name: '支付页面',
		path: '/pages/order/pay/knowledgePay',
	},
	luckyWheelIndex: {
		name: '积分大转盘',
		path: '/pages/marketing/luckyWheel/index/index',
	},
	luckyWheelupdateAddress: {
		name: '填写收货地址',
		path: '/pages/marketing/luckyWheel/updateAddress/updateAddress',
	},
	luckyWheelWinList: {
		name: '中奖列表',
		path: '/pages/marketing/luckyWheel/winList/winList',
	},
	invitationIndex: {
		name: '推荐有礼',
		path: '/pages/marketing/invitation/index/index',
	},
	invitationPoster: {
		name: '推荐有礼分享海报',
		path: '/pages/marketing/invitation/poster/poster',
	},
	storeIndex: {
		name: '实体店首页',
		path: '/pages/store/index/index',
	},
	storeLuckyWheelIndex: {
		name: '大转盘',
		path: '/pages/store/luckyWheel/index/index',
	},
	storeLuckyWheelWinList: {
		name: '中奖列表',
		path: '/pages/store/luckyWheel/winList/winList',
		requiresAuth: true,
	},
	storeLuckyWheelVerify: {
		name: '实体店核销',
		path: '/pages/store/verify/verify',
		requiresAuth: true,
	},
};

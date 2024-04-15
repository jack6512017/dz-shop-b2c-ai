//商城营销API接口
export default {
	/* 砍价活动 */
	// 活动首页列表
	haggleIndex: '/shop/marketing/haggle/index',

	/* 砍价活动商品 */
	// 活动首页列表
	haggleProductIndex: '/shop/marketing/haggle-product/index',
	// 根据商品名称或编码模糊查询砍价商品
	haggleProductList: '/shop/marketing/haggle-product/list',

	/* 发起砍价 */
	// 创建砍价订单
	haggleLaunchBuildOrder: '/shop/marketing/haggle-launch/build-order',
	// 发起砍价
	haggleLaunchCreate: '/shop/marketing/haggle-launch/create',
	// 我发起的砍价列表
	haggleLaunchIndex: '/shop/marketing/haggle-launch/index',
	// 我发起的砍价列表
	haggleLaunchView: '/shop/marketing/haggle-launch/view',

	/* 好友砍价 */
	// 参与砍价
	hagglePartakeCreate: '/shop/marketing/haggle-partake/create',

	/* 组合套餐 */
	// 查看组合套餐
	combinationView: '/shop/marketing/combination/view',

	/* 优惠券 */
	// 领取优惠劵
	couponCreate: '/shop/marketing/coupon/create',
	//优惠券列表
	couponIndex: '/shop/marketing/coupon/index',
	// 优惠券列表 - 自定义装修使用
	couponList: '/shop/marketing/coupon/list',
	// 查看优惠券
	couponView: '/shop/marketing/coupon/view',
	// 我的优惠劵
	couponRecord: '/shop/marketing/coupon-record/index',

	/* 限时折扣活动 */
	// 活动中限时优惠列表
	discountIndex: '/shop/marketing/discount/index',
	// 未开始限时优惠列表
	discountSoon: '/shop/marketing/discount/soon',

	/* 限时折扣商品 */
	// 活动中限时优惠活动商品列表
	discountProductIndex: '/shop/marketing/discount-product/index',
	// 未结束限时优惠活动商品列表 - 自定义装修使用
	discountProductList: '/shop/marketing/discount-product/list',
	// 未开始限时优惠活动商品列表
	discountProductSoon: '/shop/marketing/discount-product/soon',

	/* 限量购 */
	// 未结束限量购列表
	limitedSoon: '/shop/marketing/limited/index',
	// 未结束限量购活动商品列表 - 自定义装修使用
	limitedList: '/shop/marketing/limited/list',

	/* 海报 */
	posterIndex: '/shop/marketing/poster/index',

	/* 积分签到 */
	// 获取连续签到排名
	signInContinueRanking: '/shop/marketing/sign-in/continue-ranking',
	// 获取用户签到信息，当月签到日志，之后日期签到奖励信息
	signInIndex: '/shop/marketing/sign-in/index',
	// 获取用户签到信息
	signInInfo: '/shop/marketing/sign-in/info',
	// 获取用户签到日志
	signInLog: '/shop/marketing/sign-in/log',
	// 	获取全部签到规则
	signInRule: '/shop/marketing/sign-in/rule',
	// 	获取之后日期签到奖励信息
	signInRuleFormat: '/shop/marketing/sign-in/rule-format',
	// 	签到
	signIn: '/shop/marketing/sign-in/sign-in',

	/* 拼团 */
	// 拼团列表
	joinBuyIndex: '/shop/marketing/join-buy/index',
	// 分组拼团列表
	joinBuyStateGroup: '/shop/marketing/join-buy/state-group',
	// 拼团明细
	joinBuyView: '/shop/marketing/join-buy/view',

	/* 拼团商品 */
	// 拼团商品列表
	joinBuyProductIndex: '/shop/marketing/join-buy-product/index',
	// 拼团商品列表（模糊查询）
	joinBuyProductList: '/shop/marketing/join-buy-product/list',

	/* 知识付费 */
	// 获取子分类
	knowledgeChildCates: '/shop/marketing/knowledge/child-cates',
	// 获取配置
	knowledgeConfig: '/shop/marketing/knowledge/config',
	// 内容是否已付费
	knowledgeContentIsPay: '/shop/marketing/knowledge/content-is-pay',
	// 知识付费列表
	knowledgeIndex: '/shop/marketing/knowledge/index',
	// 支付页面数据
	knowledgePayConfirm: '/shop/marketing/knowledge/pay-confirm',
	// 创建支付
	knowledgePaySubmit: '/shop/marketing/knowledge/pay-submit',
	// 获取顶级分类
	knowledgeTopCates: '/shop/marketing/knowledge/top-cates',
	// 单条知识付费
	knowledgeView: '/shop/marketing/knowledge/view',
	// 获取内容
	knowledgeViewContent: '/shop/marketing/knowledge/view-content',

	/* 测评项目 */
	// 	提交
	testRecommendAnswer: '/shop/marketing/test-recommend/answer',
	// 	测评项目列表
	testRecommendIndex: '/shop/marketing/test-recommend/index',
	// 	查看测评项目
	testRecommendView: '/shop/marketing/test-recommend/view',

	/* 积分大转盘 */
	// 大转盘信息
	luckyWheelIndex: '/shop/marketing/lucky-wheel/index',
	// 开始抽奖
	luckyWheelPlay: '/shop/marketing/lucky-wheel/play',
	// 修改实物奖品收货地址
	luckyWheelUpdateAddress: '/shop/marketing/lucky-wheel/update-address',
	// 我的中奖列表
	luckyWheelWinList: '/shop/marketing/lucky-wheel/win-list',

	// 推荐有礼详细
	invitationIndex: '/shop/marketing/invitation/index',
};

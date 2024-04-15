//支付
export default {
	/* 公用支付  */
	// 	获取支付配置
	payConfig: '/pay/pay/config',
	// 创建支付
	payCreate: '/pay/pay/create',
	// 	无登录支付
	payCreateNoAuth: '/pay/pay/create-no-auth',

	/* 支付订单 */
	//  查询支付订单
	payLogFindByOutTradeNo: '/pay/pay-log/find-by-out-trade-no',

	/* 云账户 */
	// 获取协议预览URL
	yunzhanghuMmemberSignContract: '/pay/yunzhanghu-member/sign-contract',
	// 用户签约
	yunzhanghuMmemberSign: '/pay/yunzhanghu-member/member-sign',
	// 上传免验证用户名单信息
	yunzhanghuMmemberExempted: '/pay/yunzhanghu-member/member-exempted',
	// 绑卡列表
	yunzhanghuMmemberCardIndex: '/pay/yunzhanghu-member-card/index',
	// 绑卡详情
	yunzhanghuMmemberCardView: '/pay/yunzhanghu-member-card/view',
	// 添加卡
	yunzhanghuMmemberCardCreate: '/pay/yunzhanghu-member-card/create',
	// 删除卡
	yunzhanghuMmemberCardDelete: '/pay/yunzhanghu-member-card/delete',

	/* 新国都 */
	// 用户签约
	yunhuotecMmemberSign: '/pay/yunhuotec-member/member-sign',
	// 绑卡列表
	yunhuotecMmemberCardIndex: '/pay/yunhuotec-member-card/index',
	// 绑卡详情
	yunhuotecMmemberCardView: '/pay/yunhuotec-member-card/view',
	// 添加卡
	yunhuotecMmemberCardCreate: '/pay/yunhuotec-member-card/create',
	// 修改
	yunhuotecMmemberCardUpdate: '/pay/yunhuotec-member-card/update',
	// 删除卡
	yunhuotecMmemberCardDelete: '/pay/yunhuotec-member-card/delete',
};

import $mAppConfig from './appConfig';

//商城配置
class Setting {
	constructor() {
		// 商城设置
		this.h5_url = $mAppConfig.h5Domain;
		this.store_name = ''; //店铺名称
		this.store_logo = ''; //店铺LOGO
		this.store_desc = ''; //店铺简介
		this.store_hot_line = ''; //客服电话
		this.store_province_id = 0; //店铺地址省
		this.store_city_id = 0; //店铺地址市
		this.store_area_id = 0; //店铺地址区
		this.store_address = ''; //店铺地址
		this.store_longitude = ''; //店铺地址经度
		this.store_latitude = ''; //店铺地址纬度
		this.store_refund_username = ''; //店铺售后联系人
		this.store_refund_mobile = ''; //店铺售后电话

		// 登录注册设置
		this.third_party_register = 0; //第三方注册绑定设置 0强制绑定手机，1非强制绑定手机，2后绑定手机
		this.app_agreement_default_select = 0; //协议默认选中 0不显示协议勾选框 1协议默认勾选 2协议默认不勾选
		this.mobile_show_apple_login = 0; //APP在IOS下是否显示苹果登录
		this.wechat_share_page_auto_login = 1; //公众号打开分享页面自动授权注册登录并绑定推荐人
		this.login_is_open = 1; //开放登录
		this.wechat_login_default = 1; //公众号默认登录模式 0:手机验证码登录,1:微信授权登录
		this.wechat_login_mode = [0]; //公众号登录方式
		this.mini_program_login_default = 1; //小程序默认登录模式 0:手机验证码登录,1:微信授权登录
		this.mini_program_login_mode = [0]; //小程序登录模式
		this.h5_login_default = 0; //H5默认登录模式 0:手机验证码登录
		this.h5_login_mode = [0]; //H5登录模式
		this.app_login_default = 0; //APP默认登录模式 0:手机验证码登录,1:微信授权登录,2:本机号码登录
		this.app_login_mode = [0]; //APP登录模式

		//三方登录配置
		this.login_qq_appid = ''; //QQ开放平台AppId
		this.login_sina_appid = ''; //新浪微博开放平台AppId
		this.login_wechat_appid = ''; //微信开放平台AppId
		this.login_github_appid = ''; //Github开放平台AppId

		// 会员设置
		this.member_parent_type = 1; // 会员锁粉方式（1:推荐注册;2:首次下单;3:首次付款）
		this.member_promo_code_type = 1; // 会员推荐码类型（1:时间戳生成唯一号;2:用户ID加密（大小写敏感）;3:指定值递增;4:使用用户ID）
		this.member_promo_code_add_value = 10000000; // 会员推荐码累加值
		this.member_show_parent = 0; // 默认推荐人（0代表不锁定）
		this.member_parent_lock = 0; // 是否显示推荐人（0:不显示;1:显示）
		this.member_level_show_type = 1; // 用户等级显示类型（1:会员等级;2:店铺分销等级;3:云仓等级）

		// 会员
		this.member_level_order_condition = 0; //用户等级升级订单条件 0付款后 1订单完成后

		// 购物设置
		this.order_auto_delivery = 7; // 自动收货时间(天)
		this.order_buy_close_time = 60; // 订单自动关闭时间(分钟)
		this.order_pickup_complete_status = 0; // 订单提货完成状态(0:订单收货状态;1:订单完成状态)
		this.order_delivery_complete_time = 14; // 订单完成时间(天)
		this.order_buy_min_pay_money = 0; // 订单下单最低支付金额
		this.evaluate_show = 1; // 用户主动评论后立即显示
		this.evaluate_day = 7; //系统默认评价时间(天)
		this.after_sale_date = 7; //售后设置(天)
		this.evaluate = ''; // 默认评价语
		this.order_refund_cancel_reapply = 0; // 用户取消售后后可重新申请
		this.order_invoice_is_open = 1; //订单发票是否开启

		// 产品分类配置
		this.product_cate_type = 1; // 商品分类类型(1:单选,2:多选)

		// 配送设置
		this.close_all_logistics = 0; //关闭全部配送方式
		this.is_open_logistics = 1; //开启物流配送
		this.buyer_self_lifting = 0; //开启买家自提
		this.is_logistics_query_open = 0; //开启物流查询
		this.pickup_point_fee = 0; //门店运费
		this.pickup_point_freight = 0; //满X免运费
		this.pickup_point_is_open = 0; //是否启用

		//物流配置
		this.logistics_type = 'aliyun'; //物流进度查询类型
		this.logistics_aliyun_subscribe_app_code = ''; //阿里云物流订阅-appcode

		// 发票设置
		this.order_invoice_tax = 0; //用户发票税率

		// 分类页面
		this.style_cate_type = '3-1'; //分类加载类型
		// 商城风格
		this.style_user_is_open = 0; //用户可自定义风格
		this.style_type = '3-1'; //店铺风格
		// 加载样式ok
		this.style_loading_is_open = 1; //页面加载开启
		this.style_loading_type = 'circle'; //页面加载类型

		// 关注引导
		this.style_attention_mini_program_name = ''; //小程序名称
		this.style_attention_mini_program_logo = ''; //小程序logo
		this.style_attention_official_account_name = ''; //公众号名称
		this.style_attention_official_account_qrcode = ''; //公众号二维码
		this.style_attention_app_guide = ''; //App引导页

		//商家地址
		this.merchant_address = ''; //联系方式
		this.merchant_name = ''; //收货地址
		this.merchant_mobile = ''; //收件人
		this.merchant_zip_code = ''; //邮编
		this.merchant_longitude_latitude = ''; //地址经纬度

		// 砍价设置
		this.haggle_end_date = 3; //设置发起活动后多长时间结束 单位：天
		this.haggle_pay_close_hours = 2; //砍价完成后多少小时内完成支付，否则关闭订单 单位：小时
		this.haggle_max_num = 1; //每个人帮助砍价最多次数
		this.haggle_day_max_num = 3; //每个用户每日最大砍价次数
		this.haggle_binding_time = 0; //商品砍价时间频率限制 单位：秒
		this.haggle_binding_time_num = 0; //商品砍价时间频率内最多可砍次数
		this.haggle_share_title = '我发现了好货,快来帮我砍价'; //砍价分享海报标题
		this.haggle_share_detail = '好物一起砍，省钱又开心'; //砍价详情分享说明

		// 限时折扣
		this.discount_share_title = '限时优惠活动进行中，速来围观'; //限时优惠分享标题

		// 拼团
		this.join_buy_poster_title = '邀请您参与拼团'; //拼团海报标题
		this.join_buy_share_title = '这里有好货，一起拼团吧'; //拼团分享标题
		this.join_buy_show_profile_tools = 0; //是否显示拼团订单入口

		// 商品海报
		this.product_poster_is_open = 0; //是否开启
		this.product_poster_qr_type = 'h5_qr'; //二维码显示类型
		this.product_share_title = '为您淘了一个好物，速来！'; //产品分享海报标题

		// 商品海报
		this.is_open_recharge = 1; //是否开启充值入口

		// 积分签到
		this.sign_in_is_open = 0; //积分签到开启
		this.sign_in_base_points = 1; //基础签到积分
		this.sign_in_days_cycle = 30; //连续签到周期

		// 积分抵现
		this.point_to_cash_is_open = 1; //是否开启积分抵现
		this.point_to_cash_convert_rate = 1.0; //积分抵现比率
		this.point_to_cash_desc = ''; //积分抵现描述

		// 积分兑换
		this.shopping_back_points = 3; // 购物返积分设置(1:订单已完成;2:已收货;3:支付完成;4:订单已发货)

		// 限量购配置表单
		this.limited_share_title = '分享给你一个限量秒杀产品，速抢'; //限量购分享标题

		// 版权信息
		this.copyright_logo = ''; //版权logo
		this.copyright_company_name = ''; //公司名称
		this.copyright_icp = ''; //ICP备案号
		this.copyright_url = ''; //工信部备案链接
		this.copyright_desc = ''; //自定义版权信息
		this.copyright_show = 0; //首页底部显示版权信息

		// 热门搜索
		this.hot_search_default = ''; //默认搜索
		this.hot_search_list = ''; //热门搜索

		// 站点维护
		this.is_open_site = 1; //开启站点
		this.close_site_date = ''; //关闭站点时间
		this.close_site_explain = ''; //关闭站点说明

		// // 微信公众号支付
		// this.pay_wechat_balance = 0;
		// this.pay_wechat_brokerage = 0;
		// this.pay_wechat_cash_against = 0;
		// this.pay_wechat_wechatpay = 0;
		// this.pay_wechat_wechatpay_mode = 1;
		// this.pay_wechat_wechatpay_option_id = 0;
		// this.pay_wechat_alipay = 0;
		// this.pay_wechat_alipay_mode = 1;
		// this.pay_wechat_alipay_option_id = 0;
		// this.pay_wechat_quick = 0;
		// this.pay_wechat_quick_mode = 2;
		// this.pay_wechat_quick_option_id = 0;
		// // 微信小程序支付
		// this.pay_miniprogram_balance = 0;
		// this.pay_miniprogram_brokerage = 0;
		// this.pay_miniprogram_cash_against = 0;
		// this.pay_miniprogram_wechatpay = 0;
		// this.pay_miniprogram_wechatpay_mode = 1;
		// this.pay_miniprogram_wechatpay_option_id = 0;
		// this.pay_miniprogram_quick = 0;
		// this.pay_miniprogram_quick_mode = 2;
		// this.pay_miniprogram_quick_option_id = 0;
		// // APP支付
		// this.pay_app_balance = 0;
		// this.pay_app_brokerage = 0;
		// this.pay_app_cash_against = 0;
		// this.pay_app_wechatpay = 0;
		// this.pay_app_wechatpay_mode = 1;
		// this.pay_app_wechatpay_option_id = 0;
		// this.pay_app_alipay = 0;
		// this.pay_app_alipay_mode = 1;
		// this.pay_app_alipay_option_id = 0;
		// this.pay_app_quick = 0;
		// this.pay_app_quick_mode = 2;
		// this.pay_app_quick_option_id = 0;
		// // H5支付
		// this.pay_h5_balance = 0;
		// this.pay_h5_brokerage = 0;
		// this.pay_h5_cash_against = 0;
		// this.pay_h5_wechatpay = 0;
		// this.pay_h5_wechatpay_mode = 1;
		// this.pay_h5_wechatpay_option_id = 0;
		// this.pay_h5_alipay = 0;
		// this.pay_h5_alipay_mode = 1;
		// this.pay_h5_alipay_option_id = 0;
		// this.pay_h5_quick = 0;
		// this.pay_h5_quick_mode = 2;
		// this.pay_h5_quick_option_id = 0;

		//     // 佣金转赠配置
		this.brokerage_transfer_is_open = 0; //佣金转账
		//     this.brokerage_transfer_is_audit = 0; //转账审核
		//     this.brokerage_transfer_lowest_money = 0; //最低转账额度
		//     this.brokerage_transfer_highest_money = 10000; //最高转账额度
		//     this.brokerage_transfer_max_count_daily = 10; //单日最高转账次数
		//     this.brokerage_transfer_fee_ratio = 0; //佣金转账手续费系数
		//     this.brokerage_transfer_single_fee = 0; //佣金转账单笔手续费用
		//     this.brokerage_transfer_free_fee = 0; //免手续费区间
		//     this.brokerage_transfer_desc = ''; //转账说明

		//     // 佣金提现基础配置
		//     this.brokerage_withdraw_is_open = 0; //佣金提现
		//     this.brokerage_withdraw_is_realname = 0; //实名一致
		//     this.brokerage_withdraw_lowest_money = 0; //最低提现额度
		//     this.brokerage_withdraw_highest_money = 10000; //最高提现额度
		//     this.brokerage_withdraw_max_count_daily = 10; //单日最高提现次数
		//     this.brokerage_withdraw_fee_ratio = 0; //佣金提现手续费系数
		//     this.brokerage_withdraw_single_fee = 0; //佣金提现单笔手续费用
		//     this.brokerage_withdraw_free_fee = 0; //免手续费区间
		//     this.brokerage_withdraw_desc = ''; //提现说明

		//     // 提现配置
		//     this.brokerage_withdraw_is_audit = 0; //提现审核
		//     this.brokerage_withdraw_mode = 0; //提现模式
		//     this.brokerage_withdraw_balance = 0; //提现方式-余额
		//     this.brokerage_withdraw_wechat = 0; //提现方式-微信
		//     this.brokerage_withdraw_wechat_method = 1; //提现方式-微信类型
		//     this.brokerage_withdraw_wechat_option_id = 0; //提现方式-微信类型-参数ID
		//     this.brokerage_withdraw_ali = 0; //提现方式-支付宝
		//     this.brokerage_withdraw_ali_method = 1; //提现方式-支付宝类型
		//     this.brokerage_withdraw_ali_option_id = 0; //提现方式-支付宝类型-参数ID
		//     this.brokerage_withdraw_union = 0; //提现方式-银行卡
		//     this.brokerage_withdraw_union_method = 1; //提现方式-银行卡类型
		//     this.brokerage_withdraw_union_option_id = 0; //提现方式-银行卡类型-参数ID

		// 消息通知
		this.notify_app_message = []; // 站内信
		this.notify_wechat_tmpl = []; // 微信公众号模板消息
		this.notify_miniprogram_sub = []; //小程序订阅消息
		this.notify_app_push = []; // APP推送

		// 客服类型
		this.app_service_type = 0; //客服模式  0不启用客服，1系统(预留) 2原生微信小程序客服 3芝麻小客服 4企业微信客服
		this.app_service_zmxkf_url = ''; //芝麻小客服url地址
		this.app_service_wxkf_url = ''; //企业微信客服url地址
		this.app_service_wxkf_id = ''; //微信客服企业ID

		// 前端文字
		this.balance_front_name = '余额'; //余额前端名称
		this.point_front_name = '积分'; //积分前端名称
		this.commission_front_name = '佣金'; //佣金前端名称

		// 公众号配置
		this.wechat_account = ''; //公众号账号
		this.wechat_id = ''; //原始ID
		this.wechat_appid = ''; //App ID
		this.wechat_token = ''; //Token
		this.wechat_qrcode = ''; //微信关注二维码

		// 小程序配置
		this.miniprogram_appid = ''; //App ID
		this.miniprogram_qrcode = ''; //小程序码展示

		// 验证码短信
		this.sms_code_length = 4; //短信验证码长度
		this.sms_strategies = 0; //多网关发送策略 0顺序发送 1随机发送

		// 分销
		this.promoter_regional_is_open = 0; // 区域分销是否开启
		this.apidata_isbn_member = [];
	}
}

export default new Setting();

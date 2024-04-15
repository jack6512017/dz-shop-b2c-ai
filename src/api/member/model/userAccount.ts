//会员账号相关API接口
export default {
	// 用户名密码登录
	usernamePasswordLogin: '/member/user-account/username-password-login',
	// 手机号密码登录
	mobilePasswordLogin: '/member/user-account/mobile-password-login',
	// 手机号验证码一键登录/自动注册
	mobileCodeLogin: '/member/user-account/mobile-code-login',
	//手机号注册，对应手机号密码登录方式
	mobileRegister: '/member/user-account/mobile-register',
	// 用户名注册，对应用户名密码登录方式
	usernameRegister: '/member/user-account/username-register',
	// 用户名+手机号注册，对应用户名密码或手机号密码登录方式
	usernameMobileRegister: '/member/user-account/username-mobile-register',
	// 微信公众号登录
	wechatLogin: '/member/user-account/wechat-login',
	// 微信公众号登录（需要立即绑定手机的场景）
	wechatLoginWithMobile: '/member/user-account/wechat-login-with-mobile',
	// 微信小程序登录，适用于微信小程序基础库2.27.1以下版本
	wechatMiniProgramLogin: '/member/user-account/wechat-mini-program-login',
	// 微信小程序获取用户信息 - 适用于微信小程序基础库2.27.1以及以上版本
	wechatMiniProgramV2GetUser: '/member/user-account/wechat-mini-program-v2-get-user',
	// 微信小程序登录 - 适用于微信小程序基础库2.27.1以及以上版本
	wechatMiniProgramV2Login: '/member/user-account/wechat-mini-program-v2-login',
	// 微信小程序登录（需要立即绑定手机的场景） - 适用于微信小程序基础库2.27.1以及以上版本
	wechatMiniProgramLoginWithMobile: '/member/user-account/wechat-mini-program-login-with-mobile',
	// 微信小程序绑定微信手机号
	wechatMiniProgramMobileBind: '/member/user-account/wechat-mini-program-mobile-bind',
	// APP端微信登录 - 安全模式
	wechatOpenPlatformLogin: '/member/user-account/wechat-open-platform-login',
	// APP端微信登录 - 安全模式（需要立即绑定手机的场景）
	wechatOpenPlatformLoginWithMobile: '/member/user-account/wechat-open-platform-login-with-mobile',
	// APP端微信登录 - 本地登录非安全模式，需要在客户端配置微信登录信息
	wechatOpenPlatformLocalLogin: '/member/user-account/wechat-open-platform-local-login',
	// APP端微信登录 - 本地登录非安全模式（需要立即绑定手机的场景）
	wechatOpenPlatformLocalLoginWithMobile: '/member/user-account/wechat-open-platform-local-login-with-mobile',
	// IOS登录 - 本地登录非安全模式，需要在客户端配置微信登录信息
	appleLocalLogin: '/member/user-account/apple-local-login',
	// IOS登录 - 本地登录非安全模式（需要立即绑定手机的场景）
	appleLocalLoginWithMobile: '/member/user-account/apple-local-login-with-mobile',
	// 绑定手机号
	mobileBind: '/member/user-account/mobile-bind',
	// 解绑手机号/验证原手机号
	mobileUnbind: '/member/user-account/mobile-unbind',
	// 	重绑定手机号
	mobileRebind: '/member/user-account/mobile-rebind',
	// 微信小程序更换微信手机号
	wechatMiniProgramMobileChange: '/member/user-account/wechat-mini-program-mobile-change',
	// 发送验证码短信
	smsCode: '/member/user-account/sms-code',
	// 修改密码/需要手机号验证码验证
	updatePassword: '/member/user-account/update-password',
	// 设置或修改支付密码/需要手机号验证码验证
	setPayPassword: '/member/user-account/set-pay-password',
	// 是否手机号可以注册或绑定，一般在发送验证码前调用
	isMobileRegister: '/member/user-account/is-mobile-register',
	// 刷新token
	refresh: '/member/user-account/refresh',
	// 	退出登录
	logout: '/member/user-account/logout',
	// 注销/删除账号
	logoff: '/member/user-account/logoff',
};

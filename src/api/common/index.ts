// 公共API接口
export default {
	/* 省市区 */
	// 获取省市区
	provincesIndex: '/common/provinces/index',
	/* 资源上传 */
	// 驱动配置
	fileDrive: '/common/file/drive',
	// 图片上传
	fileImages: 'common/file/images',
	// 视频上传
	fileVideos: '/common/file/videos',
	// 语音上传
	fileVoices: '/common/file/voices',
	// 文件上传
	fileFiles: '/common/file/files',
	// 证书上传
	fileCerts: '/common/file/certs',
	// 网站验证文件上传
	fileVerify: '/common/file/verify',
	// base64编码的图片上传
	fileBase64: '/common/file/base64',
	// oss直传配置
	fileOssAccredit: '/common/file/oss-accredit',
	/* 公用配置  */
	// 获取系统配置
	configIndex: '/common/config/index',
	/* 获取二维码 */
	// 生成临时关注微信公众号二维码
	wechatAttentionQrcode: '/common/qrcode/wechat-attention-qrcode',
	// 重新生成临时关注微信公众号二维码（必须是登录状态）
	wechatAttentionQrcodeReCreate: '/common/qrcode/wechat-attention-qrcode-re-create',
	// 	生成小程序码（有限制）
	wechatMiniProgramQrcodeByLink: '/common/qrcode/wechat-mini-program-qrcode-by-link',
	// 	生成小程序码（无限制）
	wechatMiniProgramQrcodeUnlimit: '/common/qrcode/wechat-mini-program-qrcode-unlimit',
	// 	注册微信公众号JSSDK
	wechatJsSdkIndex: '/common/wechat-js-sdk/index',
	// 获取客服未读消息数量，针对第三方客服
	customerServiceUnread: '/common/customer-service/unread',
	// 清空客服未读数量，针对第三方客服
	customerServiceClearUnread: '/common/customer-service/clear-unread',
	// 记录客户端错误日志
	clientLogIndex: '/common/client-log/index',
};

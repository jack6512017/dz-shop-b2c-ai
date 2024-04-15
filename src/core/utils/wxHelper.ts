//微信H5方法集合
import helper from '@/utils/helper';
import request from './http';
import apiCommon from '@/api/common';
// #ifdef H5
import jweixin from 'weixin-js-sdk';
// #endif
import { useUserStore } from '@/state/modules/user';

//微信配置注册
async function wxConfig(url: string) {
	// #ifdef H5
	const userStore = useUserStore();
	if (helper.h5IsWechat()) {
		//IOS只用注册一次
		if (helper.h5IsIosOrAndroid() == 'ios' && userStore.getIosWxConfig == true) {
			return;
		}
		//无能的微信必须加上onMenuShareAppMessage和onMenuShareTimeline，updateAppMessageShareData和updateTimelineShareData才起作用
		const jsApiList = JSON.stringify([
			'chooseWXPay',
			'scanQRCode',
			'openAddress',
			'updateAppMessageShareData',
			'updateTimelineShareData',
			'onMenuShareAppMessage',
			'onMenuShareTimeline',
		]);
		await request
			.post(apiCommon.wechatJsSdkIndex, {
				url: url,
				jsApiList, // 需要调用微信的原生方法
				debug: false, // 是否打开调试
			})
			.then((res) => {
				if (res.data && helper.isObject(res.data)) {
					jweixin.config({
						...res.data,
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
	userStore.setIosWxConfig(true);
	// #endif
}

//微信分享
async function wxShare(configUrl: string, title: string, desc: string, link: string, imgUrl: string) {
	// #ifdef H5
	if (!helper.h5IsWechat()) {
		return;
	}
	await wxConfig(configUrl);
	jweixin.ready(function () {
		jweixin.updateAppMessageShareData({
			title: title, // 分享标题
			desc: desc, // 分享描述
			link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: imgUrl, // 分享图标
			success: function () {
				// 用户确认分享后执行的回调函数
			},
			cancel: function () {
				// 用户取消分享后执行的回调函数
			},
		});
		jweixin.updateTimelineShareData({
			title: title, // 分享标题
			link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: imgUrl, // 分享图标
			success: function () {
				// 用户确认分享后执行的回调函数
			},
			cancel: function () {
				// 用户取消分享后执行的回调函数
			},
		});
		jweixin.onMenuShareAppMessage({
			title: title, // 分享标题
			desc: desc, // 分享描述
			link: link, // 分享链接
			imgUrl: imgUrl, // 分享图标
			success: function () {
				// 用户确认分享后执行的回调函数
			},
			cancel: function () {
				// 用户取消分享后执行的回调函数
			},
		});
		//分享到朋友圈
		jweixin.onMenuShareTimeline({
			title: title, // 分享标题
			link: link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
			imgUrl: imgUrl, // 分享图标
			success: function () {
				// 用户点击了分享后执行的回调函数
			},
		});
	});
	// #endif
}

// 视频播放
async function wxVideoPlay(configUrl: string, document: Element) {
	// #ifdef H5
	if (!helper.h5IsWechat()) {
		return;
	}
	await wxConfig(configUrl);
	jweixin.ready(function () {
		let video = document;
		video.play();
	});
	// #endif
}

export default {
	wxConfig,
	wxShare,
	wxVideoPlay,
};

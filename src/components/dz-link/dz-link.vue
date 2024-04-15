<template>
	<text class="dz-link" @tap.stop="openLink" :style="[linkStyle, api.addStyle(customStyle)]">{{ text }}</text>
</template>

<script lang="ts">
import props from './props';

/**
 * link 超链接
 * @description 该组件为超链接组件，在不同平台有不同表现形式：在APP平台会通过plus环境打开内置浏览器，在小程序中把链接复制到粘贴板，同时提示信息，在H5中通过window.open打开链接。
 * @tutorial https://www.uviewui.com/components/link.html
 * @property {String}			color		文字颜色 （默认 color['u-primary'] ）
 * @property {String ｜ Number}	fontSize	字体大小，单位px （默认 15 ）
 * @property {Boolean}			underLine	是否显示下划线 （默认 false ）
 * @property {String}			href		跳转的链接，要带上http(s)
 * @property {String}			mpTips		各个小程序平台把链接复制到粘贴板后的提示语（默认“链接已复制，请在浏览器打开”）
 * @property {String}			lineColor	下划线颜色，默认同color参数颜色
 * @property {String}			text		超链接的问题，不使用slot形式传入，是因为nvue下无法修改颜色
 * @property {Object}			customStyle	定义需要用到的外部样式
 *
 * @example <dz-link href="http://www.uviewui.com">蜀道难，难于上青天</dz-link>
 */

import { computed, defineComponent, nextTick } from 'vue';
import type { CSSProperties } from 'vue';

export default defineComponent({
	name: 'dz-link',
	props,
	emits: ['click'],
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props, emit) {
		const linkStyle = computed((): CSSProperties => {
			const style = {
				color: props.color,
				fontSize: uni.$api.addUnit(props.fontSize),
				textDecoration: props.underLine ? 'underline' : 'none',
			};
			return style;
		});

		function openLink() {
			// #ifdef APP-PLUS
			plus.runtime.openURL(props.href);
			// #endif
			// #ifdef H5
			window.open(props.href);
			// #endif
			// #ifdef MP
			uni.setClipboardData({
				data: props.href,
				success: () => {
					uni.hideToast();
					nextTick(() => {
						uni.$api.toast(props.mpTips);
					});
				},
			});
			// #endif
			emit('click');
		}

		return {
			openLink,
			linkStyle,
		};
	},
});
</script>

<style lang="scss" scoped>
$dz-link-line-height: 1 !default;

.dz-link {
	/* #ifndef APP-NVUE */
	line-height: $dz-link-line-height;
	/* #endif */
}
</style>

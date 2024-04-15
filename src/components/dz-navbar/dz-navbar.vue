<template>
	<view class="">
		<view class="dz-navbar" :style="[navbarStyle]" :class="{ 'dz-navbar-fixed': isFixed, 'dz-border-bottom': borderBottom }">
			<view class="dz-status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="dz-navbar-inner" :style="[navbarInnerStyle]">
				<view class="dz-back-wrap" v-if="isBack" @tap="goBack">
					<view class="dz-icon-wrap">
						<dz-icon :name="backIconName" :color="backIconColor" :size="backIconSize"></dz-icon>
					</view>
					<view class="dz-icon-wrap dz-back-text dz-line-1" v-if="backText" :style="[backTextStyle]">{{ backText }}</view>
				</view>
				<view class="dz-slot-left">
					<slot name="left"></slot>
				</view>
				<view class="dz-navbar-content-title" v-if="title" :style="[titleStyle]">
					<view
						class="dz-title dz-line-1"
						:style="{
							color: titleColor,
							fontSize: titleSize + 'rpx',
							fontWeight: titleBold ? 'bold' : 'normal',
						}"
					>
						{{ title }}
					</view>
				</view>
				<view class="dz-slot-content">
					<slot></slot>
				</view>
				<view class="dz-slot-right">
					<slot name="right"></slot>
				</view>
			</view>
		</view>
		<!-- 解决fixed定位后导航栏塌陷的问题 -->
		<view
			class="dz-navbar-placeholder"
			v-if="isFixed && !immersive"
			:style="{ width: '100%', height: Number(navbarHeight) + statusBarHeight + 'px' }"
		></view>
	</view>
</template>

<script lang="ts">
// #ifdef MP-WEIXIN
export default { options: { virtualHost: true } };
// #endif
</script>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import type { CSSProperties } from 'vue';

// 获取系统状态栏的高度
let systemInfo = uni.getSystemInfoSync();
let menuButtonInfo = {};
// 如果是小程序，获取右上角胶囊的尺寸信息，避免导航栏右侧内容与胶囊重叠(支付宝小程序非本API，尚未兼容)
// #ifdef MP-WEIXIN || MP-BAIDU || MP-TOUTIAO || MP-QQ
menuButtonInfo = uni.getMenuButtonBoundingClientRect();
// #endif
/**
 * navbar 自定义导航栏
 * @description 此组件一般用于在特殊情况下，需要自定义导航栏的时候用到，一般建议使用uniapp自带的导航栏。
 * @property {String Number} height 导航栏高度(不包括状态栏高度在内，内部自动加上)，注意这里的单位是px（默认44）
 * @property {String} back-icon-color 左边返回图标的颜色（默认#606266）
 * @property {String} back-icon-name 左边返回图标的名称，只能为自带的图标（默认arrow-left）
 * @property {String Number} back-icon-size 左边返回图标的大小，单位rpx（默认30）
 * @property {String} back-text 返回图标右边的辅助提示文字
 * @property {Object} back-text-style 返回图标右边的辅助提示文字的样式，对象形式（默认{ color: '#606266' }）
 * @property {String} back-relauch-url H5或者小程序打开指定页面后页面栈为1，这时候无法跳转到上一页，当页面栈为1的时候点击后退按钮跳转到的页面地址
 * @property {String} title 导航栏标题，如设置为空字符，将会隐藏标题占位区域
 * @property {String Number} title-width 导航栏标题的最大宽度，内容超出会以省略号隐藏，单位rpx（默认250）
 * @property {String} title-color 标题的颜色（默认#606266）
 * @property {String Number} title-size 导航栏标题字体大小，单位rpx（默认32）
 * @property {Function} custom-back 自定义返回逻辑方法
 * @property {String Number} z-index 固定在顶部时的z-index值（默认980）
 * @property {Boolean} is-back 是否显示导航栏左边返回图标和辅助文字（默认true）
 * @property {Object} background 导航栏背景设置，见官网说明（默认{ background: '#ffffff' }）
 * @property {Boolean} is-fixed 导航栏是否固定在顶部（默认true）
 * @property {Boolean} immersive 沉浸式，允许fixed定位后导航栏塌陷，仅fixed定位下生效（默认false）
 * @property {Boolean} border-bottom 导航栏底部是否显示下边框，如定义了较深的背景颜色，可取消此值（默认true）
 * @example <dz-navbar back-text="返回" title="剑未配妥，出门已是江湖"></dz-navbar>
 */
const props = defineProps({
	// 导航栏高度，单位px，非rpx
	height: {
		type: [String, Number],
		default: '',
	},
	// 返回箭头的颜色
	backIconColor: {
		type: String,
		default: '#606266',
	},
	// 左边返回的图标
	backIconName: {
		type: String,
		default: 'back_light',
	},
	// 左边返回图标的大小，rpx
	backIconSize: {
		type: [String, Number],
		default: '44',
	},
	// 返回的文字提示
	backText: {
		type: String,
		default: '',
	},
	// 返回的文字的 样式
	backTextStyle: {
		type: Object,
		default() {
			return {
				color: '#606266',
			};
		},
	},
	// H5或者小程序打开指定页面后页面栈为1，这时候无法跳转到上一页，当页面栈为1的时候点击后退按钮跳转到的页面地址
	backRelaunchUrl: {
		type: String,
		default: '',
	},
	// 导航栏标题
	title: {
		type: String,
		default: '',
	},
	// 标题的宽度，如果需要自定义右侧内容，且右侧内容很多时，可能需要减少这个宽度，单位rpx
	titleWidth: {
		type: [String, Number],
		default: '250',
	},
	// 标题的颜色
	titleColor: {
		type: String,
		default: '#606266',
	},
	// 标题字体是否加粗
	titleBold: {
		type: Boolean,
		default: false,
	},
	// 标题的字体大小
	titleSize: {
		type: [String, Number],
		default: 32,
	},
	isBack: {
		type: [Boolean, String],
		default: true,
	},
	// 对象形式，因为用户可能定义一个纯色，或者线性渐变的颜色
	background: {
		type: Object,
		default() {
			return {
				background: '#ffffff',
			};
		},
	},
	// 导航栏是否固定在顶部
	isFixed: {
		type: Boolean,
		default: true,
	},
	// 是否沉浸式，允许fixed定位后导航栏塌陷，仅fixed定位下生效
	immersive: {
		type: Boolean,
		default: false,
	},
	// 是否显示导航栏的下边框
	borderBottom: {
		type: Boolean,
		default: true,
	},
	zIndex: {
		type: [String, Number],
		default: '',
	},
	// 自定义返回逻辑
	customBack: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['back']);

const data = reactive({
	menuButtonInfo: menuButtonInfo,
	statusBarHeight: systemInfo.statusBarHeight,
});

// 导航栏内部盒子的样式
const navbarInnerStyle = computed((): CSSProperties => {
	let style = {};
	// 导航栏宽度，如果在小程序下，导航栏宽度为胶囊的左边到屏幕左边的距离
	style.height = navbarHeight.value + 'px';
	// // 如果是各家小程序，导航栏内部的宽度需要减少右边胶囊的宽度
	// #ifdef MP
	let rightButtonWidth = systemInfo.windowWidth - data.menuButtonInfo.left;
	style.marginRight = rightButtonWidth + 'px';
	// #endif
	return style;
});

// 整个导航栏的样式
const navbarStyle = computed((): CSSProperties => {
	let style = {};
	style.zIndex = props.zIndex ? props.zIndex : uni.$api.zIndex.navbar;
	// 合并用户传递的背景色对象
	Object.assign(style, props.background);
	return style;
});

// 导航中间的标题的样式
const titleStyle = computed((): CSSProperties => {
	let style = {};
	// #ifndef MP
	style.left = (systemInfo.windowWidth - uni.upx2px(props.titleWidth)) / 2 + 'px';
	style.right = (systemInfo.windowWidth - uni.upx2px(props.titleWidth)) / 2 + 'px';
	// #endif
	// #ifdef MP
	// 此处是为了让标题显示区域即使在小程序有右侧胶囊的情况下也能处于屏幕的中间，是通过绝对定位实现的
	let rightButtonWidth = systemInfo.windowWidth - data.menuButtonInfo.left;
	style.left = (systemInfo.windowWidth - uni.upx2px(props.titleWidth)) / 2 + 'px';
	style.right = rightButtonWidth - (systemInfo.windowWidth - uni.upx2px(props.titleWidth)) / 2 + rightButtonWidth + 'px';
	// #endif
	style.width = uni.upx2px(props.titleWidth) + 'px';
	return style;
});

// 转换字符数值为真正的数值
const navbarHeight = computed((): CSSProperties => {
	// #ifdef APP-PLUS || H5
	return props.height ? props.height : 44;
	// #endif
	// #ifdef MP
	// 小程序特别处理，让导航栏高度 = 胶囊高度 + 两倍胶囊顶部与状态栏底部的距离之差(相当于同时获得了导航栏底部与胶囊底部的距离)
	// 此方法有缺陷，暂不用(会导致少了几个px)，采用直接固定值的方式
	// return menuButtonInfo.height + (menuButtonInfo.top - this.statusBarHeight) * 2;//导航高度
	let height = systemInfo.osName == 'ios' ? 44 : 48;
	return props.height ? props.height : height;
	// #endif
});

function goBack() {
	// 如果自定义了点击返回按钮的事件
	if (props.customBack) {
		console.log('dz-navbar customback');
		emit('back');
	} else {
		// 获取当前页面栈，如果页面栈为1，则直接跳转到首页
		let pages = getCurrentPages();

		console.log('pages.length:' + pages.length);

		let indexPage = props.backRelaunchUrl ? props.backRelaunchUrl : uni.$api.appConfig.indexPath;
		if (pages.length == 1) {
			console.log('dz-navbar reLaunch to', indexPage);
			uni.reLaunch({
				url: indexPage,
			});
		} else {
			console.log('dz-navbar navigateBack');
			uni.navigateBack({
				delta: 1,
				fail(result) {
					console.log('dz-navbar navigateBack fail:', result);
				},
			});
		}
	}
}

const { statusBarHeight } = { ...toRefs(data) };
</script>

<style scoped lang="scss">
@import '../libs/css/components';

.dz-navbar {
	width: 100%;
}

.dz-navbar-fixed {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	z-index: 991;
}

.dz-status-bar {
	width: 100%;
}

.dz-navbar-inner {
	@include flex;
	justify-content: space-between;
	position: relative;
	align-items: center;
}

.dz-back-wrap {
	@include flex;
	align-items: center;
	flex: 1;
	flex-grow: 0;
	padding: 14rpx 14rpx 14rpx 24rpx;
}

.dz-back-text {
	padding-left: 4rpx;
	font-size: 30rpx;
}

.dz-navbar-content-title {
	@include flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	position: absolute;
	left: 0;
	right: 0;
	height: 60rpx;
	text-align: center;
	flex-shrink: 0;
}

.dz-navbar-centent-slot {
	flex: 1;
}

.dz-title {
	line-height: 60rpx;
	font-size: 32rpx;
	flex: 1;
}

.dz-navbar-right {
	flex: 1;
	@include flex;
	align-items: center;
	justify-content: flex-end;
}

.dz-slot-content {
	flex: 1;
	@include flex;
	align-items: center;
}
</style>

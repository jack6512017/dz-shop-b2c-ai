<template>
	<view class="dz-tabbar-wrapper">
		<view
			class="dz-tabbar-wrapper__content"
			ref="dzTabbaContentRef"
			@touchmove.stop.prevent="noop"
			:class="[border && 'dz-border-top', fixed && 'dz-tabbar-wrapper--fixed']"
			:style="[tabbarStyle]"
		>
			<view class="dz-tabbar-wrapper__content__item-wrapper">
				<slot />
			</view>
			<dz-safe-bottom v-if="safeAreaInsetBottom"></dz-safe-bottom>
		</view>
		<view
			class="dz-tabbar-wrapper__placeholder"
			v-if="placeholder"
			:style="{
				height: placeholderHeight + 'px',
			}"
		></view>
	</view>
</template>

<script lang="ts">
import props from './props';
// #ifdef APP-NVUE
const dom = uni.requireNativePlugin('dom');
// #endif
/**
 * Tabbar 底部导航栏
 * @description 此组件提供了自定义tabbar的能力。
 * @tutorial https://www.uviewui.com/components/tabbar.html
 * @property {String | Number}	value				当前匹配项的name
 * @property {Boolean}			safeAreaInsetBottom	是否为iPhoneX留出底部安全距离（默认 true ）
 * @property {Boolean}			border				是否显示上方边框（默认 true ）
 * @property {String | Number}	zIndex				元素层级z-index（默认 1 ）
 * @property {String}			activeColor			选中标签的颜色（默认 '#1989fa' ）
 * @property {String}			inactiveColor		未选中标签的颜色（默认 '#7d7e80' ）
 * @property {Boolean}			fixed				是否固定在底部（默认 true ）
 * @property {Boolean}			placeholder			fixed定位固定在底部时，是否生成一个等高元素防止塌陷（默认 true ）
 * @property {Object}			customStyle			定义需要用到的外部样式
 *
 * @example <dz-tabbar-wrapper :value="value2" :placeholder="false" @change="name => value2 = name" :fixed="false" :safeAreaInsetBottom="false"><dz-tabbar-item text="首页" icon="home" dot ></dz-tabbar-item></dz-tabbar-wrapper>
 */

import { ref, onMounted, watch, computed, defineComponent, getCurrentInstance } from 'vue';
import type { CSSProperties } from 'vue';

export default defineComponent({
	name: 'dz-tabbar-wrapper',
	props,
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props) {
		const { proxy } = getCurrentInstance();
		const dzTabbaContentRef = ref(null);
		const children = ref([]);
		const placeholderHeight = ref<number>(0);
		const tabbarStyle = computed((): CSSProperties => {
			const style = {
				zIndex: props.zIndex,
			};
			// 合并来自父组件的customStyle样式
			return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
		});

		// 监听多个参数的变化
		watch(
			() => [props.value, props.activeColor, props.inactiveColor],
			() => {
				updateChildren();
			}
		);

		watch(
			() => [props.fixed, props.placeholder],
			() => {
				setPlaceholderHeight();
			}
		);

		onMounted(() => {
			setPlaceholderHeight();
		});

		function updateChildren() {
			// 如果存在子元素，则执行子元素的updateFromParent进行更新数据
			children.value.length && children.value.map((child) => child.updateFromParent());
		}
		// 设置用于防止塌陷元素的高度
		async function setPlaceholderHeight() {
			if (!props.fixed || !props.placeholder) return;
			// 延时一定时间
			await uni.$api.sleep(20);
			// #ifndef APP-NVUE
			uni.$api.getRect('.dz-tabbar-wrapper__content', false, proxy).then(({ height = 50 }) => {
				// 修复IOS safearea bottom 未填充高度
				placeholderHeight.value = height;
			});
			// #endif

			// #ifdef APP-NVUE
			dom.getComponentRect(dzTabbaContentRef.value, (res) => {
				const { size } = res;
				placeholderHeight.value = size.height;
			});
			// #endif
		}

		// 阻止事件冒泡
		function preventEvent(e) {
			e && typeof e.stopPropagation === 'function' && e.stopPropagation();
		}

		// 空操作
		function noop(e) {
			preventEvent(e);
		}

		return {
			children,
			noop,
			tabbarStyle,
			placeholderHeight,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-tabbar-wrapper {
	@include flex(column);
	flex: 1;
	justify-content: center;

	&__content {
		@include flex(column);
		background-color: #fff;

		&__item-wrapper {
			height: 50px;
			@include flex(row);
		}
	}

	&--fixed {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
	}
	&__placeholder {
		display: flex;
	}
}
</style>

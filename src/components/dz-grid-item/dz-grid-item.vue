<template>
	<!-- #ifndef APP-NVUE -->
	<view class="dz-grid-item" hover-class="dz-grid-item--hover-class" :hover-stay-time="200" @tap="clickHandler" :class="classes" :style="[itemStyle]">
		<slot />
	</view>
	<!-- #endif -->
	<!-- #ifdef APP-NVUE -->
	<view class="dz-grid-item" :hover-stay-time="200" @tap="clickHandler" :class="classes" :style="[itemStyle]">
		<slot />
	</view>
	<!-- #endif -->
</template>

<script lang="ts">
import props from './props';
/**
 * gridItem 提示
 * @description 宫格组件一般用于同时展示多个同类项目的场景，可以给宫格的项目设置徽标组件(badge)，或者图标等，也可以扩展为左右滑动的轮播形式。搭配dz-grid使用
 * @tutorial https://www.uviewui.com/components/grid.html
 * @property {String | Number}	name		宫格的name ( 默认 null )
 * @property {String}			bgColor		宫格的背景颜色 （默认 'transparent' ）
 * @property {Object}			customStyle	自定义样式，对象形式
 * @event {Function} click 点击宫格触发
 * @example <dz-grid-item></dz-grid-item>
 */

import { ref, reactive, onMounted, onUnmounted, computed, getCurrentInstance, defineComponent, nextTick } from 'vue';
import type { CSSProperties } from 'vue';

export default defineComponent({
	name: 'dz-grid-item',
	props,
	emits: ['click'],
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();
		const parentData = reactive({
			col: 3, // 父组件划分的宫格数
			border: true, // 是否显示边框，根据父组件决定
		});
		// #ifdef APP-NVUE
		const width = ref<number>(0); // nvue下才这么计算，vue下放到computed中，否则会因为延时造成闪烁
		// #endif
		const classes = ref([]); // 类名集合，用于判断是否显示右边和下边框
		onMounted(() => {
			init();
		});
		// #ifndef APP-NVUE
		const width = computed(() => {
			return 100 / Number(parentData.col) + '%';
		});
		// #endif

		const itemStyle = computed((): CSSProperties => {
			const style = {
				background: props.bgColor,
				width: width.value,
			};
			return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
		});

		function init() {
			// 用于在父组件dz-grid的children中被添加入子组件时，
			// 重新计算item的边框
			uni.$on('$dzGridItem', () => {
				gridItemClasses();
			});
			// 父组件的实例
			updateParentData();
			// #ifdef APP-NVUE
			// 获取元素该有的长度，nvue下要延时才准确
			nextTick(function () {
				getItemWidth();
			});
			// #endif
			// 发出事件，通知所有的grid-item都重新计算自己的边框
			uni.$emit('$dzGridItem');
			gridItemClasses();
		}

		// 获取父组件的参数
		function updateParentData() {
			// 此方法写在mixin中
			getParentData('dz-grid');
		}

		function clickHandler() {
			let name = props.name;
			// 如果没有设置name属性，历遍父组件的children数组，判断当前的元素是否和本实例this相等，找出当前组件的索引
			const children = proxy.parent?.children;
			if (children && props.name === null) {
				name = children.findIndex((child) => child === proxy);
			}
			// 调用父组件方法，发出事件
			proxy.parent && proxy.parent.childClick(name);
			emit('click', name);
		}

		async function getItemWidth() {
			// 如果是nvue，不能使用百分比，只能使用固定宽度
			let _width = 0;
			if (proxy.parent) {
				// 获取父组件宽度后，除以栅格数，得出每个item的宽度
				const parentWidth = await getParentWidth();
				_width = parentWidth / Number(parentData.col) + 'px';
			}
			width.value = _width;
		}

		// 获取父元素的尺寸
		function getParentWidth() {
			// #ifdef APP-NVUE
			// 返回一个promise，让调用者可以用await同步获取
			const dom = uni.requireNativePlugin('dom');
			return new Promise((resolve) => {
				// 调用父组件的ref
				dom.getComponentRect(proxy.parent.dzGridRef.value, (res) => {
					resolve(res.size.width);
				});
			});
			// #endif
		}

		function gridItemClasses() {
			if (parentData.border) {
				let _classes = [];
				proxy.parent.children.map((child, index) => {
					if (proxy === child) {
						const len = proxy.parent.children.length;
						// 贴近右边屏幕边沿的child，并且最后一个（比如只有横向2个的时候），无需右边框
						if ((index + 1) % parentData.col !== 0 && index + 1 !== len) {
							_classes.push('dz-border-right');
						}
						// 总的宫格数量对列数取余的值
						// 如果取余后，值为0，则意味着要将最后一排的宫格，都不需要下边框
						const lessNum = len % parentData.col === 0 ? parentData.col : len % parentData.col;
						// 最下面的一排child，无需下边框
						if (index < len - lessNum) {
							_classes.push('dz-border-bottom');
						}
					}
				});
				// 支付宝，头条小程序无法动态绑定一个数组类名，否则解析出来的结果会带有","，而导致失效
				// #ifdef MP-ALIPAY || MP-TOUTIAO
				_classes = _classes.join(' ');
				// #endif
				classes.value = _classes;
			}
		}

		function getParentData(parentName = '') {
			// 避免在created中去定义parent变量
			let parent = {};
			if (!parent) parent = {};
			// 这里的本质原理是，通过获取父组件实例(也即类似dz-radio的父组件dz-radio-group的this)
			// 将父组件this中对应的参数，赋值给本组件(dz-radio的this)的parentData对象中对应的属性
			// 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
			// 此处并不会自动更新子组件的数据，而是依赖父组件dz-radio-group去监听data的变化，手动调用更新子组件的方法去重新获取
			const _proxy = proxy;
			parent = $parent.call(_proxy, parentName);
			if (parent.children) {
				// 如果父组件的children不存在本组件的实例，才将本实例添加到父组件的children中
				parent.children.indexOf(proxy) === -1 && parent.children.push(proxy);
			}
			if (parent && parentData) {
				// 历遍parentData中的属性，将parent中的同名属性赋值给parentData
				Object.keys(parentData).map((key) => {
					parentData[key] = parent[key];
				});
			}
		}

		/**
							* @description 获取父组件的参数，因为支付宝小程序不支持provide/inject的写法
										this.$parent在非H5中，可以准确获取到父组件，但是在H5中，需要多次this.$parent.$parent.xxx
										这里默认值等于undefined有它的含义，因为最顶层元素(组件)的$parent就是undefined，意味着不传name
										值(默认为undefined)，就是查找最顶层的$parent
							*  @param {string|undefined} name 父组件的参数名
							*/
		function $parent(name = undefined) {
			let parent = proxy?.$parent;
			// 通过while历遍，这里主要是为了H5需要多层解析的问题
			while (parent) {
				// 父组件
				if (parent.$options && parent.$options.name !== name) {
					// 如果组件的name不相等，继续上一级寻找
					parent = parent.$parent;
				} else {
					return parent;
				}
			}
			return false;
		}

		onUnmounted(() => {
			// 移除事件监听，释放性能
			uni.$off('$dzGridItem');
		});

		return {
			clickHandler,
			classes,
			itemStyle,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';
$dz-grid-item-hover-class-opcatiy: 0.5 !default;
$dz-grid-item-margin-top: 1rpx !default;
$dz-grid-item-border-right-width: 0.5px !default;
$dz-grid-item-border-bottom-width: 0.5px !default;
$dz-grid-item-border-right-color: $dz-border-color !default;
$dz-grid-item-border-bottom-color: $dz-border-color !default;
.dz-grid-item {
	align-items: center;
	justify-content: center;
	position: relative;
	flex-direction: column;
	/* #ifndef APP-NVUE */
	box-sizing: border-box;
	display: flex;
	/* #endif */

	/* #ifdef MP */
	position: relative;
	float: left;
	/* #endif */

	/* #ifdef MP-WEIXIN */
	margin-top: $dz-grid-item-margin-top;

	/* #endif */

	&--hover-class {
		opacity: $dz-grid-item-hover-class-opcatiy;
	}
}

.dz-grid-item2 {
	/* #ifdef MP-WEIXIN */
	flex: 1;

	/* #endif */
}

/* #ifdef APP-NVUE */
// 由于nvue不支持组件内引入app.vue中再引入的样式，所以需要写在这里
.dz-border-right {
	border-right-width: $dz-grid-item-border-right-width;
	border-color: $dz-grid-item-border-right-color;
}

.dz-border-bottom {
	border-bottom-width: $dz-grid-item-border-bottom-width;
	border-color: $dz-grid-item-border-bottom-color;
}

/* #endif */
</style>

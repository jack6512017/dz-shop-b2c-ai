<template>
	<view class="dz-tabbar-item" :style="[api.addStyle(customStyle)]" @tap="clickHandler">
		<view class="dz-tabbar-item__icon">
			<dz-icon v-if="icon" :name="icon" :color="isActive ? parentData.activeColor : parentData.inactiveColor" :size="40"></dz-icon>
			<template v-else>
				<slot v-if="isActive" name="active-icon" />
				<slot v-else name="inactive-icon" />
			</template>
			<dz-badge
				:count="badge"
				:is-dot="dot"
				v-if="badge"
				:offset="[-2, getOffsetRight(badge, dot)]"
				:bgColor="badgeBgColor"
				:color="badgeColor"
			></dz-badge>
		</view>

		<slot name="text">
			<text
				class="dz-tabbar-item__text"
				:style="{
					color: isActive ? parentData.activeColor : parentData.inactiveColor,
					fontSize: `${fontSize}rpx`,
				}"
				>{{ text }}</text
			>
		</slot>
	</view>
</template>

<script lang="ts">
import props from './props';
/**
 * TabbarItem 底部导航栏子组件
 * @description 此组件提供了自定义tabbar的能力。
 * @tutorial https://www.uviewui.com/components/tabbar.html
 * @property {String | Number}	name		item标签的名称，作为与dz-tabbar的value参数匹配的标识符
 * @property {String}			icon		内置图标或者绝对路径的图片
 * @property {String | Number}	badge		右上角的角标提示信息
 * @property {Boolean}			dot			是否显示圆点，将会覆盖badge参数（默认 false ）
 * @property {String}			text		描述文本
 * @property {Object | String}	badgeStyle	控制徽标的位置，对象或者字符串形式，可以设置top和right属性（默认 'top: 6px;right:2px;' ）
 * @property {Object}			customStyle	定义需要用到的外部样式
 *
 * @example <dz-tabbar :value="value2" :placeholder="false" @change="name => value2 = name" :fixed="false" :safeAreaInsetBottom="false"><dz-tabbar-item text="首页" icon="home" dot ></dz-tabbar-item></dz-tabbar>
 */

import { reactive, getCurrentInstance, defineComponent, nextTick, toRefs } from 'vue';

export default defineComponent({
	name: 'dz-tabbar-item',
	props,
	emit: ['click', 'change'],
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();
		const data = reactive({
			isActive: false, // 是否处于激活状态
			parentData: {
				value: null,
				activeColor: '',
				inactiveColor: '',
			},
		});
		init();

		function init() {
			// 支付宝小程序不支持provide/inject，所以使用这个方法获取整个父组件，在onMounted定义，避免循环引用
			updateParentData();

			if (!proxy.parent) {
				uni.$api.error('dz-tabbar-item必须搭配dz-tabbar组件使用');
			}

			// 本子组件在dz-tabbar的children数组中的索引
			const index = proxy?.parent?.children.indexOf(proxy);
			// 判断本组件的name(如果没有定义name，就用index索引)是否等于父组件的value参数
			data.isActive = (props.name || index) === data.parentData.value;
		}
		function updateParentData() {
			getParentData('dz-tabbar-wrapper');
		}
		// 此方法将会被父组件dz-tabbar调用
		function updateFromParent() {
			// 重新初始化
			init();
		}
		function clickHandler() {
			nextTick(() => {
				const index = proxy.parent.children.indexOf(proxy);
				const name = props.name || index;
				// 点击的item为非激活的item才发出change事件
				if (name !== proxy.parent.value) {
					proxy.parent.$emit('change', name);
				}
				emit('click', name);
			});
		}

		// 计算角标的right值
		function getOffsetRight(count, isDot) {
			// 点类型，count大于9(两位数)，分别设置不同的right值，避免位置太挤
			if (isDot) {
				return 10;
			} else if (count > 9) {
				return 20;
			} else {
				return 15;
			}
		}

		function getParentData(parentName = '') {
			// 避免在created中去定义parent变量
			if (!proxy.parent) proxy.parent = {};
			// 这里的本质原理是，通过获取父组件实例(也即类似dz-radio的父组件dz-radio-group的this)
			// 将父组件this中对应的参数，赋值给本组件(dz-radio的this)的parentData对象中对应的属性
			// 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
			// 此处并不会自动更新子组件的数据，而是依赖父组件dz-radio-group去监听data的变化，手动调用更新子组件的方法去重新获取
			proxy.parent = $parent.call(proxy, parentName);
			if (proxy.parent.children) {
				// 如果父组件的children不存在本组件的实例，才将本实例添加到父组件的children中
				proxy.parent.children.indexOf(proxy) === -1 && proxy.parent.children.push(proxy);
			}
			if (proxy.parent && data.parentData) {
				// 历遍parentData中的属性，将parent中的同名属性赋值给parentData
				Object.keys(data.parentData).map((key) => {
					data.parentData[key] = proxy.parent[key];
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

		return {
			clickHandler,
			...toRefs(data),
			getOffsetRight,
			updateFromParent,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-tabbar-item {
	@include flex(column);
	align-items: center;
	justify-content: center;
	flex: 1;

	&__icon {
		@include flex;
		position: relative;
		width: 150rpx;
		justify-content: center;
	}

	&__text {
		margin-top: 2px;
		font-size: 12px;
		color: $dz-content-color;
	}
}

/* #ifdef MP */
// 由于小程序都使用shadow DOM形式实现，需要给影子宿主设置flex: 1才能让其撑开
:host {
	flex: 1;
}
/* #endif */
</style>

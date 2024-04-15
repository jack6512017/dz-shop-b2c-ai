<template>
	<view
		class="dz-tabs"
		:style="{
			background: bgColor,
			margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
			padding: `${padding}rpx`,
			borderRadius: `${radius}rpx`,
		}"
	>
		<view class="dz-tabs__wrapper">
			<slot name="left"></slot>
			<view class="dz-tabs__wrapper__scroll-view-wrapper">
				<scroll-view
					:scroll-x="scrollable"
					:scroll-left="scrollLeft"
					scroll-with-animation
					class="dz-tabs__wrapper__scroll-view"
					:show-scrollbar="false"
					ref="dz-tabs__wrapper__scroll-view"
				>
					<view class="dz-tabs__wrapper__nav">
						<view
							class="dz-tabs__wrapper__nav__item"
							v-for="(item, index) in list"
							:key="index"
							@tap="clickHandler(item, index)"
							ref="tabsWrapperNavRef"
							:style="[api.addStyle(itemStyle), { flex: scrollable ? '' : 1 }]"
							:class="[`dz-tabs__wrapper__nav__item-${index}`, item.disabled && 'dz-tabs__wrapper__nav__item--disabled']"
						>
							<text
								:class="[item.disabled && 'dz-tabs__wrapper__nav__item__text--disabled']"
								class="dz-tabs__wrapper__nav__item__text"
								:style="[textStyle(index)]"
								>{{ item[keyName] }}</text
							>
							<!-- <dz-badge
								:show="!!(item.badge && (item.badge.show || item.badge.isDot || item.badge.value))"
								:isDot="(item.badge && item.badge.isDot) || propsBadge.isDot"
								:value="(item.badge && item.badge.value) || propsBadge.value"
								:max="(item.badge && item.badge.max) || propsBadge.max"
								:type="(item.badge && item.badge.type) || propsBadge.type"
								:showZero="(item.badge && item.badge.showZero) || propsBadge.showZero"
								:bgColor="(item.badge && item.badge.bgColor) || propsBadge.bgColor"
								:color="(item.badge && item.badge.color) || propsBadge.color"
								:shape="(item.badge && item.badge.shape) || propsBadge.shape"
								:numberType="(item.badge && item.badge.numberType) || propsBadge.numberType"
								:inverted="(item.badge && item.badge.inverted) || propsBadge.inverted"
								customStyle="margin-left: 4px;"
							></dz-badge> -->
							<dz-badge :count="item[count] || item['count'] || 0" :offset="[5, 20]" size="mini"></dz-badge>
						</view>
						<!-- #ifdef APP-NVUE -->
						<view
							v-if="showLine"
							class="dz-tabs__wrapper__nav__line"
							ref="tabsLine"
							:style="[
								{
									width: api.addUnit(lineWidth * 2),
									height: api.addUnit(lineHeight * 2),
									background: lineColor,
									backgroundSize: lineBgSize,
								},
							]"
						>
						</view>
						<!-- #endif -->
						<!-- #ifndef APP-NVUE -->
						<view
							v-if="showLine"
							class="dz-tabs__wrapper__nav__line"
							ref="tabsLine"
							:style="[
								{
									width: api.addUnit(lineWidth * 2),
									transform: `translate(${lineOffsetLeft}px)`,
									transitionDuration: `${firstTime ? 0 : duration}ms`,
									height: api.addUnit(lineHeight * 2),
									background: lineColor,
									backgroundSize: lineBgSize,
								},
							]"
						>
						</view>
						<!-- #endif -->
					</view>
				</scroll-view>
			</view>
			<slot name="right"></slot>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, onMounted, unref, nextTick, getCurrentInstance } from 'vue';

// #ifdef APP-NVUE
const animation = uni.requireNativePlugin('animation');
const dom = uni.requireNativePlugin('dom');
// #endif

const props = defineProps({
	// 滑块的移动过渡时间，单位ms
	duration: {
		type: Number,
		default: 300,
	},
	// tabs标签数组
	list: {
		type: Array,
		default: () => [],
	},
	// 导航栏的背景颜色
	bgColor: {
		type: String,
		default: '#ffffff',
	},
	// 圆角
	radius: {
		type: [String, Number],
		default: 0,
	},
	// 左右边距
	marginLeftRight: {
		type: [String, Number],
		default: 0,
	},
	// 上边距
	marginTop: {
		type: [String, Number],
		default: 0,
	},
	// 下边距
	marginBottom: {
		type: [String, Number],
		default: 0,
	},
	// 内边距
	padding: {
		type: [String, Number],
		default: 0,
	},
	// 滑块颜色
	lineColor: {
		type: String,
		default: '#3c9cff',
	},
	// 菜单选择中时的样式
	activeStyle: {
		type: [String, Object],
		default: () => {
			'#303133';
		},
	},
	// 菜单非选中时的样式
	inactiveStyle: {
		type: [String, Object],
		default: () => {
			'#606266';
		},
	},
	// 是否显示底部的滑块
	showLine: {
		type: Boolean,
		default: true,
	},
	// 滑块长度
	lineWidth: {
		type: [String, Number],
		default: 20,
	},
	// 滑块高度
	lineHeight: {
		type: [String, Number],
		default: 3,
	},
	// 滑块背景显示大小，当滑块背景设置为图片时使用
	lineBgSize: {
		type: String,
		default: 'cover',
	},
	// 菜单item的样式
	itemStyle: {
		type: [String, Object],
		default: () => ({
			height: '44px',
		}),
	},
	// 菜单是否可滚动
	scrollable: {
		type: Boolean,
		default: true,
	},
	// 当前选中标签的索引
	current: {
		type: [Number, String],
		default: 0,
	},
	// 默认读取的键名
	keyName: {
		type: String,
		default: 'name',
	},
	// 读取传入的数组对象的属性(徽标数)
	count: {
		type: String,
		default: 'count',
	},
});

const emit = defineEmits(['click', 'change']);
const firstTime = ref<boolean>(true);
const scrollLeft = ref<number>(0);
const scrollViewWidth = ref<number>(0);
const lineOffsetLeft = ref<number>(0);
const data = reactive<object>({
	tabsRect: {
		left: 0,
	},
});
const innerCurrent = ref<number>(0);
const tabsLine = ref(null);
const proxy = getCurrentInstance()?.proxy ?? null;
const tabsWrapperNavRef = ref(null);

watch(
	() => props.current,
	(newValue) => {
		// 内外部值不相等时，才尝试移动滑块
		if (newValue !== unref(innerCurrent)) {
			innerCurrent.value = newValue;
			nextTick(() => {
				resize();
			});
		}
	},
	{
		immediate: true,
	}
);

watch(
	() => props.list,
	() => {
		nextTick(() => {
			resize();
		});
	}
);

const textStyle = computed(() => (index) => {
	const style = {};
	// 取当期是否激活的样式
	const customeStyle = index === unref(innerCurrent) ? uni.$api.addStyle(props.activeStyle) : uni.$api.addStyle(props.inactiveStyle);
	// 如果当前菜单被禁用，则加上对应颜色，需要在此做处理，是因为nvue下，无法在style样式中通过!import覆盖标签的内联样式
	if (props.list[index].disabled) {
		style.color = '#c8c9cc';
	}
	return uni.$api.deepMerge(customeStyle, style);
});

const propsBadge = computed(() => {
	return {
		isDot: false,
		value: '',
		show: true,
		max: 99,
		type: 'error',
		showZero: false,
		bgColor: null,
		color: null,
		shape: 'circle',
		numberType: 'overflow',
		offset: () => [],
		inverted: false,
		absolute: false,
	};
});

onMounted(() => {
	init();
});

function setLineLeft() {
	const tabItem = props.list[unref(innerCurrent)];
	if (!tabItem) {
		return;
	}
	// 获取滑块该移动的位置
	let _lineOffsetLeft = props.list.slice(0, unref(innerCurrent)).reduce((total, curr) => total + curr.rect.width, 0);
	// 获取下划线的数值px表示法
	const lineWidth = uni.$api.getPx(props.lineWidth);
	lineOffsetLeft.value = _lineOffsetLeft + (tabItem.rect.width - lineWidth) / 2;
	// #ifdef APP-NVUE
	// 第一次移动滑块，无需过渡时间
	animation(unref(lineOffsetLeft), unref(firstTime) ? 0 : parseInt(props.duration));
	// #endif

	// 如果是第一次执行此方法，让滑块在初始化时，瞬间滑动到第一个tab item的中间
	// 这里需要一个定时器，因为在非nvue下，是直接通过style绑定过渡时间，需要等其过渡完成后，再设置为false(非第一次移动滑块)
	if (unref(firstTime)) {
		setTimeout(() => {
			firstTime.value = false;
		}, 10);
	}
}

// nvue下设置滑块的位置
function animation(x: number, duration = 0) {
	// #ifdef APP-NVUE
	animation.transition(unref(tabsLine), {
		styles: {
			transform: `translateX(${x}px)`,
		},
		duration,
	});
	// #endif
}

// 点击某一个标签
function clickHandler(item: object, index: number) {
	// 因为标签可能为disabled状态，所以click是一定会发出的，但是change事件是需要可用的状态才发出
	emit('click', {
		...item,
		index,
	});
	// 如果disabled状态，返回
	if (item.disabled) return;
	innerCurrent.value = index;
	resize();
	emit('change', {
		...item,
		index,
	});
}

function init() {
	uni.$api.sleep().then(() => {
		resize();
	});
}

function setScrollLeft() {
	// 当前活动tab的布局信息，有tab菜单的width和left(为元素左边界到父元素左边界的距离)等信息
	const tabRect = props.list[unref(innerCurrent)];
	// 累加得到当前item到左边的距离
	const offsetLeft = props.list.slice(0, unref(innerCurrent)).reduce((total, curr) => {
		return total + curr.rect.width;
	}, 0);
	// 此处为屏幕宽度
	const windowWidth = uni.$api.systemInfo.windowWidth;
	// 将活动的tabs-item移动到屏幕正中间，实际上是对scroll-view的移动
	let _scrollLeft = offsetLeft - (data.tabsRect.width - tabRect.rect.width) / 2 - (windowWidth - data.tabsRect.right) / 2 + data.tabsRect.left / 2;
	// 这里做一个限制，限制scrollLeft的最大值为整个scroll-view宽度减去tabs组件的宽度
	_scrollLeft = Math.min(_scrollLeft, unref(scrollViewWidth) - data.tabsRect.width);
	scrollLeft.value = Math.max(0, _scrollLeft);
}

// 获取所有标签的尺寸
function resize() {
	// 如果不存在list，则不处理
	if (props.list.length === 0) {
		return;
	}
	Promise.all([getTabsRect(), getAllItemRect()]).then(([tabsRect, itemRect = []]) => {
		data.tabsRect = tabsRect;
		scrollViewWidth.value = 0;
		itemRect.map((item, index) => {
			// 计算scroll-view的宽度，这里
			scrollViewWidth.value += item.width;
			// 另外计算每一个item的中心点X轴坐标
			props.list[index].rect = item;
		});
		// 获取了tabs的尺寸之后，设置滑块的位置
		setLineLeft();
		setScrollLeft();
	});
}

// 获取导航菜单的尺寸
function getTabsRect() {
	return new Promise((resolve) => {
		queryRect('dz-tabs__wrapper__scroll-view').then((size) => resolve(size));
	});
}
// 获取所有标签的尺寸
function getAllItemRect() {
	return new Promise((resolve) => {
		const promiseAllArr = props.list.map((item, index) => queryRect(`dz-tabs__wrapper__nav__item-${index}`, true));
		Promise.all(promiseAllArr).then((sizes) => resolve(sizes));
	});
}

// 获取各个标签的尺寸
function queryRect(el, item) {
	// #ifndef APP-NVUE
	// $uGetRect为uView自带的节点查询简化方法，详见文档介绍：https://www.uviewui.com/js/getRect.html
	// 组件内部一般用this.$uGetRect，对外的为uni.$u.getRect，二者功能一致，名称不同
	return new Promise((resolve) => {
		uni.$api.getRect(`.${el}`, false, proxy).then((size) => {
			resolve(size);
		});
	});
	// #endif
	// #ifdef APP-NVUE
	// nvue下，使用dom模块查询元素高度
	// 返回一个promise，让调用此方法的主体能使用then回调
	if (!item) return;
	return new Promise((resolve) => {
		dom.getComponentRect(unref(tabsWrapperNavRef)[el.charAt(el.length - 1)], (res) => {
			resolve(res.size);
		});
	});
	// #endif
}
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

/* #ifndef APP-NVUE */
// 由于uView是基于nvue环境进行开发的，此环境中普通元素默认为flex-direction: column;
// 所以在非nvue中，需要对元素进行重置为flex-direction: column; 否则可能会表现异常
view,
scroll-view,
swiper-item {
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	flex-grow: 0;
	flex-basis: auto;
	align-items: stretch;
	align-content: flex-start;
}
/* #endif */

.dz-tabs {
	&__wrapper {
		@include flex;
		align-items: center;

		&__scroll-view-wrapper {
			flex: 1;
			/* #ifndef APP-NVUE */
			overflow: auto hidden;
			/* #endif */
		}

		&__scroll-view {
			@include flex;
			flex: 1;
		}

		&__nav {
			@include flex;
			position: relative;

			&__item {
				padding: 0 11px;
				@include flex;
				align-items: center;
				justify-content: center;

				&--disabled {
					/* #ifndef APP-NVUE */
					cursor: not-allowed;
					/* #endif */
				}

				&__text {
					font-size: 15px;
					color: $dz-content-color;

					&--disabled {
						color: $dz-disabled-color !important;
					}
				}
			}

			&__line {
				height: 3px;
				background: $dz-type-primary;
				width: 30px;
				position: absolute;
				bottom: 2px;
				border-radius: 100px;
				transition-property: transform;
				transition-duration: 300ms;
			}
		}
	}
}
</style>

<template>
	<view class="dz-rate" :id="elId" @touchmove.stop.prevent="touchMove">
		<view class="dz-star-wrap" v-for="(item, index) in count" :key="index" :class="[elClass]">
			<dz-icon
				:name="activeIndex > index ? elActiveIcon : inactiveIcon"
				@click="click(index + 1, $event)"
				:color="activeIndex > index ? elActiveColor : inactiveColor"
				:custom-style="{
					fontSize: size + 'rpx',
					padding: `0 ${gutter / 2 + 'rpx'}`,
				}"
				:custom-prefix="customPrefix"
				:show-decimal-icon="showDecimalIcon(index)"
				:percent="decimal"
			></dz-icon>
		</view>
	</view>
</template>

<script lang="ts" setup>
/**
 * rate 评分
 * @description 该组件一般用于满意度调查，星型评分的场景
 * @property {String Number} count 最多可选的星星数量（默认5）
 * @property {String Number} current 默认选中的星星数量（默认0）
 * @property {Boolean} disabled 是否禁止用户操作（默认false）
 * @property {String Number} size 星星的大小，单位rpx（默认32）
 * @property {String} inactive-color 未选中星星的颜色（默认#b2b2b2）
 * @property {String} active-color 选中的星星颜色（默认#FA3534）
 * @property {String} active-icon 选中时的图标名，只能为uView的内置图标（默认star-fill）
 * @property {String} inactive-icon 未选中时的图标名，只能为uView的内置图标（默认star）
 * @property {String} gutter 星星之间的距离（默认10）
 * @property {String Number} min-count 最少选中星星的个数（默认0）
 * @property {Boolean} allow-half 是否允许半星选择（默认false）
 * @event {Function} change 选中的星星发生变化时触发
 * @example <dz-rate :count="count" :current="2"></dz-rate>
 */
import { ref, watch, computed, getCurrentInstance, onMounted } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	// 用于v-model双向绑定选中的星星数量
	value: {
		type: [Number, String],
		default: -1,
	},
	// 要显示的星星数量
	count: {
		type: [Number, String],
		default: 5,
	},
	// 当前需要默认选中的星星(选中的个数)
	// 通过value双向绑定，不再建议使用此参数
	current: {
		type: [Number, String],
		default: 0,
	},
	// 是否不可选中
	disabled: {
		type: Boolean,
		default: false,
	},
	// 星星的大小，单位rpx
	size: {
		type: [Number, String],
		default: 32,
	},
	// 未选中时的颜色
	inactiveColor: {
		type: String,
		default: '#b2b2b2',
	},
	// 选中的颜色
	activeColor: {
		type: String,
		default: '#FA3534',
	},
	// 星星之间的间距，单位rpx
	gutter: {
		type: [Number, String],
		default: 10,
	},
	// 最少能选择的星星个数
	minCount: {
		type: [Number, String],
		default: 0,
	},
	// 是否允许半星(功能尚未实现)
	allowHalf: {
		type: Boolean,
		default: false,
	},
	// 选中时的图标(星星)
	activeIcon: {
		type: String,
		default: 'favorfill',
	},
	// 未选中时的图标(星星)
	inactiveIcon: {
		type: String,
		default: 'favor',
	},
	// 自定义扩展前缀，方便用户扩展自己的图标库
	customPrefix: {
		type: String,
		default: 'dzicon',
	},
	colors: {
		type: Array,
		default() {
			return [];
		},
	},
	icons: {
		type: Array,
		default() {
			return [];
		},
	},
});

const emit = defineEmits(['change', 'input']);

const proxy = getCurrentInstance()?.proxy ?? null;
// 生成一个唯一id，否则一个页面多个评分组件，会造成冲突
const elId = uni.$api.guid();
const elClass = uni.$api.guid();
// 评分盒子左边到屏幕左边的距离，用于滑动选择时计算距离
const starBoxLeft = ref<number>(0);
// 当前激活的星星的index，如果存在value，优先使用value，因为它可以双向绑定(1.4.5新增)
const activeIndex = ref(props.value != -1 ? props.value : props.current);
const starWidth = ref<number>(0); // 每个星星的宽度
const starWidthArr = ref<[]>([]); //每个星星最右边到组件盒子最左边的距离

watch(
	() => props.current,
	(val) => {
		activeIndex.value = val;
	}
);

watch(
	() => props.value,
	(val) => {
		activeIndex.value = val;
	}
);

const decimal = computed(() => {
	if (props.disabled) {
		return (activeIndex.value * 100) % 100;
	} else if (props.allowHalf) {
		return 50;
	}
});

const elActiveIcon = computed((): CSSProperties => {
	const len = props.icons.length;
	// 此处规则类似于下方的elActiveColor参数，都是根据一定的规则，显示不同的图标
	// 结果可能如此：icons参数传递了3个图标，当选中两个时，用第一个图标，4个时，用第二个图标
	// 第三个时，用第三个图标作为激活的图标
	if (len && len <= props.count) {
		const step = Math.round(activeIndex.value / Math.round(props.count / len));
		if (step < 1) return props.icons[0];
		if (step > len) return props.icons[len - 1];
		return props.icons[step - 1];
	}
	return props.activeIcon;
});

const elActiveColor = computed((): CSSProperties => {
	const len = props.colors.length;
	// 如果有设置colors参数(此参数用于将图标分段，比如一共5颗星，colors传3个颜色值，那么根据一定的规则，2颗星可能为第一个颜色
	// 4颗星为第二个颜色值，5颗星为第三个颜色值)
	if (len && len <= props.count) {
		const step = Math.round(activeIndex.value / Math.round(props.count / len));
		if (step < 1) return props.colors[0];
		if (step > len) return props.colors[len - 1];
		return props.colors[step - 1];
	}
	return props.activeColor;
});

// 获取评分组件盒子的布局信息
function getElRectById() {
	uni.$api.getRect('#' + elId, false, proxy).then((res) => {
		starBoxLeft.value = res.left;
	});
}

// 获取单个星星的尺寸
function getElRectByClass() {
	uni.$api.getRect('.' + elClass, false, proxy).then((res) => {
		starWidth.value = res.width;
		// 把每个星星右边到组件盒子左边的距离放入数组中
		for (let i = 0; i < props.count; i++) {
			starWidthArr.value[i] = (i + 1) * starWidth.value;
		}
	});
}

// 手指滑动
function touchMove(e) {
	if (props.disabled) {
		return;
	}
	if (!e.changedTouches[0]) {
		return;
	}
	const movePageX = e.changedTouches[0].pageX;
	// 滑动点相对于评分盒子左边的距离
	const distance = movePageX - starBoxLeft.value;

	// 如果滑动到了评分盒子的左边界，就设置为0星
	if (distance <= 0) {
		activeIndex.value = 0;
	}
	// 滑动的距离，相当于多少颗星星
	let index = Math.ceil(distance / starWidth.value);
	activeIndex.value = index > props.count ? props.count : index;
	// 对最少颗星星的限制
	if (activeIndex.value < props.minCount) activeIndex.value = props.minCount;
	emitEvent();
}

// 通过点击，直接选中
function click(index, e) {
	if (props.disabled) {
		return;
	}
	// 半星选择，尚未实现
	if (props.allowHalf) {
	}
	// 对第一个星星特殊处理，只有一个的时候，点击可以取消，否则无法作0星评价
	if (index == 1) {
		if (activeIndex.value == 1) {
			activeIndex.value = 0;
		} else {
			activeIndex.value = 1;
		}
	} else {
		activeIndex.value = index;
	}
	// 对最少颗星星的限制
	if (activeIndex.value < props.minCount) activeIndex.value = props.minCount;
	emitEvent();
}

// 发出事件
function emitEvent() {
	// 发出change事件
	emit('change', activeIndex.value);
	// 同时修改双向绑定的value的值
	if (props.value != -1) {
		emit('input', activeIndex.value);
	}
}

function showDecimalIcon(index: number) {
	return props.disabled && parseInt(activeIndex.value) === index;
}

onMounted(() => {
	getElRectById();
	getElRectByClass();
});
</script>

<style scoped lang="scss">
.dz-rate {
	display: -webkit-inline-flex;
	display: inline-flex;
	align-items: center;
	margin: 0;
	padding: 0;
}

.dz-icon {
	box-sizing: border-box;
}
</style>

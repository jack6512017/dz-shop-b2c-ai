<template>
	<view class="dz-number-keyboard" @touchmove.stop.prevent>
		<view class="dz-number-keyboard-grids">
			<view
				class="dz-number-keyboard-grids-item"
				:class="[
					btnBgGray(index) ? 'dz-bg-gray' : '',
					index <= 2 ? 'dz-border-top' : '',
					index < 9 ? 'dz-border-bottom' : '',
					(index + 1) % 3 != 0 ? 'dz-border-right' : '',
				]"
				:style="[itemStyle(index)]"
				v-for="(item, index) in numList"
				:key="index"
				:hover-class="hoverClass(index)"
				:hover-stay-time="100"
				@tap="keyboardClick(item)"
			>
				<view class="dz-number-keyboard-grids-btn">{{ item }}</view>
			</view>
			<view
				class="dz-number-keyboard-grids-item dz-bg-gray"
				hover-class="dz-hover-class"
				:hover-stay-time="100"
				@touchstart.stop="backspaceClick"
				@touchend="clearTimer"
			>
				<view class="dz-number-keyboard-back dz-number-keyboard-grids-btn">
					<dz-icon name="backspace" :size="38" :bold="true"></dz-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from 'vue';

export default defineComponent({
	name: 'dz-number-keyboard',
	props: {
		// 键盘的类型，number-数字键盘，card-身份证键盘
		mode: {
			type: String,
			default: 'number',
		},
		// 是否显示键盘的"."符号
		dotEnabled: {
			type: Boolean,
			default: true,
		},
		// 是否打乱键盘按键的顺序
		random: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['change', 'backspace'],
	setup(props, { emit }) {
		const dot = ref<string>('.'); // 点
		const timer = ref(null); // 长按多次删除的事件监听
		const cardX = ref<string>('X'); // 身份证的X符号
		// 键盘需要显示的内容
		const numList = computed(() => {
			if (!props.dotEnabled && props.mode == 'number') {
				if (!props.random) {
					return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
				} else {
					return uni.$api.randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
				}
			} else if (porps.dotEnabled && porps.mode == 'number') {
				if (!porps.random) {
					return [1, 2, 3, 4, 5, 6, 7, 8, 9, dot.value, 0];
				} else {
					return uni.$api.randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, dot.value, 0]);
				}
			} else if (props.mode == 'card') {
				if (!props.random) {
					return [1, 2, 3, 4, 5, 6, 7, 8, 9, cardX.value, 0];
				} else {
					return uni.$api.randomArray([1, 2, 3, 4, 5, 6, 7, 8, 9, cardX.value, 0]);
				}
			}
		});

		// 按键的样式，在非乱序&&数字键盘&&不显示点按钮时，index为9时，按键占位两个空间
		const itemStyle = computed(() => (index: number) => {
			let style = {};
			if (props.mode == 'number' && !props.dotEnabled && index == 9) style.flex = '0 0 66.6666666666%';
			return style;
		});

		// 是否让按键显示灰色，只在非乱序&&数字键盘&&且允许点按键的时候
		const btnBgGray = computed(() => (index: number) => {
			if (!props.random && index == 9 && (props.mode != 'number' || (props.mode == 'number' && props.dotEnabled))) return true;
			else return false;
		});

		const hoverClass = computed(() => (index: number) => {
			if (!props.random && index == 9 && ((props.mode == 'number' && props.dotEnabled) || props.mode == 'card')) return 'dz-hover-class';
			else return 'dz-number-keyboard-hover';
		});

		// 点击退格键
		function backspaceClick() {
			emit('backspace');
			clearInterval(timer.value); //再次清空定时器，防止重复注册定时器
			timer.value = null;
			timer.value = setInterval(() => {
				emit('backspace');
			}, 250);
		}
		function clearTimer() {
			clearInterval(timer.value);
			timer.value = null;
		}
		// 获取键盘显示的内容
		function keyboardClick(val) {
			// 允许键盘显示点模式和触发非点按键时，将内容转为数字类型
			if (props.dotEnabled && val != dot.value && val != cardX.value) val = Number(val);
			emit('change', val);
		}

		return {
			numList,
			btnBgGray,
			itemStyle,
			hoverClass,
			backspaceClick,
			clearTimer,
			keyboardClick,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';

.dz-number-keyboard {
	position: relative;
	z-index: 1003;
}

.dz-number-keyboard-grids {
	@include flex;
	flex-wrap: wrap;
}

.dz-number-keyboard-grids-item {
	flex: 0 0 33.3333333333%;
	text-align: center;
	font-size: 50rpx;
	color: #333;
	@include flex;
	align-items: center;
	justify-content: center;
	height: 110rpx;
	font-weight: 500;
}

.dz-bg-gray {
	background-color: $dz-border-color;
}

.dz-number-keyboard-back {
	font-size: 36rpx;
}

.dz-number-keyboard-hover {
	background-color: #e7e6eb;
}
</style>

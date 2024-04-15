<template>
	<view
		class="dz-mask"
		hover-stop-propagation
		:style="[maskStyle, zoomStyle]"
		@tap="click"
		@touchmove.stop.prevent="() => {}"
		:class="{
			'dz-mask-zoom': zoom,
			'dz-mask-show': show,
		}"
	>
		<slot></slot>
	</view>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, computed } from 'vue';

const props = defineProps({
	// 是否显示遮罩
	show: {
		type: Boolean,
		default: false,
	},
	// 层级z-index
	zIndex: {
		type: [Number, String],
		default: '',
	},
	// 用户自定义样式
	customStyle: {
		type: Object,
		default() {
			return {};
		},
	},
	// 遮罩的动画样式， 是否使用使用zoom进行scale进行缩放
	zoom: {
		type: Boolean,
		default: true,
	},
	// 遮罩的过渡时间，单位为ms
	duration: {
		type: [Number, String],
		default: 300,
	},
	// 是否可以通过点击遮罩进行关闭
	maskClickAble: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['click']);
const zoomStyle = reactive({
	transform: '',
});
const scale = ref<String>('scale(1.2, 1.2)');

watch(
	() => props.show,
	(val) => {
		if (val && props.zoom) {
			// 当展示遮罩的时候，设置scale为1，达到缩小(原来为1.2)的效果
			zoomStyle.transform = 'scale(1, 1)';
		} else if (!val && props.zoom) {
			// 当隐藏遮罩的时候，设置scale为1.2，达到放大(因为显示遮罩时已重置为1)的效果
			zoomStyle.transform = scale.value;
		}
	}
);

const maskStyle = computed((): CSSProperties => {
	let style = {};
	style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
	if (props.show) style.zIndex = props.zIndex ? props.zIndex : uni.$api.zIndex.mask;
	else style.zIndex = -1;
	if (parseInt(props.duration) > 0) {
		style.transition = `all ${props.duration / 1000}s ease-in-out`;
	}
	// 判断用户传递的对象是否为空，不为空就进行合并
	if (Object.keys(props.customStyle).length) style = { ...style, ...props.customStyle };
	return style;
});

function click() {
	if (!props.maskClickAble) return;
	emit('click');
}
</script>

<style lang="scss" scoped>
.dz-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	opacity: 0;
	transition: transform 0.3s;
}

.dz-mask-show {
	opacity: 1;
}

.dz-mask-zoom {
	transform: scale(1.2, 1.2);
}
</style>

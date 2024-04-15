<template>
	<view @touchmove.stop.prevent>
		<view class="dz-fab-box" :class="{ 'dz-fab-right': !left || (left && right) }" :style="{ left: getLeft(), right: getRight(), bottom: bottom + 'rpx' }">
			<block v-if="mode == 'default'">
				<view v-if="btnList.length > 1" class="dz-fab-btn" :class="{ 'dz-visible': isOpen, 'dz-fab-hidden': hidden }">
					<view
						class="dz-fab-item-box"
						:class="{ 'dz-fab-item-left': left && !right && item.imgUrl }"
						v-for="(item, index) in btnList"
						:key="index"
						@tap.stop="handleClick(index)"
					>
						<view
							class="dz-fab-item"
							:style="{
								width: width + 'rpx',
								height: height + 'rpx',
								background: item.bgColor ? item.bgColor : bgColor,
								borderRadius: btnRadius + 'rpx',
							}"
						>
							<dz-image :src="item.imgUrl" :width="parseInt(item.imgWidth) * 2" :height="parseInt(item.imgHeight) * 2"></dz-image>
						</view>
					</view>
				</view>

				<view
					v-if="btnList.length > 1"
					class="dz-fab-item"
					:class="{ 'dz-active': isOpen }"
					:style="{
						width: width + 'rpx',
						height: height + 'rpx',
						borderRadius: borderRadius + 'rpx',
						background: bgColor,
						color: color,
					}"
					@tap.stop="handleClick(-1)"
				>
					<view class="dz-fab-icon dz-icon-plus"></view>
				</view>
			</block>
			<view
				v-if="btnList.length == 1"
				class="dz-fab-item"
				:class="{ 'dz-active': isOpen }"
				:style="{
					width: width + 'rpx',
					height: height + 'rpx',
					borderRadius: btnRadius + 'rpx',
					background: btnList[0].bgColor,
					color: btnList[0].color,
				}"
				@tap.stop="handleClick(0)"
			>
				<dz-image :src="btnList[0].imgUrl" :width="parseInt(btnList[0].imgWidth) * 2" :height="parseInt(btnList[0].imgHeight) * 2"></dz-image>
			</view>
			<block v-if="mode == 'sector'">
				<view v-if="btnList.length > 1" class="dz-fab-item menu" :class="{ 'menu-open': isOpen }" :style="[menuStyle]" @tap.stop="handleClick(-1)"
					><view class="dz-fab-icon dz-icon-plus"></view
				></view>
				<view
					v-if="btnList.length && btnList.length > 1"
					class="dz-fab-item menu-item"
					:class="[isOpen ? 'open' : '']"
					:style="[menuItemStyle, isOpen ? menuItemStyle1 : menuStyle]"
					@tap.stop="handleClick(1)"
				>
					<dz-image :src="btnList[0].imgUrl" :width="parseInt(btnList[0].imgWidth) * 2" :height="parseInt(btnList[0].imgHeight) * 2"></dz-image>
				</view>
				<view
					v-if="btnList.length && btnList[1]"
					class="dz-fab-item menu-item"
					:class="[isOpen ? 'open' : '']"
					:style="[menuItemStyle, isOpen ? menuItemStyle2 : menuStyle]"
					@tap.stop="handleClick(1)"
				>
					<dz-image :src="btnList[1].imgUrl" :width="parseInt(btnList[1].imgWidth) * 2" :height="parseInt(btnList[1].imgHeight) * 2"></dz-image>
				</view>
				<view
					v-if="btnList.length && btnList[2]"
					class="dz-fab-item menu-item"
					:class="[isOpen ? 'open' : '']"
					:style="[menuItemStyle, isOpen ? menuItemStyle3 : menuStyle]"
					@tap.stop="handleClick(2)"
				>
					<dz-image :src="btnList[2].imgUrl" :width="parseInt(btnList[2].imgWidth) * 2" :height="parseInt(btnList[2].imgHeight) * 2"></dz-image>
				</view>
				<view
					v-if="btnList.length && btnList[3]"
					class="dz-fab-item menu-item"
					:class="[isOpen ? 'open' : '']"
					:style="[menuItemStyle, isOpen ? menuItemStyle4 : menuStyle]"
					@tap.stop="handleClick(3)"
				>
					<dz-image :src="btnList[3].imgUrl" :width="parseInt(btnList[3].imgWidth) * 2" :height="parseInt(btnList[3].imgHeight) * 2"></dz-image>
				</view>
				<view
					v-if="btnList.length && btnList[4]"
					class="dz-fab-item menu-item"
					:class="[isOpen ? 'open' : '']"
					:style="[menuItemStyle, isOpen ? menuItemStyle5 : menuStyle]"
					@tap.stop="handleClick(4)"
				>
					<dz-image :src="btnList[4].imgUrl" :width="parseInt(btnList[4].imgWidth) * 2" :height="parseInt(btnList[4].imgHeight) * 2"></dz-image>
				</view>
			</block>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed, onUnmounted } from 'vue';
import type { CSSProperties } from 'vue';

//拓展出来的按钮不应多于6个，否则违反了作为悬浮按钮的快速、高效的原则
const props = defineProps({
	// 样式 default 默认  sector 扇形
	mode: {
		type: String,
		default: 'default',
	},
	//rpx 为0时值为auto
	left: {
		type: Number,
		default: 0,
	},
	//rpx 当为0时且left不为0，值为auto
	right: {
		type: [String, Number],
		default: 80,
	},
	//rpx bottom值
	bottom: {
		type: [String, Number],
		default: 100,
	},
	//默认按钮 宽度 rpx
	width: {
		type: [String, Number],
		default: 108,
	},
	//默认按钮 高度 rpx
	height: {
		type: [String, Number],
		default: 108,
	},
	//圆角值
	borderRadius: {
		type: [String, Number],
		default: 40,
	},
	//按钮圆角值
	btnRadius: {
		type: [String, Number],
		default: 14,
	},
	//默认按钮背景颜色
	bgColor: {
		type: String,
		default: '#5677fc',
	},
	//字体颜色
	color: {
		type: String,
		default: '#fff',
	},
	//拓展按钮
	// bgColor: "#5677fc",
	// //图标/图片地址
	// imgUrl: "/static/images/fab/fab_reward.png",
	// //图片高度 rpx
	// imgHeight: 60,
	// //图片宽度 rpx
	// imgWidth: 60,
	// //名称
	// text: "名称",
	// //字体大小
	// fontSize: 30,
	// //字体颜色
	// color: "#fff"
	btnList: {
		type: Array,
		default() {
			return [];
		},
	},
	//点击遮罩 是否可关闭
	maskClosable: {
		type: Boolean,
		default: false,
	},
});

const isOpen = ref<Boolean>(false);
const hidden = ref<Boolean>(true);
const timer = ref();
const emit = defineEmits(['click']);

const menuStyle = computed((): CSSProperties => {
	let style = {
		left: getLeft(),
		right: getRight(),
		bottom: props.bottom + 'rpx',
		width: props.width + 'rpx',
		height: props.height + 'rpx',
		borderRadius: props.borderRadius + 'rpx',
		background: props.bgColor,
		color: props.color,
	};
	return style;
});

const menuItemStyle = computed((): CSSProperties => {
	let style = {
		width: props.width + 'rpx',
		height: props.height + 'rpx',
		borderRadius: props.btnRadius + 'rpx',
	};
	return style;
});

const menuItemStyle1 = computed((): CSSProperties => {
	let style = {
		background: props.btnList[0] ? props.btnList[0].bgColor : props.bgColor,
		right: props.right + 'rpx',
		bottom: props.bottom + props.height * 2 + 'rpx',
	};
	return style;
});

const menuItemStyle2 = computed((): CSSProperties => {
	let style = {
		background: props.btnList[1] ? props.btnList[1].bgColor : props.bgColor,
		right: props.right + props.width * 1.5 + 10 + 'rpx',
		bottom: props.bottom + props.height * 1.5 + 'rpx',
	};
	return style;
});

const menuItemStyle3 = computed((): CSSProperties => {
	let style = {
		background: props.btnList[2] ? props.btnList[2].bgColor : props.bgColor,
		right: props.right + props.width * 2 + 10 + 'rpx',
		bottom: props.bottom + 'rpx',
	};
	return style;
});

const menuItemStyle4 = computed((): CSSProperties => {
	let style = {
		background: props.btnList[3] ? props.btnList[3].bgColor : props.bgColor,
		right: props.right + props.width * 1.5 + 10 + 'rpx',
		bottom: props.bottom - props.height * 1.5 + 'rpx',
	};
	return style;
});

const menuItemStyle5 = computed((): CSSProperties => {
	let style = {
		background: props.btnList[4] ? props.btnList[4].bgColor : props.bgColor,
		right: props.right + 'rpx',
		bottom: props.bottom - props.height * 2 + 'rpx',
	};
	return style;
});

function getLeft() {
	let val = 'auto';
	if (props.left && !props.right) {
		val = props.left + 'rpx';
	}
	return val;
}

function getRight() {
	let val = props.right + 'rpx';
	if (props.left && !props.right) {
		val = 'auto';
	}
	return val;
}

function handleClick(index) {
	hidden.value = false;
	clearTimeout(timer.value);
	if (index == -1 && props.btnList.length) {
		isOpen.value = !isOpen.value;
	} else {
		emit('click', index);
		isOpen.value = false;
	}
	if (!isOpen.value) {
		timer.value = setTimeout(() => {
			hidden.value = true;
		}, 200);
	}
}

onUnmounted(() => {
	clearTimeout(timer.value);
	timer.value = null;
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';
.menu,
.menu-item {
	position: fixed;
	opacity: 0;
	transition: all 0.3s ease-out 0s;
	z-index: 999;
}
.menu-item {
	transform: rotate(0deg) scale(0);
}
.menu {
	z-index: 999;
	opacity: 1;
}
.menu-open {
	transform: rotate(225deg);
	animation-fill-mode: forwards;
	transition: all 0.3s ease-out 0s;
}
.open {
	opacity: 1;
	transform: scale(1) rotate(360deg);
	animation-fill-mode: forwards;
	transition: all 0.3s ease-out 0s;
}

@font-face {
	font-family: 'dzfab';
	src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAREAA0AAAAABnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAEKAAAABoAAAAciPExJUdERUYAAAQIAAAAHgAAAB4AKQAKT1MvMgAAAaAAAABCAAAAVjyBSAVjbWFwAAAB9AAAAD4AAAFCAA/pvmdhc3AAAAQAAAAACAAAAAj//wADZ2x5ZgAAAkAAAABRAAAAYFkYQQNoZWFkAAABMAAAADAAAAA2Fm5OF2hoZWEAAAFgAAAAHQAAACQH3QOFaG10eAAAAeQAAAAPAAAAEAwAAANsb2NhAAACNAAAAAoAAAAKADAAAG1heHAAAAGAAAAAHwAAACABDwAobmFtZQAAApQAAAFJAAACiCnmEVVwb3N0AAAD4AAAAB8AAAAx2XRuznjaY2BkYGAAYtGolt54fpuvDNwsDCBwc1krH5xm/t/I/J+5FsjlYGACiQIAGAEKZHjaY2BkYGBu+N/AEMPCAALM/xkYGVABCwBZ4wNrAAAAeNpjYGRgYGBhkGEA0QwMTEDMBYQMDP/BfAYAC4kBOAB42mNgZGFgnMDAysDA1Ml0hoGBoR9CM75mMGLkAIoysDIzYAUBaa4pDA7PhJ8JMzf8b2CIYW5gaAAKM4LkAN21DAEAAHjaY2GAABYIZgYAAIMAEAB42mNgYGBmgGAZBkYGELAB8hjBfBYGBSDNAoRA/jPh//8hpOQHqEoGRjYGGJOBkQlIMDGgAkaGYQ8AUSIHswAAAAAAAAAAAAAAMAAAeNpjYGRg/t/I/J+5lkGagYFRUVCPUYmNXVCRj1FETFxRUI7RyMxcUNGO0USN+fS/HEY5XTnGfznicnLijFPAHMYpYnJyjFvBlBgWBQBNJxKpAAAAeNp9kD1OAzEQhZ/zByQSQiCoXVEA2vyUKRMp9Ailo0g23pBo1155nUg5AS0VB6DlGByAGyDRcgpelkmTImvt6PObmeexAZzjGwr/3yXuhBWO8ShcwREy4Sr1F+Ea+V24jhY+hRvUf4SbuFUD4RYu1BsdVO2Eu5vSbcsKZxgIV3CKJ+Eq9ZVwjfwqXMcVPoQb1L+EmxjjV7iFa2WpDOFhMEFgnEFjig3jAjEcLJIyBtahOfRmEsxMTzd6ETubOBso71dilwMeaDnngCntPbdmvkon/mDLgdSYbh4FS7YpjS4idCgbXyyc1d2oc7D9nu22tNi/a4E1x+xRDWzU/D3bM9JIbAyvkJI18jK3pBJTj2hrrPG7ZynW814IiU68y/SIx5o0dTr3bmniwOLn8owcfbS5kj33qBw+Y1kIeb/dTsQgil2GP5PYcRkAAAB42mNgYoAALjDJyIAOWMCiTIxMbFmZiRmJ+QALXAKKAAAAAAH//wACAAEAAAAMAAAAFgAAAAIAAQADAAMAAQAEAAAAAgAAAAB42mNgYGBkAIKrS9Q5QPTNZa18MBoAPbcFzgAA)
		format('woff');
	font-weight: normal;
	font-style: normal;
}

.dz-fab-icon {
	font-family: 'dzfab' !important;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	padding: 10rpx;
}

.dz-icon-plus:before {
	content: '\e613';
}

.dz-fab-box {
	@include flex;
	justify-content: center;
	flex-direction: column;
	position: fixed;
	z-index: 99997;
}

.dz-fab-right {
	align-items: flex-end;
}

.dz-fab-btn {
	transform: scale(0);
	transition: all 0.2s ease-in-out;
	opacity: 0;
	visibility: hidden;
}

.dz-fab-hidden {
	height: 0;
	width: 0;
}

.dz-fab-item-box {
	@include flex;
	align-items: center;
	justify-content: flex-end;
	padding-bottom: 40rpx;
}

.dz-fab-item-left {
	flex-flow: row-reverse;
}

.dz-fab-title {
	width: 90%;
	text-align: center;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.dz-text-left {
	padding-left: 28rpx;
}

.dz-text-right {
	padding-right: 28rpx;
}

.dz-fab-img {
	display: block;
}

.dz-fab-item {
	@include flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.1);
	transition: all 0.2s linear;
}

.dz-radius {
	border-radius: 50%;
}

.dz-active {
	transform: rotate(135deg);
}

.dz-fab-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	z-index: 99996;
	transition: all 0.2s ease-in-out;
	opacity: 0;
	visibility: hidden;
}

.dz-visible {
	visibility: visible;
	opacity: 1;
	transform: scale(1);
}
</style>

<template>
	<view
		class="dz-scroll-view-box"
		:style="{
			backgroundColor: bgColor,
			margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
			borderRadius: `${borderRadius}rpx`,
		}"
	>
		<view v-if="!isPage" class="dz-scroll-view-item">
			<dz-grid :col="col">
				<block v-for="(item, index) in ListData" :key="index">
					<dz-grid-item
						v-if="customerService && item.activeMenuType && item.activeMenuType == 'pageView' && item.pageView == 'customerService'"
						:index="item.index"
						:bgColor="bgColor"
						customStyle="padding-top: 15px; padding-bottom: 15px"
					>
						<view class="dz-flex dz-row-center">
							<view class="icon">
								<dz-button
									:open-type="parseInt(serviceType) == 4 ? '' : 'contact'"
									:sessionFrom="sessionFrom"
									:border="false"
									@click="listTap(index)"
									hover-class="none"
									:custom-style="{
										display: 'block',
										background: 'transparent',
										margin: '0rpx',
										padding: '0rpx',
										borderRadius: '0rpx',
										borderWidth: '0rpx',
										lineHeight: '1',
										width: '100%',
										height: '100%',
									}"
								>
									<dz-icon
										v-if="page && page == 'my' && !item[name] && item.icon"
										:name="item.icon"
										:size="widthHeight"
										:color="item.color"
									></dz-icon>
									<dz-image
										v-if="item[name] || !item.icon"
										:src="item[name]"
										:borderRadius="itemBorderRadius"
										:width="widthHeight"
										:height="widthHeight"
										mode="widthFix"
									></dz-image>
									<dz-badge type="error" size="mini" :count="customerServiceUnread" :offset="[0, 20]"></dz-badge>
								</dz-button>
							</view>
						</view>

						<text class="dz-grid-label dz-main-color">{{ item[title] }}</text>
					</dz-grid-item>
					<dz-grid-item v-else :index="item.index" :bgColor="bgColor" customStyle="padding-top: 15px; padding-bottom: 15px" @click="listTap(index)">
						<view class="dz-flex dz-row-center">
							<view class="icon">
								<dz-icon
									v-if="page && page == 'my' && !item[name] && item.icon"
									:name="item.icon"
									:size="widthHeight"
									:color="item.color"
								></dz-icon>
								<dz-image
									v-if="item[name] || page == '' || !item.icon"
									:src="item[name]"
									:borderRadius="itemBorderRadius"
									:width="widthHeight"
									:height="widthHeight"
									mode="widthFix"
								></dz-image>
							</view>
						</view>
						<text v-if="isName" class="dz-grid-label dz-main-color">{{ item[title] }}</text>
					</dz-grid-item>
				</block>
			</dz-grid>
		</view>
		<block v-else>
			<scroll-view class="dz-scroll-view" scroll-x @scroll="navScroll">
				<view v-for="(grid, gridIndex) in ListData" :id="'scroll' + gridIndex" :key="gridIndex" class="dz-scroll-view-item">
					<dz-grid :col="col">
						<block v-for="(item, index) in grid" :key="index">
							<dz-grid-item
								v-if="customerService && item.activeMenuType && item.activeMenuType == 'pageView' && item.pageView == 'customerService'"
								:index="item.index"
								:bgColor="bgColor"
								customStyle="padding-top: 15px; padding-bottom: 15px"
							>
								<view class="dz-flex dz-row-center">
									<view class="icon">
										<dz-button
											open-type="contact"
											:sessionFrom="sessionFrom"
											:border="false"
											@click="listTap(index)"
											hover-class="none"
											:custom-style="{
												display: 'block',
												background: 'transparent',
												margin: '0rpx',
												padding: '0rpx',
												borderRadius: '0rpx',
												borderWidth: '0rpx',
												lineHeight: '1',
												width: '100%',
												height: '100%',
											}"
										>
											<dz-icon
												v-if="page && page == 'my' && !item[name] && item.icon"
												:name="item.icon"
												:size="widthHeight"
												:color="item.color"
											></dz-icon>
											<dz-image
												v-if="item[name] || !item.icon"
												:src="item[name]"
												:borderRadius="itemBorderRadius"
												:width="widthHeight"
												:height="widthHeight"
												mode="widthFix"
											></dz-image>
											<dz-badge type="error" size="mini" :count="customerServiceUnread" :offset="[0, 20]"></dz-badge>
										</dz-button>
									</view>
								</view>

								<text v-if="isName" class="dz-grid-label dz-main-color">{{ item[title] }}</text>
							</dz-grid-item>
							<dz-grid-item
								v-else
								:index="item.index"
								:bgColor="bgColor"
								customStyle="padding-top: 15px; padding-bottom: 15px"
								@click="listTap(index)"
							>
								<view class="dz-flex dz-row-center">
									<view class="icon">
										<dz-icon
											v-if="page && page == 'my' && !item[name] && item.icon"
											:name="item.icon"
											:size="widthHeight"
											:color="item.color"
										></dz-icon>
										<dz-image
											v-if="item[name] || page == '' || !item.icon"
											:src="item[name]"
											:borderRadius="itemBorderRadius"
											:width="widthHeight"
											:height="widthHeight"
											mode="widthFix"
										></dz-image>
									</view>
								</view>
								<text v-if="isName" class="dz-grid-label dz-main-color">{{ item[title] }}</text>
							</dz-grid-item>
						</block>
					</dz-grid>
				</view>
			</scroll-view>
			<block v-if="mode == 'slider'">
				<view class="dz-scroll-h-view" :style="{ width: `${scrollPage * 16}px` }" v-if="scrollPage > 1">
					<view class="box"><view class="dot" :style="{ backgroundColor: dotColor, left: `${scrollDot}px` }"></view></view>
				</view>
			</block>
			<view
				v-else
				class="dz-menu-indicator"
				:style="{
					height: mode == 'none' ? '0px' : mode == 'number' ? '46rpx' : '24rpx',
				}"
			>
				<block v-if="mode == 'rect'">
					<view
						v-for="(items, index) in ListData"
						:key="index"
						class="dz-indicator-item-rect"
						:class="{ 'dz-indicator-item-rect-active': index == mCurrent }"
						:style="{ background: index == mCurrent ? dotColor : '' }"
					></view>
				</block>
				<block v-if="mode == 'dot'">
					<view
						v-for="(items, index) in ListData"
						:key="index"
						class="dz-indicator-item-dot"
						:class="{ 'dz-indicator-item-dot-active': index == mCurrent }"
						:style="{ background: index == mCurrent ? dotColor : '' }"
					></view>
				</block>
				<block v-if="mode == 'round'">
					<view
						v-for="(items, index) in ListData"
						:key="index"
						class="dz-indicator-item-round"
						:class="{ 'dz-indicator-item-round-active': index == mCurrent }"
						:style="{ background: index == mCurrent ? dotColor : '' }"
					></view>
				</block>

				<block v-if="mode == 'number'">
					<view class="dz-indicator-item-number">{{ mCurrent + 1 }}/{{ ListData.length }}</view>
				</block>
			</view>
		</block>
	</view>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';

/**
 * 分类宫格导航，最大可以容纳col*4个分类
 * @description 一般用于带图标的目录分类
 * @property {Array} list 目录集合
 * @event {Function} click 点击目录节点时触发
 * @example <dz-gridmenu :list=''></dz-gridmenu>
 */

const props = defineProps({
	//目录列表
	list: {
		type: Array,
		default: () => {
			return [];
		},
	},
	// 指示器的模式，rect|dot|number|round
	mode: {
		type: String,
		default: 'round',
	},
	height: {
		type: [Number, String],
		default: 148,
	},
	// 分成几列
	col: {
		type: [Number, String],
		default: 5,
	},
	// 是否需要分页
	isPage: {
		type: Boolean,
		default: true,
	},

	// 是否显示边框
	border: {
		type: Boolean,
		default: true,
	},
	// 图片圆角
	itemBorderRadius: {
		type: [Number, String],
		default: 45,
	},
	// 图片大小
	widthHeight: {
		type: [Number, String],
		default: 90,
	},
	// 宫格对齐方式，表现为数量少的时候，靠左，居中，还是靠右
	align: {
		type: String,
		default: 'left',
	},
	// 宫格按压时的样式类，"none"为无效果
	hoverClass: {
		type: String,
		default: 'dz-hover-class',
	},
	// 从list数组中读取的图片的属性名
	name: {
		type: String,
		default: 'image',
	},
	// 从list数组中读取的名称的属性名
	title: {
		type: String,
		default: '',
	},
	bgColor: {
		type: String,
		default: '',
	},
	// 圆角值
	borderRadius: {
		type: [Number, String],
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
	marginLeftRight: {
		type: [String, Number],
		default: 0,
	},
	//当目录节点超过col*2个，滚动标点的颜色
	dotColor: {
		type: String,
		default: '#ff0000',
	},
	// 行数
	colNum: {
		type: [Number, String],
		default: 1,
	},
	// 是否显示小程序客服
	customerService: {
		type: Boolean,
		default: false,
	},
	// 小程序客服用户信息
	sessionFrom: {
		type: String,
		default: '',
	},
	// 小程序客服未读数量
	customerServiceUnread: {
		type: [Number, String],
		default: 0,
	},
	//客服模式
	serviceType: {
		type: [Number, String],
		default: 0,
	},
	page: {
		type: String,
		default: '',
	},
	isName: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['click']);
const ListData = ref<array>([]);
const scrollPage = ref<number>(1);
const scrollDot = ref<number>(0);
const mCurrent = ref<number>(0);

onMounted(() => {
	getList();
});

watch(
	() => props.list,
	() => {
		getList();
	}
);

function getList() {
	props.list.forEach((item, index) => {
		item.index = index;
	});
	if (!props.isPage) {
		ListData.value = props.list;
		return;
	}
	ListData.value = group(props.list, parseInt(props.col) * parseInt(props.colNum));
	scrollPage.value = ListData.value.length;
}

function group(array: array, subGroupLength: number): array {
	let index = 0;
	let newArray = [];
	while (index < array.length) {
		newArray.push(array.slice(index, (index += subGroupLength)));
	}
	return newArray;
}

function navScroll(e) {
	//计算公式: 移动距离 /（A总 / B总）
	let pageWidth = scrollPage.value * 16;
	let Width = e.detail.scrollWidth / pageWidth;
	scrollDot.value = e.detail.scrollLeft / Width;
	mCurrent.value = Math.round(e.detail.scrollLeft / (e.detail.scrollWidth / scrollPage.value));
}

function listTap(index: number) {
	emit('click', index);
}
</script>

<style lang="scss" scoped>
.half-height {
	height: 194rpx;
}

.all-height {
	height: 388rpx;
}

.dz-grid-label {
	display: block;
	margin-top: 10rpx;
	overflow: hidden;
	font-size: 24rpx;
	text-align: center;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.dz-scroll-view-box {
	position: relative;
	overflow: hidden;
	.dz-scroll-view {
		position: relative;
		white-space: nowrap;
		width: 100%;
		.dz-scroll-view-item {
			display: inline-block;
			width: 100%;
			height: 100%;
			text {
				color: $dz-main-color;
				font-size: 26rpx;
			}
		}
	}
	.dz-scroll-h-view {
		position: relative;
		height: 8rpx;
		bottom: 16rpx;
		left: 0;
		right: 0;
		width: 32px;
		margin: 16rpx auto 0rpx;
		.box {
			position: relative;
			background: #d0cfcf;
			border-radius: 40rpx;
			width: 100%;
			height: 100%;
			.dot {
				position: absolute;
				width: 16px;
				height: 100%;
				border-radius: 40rpx;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
			}
		}
	}
}
.dz-menu-indicator {
	position: relative;
	top: auto;
	bottom: 4rpx;
	z-index: 99;
	display: flex;
	flex-direction: row;
	justify-content: center;
	width: 100%;
	height: 24rpx;
	padding: 0 24rpx;
	margin: auto;
}
.dz-indicator-item-rect {
	width: 24rpx;
	height: 6rpx;
	margin: 0 6rpx;
	background-color: rgba(0, 0, 0, 0.3);
	transition: all 0.5s;
}

.dz-indicator-item-rect-active {
	background-color: rgba(255, 255, 255, 0.8);
}
.dz-indicator-slider-box {
	display: flex;
	overflow: hidden;
	background: rgba(0, 0, 0, 0.3);
	border-radius: 4rpx;
}
.dz-indicator-item-slider {
	width: 24rpx;
	height: 8rpx;
	transition: all 0.5s;
}
.dz-indicator-item-slider-active {
	background-color: rgba(255, 255, 255, 0.8);
	border-radius: 4rpx;
}

.dz-indicator-item-dot {
	width: 14rpx;
	height: 14rpx;
	margin: 0 6rpx;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 20rpx;
	transition: all 0.5s;
}

.dz-indicator-item-dot-active {
	background-color: rgba(255, 255, 255, 0.8);
}

.dz-indicator-item-round {
	width: 8rpx;
	height: 8rpx;
	margin: 0 6rpx;
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 4rpx;
	transition: all 0.5s;
}

.dz-indicator-item-round-active {
	width: 16rpx;
	background-color: rgba(255, 255, 255, 0.8);
}

.dz-indicator-item-number {
	padding: 8rpx 12rpx;
	font-size: 20rpx;
	line-height: 1;
	color: rgba(255, 255, 255, 0.8);
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 100rpx;
	margin-bottom: 10rpx;
}
</style>

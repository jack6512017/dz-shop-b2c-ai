<template>
	<view>
		<!-- 单行 -->
		<view
			v-if="mode == 'single-file'"
			class="dz-flex single-file"
			:style="{
				margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
			}"
		>
			<view
				v-for="(item, index) in list"
				:key="index"
				:style="[customStyle]"
				class="dz-flex-1 card"
				:class="{
					'maring-r': list.length == 2,
					'maring-3': list.length == 3,
					'maring-4': list.length == 4,
				}"
			>
				<dz-image :src="item.cover" :borderRadius="borderRadius" width="100%" height="100%" @click="listClick(item)"></dz-image>
			</view>
		</view>
		<!-- 两行两列 -->
		<view
			v-if="mode == 'row2Col2'"
			class="box-2"
			:style="{
				margin: `${marginTop}rpx ${marginLeftRight}rpx ${marginBottom}rpx`,
			}"
		>
			<view class="dz-flex">
				<view class="dz-flex-1 card" :style="[customStyle]">
					<dz-image :src="list[0].cover" :borderRadius="borderRadius" width="100%" height="100%" @click="listClick(list[0])"></dz-image>
				</view>
				<view class="dz-flex-1 card" :style="[customStyle]">
					<dz-image :src="list[1].cover" :borderRadius="borderRadius" width="100%" height="100%" @click="listClick(list[1])"></dz-image>
				</view>
			</view>
			<view class="dz-flex" :style="{ marginTop: `${clearance}rpx` }">
				<view class="dz-flex-1 card" :style="[customStyle]">
					<dz-image :src="list[2].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[2])"></dz-image>
				</view>
				<view class="dz-flex-1 card" :style="[customStyle]">
					<dz-image :src="list[3].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[3])"></dz-image>
				</view>
			</view>
		</view>
		<!-- 1左2右 -->
		<view
			v-if="mode == 'leftRight2'"
			class="dz-flex"
			:style="{
				margin: `${marginTop}px ${marginLeftRight}px ${marginBottom}px`,
			}"
		>
			<view class="dz-flex-1 card" :style="[customStyle]">
				<dz-image
					:src="list[0].cover"
					width="100%"
					:height="heightConfig[mode].height * 4 + parseInt(clearance)"
					:borderRadius="borderRadius"
					@click="listClick(list[0])"
				></dz-image>
			</view>
			<view class="dz-flex-1 dz-flex dz-flex-column">
				<view
					class="card"
					:style="{
						height: heightConfig[mode].height * 2 + 'rpx',
						'border-radius': `${borderRadius}rpx`,
					}"
				>
					<dz-image :src="list[1].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[1])"></dz-image>
				</view>
				<view
					class="card"
					:style="{
						height: heightConfig[mode].height * 2 + 'rpx',
						'border-radius': `${borderRadius}rpx`,
						marginTop: `${clearance}rpx`,
					}"
				>
					<dz-image :src="list[2].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[2])"></dz-image>
				</view>
			</view>
		</view>
		<!-- 1上2下 -->
		<view
			v-if="mode == 'topBottom2'"
			:style="{
				margin: `${marginTop}px ${marginLeftRight}px ${marginBottom}px`,
			}"
		>
			<view
				class="card"
				:style="{
					borderRadius: `${borderRadius}rpx`,
					marginBottom: `${clearance}rpx`,
					height: heightConfig[mode].topHeight * 2 + 'rpx',
				}"
			>
				<dz-image :src="list[0].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[0])"></dz-image>
			</view>
			<view>
				<view class="dz-flex">
					<view class="dz-flex-1 card template4" :style="[customStyle]">
						<dz-image :src="list[1].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[1])"></dz-image>
					</view>
					<view class="dz-flex-1 card template4" :style="[customStyle]">
						<dz-image :src="list[2].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[2])"></dz-image>
					</view>
				</view>
			</view>
		</view>

		<view
			v-if="mode == 'leftRight3'"
			class="dz-flex"
			:style="{
				margin: `0 ${marginLeftRight}px`,
			}"
		>
			<view class="dz-flex-1 card" :style="[customStyle]">
				<dz-image
					:src="list[0].cover"
					width="100%"
					:height="(heightConfig[mode].topHeight + heightConfig[mode].bottomHeight) * 2 + clearance"
					:borderRadius="borderRadius"
					@click="listClick(list[0])"
				></dz-image>
			</view>
			<view class="dz-flex-1 dz-flex dz-flex-column">
				<view
					class="card"
					:style="{
						'border-radius': `${borderRadius}rpx`,
						marginBottom: `${clearance}rpx`,
						height: heightConfig[mode].topHeight * 2 + 'rpx',
					}"
				>
					<dz-image :src="list[1].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[1])"></dz-image>
				</view>
				<view class="dz-flex" style="height: 100%; width: 100%">
					<view
						class="card dz-flex-1"
						:style="{
							height: heightConfig[mode].bottomHeight * 2 + 'rpx',
							marginRight: `${clearance}rpx`,
						}"
					>
						<dz-image :src="list[2].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[2])"></dz-image>
					</view>
					<view
						class="card dz-flex-1"
						:style="{
							height: heightConfig[mode].bottomHeight * 2 + 'rpx',
						}"
					>
						<dz-image :src="list[3].cover" width="100%" height="100%" :borderRadius="borderRadius" @click="listClick(list[3])"></dz-image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	url: {
		type: String,
		default: '',
	},
	mode: {
		type: String,
		default: 'single-file',
	},
	// 图片高度
	height: {
		type: [String, Number],
		default: 120,
	},
	borderRadius: {
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
	// 左右边距
	marginLeftRight: {
		type: [String, Number],
		default: 0,
	},
	// 图片间距
	clearance: {
		type: [String, Number],
		default: 0,
	},
	// 图片高度
	heightConfig: {
		type: Object,
		default() {
			return {};
		},
	},
});
const emit = defineEmits(['click']);
const customStyle = computed((): CSSProperties => {
	let style = {
		'border-radius': `${props.borderRadius}rpx`,
		marginRight: props.clearance + 'rpx',
		overflow: 'hidden',
	};
	if (['single-file', 'row2Col2'].includes(props.mode)) {
		style.height = props.heightConfig[props.mode].height * 2 + 'rpx';
	}
	if (props.mode == 'leftRight2') {
		style.height = props.heightConfig[props.mode].height * 4 + props.clearance + 'rpx';
	}
	// 模板6
	if (['topBottom2'].includes(props.mode)) {
		style.height = props.heightConfig[props.mode].bottomHeight * 2 + 'rpx';
	}
	if (props.mode == 'leftRight3') {
		style.height = (props.heightConfig[props.mode].topHeight + props.heightConfig[props.mode].bottomHeight) * 2 + props.clearance + 'rpx';
	}
	return style;
});

function listClick(item: any) {
	emit('click', item);
}
</script>

<style lang="scss" scoped>
.single-file {
	.maring-r {
		height: 360rpx;
	}

	.maring-3 {
		height: 170rpx;
	}

	.maring-4 {
		height: 240rpx;
	}
}
.card {
	width: 100%;
	height: 100%;
}
.card:last-child {
	margin-right: 0 !important;
}

.dz-height {
	height: 380rpx;
}

.template4 {
	height: 214rpx;
}
.template5 {
	box-sizing: border-box;
	height: 452rpx;
}

.topBottom-h {
	height: 304rpx;
	overflow: hidden;
}
</style>

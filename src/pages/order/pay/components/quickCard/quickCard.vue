<template>
	<view>
		<dz-popup
			:maskCloseAble="maskCloseAble"
			mode="bottom"
			:popup="false"
			:borderRadius="borderRadius"
			v-model:show="modelValueShow"
			length="60%"
			:closeable="true"
			:safeAreaInsetBottom="safeAreaInsetBottom"
			@close="close"
			:z-index="mZIndex"
			title="银行查询"
			:showTitle="true"
		>
			<template #custom-content>
				<dz-input
					v-model="keyword"
					prefixIcon="search"
					prefixIconStyle="color:#606266"
					placeholder="输入关键字"
					:clearable="true"
					border="none"
					:customStyle="{ padding: '8rpx 20rpx', margin: '0 20rpx 20rpx', borderRadius: '50rpx', background: theme.dzBgColor }"
					@confirm="handleSearch"
					@change="inputFocus"
				>
					<template #suffix>
						<view class="dz-content-color dz-p-b-2" @tap="handleSearch">搜索</view>
					</template>
				</dz-input>
			</template>
			<view class="cell">
				<view class="cell-item" v-for="(item, index) in options" :key="index">
					<view class="left">
						<view class="dot" :style="{ background: item.value == 1 ? theme.dzBaseColor : theme.dzTipsColor }"></view>
						<view :style="{ color: item.value == 1 ? '' : theme.dzTipsColor }">{{ item.label }}</view>
					</view>
					<view class="dz-font-24" :style="{ color: item.value == 1 ? '' : theme.dzTipsColor }">{{ item.value == 1 ? '支持' : '不支持' }}</view>
				</view>
			</view>
		</dz-popup>
	</view>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useUserStore } from '@/state/modules/user';
import data from './data.json';

const props = defineProps({
	// 通过双向绑定控制组件的弹出与收起
	modelValue: {
		type: Boolean,
		default: false,
	},
	// 弹出的z-index值
	zIndex: {
		type: [String, Number],
		default: 0,
	},
	// 显示显示弹窗的圆角，单位rpx
	borderRadius: {
		type: [Number, String],
		default: 40,
	},
	safeAreaInsetBottom: {
		type: Boolean,
		default: false,
	},
	// 是否允许通过点击遮罩关闭Picker
	maskCloseAble: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['update:modelValue']);
const userStore = useUserStore();
const modelValueShow = ref<boolean>(false);
const options = ref<array>(data);
const keyword = ref('');

watch(
	() => props.modelValue,
	(val) => {
		modelValueShow.value = val;
	}
);

const theme = computed(() => {
	return userStore.getTheme;
});

// 如果用户有传递z-index值，优先使用
// this.$api.zIndex.popup
const mZIndex = computed(() => {
	return props.zIndex ? props.zIndex : 1000;
});

// 清除搜索
function inputFocus() {
	if (!keyword.value) {
		handleSearch();
	}
}

// 确定搜索
function handleSearch() {
	options.value = search(data, keyword.value);
}

function search(list, value) {
	return list.filter((item) => item.label.includes(value));
}

function close() {
	emit('update:modelValue', false);
}
</script>

<style scoped lang="scss">
.cell {
	padding: 0 20rpx 184rpx;
	.dot {
		width: 16rpx;
		height: 16rpx;
		margin-right: 10rpx;
		border-radius: 8rpx;
	}
	.cell-item {
		display: flex;
		justify-content: space-between;
		margin-top: 10rpx;
		.left {
			display: flex;
			align-items: center;
		}
	}
}
</style>

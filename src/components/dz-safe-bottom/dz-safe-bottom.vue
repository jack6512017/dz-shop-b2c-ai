<template>
	<view class="dz-safe-bottom" :style="[style]" :class="[!isNvue && 'safe-area-inset-bottom']"></view>
</template>

<script lang="ts" setup>
/**
 * SafeBottom 底部安全区
 * @description 这个适配，主要是针对IPhone X等一些底部带指示条的机型，指示条的操作区域与页面底部存在重合，容易导致用户误操作，因此我们需要针对这些机型进行底部安全区适配。
 * @tutorial https://www.uviewui.com/components/safeAreaInset.html
 * @property {Object}	customStyle	定义需要用到的外部样式
 *
 * @event {Function()}
 * @example <dz-safe-bottom></dz-safe-bottom>
 */
import { ref, computed, onMounted } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	customStyle: {
		type: [String, Object],
		default: () => ({}),
	},
});
const isNvue = ref<boolean>(false);

const style = computed((): CSSProperties => {
	const style = {};
	// #ifdef APP-NVUE
	// nvue下，高度使用js计算填充
	style.height = uni.$api.addUnit(uni.$api.sys().safeAreaInsets.bottom, 'px');
	// #endif
	return uni.$api.deepMerge(style, uni.$api.addStyle(props.customStyle));
});

onMounted(() => {
	// #ifdef APP-NVUE
	// 标识为是否nvue
	isNvue.value = true;
	// #endif
});
</script>

<script lang="ts">
export default { options: { virtualHost: true } };
</script>

<style lang="scss" scoped>
.dz-safe-bottom {
	/* #ifndef APP-NVUE */
	width: 100%;
	/* #endif */
}
</style>

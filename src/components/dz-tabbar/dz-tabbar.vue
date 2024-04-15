<template>
	<view>
		<dz-tabbar-content :value="value" :placeholder="true" :safeAreaInsetBottom="true" :activeColor="activeColor" :inactiveColor="inactiveColor">
			<dz-tabbar-item v-for="(item, index) in list" :key="index" :text="item.text" :name="item.pagePath" :badge="item.count" @click="clickHandler(index)">
				<template #active-icon>
					<dz-icon :name="item.selectedIconPath" :color="activeColor" :size="40"></dz-icon>
				</template>
				<template #inactive-icon>
					<dz-icon :name="item.iconPath" :color="inactiveColor" :size="40"></dz-icon>
				</template>
			</dz-tabbar-item>
		</dz-tabbar-content>
	</view>
</template>

<script lang="ts" setup>
import dzTabbarContent from './dz-tabbar-content.vue';
import propsConfig from './props';

const props = defineProps({
	// 配置参数
	list: {
		type: Array,
		default() {
			return [];
		},
	},
	...propsConfig,
});

uni.hideTabBar();

function clickHandler(index) {
	uni.$api.throttle(() => {
		const pages = [
			'/pages/main/index/index',
			'/pages/main/category/category',
			'/pages/main/discover/discover',
			'/pages/main/cart/cart',
			'/pages/main/profile/profile',
		];

		// 如果有配置pagePath属性，使用uni.switchTab进行跳转
		if (props.list[index].pagePath) {
			if (pages.includes(props.list[index].pagePath)) {
				uni.switchTab({
					url: props.list[index].pagePath,
				});
			} else {
				uni.navigateTo({ url: props.list[index].pagePath });
			}
		}
	});
}
</script>

<script lang="ts">
export default { options: { virtualHost: true } };
</script>

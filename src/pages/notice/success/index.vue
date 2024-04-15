<template>
	<view>
		<dz-empty name="roundcheckfill" iconSize="180" :iconColor="theme.dzTypeSuccess" text="" :iconStyle="{ marginTop: '200rpx' }">
			<template #bottom>
				<view class="dz-text-center">
					<view class="dz-font-36 dz-font-weight">{{ tilte }}</view>
					<view class="dz-m-t-10 dz-color-9 dz-font-24">{{ sub }}</view>
					<view class="dz-m-t-50">
						<dz-button
							:border="false"
							:custom-style="{ width: '230rpx', height: '80rpx', background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
							hover-class="none"
							size="medium"
							shape="circle"
							@click="navTo(1)"
						>
							返回
						</dz-button>
						<dz-button
							:border="false"
							:custom-style="{
								width: '230rpx',
								height: '80rpx',
								marginLeft: '20rpx',
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							@click="navTo(2)"
						>
							用户中心
						</dz-button>
					</view>
				</view>
			</template>
		</dz-empty>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const tilte = ref<string>(language.notice.successTitle);
const sub = ref<string>(language.notice.failSub);

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: uni.$api.language.notice.successTitle });
	if (options.title) {
		title.value = decodeURIComponent(options.title);
	}
	if (options.sub) {
		sub.value = decodeURIComponent(options.sub);
	}
});

const theme = computed(() => {
	return userStore.getTheme;
});

function navTo(page) {
	if (page == 1) {
		let pages = getCurrentPages();
		if (pages.length == 1) {
			uni.reLaunch({
				url: uni.$api.appConfig.indexPath,
			});
		} else {
			uni.navigateBack();
		}
	} else if (page == 2) {
		uni.$api.router({
			url: uni.$api.routesConfig.profile,
		});
	}
}
</script>

<style lang="scss">
page {
	background: #fff;
}
</style>

<template>
	<view>
		<dz-navbar title="帮助"></dz-navbar>
		<view class="content">
			<block v-for="(item, index) in helperList" :key="index">
				<dz-cell-item hover-class="none" :border-bottom="false" @tap="handelChild(index)">
					<template #title>
						<view @tap.stop="tapTitle(item)">{{ item.title }}</view>
					</template>
				</dz-cell-item>
				<dz-line v-if="index != helperList.length - 1"></dz-line>
			</block>
		</view>
		<dz-select v-model="selectShow" mode="single-column" value-name="id" :list="helperChild" label-name="title" @confirm="helperConfirm"></dz-select>
		<dz-empty v-if="!helperList.length" margin-top="160" :src="empty" iconSize="360"></dz-empty>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const helperList = ref<array>([]);
const helperChild = ref<array>([]);
const selectShow = ref<boolean>(false);
const empty = ref<string>(uni.$api.assetsConfig.empty);

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '帮助',
	});
	getHelperIndex();
});

async function getHelperIndex() {
	await uni.$api.http.get(uni.$api.apiBase.helperIndex).then((res) => {
		helperList.value = res.data;
	});
}

function handelChild(index: number) {
	if (helperList.value[index] && helperList.value[index].child.length > 0) {
		selectShow.value = true;
		helperChild.value = helperList.value[index].child;
	} else {
		const item = [{ value: helperList.value[index].id, label: helperList.value[index].title }];
		helperConfirm(item);
	}
}

function tapTitle(val) {
	const item = [{ value: val.id, label: val.title }];
	helperConfirm(item);
}

function helperConfirm(val) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.helperDetail,
		query: {
			id: val[0].value,
			title: val[0].label,
		},
	});
}
</script>

<style lang="scss">
page {
	background-color: #ffffff;
}
.content {
	padding: 0 20rpx;
}
</style>

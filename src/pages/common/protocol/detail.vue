<template>
	<view>
		<dz-navbar :title="title" :followTheme="false"></dz-navbar>
		<dz-parse class="dz-p-20" :content="content" lazy-load></dz-parse>
	</view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const title = ref<string>('');
const field = ref<string>('');
const content = ref<string>('');

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: options.title,
	});
	title.value = options.title;
	field.value = options.field;
	getConfigList();
});

async function getConfigList() {
	if (!field.value) {
		return;
	}
	await uni.$api.http
		.get(uni.$api.apiBase.protocolDetail, {
			params: {
				type: field.value,
			},
		})
		.then((res) => {
			content.value = res.data ? res.data.content : null;
		});
}
</script>

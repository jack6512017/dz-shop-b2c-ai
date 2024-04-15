<template>
	<view class="container">
		<dz-navbar :is-fixed="true" :title="language.search.titleSearch"></dz-navbar>
		<view class="content">
			<view class="dz-searchbox">
				<dz-search
					v-model="key"
					:placeholder="searchDefault || language.search.enterKeywords"
					:show-action="true"
					input-align="left"
					:focus="true"
					@search="searchConfirm"
					@custom="searchConfirm"
				></dz-search>
			</view>
			<view class="dz-search-history">
				<view class="dz-history-header">
					<view class="dz-search-title dz-main-color">{{ language.search.searchHistory }}</view>
					<block v-if="productSearch.length">
						<view v-if="isClosable" class="dz-flex">
							<view class="dz-tips-color" @click="handleAllDelete()">全部删除</view>
							<dz-line margin="0 12rpx 0 12rpx" direction="col" length="20px" color="#A3A3A3"></dz-line>
							<view @click="handleOk()" :style="{ color: theme.dzBaseColor }">完成</view>
						</view>
						<dz-icon v-else name="deletefill" size="36" color="#999" @click="openModal"></dz-icon>
					</block>
				</view>
				<view class="flex-row flex flex-wrap">
					<block v-for="(item, index) in productSearch" :key="index">
						<dz-tag
							v-if="index < searchShowLength"
							class="dz-search-tag dz-line-1"
							:index="item"
							type="info"
							shape="circle"
							:bgColor="theme.dzBgColor"
							:borderColor="theme.dzBgColor"
							@click="quickSearch"
						>
							<view class="text dz-line-1" :id="'tag-' + index">{{ item }}</view>
							<view v-if="isClosable" class="close" @tap.stop="deleteChange(index)">
								<!-- #ifdef MP -->
								<dz-icon name="roundclosefill" color="#A3A3A3" size="30"></dz-icon>
								<!-- #endif -->
								<!-- #ifndef MP -->
								<dz-icon name="roundclosefill" color="#A3A3A3"></dz-icon>
								<!-- #endif -->
							</view>
						</dz-tag>
					</block>
					<dz-tag
						v-if="
							productSearch.length > searchDefaultLength ||
							(productSearch.length == searchShowLength && productSearch.length > searchDefaultLength)
						"
						class="dz-search-tag dz-line-1"
						type="info"
						shape="circle"
						:bgColor="theme.dzBgColor"
						:borderColor="theme.dzBgColor"
						@click="searchShowClick"
					>
						<dz-icon :name="productSearch.length == searchShowLength ? 'fold' : 'unfold'" color="#999"></dz-icon>
					</dz-tag>
				</view>
				<view class="dz-no-data dz-tips-color" v-if="productSearch.length === 0">{{ language.search.noRecord }}</view>
			</view>
			<view class="dz-search-hot">
				<view class="dz-hot-header">
					<view class="dz-search-title dz-main-color">{{ language.search.hotSearch }}</view>
				</view>
				<view class="flex-row flex flex-wrap">
					<block v-for="(item, index) in productSearchHot" :key="index">
						<dz-tag
							class="dz-search-tag dz-line-1"
							:text="item"
							:index="item"
							type="info"
							shape="circle"
							:bgColor="theme.dzBgColor"
							:borderColor="theme.dzBgColor"
							@click="quickSearch"
						></dz-tag>
					</block>
				</view>
				<view class="dz-no-data dz-tips-color" v-if="productSearchHot.length === 0">{{ language.search.noHotRecord }}</view>
			</view>
		</view>
		<dz-modal
			v-model:show="modalShow"
			:mask-close-able="false"
			:showTitle="false"
			:content="language.search.clearSearchHistory"
			:contentStyle="{ color: theme.dzMainColor, fontSize: '32rpx', fontWeight: 'bold' }"
			:show-cancel-button="!modalLoading"
			:confirm-color="theme.dzBaseColor"
			:async-close="true"
			@cancel="modalCancel"
			@confirm="modalConfirm"
		></dz-modal>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const key = ref<string>('');
const productSearchHot = ref(userStore.getProductSearchHot);
const productSearchDefault = ref(userStore.getProductSearchDefault);
const productSearch = ref<array>(userStore.getProductSearch);
const searchDefault = ref<string>(productSearchDefault);
const searchDefaultLength = ref<number>(6);
const searchShowLength = ref<number>(6);
const modalShow = ref<boolean>(false);
const modalLoading = ref<boolean>(false);
const isClosable = ref<boolean>(false);

onLoad(async (options) => {
	await uni.$onLaunched;
	if (options.key) {
		key.value = options.key;
	}
	uni.setNavigationBarTitle({ title: language.search.titleSearch });
});

onBackPress(() => {
	uni.hideKeyboard();
});

const theme = computed(() => {
	return userStore.getTheme;
});

function quickSearch(e: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.productList,
		query: {
			keyword: e,
		},
	});
}

function searchShowClick() {
	if (searchShowLength.value < productSearch.value.length) {
		searchShowLength.value = productSearch.value.length;
	} else {
		searchShowLength.value = 6;
	}
}

function deleteChange(index: number) {
	productSearch.value.splice(index, 1);
	userStore.setProductSearch(productSearch.value);
}

function openModal() {
	isClosable.value = true;
}

function handleOk() {
	isClosable.value = false;
}

function handleAllDelete() {
	modalShow.value = true;
}

function modalCancel() {
	if (!modalLoading.value) {
		modalShow.value = false;
	}
}

function modalConfirm() {
	userStore.setProductSearch([]);
	productSearch.value = [];
	isClosable.value = false;
	modalShow.value = false;
}

function searchConfirm() {
	if (key.value == '') {
		key.value = searchDefault.value;
	}
	if (key.value != '') {
		let s = productSearch.value;
		s.unshift(key.value);
		let sn = Array.from(new Set(s));
		let snLength = sn.length;
		if (snLength > 30) {
			sn = sn.splice(0, snLength - 30);
		}
		s = sn;
		userStore.setProductSearch(s);
	}

	uni.$api.router.push({
		route: uni.$api.routesConfig.productList,
		query: {
			keyword: key.value,
		},
	});
}
</script>

<style lang="scss">
page,
.container {
	width: 100%;
	height: 100%;
	background: #fff !important;
}

.dz-search-tag {
	position: relative;
	max-width: 100%;
	/* #ifdef MP */
	.dz-tag {
		margin: 0rpx 12rpx 12rpx 0rpx !important;
	}
	/* #endif */
	/* #ifndef MP */
	margin: 0rpx 12rpx 12rpx 0rpx !important;
	/* #endif */
	font-size: 28rpx !important;
	color: $dz-main-color !important;
	overflow: visible;
	.text {
		display: inline-block;
		max-width: 100%;
	}
	.close {
		position: absolute;
		/* #ifdef MP */
		right: 5rpx;
		top: -15rpx;
		/* #endif */
		/* #ifndef MP */
		right: -10rpx;
		top: -10rpx;
		/* #endif */
	}
}

.content {
	padding: 0 30rpx 30rpx 30rpx;
	box-sizing: border-box;
}
.dz-searchbox {
	padding: 30rpx 0;
}
.dz-history-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 10rpx 30rpx 0rpx;
}
.dz-search-title {
	font-size: 32rpx;
	font-weight: bold;
}
.dz-hot-header {
	padding: 30rpx 0;
}
.dz-no-data {
	text-align: center;
	font-size: 28rpx;
}
</style>

<template>
	<view class="knowledge-container">
		<dz-navbar title="知识付费首页"></dz-navbar>
		<view class="dz-p-24">
			<view class="dz-font-36 dz-m-b-20 dz-color-9">{{ title }}</view>
			<view class="dz-flex">
				<view style="flex-shrink: 0; margin-right: 10rpx; width: 70rpx; font-size: 30rpx; line-height: 60rpx">类型</view>
				<dz-button-tabs
					style="width: 660rpx"
					:list="list"
					name="title"
					:height="50"
					:button-radius="12"
					bg-color="#fff"
					:active-color="theme.dzBaseFontColor"
					inactive-color="#333"
					:active-bg-color="theme.dzBaseColor"
					inactive-bg-color="#fff"
					:bold="true"
					:current="cateIndex"
					@change="cate"
				></dz-button-tabs>
			</view>
			<view class="dz-flex">
				<view style="flex-shrink: 0; margin-right: 10rpx; width: 70rpx; font-size: 30rpx; line-height: 60rpx">分类</view>
				<dz-button-tabs
					style="width: 660rpx"
					:list="childList"
					name="title"
					:height="50"
					:button-radius="12"
					bg-color="#fff"
					:active-color="theme.dzBaseFontColor"
					inactive-color="#333"
					:active-bg-color="theme.dzBaseColor"
					inactive-bg-color="#fff"
					:bold="true"
					:current="child"
					@change="childCate"
				></dz-button-tabs>
			</view>
		</view>
		<view class="content">
			<dz-row gutter="20">
				<dz-col :span="4" v-for="item in content" :key="item.id">
					<view @click="particulars(item.id)" class="div">
						<image :src="item.cover"></image>
						<view class="txt">{{ item.title }}</view>
					</view>
				</dz-col>
			</dz-row>
		</view>
		<dz-loadmore v-if="loading" status="loading" margin-top="20" margin-bottom="20"></dz-loadmore>
		<view v-if="!content.length && !loading" class="dz-flex dz-flex-column dz-row-center">
			<dz-image :src="empty" width="360" height="360"></dz-image>
			<view style="color: rgb(192, 196, 204)">暂无知识内容~</view>
		</view>
		<dz-page-loading :show="loadingShow" :status="loadingStatus" @click="getList"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const empty = uni.$api.assetsConfig.emptyOrder;
const data = reactive({
	title: '全部',
	list: [],
	childList: [{ id: '9999999', title: '全部' }],
	cateIndex: 0,
	child: 0,
	content: [],
	allId: null,
	loadingShow: true,
	loading: false,
	loadingStatus: 'loading',
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	getList();
});

onPullDownRefresh(() => {
	getList();
	data.title = '全部';
	data.cateIndex = 0;
	data.child = 0;
});

function getList() {
	uni.$api.http.get(uni.$api.apiShop.knowledgeTopCates).then((res) => {
		data.list = res.data;
		data.list.unshift({
			id: '9999999',
			title: '全部',
		});
	});
	getContent();
	uni.stopPullDownRefresh();
}

function cate({ index }) {
	if (index == 0) {
		data.title = '全部';
		getContent();
		data.cateIndex = 0;
		data.child = 0;
		data.childList = [{ id: '9999999', title: '全部' }];
		return;
	}
	data.allId = data.list[index].id;
	getCateContent(data.allId);
	data.child = 0;
	data.cateIndex = index;
	data.title = data.list[index].title;
	uni.$api.http
		.get(uni.$api.apiShop.knowledgeChildCates, {
			params: {
				pid: data.allId,
			},
		})
		.then((res) => {
			data.childList = res.data;
			data.childList.unshift({
				id: '9999999',
				title: '全部',
			});
		});
}

function childCate({ index }) {
	if (index == 0) {
		if (data.cateIndex == 0) {
			getContent();
		} else {
			getCateContent(data.allId);
		}

		return (data.child = index);
	}
	data.child = index;
	const childCateId = data.childList[index].id;
	getCateContent(childCateId);
}

// 获取知识付费列表
function getContent() {
	uni.$api.http
		.get(uni.$api.apiShop.knowledgeIndex)
		.then((res) => {
			data.content = res.data;
			data.loadingShow = false;
		})
		.catch(() => {
			data.loadingStatus = 'error';
		})
		.finally(() => {
			data.loading = false;
		});
}
// 根据分类id获取知识付费列表
function getCateContent(id) {
	data.loading = true;
	data.content = [];
	uni.$api.http
		.get(uni.$api.apiShop.knowledgeIndex, {
			params: {
				cate_id: id,
			},
		})
		.then((res) => {
			data.content = res.data;
		})
		.finally(() => {
			data.loading = false;
		});
}

// 跳转到详情列表
function particulars(id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.knowledgeDetails,
		query: {
			id,
		},
	});
}

const { title, list, cateIndex, childList, child, content, loading, loadingShow, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.knowledge-container {
	height: 100%;
	background-color: #fff;
	.content {
		margin: 0 12rpx 20rpx;
		.div {
			margin-bottom: 20rpx;
			width: 100%;
			image {
				width: 100%;
				height: 300rpx;
				border-radius: 15rpx;
			}
			.txt {
				padding: 10rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}
}
</style>

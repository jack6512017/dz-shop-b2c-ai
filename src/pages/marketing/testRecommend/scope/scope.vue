<template>
	<view class="content-page">
		<dz-navbar title="测评结果"></dz-navbar>
		<dz-empty v-if="list == null" text="暂无测评结果" :src="empty" iconSize="360"></dz-empty>
		<view v-else>
			<dz-title title="评价建议" mode="line" :barColor="theme.dzBgColor" :customStyle="{ justifyContent: 'flex-start', paddingLeft: '20rpx' }"></dz-title>
			<view class="form-box"><dz-parse :content="list.suggest" lazy-load></dz-parse></view>
			<view class="dz-content">
				<dz-title
					title="推荐商品"
					mode="line"
					:barColor="theme.dzBgColor"
					:customStyle="{ justifyContent: 'flex-start', paddingLeft: '20rpx' }"
				></dz-title>
				<view style="margin-top: -10rpx">
					<scroll-view scroll-x class="h-list-history" v-if="list.scopeProducts.length != 0">
						<view class="h-item-history" v-for="item in list.scopeProducts" :key="item.id" @tap.stop="navToProduct(item, item.product_id)">
							<view class="h-item-img"
								><dz-image :src="item.product_picture" borderRadius="12" width="180" height="180" mode="aspectFill"></dz-image
							></view>
							<view class="h-item-text">{{ item.product_name }}</view>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>
		<dz-page-loading :show="loadingShow" :status="loadingStatus" @click="getList"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const empty = uni.$api.assetsConfig.empty;
const data = reactive({
	score: null,
	subject_id: null,
	loadingShow: true,
	loadingStatus: 'loading',
	list: {
		scopeProducts: ['0'],
	},
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.score = options.score;
	data.subject_id = options.subject_id;
	getList();
});

function getList() {
	uni.$api.http
		.post(uni.$api.apiShop.testRecommendAnswer, {
			subject_id: data.subject_id,
			score: data.score,
		})
		.then((res) => {
			data.list = res.data;
			data.loadingShow = false;
		})
		.catch(() => {
			data.loadingStatus = 'error';
		});
}

function navToProduct(type, id) {
	if (parseInt(type.status) == 0) return uni.$api.toast(uni.$api.language.user.productTheShelves);

	uni.$api.router.push({
		route: uni.$api.routesConfig.product,
		query: {
			id,
		},
	});
}

const { list, loadingShow, loadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
page,
.content-page {
	height: 100%;
	background: #fff;
}
.form-box {
	padding: 20rpx;
}

.dz-content {
	border-radius: 20rpx;
	overflow: hidden;
}

.h-list-history {
	margin: 0;
	padding-left: 20rpx;
	border-radius: 10rpx;
	white-space: nowrap;

	.h-item-history {
		display: inline-block;
		font-size: 24rpx;
		color: $dz-tips-color;
		width: 180rpx;
		margin: 20rpx 20rpx 0 0;
		border-radius: 10upx;
		position: relative;
		top: 0;
		overflow: hidden;

		.h-item-img {
			width: 100%;
			height: 180rpx;
			border-radius: 12rpx;
		}

		.tag {
			position: absolute;
			border-top-left-radius: 12rpx;
			top: 0;
			left: 0;
			width: 60rpx;
			height: 60rpx;
		}

		.h-item-text {
			display: flex;
			white-space: normal;
			width: 170rpx;
			height: 52rpx;
			line-height: 26rpx;
			font-size: 20rpx;
			margin: 10rpx 6rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}
	}
}
</style>

<template>
	<view>
		<dz-navbar title="评价详情"></dz-navbar>
		<view class="content">
			<view class="product-box dz-m-b-20">
				<view class="product">
					<view class="image"><dz-image :src="evaluateProduct.product_picture" :borderRadius="12" :width="120" :height="120"></dz-image></view>
					<view class="name">{{ evaluateProduct.product_name }}</view>
				</view>
			</view>
			<view class="product-evaluation">
				<view class="evaluation-top">
					<view>商品评价</view>
					<dz-rate
						class="rate-padding"
						:disabled="true"
						gutter="10"
						size="40"
						:value="evaluateProduct.scores"
						inactive-icon="favor_light"
						active-icon="favor_fill_light"
					></dz-rate>
					<view :style="{ color: theme.dzBaseColor }">{{ scoresList[parseInt(evaluateProduct.scores) - 1] }}</view>
				</view>
				<view class="evaluation-text">
					<view class="text">{{ evaluateProduct.content }}</view>
					<view class="covers">
						<dz-row gutter="10">
							<dz-col span="4" v-for="(item, index) in evaluateProduct.covers" :key="index" @tap="previewImgs(item, evaluateProduct.covers)">
								<image :src="item" mode="widthFix" lazy-load></image>
							</dz-col>
						</dz-row>
					</view>
					<view class="tiem">{{ api.timeFormat(evaluateProduct.created_time) }}</view>
				</view>
				<view class="evaluate-again" v-if="evaluateProduct.has_again == 1">
					<view class="title" :style="{ color: theme.dzBaseDark }">商品追评</view>
					<view class="dz-m-b-10">{{ evaluateProduct.again_content }}</view>
					<view class="covers">
						<dz-row gutter="10">
							<dz-col
								span="4"
								v-for="(item, index) in evaluateProduct.again_covers"
								:key="index"
								@tap="previewImgs(item, evaluateProduct.again_covers)"
							>
								<image :src="item" mode="widthFix" lazy-load></image>
							</dz-col>
						</dz-row>
					</view>
					<view class="again-time">{{ api.timeFormat(evaluateProduct.created_time) }}</view>
				</view>
				<view class="btn" v-if="evaluateProduct.has_again == 0">
					<dz-button
						type="info"
						hoverClass="none"
						:border="false"
						@click="toEvaluation(evaluateProduct, 'add')"
						shape="circle"
						size="medium"
						:customStyle="{ width: '160rpx', height: '60rpx', background: '#fff', border: '1rpx solid rgba(0, 0, 0, 0.12)' }"
					>
						<view class="dzicon-iconfont dzicon-post" style="font-size: 28rpx; margin-right: 10rpx"></view>
						<view>写追评</view>
					</dz-button>
				</view>
			</view>
		</view>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStaus" @click="loadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const data = reactive({
	evaluateProduct: {},
	scoresList: ['失望', '一般', '满意', '喜欢', '超爱'],
	pageLoadingShow: false,
	pageLoadingStaus: 'loading',
	params: null,
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.params = options;
	getEvaluateProduct(options);
});

function loadingClick() {
	getEvaluateProduct();
}

async function getEvaluateProduct() {
	data.pageLoadingShow = true;
	await uni.$api.http
		.get(uni.$api.apiShop.productEvaluateProduct, {
			params: {
				order_id: data.params.order_id,
				order_product_id: data.params.product_id,
			},
		})
		.then((res) => {
			data.evaluateProduct = res.data;
			data.pageLoadingShow = false;
		})
		.catch(() => {
			data.pageLoadingStaus = 'error';
		});
}

// 去评论
function toEvaluation(item, type) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.evaluation,
		query: {
			data: JSON.stringify(item),
			type: type,
		},
	});
}

// 预览图片
function previewImgs(img, imgList) {
	uni.previewImage({
		current: img,
		urls: imgList,
	});
}

const { evaluateProduct, scoresList, pageLoadingShow, pageLoadingStaus } = { ...toRefs(data) };
</script>

<style lang="scss">
.content {
	padding: 20rpx;
}
.product-box {
	padding: 20rpx;
	background: #ffffff;
	border-radius: 20rpx;
	.product {
		display: flex;
		align-items: center;
		padding: 20rpx 10rpx;
		.image {
			flex-shrink: 0;
			width: 120rpx;
			height: 120rpx;
			border-radius: 10rpx;
		}
		.name {
			margin-left: 20rpx;
			font-size: 28rpx;
			color: $dz-main-color;
		}
	}
}
.product-evaluation {
	padding: 30rpx 20rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	.evaluation-top {
		display: flex;
		font-size: 28rpx;
		color: $dz-main-color;
		.rate-padding {
			margin: 0 20rpx;
		}
	}
	.text {
		font-size: 28rpx;
		line-height: 48rpx;
		color: $dz-main-color;
		margin-bottom: 10rpx;
	}
	.evaluation-text {
		margin-top: 20rpx;

		.tiem {
			margin-top: 10rpx;
			font-size: 24rpx;
			color: $dz-tips-color;
		}
	}
	.covers {
		image {
			width: 100%;
		}
	}
	.again-time {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: $dz-tips-color;
	}
	.evaluate-again {
		margin-top: 30rpx;
		.title {
			margin-bottom: 20rpx;
			font-size: 28rpx;
		}
	}
	.btn {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 30rpx;
	}
}
</style>

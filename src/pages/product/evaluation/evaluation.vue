<template>
	<view class="dz-p-b-20">
		<dz-navbar :title="language.productEvaluation.title"></dz-navbar>
		<view class="dz-header">{{ api.formatString(language.productEvaluation.ratioTip, data.evaluateStat.ratio) }} </view>
		<view class="dz-attr-box">
			<view
				class="dz-attr-item"
				v-for="(item, index) in data.evaluateItem"
				:style="{
					background: index == activeIndex ? '#fff' : theme.dzBgColor,
					color: index == activeIndex ? theme.dzBaseColor : '#333',
					borderColor: index == activeIndex ? theme.dzBaseColor : theme.dzBgColor,
				}"
				@tap="attrClick(index, item.type)"
				:key="index"
			>
				{{ item.name }}
				<text>{{ item.number }}</text>
			</view>
		</view>
		<view class="dz-evaluate__box" v-for="(item, index) in evaluationList" :key="index">
			<view class="dz-flex__center">
				<image :src="item.member_head_portrait || missingFace" class="dz-avatar"></image>
				<view class="dz-nickname">{{ item.member_nickname || language.application.anonymous }}</view>
			</view>
			<view class="dz-content__box">
				<view class="dz-rate__box">
					<dz-rate :value="item.scores" :disabled="true" active-icon="favor_fill_light"></dz-rate>
					<text>{{ api.timeFormat(item.created_at) }}</text>
				</view>
				<view class="dz-desc">{{ item.content }}</view>
				<view class="dz-img__box" v-if="item.covers && item.covers.length > 0">
					<block v-for="(src, subIndex) in item.covers" :key="subIndex">
						<image @tap.stop="previewImage(index, subIndex)" :src="src" mode="aspectFill"></image>
					</block>
				</view>
				<view class="dz-explain_box" v-if="item.explain_first">
					<view class="arrow_up"></view>
					<view class="explain_box">
						<view class="dz-explain-color dz-color-9">{{ language.productEvaluation.explain }}</view>
						<view class="dz-desc dz-explain-color dz-color-6">{{ item.explain_first }}</view>
					</view>
				</view>
				<view class="dz-append_box" v-if="parseInt(item.has_again) === 1">
					<view class="dz-append-date" :style="{ color: theme.dzBaseColor }">
						{{ api.formatString(language.productEvaluation.againTip, api.timeDayDiff(item.created_time, item.again_addtime)) }}
					</view>
					<view class="dz-desc">{{ item.again_content }}</view>
				</view>
				<view class="dz-img__box" v-if="item.again_covers && item.again_covers.length > 0">
					<block v-for="(src, subIndex) in item.again_covers" :key="subIndex">
						<image @tap.stop="previewAgainImage(index, subIndex)" :src="src" mode="aspectFill"></image>
					</block>
				</view>
				<view class="dz-explain_box" v-if="item.again_explain">
					<view class="arrow_up"></view>
					<view class="explain_box">
						<view class="dz-explain-color dz-color-9">{{ language.productEvaluation.explain }}</view>
						<view class="dz-desc dz-explain-color dz-color-6">{{ item.again_explain }}</view>
					</view>
				</view>
				<view class="dz-op__box dz-flex__center">
					<view class="dz-specs">{{ item.sku_name || defaultSku }}</view>
					<view class="dz-flex__center"> </view>
				</view>
			</view>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata'" :margin-top="80" :src="emptyMsg" :iconSize="360"></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<view v-if="loadingStatus == 'loading'"><dz-loadmore :status="loadingStatus" :margin-top="20"></dz-loadmore> </view>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const missingFace = uni.$api.assetsConfig.missingFace;
const defaultSku = uni.$api.language.application.defaultSkuName;
const emptyMsg = uni.$api.assetsConfig.emptyMsg;
const activeIndex = ref<number>(0);
const data = reactive({
	activeType: {},
	evaluateStat: {},
	evaluateItem: [],
});
const page = ref<number>(1);
const loadingStatus = ref<string>('loading');
const evaluationList = ref<array>([]);

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: uni.$api.language.productEvaluation.title,
	});
	data.evaluateStat.id = options.product_id;
	data.evaluateStat.ratio = options.ratio || 100;
	data.evaluateStat.total_num = parseInt(options.total_num) < 0 ? 0 : options.total_num || 0;
	data.evaluateStat.good_num = parseInt(options.good_num) < 0 ? 0 : options.good_num || 0;
	data.evaluateStat.ordinary_num = parseInt(options.ordinary_num) < 0 ? 0 : options.ordinary_num || 0;
	data.evaluateStat.negative_num = parseInt(options.negative_num) < 0 ? 0 : options.negative_num || 0;
	data.evaluateStat.cover_num = parseInt(options.cover_num) < 0 ? 0 : options.cover_num || 0;
	data.evaluateStat.again_num = parseInt(options.again_num) < 0 ? 0 : options.again_num || 0;

	data.evaluateItem = [
		{
			name: language.productEvaluation.total,
			number: data.evaluateStat.total_num,
			type: {},
		},
		{
			name: language.productEvaluation.good,
			number: data.evaluateStat.good_num,
			type: { explain_type: 3 },
		},
		{
			name: language.productEvaluation.ordinary,
			number: data.evaluateStat.ordinary_num,
			type: { explain_type: 2 },
		},
		{
			name: language.productEvaluation.negative,
			number: data.evaluateStat.negative_num,
			type: { explain_type: 1 },
		},
		{
			name: language.productEvaluation.cover,
			number: data.evaluateStat.cover_num,
			type: { has_cover: 1 },
		},
		{
			name: language.productEvaluation.again,
			number: data.evaluateStat.again_num,
			type: { has_again: 1 },
		},
	];
	getEvaluationList();
});

const theme = computed(() => {
	return userStore.getTheme;
});

onReachBottom(() => {
	console.log(loadingStatus.value, uni.$api.appConfig.pageSize, '1');
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	console.log('2');
	getEvaluationList();
});

function attrClick(index: number, type: string) {
	activeIndex.value = index;
	data.activeType = type;
	page.value = 1;
	evaluationList.value = [];
	getEvaluationList();
}

async function getEvaluationList() {
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productEvaluateIndex, {
			params: {
				product_id: data.evaluateStat.id,
				page: page.value,
				page_size: uni.$api.appConfig.pageSize,
				...data.activeType,
			},
		})
		.then((res) => {
			evaluationList.value = [...evaluationList.value, ...res.data];
			loadingStatus.value = res.data.length === uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
			uni.stopPullDownRefresh();
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
			uni.stopPullDownRefresh();
		});
}

function previewImage(index: string, current: string) {
	const imgs = evaluationList.value[index].covers;
	uni.previewImage({
		current: current,
		urls: imgs,
	});
}

function previewAgainImage(index: string, current: string) {
	const imgs = evaluationList.value[index].again_covers;
	uni.previewImage({
		current: current,
		urls: imgs,
	});
}
</script>

<style lang="scss" scoped>
.dz-header {
	font-size: 24rpx;
	color: $dz-tips-color;
	padding: 16rpx 30rpx;
}

.dz-header text {
	font-weight: bold;
	padding-left: 12rpx;
	color: $dz-main-color;
}

.dz-attr-box {
	width: 100%;
	padding: 24rpx 25rpx 0;
	box-sizing: border-box;
	font-size: 0;
	background-color: #fff;
	border-radius: 24rpx;
}

.dz-attr-item {
	max-width: 100%;
	min-width: 128rpx;
	height: 60rpx;
	display: -webkit-inline-flex;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0 26rpx;
	box-sizing: border-box;
	border-radius: 32rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;
	font-size: 26rpx;
	border: 2rpx solid #fff;
}

.dz-attr-item text {
	font-weight: bold;
	padding-left: 12rpx;
}

.dz-evaluate__box {
	width: 100%;
	padding: 25rpx;
	box-sizing: border-box;
	background-color: #fff;
	box-shadow: 0 3rpx 20rpx rgba(183, 183, 183, 0.1);
	overflow: hidden;
	margin-top: 20rpx;
	border-radius: 24rpx;
}

.dz-flex__center {
	display: flex;
	align-items: center;
}

.dz-avatar {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
}

.dz-nickname {
	font-size: 28rpx;
	padding-left: 12rpx;
	color: $dz-main-color;
}

.dz-content__box {
	width: 100%;
	padding: 0 30rpx;
	box-sizing: border-box;
}

.dz-rate__box {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 24rpx;
	color: $dz-tips-color;
	padding: 24rpx 0;
}

.dz-desc {
	font-size: 28rpx;
	word-break: break-all;
	text-align: justify;
}

.dz-img__box {
	width: 100%;
	font-size: 0;
	padding-top: 4rpx;
}

.dz-img__box image {
	width: 200rpx;
	height: 200rpx;
	margin-right: 12rpx;
	margin-top: 12rpx;
	border-radius: 15rpx;
}

.dz-image {
	width: 400rpx !important;
	height: auto;
}

.dz-append_box {
	width: 100%;
	padding-top: 10rpx;
}

.dz-append-date {
	margin: 12rpx 0;
}

.dz-explain_box {
	width: 100%;
	padding-top: 10rpx;
}

.dz-explain-color {
	color: $dz-type-warning;
}

.dz-op__box {
	width: 100%;
	padding-top: 24rpx;
	font-size: 24rpx;
	font-weight: 500;
	justify-content: space-between;
}

.dz-op-item {
	display: flex;
	align-items: center;
	margin-left: 40rpx;
}

.dz-op-item text {
	padding-right: 6rpx;
}

.dz-specs {
	font-size: 24rpx;
	color: $dz-light-color;
	font-weight: 400;
	word-break: break-all;
}

.arrow_up {
	width: 0;
	height: 0;
	border-bottom: 16rpx solid rgb(246, 246, 246);
	border-right: 20rpx solid transparent;
	border-left: 20rpx solid transparent;
	transform: translateX(16rpx);
}

.explain_box {
	background: rgb(248, 248, 248);
	padding: 20rpx;
	font-size: 26rpx;
	line-height: 48rpx;
	border-radius: 12rpx;
}
</style>

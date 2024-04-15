<template>
	<view class="container">
		<dz-navbar :title="!isContent ? '测评内容' : '测评结果'"></dz-navbar>
		<block v-if="!isContent">
			<view class="form-box">
				<view class="title">{{ list.description }}</view>
				<view v-for="(item, index) in list.content" :key="index">
					<view class="headline">
						<text>{{ item.sort }}.</text>
						<text>{{ item.question }}</text>
						<text>【{{ item.question_type == 1 ? '单选' : '多选' }}】</text>
					</view>
					<view style="margin: 20rpx 25rpx 0">
						<dz-radio-group v-if="item.question_type == 1" placement="column" v-model="item.optionText">
							<dz-radio
								v-for="(item1, i) in item.content"
								:key="i"
								:name="item1.optionText"
								:active-color="theme.dzBaseColor"
								:label="item1.optionText"
								customStyle="margin: 10rpx 0"
							></dz-radio>
						</dz-radio-group>
						<dz-checkbox-group v-else placement="column" v-model="item.optionText">
							<dz-checkbox
								v-for="(item1, i) in item.content"
								:key="i"
								customStyle="margin: 10rpx 0"
								:active-color="theme.dzBaseColor"
								:name="item1.optionText"
								:label="item1.optionText"
							>
							</dz-checkbox>
						</dz-checkbox-group>
					</view>
				</view>
			</view>
			<view class="fixed">
				<dz-button
					:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor, width: '90%' }"
					:disabled="btnDisabled"
					hover-class="none"
					shape="circle"
					:border="false"
					:loading="isLoading"
					@click="preserve"
				>
					提交
				</dz-button>
			</view>
		</block>
		<block v-else>
			<dz-empty v-if="content == null" text="暂无测评结果" :src="empty" iconSize="360"></dz-empty>
			<view v-else>
				<dz-title
					title="评价建议"
					mode="line"
					:barColor="theme.dzBaseDisabled"
					:customStyle="{ justifyContent: 'flex-start', paddingLeft: '20rpx' }"
				></dz-title>
				<view class="dz-p-20"><dz-parse :content="content.suggest" lazy-load></dz-parse></view>
				<view class="dz-content">
					<dz-title
						title="推荐商品"
						mode="line"
						:barColor="theme.dzBaseDisabled"
						:customStyle="{ justifyContent: 'flex-start', paddingLeft: '20rpx' }"
					></dz-title>
					<!-- 	<view style="margin-top: -10rpx">
					<scroll-view scroll-x class="h-list-history" v-if="content.scopeProducts.length != 0">
						<view class="h-item-history" v-for="item in content.scopeProducts" :key="item.id" @tap.stop="navToProduct(item, item.product_id)">
							<view class="h-item-img"
								><dz-image :src="item.product_picture" borderRadius="12" width="180" height="180" mode="aspectFill"></dz-image
							></view>
							<view class="h-item-text">{{ item.product_name }}</view>
						</view>
					</scroll-view>
				</view> -->
					<dz-product-three :list="content.scopeProducts" :margin-left-right="20" :margin-top="20" :margin-bottom="20"></dz-product-three>
					<!-- 	:borderRadius="parseInt(item.props.borderRadius) * 2"
				
	
				:market-price-show="item.props.marketPriceShow"
				:clearance="parseInt(item.props.clearance) * 2" -->
				</view>
			</view>
		</block>

		<dz-page-loading :show="loadingShow" :status="loadingStatus" @click="loadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, toRefs } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const data = reactive({
	id: null,
	list: {},
	loadingShow: true,
	loadingStatus: 'loading',
	btnDisabled: false,
	num: [],
	isLoading: false,
	isContent: false,
	content: null,
	params: {},
});

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.id = options.cate_id;
	uni.setNavigationBarTitle({
		title: '测评内容',
	});
	getList();
});

function loadingClick() {
	if (!data.isContent) {
		getList();
	} else {
		getAnswer();
	}
}

function getList() {
	uni.$api.http
		.get(uni.$api.apiShop.testRecommendView, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			res.data.content.forEach((item) => {
				item.content = JSON.parse(item.content);
				if (item.question_type == 1) {
					item.score = '';
				} else {
					item.optionText = [];
				}
			});
			data.list = res.data;
			data.loadingShow = false;
		})
		.catch(() => {
			data.loadingStatus = 'error';
		});
	uni.stopPullDownRefresh();
}

function preserve() {
	data.num = [];
	let answer = [];
	for (let val of data.list.content) {
		if (val.question_type == 1) {
			if (!val.optionText) {
				return uni.$api.toast(`${val.question}选项不能为空`);
			}
		}

		if (val.question_type == 2) {
			if (!val.optionText.length) {
				return uni.$api.toast(`${val.question}选项不能为空`);
			}
		}
	}
	if (data.isLoading) return;
	data.isLoading = true;
	data.list.content.forEach((item, index) => {
		answer.push({
			id: item.id,
			question: item.question,
			answer: [],
		});
		if (item.question_type == 1) {
			item.content.forEach((item1) => {
				if (item.optionText == item1.optionText) {
					data.num.push(parseInt(item1.score));
					answer[index].answer.push(item1);
				}
			});
		} else {
			item.content.forEach((item2) => {
				item.optionText.forEach((v) => {
					if (v == item2.optionText) {
						data.num.push(parseInt(item2.score));
						answer[index].answer.push(item2);
					}
				});
			});
		}
	});
	let res = data.num.reduce(function (total, num) {
		return total + num;
	}, 0);
	data.params = {
		subject_id: data.id,
		score: res,
		answer,
	};
	getAnswer();
	data.isLoading = false;
}

function getAnswer() {
	data.loadingShow = true;
	uni.$api.http
		.post(uni.$api.apiShop.testRecommendAnswer, data.params)
		.then((res) => {
			uni.setNavigationBarTitle({
				title: '测评结果',
			});
			data.isContent = true;
			data.content = res.data;
			data.loadingShow = false;
		})
		.catch(() => {
			data.loadingStatus = 'error';
		});
}

const { list, btnDisabled, loadingShow, loadingStatus, isLoading, isContent, content } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
page,
.container {
	height: 100%;
	background: #fff;
}

.form-box {
	padding: 20rpx;
	margin-bottom: 60rpx;

	.title {
		margin: 60rpx 20rpx;
		font-size: 35rpx;
		text-align: center;
		font-weight: 500;
	}

	.headline {
		margin-top: 20rpx;
	}

	.fixed {
		bottom: 20rpx;
		width: 100%;
	}
}
</style>

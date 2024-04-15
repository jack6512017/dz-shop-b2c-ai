<template>
	<view class="app-container">
		<dz-navbar title="" backIconColor="#fff" :background="{ background: '#65CDFD' }" :borderBottom="false"></dz-navbar>
		<view class="gap-head"></view>
		<view class="l-lottery" :style="{ background: `url(${luckyWheelBg}) no-repeat`, backgroundSize: '100% auto' }">
			<view class="l-box">
				<view class="l-circle-pan-box">
					<!-- 背景 -->
					<view ref="prizeWrap" class="l-circle-pan-box-inner" :style="{ ...bgColor, transform: `rotate(${degNum}deg)` }">
						<!-- 奖品列表 -->
						<view class="prize-item" v-for="(item, index) in lotteryList" :key="index" :style="prizeItemStyle(index)">
							<view class="title" :style="{ color: fontColor }">{{ item.prize_title }}</view>
							<image :src="item.prize_picture" alt="" />
						</view>
					</view>
					<image class="l-circle-btn" :src="luckyWheelButton" @tap="handlePreStartClick" />
					<image class="l-head-icon" :src="luckyWheelTriangle" />
				</view>
			</view>
		</view>
		<view class="footer">
			<view class="point">
				<text>当前积分：{{ (userInfo.account && userInfo.account.user_integral) || '0.00' }}</text>
				<text>{{ pointPrice }}积分抽一次</text>
			</view>
			<view class="dz-m-t-40 dz-flex dz-row-between">
				<view>
					<dz-button
						:border="false"
						:custom-style="{ background: '#FE743E', color: '#fff' }"
						hover-class="none"
						size="medium"
						shape="circle"
						@click="handleRuleShow"
					>
						活动规则
					</dz-button>
				</view>
				<view>
					<dz-button
						:border="false"
						:custom-style="{ marginLeft: '20rpx', background: '#FE743E', color: '#fff' }"
						hover-class="none"
						size="medium"
						shape="circle"
						@click="toPage('luckyWheelWinList')"
					>
						中奖记录
					</dz-button>
				</view>
			</view>
		</view>
		<!-- 中奖提示 -->
		<dz-popup v-model:show="playShow" mode="center" border-radius="30" width="80%" :custom-style="{ overflow: 'visible' }">
			<view class="dz-p-40">
				<view class="dz-m-t-20 dz-font-36 dz-font-weight">{{ prizeMessage }}</view>
				<view class="dz-flex dz-row-center dz-p-40">
					<dz-image :src="prize.prize_picture" :width="200" :height="200"></dz-image>
				</view>
				<view class="dz-flex dz-m-t-40">
					<dz-button
						v-if="prize.prize_type == 1"
						:custom-style="{ width: '100%', marginRight: '20rpx', background: '#f3f4f6', color: '#303133' }"
						:border="false"
						hover-class="none"
						shape="circle"
						@click="toPage('luckyWheelupdateAddress', winId)"
					>
						填写收货地址
					</dz-button>
					<dz-button
						:custom-style="{ width: '100%', background: '#FE743E', color: '#fff' }"
						:border="false"
						hover-class="none"
						shape="circle"
						@click="handleShow"
					>
						{{ prize.prize_type == 1 ? '稍后再填' : '确定' }}
					</dz-button>
				</view>
			</view>
		</dz-popup>
		<!-- 活动规则提示 -->
		<dz-popup v-model:show="ruleShow" mode="center" border-radius="30" width="90%" :custom-style="{ overflow: 'visible' }">
			<view class="dz-p-40">
				<view class="dz-m-t-20 dz-font-36 dz-font-weight dz-text-center">活动规则 </view>
				<view class="dz-m-t-20 dz-font-24">
					<view class="dz-m-t-20 dz-font-weight">一、活动名称</view>
					<view class="dz-m-t-10">积分抽奖乐翻天</view>
					<view class="dz-m-t-20 dz-font-weight">二、参与方式</view>
					<view class="dz-m-t-10">当前活动是属于积分类型的活动，需要消耗一定的积分数才可以抽奖。</view>
					<view class="dz-m-t-20 dz-font-weight">三、奖品说明</view>
					<view class="dz-m-t-10">奖品类型：（虚拟奖品和实物奖品 ）</view>
					<view class="dz-m-t-10">（1）虚拟奖品：（积分和优惠券）</view>
					<view class="dz-m-t-10">（2）实物奖品： 商品，红包，话费等</view>
					<view class="dz-m-t-10">注：奖品具体信息，请看当前活动为准。</view>
					<view class="dz-m-t-20 dz-font-weight">四、收货地址</view>
					<view class="dz-m-t-10">
						用户参与本活动，应按照有{{
							shopSetting.store_name
						}}的要求及时、如实完善联系方式、收货地址及其他必须的信息，并视为同意有品使用该信息联系中奖用户、发放奖品。如因用户提供的信息不真实、不完整等导致奖品无法发放或发放错误等一切后果，由用户自行承担。
					</view>
				</view>
				<view class="dz-m-t-40">
					<dz-button
						:custom-style="{ width: '100%', background: '#FE743E', color: '#fff' }"
						:border="false"
						hover-class="none"
						shape="circle"
						@click="handleRuleShow"
					>
						知道了
					</dz-button>
				</view>
			</view>
		</dz-popup>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" zIndex="981" @click="getLuckyWheelIndex"></dz-page-loading>
	</view>
</template>

<script setup lang="ts">
import { reactive, computed, ref, toRefs } from 'vue';
import { useUserStore } from '@/state/modules/user';
import { onLoad, onShow } from '@dcloudio/uni-app';

const userStore = useUserStore();
const luckyWheelBg = uni.$api.assetsConfig.luckyWheelBg;
const luckyWheelButton = uni.$api.assetsConfig.luckyWheelButton;
const luckyWheelTriangle = uni.$api.assetsConfig.luckyWheelTriangle;
const prizeWrap = ref(null);
const data = reactive({
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	luckyWheelId: '',
	mainColor: '#FFEFD6',
	auxColor: '#FFF9DA',
	fontColor: '#b55e28',
	pointPrice: 0,
	degNum: 0,
	lotteryList: [],
	isStart: false,
	circleNum: 0,
	playShow: false,
	prize: {},
	prizeMessage: '',
	winId: '',
	ruleShow: false,
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

// 平均每个奖品角度
const rotateAngle = computed(() => {
	const degree = 360 / data.lotteryList.length;
	return degree;
});

// 计算绘制转盘背景
const bgColor = computed(() => {
	const _len = data.lotteryList.length;
	const colorList = [data.mainColor, data.auxColor];
	let colorVal = '';
	const style = {};
	for (let i = 0; i < _len; i++) {
		colorVal += `${colorList[i % 2]} ${rotateAngle.value * i}deg ${rotateAngle.value * (i + 1)}deg,`;
	}
	style.background = `conic-gradient(${colorVal.slice(0, -1)})`;
	return style;
});

// 每个奖品布局
const prizeItemStyle = computed(() => {
	const degree = rotateAngle.value;
	return (i) => {
		return `
              width: ${2 * 236 * Math.sin(((degree / 2) * Math.PI) / 180)}rpx;
              height: 236rpx;
              transform: rotate(${degree * i + degree / 2}deg);
              transform-origin: 50% 100%;
            `;
	};
});

onLoad(() => {
	getLuckyWheelIndex();
});

onShow(() => {
	getMemberInfo();
});

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

async function getLuckyWheelIndex() {
	data.pageLoadingShow = true;
	data.pageLoadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.luckyWheelIndex)
		.then((res) => {
			const { id, prize, main_color, aux_color, font_color, point_price } = res.data;
			data.luckyWheelId = id;
			data.lotteryList = prize;
			data.pointPrice = point_price;
			data.mainColor = main_color;
			data.auxColor = aux_color;
			data.fontColor = font_color;
			data.pageLoadingShow = false;
			// data.degNum = -rotateAngle.value / 2;
		})
		.catch(() => {
			pageLoadingStatus.value = 'error';
		});
}

function toPage(url, code) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			code,
		},
	});
	if (code) {
		data.playShow = false;
	}
}

function startClick(index: number) {
	if (!data.isStart) {
		data.isStart = true;
		data.circleNum += 7;
		data.isStart = true;
		data.degNum = data.circleNum * 360 - index * rotateAngle.value - rotateAngle.value / 2;
		// const current = data.lotteryList[index];
		setTimeout(() => {
			data.playShow = true;
		}, 4500);
		data.isStart = false;
	}
}

async function handlePreStartClick() {
	if (userInfo.value.account && parseFloat(data.pointPrice) > parseFloat(userInfo.value.account.user_integral)) {
		return uni.$api.toast('积分不足');
	}
	if (!data.luckyWheelId) return;
	await uni.$api.http
		.post(
			uni.$api.apiShop.luckyWheelPlay,
			{},
			{
				params: {
					id: data.luckyWheelId,
				},
			}
		)
		.then((res) => {
			data.prizeMessage = res.message;
			data.prize = res.data.prize;
			data.winId = res.data.win ? res.data.win.id : '';
			const index = data.lotteryList.findIndex((item) => item.id == res.data.prize.id);
			if (index != -1) {
				startClick(index);
				getMemberInfo();
			}
		});
}

function handleShow() {
	data.playShow = false;
}

function handleRuleShow() {
	data.ruleShow = !data.ruleShow;
}

const { degNum, lotteryList, fontColor, pointPrice, playShow, prizeMessage, prize, winId, ruleShow, pageLoadingShow, pageLoadingStatus } = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.app-container {
	width: 100%;
	height: 100%;
	background-color: #64bf85;
}

.l-lottery {
	position: relative;
	width: 750rpx;
	height: 1021rpx;
	background-size: 100% auto;
	.l-box {
		width: 100%;
		flex-direction: row;
		justify-content: center;
		height: 750rpx;
	}
	.l-circle-pan-box {
		position: absolute;
		left: 50%;
		top: 446rpx;
		width: 472rpx;
		height: 472rpx;
		border-radius: 50%;
		transform: translateX(-50%);
	}
	.l-circle-pan-box-inner {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		// background-size: 100% 100%;
		transition: all 4s;
	}
	.l-circle-btn {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -55%);
		width: 190rpx;
		height: 200rpx;
	}
	.l-head-icon {
		position: absolute;
		left: 50%;
		top: 0px;
		transform: translate(-53%, -60%);
		width: 200rpx;
		height: 160rpx;
		width: 172rpx;
		height: 144rpx;
	}

	.prize-list {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
	}
	.prize-item {
		position: absolute;
		left: 0;
		right: 0;
		margin: auto;
	}
	.prize-item image {
		width: 60rpx;
		height: 60rpx;
		margin: 10rpx auto 10rpx;
		display: block;
	}
	.prize-item .title {
		margin-top: 20rpx;
		font-size: 24rpx;
		text-align: center;
		line-height: 40rpx;
		color: #b55e28;
		font-weight: 700;
	}
}

.gap-head {
	height: 120rpx;
	background-color: #65cdfd;
}

.footer {
	padding: 40rpx;
	.point {
		display: flex;
		justify-content: space-between;
		color: #fff;
	}
}
</style>

<template>
	<view class="app-container" :style="{ backgroundColor: bgColor }">
		<dz-navbar title="" :background="{ background: '' }" backIconColor="#fff" :borderBottom="false" immersive></dz-navbar>
		<image class="bg-image" :src="selectBgImage" alt="" />
		<dz-image :src="headImage" :width="750" :height="750"></dz-image>
		<view class="tip" @tap="handleRuleShow">规则</view>
		<view class="l-lottery">
			<view class="select-box">
				<view v-if="prizeItem.prize_title" class="select" @tap="handlePrizeShow">
					<view class="select-prize">
						<view> 您选择的是： </view>

						<view>
							<dz-image :src="prizeItem.prize_picture" width="70" height="70" borderRadius="8"></dz-image>
						</view>
						<view class="dz-m-l-6"> {{ prizeItem.prize_title }}</view>
					</view>
				</view>
				<view v-else class="select dz-text-center dz-font-36" @tap="handlePrizeShow">请选择礼品后再进行抽奖</view>
			</view>
			<view class="l-box">
				<view class="l-circle-pan-box">
					<!-- 背景 -->
					<view class="l-circle-pan-box-inner">
						<!-- 奖品列表 -->
						<view class="prize-item" v-for="(item, index) in lotteryList" :key="index" :style="prizeItemStyle(index)">
							<view class="image-box" :style="{ transform: `rotate(${-rotateAngle * index}deg)` }">
								<image :src="item.prize_picture" alt="" />
							</view>
						</view>
					</view>
					<view class="l-circle-pan-box-inner" style="top: -44rpx">
						<!-- 奖品列表 -->
						<view class="prize-item" v-for="(item, index) in lotteryList" :key="index" :style="prizeItemStyle(index)">
							<view class="title" :style="{ color: index == indexSelect ? '#e3c28e' : '#e3c28e' }">{{ item.prize_title }}</view>
							<view v-if="index != indexSelect" class="circle" :style="{ backgroundColor: '#e3c28e' }"></view>
							<view v-else class="circle" style="background-image: radial-gradient(circle, #f4cd08, #cf3629)"> </view>
						</view>
					</view>
					<!-- <image class="l-head-icon" :src="cover" /> -->
					<image class="l-head-icon" :src="cover" />
					<view class="l-circle-btn-box">
						<!-- <image class="l-circle-btn" :src="pointer" @tap="handlePreStartClick" /> -->
						<!-- <image class="l-circle-btn" :src="pointer" :style="{ transform: `rotate(${degNum}deg)` }" @tap="handlePreStartClick" /> -->
					</view>
				</view>
			</view>

			<view class="footer">
				<view class="point dz-text-center">
					<text
						>您还剩余<text class="dz-m-l-10 dz-m-r-10">{{ surplusPlayNum }}</text
						>次抽奖机会</text
					>
				</view>
				<view class="dz-m-t-36 dz-flex dz-flex-column">
					<view>
						<dz-button
							:border="false"
							:custom-style="{ width: '280rpx', background: '#FFE8D1', color: '#aa0f00', opacity: 0 }"
							hover-class="none"
							shape="circle"
							@click="handlePreStartClick"
						>
							立即抽奖
						</dz-button>
					</view>
					<view class="dz-m-t-36 record" style="color: #fff; font-size: 24rpx" @click="toPage('storeLuckyWheelWinList')"> </view>
				</view>
			</view>
		</view>

		<!-- 中奖提示 -->
		<dz-popup
			v-model:show="playShow"
			mode="center"
			border-radius="30"
			width="600"
			:custom-style="{ overflow: 'visible', padding: '0' }"
			centerBgColor="transparent"
		>
			<view class="dz-relative">
				<dz-image :src="storeWeelWinBg" width="600" height="960"></dz-image>
				<view class="popup-content">
					<view v-if="prizeMessage" class="dz-m-t-20 dz-font-36 dz-font-weight dz-text-center">{{ prizeMessage }}</view>
					<block v-else>
						<view class="dz-m-t-20 dz-font-36 dz-font-weight dz-text-center">恭喜您心想事成</view>
						<view class="dz-m-t-10 dz-m-b-20 dz-font-36 dz-font-weight dz-text-center">获得免费机会</view>
					</block>
					<view class="dz-flex dz-row-center">
						<dz-image :src="win.prize_picture" :width="220" :height="220"></dz-image>
					</view>
					<view class="dz-font-30 dz-font-weight dz-text-center">{{ win.prize_title }}</view>
				</view>

				<view class="v-code dz-flex dz-row-center" @tap="getCode(win)">
					<dz-tag shape="circle" :color="theme.dzMainColor" :bgColor="theme.dzBaseFontColor" :borderColor="theme.dzBaseFontColor"
						><text class="dz-font-28">兑换码：</text><text class="dz-font-30">{{ api.addSpaces(win.v_code) }} </text
						><dz-icon name="qrcode" size="32"></dz-icon
					></dz-tag>
				</view>
				<view class="popup-btn" @click="handleShow"> </view>
			</view>
		</dz-popup>
		<!-- 活动规则提示 -->
		<dz-popup v-model:show="ruleShow" mode="center" border-radius="30" width="90%" :custom-style="{ overflow: 'visible' }">
			<view class="dz-p-40">
				<view class="dz-m-t-20 dz-font-36 dz-font-weight dz-text-center">活动规则 </view>
				<view class="dz-m-t-20 dz-font-24">
					<view class="dz-m-t-20 dz-font-weight">一、活动名称</view>
					<view class="dz-m-t-10">{{ title }}</view>
					<view class="dz-m-t-20 dz-font-weight">二、参与方式</view>
					<view class="dz-m-t-10">实体店每日限次抽奖</view>
					<view class="dz-m-t-20 dz-font-weight">三、奖品说明</view>
					<view class="dz-m-t-10">获奖后可在当前实体店现场兑换</view>
				</view>
				<view class="dz-m-t-40">
					<dz-button
						:custom-style="{ width: '100%', background: '#FFE8D1', color: '#aa0f00' }"
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
		<!-- 选择款式 -->
		<dz-popup v-model:show="prizeShow" mode="center" border-radius="30" width="92%" :custom-style="{ overflow: 'visible' }">
			<view class="dz-p-20">
				<view class="dz-p-20 dz-font-36 dz-font-weight dz-text-center">请选择 </view>
				<dz-row :gutter="16">
					<dz-grid :border="false">
						<dz-grid-item
							v-for="(item, index) in lotteryList"
							:key="index"
							customStyle="padding-top: 10px; padding-bottom: 10px"
							@click="winChange(item)"
						>
							<view class="layout" :style="{ borderColor: active == item.id ? '#aa0f00' : '#fff' }">
								<view
									class="layout-item"
									:style="{
										background: active == item.id ? '#fff' : theme.dzBgColor,
										borderColor: active == item.id ? '#aa0f00' : '',
										color: active == item.id ? '#aa0f00' : '',
									}"
								>
									<view>
										<dz-image :src="item.prize_picture" width="120" height="120" borderRadius="10" />
									</view>
									<view class="dz-line-1 dz-text-center" style="width: 170rpx">{{ item.prize_title }}</view>
								</view>
							</view>
						</dz-grid-item>
					</dz-grid>
				</dz-row>
				<view class="dz-p-40">
					<dz-button
						:custom-style="{ width: '100%', background: '#FFE8D1', color: '#aa0f00' }"
						:border="false"
						hover-class="none"
						shape="circle"
						@click="handleSelect"
					>
						确定
					</dz-button>
				</view>
			</view>
		</dz-popup>
		<!-- 兑换码 -->
		<dz-popup v-model:show="codeShow" mode="center" border-radius="30" :closeable="true" width="80%" zIndex="998" :custom-style="{ overflow: 'visible' }">
			<view class="popup-box">
				<image @longpress="long" :src="qrcodeImage" mode=""></image>
				<view class="dz-flex dz-row-center dz-m-40">
					<dz-tag shape="circle" :color="theme.dzMainColor" :bgColor="theme.dzBgColor" :borderColor="theme.dzBgColor"
						><text class="dz-font-30"><text class="dz-color-6">兑换码：</text>{{ api.addSpaces(win.v_code) }} </text></dz-tag
					>
				</view>
			</view>
		</dz-popup>
		<canvas class="hideCanvas" canvas-id="qrcode" style="width: 250px; height: 250px" />
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" zIndex="981" @click="getLuckyWheelIndex"></dz-page-loading>
	</view>
</template>

<script setup lang="ts">
import { reactive, computed, getCurrentInstance, toRefs } from 'vue';
import { useUserStore } from '@/state/modules/user';
import { onLoad } from '@dcloudio/uni-app';
import uQRCode from '@/core/utils/uqrcode';

const userStore = useUserStore();
const storeWeelWinBg = uni.$api.assetsConfig.storeWeelWinBg;
const innerAudioContext = uni.createInnerAudioContext();
const proxy = getCurrentInstance();
const data = reactive({
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	wheel: '',
	title: '',
	luckyWheelId: '',
	bgColor: '#652823',
	headImage: '',
	selectBgImage: '',
	fontColor: '#b55e28',
	cover: '',
	playNum: 0,
	playMusic: '',
	WinMusic: '',
	surplusPlayNum: 0,
	degNum: 0,
	lotteryList: [],
	isStart: false,
	circleNum: 0,
	playShow: false,
	prize: {},
	prizeMessage: '',
	win: {},
	ruleShow: false,
	active: '',
	prizeItem: '',
	prizeShow: false,
	indexSelect: 1,
	stayIndex: 1,
	codeShow: false,
	qrcodeImage: '',
});

const storeId = computed(() => {
	return userStore.getStoreId;
});

const theme = computed(() => {
	return userStore.getTheme;
});

// 平均每个奖品角度
const rotateAngle = computed(() => {
	const degree = 360 / data.lotteryList.length;
	return degree;
});

// 每个奖品布局
const prizeItemStyle = computed(() => {
	const degree = rotateAngle.value;
	return (i) => {
		return `
              width: ${2 * 375 * Math.sin(((degree / 2) * Math.PI) / 180)}rpx;
              height: 375rpx;
              transform: rotate(${degree * i}deg);
              transform-origin: 50% 100%;
            `;
	};
});

onLoad(() => {
	getLuckyWheelIndex();
});

async function getLuckyWheelIndex() {
	data.pageLoadingShow = true;
	data.pageLoadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiStore.luckyWheelIndex, {
			params: {
				store_id: storeId.value,
			},
		})
		.then((res) => {
			const { id, title, bg_color, head_image, select_bg_image, cover, prize, font_color, play_num, play_music, win_music } = res.data.wheel;
			uni.setNavigationBarTitle({ title: title });
			data.wheel = res.data.wheel;
			data.title = title;
			data.luckyWheelId = id;
			data.bgColor = bg_color;
			data.headImage = head_image;
			data.selectBgImage = select_bg_image;
			data.cover = cover;
			data.lotteryList = prize;
			data.playNum = play_num;
			data.playMusic = play_music;
			data.winMusic = win_music;
			data.surplusPlayNum = res.data.play_num;
			data.fontColor = font_color;
			data.pageLoadingShow = false;
			// data.degNum = -rotateAngle.value / 2;
			console.log(data, 'okk');
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
	if (data.isStart) return;
	if (!data.isStart) {
		data.isStart = true;
		data.circleNum += 7;
		data.isStart = true;
		data.degNum = data.circleNum * 360 + index * rotateAngle.value;
		// const current = data.lotteryList[index];
		setTimeout(() => {
			data.isStart = false;
			if (data.prize.id == data.prizeItem.id) {
				data.winMusic && handlePlayMusic(data.winMusic);
				data.playShow = true;
			} else {
				return uni.$api.toast(data.prizeMessage);
			}
		}, 4500);
	}
}

async function handlePreStartClick() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (data.surplusPlayNum == 0) return uni.$api.toast('您今日抽奖次数已用完，明天再来吧~');
	if (!data.prizeItem && !data.prizeItem.id) {
		data.prizeShow = true;
		return;
	}
	if (!data.luckyWheelId) return;
	if (data.isStart) return;
	data.playMusic && handlePlayMusic(data.playMusic);
	await uni.$api.http
		.post(
			uni.$api.apiStore.luckyWheelPlay,
			{},
			{
				params: {
					id: data.luckyWheelId,
					store_id: storeId.value,
					prize_id: data.prizeItem.id,
				},
			}
		)
		.then((res) => {
			data.surplusPlayNum = data.surplusPlayNum - 1;
			data.prize = res.data.prize;
			data.prizeMessage = res.data.win ? res.data.win.prize_memo : res.message;
			data.win = res.data.win;
			const index = data.lotteryList.findIndex((item) => item.id == res.data.prize.id);
			if (index != -1) {
				start(index);
			}
		})
		.catch(() => {
			data.isStart = false;
		});
}

//随机数
function random(u) {
	let rnd = Math.random() > 0.5 ? '2' : '1';
	u = u || 3;
	for (let i = 0; i < u; i++) {
		rnd += Math.floor(Math.random() * 10);
	}
	return Number(rnd);
}

//开始
function start(index: number) {
	if (data.isStart) return;
	if (!data.isStart) {
		data.isStart = true;
		let setIndexSelect = 0;
		let i = 0;
		let randomNum = random(3);
		let timer = setInterval(() => {
			++setIndexSelect;
			//这里用y=30*x+150函数做的处理.可根据自己的需求改变转盘速度
			setIndexSelect = setIndexSelect % 8;
			data.indexSelect = setIndexSelect;
			i += 40;
			if (i > randomNum) {
				//控制停留位置
				setIndexSelect = index;
				data.indexSelect = setIndexSelect;
				clearInterval(timer);
				timer = null;
				data.isStart = false;
				if (data.prize.id == data.prizeItem.id) {
					data.winMusic && handlePlayMusic(data.winMusic);
					data.playShow = true;
				} else {
					return uni.$api.toast(data.prizeMessage);
				}
			}
		}, 70 + i);
	}
}

function handlePlayMusic(src: string) {
	innerAudioContext.startTime = 0;
	innerAudioContext.src = src;
	innerAudioContext.play();
	innerAudioContext.onError((res) => {
		console.log(res.errMsg);
		console.log(res.errCode);
	});
}

function handleShow() {
	data.playShow = false;
}

function handleRuleShow() {
	data.ruleShow = !data.ruleShow;
}

function handlePrizeShow() {
	if (data.prizeItem && data.prizeItem.id) {
		data.active = data.prizeItem.id;
	}

	data.prizeShow = !data.prizeShow;
}

function winChange(item: any) {
	data.active = item.id;
	if (item.click_music) {
		handlePlayMusic(item.click_music);
	}
}

function handleSelect() {
	if (!data.active) return;
	const index = data.lotteryList.findIndex((item) => item.id == data.active);
	data.prizeShow = false;
	if (index != -1) {
		data.prizeItem = data.lotteryList[index];
		handlePreStartClick(data.active);
	}
}

function long() {
	// #ifndef H5
	uni.saveImageToPhotosAlbum({
		filePath: data.imgSrc,
		success() {
			uni.$api.toast('保存成功');
		},
	});
	// #endif
	// #ifdef H5
	uni.$api.toast('请长按松开后选择另存为保存到相册');
	// #endif
}

async function getCode(item: any) {
	data.qrcodeImage = await getQrcode(item);
	if (!data.qrcodeImage) return uni.$api.toast('生成二维码失败');
	data.codeShow = true;
	data.playShow = false;
}

async function getQrcode(item: any) {
	let domain = uni.$api.appConfig.h5Domain;
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	return new Promise((resolve, reject) => {
		uQRCode.make({
			canvasId: 'qrcode',
			componentInstance: proxy,
			text: `${domain}${uni.$api.routesConfig.storeLuckyWheelVerify.path}?wheel_code=${item.v_code}&store_id=${item.store_id}`,
			size: 250,
			margin: 10,
			backgroundColor: '#ffffff',
			foregroundColor: '#000000',
			fileType: 'jpg',
			correctLevel: 1,
			success: (res) => {
				resolve(res);
			},
			fail: (res) => {
				reject(res);
			},
		});
	});
}

function login() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.login,
	});
	return;
}

const {
	title,
	// degNum,
	lotteryList,
	bgColor,
	headImage,
	selectBgImage,
	// fontColor,
	cover,
	// playNum,
	surplusPlayNum,
	playShow,
	prizeMessage,
	win,
	active,
	ruleShow,
	pageLoadingShow,
	pageLoadingStatus,
	prizeItem,
	prizeShow,
	indexSelect,
	codeShow,
	qrcodeImage,
} = {
	...toRefs(data),
};
</script>

<style>
page,
.app-container {
	width: 100%;
	height: 100%;
}
</style>
<style lang="scss" scoped>
.select-box {
	position: absolute;
	left: 50%;
	top: -190rpx;
	transform: translateX(-50%);
	width: 540rpx;
	height: 84rpx;
	z-index: 1;
}
.select {
	line-height: 84rpx;
	color: #e3c28e;
}
.select-prize {
	display: flex;
	align-items: center;
	justify-content: center;
}
.bg-image {
	position: fixed;
	width: 100%;
	height: 2033rpx;
}
.l-lottery {
	position: relative;
	width: 750rpx;
	height: 1124rpx;
	margin-top: 190rpx;
	.l-box {
		width: 100%;
		flex-direction: row;
		justify-content: center;
		height: 750rpx;
	}
	.l-circle-pan-box {
		position: absolute;
		left: 50%;
		width: 750rpx;
		height: 750rpx;
		border-radius: 50%;
		transform: translateX(-50%);
	}
	.l-circle-pan-box-inner {
		position: absolute;
		top: -50rpx;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		transition: all 4s;
		overflow: hidden;
	}
	.l-circle-btn-box {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -55%);
		width: 190rpx;
		height: 200rpx;
	}
	.l-circle-btn {
		position: absolute;
		width: 190rpx;
		height: 200rpx;
		transition: all 4s;
	}

	.l-head-icon {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 652rpx;
		height: 1124rpx;
		z-index: -1;
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
		width: 236rpx;
		height: 236rpx;
		display: block;
		margin: -20rpx auto 0px;
	}
	.prize-item .title {
		margin-top: 192rpx;
		font-size: 20rpx;
		text-align: center;
		line-height: 40rpx;
		font-weight: 700;
		text-shadow: -1px 0 rgba(80, 46, 21, 1), 0 1px rgba(80, 46, 21, 1), 1px 0 rgba(80, 46, 21, 1), 0 -1px rgba(80, 46, 21, 1);
	}
	.circle {
		width: 18rpx;
		height: 18rpx;
		margin: 16rpx auto 0rpx;
		border-radius: 9rpx;
		border: 2rpx solid #4b280f;
		image {
			width: 20rpx;
			height: 20rpx;
			margin: -2px auto 0px;
		}
	}
}

.footer {
	position: relative;
	padding: 40rpx;
	top: -82rpx;
	.point {
		font-size: 24rpx;
		color: #e3c28e;
	}
	.record {
		width: 130rpx;
		height: 40rpx;
	}
}

.tip {
	position: absolute;
	top: 60rpx;
	right: 00rpx;
	padding: 20rpx;
	color: #fff;
}

.layout {
	border-radius: 15rpx;
	.layout-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 190rpx;
		padding: 10rpx 0 30rpx;
		border-radius: 20rpx;
		background: #f3f4f6;
		border: 2rpx solid transparent;
		font-size: 28rpx;
	}
}
.popup-content {
	width: 60%;
	position: absolute;
	left: 50%;
	top: 47%;
	transform: translate(-50%, -50%);
}
.popup-btn {
	position: absolute;
	transform: translateX(-50%);
	left: 50%;
	bottom: 0;
	width: 70%;
	height: 100rpx;
	z-index: 2;
}

.v-code {
	width: 100%;
	position: absolute;
	transform: translateX(-50%);
	left: 50%;
	bottom: 180rpx;
}

.popup-box {
	text-align: center;
	image {
		border: none;
		border-radius: 0;
		width: 300rpx;
		height: 300rpx;
		margin-top: 90rpx;
	}
	.tip {
		padding-bottom: 90rpx;
		color: #909993;
		-webkit-user-select: text;
	}
}

.hideCanvas {
	position: fixed;
	top: -999px;
	left: -999px;
	z-index: -99;
}
</style>

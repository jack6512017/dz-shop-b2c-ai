<template>
	<view class="container">
		<dz-navbar title="地址管理" :borderBottom="false"></dz-navbar>
		<view class="search">
			<dz-search
				v-model="keyword"
				placeholder="输入收件人姓名或者手机号查询"
				@input="changeInput"
				@custom="searchConfirm"
				@focus="inputFocus"
				:show-action="true"
			></dz-search>
		</view>
		<view class="card">
			<dz-swipe-action v-for="(item, index) in list" :key="item.id" :index="index" :actions="actionOptions" @click="actionClick">
				<template #content>
					<view class="card_item" @tap="handleActive(item)">
						<view class="dz-flex dz-flex-shrink">
							<view class="dz-flex-shrin">
								<dz-button
									:custom-style="{
										background: item.is_default != 1 ? theme.dzBaseDisabled : theme.dzBaseColor,
										color: theme.dzBaseFontColor,
										width: '60rpx',
										height: '60rpx',
										borderRadius: '30rpx',
										fontSize: '28rpx',
									}"
									size="mini"
									shape="circle"
									hover-class="none"
									:border="false"
								>
									{{ item.realname.slice(0, 1) }}
								</dz-button>
							</view>
							<view class="dz-m-l-20">
								<view class="center">
									<view class="name-tel">
										<view class="name dz-font-weight">{{ item.realname }}</view>
										<view class="tel">+{{ item.mobile_area + ' ' + item.mobile }}</view>
										<dz-tag
											v-if="item.is_default == 1"
											size="mini"
											shape="circle"
											:color="theme.dzBaseFontColor"
											:bgColor="theme.dzBaseColor"
											:borderColor="theme.dzBaseColor"
											>默认</dz-tag
										>
									</view>
									<view class="address dz-line-2">{{ item.address_name }} {{ item.address_details }}</view>
								</view>
							</view>
						</view>
						<view class="dz-p-20" @tap.stop="handleUpdate('edit', item.id)">
							<dz-icon name="post"></dz-icon>
						</view>
					</view>
				</template>
			</dz-swipe-action>
		</view>
		<dz-empty v-if="loadingStatus == 'nodata'" margin-top="160" :src="empty"></dz-empty>
		<view v-if="loadingStatus == 'loading'" class="dz-p-b-20">
			<dz-loadmore :status="loadingStatus" :line="loadingStatus == 'loading' ? false : true"></dz-loadmore>
		</view>
		<view class="ios-margin-bottom"></view>
		<view class="footer-bottom">
			<view class="footer_content">
				<view class="dz-p-20 dz-flex">
					<!-- #ifdef  MP-WEIXIN -->
					<view class="dz-flex-1 dz-m-r-20">
						<dz-button
							:custom-style="{
								width: '100%',
								background: '#fff',
								border: '1rpx solid rgba(0, 0, 0, 0.12)',
							}"
							hover-class="none"
							shape="circle"
							@click="wechatAddress"
							:border="false"
						>
							获取微信地址
						</dz-button>
					</view>
					<!-- #endif -->
					<!-- #ifdef  H5 -->
					<view v-if="h5Wechat" class="dz-flex-1 dz-m-r-20">
						<dz-button
							:custom-style="{
								width: '100%',
								background: '#fff',
								border: '1rpx solid rgba(0, 0, 0, 0.12)',
							}"
							hover-class="none"
							shape="circle"
							@click="h5wechatAddress"
							:border="false"
						>
							获取微信地址
						</dz-button>
					</view>
					<!-- #endif -->
					<view class="dz-flex-1">
						<dz-button
							:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
							hover-class="none"
							shape="circle"
							@click="handleUpdate('add')"
							:border="false"
						>
							添加收货地址
						</dz-button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onUnload, onReachBottom } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import addressParse from './zh-address-parse/address-parse';

const userStore = useUserStore();
const empty = uni.$api.assetsConfig.empty;
const loadingStatus = ref<string>('loading');
const list = ref<array>([]);
const page = ref<number>(1);
const keyword = ref<string>('');
const source = ref<string>('');
const isKeyword = ref<boolean>(false);

const theme = computed(() => {
	return userStore.getTheme;
});

const actionOptions = ref([
	{
		name: '删除',
		color: '#fff',
		fontsize: 30,
		width: 66,
		background: theme.value.dzTypeError,
	},
]);
const h5Wechat = ref<boolean>(false);
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '地址管理',
	});
	source.value = options.source;
	uni.$on('addressChange', () => {
		page.value = 1;
		list.value = [];
		getList();
	});
	getList();

	//微信公众号配置注册
	// #ifdef H5
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		h5Wechat.value = true;
		uni.$api.wxHelper.wxConfig(window.location.href);
	}
	// #endif
});

onUnload(() => {
	uni.$off('addressChange');
});

// 加载更多
onReachBottom(() => {
	if (loadingStatus.value === 'nomore') return;
	page.value++;
	getList();
});

// 控制清除搜索
function inputFocus() {
	isKeyword.value = true;
}
// 清除搜索
function changeInput() {
	if (!keyword.value && isKeyword.value) {
		searchConfirm();
	}
}

// 搜索
function searchConfirm() {
	page.value = 1;
	list.value = [];
	getList();
}

async function getList() {
	let params = {
		page: page.value,
		page_size: 15,
	};
	if (keyword.value) {
		params.keyword = keyword.value;
	}
	loadingStatus.value = 'loading';
	await uni.$api.http
		.get(uni.$api.apiMember.addressIndex, {
			params,
		})
		.then((res) => {
			loadingStatus.value = res.data.length === 15 ? 'loadmore' : 'nomore';
			list.value = [...list.value, ...res.data];
			if (page.value == 1 && res.data.length == 0) {
				loadingStatus.value = 'nodata';
			}
		});
}

async function actionClick(index: number) {
	await uni.$api.http
		.delete(
			uni.$api.apiMember.addressDelete,
			{},
			{
				params: {
					id: list.value[index].id,
				},
			}
		)
		.then(() => {
			uni.$api.toast('删除成功');
			list.value.splice(index, 1);
		});
}

function handleActive(e) {
	if (source.value) {
		uni.$emit('getAddressData', e);
		uni.$api.router.back();
	}
}

function wechatAddress() {
	uni.getSetting({
		success(res) {
			if (res.authSetting['scope.address']) {
				uni.chooseAddress({
					success(res) {
						parseWechatAddress(res);
					},
					fail() {
						uni.$api.toast('获取微信收货地址失败');
					},
				});
			} else {
				if (res.authSetting['scope.address'] == false) {
					uni.openSetting({
						success(res) {
							console.log(res.authSetting);
						},
						fail() {
							uni.$api.toast('打开微信授权面板失败');
						},
					});
				} else {
					uni.chooseAddress({
						success(res) {
							parseWechatAddress(res);
						},
					});
				}
			}
		},
		fail() {
			uni.$api.toast('获取微信设置失败');
		},
	});
}

function h5wechatAddress() {
	if (!uni.$api.h5IsWechat() || shopSetting.value.wechat_appid == '') {
		return;
	}
	uni.$api.jweixin.ready(() => {
		uni.$api.jweixin.openAddress({
			success(res) {
				parseWechatAddress(res);
			},
		});
	});
}

async function parseWechatAddress(data) {
	//解析省市区
	let parseInfo = '';
	if (!uni.$api.h5IsWechat() || shopSetting.value.wechat_appid == '') {
		parseInfo = `${data.provinceName}${data.cityName}${data.countryName}${data.detailInfo}`;
	} else {
		parseInfo = `${data.provinceName}${data.cityName}${data.countyName}${data.detailInfo}`;
	}
	let options = {
		type: 1, // 哪种方式解析，0：正则，1：树查找
		textFilter: [], // 预清洗的字段
		nameMaxLength: 4, // 查找最大的中文名字长度
	};
	let parseResult = await addressParse(parseInfo, options);
	if (parseResult.area) {
		let provinceId = parseResult.province.id;
		let cityId = parseResult.city.id;
		let areaId = parseResult.area.id;
		let params = {
			realname: data.userName,
			mobile_area: '86',
			mobile: data.telNumber,
			address_details: data.detailInfo,
			is_default: 1,
			province_id: provinceId,
			city_id: cityId,
			area_id: areaId,
		};
		await uni.$api.http
			.post(uni.$api.apiMember.addressCreate, {
				...params,
			})
			.then((res) => {
				uni.$api.toast(uni.$api.language.address.addressAddedSuccessfully);
				if (source.value) {
					uni.$emit('getAddressData', res.data);
					uni.$api.router.back();
				} else {
					uni.$emit('addressChange', {});
				}
			})
			.catch(() => {});
	} else {
		uni.$api.toast('解析微信地址失败');
	}
}

function handleUpdate(type: string, id?: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.addressUpdate,
		query: {
			type: type,
			id: id,
			source: source.value,
		},
	});
}
</script>

<style lang="scss">
.container {
	padding-bottom: env(safe-area-inset-bottom);
}

.search {
	position: fixed;
	width: 100%;
	padding: 10rpx 20rpx;
	background-color: #fff;
	z-index: 2;
}
.card {
	border-radius: 20rpx;
	overflow: hidden;
	margin: 106rpx 20rpx 20rpx;
	background-color: #fff;
	.card_item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 0 20rpx 20rpx;
	}
	.center {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding-left: 10rpx;
		.name-tel {
			display: flex;
			align-items: baseline;
			.name {
				font-size: 30rpx;
			}
			.tel {
				margin: 0rpx 10rpx;
				font-size: 24rpx;
			}
			.default {
				font-size: 22rpx;
				padding: 0 18rpx;
				border-radius: 24rpx;
				margin-left: 20rpx;
				border-width: 1rpx;
				border-style: solid;
			}
		}
		.address {
			width: 510rpx;
			margin-top: 10rpx;
			font-size: 24rpx;
			display: flex;
			align-items: baseline;
			color: $dz-tips-color;
		}
	}
}
.ios-margin-bottom {
	height: 120rpx;
}
.footer-bottom {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 98;
	width: 100%;
	min-height: 120rpx;
	background-color: #fff;
	.footer_content {
		width: 100%;
		margin-bottom: env(safe-area-inset-bottom);
	}
}
</style>

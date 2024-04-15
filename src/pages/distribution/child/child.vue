<template>
	<view>
		<dz-navbar :title="navbarTitle" :borderBottom="false"></dz-navbar>
		<view style="position: fixed; width: 100%; z-index: 2">
			<dz-tabs
				:list="tabList"
				:current="current"
				:scrollable="false"
				lineHeight="4"
				:activeStyle="{
					color: theme.dzBaseColor,
				}"
				:lineColor="theme.dzBaseColor"
				@change="tabChange"
			></dz-tabs>
			<view class="search-box" v-if="shopSetting.member_show_parent == 0 || current != 0">
				<view v-if="type != 'fission'" class="dz-top-item" @tap="dropdownTap">
					<text>等级</text>
					<text class="dzicon-iconfont" :class="selectHeight > 0 ? 'dzicon-fold' : 'dzicon-unfold'"></text>
				</view>
				<view class="dz-dropdownlist" :class="[selectHeight > 0 ? 'dz-dropdownlist-show' : '']" :style="{ height: selectHeight + 'rpx' }">
					<scroll-view :scroll-y="true" :style="{ height: selectHeight + 'rpx' }" :scroll-top="scrollTop" @scroll="scroll">
						<view
							class="dz-dropdownlist-item dz-icon-middle"
							:class="[item.selected ? 'dz-font-weight' : '']"
							v-for="(item, index) in dropdownList"
							:key="index"
							@tap.stop="dropdownItemTap"
							:data-index="index"
						>
							<text class="dz-ml dz-middle" :style="{ color: item.selected ? theme.dzBaseColor : '' }">{{ item.name }}</text>
							<text class="dzicon-iconfont dzicon-checkbox dz-font-36" :style="{ color: theme.dzBaseColor }" v-if="item.selected"></text>
						</view>
					</scroll-view>
				</view>
				<view class="dz-dropdownlist-mask" :class="[selectHeight > 0 ? 'dz-mask-show' : '']" @tap.stop="hideDropdownList"></view>
				<view class="search">
					<dz-search
						v-model="keyword"
						:placeholder="`输入用户ID、昵称、电话号码查询`"
						@input="changeInput"
						@custom="search"
						@focus="inputFocus"
						@search="search"
						:show-action="true"
					></dz-search>
				</view>
			</view>
		</view>
		<view
			v-if="childList.length > 0"
			class="card-box"
			:style="{
				marginTop: tabList.length == 3 && current == 0 ? '80rpx' : '184rpx',
			}"
		>
			<view v-if="state != 1" class="team-count dz-m-b-20">
				<view class="icon" :style="{ background: theme.dzBaseColor }"><dz-icon name="friendfill" size="50" color="#fff"></dz-icon></view>
				<view class="dz-flex-1">
					<view class="dz-font-32 dz-m-b-6">
						{{ type == 'warehouse' ? '经' : '分' }}销商共
						<text
							class="dz-font-weight"
							:style="{
								color: theme.dzBaseColor,
								fontSize: '36rpx',
								margin: '0 8rpx',
							}"
						>
							{{ teamCount }}
						</text>
						人
					</view>
				</view>
			</view>
			<view class="card-item" v-for="(item, index) in childList" :key="index">
				<view class="img"><dz-image width="120rpx" height="120rpx" border-radius="60rpx" :src="item.head_portrait || missingFace"></dz-image></view>
				<view class="right">
					<view class="cell">
						<text>ID:</text>
						{{ item.id || '无' }}
					</view>
					<view class="name">
						昵称:
						<text>{{ item.realname || item.nickname || language.distribution.noName }}</text>
					</view>
					<view class="cell">
						<text>电话:</text>
						{{ item.mobile || '无' }}
					</view>
					<view v-if="state != 1" class="cell">
						<text>是否分销商:</text>
						{{ item.promoter_state == 1 && item.promoter_status == 1 ? '是' : '否' }}
					</view>
					<view v-if="state == 3" class="cell">
						<text>{{ language.distribution.theSuperiorId }}</text>
						{{ (item.baseParent && item.baseParent.id) || language.distribution.thereIsNo }}
					</view>
					<view v-if="state == 3" class="cell">
						<text>{{ language.distribution.theSuperiorNickname }}</text>
						{{ (item.baseParent && item.baseParent.nickname) || language.distribution.thereIsNo }}
					</view>
					<view v-if="item.level_name && item.promoter_state == 1" class="cell">
						<text>{{ type == 'warehouse' ? '经' : '分' }}销商等级:</text>
						{{ item.level_name }}
					</view>
					<view class="cell">
						<text>注册时间:</text>
						{{ api.timeFormat(item.created_time, 'yyyy-mm-dd') }}
					</view>
				</view>
			</view>
		</view>
		<dz-empty
			v-if="loadingStatus == 'noData'"
			:margin-top="180"
			:text="state == 1 ? language.distribution.noReferences : language.distribution.noDistributorMemberAtThisLevel"
			:src="emptyUser"
			iconSize="360"
		></dz-empty>
		<view class="dz-ios-p-safe-bottom">
			<dz-loadmore
				v-if="loadingStatus == 'loading'"
				:status="loadingStatus"
				:margin-top="tabList.length == 3 && current == 0 ? 98 : 210"
				:margin-bottom="20"
			></dz-loadmore>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const navbarTitle = ref<string>('');
const type = ref<string>('');
const tabList = ref([
	{
		state: 1,
		name: uni.$api.language.distribution.myReferences,
	},
	{
		state: 2,
		name: uni.$api.language.distribution.primaryDistributor,
	},
	{
		state: 3,
		name: uni.$api.language.distribution.secondaryDistributor,
	},
]);
const config = {
	fission: {
		title: uni.$api.language.distribution.myTeam,
		api: 'distributionMemberFissionChild',
	},
	store: {
		title: uni.$api.language.distribution.myTeam,
		api: 'distributionMemberStoreChild',
	},
	warehouse: {
		title: '商家人脉',
		api: 'distributionMemberWarehouseChild',
	},
};
const current = ref<number>(0);
const page = ref<number>(0);
const childList = ref<any>([]);
const missingFace = uni.$api.assetsConfig.missingFace;
const emptyUser = uni.$api.assetsConfig.emptyUser;
const childType = ref<number>(1);
const loadingStatus = ref<string>('loading');
const state = ref<number>(1);
const teamCount = ref<number>(0);
const keyword = ref<string>('');
const isKeyword = ref<boolean>(false);
const selectHeight = ref<number>(0);
const selectName = ref<string>('全部');
const levelId = ref<number>('');
const dropdownList = ref<any>([]);
const scrollTop = ref<number>(0);
const isLoading = ref<boolean>(false);

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: config[options.type].title,
	});
	navbarTitle.value = config[options.type].title;
	if (options.type) {
		type.value = options.type;
		tabList.value = [
			{
				state: 1,
				name: '供货商',
			},
			{
				state: 2,
				name: '下级经销商',
			},
			{
				state: 3,
				name: '下下级经销商',
			},
		];
	}
	if (parseInt(shopSetting.value.member_show_parent) == 1) {
		tabChange(0);
	} else {
		tabList.value.splice(0, 1);
		tabChange(0);
	}
	if (['store', 'warehouse'].includes(type.value)) {
		getLevel();
	}
});

onPullDownRefresh(() => {
	page.value = 1;
	childList.value = [];
	teamCount.value = 0;
	inData(current.value);
});

onReachBottom(() => {
	if (loadingStatus.value == 'nomore') return;
	page.value++;
	getDistributionMemberChild();
});

function getDistributionMemberParent() {
	loadingStatus.value = 'loading';
	childList.value.length = 0;
	isLoading.value = true;
	uni.$api.http
		.get(uni.$api.apiShop.distributionMemberParent)
		.then((res) => {
			if (res.data != 0) {
				childList.value.push(res.data);
			}
			loadingStatus.value = childList.value.length == 0 ? 'noData' : 'nomore';
		})
		.finally(() => {
			isLoading.value = false;
		});
	uni.stopPullDownRefresh();
}

async function getLevel() {
	let apiKey = 'distributionStoreLevelIndex';
	if (type.value == 'warehouse') {
		apiKey = 'distributionWarehouseLevelIndex';
	}
	dropdownList.value = [
		{
			name: '全部',
			selected: true,
			value: '',
		},
		{
			name: '无等级',
			selected: false,
			value: '0',
		},
	];
	await uni.$api.http.get(uni.$api.apiShop[apiKey]).then((res) => {
		if (res.data.length) {
			res.data.forEach((item) => {
				dropdownList.value.push({
					name: item.name,
					selected: false,
					value: item.id,
				});
			});
		}
	});
}

function tabChange(e) {
	let active = 0;
	if (e === 0) {
		active = 0;
	} else {
		active = e.index;
	}
	if (isLoading.value) return;
	keyword.value = '';
	isKeyword.value = false;
	current.value = active;
	state.value = tabList.value[active].state;
	page.value = 1;
	childList.value = [];
	teamCount.value = 0;
	levelId.value = 0;
	scrollTop.value = 0;

	let list = dropdownList.value;
	for (let i = 0; i < list.length; i++) {
		if (i === 0) {
			list[i].selected = true;
		} else {
			list[i].selected = false;
		}
	}
	hideDropdownList();
	inData(active);
}

function scroll(e) {
	scrollTop.value = e.target.scrollTop;
}

function inData(e) {
	if (parseInt(shopSetting.value.member_show_parent) == 0) {
		e = e + 1;
	}
	childList.value = [];
	switch (e) {
		case 0:
			getDistributionMemberParent();
			break;
		case 1:
			childType.value = 1;
			getDistributionMemberChild();
			break;
		case 2:
			childType.value = 2;
			getDistributionMemberChild();
			break;
		default:
			getDistributionMemberParent();
			break;
	}
}

function dropdownItemTap(e) {
	let index = parseInt(e.currentTarget.dataset.index);
	let list = dropdownList.value;
	for (let i = 0; i < list.length; i++) {
		if (i === index) {
			list[i].selected = true;
		} else {
			list[i].selected = false;
		}
	}
	dropdownList.value = list;
	selectHeight.value = 0;
	page.value = 1;
	childList.value = [];
	selectName.value = list[index].name;
	levelId.value = list[index].value;
	getDistributionMemberChild();
}

function dropdownTap() {
	selectHeight.value = 370;
	if (dropdownList.value.length < 5) {
		selectHeight.value = dropdownList.value.length * 75;
	}
}

function hideDropdownList() {
	selectHeight.value = 0;
}

function getDistributionMemberChild() {
	loadingStatus.value = 'loading';
	let query = {
		page: page.value,
		type: childType.value,
		page_size: uni.$api.appConfig.pageSize,
	};
	let params = {};
	if (levelId.value) {
		params.level_id = levelId.value;
	}
	if (keyword.value) {
		params.keyword = keyword.value;
	}
	isLoading.value = true;
	uni.$api.http
		.post(uni.$api.apiShop[config[type.value].api] + `?page=${query.page}&page_size=${query.page_size}&type=${query.type}`, {
			...params,
		})
		.then((res) => {
			loadingStatus.value = res.data.list.length == uni.$api.appConfig.pageSize ? 'loadmore' : 'nomore';
			childList.value = [...childList.value, ...res.data.list];
			teamCount.value = res.data.total_count;
			if (page.value == 1 && res.data.list.length == 0) {
				loadingStatus.value = 'noData';
			}
		})
		.catch(() => {
			loadingStatus.value = 'loadmore';
		})
		.finally(() => {
			isLoading.value = false;
		});
	uni.stopPullDownRefresh();
}

// 控制清除搜索
function inputFocus() {
	isKeyword.value = true;
}

// 清除搜索
function changeInput() {
	if (!keyword.value && isKeyword.value) {
		search();
	}
}

// 确定搜索
function search() {
	childList.value = [];
	getDistributionMemberChild();
}
</script>

<style lang="scss" scoped>
.search-box {
	display: flex;
	align-items: center;
	padding: 20rpx 15rpx 20rpx 20rpx;
	background: #fff;
	.dz-top-item {
		height: 28rpx;
		line-height: 28rpx;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		.iconfont {
			font-size: 36rpx;
			font-weight: 500;
		}
	}
	.dz-dropdownlist {
		width: 100%;
		position: absolute;
		background: #fff;
		border-bottom-left-radius: 24rpx;
		border-bottom-right-radius: 24rpx;
		overflow: hidden;
		box-sizing: border-box;
		padding-top: 10rpx;
		padding-bottom: 26rpx;
		left: 0;
		top: 168rpx;
		visibility: hidden;
		transition: all 0.2s ease-in-out;
		z-index: 99;
		.iconcheck {
			font-size: 32rpx;
			line-height: 88rpx;
		}
	}
	.dz-dropdownlist-show {
		visibility: visible;
	}
	.dz-dropdownlist-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: -1;
		transition: all 0.2s ease-in-out;
		opacity: 0;
		visibility: hidden;
	}
	.dz-mask-show {
		opacity: 1;
		visibility: visible;
	}
	.dz-dropdownlist-item {
		// color: $dz-main-color;
		height: 70rpx;
		font-size: 28rpx;
		padding: 0 40rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.search {
		flex: 1;
	}
}
.team-count {
	display: flex;
	align-items: center;
	padding: 20rpx;
	background: #fff;
	border-radius: 20rpx;
	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80rpx;
		height: 80rpx;
		margin-right: 20rpx;
		border-radius: 15rpx;
	}
}

.card-box {
	margin-top: 184rpx;
	padding: 20rpx;
	.card-item {
		display: flex;
		border-radius: 20rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		background: #fff;
		color: #333;
		.img {
			flex-shrink: 0;
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			margin-right: 20rpx;
		}
		.name {
			color: #999;
			text {
				margin-left: 6rpx;
				font-size: 32rpx;
				color: #333;
			}
		}
		.cell {
			line-height: 46rpx;
			text {
				margin-right: 6rpx;
				color: #999;
			}
		}
		.time {
			color: #999;
		}
	}
	.card-item:last-child {
		margin-bottom: 0;
	}
}
</style>

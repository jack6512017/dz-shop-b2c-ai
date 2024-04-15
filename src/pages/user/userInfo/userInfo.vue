<template>
	<view>
		<dz-navbar :title="language.user.personalData"></dz-navbar>
		<dz-cell-group>
			<dz-cell-item center title="ID" :arrow="false" :border-bottom="false" @tap="copy(userInfo.id)">
				<template #right-icon>{{ userInfo.id }} <text :style="{ marginLeft: '10rpx', color: theme.dzBaseColor }">复制</text> </template>
			</dz-cell-item>
			<dz-cell-item v-if="userInfo.username" center title="账号" :arrow="false" :border-bottom="false" @tap="copy(userInfo.username)">
				<template #right-icon>{{ userInfo.username }} <text :style="{ marginLeft: '10rpx', color: theme.dzBaseColor }">复制</text> </template>
			</dz-cell-item>
			<dz-cell-item center :title="language.user.mobile" :value="userInfo.mobile" :arrow="false" :border-bottom="false"></dz-cell-item>
			<dz-cell-item center :title="language.user.nickname" :value="userInfo.nickname" :border-bottom="false" @tap="nicknameTap"></dz-cell-item>
			<dz-cell-item
				center
				:title="language.user.realname"
				:value="userInfo.realname"
				:border-bottom="false"
				:arrow="!userInfo.realname"
				@tap="realnameTap"
			></dz-cell-item>
			<dz-cell-item
				center
				:title="language.user.gender"
				:border-bottom="false"
				:value="userInfo.gender && genders[parseInt(userInfo.gender)].name"
				@tap="gendersTap"
			></dz-cell-item>
			<dz-cell-item center title="推荐码" :border-bottom="false" :arrow="false" @tap="copy(userInfo.promo_code)">
				<template #right-icon>{{ userInfo.promo_code }} <text :style="{ marginLeft: '10rpx', color: theme.dzBaseColor }">复制</text> </template>
			</dz-cell-item>
			<dz-cell-item
				center
				title="推荐人"
				:value="userInfo.baseParent ? userInfo.baseParent.nickname : '--'"
				:border-bottom="false"
				:arrow="false"
			></dz-cell-item>
		</dz-cell-group>
		<!-- 修改昵称 -->
		<dz-modal
			v-model:show="nicknameShow"
			:title="language.user.changeNickname"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="showCancelButton"
			:async-close="true"
			@confirm="nicknameConfirm"
		>
			<dz-field
				v-model="putNickname"
				type="nickname"
				:label="language.user.nickname"
				:placeholder="language.user.inputNickname"
				:border-bottom="false"
				maxlength="12"
				style="margin: 20rpx 0 10rpx"
			></dz-field>
		</dz-modal>
		<!-- 修改真实姓名 -->
		<dz-modal
			v-model:show="realnameShow"
			:title="language.user.changeRealname"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="showCancelButton"
			:async-close="true"
			@confirm="realnameConfirm"
		>
			<dz-field
				v-model="putRealname"
				:label="language.user.realname"
				:placeholder="language.user.inputRealname"
				:border-bottom="false"
				maxlength="12"
				style="margin: 20rpx 0 10rpx"
			></dz-field>
		</dz-modal>
		<!-- 选择性别 -->
		<dz-modal
			v-model:show="genderShow"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:title="language.user.changeGender"
			:show-cancel-button="showCancelButton"
			:async-close="true"
			@confirm="genderConfirm"
		>
			<view class="gender-box">
				<view
					class="gender-item"
					v-for="(item, index) in genders"
					:key="index"
					:style="{
						color: item.value == putGender ? item.iconColor : '',
						background: item.value == putGender ? item.activeColor : '',
					}"
					@tap="radioChange(item.value)"
				>
					<dz-icon :name="item.icon" size="36" :color="item.iconColor"></dz-icon>
					<text class="dz-m-l-10">{{ item.name }}</text>
				</view>
			</view>
		</dz-modal>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const language = uni.$api.language;
const genders = [
	{
		value: '0',
		name: language.orderCreate.uncharted,
		icon: 'ask',
		iconColor: '#3BD4C6',
		activeColor: '#E3FCF9',
	},
	{
		value: '1',
		name: language.user.man,
		icon: 'ask',
		iconColor: '#65D1FF',
		activeColor: '#E6F7FF',
	},
	{
		value: '2',
		name: language.user.woman,
		icon: 'female',
		iconColor: '#FB86A1',
		activeColor: '#FFEAEF',
	},
];
const userInfo = reactive<any>({});
const nicknameShow = ref<boolean>(false);
const realnameShow = ref<boolean>(false);
const genderShow = ref<boolean>(false);
const putNickname = ref<string>('');
const putRealname = ref<string>('');
const putGender = ref<string>('');
const showCancelButton = ref<boolean>(true);

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: language.user.personalData,
	});
	getUserInfo();
});

const theme = computed(() => {
	return userStore.getTheme;
});

async function getUserInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		for (const key in res.data) {
			userInfo[key] = res.data[key];
		}
		putNickname.value = res.data.nickname;
		putGender.value = res.data.gender;
		putRealname.value = res.data.realname;
	});
}

function nicknameTap() {
	putNickname.value = userInfo.nickname;
	nicknameShow.value = true;
}

async function nicknameConfirm() {
	showCancelButton.value = false;
	await uni.$api.http
		.put(
			uni.$api.apiMember.updateInfo,
			{
				nickname: putNickname.value,
			},
			{
				params: {
					id: userInfo.id,
				},
			}
		)
		.then(() => {
			uni.$api.toast(language.user.modifiedDataSuccessfully);
			userInfo.nickname = putNickname.value;
			userStore.setUserInfo(userInfo);
		})
		.finally(() => {
			nicknameShow.value = false;
			showCancelButton.value = true;
		});
}

function realnameTap() {
	if (userInfo.realname) return;
	putRealname.value = userInfo.realname;
	realnameShow.value = true;
}

async function realnameConfirm() {
	showCancelButton.value = false;
	await uni.$api.http
		.put(uni.$api.apiMember.setRealName, {
			realname: putRealname.value,
		})
		.then((res) => {
			uni.$api.toast(language.user.modifiedDataSuccessfully);
			userInfo.realname = putRealname.value;
			userStore.setUserInfo(userInfo);
		})
		.finally(() => {
			realnameShow.value = false;
			showCancelButton.value = true;
		});
}

function radioChange(value) {
	putGender.value = value;
}

function gendersTap() {
	putGender.value = userInfo.gender;
	genderShow.value = true;
}

async function genderConfirm() {
	showCancelButton.value = false;
	await uni.$api.http
		.put(
			uni.$api.apiMember.updateInfo,
			{
				gender: putGender.value,
			},
			{
				params: {
					id: userInfo.id,
				},
			}
		)
		.then(() => {
			uni.$api.toast(language.user.modifiedDataSuccessfully);
			userInfo.gender = putGender.value;
			userStore.setUserInfo(userInfo);
		})
		.finally(() => {
			genderShow.value = false;
			showCancelButton.value = true;
		});
}

// 复制
function copy(val) {
	uni.$api.copy(val);
	uni.$api.toast('已复制到剪贴板');
}
</script>

<style lang="scss">
.gender-box {
	display: flex;
	justify-content: center;
	padding: 40rpx 20rpx;
}

.gender-item {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 136rpx;
	height: 76rpx;
	border-radius: 15rpx;
	font-size: 28rpx;
	margin: 0 20rpx;
	transform: scale(0.9);
}
</style>

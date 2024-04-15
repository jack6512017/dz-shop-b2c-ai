<template>
	<view>
		<dz-navbar title="注册"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" :label-width="140">
				<dz-form-item label="用户名" prop="username" :borderBottom="true">
					<dz-input v-model="form.username" maxlength="20" border="none" clearable placeholder="请输入用户名" />
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelPassword" prop="password" :borderBottom="true">
					<dz-input :password="isPassword" v-model="form.password" maxlength="20" border="none" clearable placeholder="请输入密码">
						<template #suffix>
							<dz-icon class="dz-p-6" :name="isPassword ? 'attentionforbidfill' : 'attentionfill'" size="32" @click="passwordChange(1)"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item :label="language.modifyPassword.labelConfirmPassword" prop="password_repetition">
					<dz-input
						:password="isPasswordRepetition"
						v-model="form.password_repetition"
						maxlength="20"
						border="none"
						clearable
						placeholder="请输入确认密码"
					>
						<template #suffix>
							<dz-icon
								class="dz-p-6"
								:name="isPasswordRepetition ? 'attentionforbidfill' : 'attentionfill'"
								size="32"
								@click="passwordChange(2)"
							></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
			</dz-form>
		</view>
		<view class="button" style="margin-top: 100rpx">
			<dz-button
				shape="circle"
				:custom-style="{ width: '100%', background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
				:border="false"
				hover-class="none"
				:loading="isBtnLoading"
				@click="submit"
			>
				确定
			</dz-button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import { useGroup } from '@/hooks/group';

const userStore = useUserStore();
const groupData = useGroup();
const language = uni.$api.language;
const formRef = ref(null);
const isPassword = ref<Boolean>(true);
const isPasswordRepetition = ref<Boolean>(true);
const isBtnLoading = ref<Boolean>(false);
const form = reactive({
	username: '',
	password: '',
	password_repetition: '',
});

const rules = {
	username: [
		{
			type: 'string',
			required: true,
			message: '请输入用户名',
			trigger: ['blur', 'change'],
		},

		{
			pattern: /^[_\w\d]{6,20}$/iu,
			transform(value) {
				return String(value);
			},
			message: '用户名由英文大小写、数字和下划线组成，6-20位',
			trigger: ['blur', 'change'],
		},
		{ min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: ['blur', 'change'] },
	],
	password: {
		type: 'string',
		required: true,
		message: '请输入密码',
		trigger: ['blur', 'change'],
	},
	password_repetition: [
		{
			type: 'string',
			required: true,
			message: '请输入密码',
			trigger: ['blur', 'change'],
		},
		{
			// 此为同步验证，可以直接返回true或者false，如果是异步验证，稍微不同，见下方说明
			validator: (rule, value, callback) => {
				// 调用uView自带的js验证规则，详见：https://www.uviewui.com/js/test.html
				return value == form.password;
			},
			message: '两次输入的密码不一致',
			// 触发器可以同时用blur和change，二者之间用英文逗号隔开
			trigger: ['change', 'blur'],
		},
	],
};

const theme = computed(() => {
	return userStore.getTheme;
});

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({ title: '注册' });
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function passwordChange(type: number) {
	if (type === 1) {
		isPassword.value = !isPassword.value;
	} else {
		isPasswordRepetition.value = !isPasswordRepetition.value;
	}
}

//修改手机号码
function submit() {
	unref(formRef)
		.validate()
		.then((res) => {
			if (isBtnLoading.value) {
				return;
			}
			isBtnLoading.value = true;
			uni.showLoading({
				mask: true,
			});
			let formData = {
				...form,
				group: groupData.group,
				promo_code: userStore.getPromoCode || '',
				dealer_code: userStore.getDealerCode || '',
				store_id: userStore.getStoreId || '',
			};

			uni.$api.http
				.post(uni.$api.apiMember.usernameRegister, {
					...formData,
				})
				.then((res) => {
					userStore.setUserMobile(form.mobile);
					userStore.setUserMobileArea(form.mobile_area);
					userStore.login(res.data);
					// 是否小程序登录
					if (res.data.member && res.data.member.auth && res.data.member.auth.wechatMp) {
						userStore.setWechatMpLogin(true);
					}

					let pages = getCurrentPages();
					if (pages.length < 2) {
						uni.reLaunch({
							url: uni.$api.appConfig.indexPath,
						});
					} else {
						uni.$api.router.back(2);
					}
				})
				.finally(() => {
					isBtnLoading.value = false;
					uni.hideLoading();
				});
		});
}
</script>

<style lang="scss" scoped>
.form-content {
	margin: 20rpx;
	padding: 10rpx 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
}

.button {
	margin: 0 30rpx;
}
</style>

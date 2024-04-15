<template>
	<view>
		<dz-navbar :is-fixed="true" title="快速录入书本" titleWidth="290"></dz-navbar>
		<view class="form-content">
			<dz-form ref="formRef" :model="form" label-width="140">
				<dz-form-item label="ISBN码" prop="salecode" borderBottom="true">
					<dz-input v-model="form.salecode" maxlength="20" border="none" clearable placeholder="请输入ISBN" />
					<template #right>
						<dz-icon name="scan" size="36" customStyle="padding:0 24rpx;" @click="handleTapScan"></dz-icon>
					</template>
				</dz-form-item>
				<dz-form-item label="商品分类" prop="cate_id" :borderBottom="productCateType == 1">
					<view class="dz-history-header">
						<view style="color: #c0c4cc; font-size: 30rpx" v-if="selectData.length === 0">请选择分类</view>
						<view style="color: #c0c4cc; font-size: 30rpx" v-if="selectData.length && productCateType == 1">{{ selectData[0].title }}</view>
						<block v-if="selectData.length && productCateType == 2">
							<view v-if="isClosable" class="dz-flex">
								<view class="dz-tips-color" @click="handleAllDelete()">全部删除</view>
								<dz-line margin="0 12rpx 0 12rpx" direction="col" length="20px" color="#A3A3A3"></dz-line>
								<view @click="handleOk()" :style="{ color: theme.dzBaseColor }">完成</view>
							</view>
							<dz-icon v-else name="deletefill" size="36" color="#999" @click="openModal"></dz-icon>
						</block>
					</view>
					<template #right>
						<dz-icon name="right" size="36" customStyle="padding:0 24rpx;" @click="handleCate"></dz-icon>
					</template>
				</dz-form-item>
				<view v-if="productCateType == 2" class="dz-p-b-10 dz-m-t-20 dz-border-bottom">
					<view class="dz-flex-row dz-flex dz-flex-wrap">
						<block v-for="(item, index) in selectData" :key="index">
							<dz-tag
								class="dz-item-tag dz-line-1"
								:index="index"
								type="info"
								shape="circle"
								:bgColor="theme.dzBgColor"
								:borderColor="theme.dzBgColor"
							>
								<view class="text dz-line-1" :id="'tag-' + index">{{ item.title }}</view>
								<view v-if="isClosable" class="close" @tap.stop="deleteChange(item.id, index)">
									<!-- #ifdef MP -->
									<dz-icon name="roundclosefill" color="#A3A3A3" size="30"></dz-icon>
									<!-- #endif -->
									<!-- #ifndef MP -->
									<dz-icon name="roundclosefill" color="#A3A3A3"></dz-icon>
									<!-- #endif -->
								</view>
							</dz-tag>
						</block>
					</view>
				</view>

				<dz-form-item label="商品价格" prop="price" borderBottom="true">
					<dz-number-box v-model="form.price" type="digit" :min="0" :inputWidth="160"></dz-number-box>
				</dz-form-item>
				<dz-form-item label="库存量" prop="stock" borderBottom="true">
					<dz-number-box v-model="form.stock" :min="0" :decimalLength="0" :inputWidth="160"></dz-number-box>
				</dz-form-item>
				<dz-form-item label="仓存库架" prop="province_id" :borderBottom="true">
					<dz-input v-model="shelfsTitle" disabled disabledColor="transparent" border="none" placeholder="请选择仓存库架">
						<template #suffix>
							<dz-icon name="right" size="36" customStyle="padding:0 24rpx;" @click="handleShelfSelect"></dz-icon>
						</template>
					</dz-input>
				</dz-form-item>
				<dz-form-item label="商品状态" :required="false">
					<template #right>
						<dz-switch
							v-model="form.product_status"
							:activeValue="1"
							:inactiveValue="0"
							:activeColor="theme.dzBaseColor"
							customStyle="margin-right:24rpx;"
						></dz-switch>
					</template>
				</dz-form-item>
			</dz-form>
		</view>
		<view class="button" style="margin-top: 100rpx">
			<dz-button
				:border="false"
				:custom-style="{ width: '100%', background: isButtonLoading ? theme.dzBaseDisabled : theme.dzBaseColor, color: theme.dzBaseFontColor }"
				hover-class="none"
				shape="circle"
				:loading="isButtonLoading"
				@click="submit"
			>
				确定
			</dz-button>
		</view>

		<dz-tree-select
			ref="dzTreeSelectRef"
			v-model="selectShow"
			:mode="productCateType == 2 ? true : false"
			:defaultValue="defaultValue"
			:deleteValue="deleteValue"
			:safe-area-inset-bottom="true"
			:list="options"
			@confirm="treeConfirm"
		>
		</dz-tree-select>
		<dz-modal
			v-model:show="modalShow"
			:mask-close-able="false"
			:showTitle="false"
			content="确认要删除全部所选的分类吗？"
			:contentStyle="{ color: theme.dzMainColor, fontSize: '32rpx', fontWeight: 'bold' }"
			:show-cancel-button="!modalLoading"
			:confirm-color="theme.dzBaseColor"
			:async-close="true"
			@cancel="modalCancel"
			@confirm="modalConfirm"
		></dz-modal>
		<dz-select
			mode="single-column"
			v-model="shelfsSelectShow"
			borderRadius="0"
			:list="shelfs"
			:default-value="[defaultIndex]"
			@confirm="handleConfirm"
		></dz-select>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, unref, toRefs, watch } from 'vue';
import { onLoad, onReady } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const formRef = ref(null);
const dzTreeSelectRef = ref(null);
const isButtonLoading = ref<Boolean>(false);
const selectShow = ref<boolean>(false);
const defaultValue = ref();
const deleteValue = ref([]);
const options = ref<Array>([]);
const productCateType = ref<string>();
const selectData = ref<Array>([]);
const modalShow = ref<boolean>(false);
const modalLoading = ref<boolean>(false);
const isClosable = ref<boolean>(false);
const shelfsSelectShow = ref<boolean>(false);
const shelfs = ref<Array>([]);
const defaultIndex = ref<number>(0);
const shelfsTitle = ref<string>();

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => userStore.getShopSetting);

watch(
	() => selectShow.value,
	(val) => {
		if (!val) {
			deleteValue.value = [];
		}
	}
);

const data = reactive({
	form: {
		salecode: '',
		cate_id: '',
		price: '',
		stock: '',
		shelf_id: '',
		product_status: 1,
	},
});

const rules = {
	salecode: {
		type: 'string',
		required: true,
		message: '请输入ISBN码',
		trigger: ['blur'],
	},
	price: {
		type: 'number',
		required: true,
		message: '请输入商品价格',
		trigger: ['blur'],
	},
	stock: {
		type: 'number',
		required: true,
		message: '请输入库存量',
		trigger: ['blur'],
	},
};

onLoad(async () => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '快速录入书本',
	});
	getView();
});

onReady(() => {
	unref(formRef).setRules(rules);
});

function getView() {
	uni.$api.http.get(uni.$api.apiShop.productUpdateBookView).then((res) => {
		options.value = res.data.cates;
		productCateType.value = parseInt(res.data.product_cate_type);
		shelfs.value = [
			{
				label: '请选择',
				value: '0',
			},
		];
		const shelf = res.data.shelf;
		for (let key in shelf) {
			shelfs.value.push({ label: shelf[key], value: key });
		}
	});
}

async function handleTapScan() {
	/*  #ifndef H5  */
	uni.scanCode({
		success: (res) => {
			scan(res.result);
		},
		fail: () => {},
	});
	/*  #endif  */
	/*  #ifdef H5  */
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		//注意公众号jweixin方法仅支持异步
		uni.$api.jweixin.ready(() => {
			uni.$api.jweixin.scanQRCode({
				needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				success(res) {
					scan(res.resultStr);
				},
				fail(err) {
					uni.$api.toast(uni.$api.language.index.scanError + err.errMsg);
				},
			});
		});
	} else {
		uni.$api.toast(uni.$api.language.application.needOprationInWechat);
	}
	/*  #endif  */
}

function scan(e: any) {
	data.form.salecode = e;
	uni.$api.http
		.get(uni.$api.apiShop.productUpdateBookFind, {
			params: { salecode: e },
		})
		.then((res) => {
			if (res.data) {
				const { cates, price, stock, shelf, shelf_id, product_status } = res.data;
				data.form = { ...data.form, price: parseFloat(price), stock, shelf_id, product_status };
				shelfsTitle.value = shelf ? shelf.title : '';
				const cateIds = [];
				cates.forEach((item) => {
					cateIds.push(item.cate_id);
				});
				setTimeout(() => {
					if (cateIds.length) {
						treeConfirm(cateIds);
					}
				}, 30);
			}
		});
}

function handleCate() {
	isClosable.value = false;
	selectShow.value = !selectShow.value;
}

function treeConfirm(e) {
	if (!e) {
		defaultValue.value = null;
		getOptionsNames([]);
		return;
	}
	defaultValue.value = productCateType.value == 2 ? e : e[0];
	getOptionsNames(e);
}

function getTreeName(list, id) {
	for (let i = 0; i < list.length; i++) {
		if (list[i].id === id) {
			return list[i];
		} else if (list[i].children && list[i].children.length > 0) {
			let res = getTreeName(list[i].children, id);
			if (res) {
				return res;
			}
		}
	}
}

function getOptionsNames(ids) {
	let newArr = [];
	for (let i = 0; i < ids.length; i++) {
		newArr.push(getTreeName(options.value, ids[i]));
	}
	selectData.value = newArr;
}

function openModal() {
	isClosable.value = true;
}

function handleOk() {
	isClosable.value = false;
}

function handleAllDelete() {
	modalShow.value = true;
}

function modalCancel() {
	if (!modalLoading.value) {
		modalShow.value = false;
	}
}

function modalConfirm() {
	deleteValue.value = defaultValue.value;
	selectData.value = [];
	defaultValue.value = [];
	isClosable.value = false;
	modalShow.value = false;
}

function deleteChange(id: number, index: number) {
	deleteValue.value.push(id);
	selectData.value.splice(index, 1);
	defaultValue.value = [];
	for (let i = 0; i < selectData.value.length; i++) {
		defaultValue.value.push(selectData.value[i].id);
	}
}

// 选择仓存库架
function handleShelfSelect() {
	if (shelfs.value.length) {
		const list = shelfs.value;
		const findIndex = list.findIndex((item) => item.value == data.form.shelf_id);
		if (findIndex != -1) {
			defaultIndex.value = findIndex;
		} else {
			defaultIndex.value = 0;
		}
	}
	shelfsSelectShow.value = true;
}

function handleConfirm(e: any) {
	data.form.shelf_id = e[0].value == 0 ? '' : e[0].value;
	shelfsTitle.value = e[0].value == 0 ? '' : e[0].label;
}

function submit(e: any) {
	if (!selectData.value.length) {
		uni.$api.toast('请选择商品分类！');
		return;
	}
	unref(formRef)
		.validate()
		.then((res) => {
			if (isButtonLoading.value) {
				return;
			}
			isButtonLoading.value = true;
			uni.showLoading({
				mask: true,
			});
			let formData = {
				...data.form,
				cate_id: defaultValue.value,
			};
			uni.$api.http
				.post(uni.$api.apiShop.productUpdateBook, {
					...formData,
				})
				.then((res) => {
					isButtonLoading.value = false;
					uni.$api.toast('创建成功！可以在后台查看详细商品信息');
				})
				.catch((err) => {
					isButtonLoading.value = false;
					uni.$api.toast(err.message);
				});

			uni.hideLoading();
		});
}

const { form } = { ...toRefs(data) };
</script>

<style lang="scss">
.form-content {
	margin: 20rpx;
	padding: 10rpx 0rpx 10rpx 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
}

.dz-history-header {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.dz-item-tag {
	position: relative;
	max-width: 100%;
	/* #ifdef MP */
	.dz-tag {
		margin: 0rpx 16rpx 16rpx 0rpx !important;
	}
	/* #endif */
	/* #ifndef MP */
	margin: 0rpx 12rpx 12rpx 0rpx !important;
	/* #endif */
	font-size: 28rpx !important;
	color: $dz-main-color !important;
	overflow: visible;
	.text {
		display: inline-block;
		max-width: 100%;
	}
	.close {
		position: absolute;
		/* #ifdef MP */
		right: 5rpx;
		top: -15rpx;
		/* #endif */
		/* #ifndef MP */
		right: -10rpx;
		top: -10rpx;
		/* #endif */
	}
}

.button {
	margin: 0 30rpx;
}
</style>

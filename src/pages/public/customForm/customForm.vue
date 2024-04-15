<template>
	<view
		class="custom-form"
		:style="{
			background:
				pageConfig.pageColorMode == 'default'
					? pageConfig.pageColor
					: pageConfig.pageLinearColor && pageConfig.pageLinearColor.color
					? pageConfig.pageLinearColor.color
					: '',
		}"
	>
		<dz-navbar-immersive
			v-if="pageConfig.isNavColor == 1"
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar :title="navBarTitle"></dz-navbar>
		</dz-navbar-immersive>
		<view class="dz-relative" style="z-index: 991">
			<dz-navbar
				:title="navBarTitle"
				:is-fixed="pageConfig.isNavColor == 0"
				:background="{ background: pageConfig.isNavColor == 0 ? '#fff' : pageConfig.navBgColor }"
				:border-bottom="false"
				:back-icon-color="pageConfig.isNavColor == 0 ? '#303133' : pageConfig.navColor"
				:title-color="pageConfig.isNavColor == 0 ? '#303133' : pageConfig.navColor"
			></dz-navbar>
		</view>
		<view v-if="pageConfig.backgroundPicture" class="custom-bg-img">
			<image
				:src="pageConfig.backgroundPicture"
				:style="{
					width: '100%',
					height: pageConfig.isHeight == 0 ? parseInt(pageConfig.pictureHeight) * 2 + 'rpx' : parseInt(pageConfig.pictureHeight) + 'px',
				}"
			>
			</image>
		</view>
		<view>
			<view
				class="dz-relative"
				style="z-index: 1"
				:style="{
					background:
						pageConfig.pageColorMode == 'default'
							? pageConfig.pageColor
							: pageConfig.pageLinearColor && pageConfig.pageLinearColor.color
							? pageConfig.pageLinearColor.color
							: '',
				}"
			>
				<view>
					<dz-form
						ref="mForm"
						:model="model"
						:label-width="config.formItem ? parseInt(config.formItem.labelWidth) * 2 : 160"
						:labelPosition="config.formItem.labelPosition"
						:label-align="config.formItem.labelAlign"
						:error-type="config.errorType"
					>
						<view v-for="(item, index) in components" :key="index">
							<!-- 标题 -->
							<view
								v-if="item.component == 'dz-title'"
								:style="{
									margin: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
										parseInt(item.props.marginBottom) * 2
									}rpx`,
								}"
							>
								<dz-title
									:title="item.props.title"
									:mode="item.props.mode"
									:bar-color="item.props.barColor"
									:bar-bokeh-color="item.props.barBokehColor"
									:nameLeft="item.props.coverLeft"
									:nameRight="item.props.coverRight"
									:font-size="parseInt(item.props.fontSize) * 2"
									:barWidth="parseInt(item.props.barWidth) * 2"
									:barHeight="parseInt(item.props.barHeight) * 2"
									:title-color="item.props.titleColor"
									:tip-config="item.props.tipConfig"
									:icon-width="parseInt(item.props.iconWidth) * 2"
									:icon-height="parseInt(item.props.iconHeight) * 2"
								></dz-title>
							</view>
							<!-- 轮播图 -->
							<view v-if="item.component == 'dz-swiper'" :style="{ marginTop: `-${parseInt(item.props.pushTop) * 2}rpx` }">
								<view
									:style="{
										padding: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
											parseInt(item.props.marginBottom) * 2
										}rpx`,
									}"
								>
									<dz-swiper
										name="cover"
										:list="item.props.list"
										:border-radius="parseInt(item.props.borderRadius) * 2"
										:mode="item.props.mode"
										:height="parseInt(item.props.height) * 2"
										:indicator-pos="item.props.indicatorPos"
										:effect3d="item.props.effect3d == 1 ? true : false"
										:title="item.props.title == 1 ? true : false"
										:bgColor="item.props.bgColor"
										@click="swiperClick(index, $event)"
									></dz-swiper>
								</view>
							</view>
							<!-- 广告 -->
							<view
								v-if="item.component == 'dz-banner'"
								class="dz-relative dz-banner"
								:style="{
									marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
									padding: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
										parseInt(item.props.marginBottom) * 2
									}rpx`,
								}"
							>
								<view
									:style="{
										overflow: 'hidden',
										height: parseInt(item.props.height) * 2 + 'rpx',
									}"
								>
									<dz-image
										:src="item.props.cover"
										:borderRadius="parseInt(item.props.borderRadius) * 2"
										:height="parseInt(item.props.height) * 2"
										@click="banner(item.props.link)"
									></dz-image>
									<block v-for="(area, areaIndex) in item.props.area" :key="areaIndex">
										<view
											class="dz-absolute"
											:style="{
												boxSizing: 'border-box',
												width: parseInt(area.width) * 2 + 'rpx',
												height: parseInt(area.height) * 2 + 'rpx',
												top: parseInt(area.top) * 2 + 'rpx',
												left: parseInt(area.left) * 2 + 'rpx',
											}"
											@tap.stop="banner(area.link)"
										>
											<dz-image
												v-if="area.cover"
												:src="area.cover"
												:width="parseInt(area.width) * 2"
												:height="parseInt(area.height) * 2"
											></dz-image>
										</view>
									</block>
								</view>
							</view>
							<dz-form-item
								v-if="item.component == 'dz-input'"
								:label="item.label"
								:required="item.required == 2 && config.formItem.isRequired == 1 ? true : false"
								:prop="item.label"
								:custom-style="[formItemStyle(item)]"
							>
								<dz-input
									v-model="model[item.label]"
									:type="item.type"
									:placeholder="item.placeholder"
									:border="config.input.border"
									:disabled="item.required == 3"
									clearable
									:custom-style="{
										padding: `${parseInt(config.input.padding) * 2}rpx`,
										borderRadius: `${parseInt(config.input.borderRadius) * 2}rpx`,
										backgroundColor: config.input.bgColor,
										borderColor: config.input.borderColor,
									}"
									:placeholder-style="`color: ${config.input.placeholderStyle};`"
								>
									<template v-if="item.type == 'mobile'" #prefix>
										<view class="dz-m-r-10" @click="openClick(index, item)">
											{{ mobilePattern[item.mobile_area].label }}
										</view>
									</template>
								</dz-input>
							</dz-form-item>
							<dz-form-item
								v-if="item.component == 'dz-textarea'"
								:label="item.label"
								:required="item.required == 2 && config.formItem.isRequired == 1 ? true : false"
								:prop="item.label"
								:custom-style="[formItemStyle(item)]"
							>
								<dz-textarea
									v-model="model[item.label]"
									:height="parseInt(item.styleConfig.textareaHeight || 35) * 2"
									:fixed="true"
									:disabled="item.required == 3"
									:placeholder="item.placeholder"
									:count="item.count"
									:maxlength="item.maxLength ? item.maxLength : item.minLength ? item.minLength : 140"
									:border="config.input.border"
									:color="config.input.color"
									:custom-style="{
										padding: `${parseInt(config.input.padding) * 2}rpx`,
										borderRadius: `${parseInt(config.input.borderRadius) * 2}rpx`,
										backgroundColor: config.input.bgColor,
										borderColor: config.input.borderColor,
									}"
									:placeholder-style="`color: ${config.input.placeholderStyle};`"
								/>
							</dz-form-item>

							<dz-form-item
								v-if="item.component == 'dz-radio'"
								:label="item.label"
								:required="item.required == 2 && config.formItem.isRequired == 1 ? true : false"
								:prop="item.label"
								:custom-style="[formItemStyle(item)]"
							>
								<dz-radio-group
									v-model="model[item.label]"
									:shape="item.styleConfig.shape"
									:size="parseInt(item.styleConfig.size) * 2"
									:iconSize="parseInt(item.styleConfig.iconSize) * 2"
									:placement="item.styleConfig.placement"
									:active-color="item.styleConfig.activeColor"
									:customStyle="{
										margin: `${item.styleConfig.top}rpx ${item.styleConfig.right}rpx ${item.styleConfig.bottom}rpx ${item.styleConfig.left}rpx `,
									}"
									@change="radioCheckboxChange(item, index, $event)"
								>
									<dz-radio
										v-for="(val, radioIndex) in item.list"
										:key="radioIndex"
										:name="val.name"
										:label="val.name"
										:disabled="val.disabled"
									></dz-radio>
								</dz-radio-group>
							</dz-form-item>
							<dz-form-item
								v-if="item.component == 'dz-checkbox'"
								:label="item.label"
								:required="item.required == 2 && config.formItem.isRequired == 1 ? true : false"
								:prop="item.label"
								:custom-style="[formItemStyle(item)]"
							>
								<dz-checkbox-group
									v-model="model[item.label]"
									:shape="item.styleConfig.shape"
									:size="parseInt(item.styleConfig.size) * 2"
									:width="item.styleConfig.width == 1 ? '50%' : 'auto'"
									:wrap="item.styleConfig.wrap == 1 ? true : false"
									:active-color="item.styleConfig.activeColor"
									:disabled="item.required == 3"
									@change="radioCheckboxChange(item.label, $event)"
								>
									<dz-checkbox
										v-for="(check, checkIndex) in item.list"
										:key="checkIndex"
										v-model="check.checked"
										:name="check.name"
										:label="check.name"
										:disabled="check.disabled"
									>
									</dz-checkbox>
								</dz-checkbox-group>
							</dz-form-item>
							<dz-form-item
								v-if="item.component == 'dz-select'"
								:label="item.label"
								:required="item.required == 2 && config.formItem.isRequired == 1 ? true : false"
								:prop="item.label"
								:custom-style="[formItemStyle(item)]"
							>
								<dz-input
									v-model="model[item.label]"
									:type="item.type"
									:placeholder="item.placeholder"
									:border="config.input.border"
									:color="config.input.color"
									disabled
									:custom-style="{
										padding: `${parseInt(config.input.padding) * 2}rpx`,
										borderRadius: `${parseInt(config.input.borderRadius) * 2}rpx`,
										backgroundColor: config.input.bgColor,
										borderColor: config.input.borderColor,
									}"
									:placeholder-style="`color: ${config.input.placeholderStyle};`"
									suffixIcon="right"
									:suffixIconStyle="{ color: item.styleConfig.selectColor }"
									@click="openClick(index, item)"
								></dz-input>
							</dz-form-item>

							<dz-form-item
								v-if="item.component == 'dz-upload'"
								:label="item.label"
								:required="item.required == 2 && config.formItem.isRequired == 1 ? true : false"
								:prop="item.label"
								:custom-style="[formItemStyle(item)]"
							>
								<dz-upload
									:fileList="item.fileList ? item.fileList : []"
									:width="parseInt(uploadWidth(item)) * 2"
									:height="parseInt(uploadWidth(item)) * 2"
									@afterRead="afterRead($event, index, item)"
									@delete="deletePic($event, index)"
									@oversize="oversize($event, item)"
									multiple
									:max-count="item.maxLength"
									:uploadIcon="item.styleConfig.uploadIcon"
									:uploadText="item.uploadText"
									:uploadSize="item.styleConfig.uploadSize"
									:uploadIconColor="item.styleConfig.uploadIconColor"
									:max-size="parseInt(item.maxSize) * 1048576"
									:buttonCustomStyle="{
										backgroundColor: item.styleConfig.bgColor,
										border: `1px solid ${item.styleConfig.borderColor}`,
										borderRadius: `${item.styleConfig.borderRadius}px`,
									}"
									:custom-style="{
										borderRadius: `${item.styleConfig.borderRadius}px`,
									}"
								></dz-upload>
							</dz-form-item>
							<dz-form-item v-if="item.component == 'dz-agreement'" :prop="item.label" :custom-style="[formItemStyle(item)]">
								<dz-checkbox-group v-model="model[item.label]">
									<dz-checkbox
										:shape="item.styleConfig.shape"
										:size="parseInt(item.styleConfig.size) * 2"
										:iconSize="parseInt(item.styleConfig.iconSize) * 2"
										:disabled="item.required == 3"
										name="已勾选"
										:active-color="item.styleConfig.activeColor"
										@change="checkboxChange(item, index, $event)"
									></dz-checkbox>
								</dz-checkbox-group>
								<view
									class="dz-line-h-26"
									:class="item.styleConfig.borderBottom == 1 ? 'dz-text-underline' : ''"
									:style="{ color: item.color }"
									@tap="cellTap(item.link)"
								>
									{{ item.label ? item.label : '请填写协议' }}
								</view>
							</dz-form-item>
						</view>
					</dz-form>
				</view>
				<view v-if="JSON.stringify(config) != '{}' && config.buttonStyle" :style="[buttonStyle]">
					<dz-button
						hoverClass="none"
						:border="false"
						:customStyle="{
							background: config.buttonStyle.colorMode == 'default' ? config.buttonStyle.btnColor : config.buttonStyle.linearColor,
							color: config.buttonStyle.color ? config.buttonStyle.color : '#fff',
							borderRadius: `${parseInt(config.buttonStyle.borderRadius) * 2}rpx`,
						}"
						:loading="isSubmit"
						@click="submit"
					>
						提交
					</dz-button>
				</view>
			</view>
		</view>
		<!-- 出生年月 -->
		<dz-picker
			v-model="dateShow"
			borderRadius="40"
			start-year="1900"
			mode="time"
			:defaultTime="defaultDateTime"
			@cancel="dateCancel"
			@confirm="dateConfirm"
		></dz-picker>
		<!-- @input="dateChenge" -->
		<!-- 地址选择 -->
		<dz-picker mode="region" v-model="areaShow" borderRadius="40" :areaCode="regionCode" @cancel="areaCancel" @confirm="areaConfirm"></dz-picker>
		<!-- @input="areaCancel" -->
		<!-- 自定义下拉选择 -->
		<dz-select
			mode="single-column"
			v-model="customDataShow"
			borderRadius="40"
			:list="customData"
			:default-value="[defaultIndex]"
			valueName="value"
			labelName="value"
			@cancel="customCancel"
			@confirm="customDataConfirm"
		></dz-select>
		<!-- @input="customCancel" -->
		<!--手机号码地区选择-->
		<dz-select
			mode="single-column"
			v-model="mobileAreaShow"
			borderRadius="40"
			:default-value="[defaultIndex]"
			:safe-area-inset-bottom="true"
			:list="mobileAreaInfo"
			@confirm="mobileAreaConfirm"
		></dz-select>
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, unref, toRefs } from 'vue';
import { onLoad, onPageScroll } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

const userStore = useUserStore();
const { accessToken } = userStore.getData;
const language = uni.$api.language;
const mForm = ref(null);

const systemInfo = uni.getSystemInfoSync();
const mobilePattern = uni.$api.dataConfig.mobilePattern;
const validate = {
	chinese: '只能输入中文',
	chineseTextarea: '只能输入中文',
	email: '请输入正确的电子邮箱',
	idCard: '请输入正确的身份证号(第二代)',
	letter: '只能输入字母',
	letterTextarea: '只能输入字母',
	enOrNum: '只能输入字母或数字',
	enOrNumTextarea: '只能输入字母或数字',
	landline: '请输入正确的固定电话',
};
const data = reactive({
	mobileAreaInfo: [],
	mobileAreaShow: false,
	scrollTop: 0,
	opacity: 0,
	navBarTitle: '',
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	id: null,
	model: {},
	rules: {},
	components: [],
	config: {
		form: {
			marginTop: 0,
			marginBottom: 0,
			marginLeftRight: 0,
			bgColor: '#fff',
			borderRadius: 0,
		},
		formItem: {
			bgColor: '#fff',
			borderRadius: 0,
			labelPosition: 'left',
			labelAlign: 'left',
			labelWidth: 80,
			isRequired: 1,
			bottomBorder: 1,
		},
		input: {
			border: 'bottom',
			padding: 0,
			borderRadius: 0,
			bgColor: '#fff',
			borderColor: '',
			bgErrorColor: '',
			borderErrorColor: '',
			rightIconColor: '#c0c4cc',
		},
		buttonStyle: {
			marginTop: 10,
			marginBottom: 10,
			marginLeftRight: 10,
			borderRadius: 20,
			color: '#fff',
			colorMode: 'default',
			btnColor: '#2979ff',
			deg: 0,
			primaryColor: '#3D4FD2',
			deputyColor: '#AC8AEB',
			linearColor: 'linear-gradient(0deg,#3D4FD2 0%,#AC8AEB 100%)',
		},
		errorType: ['message', 'border', 'toast'],
	},
	pageConfig: {
		pageColorMode: 'default',
		pageColor: '#f3f4f6',
		pageLinearColor: {
			deg: 0,
			primaryColor: '#3D4FD2',
			deputyColor: '#AC8AEB',
		},
		isNavColor: 0,
		navBgColor: '#fff',
		backgroundPicture: '',
		pictureHeight: 667,
	},
	activeDate: {},
	dateShow: false,
	defaultDateTime: '',
	regionCode: [],
	areaShow: false,
	customDataShow: false,
	customData: [],
	defaultIndex: 0,
	isSubmit: false,
});

onLoad(async (options) => {
	await uni.$onLaunched;
	if (options.code) {
		data.id = options.code;
	}
	for (let area in mobilePattern) {
		data.mobileAreaInfo.push({ value: area, label: mobilePattern[area].label });
	}
	getData();
});

onPageScroll(() => {
	data.scrollTop = e.scrollTop;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const navbarStyle = computed(() => {
	let style = {};
	style.opacity = data.opacity;
	return style;
});

const formItemStyle = computed(() => (val) => {
	let style = {};
	style.backgroundColor = data.config.formItem.bgColor;
	style.margin = `${val.styleConfig.marginTop}px ${val.styleConfig.marginLeftRight}px ${val.styleConfig.marginBottom}px`;
	style.padding = `${val.styleConfig.paddingTopBottom}px ${val.styleConfig.paddingLeftRight}px!important`;
	style.borderRadius = data.config.formItem.borderRadius + 'px';
	return style;
});

const uploadStyle = computed(() => (val) => {
	return (val) => {
		let style = {};
		style.width = `${parseInt(uploadWidth(val)) * 2}rpx`;
		style.height = `${parseInt(uploadWidth(val)) * 2}rpx`;
		style.border = `1px solid ${val.styleConfig.borderColor}`;
		style.backgroundColor = val.styleConfig.bgColor;
		style.borderRadius = `${val.styleConfig.borderRadius}px`;
		return style;
	};
});
// 按钮
const buttonStyle = computed(() => {
	let style = {};
	style.padding = `${data.config.buttonStyle ? data.config.buttonStyle.marginTop : 0}px ${
		data.config.buttonStyle ? data.config.buttonStyle.marginLeftRight : 0
	}px ${data.config.buttonStyle ? data.config.buttonStyle.marginBottom : 0}px`;
	return style;
});

function opacityChange(e) {
	data.opacity = e.opacity;
}
function pageLoadingClick() {
	getData();
}
function getData() {
	data.pageLoadingShow = true;
	uni.$api.http
		.get(uni.$api.apiShop.diyCustomFormIndex, {
			params: {
				id: data.id,
			},
		})
		.then((res) => {
			data.components = JSON.parse(res.data.component);
			data.config = res.data.params.formConfig;
			data.pageConfig = res.data.params.pageConfig;
			infoForm();
			unref(mForm)?.setRules(data.rules);
			data.navBarTitle = res.data.title;
			uni.setNavigationBarTitle({
				title: data.navBarTitle,
			});
			data.pageLoadingShow = false;
		})
		.catch((err) => {
			data.pageLoadingStatus = 'error';
		});
}
function uploadWidth(val) {
	return (
		(systemInfo.windowWidth -
			(data.config.formItem.labelPosition == 'top' ? 0 : data.config.formItem.labelWidth) -
			42 -
			(val.styleConfig.marginLeftRight + val.styleConfig.paddingLeftRight) * 2) /
		3
	);
}
function triggerType(type) {
	let val;
	switch (type) {
		case 'blur':
			val = 'blur';
			break;
		case 'change':
			val = 'change';
			break;
		case 'all':
			val = ['change', 'blur'];
			break;
	}
	return val;
}
function infoForm() {
	data.model = {};
	data.rules = {};
	data.components.forEach((item) => {
		if (item.label) {
			data.model[item.label] = data.model[item.label] ? data.model[item.label] : item.value;
		}

		if (item.required == 2 && item.label && !['dz-upload'].includes(item.component)) {
			let trigger = triggerType(item.triggerType);
			data.rules[item.label] = [];
			let obj = {
				required: true,
				message: item.validText ? item.validText : `${item.label}不能为空`,
				trigger,
			};
			if (['dz-checkbox', 'dz-agreement'].includes(item.component)) {
				obj.type = 'array';
			}
			if (item.component == 'dz-agreement') {
				obj.message = item.validText ? item.validText : `请勾选${item.label}`;
			}
			data.rules[item.label].push(obj);
			if (item.type == 'mobile' && item.mobileRegular == 'isMobile') {
				data.rules[item.label].push({
					validator: (rule, value, callback) => {
						if (value.indexOf(' ') != -1) {
							let arr = [];
							arr = value.split(' ');
							value = arr[arr.length - 1];
						}

						return uni.$api.isMobile(value, item.mobile_area);
					},
					message: '请输入正确的手机号',
					trigger: ['change', 'blur'],
				});
			}
			if (item.minLength && !item.maxLength) {
				data.rules[item.label].push({
					min: parseInt(item.minLength),
					message: `${item.label}不能少${item.minLength}于个字`,
					trigger,
				});
			}
			if (item.minLength && item.maxLength) {
				data.rules[item.label].push({
					min: parseInt(item.minLength),
					max: parseInt(item.maxLength),
					message: `${item.label}长度在${item.minLength}到${item.maxLength}个字符`,
					trigger,
				});
			}
			if (item.regularType != 'default' && ['dz-input', 'dz-textarea'].includes(item.component) && ['text', 'password', 'textarea'].includes(item.type)) {
				data.rules[item.label].push({
					validator: (rule, value, callback) => {
						return uni.$api.test[item.regularType](value);
					},
					message: validate[item.regularType],
					trigger,
				});
			}
		}
	});
}
// 打开日期
function openClick(index, item) {
	data.activeDate = { index, ...item };
	if (item.label) {
		switch (item.selectType) {
			case 'date':
				if (data.model[item.label]) {
					data.defaultDateTime = data.model[item.label];
				}

				data.dateShow = data.components[index].isOpen = true;
				break;
			case 'area':
				if (item.address && item.address.area_id) {
					data.regionCode = [item.address.province_id, item.address.city_id, item.address.area_id];
				}
				data.areaShow = data.components[index].isOpen = true;
				break;
			case 'customData':
				data.customData = item.list;
				data.defaultIndex = 0;
				let findIndex = data.customData.findIndex((v) => v.value == data.model[item.label]);
				if (findIndex != -1) {
					data.defaultIndex = findIndex;
				}
				data.customDataShow = data.components[index].isOpen = true;
				break;
		}
		if (item.type == 'mobile') {
			data.defaultIndex = 0;
			let mobileFindIndex = data.mobileAreaInfo.findIndex((v) => v.value == item.mobile_area);
			if (mobileFindIndex != -1) {
				data.defaultIndex = mobileFindIndex;
			}
			data.mobileAreaShow = true;
		}
	}
}
function dateConfirm(e) {
	data.defaultDateTime = data.model[data.activeDate.label] = `${e.year}-${e.month}-${e.day}`;
	dateCancel();
}
function dateChenge() {
	dateCancel();
}
function dateCancel() {
	data.dateShow = false;
}
function areaConfirm(e) {
	data.model[data.activeDate.label] = e.province.title + ' ' + e.city.title + ' ' + e.area.title;
	areaCancel();
}
function areaCancel() {
	data.areaShow = false;
}
// 协议选择
function checkboxChange(val, index, e) {
	data.model[val.label] = e.value;
	data.components[index].value = e.value;
}
function customDataConfirm(e) {
	data.model[data.activeDate.label] = e[0].value;
	customCancel();
}
function customCancel() {
	data.customDataShow = false;
}
function radioCheckboxChange(key, e) {
	data.model[key] = e;
}
function mobileAreaConfirm(e) {
	data.components[data.activeDate.index].mobile_area = e[0].value;
	data.mobileAreaShow = false;
}

async function afterRead(event, index, v) {
	// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
	let lists = [].concat(event.file);
	let fileListLen = data.components[index].fileList.length;
	lists.map((item) => {
		data.components[index].fileList.push({
			...item,
			status: 'uploading',
			message: '上传中',
		});
	});
	for (let i = 0; i < lists.length; i++) {
		const result = await uploadFilePromise(lists[i].url);

		let item = data.components[index].fileList[fileListLen];

		data.components[index].fileList.splice(
			fileListLen,
			1,
			Object.assign(item, {
				status: 'success',
				message: '',
				url: result,
			})
		);
		if (!data.model[v.label]) {
			data.model[v.label] = [];
		}
		data.model[v.label].push(result);
		fileListLen++;
	}
}

function uploadFilePromise(url) {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: `${uni.$api.appConfig.apiDomain}${uni.$api.apiCommon.fileImages}`,
			filePath: url,
			name: 'file',
			header: { 'x-api-key': accessToken },
			success: (res) => {
				setTimeout(() => {
					resolve(JSON.parse(res.data).data.url);
				}, 1000);
			},
		});
	});
}

function deletePic(event, index) {
	data.components[index].fileList.splice(event.index, 1);
	data.model[item.label].splice(event.index, 1);
}

function oversize(event, item) {
	uni.$api.toast(`图片限制为${item.maxSize}M内`);
}

// 轮播图
function swiperClick(index, itemIndex) {
	const item = data.components[index].props.list[itemIndex];
	if (item.activeMenuType == 'coupon') {
		onCoupon(item);
		return;
	}
	uni.$api.shop.linkJump(item);
}
// 广告
function banner(val) {
	if (val.activeMenuType == 'coupon') {
		onCoupon(val);
		return;
	}
	uni.$api.shop.linkJump(val);
}
// 领取优惠劵
function onCoupon(item) {
	uni.$api.http
		.post(uni.$api.apiShop.couponReceive, {
			id: item.id,
		})
		.then((res) => {
			if (res && res.code == 200) {
				uni.$api.toast(uni.$api.language.product.couponGetSuccess);
			}
		});
}

function cellTap(val) {
	if (!val.type) return;
	let title;
	switch (val.type) {
		case 'register':
			title = '注册协议';
			break;
		case 'privacy':
			title = uni.$api.language.user.privacyPolicy;
			break;
		case 'recharge':
			title = '充值协议';
			break;
		case 'promoter':
			title = '分销商协议';
			break;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig.aboutProtocol,
		query: {
			field: val.type,
			title,
		},
	});
}

async function submit() {
	if (data.isSubmit) return;
	unref(mForm)
		?.validate()
		.then((valid) => {
			if (valid) {
				data.isSubmit = true;
				for (let i = 0; i < data.components.length; i++) {
					if (
						data.components[i].required == 1 &&
						data.components[i].label &&
						data.model[data.components[i].label] &&
						!['dz-upload', 'dz-agreement'].includes(data.components[i].component)
					) {
						if (data.components[i].type == 'mobile' && data.components[i].mobileRegular == 'isMobile') {
							if (!uni.$api.isMobile(data.model[data.components[i].label], data.components[i].mobile_area)) {
								uni.$api.toast('请输入正确的手机号');

								data.isSubmit = false;
								return;
								break;
							}
						}
						if (data.components[i].minLength && !data.components[i].maxLength) {
							if (data.model[data.components[i].label].length < data.components[i].minLength) {
								uni.$api.toast(`${data.components[i].label}不能少${data.components[i].minLength}于个字`);
								data.isSubmit = false;
								return;
								break;
							}
						}
						if (data.components[i].minLength && data.components[i].maxLength) {
							if (
								data.model[data.components[i].label].length > data.components[i].minLength &&
								data.model[data.components[i].label].length < data.components[i].maxLength
							) {
								uni.$api.toast(`${data.components[i].label}长度在${data.components[i].minLength}到${data.components[i].maxLength}个字符`);

								data.isSubmit = false;
								return;
								break;
							}
						}
						if (
							data.components[i].regularType != 'default' &&
							['dz-input', 'dz-textarea'].includes(data.components[i].component) &&
							['text', 'password', 'textarea'].includes(data.components[i].type)
						) {
							if (!uni.$api.test[data.components[i].regularType](data.model[data.components[i].label])) {
								uni.$api.toast(`${data.components[i].label}长度在${data.components[i].minLength}到${data.components[i].maxLength}个字符`);

								data.isSubmit = false;
								return;
								break;
							}
						}
					}

					if (data.components[i].component == 'dz-upload' && data.components[i].required == 2) {
						let msg = '';
						if (!data.model[data.components[i].label] || data.model[data.components[i].label].length == 0) {
							msg = data.components[i].validText ? data.components[i].validText : `${data.components[i].label}不能为空`;
						}
						// if (
						// 	(data.model[data.components[i].label] || data.model[data.components[i].label].length) &&
						// 	data.model[data.components[i].label].length
						// ) {
						// 	msg = `至少上传${data.components[i].maxLength}张图片`;
						// }
						if (msg) {
							uni.$api.toast(msg);
							data.isSubmit = false;
							return;
							break;
						}
					}

					// if (data.components[i].component == 'dz-agreement' && data.components[i].required == 2 && !data.model[data.components[i].label].length) {
					// 	uni.$api.toast(data.components[i].validText ? data.components[i].validText : `请勾选${data.components[i].label}`);

					// 	data.isSubmit = false;
					// 	return;
					// 	break;
					// }
				}
				let keys = [];

				data.components.forEach((item) => {
					if (item.component == 'dz-agreement') {
						data.model[item.label] = data.model[item.label].length ? ['已勾选'] : ['未勾选'];
					}
					if (item.type == 'mobile' && data.model[item.label]) {
						if (data.model[item.label].indexOf(' ') != -1) {
							let arr = [];
							arr = data.model[item.label].split(' ');
							data.model[item.label] = arr[arr.length - 1];
						}
						data.model[item.label] = `${mobilePattern[item.mobile_area].label} ${data.model[item.label]}`;
					}
					if (item.label) {
						keys.push(item.label);
					}
				});
				data.model.keys = keys;

				uni.$api.http
					.post(uni.$api.apiShop.diyCustomFormCreate, {
						page_id: data.id,
						content: data.model,
					})
					.then((res) => {
						uni.$api.toast('提交成功');
						setTimeout(() => {
							let pages = getCurrentPages();
							if (pages.length == 1) {
								uni.reLaunch({
									url: uni.$api.appConfig.indexPath,
								});
							} else {
								uni.navigateBack();
							}
							unref(mForm)?.resetFields();
							unref(mForm)?.clearValidate();
						}, 1000);
					})
					.finally(() => {
						data.isSubmit = false;
					});
			} else {
				data.isSubmit = false;
			}
		});
}

const {
	pageConfig,
	config,
	scrollTop,
	navBarTitle,
	model,
	components,
	isSubmit,
	dateShow,
	defaultDateTime,
	areaShow,
	regionCode,
	customDataShow,
	customData,
	defaultIndex,
	mobileAreaShow,
	mobileAreaInfo,
	pageLoadingShow,
	pageLoadingStatus,
} = { ...toRefs(data) };
</script>

<style lang="scss">
page,
.custom-form {
	height: 100%;
}

.custom-form {
	position: relative;

	.custom-bg-img {
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 0;

		image {
			width: 100%;
			display: block;
			float: left;
			vertical-align: bottom;
			font-size: 0;
		}

		img {
			font-size: 0;
			width: 100%;
			display: block;
			float: left;
			vertical-align: bottom;
		}
	}
}
</style>

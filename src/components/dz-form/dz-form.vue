<template>
	<view class="dz-form">
		<slot />
	</view>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
	name: 'dz-form',
});
</script>

<script leng="ts" setup>
import { reactive, ref, provide, getCurrentInstance, watch, computed, nextTick } from 'vue';
import Schema from '@/core/utils/async-validator';
import { isArray } from '@/utils/is';
// 去除警告信息
Schema.warning = function () {};
/**
 * Form 表单
 * @description 此组件一般用于表单场景，可以配置Input输入框，Select弹出框，进行表单验证等。
 * @tutorial https://www.uviewui.com/components/form.html
 * @property {Object}						model			当前form的需要验证字段的集合
 * @property {Object | Function | Array}	rules			验证规则
 * @property {String}						errorType		错误的提示方式，见上方说明 ( 默认 message )
 * @property {Boolean}						borderBottom	是否显示表单域的下划线边框   ( 默认 true ）
 * @property {String}						labelPosition	表单域提示文字的位置，left-左侧，top-上方 ( 默认 'left' ）
 * @property {String | Number}				labelWidth		提示文字的宽度，单位px  ( 默认 45 ）
 * @property {String}						labelAlign		lable字体的对齐方式   ( 默认 ‘left' ）
 * @property {Object}						labelStyle		lable的样式，对象形式
 * @example <u--formlabelPosition="left" :model="model1" :rules="rules" ref="form1"></u--form>
 */

const { proxy } = getCurrentInstance();
provide('dzForm', proxy);
const props = defineProps({
	// 当前form的需要验证字段的集合
	model: {
		type: Object,
		default: () => ({}),
	},
	// 验证规则
	rules: {
		type: [Object, Function, Array],
		default: () => ({}),
	},
	// 有错误时的提示方式，message-提示信息，toast-进行toast提示
	// border-bottom-下边框呈现红色，none-无提示
	errorType: {
		type: Array,
		default: () => ['message'],
	},
	// 是否显示表单域的下划线边框
	borderBottom: {
		type: Boolean,
		default: true,
	},
	// label的位置，left-左边，top-上边
	labelPosition: {
		type: String,
		default: 'left',
	},
	// label的宽度，单位px
	labelWidth: {
		type: [String, Number],
		default: 90,
	},
	// lable字体的对齐方式
	labelAlign: {
		type: String,
		default: 'left',
	},
	// lable的样式，对象形式
	labelStyle: {
		type: Object,
		default: () => ({}),
	},
});

const data = reactive({
	formRules: {},
	// 规则校验器
	validator: {},
	// 原始的model快照，用于resetFields方法重置表单时使用
	originalModel: null,
});

const children = ref([]);

defineExpose({
	children,
	setRules,
	validate,
	validateField,
	clearValidate,
	resetFields,
	labelPosition: props.labelPosition,
	labelAlign: props.labelAlign,
	labelStyle: props.labelStyle,
	labelWidth: props.labelWidth,
	errorType: props.errorType,
});

const propsChange = computed(() => [props.errorType, props.borderBottom, props.labelPosition, props.labelWidth, props.labelAlign, props.labelStyle]);

// 监听规则的变化
watch(
	() => props.rules,
	(nVal) => {
		setRules(nVal);
	},
	{
		immediate: true,
	}
);
// 监听属性的变化，通知子组件u-form-item重新获取信息
watch(
	() => propsChange.value,
	(nVal) => {
		if (children.value?.length) {
			children.value.map((child) => {
				// 判断子组件(u-form-item)如果有updateParentData方法的话，就就执行(执行的结果是子组件重新从父组件拉取了最新的值)
				typeof child.updateParentData == 'function' && child.updateParentData();
			});
		}
	}
);
// 监听model的初始值作为重置表单的快照
watch(
	() => props.model,
	(nVal) => {
		if (!data.originalModel) {
			data.originalModel = uni.$api.deepClone(nVal);
		}
	},
	{
		immediate: true,
	}
);

// 手动设置校验的规则，如果规则中有函数的话，微信小程序中会过滤掉，所以只能手动调用设置规则
function setRules(rules) {
	// 判断是否有规则
	if (Object.keys(rules).length === 0) return;
	if (import.meta.env.MODE === 'development' && Object.keys(props.model).length === 0) {
		uni.$api.error('设置rules，model必须设置！如果已经设置，请刷新页面。');
		return;
	}
	data.formRules = rules;
	// 重新将规则赋予Validator
	data.validator = new Schema(rules);
}
// 清空所有u-form-item组件的内容，本质上是调用了u-form-item组件中的resetField()方法
function resetFields() {
	resetModel();
}

// 重置model为初始值的快照
function resetModel(obj) {
	// 历遍所有u-form-item，根据其prop属性，还原model的原始快照
	children.value.map((child) => {
		const prop = child?.prop;
		const value = uni.$api.getProperty(data.originalModel, prop);
		uni.$api.setProperty(props.model, prop, value);
	});
}

// 清空校验结果

function clearValidate(props) {
	props = [].concat(props);
	children.value.map((child) => {
		// 如果u-form-item的prop在props数组中，则清除对应的校验结果信息
		if (props[0] === undefined || props.includes(child.prop)) {
			child.message = null;
		}
	});
}
// 对部分表单字段进行校验
async function validateField(value, callback, event = null) {
	// nextTick是必须的，否则model的变更，可能会延后于此方法的执行
	nextTick(() => {
		// 校验错误信息，返回给回调方法，用于存放所有form-item的错误信息
		const errorsRes = [];
		// 如果为字符串，转为数组
		value = [].concat(value);
		// 历遍children所有子form-item
		children.value.map((child) => {
			// 用于存放form-item的错误信息
			const childErrors = [];
			if (value.includes(child.prop)) {
				// 获取对应的属性，通过类似'a.b.c'的形式
				const propertyVal = uni.$api.getProperty(props.model, child.prop);
				// 属性链数组
				const propertyChain = child.prop.split('.');
				const propertyName = propertyChain[propertyChain.length - 1];

				const rule = data.formRules[child.prop];
				// 如果不存在对应的规则，直接返回，否则校验器会报错
				if (!rule) return;
				// rule规则可为数组形式，也可为对象形式，此处拼接成为数组
				const rules = [].concat(rule);

				// 对rules数组进行校验
				for (let i = 0; i < rules.length; i++) {
					const ruleItem = rules[i];
					// 将u-form-item的触发器转为数组形式
					const trigger = [].concat(ruleItem?.trigger);
					// 如果是有传入触发事件，但是此form-item却没有配置此触发器的话，不执行校验操作
					if (event && !trigger.includes(event)) continue;
					// 实例化校验对象，传入构造规则
					const validator = new Schema({
						[propertyName]: ruleItem,
					});
					validator.validate(
						{
							[propertyName]: propertyVal,
						},
						(errors, fields) => {
							if (isArray(errors)) {
								errorsRes.push(...errors);
								childErrors.push(...errors);
							}

							child.message = childErrors[0]?.message ?? null;
						}
					);
				}
			}
		});
		// 执行回调函数
		typeof callback === 'function' && callback(errorsRes);
	});
}

// 校验全部数据
function validate(callback) {
	// 开发环境才提示，生产环境不会提示
	if (import.meta.env.MODE === 'development' && Object.keys(data.formRules).length === 0) {
		uni.$api.error('未设置rules，请看文档说明！如果已经设置，请刷新页面。');
	}
	return new Promise((resolve, reject) => {
		// nextTick是必须的，否则model的变更，可能会延后于validate方法
		nextTick(() => {
			// 获取所有form-item的prop，交给validateField方法进行校验
			const formItemProps = children.value.map((item) => item.prop);
			validateField(formItemProps, (errors) => {
				if (errors.length) {
					// 如果错误提示方式为toast，则进行提示
					props.errorType.includes('toast') && uni.$api.toast(errors[0].message);
					reject(errors);
				} else {
					resolve(true);
				}
			});
		});
	});
}
</script>

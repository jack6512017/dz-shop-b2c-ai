<template>
	<view
		class="dz-form-item"
		:class="{
			'dz-border-bottom': borderBottom,
			'dz-form-item__border-bottom--error': message && parentData.errorType.includes('border-bottom'),
		}"
		:style="[api.addStyle(customStyle)]"
	>
		<view
			class="dz-form-item__body"
			@tap="clickHandler"
			:style="[
				{
					flexDirection: (labelPosition || parentData.labelPosition) === 'left' ? 'row' : 'column',
				},
			]"
		>
			<!-- 微信小程序中，将一个参数设置空字符串，结果会变成字符串"true" -->
			<slot name="label">
				<!-- {{required}} -->
				<view
					class="dz-form-item__body__left"
					v-if="required || leftIcon || label"
					:style="{
						width: api.addUnit(labelWidth || parentData.labelWidth),
						marginBottom: parentData.labelPosition === 'left' ? 0 : '5px',
					}"
				>
					<!-- 为了块对齐 -->
					<view class="dz-form-item__body__left__content">
						<!-- nvue不支持伪元素before -->
						<text v-if="required" class="dz-form-item__body__left__content__required">*</text>
						<view class="dz-form-item__body__left__content__icon" v-if="leftIcon">
							<dz-icon :name="leftIcon" :custom-style="leftIconStyle"></dz-icon>
						</view>
						<text
							class="dz-form-item__body__left__content__label"
							:style="[
								parentData.labelStyle,
								{
									justifyContent:
										parentData.labelAlign === 'left' ? 'flex-start' : parentData.labelAlign === 'center' ? 'center' : 'flex-end',
								},
							]"
						>
							{{ label }}
						</text>
					</view>
				</view>
			</slot>
			<view class="dz-form-item__body__right">
				<view class="dz-form-item__body__right__content">
					<view class="dz-form-item__body__right__content__slot"><slot /></view>
					<view class="item__body__right__content__icon" v-if="$slots.right"><slot name="right" /></view>
				</view>
			</view>
		</view>
		<slot name="error">
			<text
				v-if="!!message && parentData.errorType.includes('message')"
				class="dz-form-item__body__right__message"
				:style="{
					marginLeft: api.addUnit(parentData.labelPosition === 'top' ? 0 : labelWidth || parentData.labelWidth),
				}"
			>
				{{ message }}
			</text>
		</slot>
		<!-- <dz-line
			v-if="borderBottom"
			:color="message && parentData.errorType === 'border-bottom' ? 'red' : '#d6d7d9'"
			:customStyle="`margin-top: ${message && parentData.errorType === 'message' ? '5px' : 0}`"
		></dz-line> -->
	</view>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, onMounted, getCurrentInstance, toRefs } from 'vue';

/**
 * Form 表单
 * @description 此组件一般用于表单场景，可以配置Input输入框，Select弹出框，进行表单验证等。
 * @tutorial https://www.uviewui.com/components/form.html
 * @property {String}			label			input的label提示语
 * @property {String}			prop			绑定的值
 * @property {String | Boolean}	borderBottom	是否显示表单域的下划线边框
 * @property {String | Number}	labelWidth		label的宽度，单位px
 * @property {String}			rightIcon		右侧图标
 * @property {String}			leftIcon		左侧图标
 * @property {String | Object} leftIconStyle 左侧图标的样式
 * @property {Boolean}			required		是否显示左边的必填星号，只作显示用，具体校验必填的逻辑，请在rules中配置 (默认 false )
 *
 * @example <dz-form-item label="姓名" prop="userInfo.name" borderBottom ref="item1"></dz-form-item>
 */

const props = {
	// input的label提示语
	label: {
		type: String,
		default: '',
	},
	// 绑定的值
	prop: {
		type: String,
		default: '',
	},
	// 是否显示表单域的下划线边框
	borderBottom: {
		type: [String, Boolean],
		default: '',
	},
	// label的位置，left-左边，top-上边
	labelPosition: {
		type: String,
		default: '',
	},
	// label的宽度，单位px
	labelWidth: {
		type: [String, Number],
		default: '',
	},
	// 右侧图标
	rightIcon: {
		type: String,
		default: '',
	},
	// 左侧图标
	leftIcon: {
		type: String,
		default: '',
	},
	// 是否显示左边的必填星号，只作显示用，具体校验必填的逻辑，请在rules中配置
	required: {
		type: Boolean,
		default: false,
	},
	leftIconStyle: {
		type: [String, Object],
		default: '',
	},
	customStyle: {
		type: [Object, String],
		default: () => ({}),
	},
	customClass: {
		type: String,
		default: '',
	},
};

export default defineComponent({
	name: 'dz-form-item',
	props,
	emits: ['click'],
	// #ifdef MP-WEIXIN
	// 将自定义节点设置成虚拟的，更加接近Vue组件的表现，能更好的使用flex属性
	options: {
		virtualHost: true,
	},
	// #endif
	setup(props, { emit }) {
		const { proxy } = getCurrentInstance();
		const data = reactive({
			// 错误提示语
			message: '',
			parentData: {
				// 提示文本的位置
				labelPosition: 'left',
				// 提示文本对齐方式
				labelAlign: 'left',
				// 提示文本的样式
				labelStyle: {},
				// 提示文本的宽度
				labelWidth: 90,
				// 错误提示方式
				errorType: ['message'],
			},
		});

		// 组件创建完成时，将当前实例保存到dz-form中
		// computed: {
		// 	propsLine() {
		// 		return uni.$u.props.line
		// 	}
		// },

		onMounted(() => {
			init();
		});

		function init() {
			// 父组件的实例
			updateParentData();
			// if (!this.parent) {
			// 	uni.$u.error('dz-form-item需要结合dz-form组件使用')
			// }
		}
		// 获取父组件的参数
		function updateParentData() {
			// 此方法写在mixin中
			getParentData('dz-form');
		}
		// 移除dz-form-item的校验结果
		function clearValidate() {
			data.message = null;
		}

		// 清空当前的组件的校验结果，并重置为初始值
		function resetField() {
			// 找到原始值
			const value = uni.$api.getProperty(proxy?.parent.originalModel, props.prop);
			// 将dz-form的model的prop属性链还原原始值
			uni.$api.setProperty(proxy?.parent.model, props.prop, value);
			// 移除校验结果
			data.message = null;
		}

		// 点击组件
		function clickHandler() {
			emit('click');
		}

		function getParentData(parentName = '') {
			// 避免在created中去定义parent变量
			let parent = {};
			if (!parent) parent = {};
			// 这里的本质原理是，通过获取父组件实例(也即类似dz-radio的父组件dz-radio-group的this)
			// 将父组件this中对应的参数，赋值给本组件(dz-radio的this)的parentData对象中对应的属性
			// 之所以需要这么做，是因为所有端中，头条小程序不支持通过this.parent.xxx去监听父组件参数的变化
			// 此处并不会自动更新子组件的数据，而是依赖父组件dz-radio-group去监听data的变化，手动调用更新子组件的方法去重新获取
			parent = uni.$api.$parent.call(proxy, proxy, parentName);
			if (parent.children) {
				// 如果父组件的children不存在本组件的实例，才将本实例添加到父组件的children中
				parent.children.indexOf(proxy) === -1 && parent.children.push(proxy);
			}
			if (parent && data.parentData) {
				// 历遍parentData中的属性，将parent中的同名属性赋值给parentData
				Object.keys(data.parentData).map((key) => {
					data.parentData[key] = parent[key];
				});
			}
		}

		return {
			...toRefs(data),
			clickHandler,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components';

.dz-form-item {
	@include flex(column);
	font-size: 14px;
	color: $dz-main-color;

	&__body {
		@include flex;
		padding: 12px 0;

		&__left {
			@include flex;
			align-items: center;

			&__content {
				position: relative;
				@include flex;
				align-items: center;
				padding-right: 10rpx;
				flex: 1;

				&__icon {
					margin-right: 8rpx;
				}

				&__required {
					position: absolute;
					left: -9px;
					color: $dz-type-error;
					line-height: 20px;
					font-size: 20px;
					top: 3px;
				}

				&__label {
					@include flex;
					align-items: center;
					flex: 1;
					color: $dz-main-color;
					font-size: 15px;
				}
			}
		}

		&__right {
			flex: 1;

			&__content {
				@include flex;
				align-items: center;
				flex: 1;

				&__slot {
					flex: 1;
					/* #ifndef MP */
					@include flex;
					align-items: center;
					/* #endif */
				}

				&__icon {
					margin-left: 10rpx;
					color: $dz-light-color;
					font-size: 30rpx;
				}
			}

			&__message {
				padding-bottom: 10rpx;
				font-size: 12px;
				line-height: 12px;
				color: $dz-type-error;
			}
		}
	}
}
</style>

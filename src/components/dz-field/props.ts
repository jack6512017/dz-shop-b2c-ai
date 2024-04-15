export default {
	icon: String,
	rightIcon: String,
	// arrowDirection: {
	// 	type: String,
	// 	default: 'right'
	// },
	required: Boolean,
	label: String,
	password: Boolean,
	clearable: {
		type: Boolean,
		default: true
	},
	// 左边标题的宽度单位rpx
	labelWidth: {
		type: [Number, String],
		default: 130
	},
	// 对齐方式，left|center|right
	labelAlign: {
		type: String,
		default: 'left'
	},
	inputAlign: {
		type: String,
		default: 'left'
	},
	iconColor: {
		type: String,
		default: '#606266'
	},
	autoHeight: {
		type: Boolean,
		default: true
	},
	errorMessage: {
		type: [String, Boolean],
		default: ''
	},
	placeholder: String,
	placeholderStyle: String,
	focus: Boolean,
	fixed: Boolean,
	modelValue: [Number, String],
	type: {
		type: String,
		default: 'text'
	},
	disabled: {
		type: Boolean,
		default: false
	},
	maxlength: {
		type: [Number, String],
		default: 140
	},
	confirmType: {
		type: String,
		default: 'done'
	},
	// lable的位置，可选为 left-左边，top-上边
	labelPosition: {
		type: String,
		default: 'left'
	},
	// 输入框的自定义样式
	fieldStyle: {
		type: Object,
		default() {
			return {}
		}
	},
	// 清除按钮的大小
	clearSize: {
		type: [Number, String],
		default: 30
	},
	// lable左边的图标样式，对象形式
	iconStyle: {
		type: Object,
		default() {
			return {}
		}
	},
	// 是否显示上边框
	borderTop: {
		type: Boolean,
		default: false
	},
	// 是否显示下边框
	borderBottom: {
		type: Boolean,
		default: true
	},
	// 是否自动去除两端的空格
	trim: {
		type: Boolean,
		default: true
	}
}
export default {
	// 最大输入长度
	maxlength: {
		type: [Number, String],
		default: 4,
	},
	// 是否用圆点填充
	dotFill: {
		type: Boolean,
		default: false,
	},
	// 显示模式，box-盒子模式，bottomLine-横线在底部模式，middleLine-横线在中部模式
	mode: {
		type: String,
		default: 'box',
	},
	// 预置值
	value: {
		type: [String, Number],
		default: '',
	},
	// 当前激活输入item，是否带有呼吸效果
	breathe: {
		type: Boolean,
		default: true,
	},
	// 是否自动获取焦点
	focus: {
		type: Boolean,
		default: false,
	},
	// 字体是否加粗
	bold: {
		type: Boolean,
		default: false,
	},
	// 字体大小
	fontSize: {
		type: [String, Number],
		default: 60,
	},
	// 激活样式
	activeColor: {
		type: String,
		default: '#2979ff',
	},
	// 未激活的样式
	inactiveColor: {
		type: String,
		default: '#606266',
	},
	// 输入框的大小，单位rpx，宽等于高
	width: {
		type: [Number, String],
		default: '80',
	},
	// 是否隐藏原生键盘，如果想用自定义键盘的话，需设置此参数为true
	disabledKeyboard: {
		type: Boolean,
		default: false,
	},
};

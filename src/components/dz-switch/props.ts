export default {
        // 是否为加载中状态
        loading: {
            type: Boolean,
            default: false
        },
        // 是否为禁用装填
        disabled: {
            type: Boolean,
            default: false
        },
        // 开关尺寸，单位rpx
        size: {
            type: [String, Number],
            default: 50
        },
        // 打开时的背景颜色
        activeColor: {
            type: String,
            default: '#2979ff',
        },
        // 关闭时的背景颜色
        inactiveColor: {
            type: String,
            default:  '#f2f2f2',
        },
        // 通过v-model双向绑定的值
        modelValue: {
            type: [Boolean, String, Number],
            default: false
        },
        // switch打开时的值
        activeValue: {
            type: [String, Number, Boolean],
            default: true
        },
        // switch关闭时的值
        inactiveValue: {
            type: [String, Number, Boolean],
            default: false
        },
        // 是否开启异步变更，开启后需要手动控制输入值
        asyncChange: {
            type: Boolean,
            default: false
        },
        // 圆点与外边框的距离
        space: {
            type: [String, Number],
            default: 15
        },
		customStyle: {
			type: [String, Object],
			default: ()=>({})
		}
}

import helper from '@/utils/helper';
//组件专用方法

// 添加单位，如果有rpx，%，px等单位结尾或者值为auto，直接返回，否则加上rpx单位结尾
function addUnit(value: number | string = 'auto', unit: string = 'rpx'): string {
	value = String(value);
	// 用内置验证规则中的isNumber判断是否为数值
	return helper.isNumber(value) ? `${value}${unit}` : value;
}

/**
 * @description 样式转换
 * 对象转字符串，或者字符串转对象
 * @param {object | string} customStyle 需要转换的目标
 * @param {String} target 转换的目的，object-转为对象，string-转为字符串
 * @returns {object|string}
 */
function addStyle(customStyle: object | string, target: string = 'object'): object | string {
	// 字符串转字符串，对象转对象情形，直接返回
	if (helper.isEmpty(customStyle) || (typeof customStyle === 'object' && target === 'object') || (target === 'string' && typeof customStyle === 'string')) {
		return customStyle;
	}
	// 字符串转对象
	if (target === 'object') {
		// 去除字符串样式中的两端空格(中间的空格不能去掉，比如padding: 20px 0如果去掉了就错了)，空格是无用的
		customStyle = helper.trim(customStyle);
		// 根据";"将字符串转为数组形式
		const styleArray = customStyle.split(';');
		const style = {};
		// 历遍数组，拼接成对象
		for (let i = 0; i < styleArray.length; i++) {
			// 'font-size:20px;color:red;'，如此最后字符串有";"的话，会导致styleArray最后一个元素为空字符串，这里需要过滤
			if (styleArray[i]) {
				const item = styleArray[i].split(':');
				style[helper.trim(item[0])] = helper.trim(item[1]);
			}
		}
		return style;
	}
	// 这里为对象转字符串形式
	let string = '';
	for (const i in customStyle) {
		// 驼峰转为中划线的形式，否则css内联样式，无法识别驼峰样式属性名
		const key = i.replace(/([A-Z])/g, '-$1').toLowerCase();
		string += `${key}:${customStyle[i]};`;
	}
	// 去除两端空格
	return helper.trim(string);
}

/**
 * @description 用于获取用户传递值的px值  如果用户传递了"xxpx"或者"xxrpx"，取出其数值部分，如果是"xxxrpx"还需要用过uni.upx2px进行转换
 * @param {number|string} value 用户传递值的px值
 * @param {boolean} unit
 * @returns {number|string}
 */
function getPx(value: number | string, unit = false): number | string {
	if (helper.isNumber(value)) {
		return unit ? `${value}px` : Number(value);
	}
	// 如果带有rpx，先取出其数值部分，再转为px值
	if (/(rpx|upx)$/.test(value)) {
		return unit ? `${uni.upx2px(parseInt(value))}px` : Number(uni.upx2px(parseInt(value)));
	}
	return unit ? `${parseInt(value)}px` : parseInt(value);
}

function getRect(selector, all, proxy) {
	return new Promise((resolve) => {
		uni.createSelectorQuery()
			.in(proxy)
			[all ? 'selectAll' : 'select'](selector)
			.boundingClientRect((rect) => {
				if (all && Array.isArray(rect) && rect.length) {
					resolve(rect);
				}
				if (!all && rect) {
					resolve(rect);
				}
			})
			.exec();
	});
}

/**
* @description 获取父组件的参数，
    $parent在非H5中，可以准确获取到父组件，但是在H5中，需要多次$parent.$parent.xxx
      这里默认值等于undefined有它的含义，因为最顶层元素(组件)的$parent就是undefined，意味着不传name
      值(默认为undefined)，就是查找最顶层的$parent
*  @param {string|undefined} name 父组件的参数名
*/
function $parent(proxy, name = undefined) {
	let parent = proxy?.$parent;
	// 通过while历遍，这里主要是为了H5需要多层解析的问题
	while (parent) {
		// 父组件
		if (parent.$options && parent.$options.name !== name) {
			// 如果组件的name不相等，继续上一级寻找
			parent = parent.$parent;
		} else {
			return parent;
		}
	}
	return false;
}

/**
 * @description 获取某个对象下的属性，用于通过类似'a.b.c'的形式去获取一个对象的的属性的形式
 * @param {object} obj 对象
 * @param {string} key 需要获取的属性字段
 * @returns {*}
 */
function getProperty(obj, key) {
	if (!obj) {
		return;
	}
	if (typeof key !== 'string' || key === '') {
		return '';
	}
	if (key.indexOf('.') !== -1) {
		const keys = key.split('.');
		let firstObj = obj[keys[0]] || {};

		for (let i = 1; i < keys.length; i++) {
			if (firstObj) {
				firstObj = firstObj[keys[i]];
			}
		}
		return firstObj;
	}
	return obj[key];
}

/**
 * @description 设置对象的属性值，如果'a.b.c'的形式进行设置
 * @param {object} obj 对象
 * @param {string} key 需要设置的属性
 * @param {string} value 设置的值
 */
function setProperty(obj, key, value) {
	if (!obj) {
		return;
	}
	// 递归赋值
	const inFn = function (_obj, keys, v) {
		// 最后一个属性key
		if (keys.length === 1) {
			_obj[keys[0]] = v;
			return;
		}
		// 0~length-1个key
		while (keys.length > 1) {
			const k = keys[0];
			if (!_obj[k] || typeof _obj[k] !== 'object') {
				_obj[k] = {};
			}
			const key = keys.shift();
			// 自调用判断是否存在属性，不存在则自动创建对象
			inFn(_obj[k], keys, v);
		}
	};

	if (typeof key !== 'string' || key === '') {
	} else if (key.indexOf('.') !== -1) {
		// 支持多层级赋值操作
		const keys = key.split('.');
		inFn(obj, keys, value);
	} else {
		obj[key] = value;
	}
}

/**
 * 生成bem规则类名
 * 由于微信小程序，H5，nvue之间绑定class的差异，无法通过:class="[bem()]"的形式进行同用
 * 故采用如下折中做法，最后返回的是数组（一般平台）或字符串（支付宝和字节跳动平台），类似['a', 'b', 'c']或'a b c'的形式
 * @param {String} name 组件名称
 * @param {Array} fixed 一直会存在的类名
 * @param {Array} change 会根据变量值为true或者false而出现或者隐藏的类名
 * @returns {Array|string}
 */
function bem(proxy, name, fixed, change) {
	// 类名前缀
	const prefix = `dz-${name}--`;
	const classes = {};
	if (fixed) {
		fixed.map((item) => {
			// 这里的类名，会一直存在
			classes[prefix + proxy[item]] = true;
		});
	}
	if (change) {
		change.map((item) => {
			// 这里的类名，会根据proxy[item]的值为true或者false，而进行添加或者移除某一个类
			proxy[item] ? (classes[prefix + item] = proxy[item]) : delete classes[prefix + item];
		});
	}
	// #ifndef MP-ALIPAY || MP-TOUTIAO || MP-LARK
	return Object.keys(classes);
	// #endif

	// 支付宝，头条小程序无法动态绑定一个数组类名，否则解析出来的结果会带有","，而导致失效
	// #ifdef MP-ALIPAY || MP-TOUTIAO || MP-LARK
	return Object.keys(classes).join(' ');
	// #endif
}

// 阻止事件冒泡
function preventEvent(e) {
	e && typeof e.stopPropagation === 'function' && e.stopPropagation();
}

export default {
	type: ['primary', 'success', 'info', 'error', 'warning'],
	addUnit,
	addStyle,
	getPx,
	getRect,
	$parent,
	getProperty,
	setProperty,
	bem,
	preventEvent,
};

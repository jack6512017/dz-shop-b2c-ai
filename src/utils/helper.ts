import { isArray } from './is';
import dataConfig from '@/core/config/dataConfig';

/**
 * 提示
 */
function toast(title: string, duration = 3000, mask = false, icon = 'none') {
	if (Boolean(title) === false) {
		return;
	}
	uni.showToast({
		title: title.toString(),
		duration: duration,
		mask: mask,
		icon: icon,
	});
}

/**
 * 开发环境全局打印日志
 * @param {Object} title
 */
function log(title: object) {
	if (process.env.NODE_ENV === 'development' && Boolean(title) === true) {
		console.log(JSON.stringify(title));
	}
}

/**
 * 日期格式化
 */
function timeFormat(dateTime = null, fmt = 'yyyy-mm-dd hh:MM:ss') {
	// 如果为null,则格式化当前时间
	if (!dateTime) dateTime = Number(new Date());
	// 如果dateTime长度为10或者13，则为秒和毫秒的时间戳，如果超过13位，则为其他的时间格式
	if (dateTime.toString().length == 10) dateTime *= 1000;
	const date = new Date(Number(dateTime));
	let ret;
	const opt = {
		'y+': date.getFullYear().toString(), // 年
		'm+': (date.getMonth() + 1).toString(), // 月
		'd+': date.getDate().toString(), // 日
		'h+': date.getHours().toString(), // 时
		'M+': date.getMinutes().toString(), // 分
		's+': date.getSeconds().toString(), // 秒
		// 有其他格式化字符需求可以继续添加，必须转化成字符串
	};
	for (const k in opt) {
		ret = new RegExp('(' + k + ')').exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
		}
	}
	return fmt;
}

/**
 * 过去日期转换
 */
function timeFrom(dateTime = null, format = 'yyyy-mm-dd') {
	// 如果为null,则格式化当前时间
	if (!dateTime) dateTime = Number(new Date());
	// 如果dateTime长度为10或者13，则为秒和毫秒的时间戳，如果超过13位，则为其他的时间格式
	if (dateTime.toString().length == 10) dateTime *= 1000;
	const timestamp = +new Date(Number(dateTime));

	const timer = (Number(new Date()) - timestamp) / 1000;
	// 如果小于5分钟,则返回"刚刚",其他以此类推
	let tips = '';
	switch (true) {
		case timer < 300:
			tips = '刚刚';
			break;
		case timer >= 300 && timer < 3600:
			tips = parseInt(timer / 60) + '分钟前';
			break;
		case timer >= 3600 && timer < 86400:
			tips = parseInt(timer / 3600) + '小时前';
			break;
		case timer >= 86400 && timer < 2592000:
			tips = parseInt(timer / 86400) + '天前';
			break;
		default:
			// 如果format为false，则无论什么时间戳，都显示xx之前
			if (format === false) {
				if (timer >= 2592000 && timer < 365 * 86400) {
					tips = parseInt(timer / (86400 * 30)) + '个月前';
				} else {
					tips = parseInt(timer / (86400 * 365)) + '年前';
				}
			} else {
				tips = timeFormat(timestamp, format);
			}
	}
	return tips;
}

/**
 * @description 对象转url参数
 * @param {object} data,对象
 * @param {Boolean} isPrefix,是否自动加上"?"
 * @param {string} arrayFormat 规则 indices|brackets|repeat|comma
 */
function queryParams(data: any = {}, isPrefix: Boolean = true, arrayFormat: String = 'brackets') {
	const prefix = isPrefix ? '?' : '';
	const _result = [];
	if (['indices', 'brackets', 'repeat', 'comma'].indexOf(arrayFormat) == -1) arrayFormat = 'brackets';
	for (const key in data) {
		const value = data[key];
		// 去掉为空的参数
		if (['', undefined, null].indexOf(value) >= 0) {
			continue;
		}
		// 如果值为数组，另行处理
		if (value.constructor === Array) {
			// e.g. {ids: [1, 2, 3]}
			switch (arrayFormat) {
				case 'indices':
					// 结果: ids[0]=1&ids[1]=2&ids[2]=3
					for (let i = 0; i < value.length; i++) {
						_result.push(`${key}[${i}]=${value[i]}`);
					}
					break;
				case 'brackets':
					// 结果: ids[]=1&ids[]=2&ids[]=3
					value.forEach((_value) => {
						_result.push(`${key}[]=${_value}`);
					});
					break;
				case 'repeat':
					// 结果: ids=1&ids=2&ids=3
					value.forEach((_value) => {
						_result.push(`${key}=${_value}`);
					});
					break;
				case 'comma':
					// 结果: ids=1,2,3
					let commaStr = '';
					value.forEach((_value) => {
						commaStr += (commaStr ? ',' : '') + _value;
					});
					_result.push(`${key}=${commaStr}`);
					break;
				default:
					value.forEach((_value) => {
						_result.push(`${key}[]=${_value}`);
					});
			}
		} else {
			_result.push(`${key}=${value}`);
		}
	}
	return _result.length ? prefix + _result.join('&') : '';
}

/**
 * @description 深度克隆
 * @param {object} obj 需要深度克隆的对象
 * @returns {*} 克隆后的对象或者原值（不是对象）
 */
function deepClone(obj: object) {
	// 对常见的“非”值，直接返回原来值
	if ([null, undefined, NaN, false].includes(obj)) return obj;
	if (typeof obj !== 'object' && typeof obj !== 'function') {
		// 原始类型直接返回
		return obj;
	}
	const o = isArray(obj) ? [] : {};
	for (const i in obj) {
		if (obj.hasOwnProperty(i)) {
			o[i] = typeof obj[i] === 'object' ? deepClone(obj[i]) : obj[i];
		}
	}
	return o;
}

/**
 * @description JS对象深度合并
 * @param {object} target 需要拷贝的对象
 * @param {object} source 拷贝的来源对象
 * @returns {object|boolean} 深度合并后的对象或者false（入参有不是对象）
 */
function deepMerge(target: object = {}, source: object = {}) {
	target = deepClone(target);
	if (typeof target !== 'object' || typeof source !== 'object') return false;
	for (const prop in source) {
		if (!source.hasOwnProperty(prop)) continue;
		if (prop in target) {
			if (typeof target[prop] !== 'object') {
				target[prop] = source[prop];
			} else if (typeof source[prop] !== 'object') {
				target[prop] = source[prop];
			} else if (target[prop].concat && source[prop].concat) {
				target[prop] = target[prop].concat(source[prop]);
			} else {
				target[prop] = deepMerge(target[prop], source[prop]);
			}
		} else {
			target[prop] = source[prop];
		}
	}
	return target;
}

/**
 * @description 获取当前页面路径
 */
function page() {
	const pages = getCurrentPages();
	// 某些特殊情况下(比如页面进行redirectTo时的一些时机)，pages可能为空数组
	return `/${pages[pages.length - 1]?.route ?? ''}`;
}

/**
 * @description 获取当前路由栈实例数组
 */
function pages() {
	const pages = getCurrentPages();
	return pages;
}

/**
 * 加密字符串
 */
function strEncode(str: string): string {
	const key = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const l = key.length;
	const a = key.split('');
	let s = '',
		b,
		b1,
		b2,
		b3;
	for (let i = 0; i < str.length; i++) {
		b = str.charCodeAt(i);
		b1 = b % l;
		b = (b - b1) / l;
		b2 = b % l;
		b = (b - b2) / l;
		b3 = b % l;
		s += a[b3] + a[b2] + a[b1];
	}
	return s;
}

/**
 * 解密字符串
 */
function strDecode(str: string): string {
	const key = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const l = key.length;
	let b,
		b1,
		b2,
		b3,
		d = 0,
		s;
	s = new Array(Math.floor(str.length / 3));
	b = s.length;
	for (let i = 0; i < b; i++) {
		b1 = key.indexOf(str.charAt(d));
		d++;
		b2 = key.indexOf(str.charAt(d));
		d++;
		b3 = key.indexOf(str.charAt(d));
		d++;
		s[i] = b1 * l * l + b2 * l + b3;
	}

	let out = '';
	for (let i = 0; i < s.length; i++) {
		out += String.fromCharCode(s[i]);
	}
	return out;
}

/**
 * 手机验证
 */
function isMobile(value: string, area: any = '86') {
	if (!dataConfig.mobilePattern[area]) {
		return false;
	}
	return dataConfig.mobilePattern[area].pattern.test(value);
}

/**
 * 掩码
 * @param {String} str
 * @param {Number} startLength
 * @param {Number} endLength
 */
function maskCode(str: string, startLength: number, endLength: number): string {
	if (!str) {
		return '';
	}
	const len = str.length - startLength - endLength;
	if (len <= 0) {
		return str;
	}
	let mask = '';
	for (let i = 0; i < len; i++) {
		mask += '*';
	}
	return str.substring(0, startLength) + mask + str.substring(str.length - endLength);
}

/**
 * 字符串格式化
 * @param {Object} str
 * @param {Object} data
 */
function formatString(str: string, data?: any): string {
	if (!str || data == undefined) {
		return str;
	}
	if (typeof data === 'object') {
		for (const key in data) {
			if (data.hasOwnProperty(key)) {
				str = str.replace(new RegExp('{' + key + '}', 'g'), data[key]);
			}
		}
	} else {
		const args: IArguments = arguments;
		const reg = new RegExp('{([0-' + (args.length - 1) + '])}', 'g');
		return str.replace(reg, function (match, index) {
			return args[index - -1];
		});
	}
	return str;
}

/**
 * 是否是微信浏览器
 */
function h5IsWechat(): Boolean {
	// #ifdef H5
	const ua = window.navigator.userAgent.toLowerCase();
	if (ua.match(/micromessenger/i) == 'micromessenger') {
		return true;
	} else {
		return false;
	}
	// #endif
	return false;
}

/**
 * H5判断是否安卓或IOS
 */
function h5IsIosOrAndroid() {
	let isStr = '';
	// #ifdef H5
	let u = window.navigator.userAgent;
	let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; // android终端
	let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端

	if (isAndroid) {
		isStr = 'android';
	}
	if (isiOS) {
		isStr = 'ios';
	}
	// #endif
	return isStr;
}

//计算相差的天数
function timeDayDiff(timestampBefore, timestampAfter = null): number {
	if (timestampBefore.toString().length == 10) timestampBefore *= 1000;

	if (timestampAfter == null) timestampAfter = Number(new Date());
	timestampAfter = parseInt(timestampAfter);
	if (timestampAfter.toString().length == 10) timestampAfter *= 1000;

	let diff = timestampAfter - timestampBefore;
	diff = parseInt(diff / 1000);

	return parseInt(diff / 86400);
}

/**
 * 全局唯一标识符（uuid，Globally Unique Identifier）,也称作 uuid(Universally Unique IDentifier)
 * 一般用于多个组件之间,给它一个唯一的标识符,或者v-for循环的时候,如果使用数组的index可能会导致更新列表出现问题
 * 最可能的情况是左滑删除item或者对某条信息流"不喜欢"并去掉它的时候,会导致组件内的数据可能出现错乱
 * v-for的时候,推荐使用后端返回的id而不是循环的index
 * @param {Number} len uuid的长度
 * @param {Boolean} firstD 将返回的首字母置为"d"
 * @param {Nubmer} radix 生成uuid的基数(意味着返回的字符串都是这个基数),2-二进制,8-八进制,10-十进制,16-十六进制
 */
function guid(len = 32, firstD = true, radix: any = null): string {
	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	const uuid = [];
	radix = radix || chars.length;
	if (len) {
		// 如果指定uuid长度,只是取随机的字符,0|x为位运算,能去掉x的小数位,返回整数位
		for (let i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
	} else {
		let r;
		// rfc4122标准要求返回的uuid中,某些位为固定的字符
		uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
		uuid[14] = '4';
		for (let i = 0; i < 36; i++) {
			if (!uuid[i]) {
				r = 0 | (Math.random() * 16);
				uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
			}
		}
	}
	// 移除第一个字符,并用d替代,因为第一个字符为数值时,该guuid不能用作id或者class
	if (firstD) {
		uuid.shift();
		return 'd' + uuid.join('');
	} else {
		return uuid.join('');
	}
}

/**
 * 同步获取设备信息
 */
function getInfoAsync() {
	return new Promise((resolve, reject) => {
		plus.device.getInfo({
			success: function (e) {
				resolve(e);
			},
			fail: function (e) {
				reject(e.message);
			},
		});
	});
}

/**
 * 同步获取wgt版本信息
 */
function getWgtInfoAsync() {
	return new Promise((resolve, reject) => {
		try {
			plus.runtime.getProperty(plus.runtime.appid, function (wgtinfo) {
				resolve(wgtinfo);
			});
		} catch (e) {
			reject(e.message);
		}
	});
}

/**
 * 比较版本号
 * true 新版本大于旧版本
 */
function compareVersion(newV: string, oldV: string): boolean {
	try {
		if (!newV || !oldV) {
			return false;
		}
		let arrNew = newV.split('.');
		let arrOld = oldV.split('.');
		let newNum = parseInt(arrNew[0]) * 10000 + parseInt(arrNew[1]) * 100 + parseInt(arrNew[2]);
		let oldNum = parseInt(arrOld[0]) * 10000 + parseInt(arrOld[1]) * 100 + parseInt(arrOld[2]);
		if (newNum > oldNum) {
			return true;
		}
		return false;
	} catch (e) {
		return false;
	}
}

/*
 * obj 转 params字符串参数
 * 例子：{a:1,b:2} => a=1&b=2
 */
function objParseParam(obj: any): string {
	let paramsStr = '';
	if (obj instanceof Array) return paramsStr;
	if (!(obj instanceof Object)) return paramsStr;
	for (let key in obj) {
		if (obj[key]) {
			paramsStr += `${key}=${obj[key]}&`;
		}
	}
	return paramsStr.substring(0, paramsStr.length - 1);
}

/*
 * obj 转 路由地址带参数
 * 例子：{a:1,b:2} => /pages/index/index?a=1&b=2
 */
function objParseUrlAndParam(path: string, obj: any): string {
	let url = path || '/';
	let paramsStr = '';
	if (obj instanceof Array) return url;
	if (!(obj instanceof Object)) return url;
	paramsStr = objParseParam(obj);
	paramsStr && (url += '?');
	url += paramsStr;
	return url;
}

/**
 * 去除url中指定的参数
 * @param {Object} url
 * @param {Object} parameter
 */
function delUrlParams(url: string, parameter: any) {
	let str = '';

	if (url.indexOf('?') != -1) {
		str = url.substr(url.indexOf('?') + 1);
	} else {
		return url;
	}

	let arr = '';
	let returnurl = '';
	let setparam = '';
	if (str.indexOf('&') != -1) {
		arr = str.split('&');
		for (let i in arr) {
			if (arr[i].split('=')[0] != parameter) {
				returnurl = returnurl + arr[i].split('=')[0] + '=' + arr[i].split('=')[1] + '&';
			}
		}
		return url.substr(0, url.indexOf('?')) + '?' + returnurl.substr(0, returnurl.length - 1);
	} else {
		arr = str.split('=');
		if (arr[0] == parameter) {
			return url.substr(0, url.indexOf('?'));
		} else {
			return url;
		}
	}
}

/**
 * 去除url中的全部参数
 * @param {String} url
 */
function delAllUrlParams(url: string): string {
	let urlparts = url.split('?');
	if (urlparts.length >= 2) {
		return urlparts[0];
	}
	return url;
}

/**
 * 金额,只允许2位小数
 */
function isAmount(value: string): string {
	//金额，只允许保留两位小数
	return /^[1-9]\d*(,\d{3})*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(value);
}

/**
 * 无能的微信小程序不能在模板中直接使用parseFloat
 * @param {String} d
 */
function toFloat(d: string): number {
	return parseFloat(d);
}

/**
 * 解决有些时候会四舍五入
 */
function toFixed(number, n) {
	if (typeof (number * 1) != 'number' || isNaN(number * 1)) return number;
	let a, b;
	a = number.toString().split('.');

	if (a.length == 1) return a[0] * 1;
	b = a[0] + '.' + a[1].substr(0, n);

	return b;
}

/**
 * 验证十进制数字
 */
function isNumber(value) {
	return /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
}

/**
 * 是否对象
 */
function isObject(value: any): boolean {
	return Object.prototype.toString.call(value) === '[object Object]';
}

/*
 * 获取url字符串参数
 */
function getRequestParameters(locationhref: string): object {
	let href = locationhref || '';
	let theRequest = new Object();
	let str = href.split('?')[1];
	if (str != undefined) {
		let strs = str.split('&');
		for (let i = 0; i < strs.length; i++) {
			theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1];
		}
	}
	return theRequest;
}

/**
 * 验证URL格式
 */
function isUrl(value) {
	return /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/.test(value);
}

/**
 * 判断是否为空
 */
function isEmpty(value: any): boolean {
	switch (typeof value) {
		case 'undefined':
			return true;
		case 'string':
			if (value.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
			break;
		case 'boolean':
			if (!value) return true;
			break;
		case 'number':
			if (value === 0 || isNaN(value)) return true;
			break;
		case 'object':
			if (value === null || value.length === 0) return true;
			for (const i in value) {
				return false;
			}
			return true;
	}
	return false;
}

/**
 * @description 去除空格
 * @param String str 需要去除空格的字符串
 * @param String pos both(左右)|left|right|all 默认both
 */
function trim(str: object | string, pos: string = 'both'): string {
	str = String(str);
	if (pos == 'both') {
		return str.replace(/^\s+|\s+$/g, '');
	}
	if (pos == 'left') {
		return str.replace(/^\s*/, '');
	}
	if (pos == 'right') {
		return str.replace(/(\s*$)/g, '');
	}
	if (pos == 'all') {
		return str.replace(/\s+/g, '');
	}
	return str;
}

/**
 * @description 进行延时，以达到可以简写代码的目的 比如: await uni.$u.sleep(20)将会阻塞20ms
 * @param {number} value 堵塞时间 单位ms 毫秒
 * @returns {Promise} 返回promise
 */
function sleep(value: number = 30): promise {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, value);
	});
}

/**
 * 复制文本
 */
function copy(content: string) {
	// #ifndef H5
	uni.setClipboardData({
		data: content,
	});
	// #endif
	// #ifdef H5
	var createInput = document.createElement('textarea');
	createInput.value = content;
	document.body.appendChild(createInput);
	createInput.select();
	document.execCommand('Copy');
	createInput.className = 'createInput';
	createInput.style.display = 'none';
	// #endif
}

/**
 * @description 如果value小于min，取min；如果value大于max，取max
 * @param {number} min
 * @param {number} max
 * @param {number} value
 */
function range(min: number = 0, max: number = 0, value: number = 0): number {
	return Math.max(min, Math.min(max, Number(value)));
}

/* 处理文件路径 */
function getLocalFilePath(path: string): string {
	if (path.indexOf('_www') === 0 || path.indexOf('_doc') === 0 || path.indexOf('_documents') === 0 || path.indexOf('_downloads') === 0) {
		return path;
	}
	if (path.indexOf('file://') === 0) {
		return path;
	}
	if (path.indexOf('/storage/emulated/0/') === 0) {
		return path;
	}
	if (path.indexOf('/') === 0) {
		var localFilePath = plus.io.convertAbsoluteFileSystem(path);
		if (localFilePath !== path) {
			return localFilePath;
		} else {
			path = path.substr(1);
		}
	}
	return '_www/' + path;
}

/* // 图片转base64ToPath */
function pathToBase64(path: string): string {
	return new Promise(function (resolve, reject) {
		if (typeof window === 'object' && 'document' in window) {
			if (typeof FileReader === 'function') {
				var xhr = new XMLHttpRequest();
				xhr.open('GET', path, true);
				xhr.responseType = 'blob';
				xhr.onload = function () {
					if (this.status === 200) {
						let fileReader = new FileReader();
						fileReader.onload = function (e) {
							resolve(e.target.result);
						};
						fileReader.onerror = reject;
						fileReader.readAsDataURL(this.response);
					}
				};
				xhr.onerror = reject;
				xhr.send();
				return;
			}
			var canvas = document.createElement('canvas');
			var c2x = canvas.getContext('2d');
			var img = new Image();
			img.onload = function () {
				canvas.width = img.width;
				canvas.height = img.height;
				c2x.drawImage(img, 0, 0);
				resolve(canvas.toDataURL());
				canvas.height = canvas.width = 0;
			};
			img.onerror = reject;
			img.src = path;
			return;
		}
		if (typeof plus === 'object') {
			plus.io.resolveLocalFileSystemURL(
				getLocalFilePath(path),
				function (entry) {
					entry.file(
						function (file) {
							var fileReader = new plus.io.FileReader();
							fileReader.onload = function (data) {
								resolve(data.target.result);
							};
							fileReader.onerror = function (error) {
								reject(error);
							};
							fileReader.readAsDataURL(file);
						},
						function (error) {
							reject(error);
						}
					);
				},
				function (error) {
					reject(error);
				}
			);
			return;
		}
		if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
			wx.getFileSystemManager().readFile({
				filePath: path,
				encoding: 'base64',
				success: function (res) {
					resolve('data:image/png;base64,' + res.data);
				},
				fail: function (error) {
					reject(error);
				},
			});
			return;
		}
		reject(new Error('not support'));
	});
}

/**
 * 获取数据最大值的下标
 */
function getMaxIndex(array = []): number {
	if (array.length === 0) {
		return -1;
	}
	let max = array[0];
	let index = 0;
	for (let i = 0; i < array.length; i++) {
		if (max < array[i]) {
			max = array[i];
			index = i;
		}
	}
	return index;
}

/**
 * 求两个颜色之间的渐变值
 * @param {string} startColor 开始的颜色
 * @param {string} endColor 结束的颜色
 * @param {number} step 颜色等分的份额
 * */
function colorGradient(startColor = 'rgb(0, 0, 0)', endColor = 'rgb(255, 255, 255)', step = 10) {
	let startRGB = hexToRgb(startColor, false); //转换为rgb数组模式
	let startR = startRGB[0];
	let startG = startRGB[1];
	let startB = startRGB[2];

	let endRGB = hexToRgb(endColor, false);
	let endR = endRGB[0];
	let endG = endRGB[1];
	let endB = endRGB[2];

	let sR = (endR - startR) / step; //总差值
	let sG = (endG - startG) / step;
	let sB = (endB - startB) / step;
	let colorArr = [];
	for (let i = 0; i < step; i++) {
		//计算每一步的hex值
		let hex = rgbToHex('rgb(' + Math.round(sR * i + startR) + ',' + Math.round(sG * i + startG) + ',' + Math.round(sB * i + startB) + ')');
		colorArr.push(hex);
	}
	return colorArr;
}

// 将hex表示方式转换为rgb表示方式(这里返回rgb数组模式)
function hexToRgb(sColor, str = true) {
	let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	sColor = sColor.toLowerCase();
	if (sColor && reg.test(sColor)) {
		if (sColor.length === 4) {
			let sColorNew = '#';
			for (let i = 1; i < 4; i += 1) {
				sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
			}
			sColor = sColorNew;
		}
		//处理六位的颜色值
		let sColorChange = [];
		for (let i = 1; i < 7; i += 2) {
			sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
		}
		if (!str) {
			return sColorChange;
		} else {
			return `rgb(${sColorChange[0]},${sColorChange[1]},${sColorChange[2]})`;
		}
	} else if (/^(rgb|RGB)/.test(sColor)) {
		let arr = sColor.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
		return arr.map((val) => Number(val));
	} else {
		return sColor;
	}
}

// 将rgb表示方式转换为hex表示方式
function rgbToHex(rgb: string): string {
	let _this = rgb;
	let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	if (/^(rgb|RGB)/.test(_this)) {
		let aColor = _this.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
		let strHex = '#';
		for (let i = 0; i < aColor.length; i++) {
			let hex = Number(aColor[i]).toString(16);
			hex = String(hex).length == 1 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
			if (hex === '0') {
				hex += hex;
			}
			strHex += hex;
		}
		if (strHex.length !== 7) {
			strHex = _this;
		}
		return strHex;
	} else if (reg.test(_this)) {
		let aNum = _this.replace(/#/, '').split('');
		if (aNum.length === 6) {
			return _this;
		} else if (aNum.length === 3) {
			let numHex = '#';
			for (let i = 0; i < aNum.length; i += 1) {
				numHex += aNum[i] + aNum[i];
			}
			return numHex;
		}
	} else {
		return _this;
	}
}

/**
 * JS颜色十六进制转换为rgb或rgba,返回的格式为 rgba（255，255，255，0.5）字符串
 * sHex为传入的十六进制的色值
 * alpha为rgba的透明度
 */
function colorToRgba(color: string, alpha: number = 0.3): string {
	color = rgbToHex(color);
	// 十六进制颜色值的正则表达式
	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	/* 16进制颜色转为RGB格式 */
	let sColor = color.toLowerCase();
	if (sColor && reg.test(sColor)) {
		if (sColor.length === 4) {
			var sColorNew = '#';
			for (let i = 1; i < 4; i += 1) {
				sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
			}
			sColor = sColorNew;
		}
		// 处理六位的颜色值
		var sColorChange = [];
		for (let i = 1; i < 7; i += 2) {
			sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
		}
		return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')';
	} else {
		return sColor;
	}
}

/**
 * 获取一个随机数
 * @param {Object} min
 * @param {Object} max
 */
function random(min: number, max: number): number {
	switch (arguments.length) {
		case 1:
			return parseInt(Math.random() * min + 1, 10);
			break;
		case 2:
			return parseInt(Math.random() * (max - min + 1) + min, 10);
			break;
		default:
			return 0;
			break;
	}
}

/**
 * 中文
 */
function chinese(value) {
	const reg = /^[\u4e00-\u9fa5]+$/gi;
	return reg.test(value);
}

/**
 * @description 运行期判断平台
 * @returns {string} 返回所在平台(小写)
 * @link 运行期判断平台 https://uniapp.dcloud.io/frame?id=判断平台
 */
function os() {
	return uni.getSystemInfoSync().osName.toLowerCase();
}

/**
 * @description error提示
 * @param {*} err 错误内容
 */
function error(err) {
	// 开发环境才提示，生产环境不会提示
	if (process.env.NODE_ENV === 'development') {
		console.error(err);
	}
}

function addSpaces(value: string | number) {
	return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ');
}

function getNewDate(many: number, flag: string = 'before'): string {
	const thirtyDays = [4, 6, 9, 11]; // 30天的月份
	const thirtyOneDays = [1, 3, 5, 7, 8, 10, 12]; // 31天的月份
	const currDate = new Date(); // 今天日期
	const year = currDate.getFullYear();
	let month = currDate.getMonth() + 1;
	let targetDateMilli = 0;
	let GMTDate = ''; // 中国标准时间
	let targetYear = ''; // 年
	let targetMonth = ''; // 月
	let targetDate = ''; // 日
	let dealTargetDays = ''; // 目标日期
	const isLeapYear = !!((year % 4 == 0 && year % 100 != 0) || year % 400 == 0); // 是否是闰年
	let countDays = 0; // 累计天数
	for (let i = 0; i < many; i++) {
		if (flag === 'before') {
			month = month - 1 <= 0 ? 12 : month - 1;
		} else {
			month = month + 1 > 12 ? 1 : month + 1;
		}
		thirtyDays.includes(month) ? (countDays += 30) : thirtyOneDays.includes(month) ? (countDays += 31) : isLeapYear ? (countDays += 29) : (countDays += 28);
	}
	targetDateMilli = currDate.setDate(currDate.getDate() - (flag === 'before' ? countDays : countDays * -1));
	GMTDate = new Date(targetDateMilli);
	targetYear = GMTDate.getFullYear();
	targetMonth = GMTDate.getMonth() + 1;
	targetDate = GMTDate.getDate();
	targetMonth = targetMonth.toString().padStart(2, '0');
	targetDate = targetDate.toString().padStart(2, '0');
	dealTargetDays = `${targetYear}-${targetMonth}-${targetDate}`;
	return dealTargetDays;
}

export default {
	toast,
	log,
	timeFormat,
	timeFrom,
	queryParams,
	deepClone,
	deepMerge,
	page,
	pages,
	strEncode,
	strDecode,
	isMobile,
	maskCode,
	formatString,
	h5IsWechat,
	h5IsIosOrAndroid,
	timeDayDiff,
	guid,
	getInfoAsync,
	getWgtInfoAsync,
	compareVersion,
	objParseParam,
	objParseUrlAndParam,
	delUrlParams,
	delAllUrlParams,
	isAmount,
	toFloat,
	toFixed,
	isNumber,
	isObject,
	getRequestParameters,
	isUrl,
	isEmpty,
	trim,
	sleep,
	copy,
	range,
	pathToBase64,
	getMaxIndex,
	hexToRgb,
	rgbToHex,
	colorToRgba,
	random,
	chinese,
	os,
	error,
	addSpaces,
	getNewDate,
};

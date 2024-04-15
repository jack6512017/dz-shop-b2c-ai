<template>
	<view class="da-tree" :style="{ '--theme-color': themeColor }">
		<scroll-view class="da-tree-scroll" :scroll-y="true" :scroll-x="false">
			<view
				class="da-tree-item"
				:class="{ 'is-show': item.show }"
				:style="{ paddingLeft: item.level * indent + 'rpx' }"
				v-for="item in datalist"
				:key="item.key"
			>
				<view v-if="item.showArrow && !filterValue" class="da-tree-item__icon" @click="handleExpandedChange(item)">
					<view :class="['da-tree-item__icon--arr', 'is-loading']" v-if="loadLoading && item.loading"></view>
					<view :class="['da-tree-item__icon--arr', 'is-expand', { 'is-right': !item.expand }]" v-else></view>
				</view>
				<view v-else class="da-tree-item__icon"></view>
				<view
					class="da-tree-item__checkbox"
					:class="[`da-tree-item__checkbox--${checkboxPlacement}`, { 'is--disabled': item.disabled }]"
					v-if="showCheckbox"
					@click="handleCheckChange(item)"
				>
					<view class="da-tree-item__checkbox--icon da-tree-checkbox-checked" v-if="item.checkedStatus === isCheckedStatus"></view>
					<view class="da-tree-item__checkbox--icon da-tree-checkbox-indeterminate" v-else-if="item.checkedStatus === halfCheckedStatus"></view>
					<view class="da-tree-item__checkbox--icon da-tree-checkbox-outline" v-else></view>
				</view>
				<view
					class="da-tree-item__checkbox"
					:class="[`da-tree-item__checkbox--${checkboxPlacement}`, { 'is--disabled': item.disabled }]"
					v-if="!showCheckbox && showRadioIcon"
					@click="handleRadioChange(item)"
				>
					<view class="da-tree-item__checkbox--icon da-tree-radio-checked" v-if="item.checkedStatus === isCheckedStatus"></view>
					<view class="da-tree-item__checkbox--icon da-tree-radio-indeterminate" v-else-if="item.checkedStatus === halfCheckedStatus"></view>
					<view class="da-tree-item__checkbox--icon da-tree-radio-outline" v-else></view>
				</view>
				<view class="da-tree-item__label" :class="'da-tree-item__label--' + item.checkedStatus" @click="handleLabelClick(item)"
					>{{ item.label }} <text class="da-tree-item__label--append" v-if="item.append">{{ item.append }}</text></view
				>
			</view>
		</scroll-view>
	</view>
</template>

<script>
import { defineComponent, ref, unref, watch } from 'vue';

import {
	unCheckedStatus,
	halfCheckedStatus,
	isCheckedStatus,
	deepClone,
	getAllNodeKeys,
	getAllNodes,
	logError,
	isArray,
	isString,
	isNumber,
	isFunction,
} from './utils';
import basicProps from './props';

export default defineComponent({
	name: 'DzTree',
	props: basicProps,
	emits: ['change', 'expand'],
	setup(props, { emit }) {
		/** 原始的树数据 */
		const dataRef = ref([]);
		/** 处理后的一维树项数据 */
		const datalist = ref([]);
		/** 处理后的以key为键值的树项数据 */
		const datamap = ref({});
		/** 默认的展开数据 */
		const expandedKeys = ref([]);
		/** 默认的已选数据 */
		const checkedKeys = ref(null);
		/** 加载状态 */
		const loadLoading = ref(false);
		let fieldMap = {
			value: 'value',
			label: 'label',
			children: 'children',
			disabled: 'disabled',
			append: 'append',
			leaf: 'leaf',
			sort: 'sort',
		};

		/**
		 * 初始化数据结构
		 */
		function initData() {
			fieldMap = {
				value: props.field?.key || props.field?.value || props.valueField || 'value',
				label: props.field?.label || props.labelField || 'label',
				children: props.field?.children || props.childrenField || 'children',
				disabled: props.field?.disabled || props.disabledField || 'disabled',
				append: props.field?.append || props.appendField || 'append',
				leaf: props.field?.leaf || props.leafField || 'leaf',
				sort: props.field?.sort || props.sortField || 'sort',
			};

			const data = deepClone(dataRef.value);
			datalist.value = [];
			datamap.value = {};

			// clean tree
			handleTreeData(data);
			// flat tree
			datalist.value = checkInitData(datalist.value);
			// console.log('init datalist', datalist.value)
			// console.log('init datamap', datamap.value)
		}

		/**
		 * 转换为节点数据
		 * @param data
		 * @param parent
		 * @param level
		 */
		function handleTreeData(data = [], parent = null, level = 0, insertIndex = -1) {
			return data.reduce((prev, cur, index) => {
				const key = cur[fieldMap.value];
				const children = cur[fieldMap.children] || null;
				const newItem = createNewItem(cur, index, parent, level);
				if (insertIndex > -1) {
					// 插入子项尾部
					const index = (parent.childrenKeys?.length || 0) + insertIndex + 1;
					if (!parent?.childrenKeys?.includes(key)) {
						datamap.value[key] = newItem;
						datalist.value.splice(index, 0, newItem);
						parent.children.push(newItem);
						if (newItem.parentKeys?.length) {
							newItem.parentKeys.forEach((k) => {
								datamap.value[k].childrenKeys = [...datamap.value[k].childrenKeys, newItem.key];
							});
						}
					}
				} else {
					datamap.value[key] = newItem;
					datalist.value.push(newItem);
				}

				const hasChildren = children && children.length > 0;
				if (hasChildren) {
					const childrenData = handleTreeData(children, newItem, level + 1);
					// childrenData.sort((a, b) => a.sort - b.sort)
					newItem.children = childrenData;
					const childrenKeys = childrenData.reduce((p, k) => {
						const keys = k.childrenKeys;
						p.push(...keys, k.key);
						return p;
					}, []);
					newItem.childrenKeys = childrenKeys;
				}
				prev.push(newItem);
				return prev;
			}, []);
		}

		/**
		 * 创建节点
		 * @param item
		 * @param index
		 * @param parent
		 * @param level
		 */
		function createNewItem(item, index, parent, level) {
			const key = item[fieldMap.value];
			const label = item[fieldMap.label];
			const sort = item[fieldMap.sort] || 0;
			const children = item[fieldMap.children] || null;
			const append = item[fieldMap.append] || null;
			let disabled = item[fieldMap.disabled] || false;
			// 优先继承父级禁用属性
			disabled = parent?.disabled || disabled;
			let isLeaf = isFunction(props.isLeafFn) ? props.isLeafFn(item) : item[fieldMap.leaf] || false;
			// const hasChildren = children && children.length > 0
			const isEmptyChildren = children && children.length === 0;
			let showArrow = true;
			// let isLeaf = !hasChildren
			let expand = props.defaultExpandAll || false;
			// 是否异步加载模式
			const isLoadMode = props.loadMode && isFunction(props.loadApi);

			if (!children) {
				expand = false;
				if (isLoadMode) {
					showArrow = true;
				} else {
					isLeaf = true;
					showArrow = false;
				}
			}

			if (isEmptyChildren) {
				expand = false;
				if (isLoadMode) {
					showArrow = true;
				} else {
					isLeaf = true;
					showArrow = false;
				}
			}

			if (isLeaf) {
				showArrow = false;
				expand = false;
			} else {
				showArrow = true;
			}

			// onlyRadioLeaf 单选只能选择末级节点
			if (!props.showCheckbox) {
				if (props.onlyRadioLeaf) {
					if (!isLeaf) {
						disabled = true;
					} else {
						// 仍旧继承父类原始禁用状态
						disabled = parent?.originItem?.disabled || false;
					}
				}
			}

			if (disabled) {
				if (isLeaf || !children || isEmptyChildren) {
					expand = false;
					showArrow = false;
				}
			}

			const parentKey = parent ? parent.key : null;
			const show = props.defaultExpandAll || level === 0;

			const newItem = {
				key,
				parentKey,
				label,
				append,
				isLeaf,
				showArrow,
				level,
				expand,
				show,
				sort,
				disabled,
				loaded: false,
				loading: false,
				indexs: [index],
				checkedStatus: unCheckedStatus,
				parentKeys: [],
				childrenKeys: [],
				children: [],
				originItem: item,
			};

			if (parent) {
				newItem.parentKeys = [parent.key, ...parent.parentKeys];
				newItem.indexs = [...parent.indexs, index];
			}

			return newItem;
		}

		/**
		 * 处理初始化内容
		 * @param list
		 */
		function checkInitData(list) {
			let checkedKeyList = null;
			let expandedKeyList = [];
			if (props.showCheckbox) {
				checkedKeyList = [...new Set(checkedKeys.value || [])];
				expandedKeyList = props.expandChecked ? [...(checkedKeys.value || []), ...(expandedKeys.value || [])] : expandedKeys.value;
			} else {
				checkedKeyList = checkedKeys.value || null;
				expandedKeyList = props.expandChecked && checkedKeys.value ? [checkedKeys.value, ...(expandedKeys.value || [])] : expandedKeys.value;
			}

			handleCheckState(list, checkedKeyList, true);

			// 处理初始展开
			expandedKeyList = [...new Set(expandedKeyList)];
			if (!props.defaultExpandAll) {
				handleExpandState(list, expandedKeyList, true);
			}

			// list.sort((a, b) => {
			// 	if (a.sort === 0 && b.sort === 0) {
			// 		return 0;
			// 	}

			// 	if (a.parentKey === b.parentKey) {
			// 		if (a.sort - b.sort > 0) {
			// 			return 1;
			// 		} else {
			// 			return -1;
			// 		}
			// 	}

			// 	return 0;
			// });

			return list;
		}

		/**
		 * 处理选中
		 * @param list
		 * @param checkedKeyList
		 */
		function handleCheckState(list, checkedKeyList, checked = true) {
			// 多选
			if (props.showCheckbox) {
				if (checkedKeyList?.length) {
					checkedKeyList.forEach((k) => {
						const item = datamap.value[k];
						if (item) {
							checkTheChecked(item, checked);
						}
					});
				}

				return;
			}

			// 单选
			for (let i = 0; i < list.length; i++) {
				const item = list[i];
				if (item.key === checkedKeyList) {
					checkTheRadio(item, checked);
					break;
				}
			}
		}

		/**
		 * 校验多选节点
		 * @param item
		 * @param checked
		 */
		function checkTheChecked(item, checked = true) {
			const { childrenKeys, parentKeys, disabled = false } = item;
			if (!props.checkedDisabled && disabled) return;

			// 当前
			item.checkedStatus = checked ? isCheckedStatus : unCheckedStatus;

			if (!props.checkStrictly) {
				// 子类
				childrenKeys.forEach((k) => {
					const childrenItem = unref(datamap)[k];
					childrenItem.checkedStatus = !props.checkedDisabled && childrenItem.disabled ? childrenItem.checkedStatus : item.checkedStatus;
				});

				// 父类
				parentKeys.forEach((k) => {
					const parentItem = datamap.value[k];
					parentItem.checkedStatus = getParentCheckedStatus(parentItem);
				});
			}
		}

		/**
		 * 校验单选节点
		 * @param item
		 */
		function checkTheRadio(item, checked) {
			const { parentKeys, isLeaf, disabled = false } = item;
			if (!props.checkedDisabled && disabled) return;

			// 限制末节点选中，但当前非末节点
			if (props.onlyRadioLeaf && !isLeaf) {
				logError(`限制了末节点选中，当前[${item.label}]非末节点`);
				return;
			}

			if (datalist.value?.length) {
				datalist.value.forEach((k) => {
					k.checkedStatus = unCheckedStatus;
				});
			}

			parentKeys.forEach((k) => {
				const parentItem = datamap.value[k];
				parentItem.checkedStatus = checked ? getParentCheckedStatus(parentItem) : unCheckedStatus;
			});

			// 当前
			item.checkedStatus = checked ? isCheckedStatus : unCheckedStatus;
		}

		/**
		 * 处理父节点展开
		 * @param item
		 * @param expand
		 */
		// function handleExpandParentNode(item, expand = true) {
		//   if (!expand) return

		//   if (item?.parentKeys?.length) {
		//     item.parentKeys.forEach(pk => {
		//       if (!datamap.value[pk].expand) {
		//         datamap.value[pk].expand = true
		//       }
		//     })
		//   }
		// }

		/**
		 * 处理节点展开
		 * @param list
		 * @param expandedKeyList
		 * @param expand
		 */
		function handleExpandState(list, expandedKeyList, expand = true) {
			// 收起
			if (expand === false) {
				for (let i = 0; i < list.length; i++) {
					const item = list[i];
					if (expandedKeyList?.includes(item.key)) {
						item.expand = false;
						if (item.childrenKeys?.length) {
							item.childrenKeys.forEach((ck) => {
								datamap.value[ck].expand = false;
								datamap.value[ck].show = false;
							});
						}
					}
				}
				return;
			}
			// 展开
			for (let i = 0; i < list.length; i++) {
				const item = list[i];
				// 处理展开
				if (expandedKeyList?.includes(item.key)) {
					// 父子
					item.expand = true;
					if (item.children?.length) {
						item.children.forEach((k) => {
							const kItem = unref(datamap)[k.key];
							kItem.show = true;
						});
					}

					// 族系
					if (item.parentKeys?.length) {
						item.parentKeys.forEach((k) => {
							const kItem = unref(datamap)[k];
							kItem.expand = true;
							if (kItem.children?.length) {
								kItem.children.forEach((k) => {
									const skItem = unref(datamap)[k.key];
									skItem.show = true;
								});
							}
						});
					}
				}
			}
		}

		/**
		 * 点击选框
		 * @param item
		 */
		function handleCheckChange(item) {
			const { childrenKeys, parentKeys, checkedStatus, isLeaf, disabled = false } = item;
			if (!props.showCheckbox) return;
			if (disabled) return;

			// 当前
			item.checkedStatus = checkedStatus === isCheckedStatus ? unCheckedStatus : isCheckedStatus;

			// 子类
			if (!props.checkStrictly) {
				if (props.expandChecked) {
					item.show = true;
					item.expand = childrenKeys?.length > 0 || isLeaf;
				}

				childrenKeys.forEach((k) => {
					const childrenItem = unref(datamap)[k];
					childrenItem.checkedStatus = childrenItem.disabled ? childrenItem.checkedStatus : item.checkedStatus;

					if (props.expandChecked) {
						childrenItem.show = true;
						childrenItem.expand = childrenItem?.childrenKeys?.length > 0 || childrenItem.isLeaf;
					}
				});
			} else {
				if (props.expandChecked) {
					logError(`多选时，当 checkStrictly 为 true 时，不支持选择自动展开子节点属性(expandChecked)`);
				}
			}

			// 父类
			if (!props.checkStrictly) {
				parentKeys.forEach((k) => {
					const parentItem = datamap.value[k];
					parentItem.checkedStatus = getParentCheckedStatus(parentItem);
				});
			}

			const hasCheckedKeys = [];
			for (let i = 0; i < datalist.value.length; i++) {
				const k = datalist.value[i];
				if (k.checkedStatus === isCheckedStatus) {
					if ((props.packDisabledkey && k.disabled) || !k.disabled) {
						hasCheckedKeys.push(k.key);
					}
				}
			}

			checkedKeys.value = [...hasCheckedKeys];

			emit('change', hasCheckedKeys, item);
		}

		/**
		 * 点击单选
		 * @param item
		 */
		function handleRadioChange(item) {
			const { parentKeys, checkedStatus, key, disabled = false, isLeaf } = item;
			if (props.showCheckbox) return;
			if (props.onlyRadioLeaf && !isLeaf) handleExpandedChange(item);

			if (disabled) return;

			// 重置所有选择
			if (datalist.value?.length) {
				for (let i = 0; i < datalist.value.length; i++) {
					const k = datalist.value[i];
					k.checkedStatus = unCheckedStatus;
				}
			}

			parentKeys.forEach((k) => {
				const parentItem = datamap.value[k];
				parentItem.checkedStatus = getParentCheckedStatus(parentItem);
			});

			// 当前
			item.checkedStatus = checkedStatus === isCheckedStatus ? unCheckedStatus : isCheckedStatus;

			checkedKeys.value = key;
			emit('change', key, item);
		}

		/**
		 * 点击标签
		 */
		function handleLabelClick(item) {
			if (props.showCheckbox) {
				handleCheckChange(item);
			} else {
				handleRadioChange(item);
			}
		}

		/**
		 * 点击展开收起
		 * @param item
		 */
		async function handleExpandedChange(item) {
			if (props.filterValue) return;

			const { expand, loading = false, disabled } = item;
			if (loadLoading.value && loading) return;

			checkExpandedChange(item);

			// 异步
			item.expand = !expand;

			let currentItem = null;
			if (!disabled) {
				if (!props.showCheckbox && props.onlyRadioLeaf && props.loadMode) {
					logError(`单选时，当 onlyRadioLeaf 为 true 时不支持动态数据`);
				} else {
					currentItem = await loadExpandNode(item);
				}
			}

			emit('expand', !expand, currentItem || item || null);
		}

		/**
		 * 检查展开状态
		 * @param item
		 */
		function checkExpandedChange(item) {
			const { expand, childrenKeys, children = null } = item;

			if (expand) {
				if (childrenKeys?.length) {
					childrenKeys.forEach((k) => {
						if (unref(datamap)[k]) {
							unref(datamap)[k].show = false;
							unref(datamap)[k].expand = false;
						}
					});
				}
			} else {
				if (children?.length) {
					const childrenKeys = children.map((k) => k.key);
					childrenKeys.forEach((k) => {
						if (unref(datamap)[k]) {
							unref(datamap)[k].show = true;
						}
					});
				}
			}
		}

		/**
		 * 加载异步数据
		 * @param item
		 */
		async function loadExpandNode(item) {
			const { expand, key, loaded, children } = item;
			if (children?.length && !props.alwaysFirstLoad) {
				return item;
			}

			if (expand && props.loadMode && !loaded) {
				if (isFunction(props.loadApi)) {
					expandedKeys.value.push(key);
					loadLoading.value = true;
					item.loading = true;

					const currentNode = deepClone(item);
					const apiRes = await props.loadApi(currentNode);

					// 新增子项
					let newChildren = [...(item.originItem?.children || []), ...(apiRes || [])];
					const newChildrenObj = {};
					newChildren = newChildren.reduce((total, next) => {
						newChildrenObj[next[fieldMap.value]] ? '' : (newChildrenObj[next[fieldMap.value]] = true && total.push(next));
						return total;
					}, []);

					item.originItem.children = newChildren || null;
					if (apiRes?.length) {
						const insertIndex = datalist.value.findIndex((k) => k.key === item.key);
						handleTreeData(apiRes, item, item.level + 1, insertIndex);
						datalist.value = checkInitData(datalist.value);
					} else {
						// 加载后无数据就移除展开图标
						item.expand = false;
						item.isLeaf = true;
						item.showArrow = false;
					}

					loadLoading.value = false;
					item.loading = false;
					item.loaded = true;
				}
			} else {
				const eki = expandedKeys.value.findIndex((k) => k === key);
				if (eki >= 0) {
					expandedKeys.value.splice(eki, 1);
				}
			}

			return item;
		}

		/**
		 * 获取父类的选中状态
		 * @param item
		 */
		function getParentCheckedStatus(item) {
			if (!item) {
				return unCheckedStatus;
			}

			if (!props.checkedDisabled && item.disabled) {
				return item.checkedStatus || unCheckedStatus;
			}

			// 单选时，父类永远为半选
			if (!props.showCheckbox) {
				return halfCheckedStatus;
			}

			const { children } = item;
			// 子类全选中
			const childrenCheckedAll = children.every((k) => k.checkedStatus === isCheckedStatus);
			if (childrenCheckedAll) {
				return isCheckedStatus;
			}

			// 子类全不选中
			const childrenUncheckedAll = children.every((k) => k.checkedStatus === unCheckedStatus);
			if (childrenUncheckedAll) {
				return unCheckedStatus;
			}

			return halfCheckedStatus;
		}

		function filterData() {
			if (props.filterValue === '') {
				datalist.value.forEach((k) => {
					k.show = true;
				});
				return;
			}

			datalist.value.forEach((k) => {
				if (k.label.indexOf(props.filterValue) > -1) {
					k.show = true;
					k.parentKeys.forEach((k) => {
						datamap.value[k].show = true;
					});
				} else {
					k.show = false;
				}
			});

			datalist.value.forEach((k) => {
				if (k.show) {
					k.parentKeys.forEach((k) => {
						datamap.value[k].show = true;
					});
				}
			});
		}

		/**
		 * 返回已选的 key
		 */
		const getCheckedKeys = () => getAllNodeKeys(datalist.value, 'checkedStatus', isCheckedStatus, props.packDisabledkey);
		/**
		 * 根据key设置已选
		 * @param keys 单选时为数字或者字符串，多选时为数组
		 * @param checked 多选时为key的数组，单选时为key
		 */
		function setCheckedKeys(keys, checked = true) {
			// 多选
			if (props.showCheckbox) {
				if (!isArray(keys)) {
					logError(`setCheckedKeys 第一个参数非数组，传入的是[${keys}]`);
					return;
				}

				const list = datalist.value;

				// 取消选择
				if (checked === false) {
					let newCheckedKeys = [];
					for (let i = 0; i < checkedKeys.value.length; i++) {
						const ck = checkedKeys.value[i];
						if (!keys.includes(ck)) {
							newCheckedKeys.push(ck);
						}
					}
					newCheckedKeys = [...new Set(newCheckedKeys)];
					checkedKeys.value = newCheckedKeys;
					handleCheckState(list, keys, false);

					return;
				}

				// 选择
				const newCheckedKeys = [...checkedKeys.value, ...keys];
				checkedKeys.value = [...new Set(newCheckedKeys)];
				handleCheckState(list, checkedKeys.value, true);

				if (props.expandChecked && checked) {
					expandedKeys.value = [...new Set([...(checkedKeys.value || []), ...(keys || [])])];
					handleExpandState(list, keys, true);
				}
				return;
			}

			// 单选
			// 如果为数组则拿第一个
			if (isArray(keys)) {
				keys = keys[0];
			}

			if (!isString(keys) && !isNumber(keys)) {
				logError('setCheckedKeys 第一个参数字符串或数字，传入的是==>', keys);
				return;
			}

			const list = datalist.value;
			checkedKeys.value = checked ? keys : null;

			if (props.expandChecked && checked) {
				handleExpandState(list, [keys], true);
			}

			handleCheckState(list, keys, !!checked);
		}
		/**
		 * 返回半选的 key
		 */
		const getHalfCheckedKeys = () => getAllNodeKeys(datalist.value, 'checkedStatus', halfCheckedStatus, props.packDisabledkey);
		/**
		 * 返回未选的 key
		 */
		const getUncheckedKeys = () => getAllNodeKeys(datalist.value, 'checkedStatus', unCheckedStatus, props.packDisabledkey);
		/**
		 * 返回已展开的 key
		 */
		const getExpandedKeys = () => getAllNodeKeys(datalist.value, 'expand', true);
		/**
		 * 返回未展开的 key
		 */
		const getUnexpandedKeys = () => getAllNodeKeys(datalist.value, 'expand', false);
		/**
		 * 根据key展开/收起
		 *
		 * @param keys 数组，或字符串 all
		 * @param expand true为展开/false为收起
		 */
		function setExpandedKeys(keys, expand = true) {
			if (!Array.isArray(keys) && keys !== 'all') {
				logError('setExpandedKeys 第一个参数非数组，传入的是===>', keys);
				return;
			}

			const list = datalist.value;

			// 展开/收起全部
			if (keys === 'all') {
				list.forEach((k) => {
					k.expand = expand;
					if (k.level > 0) {
						k.show = expand;
					}
				});
				return;
			}

			// 收起
			if (expand === false) {
				const newExpandedKeys = [];
				for (let i = 0; i < expandedKeys.value.length; i++) {
					const ek = expandedKeys.value[i];
					if (!keys.includes(ek)) {
						newExpandedKeys.push(ek);
					}
				}
				expandedKeys.value = [...new Set(newExpandedKeys)];
				handleExpandState(list, keys, false);

				return;
			}

			// 展开
			const newExpandedKeys = [];
			for (let i = 0; i < list.length; i++) {
				if (keys.includes(list[i].key)) {
					newExpandedKeys.push(list[i].key);
				}
			}
			expandedKeys.value = [...new Set(newExpandedKeys)];
			handleExpandState(list, newExpandedKeys, true);
		}
		/**
		 * 返回已选的节点
		 */
		const getCheckedNodes = () => getAllNodes(datalist.value, 'checkedStatus', isCheckedStatus, props.packDisabledkey);
		/**
		 * 返回半选的节点
		 */
		const getHalfCheckedNodes = () => getAllNodes(datalist.value, 'checkedStatus', halfCheckedStatus, props.packDisabledkey);
		/**
		 * 返回未选的节点
		 */
		const getUncheckedNodes = () => getAllNodes(datalist.value, 'checkedStatus', unCheckedStatus, props.packDisabledkey);
		/**
		 * 返回已展开的节点
		 */
		const getExpandedNodes = () => getAllNodes(datalist.value, 'expand', true);
		/**
		 * 返回未展开的节点
		 */
		const getUnexpandedNodes = () => getAllNodes(datalist.value, 'expand', false);

		watch(
			() => props.defaultExpandedKeys,
			(v) => {
				if (v?.length) {
					expandedKeys.value = v;
				} else {
					expandedKeys.value = [];
				}

				// if (v) checkInitData(datalist.value)
			},
			{ immediate: true }
		);

		watch(
			() => props.defaultCheckedKeys,
			(v) => {
				if (props.showCheckbox) {
					if (v?.length) {
						checkedKeys.value = v;
					} else {
						checkedKeys.value = [];
					}
				} else {
					if (v || v === 0) {
						checkedKeys.value = v;
					} else {
						checkedKeys.value = null;
					}
				}
				// checkInitData(datalist.value)
			},
			{ immediate: true }
		);

		watch(
			() => props.data,
			(v) => {
				dataRef.value = deepClone(v);
				setTimeout(() => {
					initData();
				}, 36);
			},
			{ immediate: true, deep: true }
		);

		watch(
			() => props.filterValue,
			() => {
				filterData();
			}
		);

		return {
			datalist,
			unCheckedStatus,
			halfCheckedStatus,
			isCheckedStatus,
			handleCheckChange,
			handleRadioChange,
			handleLabelClick,
			handleExpandedChange,
			loadLoading,

			// updateChildrenByKey: () => {},
			// insertBeforeByKey: () => {},
			// insertAfterByKey: () => {},
			getCheckedKeys,
			setCheckedKeys,
			getHalfCheckedKeys,
			getUncheckedKeys,
			getExpandedKeys,
			getUnexpandedKeys,
			setExpandedKeys,
			getCheckedNodes,
			getHalfCheckedNodes,
			getUncheckedNodes,
			getExpandedNodes,
			getUnexpandedNodes,
		};
	},
});
</script>

<style lang="scss" scoped>
@font-face {
	font-family: 'da-tree-iconfont'; /* Project id  */
	src: url('data:application/octet-stream;base64,AAEAAAALAIAAAwAwR1NVQiCLJXoAAAE4AAAAVE9TLzI8GU+XAAABjAAAAGBjbWFwahLuHAAAAhQAAAIQZ2x5ZtAAFwYAAAQ8AAAEWGhlYWQkfWz8AAAA4AAAADZoaGVhB94DiwAAALwAAAAkaG10eCgAAAAAAAHsAAAAKGxvY2EE3AQOAAAEJAAAABZtYXhwAR0AoAAAARgAAAAgbmFtZRCjPLAAAAiUAAACZ3Bvc3TfNfUGAAAK/AAAALsAAQAAA4D/gABcBAAAAAAABAAAAQAAAAAAAAAAAAAAAAAAAAoAAQAAAAEAAJx55T9fDzz1AAsEAAAAAADgrxSAAAAAAOCvFIAAAP/VBAADKgAAAAgAAgAAAAAAAAABAAAACgCUAAkAAAAAAAIAAAAKAAoAAAD/AAAAAAAAAAEAAAAKADAAPgACREZMVAAObGF0bgAaAAQAAAAAAAAAAQAAAAQAAAAAAAAAAQAAAAFsaWdhAAgAAAABAAAAAQAEAAQAAAABAAgAAQAGAAAAAQAAAAQEAAGQAAUAAAKJAswAAACPAokCzAAAAesAMgEIAAACAAUDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFBmRWQAwOYE7McDgP+AAAAD3ACAAAAAAQAAAAAAAAAAAAAAAAACBAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAEAAAABAAAAAAAAAUAAAADAAAALAAAAAQAAAGUAAEAAAAAAI4AAwABAAAALAADAAoAAAGUAAQAYgAAABAAEAADAADmBOfx6k/q1evO7MXsx///AADmBOfx6k/q1OvO7MTsx///AAAAAAAAAAAAAAAAAAAAAQAQABAAEAAQABIAEgAUAAAAAQAIAAIAAwAEAAUABgAHAAkAAAEGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAHwAAAAAAAAACQAA5gQAAOYEAAAAAQAA5/EAAOfxAAAACAAA6k8AAOpPAAAAAgAA6tQAAOrUAAAAAwAA6tUAAOrVAAAABAAA684AAOvOAAAABQAA7MQAAOzEAAAABgAA7MUAAOzFAAAABwAA7McAAOzHAAAACQAAAAAALgBgAIoArgDSAQIBJgH+AiwAAAABAAAAAANZAkoAGQAAATIeAQYHDgEHDgImJyYvAiYnLgE+ATM3AxsXHQkJEEB3Nw8pKigNHyFFQiAdDQgJGxa2AkoSHCQRR4g8EBEBDhAiI0dGIyAPIRsRAQAAAAMAAP/VA6sDKgAIABEAGgAAARQGIiY0NjIWAzI2ECYgBhAWEzIWEAYgJhA2AoBMaExMaEyAjMrK/ujKyoyw+vr+oPr6AYA0TExoTEz+dsoBGMrK/ujKAwD6/qD6+gFg+gAAAAACAAAAAAOAAwAABQAVAAAlAScBJwcBMhYVERQGIyEiJjURNDYzAaoBgDz+vJg8AlQkMjIk/awkMjIkqgGAPv68mDwBgDQi/awiNDQiAlQiNAAAAAACAAAAAAOAAwAADwATAAABMhYVERQGIyEiJjURNDYzBSERIQMqIjQ0Iv2sIjQ0IgJU/awCVAMANCL9rCI0NCICVCI0Vv2sAAACAAAAAAOAAwAAAwATAAABNSEVATIWFREUBiMhIiY1ETQ2MwLW/lQCACI0NCL9rCI0NCIBVlRUAao0Iv2sIjQ0IgJUIjQAAAADAAD/1QOrAyoACAARABoAACUyNhAmIAYQFhMyFhAGICYQNhcyFhQGIiY0NgIAjMrK/ujKyoyw+vr+oPr6sFh+frB+firKARjKyv7oygMA+v6g+voBYPrUfrB+frB+AAACAAD/1QOrAyoACAARAAAlMjYQJiAGEBYTMhYQBiAmEDYCAIzKyv7oysqMsPr6/qD6+irKARjKyv7oygMA+v6g+voBYPoAAAAJAAAAAANpAwEAHAA0AEgAWQBqAHUAfgCSAJMAAAEUFhcWFxYyNzY3Njc2NTQmJyYnJiIHBgcGBwYVBxQeARcWMzI+ATc2NTQuAScmIyIOAQcGExQWFx4BMj4CNCYnLgEiDgEHBhcUHgIyPgI0LgIiDgI3FBcWMzI3NjU0JyYjIgcGBzcGFjI2NCYiBw4BJxQWMjY0JiIGJxQWFxYzMjY3NjU0JicmIyIGBwYVASYUDxMUFTEVGQ4TBggUDxMUFTEVGQ4TBgimDh8SFBEUIx8HBw4fERUREyQfBghZDgsPHiceHQsNDA4fJx4dBAfyCxUdHx0VCwsVHR8dFAzMEhMcGhUTExMcGRYSAV8BIy8jIy8RCAkHGSMZGSMZVAUECQ0GDAQJBQQKDAYNAwkCixksDxMGCQkMDRMTFxYZLA8TBgkJDA0TExsT5BQkHgcIDx4SFRETJB4HCA8eEg7+6xQfDA4LDBsdJyALDwsNGw4WZxAdFQsLFR0fHRUMDBUdTBoVExMSHRkWExMWGakXIyIvIxEIFpMRGRkjGBhfBgwECQUECgwGDQMJBQQHDwAAAAABAAAAAALGAtkAGQAAATQ+ARYXHgEXHgIGBwYPAgYHDgEuATUnATYSHCQRR4g8EBEBDhAiI0dGIyAPIRsRAQKbFx0JCRBAdzcPKSooDR8hREMgHQ0ICRsWtgAAAAAAEgDeAAEAAAAAAAAAEwAAAAEAAAAAAAEACAATAAEAAAAAAAIABwAbAAEAAAAAAAMACAAiAAEAAAAAAAQACAAqAAEAAAAAAAUACwAyAAEAAAAAAAYACAA9AAEAAAAAAAoAKwBFAAEAAAAAAAsAEwBwAAMAAQQJAAAAJgCDAAMAAQQJAAEAEACpAAMAAQQJAAIADgC5AAMAAQQJAAMAEADHAAMAAQQJAAQAEADXAAMAAQQJAAUAFgDnAAMAAQQJAAYAEAD9AAMAAQQJAAoAVgENAAMAAQQJAAsAJgFjQ3JlYXRlZCBieSBpY29uZm9udGljb25mb250UmVndWxhcmljb25mb250aWNvbmZvbnRWZXJzaW9uIDEuMGljb25mb250R2VuZXJhdGVkIGJ5IHN2ZzJ0dGYgZnJvbSBGb250ZWxsbyBwcm9qZWN0Lmh0dHA6Ly9mb250ZWxsby5jb20AQwByAGUAYQB0AGUAZAAgAGIAeQAgAGkAYwBvAG4AZgBvAG4AdABpAGMAbwBuAGYAbwBuAHQAUgBlAGcAdQBsAGEAcgBpAGMAbwBuAGYAbwBuAHQAaQBjAG8AbgBmAG8AbgB0AFYAZQByAHMAaQBvAG4AIAAxAC4AMABpAGMAbwBuAGYAbwBuAHQARwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABzAHYAZwAyAHQAdABmACAAZgByAG8AbQAgAEYAbwBuAHQAZQBsAGwAbwAgAHAAcgBvAGoAZQBjAHQALgBoAHQAdABwADoALwAvAGYAbwBuAHQAZQBsAGwAbwAuAGMAbwBtAAACAAAAAAAAAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoBAgEDAQQBBQEGAQcBCAEJAQoBCwAIeGlhbmd4aWEGYWRqdXN0CGNoZWNrYm94FGNoZWNrYm94b3V0bGluZWJsYW5rFWluZGV0ZXJtaW5hdGVjaGVja2JveBJyYWRpb2J1dHRvbmNoZWNrZWQUcmFkaW9idXR0b251bmNoZWNrZWQHbG9hZGluZw14aWFuZ3hpYS1jb3B5AAAA')
		format('truetype');
}

.da-tree {
	width: 100%;
	height: 100%;

	&-scroll {
		width: 100%;
		height: 100%;
	}

	&-item {
		display: flex;
		align-items: center;
		height: 0;
		padding: 0;
		overflow: hidden;
		font-size: 30rpx;
		line-height: 1;
		visibility: hidden;
		opacity: 0;
		transition: opacity 0.2s linear;

		&.is-show {
			height: auto;
			padding: 12rpx 24rpx;
			visibility: visible;
			opacity: 1;
		}

		&__icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 40rpx;
			height: 40rpx;
			overflow: hidden;

			&--arr {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 32rpx;
				height: 32rpx;

				&::after {
					position: relative;
					z-index: 1;
					overflow: hidden;
					/* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
					font-family: 'da-tree-iconfont' !important;
					font-size: 32rpx;
					font-style: normal;
					color: #999;
					-webkit-font-smoothing: antialiased;
					-moz-osx-font-smoothing: grayscale;
				}

				&.is-expand {
					&::after {
						content: '\e604';
					}
				}

				&.is-right {
					transform: rotate(-90deg);
				}

				&.is-loading {
					animation: IconLoading 1s linear 0s infinite;

					&::after {
						content: '\e7f1';
					}
				}
			}
		}

		&__checkbox {
			width: 40rpx;
			height: 40rpx;
			overflow: hidden;

			&--left {
				order: 0;
			}

			&--right {
				order: 1;
			}

			&--icon {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				width: 40rpx;
				height: 40rpx;

				&::after {
					position: relative;
					top: 0;
					left: 0;
					z-index: 1;
					overflow: hidden;
					/* stylelint-disable-next-line font-family-no-missing-generic-family-keyword */
					font-family: 'da-tree-iconfont' !important;
					font-size: 32rpx;
					font-style: normal;
					-webkit-font-smoothing: antialiased;
					-moz-osx-font-smoothing: grayscale;
				}

				&.da-tree-checkbox-outline::after {
					color: #bbb;
					content: '\ead5';
				}

				&.da-tree-checkbox-checked::after {
					color: var(--theme-color, #007aff);
					content: '\ead4';
				}

				&.da-tree-checkbox-indeterminate::after {
					color: var(--theme-color, #007aff);
					content: '\ebce';
				}

				&.da-tree-radio-outline::after {
					color: #bbb;
					content: '\ecc5';
				}

				&.da-tree-radio-checked::after {
					color: var(--theme-color, #007aff);
					content: '\ecc4';
				}

				&.da-tree-radio-indeterminate::after {
					color: var(--theme-color, #007aff);
					content: '\ea4f';
				}
			}

			&.is--disabled {
				cursor: not-allowed;
				opacity: 0.35;
			}
		}

		&__label {
			flex: 1;
			margin-left: 4rpx;
			color: #555;

			&--2 {
				color: var(--theme-color, #007aff);
			}

			&--append {
				font-size: 60%;
				opacity: 0.6;
			}
		}
	}
}

@keyframes IconLoading {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>

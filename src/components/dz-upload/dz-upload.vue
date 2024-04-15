<template>
	<view class="dz-upload" :style="[api.addStyle(customStyle)]">
		<view class="dz-upload__wrap">
			<template v-if="previewImage">
				<view
					class="dz-upload__wrap__preview"
					v-for="(item, index) in lists"
					:key="index"
					:style="[
						{
							borderRadius: api.addUnit(borderRadius),
						},
					]"
				>
					<image
						v-if="item.isImage || (item.type && item.type === 'image')"
						:src="item.thumb || item.url"
						:mode="imageMode"
						class="dz-upload__wrap__preview__image"
						@tap="onPreviewImage(item)"
						:style="[
							{
								width: api.addUnit(width),
								height: api.addUnit(height),
							},
						]"
					/>
					<view v-else class="dz-upload__wrap__preview__other">
						<dz-icon color="#80CBF9" size="26" :name="item.isVideo || (item.type && item.type === 'video') ? 'movie' : 'folder'"></dz-icon>
						<text class="dz-upload__wrap__preview__other__text">{{ item.isVideo || (item.type && item.type === 'video') ? '视频' : '文件' }}</text>
					</view>
					<view class="dz-upload__status" v-if="item.status === 'uploading' || item.status === 'failed'">
						<view class="dz-upload__status__icon">
							<dz-icon v-if="item.status === 'failed'" name="close-circle" color="#ffffff" size="25" />
							<dz-loading-icon size="22" mode="circle" color="#ffffff" v-else />
						</view>
						<text v-if="item.message" class="dz-upload__status__message">{{ item.message }}</text>
					</view>
					<view class="dz-upload__deletable" v-if="item.status !== 'uploading' && (deletable || item.deletable)" @tap.stop="deleteItem(index)">
						<view class="dz-upload__deletable__icon">
							<dz-icon name="close" color="#ffffff" size="20"></dz-icon>
						</view>
					</view>
					<view class="dz-upload__success" v-if="item.status === 'success'">
						<!-- #ifdef APP-NVUE -->
						<image :src="successIcon" class="dz-upload__success__icon"></image>
						<!-- #endif -->
						<!-- #ifndef APP-NVUE -->
						<view class="dz-upload__success__icon">
							<dz-icon name="check" color="#ffffff" size="24"></dz-icon>
						</view>
						<!-- #endif -->
					</view>
				</view>
			</template>

			<template v-if="isInCount">
				<view v-if="$slots.default || $slots.$default" @tap="chooseFile">
					<slot />
				</view>
				<view
					v-else
					class="dz-upload__button"
					:hover-class="!disabled ? 'dz-upload__button--hover' : ''"
					hover-stay-time="150"
					@tap="chooseFile"
					:class="[disabled && 'dz-upload__button--disabled']"
					:style="[
						{
							width: api.addUnit(width),
							height: api.addUnit(height),
							...api.addStyle(buttonCustomStyle),
						},
					]"
				>
					<dz-icon :name="uploadIcon" size="52" :color="uploadIconColor"></dz-icon>
					<text v-if="uploadText" class="dz-upload__button__text">{{ uploadText }}</text>
				</view>
			</template>
		</view>
	</view>
</template>

<script lang="ts">
import { $chooseFile } from './utils.js';
import props from './props';

/**
 * upload 上传
 * @description 该组件用于上传图片场景
 * @tutorial https://uviewui.com/components/upload.html
 * @property {String}			accept				接受的文件类型, 可选值为all media image file video （默认 'image' ）
 * @property {String | Array}	capture				图片或视频拾取模式，当accept为image类型时设置capture可选额外camera可以直接调起摄像头（默认 ['album', 'camera'] ）
 * @property {Boolean}			compressed			当accept为video时生效，是否压缩视频，默认为true（默认 true ）
 * @property {String}			camera				当accept为video时生效，可选值为back或front（默认 'back' ）
 * @property {Number}			maxDuration			当accept为video时生效，拍摄视频最长拍摄时间，单位秒（默认 60 ）
 * @property {String}			uploadIcon			上传区域的图标，只能内置图标（默认 'camera-fill' ）
 * @property {String}			uploadIconColor		上传区域的图标的字体颜色，只能内置图标（默认 #D3D4D6 ）
 * @property {Boolean}			useBeforeRead		是否开启文件读取前事件（默认 false ）
 * @property {Boolean}			previewFullImage	是否显示组件自带的图片预览功能（默认 true ）
 * @property {String | Number}	maxCount			最大上传数量（默认 52 ）
 * @property {Boolean}			disabled			是否启用（默认 false ）
 * @property {String}			imageMode			预览上传的图片时的裁剪模式，和image组件mode属性一致（默认 'aspectFill' ）
 * @property {String}			name				标识符，可以在回调函数的第二项参数中获取
 * @property {Array}			sizeType			所选的图片的尺寸, 可选值为original compressed（默认 ['original', 'compressed'] ）
 * @property {Boolean}			multiple			是否开启图片多选，部分安卓机型不支持 （默认 false ）
 * @property {Boolean}			deletable			是否展示删除按钮（默认 true ）
 * @property {String | Number}	maxSize				文件大小限制，单位为byte （默认 Number.MAX_VALUE ）
 * @property {Array}			fileList			显示已上传的文件列表
 * @property {String}			uploadText			上传区域的提示文字
 * @property {String | Number}	width				内部预览图片区域和选择图片按钮的区域宽度（默认 80 ）
 * @property {String | Number}	height				内部预览图片区域和选择图片按钮的区域高度（默认 80 ）
 * @property {Object}			customStyle			组件的样式，对象形式
 * @event {Function} afterRead		读取后的处理函数
 * @event {Function} beforeRead		读取前的处理函数
 * @event {Function} oversize		文件超出大小限制
 * @event {Function} clickPreview	点击预览图片
 * @event {Function} delete 		删除图片
 * @example <dz-upload :action="action" :fileList="fileList" ></dz-upload>
 */

import { defineComponent, ref, watch } from 'vue';
export default defineComponent({
	name: 'dz-upload',
	props,
	emits: ['error', 'beforeRead', 'oversize', 'afterRead', 'delete', 'clickPreview'],
	setup(props, { emit }) {
		// #ifdef APP-NVUE
		const successIcon =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAKKADAAQAAAABAAAAKAAAAAB65masAAACP0lEQVRYCc3YXygsURwH8K/dpcWyG3LF5u/6/+dKVylSypuUl6uUPMifKMWL8oKEB1EUT1KeUPdR3uTNUsSLxb2udG/cbvInNuvf2rVnazZ/ZndmZ87snjM1Z+Z3zpzfp9+Z5mEAhlvjRtZgCKs+gnPAOcAkkMOR4jEHfItjDvgRxxSQD8cM0BuOCaAvXNCBQrigAsXgggYUiwsK0B9cwIH+4gIKlIILGFAqLiBAOTjFgXJxigJp4BQD0sIpAqSJow6kjSNAFTnRaHJwLenD6Mud52VQAcrBfTd2oyq+HtGaGGWAcnAVcXWoM3bCZrdi+ncPfaAcXE5UKVpdW/vitGPqqAtn98d0gXJwX7Qp6MmegUYVhvmTIezdmHlxJCjpHRTCFerLkRRu4k0aqdajN3sWOo0BK//msHa+xDuPC/oNFMKRhTtM4xjIX0SCNpXL4+7VIaHuyiWEp2L7ahWLf8fejfPdqPmC3mJicORZUp1CQzm+GiphvljGk+PBvWRbxii+xVTj5M6CiZ/tsDufvaXyxEUDxeLIyvu3m0iOyEFWVAkydcVYdyFrE9tQk9iMq6f/GNlvwt3LjQfh60LUrw9/cFyyMJUW/XkLSNMV4Mi6C5ML+ui4x5ClAX9sB9w0wV6wglJwJCv5fOxcr6EstgbGiEw4XcfUry4cWrcEUW8n+ARKxXEJHhw2WG43UKSvwI/TSZgvl7kh0b3XLZaLEy0QmMgLZAVH7J+ALOE+AVnDvQOyiPMAWcW5gSzjCPAV+78S5WE0GrQAAAAASUVORK5CYII=';
		// #endif
		const lists = ref([]);
		const isInCount = ref<boolean>(true);
		// 监听文件列表的变化，重新整理内部数据
		watch(
			() => props.fileList,
			() => {
				formatFileList();
			},
			{
				immediate: true,
				deep: true,
			}
		);

		watch(
			() => props.accept,
			(val) => {
				// #ifndef MP-WEIXIN
				if (val === 'all' || val === 'media') {
					uni.$api.error('只有微信小程序才支持把accept配置为all、media之一');
				}
				// #endif
				// #ifndef H5 || MP-WEIXIN
				if (val === 'file') {
					uni.$api.error('只有微信小程序和H5(HX2.9.9)才支持把accept配置为file');
				}
				// #endif
			},
			{
				immediate: true,
			}
		);

		function formatFileList() {
			const { fileList = [], maxCount } = props;
			const _lists = fileList.map((item) =>
				Object.assign(Object.assign({}, item), {
					// 如果item.url为本地选择的blob文件的话，无法判断其为video还是image，此处优先通过accept做判断处理
					isImage: props.accept === 'image' || uni.$api.test.image(item.url || item.thumb),
					isVideo: props.accept === 'video' || uni.$api.test.video(item.url || item.thumb),
					deletable: typeof item.deletable === 'boolean' ? item.deletable : props.deletable,
				})
			);
			lists.value = _lists;
			isInCount.value = _lists.length < maxCount;
		}
		function chooseFile() {
			const { maxCount, multiple, disabled } = props;
			if (disabled) return;
			// 如果用户传入的是字符串，需要格式化成数组
			let capture;
			try {
				capture = uni.$api.test.array(props.capture) ? props.capture : props.capture.split(',');
			} catch (e) {
				capture = [];
			}

			$chooseFile(
				Object.assign(
					{
						accept: props.accept,
						multiple: props.multiple,
						capture: capture,
						compressed: props.compressed,
						maxDuration: props.maxDuration,
						sizeType: props.sizeType,
						camera: props.camera,
					},
					{
						maxCount: maxCount - lists.value.length,
					}
				)
			)
				.then((res) => {
					onBeforeRead(multiple ? res : res[0]);
				})
				.catch((error) => {
					emit('error', error);
				});
		}

		// 文件读取之前
		function onBeforeRead(file) {
			const { beforeRead, useBeforeRead } = props;
			let res = true;
			// beforeRead是否为一个方法
			if (uni.$api.test.func(beforeRead)) {
				// 如果用户定义了此方法，则去执行此方法，并传入读取的文件回调
				res = beforeRead(file, getDetail());
			}
			if (useBeforeRead) {
				res = new Promise((resolve, reject) => {
					emit(
						'beforeRead',
						Object.assign(
							Object.assign(
								{
									file,
								},
								getDetail()
							),
							{
								callback: (ok) => {
									ok ? resolve() : reject();
								},
							}
						)
					);
				});
			}
			if (!res) {
				return;
			}
			if (uni.$api.test.promise(res)) {
				res.then((data) => onAfterRead(data || file));
			} else {
				onAfterRead(file);
			}
		}

		function getDetail(index) {
			return {
				name: props.name,
				index: index == null ? props.fileList.length : index,
			};
		}

		function onAfterRead(file) {
			const { maxSize, afterRead } = props;
			const oversize = Array.isArray(file) ? file.some((item) => item.size > maxSize) : file.size > maxSize;
			if (oversize) {
				emit(
					'oversize',
					Object.assign(
						{
							file,
						},
						getDetail()
					)
				);
				return;
			}
			if (typeof afterRead === 'function') {
				afterRead(file, getDetail());
			}
			emit(
				'afterRead',
				Object.assign(
					{
						file,
					},
					getDetail()
				)
			);
		}

		function deleteItem(index) {
			emit(
				'delete',
				Object.assign(Object.assign({}, getDetail(index)), {
					file: props.fileList[index],
				})
			);
		}

		// 预览图片
		function onPreviewImage(item) {
			if (!item.isImage || !props.previewFullImage) return;
			uni.previewImage({
				// 先filter找出为图片的item，再返回filter结果中的图片url
				urls: lists.value
					.filter((item) => props.accept === 'image' || uni.$api.test.image(item.url || item.thumb))
					.map((item) => item.url || item.thumb),
				current: item.url || item.thumb,
				fail() {
					uni.$api.toast('预览图片失败');
				},
			});
		}

		function onPreviewVideo(event) {
			if (!props.previewFullImage) return;
			const { index } = event.currentTarget.dataset;

			wx.previewMedia({
				sources: lists.value
					.filter((item) => isVideoFile(item))
					.map((item) =>
						Object.assign(Object.assign({}, item), {
							type: 'video',
						})
					),
				current: index,
				fail() {
					uni.$api.toast('预览视频失败');
				},
			});
		}

		function onClickPreview(event) {
			const { index } = event.currentTarget.dataset;
			const item = lists.value[index];
			emit('clickPreview', Object.assign(Object.assign({}, item), getDetail(index)));
		}

		return {
			lists,
			onPreviewImage,
			deleteItem,
			// #ifdef APP-NVUE
			successIcon,
			// #endif
			chooseFile,
			isInCount,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '../libs/css/components.scss';
$dz-upload-preview-border-radius: 2px !default;
$dz-upload-preview-margin: 0 8px 8px 0 !default;
$dz-upload-image-width: 80px !default;
$dz-upload-image-height: $dz-upload-image-width;
$dz-upload-other-bgColor: rgb(242, 242, 242) !default;
$dz-upload-other-flex: 1 !default;
$dz-upload-text-font-size: 11px !default;
$dz-upload-text-color: $dz-tips-color !default;
$dz-upload-text-margin-top: 2px !default;
$dz-upload-deletable-right: 0 !default;
$dz-upload-deletable-top: 0 !default;
$dz-upload-deletable-bgColor: rgb(55, 55, 55) !default;
$dz-upload-deletable-height: 14px !default;
$dz-upload-deletable-width: $dz-upload-deletable-height;
$dz-upload-deletable-boder-bottom-left-radius: 100px !default;
$dz-upload-deletable-zIndex: 3 !default;
$dz-upload-success-bottom: 0 !default;
$dz-upload-success-right: 0 !default;
$dz-upload-success-border-style: solid !default;
$dz-upload-success-border-top-color: transparent !default;
$dz-upload-success-border-left-color: transparent !default;
$dz-upload-success-border-bottom-color: $dz-type-success !default;
$dz-upload-success-border-right-color: $dz-upload-success-border-bottom-color;
$dz-upload-success-border-width: 9px !default;
$dz-upload-icon-top: -2px !default;
$dz-upload-icon-right: 0px !default;
$dz-upload-icon-h5-top: -3px !default;
$dz-upload-icon-h5-right: 0 !default;
$dz-upload-icon-width: 16px !default;
$dz-upload-icon-height: $dz-upload-icon-width;
$dz-upload-success-icon-bottom: -12px !default;
$dz-upload-success-icon-right: -10px !default;
$dz-upload-status-right: 0 !default;
$dz-upload-status-left: 0 !default;
$dz-upload-status-bottom: 0 !default;
$dz-upload-status-top: 0 !default;
$dz-upload-status-bgColor: rgba(0, 0, 0, 0.5) !default;
$dz-upload-status-icon-Zindex: 1 !default;
$dz-upload-message-font-size: 12px !default;
$dz-upload-message-color: #ffffff !default;
$dz-upload-message-margin-top: 5px !default;
$dz-upload-button-width: 80px !default;
$dz-upload-button-height: $dz-upload-button-width;
$dz-upload-button-bgColor: rgb(244, 245, 247) !default;
$dz-upload-button-border-radius: 6px !default;
$dz-upload-botton-margin: 0 8px 8px 0 !default;
$dz-upload-text-font-size: 11px !default;
$dz-upload-text-color: $dz-tips-color !default;
$dz-upload-text-margin-top: 2px !default;
$dz-upload-hover-bgColor: rgb(230, 231, 233) !default;
$dz-upload-disabled-opacity: 0.5 !default;

.dz-upload {
	@include flex(column);
	flex: 1;

	&__wrap {
		@include flex;
		flex-wrap: wrap;
		flex: 1;

		&__preview {
			border-radius: $dz-upload-preview-border-radius;
			margin: $dz-upload-preview-margin;
			position: relative;
			overflow: hidden;
			@include flex;

			&__image {
				width: $dz-upload-image-width;
				height: $dz-upload-image-height;
			}

			&__other {
				width: $dz-upload-image-width;
				height: $dz-upload-image-height;
				background-color: $dz-upload-other-bgColor;
				flex: $dz-upload-other-flex;
				@include flex(column);
				justify-content: center;
				align-items: center;

				&__text {
					font-size: $dz-upload-text-font-size;
					color: $dz-upload-text-color;
					margin-top: $dz-upload-text-margin-top;
				}
			}
		}
	}

	&__deletable {
		position: absolute;
		top: $dz-upload-deletable-top;
		right: $dz-upload-deletable-right;
		background-color: $dz-upload-deletable-bgColor;
		height: $dz-upload-deletable-height;
		width: $dz-upload-deletable-width;
		@include flex;
		border-bottom-left-radius: $dz-upload-deletable-boder-bottom-left-radius;
		align-items: center;
		justify-content: center;
		z-index: $dz-upload-deletable-zIndex;

		&__icon {
			position: absolute;
			transform: scale(0.7);
			top: $dz-upload-icon-top;
			right: $dz-upload-icon-right;
			/* #ifdef H5 */
			top: $dz-upload-icon-h5-top;
			right: $dz-upload-icon-h5-right;
			/* #endif */
		}
	}

	&__success {
		position: absolute;
		bottom: $dz-upload-success-bottom;
		right: $dz-upload-success-right;
		@include flex;
		// 由于weex(nvue)为阿里巴巴的KPI(部门业绩考核)的laji产物，不支持css绘制三角形
		// 所以在nvue下使用图片，非nvue下使用css实现
		/* #ifndef APP-NVUE */
		border-style: $dz-upload-success-border-style;
		border-top-color: $dz-upload-success-border-top-color;
		border-left-color: $dz-upload-success-border-left-color;
		border-bottom-color: $dz-upload-success-border-bottom-color;
		border-right-color: $dz-upload-success-border-right-color;
		border-width: $dz-upload-success-border-width;
		align-items: center;
		justify-content: center;
		/* #endif */

		&__icon {
			/* #ifndef APP-NVUE */
			position: absolute;
			transform: scale(0.7);
			bottom: $dz-upload-success-icon-bottom;
			right: $dz-upload-success-icon-right;
			/* #endif */
			/* #ifdef APP-NVUE */
			width: $dz-upload-icon-width;
			height: $dz-upload-icon-height;
			/* #endif */
		}
	}

	&__status {
		position: absolute;
		top: $dz-upload-status-top;
		bottom: $dz-upload-status-bottom;
		left: $dz-upload-status-left;
		right: $dz-upload-status-right;
		background-color: $dz-upload-status-bgColor;
		@include flex(column);
		align-items: center;
		justify-content: center;

		&__icon {
			position: relative;
			z-index: $dz-upload-status-icon-Zindex;
		}

		&__message {
			font-size: $dz-upload-message-font-size;
			color: $dz-upload-message-color;
			margin-top: $dz-upload-message-margin-top;
		}
	}

	&__button {
		@include flex(column);
		align-items: center;
		justify-content: center;
		width: $dz-upload-button-width;
		height: $dz-upload-button-height;
		background-color: $dz-upload-button-bgColor;
		border-radius: $dz-upload-button-border-radius;
		margin: $dz-upload-botton-margin;
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		/* #endif */

		&__text {
			font-size: $dz-upload-text-font-size;
			color: $dz-upload-text-color;
			margin-top: $dz-upload-text-margin-top;
		}

		&--hover {
			background-color: $dz-upload-hover-bgColor;
		}

		&--disabled {
			opacity: $dz-upload-disabled-opacity;
		}
	}
}
</style>

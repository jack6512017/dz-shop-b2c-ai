<template>
	<dz-popup v-model:show="_show" mode="bottom" border-radius="40" :isHidden="false">
		<view class="dz-p-20 dz-text-center">分享至</view>
		<view class="scroll-tap dz-flex">
			<view class="scroll-item dz-flex-1" @tap="handleShare">
				<view class="image"><dz-image :src="iconCopy" borderRadius="50" :width="100" :height="100"></dz-image></view>
				<view class="text dz-line-1">复制</view>
			</view>
			<view class="scroll-item dz-flex-1" @tap="onPoster">
				<view class="image"><dz-image :src="iconPoster" borderRadius="50" :width="100" :height="100"></dz-image></view>
				<view class="text dz-line-1">生成海报</view>
			</view>
		</view>
		<view class="dz-p-30 dz-text-center" @tap="hidePosterClick()">取消</view>
	</dz-popup>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps({
	/**
	 * 显示状态
	 */
	show: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(['update:show', 'onShare', 'onPoster']);
const _show = ref<boolean>(props.show);
const iconCopy =
	'data:image/png;base64,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';
const iconPoster =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAAilBMVEUAAADY2NjX19fZ2dnY2NjY2NjZ2dnY2NjY2NjY2Nja2trY2NjY2NjY2NjZ2dnY2Njj4+PY2NjY2Njd3d3Z2dnY2NjY2NjZ2dnY2NjY2NjY2NjX19fY2NjY2NjY2NjZ2dnb29vY2NjY2NjY2NjY2NjX19fq6urY2NjY2Njc3NzZ2dnY2NjX19fY2NjoViG6AAAALXRSTlMAv4ChIIdtWNKOS+lg+Zt5BNjNEcSrkj1VN/NGD+K5xxrkrHBnLwzs2SUUtEdGsQyuAAAECklEQVRo3u2a6ZLaMAyADSEnIVkSjpAAy1mu1fu/Xmc4Ri7GJpKzbWn5fnWYwpdNLEuRJd68efPm/6BTee7IWc3nK2fkelVH/AYWRRL04I5ekBQL8X18ROEAtAzC6EN8A7mfzOAJs8TPG9ZO0yXUYplOm7zHXh9q0/cau+N+BiQyvxHtZAhkhhNr7Q8XWLg/7LzjT2DyObbxrnvAprfmex2wwuF6W2BJi+fdgzV7jreEBijp3h00wo7qvUtD3aBVk6B7l7Ro3qEsHUWCRDSS5UNuHIUdRokS8qJqDUghWBSArGvvk9J+dRBMDtIeNq6ZF6T9eWFRnUn7dr2MIeWj6lb3TOJ2TeLJrfqppFxVK/9K6wovpT6okVbYhBRJ3et67gOR/nVtdykx5eP3E8wVvOyQ4Cf+07ouu48kDxh49zGVGSpARXP+4AgsjucvK5eiZSo9z+4lqKVUM3ejjVPviV9Ctys9d3O9nQISnD+JcYFc19qmTuKKz/81ACQ1efOlskLacCUilURtZV0uc+OS1oq3QmJOF5sXdqIVu8pGTBYnhlia6cTl3abdZohn+oiK4JEY64htcPvFiCGGSCsOteIQF+nXOew44lArzh6K8WKlsMgY4kxbsIBWvEFxgVsDUQy6IirWix389+VpA0cca8SORoyJ7iv18RrpYkcjDvRi2ChlN0McaMQ9g3inLH+GuGdcW6pYvU1AFJtXV2UUw/yAOzpXXBlqAFWMPxZNhdhuTsAWe8ayVhUjGeZiithc5o7MYoQvHhnD2F5cZkMUPw/kVSPichSPj7ouyuqheN6AOEg7pvbN/JvEJ6xuCGLrWz1ALeFWWy+uvVejU+Y0H07tXNp7ozSghJNrIcZqfbppUTcQjy3GDL8NZ/Qts+KKsdhPS06S6HDF4ko04KVF0eOI8ddcbiEgApb41ks68UufhC7GddWH5+JEIy4Y4jYWQ8/FhUa8oIv3OW5RRrG5XTcgiz2sOp+LB8SXNh34U23bl7aIKvbxa1avqR8zmviET4jwYk5oRZj/4JTdikB8kji45IWyptgnt5vMuTAktJs4DTaVsnPOvzNCg43SUpyAjFpObOAhE7WlSGyi5vpd2tRUzpUmKqFtHJnb8xNDT8K9D/Dsg9AoHxkb9GWuv9N9pXz0iUcDhrv5qe+nttSjAd5hiKc/lp6Bisc7DBGumkCP47itcAnze/CVrZAeOfnA6yDYHOQDL/oR36KBg7bemHOoWfG8FSDrv/8Y99cI6iYFTVskXf5oxL6po/o9ayjidccidoLBwN47ECyGtt7hqw0Z2Y5VveIgmc3o3KsOC/LGI199IJQ4AvtvDP3expwzw5MljDkz6MTOo8FuJ9aWC68+yv7mzZs3f56fcHL+iH2MA08AAAAASUVORK5CYII=';

watch(
	() => props.show,
	(val) => {
		_show.value = val;
		if (!val) {
			hidePosterClick();
		}
	}
);

watch(
	() => _show.value,
	(val) => {
		if (!val) {
			emit('update:show', false);
		}
	}
);

function handleShare() {
	emit('onShare');
	hidePosterClick();
}

function onPoster() {
	emit('onPoster');
	hidePosterClick();
}

function hidePosterClick() {
	emit('update:show', false);
	_show.value = false;
}
</script>

<style lang="scss" scoped>
.scroll-tap {
	white-space: nowrap;
	.scroll-item {
		display: inline-block;
		text-align: center;
		width: 160rpx;
		padding: 0 20rpx;
		.image,
		.icon {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
		}
		.image {
			vertical-align: bottom;
			margin: 0 auto;
		}
		.icon {
			display: inline-block;
			> view {
				height: 100%;
			}
			.dzicon-likefill {
				font-size: 60rpx;
			}
		}
		.text {
			font-size: 28rpx;
			margin: 10rpx 0 20rpx;
		}
	}
}
</style>

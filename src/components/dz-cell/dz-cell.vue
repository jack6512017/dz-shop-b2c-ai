<template>
	<view
		:style="{
			padding: `${parseInt(cell.marginTop) * 2}rpx ${parseInt(cell.marginLeftRight) * 2}rpx ${parseInt(cell.marginBottom) * 2}rpx`,
		}"
	>
		<view
			class="dz-cell"
			:style="{
				backgroundColor: cell.bgColor,
				borderRadius: `${parseInt(cell.borderRadius) * 2}rpx`,
			}"
		>
			<dz-cell-group :title="cell.isGroupTitle ? cell.groupTitle : ''" :titleStyle="titleStyle" :border="false">
				<template v-for="(item, index) in cell.list" :key="index">
					<view v-if="item.borderTop == 1" class="dz-border-top" :style="[borderStyle]"></view>
					<dz-cell-item
						:title="item.isTitle == 1 ? item.title : ''"
						:label="item.isLabel == 1 ? item.label : ''"
						:value="item.isValue == 1 ? item.value : ''"
						:bgColor="cell.bgColor"
						:hoverClass="cell.hoverClass == 1 ? 'dz-cell-hover' : 'none'"
						:rightSize="cell.rightSize"
						:rightColor="cell.rightColor"
						:borderTop="false"
						:borderBottom="false"
						@click="click(item.link)"
					>
						<template v-if="item.isIcon" #icon>
							<dz-image
								:src="item.icon"
								:width="parseInt(cell.iconSize) * 2"
								:height="parseInt(cell.iconSize) * 2"
								:size="parseInt(cell.iconSize)"
								:customStyle="{ marginRight: cell.iconStyle ? `${parseInt(cell.iconStyle.leftRight) * 2}rpx` : 0 }"
							/>
						</template>
					</dz-cell-item>
					<view v-if="item.borderBottom == 1" class="dz-border-bottom" :style="[borderStyle]"></view>
				</template>
			</dz-cell-group>
		</view>
	</view>
</template>

<script lang="ts" setup>
import { onMounted, reactive, watch, computed, toRefs } from 'vue';
import type { CSSProperties } from 'vue';

const props = defineProps({
	config: {
		type: Object,
		default() {
			return {};
		},
	},
});

const emit = defineEmits(['click', 'close']);
const data = reactive<any>({
	cell: Object.assign({}, props.config.props),
});

watch(
	() => props.config,
	(nVal) => {
		let copy = Object.assign({}, nVal.props);
		data.cell = copy;
	},
	{
		deep: true,
	}
);

onMounted(() => {
	if (data.cell && data.cell.list.length > 0) {
		data.checkedIndex = 0;
		if (data.cell.active != -1) {
			data.checkedIndex = data.cell.active;
		}
	}
});

const titleStyle = computed((): CSSProperties => {
	let style = {};
	style.padding = `${parseInt(data.cell.groupTitleStyle.top) * 2}rpx ${parseInt(data.cell.groupTitleStyle.leftRight) * 2}rpx ${
		parseInt(data.cell.groupTitleStyle.bottom) * 2
	}rpx`;
	style.color = data.cell.groupTitleStyle.color;
	style.fontSize = `${parseInt(data.cell.groupTitleStyle.fontSize) * 2}rpx`;
	style.bold = data.cell.groupTitleStyle.bold ? 700 : 400;
	return style;
});

const borderStyle = computed((): CSSProperties => {
	let style = {};
	style.margin = '0 32rpx';
	style = Object.assign(style, data.cell.customStyle);
	return style;
});

function click(item: any) {
	emit('click', item);
}

const { cell } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.dz-cell {
	overflow: hidden;
}
</style>

<template>
  <div :style="gapStyle"></div>
</template>

<script lang="ts" setup>
  import type { CSSProperties } from 'vue';
  import { computed } from 'vue';

  const props = defineProps({
    bgColor: {
      type: String,
      default: 'transparent ', // 背景透明
    },
    // 高度
    height: {
      type: [String, Number],
      default: 15,
    },
    // 与上一个组件的距离
    marginTop: {
      type: [String, Number],
      default: 0,
    },
    // 与下一个组件的距离
    marginBottom: {
      type: [String, Number],
      default: 0,
    },
  });

  const gapStyle = computed((): CSSProperties => {
    return {
      backgroundColor: props.bgColor,
      height: props.height + 'rpx',
      marginTop: props.marginTop + 'rpx',
      marginBottom: props.marginBottom + 'rpx',
    };
  });
</script>

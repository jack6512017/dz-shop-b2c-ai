<template>
  <view
    class="dz-row"
    :style="{
      alignItems: mAlignItem,
      justifyContent: mJustify,
    }"
    @tap="click"
  >
    <slot></slot>
  </view>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  /**
   * row 行布局
   * @description 通过基础的 12 分栏，迅速简便地创建布局。
   * @property {String Number} gutter 栅格间隔，左右各为此值的一半，单位rpx（默认0）
   * @property {String} justify 水平排列方式(微信小程序暂不支持)默认（start(或flex-start)）
   * @property {String} align 垂直排列方式（默认center）
   * @example <dz-row gutter="16"></dz-row>
   */

  const props = defineProps({
    // 水平排列方式，可选值为`start`(或`flex-start`)、`end`(或`flex-end`)、`center`、`around`(或`space-around`)、`between`(或`space-between`)
    justify: {
      type: String,
      default: 'start',
    },
    // 垂直对齐方式，可选值为top、center、bottom
    align: {
      type: String,
      default: 'center',
    },
    // 是否阻止事件传播
    stop: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits(['click']);
  const mJustify = computed(() => {
    if (props.justify == 'end' || props.justify == 'start')
      return 'flex-' + props.justify;
    else if (props.justify == 'around' || props.justify == 'between')
      return 'space-' + props.justify;
    else return props.justify;
  });

  const mAlignItem = computed(() => {
    if (props.align == 'top') return 'flex-start';
    if (props.align == 'bottom') return 'flex-end';
    else return props.align;
  });

  function click() {
    emit('click');
  }
</script>

<style lang="scss">
  @import '../libs/css/components';

  .dz-row {
    // 由于微信小程序编译后奇怪的页面结构，只能使用float布局实现，flex无法实现
    /* #ifndef MP-WEIXIN || MP-QQ || MP-TOUTIAO */
    @include flex;
    /* #endif */
    flex-wrap: wrap;
  }

  .dz-row:after {
    /* #ifdef MP-WEIXIN || MP-QQ || MP-TOUTIAO */
    display: table;
    clear: both;
    content: '';
    /* #endif */
  }
</style>

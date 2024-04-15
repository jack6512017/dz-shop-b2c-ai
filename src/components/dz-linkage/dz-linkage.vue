<template>
  <view class="dz-linkage-class"><slot></slot></view>
</template>

<script lang="ts" setup>
  //分类菜单左右联动，一般用于商品分类
  import { ref, watch, onMounted, getCurrentInstance } from 'vue';

  const props = defineProps({
    scrollTop: {
      type: Number,
    },
    recalc: {
      type: Number,
      default: 0,
    },
    //px
    distanceTop: {
      type: Number,
      default: 0,
    },
    //列表中的索引值
    index: {
      type: [Number, String],
      default: 0,
    },
  });

  const emit = defineEmits(['linkage']);
  const proxy = getCurrentInstance()?.proxy ?? null;
  const timer = ref();
  const top = ref<number>(0);
  const height = ref<number>(0);
  //重新初始化
  const initialize = ref<number>(props.recalc);

  watch(
    () => props.scrollTop,
    () => {
      if (initialize.value != 0) {
        updateScrollChange(() => {
          updateStickyChange();
          initialize.value = 0;
        });
      } else {
        updateStickyChange();
      }
    },
  );

  watch(
    () => props.recalc,
    () => {
      updateScrollChange(() => {
        updateStickyChange();
        initialize.value = 0;
      });
    },
  );

  onMounted(() => {
    setTimeout(() => {
      updateScrollChange();
    }, 20);
  });

  function updateStickyChange() {
    const _top = top.value;
    const _height = height.value;
    const _scrollTop = props.scrollTop;
    let linkage =
      _scrollTop + props.distanceTop >= _top &&
      _scrollTop + props.distanceTop < _top + _height
        ? true
        : false;
    if (linkage) {
      emit('linkage', {
        isLinkage: linkage,
        index: props.index,
      });
    }
  }

  function updateScrollChange(callback) {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = null;
    }
    timer.value = setTimeout(() => {
      const className = '.dz-linkage-class';
      const query = uni.createSelectorQuery().in(proxy);
      query
        .select(className)
        .boundingClientRect(res => {
          if (res) {
            top.value = res.top + (props.scrollTop || 0);
            height.value = res.height;
            callback && callback();
          }
        })
        .exec();
    }, 0);
  }
</script>

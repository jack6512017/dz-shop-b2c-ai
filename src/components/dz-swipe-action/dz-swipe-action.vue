<template>
  <view class="dz-swipeout-wrap">
    <view
      class="dz-swipeout-item"
      :class="[isShowBtn ? 'swipe-action-show' : '']"
      @touchstart="handlerTouchstart"
      @touchmove="handlerTouchmove"
      @touchend="handlerTouchend"
      :style="{ transform: 'translate(' + position.pageX + 'px,0)' }"
    >
      <view class="dz-swipeout-content"><slot name="content"></slot></view>
      <view
        class="dz-swipeout-button-right-group"
        v-if="actions.length > 0"
        @touchend.stop="loop"
      >
        <view
          class="dz-swipeout-button-right-item"
          v-for="(item, index) in actions"
          :key="index"
          :style="{
            backgroundColor: item.background || '#f7f7f7',
            color: item.color,
            width: item.width + 'px',
          }"
          :data-index="index"
          @tap="handlerButton"
        >
          <image
            :src="item.icon"
            v-if="item.icon"
            :style="{ width: px(item.imgWidth), height: px(item.imgHeight) }"
          ></image>
          <text :style="{ fontSize: px(item.fontsize) }">{{ item.name }}</text>
        </view>
      </view>
      <!--actions长度设置为0，可直接传按钮进来-->
      <view
        class="dz-swipeout-button-right-group"
        @touchend.stop="loop"
        @tap="handlerParentButton"
        v-if="actions.length === 0"
        :style="{
          width: operateWidth + 'px',
          right: '-' + operateWidth + 'px',
        }"
      >
        <slot name="button"></slot>
      </view>
    </view>
    <view
      v-if="isShowBtn && showMask"
      class="swipe-action_mask"
      @tap.stop="closeButtonGroup"
      @touchstart.stop.prevent="closeButtonGroup"
    />
  </view>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, onMounted } from 'vue';

  const props = defineProps({
    // index值，用于得知点击删除的是哪个按钮
    index: {
      type: [Number, String],
      default: '',
    },
    // name: '删除',
    // color: '#fff',
    // fontsize: 32,//单位rpx
    // width: 80, //单位px
    // icon: 'like.png',//此处为图片地址
    // background: '#ed3f14'
    actions: {
      type: Array,
      default() {
        return [];
      },
    },
    //点击按钮时是否自动关闭
    closable: {
      type: Boolean,
      default: true,
    },
    //设为false，可以滑动多行不关闭菜单
    showMask: {
      type: Boolean,
      default: true,
    },
    operateWidth: {
      type: Number,
      default: 80,
    },
    params: {
      type: Object,
      default() {
        return {};
      },
    },
    //禁止滑动
    forbid: {
      type: Boolean,
      default: false,
    },
    //手动开关
    open: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['click']);

  //start position
  const tStart = reactive({
    pageX: 0,
    pageY: 0,
  });
  //限制滑动距离
  const limitMove = ref<number>(0);

  //move position

  const position = reactive({
    pageX: 0,
    pageY: 0,
  });

  const isShowBtn = ref<boolean>(false);
  watch(
    () => props.actions,
    () => {
      updateButtonSize();
    },
  );

  watch(
    () => props.open,
    newValue => {
      manualSwitch(newValue);
    },
  );
  onMounted(() => {
    updateButtonSize();
  });

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2)
      ? x1 - x2 > 0
        ? 'Left'
        : 'Right'
      : y1 - y2 > 0
      ? 'Up'
      : 'Down';
  }
  //阻止事件冒泡
  function loop() {}
  function updateButtonSize() {
    const _actions = props.actions;
    if (_actions.length > 0) {
      let limitMovePosition = 0;
      _actions.forEach(item => {
        limitMovePosition += item.width || 0;
      });
      limitMove.value = limitMovePosition;
    } else {
      limitMove.value = props.operateWidth;
    }
  }

  function handlerTouchstart(event) {
    if (props.forbid) return;
    const touches = event.touches ? event.touches[0] : {};
    const start = tStart;
    if (touches) {
      for (let i in start) {
        if (touches[i]) {
          start[i] = touches[i];
        }
      }
    }
  }

  function swipper(touches) {
    const start = tStart;
    const spacing = {
      pageX: touches.pageX - start.pageX,
      pageY: touches.pageY - start.pageY,
    };
    if (limitMove.value < Math.abs(spacing.pageX)) {
      spacing.pageX = -limitMove.value;
    }
    position.pageX = spacing.pageX;
    position.pageY = spacing.pageY;
  }

  function handlerTouchmove(event) {
    if (props.forbid) return;
    const start = tStart;
    const touches = event.touches ? event.touches[0] : {};
    if (touches) {
      const direction = swipeDirection(
        start.pageX,
        touches.pageX,
        start.pageY,
        touches.pageY,
      );
      if (
        direction === 'Left' &&
        Math.abs(position.pageX) !== limitMove.value
      ) {
        swipper(touches);
      }
    }
  }

  function handlerTouchend(event: Event) {
    if (props.forbid) return;
    const start = tStart;
    const touches = event.changedTouches ? event.changedTouches[0] : {};
    if (touches) {
      const direction = swipeDirection(
        start.pageX,
        touches.pageX,
        start.pageY,
        touches.pageY,
      );
      const spacing = {
        pageX: touches.pageX - start.pageX,
        pageY: touches.pageY - start.pageY,
      };
      if (Math.abs(spacing.pageX) >= 40 && direction === 'Left') {
        spacing.pageX = spacing.pageX < 0 ? -limitMove.value : limitMove.value;
        isShowBtn.value = true;
      } else {
        spacing.pageX = 0;
      }
      position.pageX = spacing.pageX;
      position.pageY = spacing.pageY;
    }
  }

  function handlerButton(event: Event) {
    if (props.closable) {
      closeButtonGroup();
    }
    const dataset = event.currentTarget.dataset;
    emit('click', props.index, Number(dataset.index));
  }

  function closeButtonGroup() {
    position.pageX = 0;
    position.pageY = 0;
    isShowBtn.value = false;
  }

  //控制自定义按钮菜单
  function handlerParentButton() {
    if (props.closable) {
      closeButtonGroup();
    }
  }

  function manualSwitch(isOpen) {
    let x = 0;
    if (isOpen) {
      if (props.actions.length === 0) {
        x = props.operateWidth;
      } else {
        let width = 0;
        props.actions.forEach(item => {
          width += item.width;
        });
        x = width;
      }
    }
    position.pageX = -x;
    position.pageY = 0;
  }

  function px(num) {
    return uni.upx2px(num) + 'px';
  }
</script>

<style scoped>
  .dz-swipeout-wrap {
    position: relative;
    overflow: hidden;
  }

  .swipe-action-show {
    position: relative;
    z-index: 998;
  }

  .dz-swipeout-item {
    width: 100%;
    /* padding: 15px 20px; */
    box-sizing: border-box;
    transition: transform 0.2s ease;
    font-size: 14px;
  }

  .dz-swipeout-content {
    white-space: nowrap;
    overflow: hidden;
  }

  .dz-swipeout-button-right-group {
    position: absolute;
    right: -100%;
    top: 0;
    height: 100%;
    z-index: 1;
    width: 100%;
  }

  .dz-swipeout-button-right-item {
    height: 100%;
    float: left;
    white-space: nowrap;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .swipe-action_mask {
    display: block;
    opacity: 0;
    position: fixed;
    z-index: 997;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

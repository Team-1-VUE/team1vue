<template>
  <div class="tooltip-container">
    <div
      class="tooltip-trigger"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <slot />
    </div>

    <transition name="tooltip">
      <div
        v-if="showTooltip"
        class="tooltip"
        :class="`tooltip--${position}`"
      >
        {{ content }}
        <div class="tooltip-arrow" :class="`tooltip-arrow--${position}`"></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top'
})

const showTooltip = ref(false)
</script>

<style scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-trigger {
  cursor: help;
}

/* Tooltip base styles */
.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
  opacity: 1;
  pointer-events: none;
}

/* Tooltip positions */
.tooltip--top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
}

.tooltip--bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
}

.tooltip--left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
}

.tooltip--right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
}

/* Arrow styles */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.tooltip-arrow--top {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0 6px;
  border-color: rgba(0, 0, 0, 0.4) transparent transparent transparent;
}

.tooltip-arrow--bottom {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 6px 6px 6px;
  border-color: transparent transparent rgba(0, 0, 0, 0.4) transparent;
}

.tooltip-arrow--left {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 0 6px 6px;
  border-color: transparent transparent transparent rgba(0, 0, 0, 0.4);
}

.tooltip-arrow--right {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-width: 6px 6px 6px 0;
  border-color: transparent rgba(0, 0, 0, 0.4) transparent transparent;
}

/* Transition animations */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: all 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}

.tooltip-enter-from.tooltip--bottom,
.tooltip-leave-to.tooltip--bottom {
  transform: translateX(-50%) translateY(4px);
}

.tooltip-enter-from.tooltip--left,
.tooltip-leave-to.tooltip--left {
  transform: translateY(-50%) translateX(-4px);
}

.tooltip-enter-from.tooltip--right,
.tooltip-leave-to.tooltip--right {
  transform: translateY(-50%) translateX(4px);
}
</style>
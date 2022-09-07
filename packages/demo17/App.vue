<template>
  <div class="home">
    <div v-show="loading" class="loading">加载中。。。</div>
    <div class="canvas-wrap" ref="canvasWrapRef"></div>
    <div class="views">
      <h1>汽车展示与选配</h1>
      <h2>选择车身颜色</h2>
      <div class="body-color color-views"><input v-model="colors.body" type="color" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import useThreeJs from './three';

const canvasWrapRef = ref<HTMLDivElement>();
const { loading, renderer, render, model } = useThreeJs();
const colors = reactive({
  body: 'red',
});

watch(loading, () => {
  const m = model.value;
  colors.body = '#' + m.body.material.color.getHexString();
});

watch(colors, (c) => {
  if (loading.value) return;
  const m = model.value;
  m.body.material.color.setStyle(c.body);
});

onMounted(async () => {
  canvasWrapRef.value.appendChild(renderer.domElement);
  render();
});
</script>
<style lang="scss">
.loading {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 1.2em;
  text-align: center;
  font-size: 20px;
}
.views {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: 500px;
  text-align: center;
  color: white;
  user-select: none;
}
</style>

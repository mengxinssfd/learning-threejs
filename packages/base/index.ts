import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 创建场景
const scene = new THREE.Scene();

// 添加坐标轴辅助器 用于简单模拟3个坐标轴的对象.红色代表 X 轴. 绿色代表 Y 轴. 蓝色代表 Z 轴.
scene.add(new THREE.AxesHelper(3));

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 5;
camera.position.set(0, 0, 10);

// new一个renderer并生成一个canvas，也可以使用现有的canvas
const renderer = new THREE.WebGLRenderer();
// 设置canvas大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 挂载canvas到body节点上
document.body.appendChild(renderer.domElement);

// 使用渲染器将场景和摄像机渲染出来
renderer.render(scene, camera);

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 将其设置为true以启用阻尼（惯性），这将给控制器带来重量感
controls.enableDamping = true;

// 浏览器窗口大小改变时更新摄像机和渲染器
window.addEventListener('resize', () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像头的投影矩阵
  camera.updateProjectionMatrix();

  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio);
});

// 进入/退出全屏
if (document.fullscreenEnabled) {
  window.addEventListener('dblclick', () => {
    document.fullscreenElement === renderer.domElement
      ? document.exitFullscreen()
      : renderer.domElement.requestFullscreen();
  });
}

export { renderer, camera, scene, controls };

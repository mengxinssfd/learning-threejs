import * as THREE from 'three';
import { renderer, scene, camera, cube } from '../../demo1/src/share';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const clock = new THREE.Clock();

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);
function animate() {
  // 获取自时钟开始以来经过的秒数
  const t = clock.getElapsedTime();

  cube.rotation.x = t;
  cube.position.x = t % 3;

  console.log('时间运行总时长：', t);
  console.log('调用间隔：', clock.getDelta());
  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

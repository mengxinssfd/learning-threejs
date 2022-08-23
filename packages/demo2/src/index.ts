import { renderer, scene, camera } from '../../demo1/src/share';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// fixme 暂时不起作用
controls.keys = {
  LEFT: 'ArrowLeft', //left arrow
  UP: 'ArrowUp', // up arrow
  RIGHT: 'ArrowRight', // right arrow
  BOTTOM: 'ArrowDown', // down arrow
};

// 将其设置为true以启用阻尼（惯性），这将给控制器带来重量感
controls.enableDamping = true;

// 开启自动旋转
controls.autoRotate = true;

function animate() {
  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
document.addEventListener('keydown', (e) => {
  console.log(e.key);
  if (e.key === 'Enter') {
    controls.reset();
  }
});

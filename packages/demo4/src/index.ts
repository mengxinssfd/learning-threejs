import { renderer, scene, camera, cube } from '../../demo1/src/share';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

gsap.to(cube.position, {
  x: 3,
  duration: 3,
  ease: 'power2.inOut',
  onComplete() {
    console.log('动画完成');
  },
  onStart() {
    console.log('动画开始');
  },
});

const ani = gsap.to(cube.rotation, {
  x: 2 * Math.PI,
  duration: 3,
  ease: 'power2.inOut',
  // -1为无限循环,无限循环不会触发完成回调
  repeat: -1,
  // 往返
  yoyo: true,
});
addEventListener('click', () => {
  ani.isActive() ? ani.pause() : ani.play();
});
function animate() {
  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

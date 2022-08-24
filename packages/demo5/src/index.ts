import { renderer, scene, camera, cube } from '../../demo1/src/share';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import gsap from 'gsap';

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

const gui = new dat.GUI();

// 设置cube x值
gui
  .add(cube.position, 'x')
  .min(0)
  .max(3)
  .step(0.01)
  .name('设置x值')
  .onChange((value) => {
    console.log('value change:', value);
  })
  .onFinishChange((value) => {
    console.log('value changed:', value);
  });

// 设置cube颜色值
const obj = {
  color: '#ffffff',
  animate() {
    gsap.to(cube.position, { x: 3, duration: 3, yoyo: true, repeat: -1 });
  },
};
gui.addColor(obj, 'color').onFinishChange((value) => {
  cube.material.color.set(value);
});

// 设置显示隐藏
gui.add(cube, 'visible').name('显示');

// 点击添加动画
gui.add(obj, 'animate').name('点击添加动画');

const folder = gui.addFolder('设置立方体');
folder.add(cube.material, 'wireframe').name('透视');

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

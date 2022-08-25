import { camera, renderer, scene } from '../../demo1/src/share';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 创建一个几何体
const createGeometry = (array: number[], itemSize: number, color: string) => {
  const geometry = new THREE.BufferGeometry();

  // 3个一组
  const vertices = new Float32Array(array);

  // 指定3个一组
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, itemSize));

  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });

  return new THREE.Mesh(geometry, material);
};

// 创建一个正方形
const addSquare = () => {
  const mesh = createGeometry(
    // 3个一组
    [...[-1, -1, 1], ...[1, -1, 1], ...[1, 1, 1], ...[1, 1, 1], ...[-1, 1, 1], ...[-1, -1, 1]],
    // 指定3个一组
    3,
    '#382737',
  );

  mesh.position.set(3, 0, 0);
  scene.add(mesh);
};

addSquare();

// 添加50个随机三角形
const addRandomTriangle = () => {
  for (let i = 0; i < 50; i++) {
    const arr: number[] = [];
    for (let j = 0; j < 9; j++) {
      arr.push(Math.random() * 6 - 3);
    }
    const g = createGeometry(arr, 3, '#' + (~~(Math.random() * 0xffffff)).toString(16));
    g.position.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    scene.add(g);
  }
};
addRandomTriangle();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

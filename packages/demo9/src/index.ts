import { camera, renderer, scene, controls } from '../../base';
import * as THREE from 'three';

// 导入纹理
const texture = new THREE.CubeTextureLoader()
  .setPath('/assets/images/Bridge2/')
  .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);

// 给场景添加背景
scene.background = texture;
// 给场景添加环境
// 若该值不为null，则该纹理贴图将会被设为场景中所有物理材质的环境贴图。
// 然而，该属性不能够覆盖已存在的、已分配给 MeshStandardMaterial.envMap 的贴图。默认为null。
scene.environment = texture;

// 几何体
const geometry = new THREE.SphereBufferGeometry(1, 20, 20);
// 材质 MeshStandardMaterial必须添加光照，否则会是黑色的
const material = new THREE.MeshStandardMaterial({
  // envMap: texture, // 默认为scene.environment
  metalness: 1,
  roughness: 0.001,
});
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

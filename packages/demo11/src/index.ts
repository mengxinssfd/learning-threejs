import { camera, renderer, scene, controls } from '../../base';
import * as THREE from 'three';
import dat from 'dat.gui';

// 球体
const sphereGeometry = new THREE.SphereBufferGeometry();
const sphereMaterial = new THREE.MeshStandardMaterial({});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// 底部平面
const planeGeometry = new THREE.PlaneGeometry(5, 5);
const planeMaterial = new THREE.MeshStandardMaterial();
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 环境光
const ambientLight = new THREE.AmbientLight();
ambientLight.intensity = 0.2;
scene.add(ambientLight);

// 平行光
const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
// 光辅助线
scene.add(new THREE.DirectionalLightHelper(directionalLight, 5));

// 开启阴影条件
// 1、材质要满足对光照有反应
// 2、设置renderer开启对阴影的计算
renderer.shadowMap.enabled = true;
// 3、设置光照投射阴影
directionalLight.castShadow = true;
// 4、设置物体投射阴影
sphere.castShadow = true;
// 5、设置物体接收阴影
plane.receiveShadow = true;

// 通过gui设置属性
const gui = new dat.GUI();
const lightGui = gui.addFolder('light shadow');
lightGui.open();
lightGui.add(directionalLight.shadow, 'radius', 0, 50);
directionalLight.shadow.mapSize.set(4096, 4096);
// dat.gui调节不对，变成位置偏移了
lightGui.add(directionalLight.shadow.mapSize, 'x', 0, 5000).name('mapSize.x');
lightGui.add(directionalLight.shadow.mapSize, 'y', 0, 5000).name('mapSize.y');

// 设置相机位置
camera.position.set(3, 5, -2);

// 设置平行光相机的属性 没看出什么区别
// directionalLight.shadow.camera.near = 0.5;
// directionalLight.shadow.camera.far = 500;
// directionalLight.shadow.camera.top = 5;
// directionalLight.shadow.camera.bottom = -5;
// directionalLight.shadow.camera.left = -5;
// directionalLight.shadow.camera.right = 5;

// 只有这个能看出区别
lightGui.add(directionalLight.shadow.camera, 'near', 0, 20).onChange(() => {
  directionalLight.shadow.camera.updateProjectionMatrix();
});
// lightGui.add(directionalLight.shadow.camera, 'far', -1000, 1000);
// lightGui.add(directionalLight.shadow.camera, 'top', -1000, 1000);
// lightGui.add(directionalLight.shadow.camera, 'bottom', -1000, 1000);
// lightGui.add(directionalLight.shadow.camera, 'left', -1000, 1000);
// lightGui.add(directionalLight.shadow.camera, 'left', -1000, 1000);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

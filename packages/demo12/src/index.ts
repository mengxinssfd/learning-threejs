import { camera, renderer, scene, controls } from '../../base';
import * as THREE from 'three';
import dat from 'dat.gui';

// 球体
const sphereGeometry = new THREE.SphereBufferGeometry();
const sphereMaterial = new THREE.MeshStandardMaterial({});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// 底部平面
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshStandardMaterial();
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 环境光
const ambientLight = new THREE.AmbientLight();
ambientLight.intensity = 0.2;
scene.add(ambientLight);

// 聚光灯
const spotLight = new THREE.SpotLight();
spotLight.position.set(5, 5, 5);
scene.add(spotLight);
const spotLightHelper = new THREE.SpotLightHelper(spotLight, 'red');
// 光辅助线
scene.add(spotLightHelper);

// 开启阴影条件
// 1、材质要满足对光照有反应
// 2、设置renderer开启对阴影的计算
renderer.shadowMap.enabled = true;
// 3、设置光照投射阴影
spotLight.castShadow = true;
// 4、设置物体投射阴影
sphere.castShadow = true;
// 5、设置物体接收阴影
plane.receiveShadow = true;

// 通过gui设置属性
const gui = new dat.GUI();

const lightGui = gui.addFolder('light');
lightGui.open();
lightGui.add(spotLight.shadow, 'radius', 0, 50).name('shadow radius');
lightGui.add(spotLight, 'distance', 0, 100);
lightGui.add(spotLight, 'penumbra', 0, 1);
lightGui.add(spotLight, 'angle', 0, Math.PI);
lightGui.add(spotLight, 'decay', 0, 10);
lightGui.add(spotLight, 'intensity', 0, 100);

const spGui = gui.addFolder('sphere.position');
spGui.open();
spGui.add(sphere.position, 'x', -50, 50);
spGui.add(sphere.position, 'y', 0, 150);
spGui.add(sphere.position, 'z', -50, 50);

const params = {
  lightLookAt: false,
  cameraLookAt: false,
};

// 原点
const origin = new THREE.Object3D();
origin.position.set(0, 0, 0);

// 灯光跟随
gui.add(params, 'lightLookAt').onChange((value) => {
  spotLight.target = value ? sphere : origin;
});
// 摄像机跟随
gui.add(params, 'cameraLookAt').onChange((value) => {
  controls.target = value ? sphere.position : origin.position;
});

// 设置相机位置
camera.position.set(3, 10, 50);

// renderer.physicallyCorrectLights = true;
function animate() {
  controls.update();
  spotLightHelper.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

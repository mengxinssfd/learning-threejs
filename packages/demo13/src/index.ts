import { camera, renderer, scene, controls } from '../../base';
import * as THREE from 'three';
import dat from 'dat.gui';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

// 球体
const sphereGeometry = new THREE.SphereBufferGeometry();
const sphereMaterial = new THREE.MeshStandardMaterial({});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// 球体2
const sphere2 = sphere.clone();
sphere2.position.set(8, 8, 8);
scene.add(sphere2);

// 点光
const pointLight = new THREE.PointLight('#473deb', 1.5, 2000);
// const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
// scene.add(pointLightHelper);
pointLight.castShadow = true;
scene.add(pointLight);
// pointLight.color.setHSL(0.55, 0.9, 0.5);

pointLight.position.set(5, 5, 5);

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

// 开启阴影条件
// 1、材质要满足对光照有反应
// 2、设置renderer开启对阴影的计算
renderer.shadowMap.enabled = true;
// 3、设置光照投射阴影
// spotLight.castShadow = true;
// 4、设置物体投射阴影
sphere.castShadow = true;
// 5、设置物体接收阴影
plane.receiveShadow = true;

// 通过gui设置属性
const gui = new dat.GUI();

const spGui = gui.addFolder('sphere.position');
spGui.open();
spGui.add(sphere.position, 'x', -50, 50);
spGui.add(sphere.position, 'y', 0, 150);
spGui.add(sphere.position, 'z', -50, 50);

const lightGui = gui.addFolder('light');
lightGui.open();
lightGui.add(pointLight.shadow, 'radius', 0, 50).name('shadow radius');
lightGui.add(pointLight, 'distance', 0, 10000);
lightGui.add(pointLight, 'decay', 0, 10);
lightGui.add(pointLight, 'power', 0, 100);

const params = {
  lightLookAt: false,
  cameraLookAt: false,
  color: '#473deb',
  animate: {
    enabled: true,
    speed: 0.01,
  },
};
// animation gui
const aniGui = gui.addFolder('animate');
aniGui.open();
aniGui.add(params.animate, 'enabled');
aniGui.add(params.animate, 'speed', 0.001, 0.1);

lightGui.addColor(params, 'color').onChange((value) => {
  pointLight.color.set(value);
});

// 原点
const origin = new THREE.Object3D();
origin.position.set(0, 0, 0);

// 摄像机跟随
gui.add(params, 'cameraLookAt').onChange((value) => {
  controls.target = value ? sphere.position : origin.position;
});

// 设置相机位置
camera.position.set(3, 10, 10);

scene.add(new THREE.AmbientLight('white', 0.1));

// scene.background = new THREE.Color().setHSL(0.51, 0.4, 0.01);
// scene.fog = new THREE.Fog(scene.background, 3500, 15000);

// lensflares 镜头光晕
const textureLoader = new THREE.TextureLoader();

const textureFlare0 = textureLoader.load('/assets/images/lensflare/lensflare0.png');
const textureFlare3 = textureLoader.load('/assets/images/lensflare/lensflare3.png');
const lensflare = new Lensflare();
// 光源处
lensflare.addElement(new LensflareElement(textureFlare0, 700, 0, pointLight.color));
// 60%
lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
// 70%
lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
// 90%
lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
// 100%
lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
pointLight.add(lensflare);

// renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.physicallyCorrectLights = true;
// const clock = new THREE.Clock();
let time = 0;
function animate() {
  if (params.animate.enabled) {
    // const time = clock.getDelta();
    time += params.animate.speed;
    // 圆周运动
    pointLight.position.x = Math.sin(time) * 3;
    pointLight.position.z = Math.cos(time) * 3;
    // 上下运动
    pointLight.position.y = 5 + Math.sin(time * 3) * 3;

    // 圆周运动
    // sphere2.position.x = Math.sin(time) * 5;
    sphere2.position.z = Math.cos(time) * 5;
    // 上下运动
    // sphere2.position.y = 7 + Math.sin(time) * 5;
  }
  // pointLightHelper.update();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

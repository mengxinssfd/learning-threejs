import { init } from '../../base/base';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const { camera, renderer, scene, controls } = init({
  renderer: new THREE.WebGLRenderer({
    alpha: true, // 默认为false，false时整个canvas是黑色背景，否则为透明背景
  }),
});
// 编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 摄像机位置
camera.position.set(19, 20, 100);

// 资源加载管理器
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
  console.log(url, loaded, total);
};

// assets文件夹
const assetsDir = '/packages/demo15/assets/';

// 纹理加载器
const textureLoader = new THREE.TextureLoader(loadingManager);
textureLoader.setPath(assetsDir);

const EARTH_RADIUS = 20;
const MOON_RADIUS = 5;

// 创建地球
function createEarth() {
  const sphereGeometry = new THREE.SphereBufferGeometry(EARTH_RADIUS, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    // 光泽度
    shininess: 5,
    // 贴图
    map: textureLoader.load('textures/planets/earth_atmos_2048.jpg'),
    // 高光贴图
    specularMap: textureLoader.load('textures/planets/earth_specular_2048.jpg'),
    // 法线贴图
    normalMap: textureLoader.load('textures/planets/earth_normal_2048.jpg'),
    // 光照贴图
    lightMap: textureLoader.load('textures/planets/earth_lights_2048.png'),
  });
  const sphere = new THREE.Mesh(sphereGeometry, material);
  scene.add(sphere);
  return sphere;
}

// 创建月亮
function createMoon() {
  const sphereGeometry = new THREE.SphereBufferGeometry(MOON_RADIUS, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    map: textureLoader.load('textures/planets/moon_1024.jpg'),
  });
  const sphere = new THREE.Mesh(sphereGeometry, material);
  sphere.position.set(0, 0, 50);
  scene.add(sphere);
  return sphere;
}

// 添加聚光灯光源
function createLight() {
  const light = new THREE.SpotLight();
  light.position.set(0, 0, 100);
  // const helper = new THREE.SpotLightHelper(light);
  // scene.add(helper);
  scene.add(light);
  return light;
}

// 左上角帧数显示
function createFrameStatus() {
  const stat = Stats();
  stat.domElement.style.position = 'absolute';
  stat.domElement.style.right = '0px';
  stat.domElement.style.top = '0px';
  document.body.appendChild(stat.domElement);
  return stat;
}

const light = createLight();
const stat = createFrameStatus();
const earth = createEarth();
const moon = createMoon();

function showShadow() {
  // 开启阴影
  renderer.shadowMap.enabled = true;
  light.castShadow = true;
  earth.castShadow = true;
  earth.receiveShadow = true;
  moon.castShadow = true;
}

function renderLabel() {
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  document.body.appendChild(labelRenderer.domElement);

  new OrbitControls(camera, labelRenderer.domElement);

  window.addEventListener('resize', () => {
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  const earthDiv = document.createElement('div');
  earthDiv.className = 'label';
  earthDiv.textContent = 'Earth';
  const earthLabel = new CSS2DObject(earthDiv);
  earthLabel.position.set(0, EARTH_RADIUS, 0);
  earth.add(earthLabel);

  const moonDiv = earthDiv.cloneNode(true) as HTMLDivElement;
  moonDiv.textContent = 'Moon';
  const moonLabel = new CSS2DObject(moonDiv);
  moonLabel.position.set(0, MOON_RADIUS, 0);
  moon.add(moonLabel);
  return labelRenderer;
}

function setup() {
  showShadow();

  const labelRenderer = renderLabel();

  let times = 1;
  const axis = new THREE.Vector3(0, 1, 0);
  function animate() {
    requestAnimationFrame(animate);
    stat.begin();

    moon.position.x = Math.sin(times - 1) * 50;
    moon.position.z = Math.cos(times - 1) * 50;

    // 沿轴转
    moon.rotateOnAxis(axis, 0.01);
    earth.rotateOnAxis(axis, 0.001);

    times += 0.01;
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    stat.end();
  }
  animate();
}

setup();

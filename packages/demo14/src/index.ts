import { camera, renderer, scene, controls } from './base';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water2';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// 编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 摄像机位置
camera.position.set(19, 122, 186);

// 资源加载管理器
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
  console.log(url, loaded, total);
};

// assets文件夹
const assetsDir = '/packages/demo14/assets/';

// 纹理加载器
const textureLoader = new THREE.TextureLoader(loadingManager);
textureLoader.setPath(assetsDir);

// 天空盒
function createSky() {
  const skyGeometry = new THREE.SphereBufferGeometry(1000, 60, 60);
  const skyMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/sky.jpg'),
    // side: THREE.BackSide,
  });
  skyGeometry.scale(1, 1, -1);
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  // 教程的方法
  // const skyVideo = document.createElement('video');
  // skyVideo.src = '/assets/video/sky.mp4';
  // skyVideo.autoplay = true;
  // skyVideo.muted = true;
  // skyVideo.loop = true;
  //
  // window.addEventListener('mousemove', () => {
  //   if (skyVideo.paused) {
  //     skyVideo.play();
  //     skyMaterial.map = new THREE.VideoTexture(skyVideo);
  //     skyMaterial.map.needsUpdate = true;
  //   }
  // });

  const skyVideo = document.querySelector('.sky-video') as HTMLVideoElement;
  // autoplay也没用 必须调用一次play()才能加载视频纹理
  skyVideo.play();
  skyMaterial.map = new THREE.VideoTexture(skyVideo);
  skyMaterial.map.needsUpdate = true;
}

// 水面
function createWater() {
  const waterGeometry = new THREE.CircleBufferGeometry(300, 64);
  const water = new Water(waterGeometry, {
    textureWidth: 1024,
    textureHeight: 1024,
    flowDirection: new THREE.Vector2(1, 1),
    scale: 1,
    color: '#eeeeff',
    // Water2有两个纹理需要加载，否则会像镜面一样平静
    normalMap0: textureLoader.load('textures/water/Water_1_M_Normal.jpg'),
    normalMap1: textureLoader.load('textures/water/Water_2_M_Normal.jpg'),
  });
  // 翻转水面
  water.rotation.x = -Math.PI / 2;
  // 抬升水面3个单位
  water.position.y = 3;
  scene.add(water);
}

// 小岛
function createLand() {
  // 载入模型
  const gltfLoader = new GLTFLoader(loadingManager);
  const dracoLoader = new DRACOLoader(loadingManager);
  dracoLoader.setDecoderPath(assetsDir + 'draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load(assetsDir + 'model/island2.glb', (gltf) => {
    scene.add(gltf.scene);
  });

  // 添加环境纹理 否则小岛模型是黑色的
  const loader = new RGBELoader();
  loader.loadAsync(assetsDir + '/050.hdr').then((dataTexture) => {
    dataTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = dataTexture;
    scene.environment = dataTexture;
  });
}

// 添加平行光
const light = new THREE.DirectionalLight('white', 1);
light.position.set(-100, 100, 10);
scene.add(light);

function animate() {
  // pointLightHelper.update();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

createSky();
createWater();
createLand();
animate();

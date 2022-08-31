import { init } from '../../base/base';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fragmentShader from './shader/fragmentShader.glsl?raw';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const { camera, renderer, scene, controls } = init();
// 编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 摄像机位置
camera.position.set(11, 2, 2);

// 资源加载管理器
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
  console.log(url, loaded, total);
};

// assets文件夹
const assetsDir = '/packages/demo16/assets/';

// 纹理加载器
const textureLoader = new THREE.TextureLoader(loadingManager);
textureLoader.setPath(assetsDir);

// 添加聚光灯光源
function createLight() {
  const light = new THREE.DirectionalLight();
  light.position.set(0, 10, 5);
  scene.add(new THREE.SpotLightHelper(light));
  scene.add(light);

  const light2 = new THREE.DirectionalLight();
  light2.position.set(0, 10, -5);
  scene.add(new THREE.SpotLightHelper(light2));
  scene.add(light2);

  return [light, light2];
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

createLight();
const stat = createFrameStatus();

function showShadow() {
  // 开启阴影
  // renderer.shadowMap.enabled = true;
  // light.castShadow = true;
}

// 加载模型
function loadModel(): Promise<{
  ukraine: THREE.Object3D;
  russia: THREE.Object3D;
  curve: THREE.CatmullRomCurve3;
  missile: THREE.Object3D;
}> {
  const loader = new GLTFLoader(loadingManager);
  loader.setPath(assetsDir);

  return new Promise((resolve) => {
    loader.load('ew8.glb', (gltf) => {
      const [russia, ukraine, curvePath, missile] = gltf.scene.children as [
        THREE.Object3D,
        THREE.Object3D,
        THREE.Line<any>,
        THREE.Object3D,
      ];

      // 根据曲线点创建曲线
      const points: THREE.Vector3[] = [];
      const position = curvePath.geometry.attributes.position;
      const array = position.array;
      for (let i = 0; i < position.count; i++) {
        points.push(new THREE.Vector3(array[i * 3], array[i * 3 + 1], array[i * 3 + 2]));
      }
      const curve = new THREE.CatmullRomCurve3(points);

      scene.add(russia);
      scene.add(ukraine);
      // scene.add(curve);
      scene.add(missile);

      resolve({ curve, russia, ukraine, missile });
    });
  });
}

const params = {
  iTime: { value: 0 },
};
function createFire() {
  const spriteMaterial = new THREE.SpriteMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  // scene.add(sprite);

  // 着色器
  spriteMaterial.onBeforeCompile = function (shader) {
    // 设置vUv
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\n  varying vec2 vUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n  vUv = uv;');

    // 替换片元着色器
    shader.fragmentShader = fragmentShader;

    //
    shader.uniforms.iResolution = {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    };
    shader.uniforms.iTime = params.iTime;
    shader.uniforms.iMouse = { value: new THREE.Vector2(0, 0) };
    shader.uniforms.iChannel0 = { value: textureLoader.load('iChannel0.png') };
    shader.uniforms.iChannel1 = { value: textureLoader.load('iChannel1.png') };
    shader.uniforms.iChannel2 = { value: textureLoader.load('iChannel2.png') };
  };
  return sprite;
}

function createAudio() {
  const listener = new THREE.AudioListener();
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader(loadingManager);
  audioLoader.setPath(assetsDir);
  audioLoader.load('bomb.mp3', (audioBuffer) => {
    sound.setBuffer(audioBuffer);
  });
  return sound;
}

async function setup() {
  const sound = createAudio();
  showShadow();
  const fire = createFire();

  const l = new RGBELoader(loadingManager);
  l.setPath(assetsDir);
  l.load('kloppenheim_02_2k.hdr', (dataTexture) => {
    // 贴成环状
    dataTexture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = dataTexture;
    scene.environment = dataTexture;
  });
  addEventListener('click', () => {
    if (sound.isPlaying) sound.stop();
    sound.play();
  });

  const { curve, missile } = await loadModel();
  fire.position.copy(curve.getPointAt(0.96));

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    stat.begin();

    // 5秒循环一次
    const t = (clock.getElapsedTime() % 5) / 5;

    if (t < 0.99) {
      missile.position.copy(curve.getPointAt(t));
      missile.lookAt(curve.getPointAt(t + 0.01));
    } else {
      scene.add(fire);
      if (sound.isPlaying) sound.stop();
      sound.play();
    }
    params.iTime.value += t;
    if (t > 0.5 && t < 0.99) {
      scene.remove(fire);
    }

    controls.update();
    renderer.render(scene, camera);

    stat.end();
  }
  animate();
}

setup();

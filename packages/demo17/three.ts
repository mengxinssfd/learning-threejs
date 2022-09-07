import { init } from '../base/base';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ref } from 'vue';

const { camera, renderer, scene, controls } = init({
  AxesHelper: false,
  camera: new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100),
});
// 清空后的颜色设置为黑色
// renderer.setClearColor('#000');
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
// scene.environment = new THREE.Color('#ccc');

// 摄像机位置
camera.position.set(-5, 3, -7);
// 摄像机最远距离
controls.maxDistance = 10;
// 摄像机最近距离
controls.minDistance = 2.2;
controls.maxPolarAngle = 1.55;

scene.background = new THREE.Color(0x333333);
scene.fog = new THREE.Fog(0x333333, 10, 15);

// 资源加载管理器
const loadingManager = new THREE.LoadingManager();

// assets文件夹
const assetsDir = '/packages/demo17/assets/';

// 纹理加载器
const textureLoader = new THREE.TextureLoader(loadingManager);
textureLoader.setPath(assetsDir);

// 左上角帧数显示
function createFrameStatus() {
  const stat = Stats();
  stat.domElement.style.position = 'absolute';
  stat.domElement.style.right = '0px';
  stat.domElement.style.top = '0px';
  document.body.appendChild(stat.domElement);
  return stat;
}

const stat = createFrameStatus();

interface Models {
  wheels: [THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Mesh];
  body: THREE.Mesh;
  glass: THREE.Mesh;
  face: THREE.Mesh;
  hood: THREE.Mesh;
}

// 加载模型
function loadModel(): Promise<Models> {
  const loader = new GLTFLoader(loadingManager);
  loader.setPath(assetsDir);
  const dracoLoader = new DRACOLoader();
  loader.setDRACOLoader(dracoLoader);
  dracoLoader.setDecoderPath(assetsDir + 'draco/gltf/');

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 1.0,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    sheen: 0.5,
  });

  return new Promise((resolve) => {
    loader.load('model/ferrari.glb', (gltf) => {
      console.log(gltf.scene);

      const model = gltf.scene.children[0];

      function getModelChild(name: string): THREE.Mesh {
        return model.getObjectByName(name) as THREE.Mesh;
      }

      const shadow = textureLoader.load('model/ferrari_ao.png');
      // shadow
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
        new THREE.MeshBasicMaterial({
          map: shadow,
          blending: THREE.MultiplyBlending,
          toneMapped: false,
          transparent: true,
        }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 2;
      model.add(mesh);

      const result = {
        wheels: [
          getModelChild('wheel_fl'),
          getModelChild('wheel_fr'),
          getModelChild('wheel_rl'),
          getModelChild('wheel_rr'),
        ],
        // face: getModelChild('前脸') ,
        body: getModelChild('body'),
        // hood: getModelChild('引擎盖_1') ,
        glass: getModelChild('glass'),
      } as Models;

      result.glass.material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.25,
        roughness: 0,
        transmission: 1.0,
      });

      // const result: Awaited<ReturnType<typeof loadModel>> = { wheels: [] } as any;

      // gltf.scene.traverse((child) => {
      //   const item = child ;
      //   console.log(item);
      //   if (item.isMesh) {
      //     // 模型在数组的顺序不是固定的
      //     switch (item.name) {
      //       case 'Mesh002':
      //         result.body = item;
      //         break;
      //       case '引擎盖_1':
      //         result.hood = item;
      //         break;
      //       case '前脸':
      //         result.face = item;
      //         break;
      //       case '挡风玻璃':
      //         result.glass = item;
      //         break;
      //       default:
      //         if (item.name.includes('轮毂')) {
      //           result.wheels.push(item);
      //         }
      //     }
      //   }
      // });

      const detailsMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 1.0,
        roughness: 0.5,
      });

      getModelChild('rim_fl').material = detailsMaterial;
      getModelChild('rim_fr').material = detailsMaterial;
      getModelChild('rim_rr').material = detailsMaterial;
      getModelChild('rim_rl').material = detailsMaterial;
      getModelChild('trim').material = detailsMaterial;

      console.log(result);
      result.body.material = bodyMaterial;
      // result.face.material = bodyMaterial;
      // result.hood.material = bodyMaterial;

      scene.add(model);
      resolve(result);
    });
  });
}

/**
 * 添加网格地面
 */
function createGridFloor() {
  const grid = new THREE.GridHelper(20, 40, 0xffffff, 0xffffff);
  const material = grid.material as THREE.Material;
  material.opacity = 0.2;
  material.depthWrite = false;
  material.transparent = true;
  scene.add(grid);
  return grid;
}

export default function useThreeJs() {
  const loading = ref(true);
  loadingManager.onProgress = (url, loaded, total) => {
    console.log(url, loaded, total);
    if (loaded === total) loading.value = false;
  };

  const model = ref<Models | null>(null);
  async function setup() {
    const l = new RGBELoader(loadingManager);
    l.setPath(assetsDir);
    l.load('texture/venice_sunset_1k.hdr', (dataTexture) => {
      // 贴成环状
      // dataTexture.mapping = THREE.EquirectangularReflectionMapping;
      // scene.background = dataTexture;
      scene.environment = dataTexture;
      scene.environment.mapping = THREE.EquirectangularReflectionMapping;
    });

    model.value = await loadModel();
  }

  const grid = createGridFloor();
  // const origin = new THREE.Vector3(0, 0, 0);
  function render() {
    requestAnimationFrame(render);
    stat.begin();

    const time = -performance.now() / 1000;
    controls.update();
    renderer.render(scene, camera);
    grid.position.z = -time % 1;

    model.value?.wheels?.forEach((item) => {
      item.rotation.x = time * Math.PI * 2;
      // item.rotation.z = time * Math.PI * 2;
    });

    stat.end();
  }
  setup();

  return { loading, renderer, render, model } as const;
}

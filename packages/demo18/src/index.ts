import { init } from '../../base/base';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import dat from 'dat.gui';

const { camera, renderer, scene, controls } = init();
// 编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 摄像机位置
camera.position.set(-4, 2, 2);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.shadowMap.enabled = true;
scene.background = new THREE.Color(0xa0a0a0);
scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

// 资源加载管理器
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = (url, loaded, total) => {
  console.log(url, loaded, total);
};

// assets文件夹
// const assetsDir = '/packages/demo18/assets/';
const assetsDir = '/assets/';
//
const fbxLoader = new FBXLoader(loadingManager);
fbxLoader.setPath(assetsDir + 'models/Sword and Shield Pack/');

const gui = new dat.GUI();

function createGround() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
}

// 添加聚光灯光源
function createLight() {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemisphereLight.position.set(0, 20, 0);
  scene.add(hemisphereLight);

  const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 1);
  scene.add(hemisphereLightHelper);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, 10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = -2;
  dirLight.shadow.camera.left = -2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);

  const directionalLightHelper = new THREE.DirectionalLightHelper(dirLight);
  scene.add(directionalLightHelper);
}

// 左上角帧数显示
function createFrameStatus() {
  const stat = Stats();
  stat.domElement.style.position = 'absolute';
  stat.domElement.style.left = '0px';
  stat.domElement.style.top = '0px';
  document.body.appendChild(stat.domElement);
  return stat;
}

// 加载模型
function loadModel(): Promise<THREE.Object3D> {
  // loader.setPath(assetsDir + 'models/Nia/');
  // loader.setResourcePath(assetsDir + 'models/Nia/_textures/');

  // loader.setResourcePath(assetsDir + 'models/雷电将军/TEXTURE/');
  return new Promise((resolve) => {
    // loader.load('/_models/fbx/Seven Knights II - Nia.fbx', (object) => {
    fbxLoader.load('Paladin WProp J Nordstrom.fbx', (object) => {
      console.log(object);

      // 加载骨架，obj 为加载好后的模型
      const skeleton = new THREE.SkeletonHelper(object);
      // 设置可见性为 false
      skeleton.visible = true;
      // 添加到场景中
      scene.add(skeleton);
      gui.add(skeleton, 'visible').name('骨骼显示');

      // mixer = new THREE.AnimationMixer(object);
      // const action = mixer.clipAction(object.animations[0]);
      // action.play();

      object.traverse(function (child) {
        if ((child as any).isMesh) {
          child.castShadow = true;
          // child.receiveShadow = true;
        }
      });

      // object.scale.set(0.01, 0.01, 0.01);
      object.scale.setScalar(0.01);
      // (object as any).material.side = THREE.DoubleSide;
      scene.add(object);

      object.castShadow = true;
      resolve(object);
    });
  });
}

/**
 * 加载模型动作
 */
function loadActions(): Promise<THREE.AnimationClip[]> {
  const paths = [
    'draw sword 1.fbx',
    'draw sword 2.fbx',
    'sheath sword 1.fbx',
    'sheath sword 2.fbx',
    'sword and shield 180 turn (2).fbx',
    'sword and shield 180 turn.fbx',
    'sword and shield attack (2).fbx',
    'sword and shield attack (3).fbx',
    'sword and shield attack (4).fbx',
    'sword and shield attack.fbx',
    'sword and shield block (2).fbx',
    'sword and shield block idle.fbx',
    'sword and shield block.fbx',
    'sword and shield casting (2).fbx',
    'sword and shield casting.fbx',
    'sword and shield crouch block (2).fbx',
    'sword and shield crouch block idle.fbx',
    'sword and shield crouch block.fbx',
    'sword and shield crouch idle.fbx',
    'sword and shield crouch.fbx',
    'sword and shield crouching (2).fbx',
    'sword and shield crouching (3).fbx',
    'sword and shield crouching.fbx',
    'sword and shield death (2).fbx',
    'sword and shield death.fbx',
    'sword and shield idle (2).fbx',
    'sword and shield idle (3).fbx',
    'sword and shield idle (4).fbx',
    'sword and shield idle.fbx',
    'sword and shield impact (2).fbx',
    'sword and shield impact (3).fbx',
    'sword and shield impact.fbx',
    'sword and shield jump (2).fbx',
    'sword and shield jump.fbx',
    'sword and shield kick.fbx',
    'sword and shield power up.fbx',
    'sword and shield run (2).fbx',
    'sword and shield run.fbx',
    'sword and shield slash (2).fbx',
    'sword and shield slash (3).fbx',
    'sword and shield slash (4).fbx',
    'sword and shield slash (5).fbx',
    'sword and shield slash.fbx',
    'sword and shield strafe (2).fbx',
    'sword and shield strafe (3).fbx',
    'sword and shield strafe (4).fbx',
    'sword and shield strafe.fbx',
    'sword and shield turn (2).fbx',
    'sword and shield turn.fbx',
    'sword and shield walk (2).fbx',
    'sword and shield walk.fbx',
  ];

  function loadAction(path: string): Promise<THREE.AnimationClip> {
    return new Promise((resolve) => {
      console.log(path);
      fbxLoader.load(
        path,
        (object) => {
          const action = object.animations[0];
          action.name = path
            .replace('.fbx', '')
            .replace('sword and shield ', '')
            .replace(/\s\((\d)\)/, '$1');
          resolve(action);
        },
        undefined,
        function (e) {
          console.error('load error,', path, e);
        },
      );
    });
  }

  return Promise.all(paths.slice(-2).map(loadAction));
}

/**
 * 添加网格地面
 */
function createGridFloor() {
  const grid = new THREE.GridHelper(20, 40, 'gray');
  // const material = grid.material as THREE.Material;
  // material.opacity = 0.2;
  // material.depthWrite = false;
  // material.transparent = true;
  scene.add(grid);
  return grid;
}

async function setup() {
  const stat = createFrameStatus();
  createLight();
  createGround();
  createGridFloor();
  const model = await loadModel();

  let actions: THREE.AnimationClip[] = [];
  loadActions().then((res) => {
    actions = res;
    action = playNext();
  });
  // model.animations.push(...actions);

  let mixer: THREE.AnimationMixer;
  let actionIndex = 0;
  function playNext(): THREE.AnimationAction | null {
    if (!actions.length) return null;
    if (actionIndex >= actions.length) actionIndex = 0;
    mixer = new THREE.AnimationMixer(model);
    const act = actions[actionIndex];
    const action = mixer.clipAction(act);
    if (action.paused) {
      // action.setDuration(0);
      action.reset();
    }
    console.log(`正在播放第${actionIndex + 1}个动作: ${act.name}`);
    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopRepeat, 1);
    action.play();
    actionIndex++;
    return action;
  }
  let action: THREE.AnimationAction | null;

  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    stat.begin();
    camera.lookAt(model.position);

    const delta = clock.getDelta();
    if (mixer) {
      if (action?.paused) {
        action = playNext();
      }
      mixer.update(delta);
    }
    // console.log('position', model.position);
    controls.update();
    renderer.render(scene, camera);

    stat.end();
  }
  render();
}

setup();

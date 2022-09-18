import { init } from '../../base/pointerLock';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import dat from 'dat.gui';

const { camera, renderer, scene } = init();
// 编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 摄像机位置
camera.position.set(0, 2, -2);

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
const assetsDir = '/packages/demo20/assets/';
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
    'sword and shield idle.fbx',
    'sword and shield walk back.fbx',
    'sword and shield walk.fbx',
    'sword and shield jump.fbx',
    'sword and shield attack.fbx',
  ];

  function loadAction(path: string): Promise<THREE.AnimationClip> {
    function capitalize<S extends string>(value: S): Capitalize<S> {
      return value.replace(/^(\w)/, (v1) => v1.toLocaleUpperCase()) as any;
    }
    return new Promise((resolve) => {
      console.log(path);
      fbxLoader.load(
        path,
        (object) => {
          const action = object.animations[0];
          action.name = path
            .replace('.fbx', '')
            .replace(/sword and shield /i, '')
            .replace(/\s\((\d)\)/, '$1')
            .split(' ')
            .reduce((pre, cur) => pre + capitalize(cur));
          resolve(action);
        },
        undefined,
        function (e) {
          console.error('load error,', path, e);
        },
      );
    });
  }

  return Promise.all(paths.map(loadAction));
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
enum ACTION {
  walk = 'walk',
  idle = 'idle',
  walkBack = 'walkBack',
  jump = 'jump',
  attack = 'attack',
}
const actions: Partial<Record<ACTION, THREE.AnimationAction>> = {};
function addRoleController(model: THREE.Object3D, mixer: THREE.AnimationMixer) {
  const state = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    attack: false,
  };
  function setState(e: KeyboardEvent, bool: boolean) {
    switch (e.code) {
      case 'KeyW':
        state.forward = bool;
        break;
      case 'KeyS':
        state.back = bool;
        break;
      case 'KeyD':
        state.right = bool;
        break;
      case 'KeyA':
        state.left = bool;
        break;
      case 'Space':
        state.jump = bool;
        break;
      case 'KeyJ':
        state.attack = bool;
        break;
    }
  }

  window.addEventListener('keydown', (e) => {
    console.log(e.code);
    setState(e, true);
  });
  window.addEventListener('keyup', (e) => {
    setState(e, false);
  });

  function runAction(actionType: ACTION) {
    let activeAction: THREE.AnimationAction | null = null;
    for (const k in actions) {
      if (actions[k].isRunning()) activeAction = actions[k];
    }
    const action = actions[actionType] as THREE.AnimationAction;
    console.log(activeAction, action);
    if (action === activeAction) return;
    action.reset();
    action.play();
    activeAction?.crossFadeTo(action, 0.1, false);
    return action.getMixer();
  }
  return function () {
    if (state.forward) {
      runAction(ACTION.walk);
    } else if (state.back) {
      runAction(ACTION.walkBack);
    } else if (state.jump) {
      runAction(ACTION.jump)?.addEventListener('loop', function handler() {
        runAction(ACTION.idle)?.removeEventListener('loop', handler);
      });
      // mixer.addEventListener('loop',)
    } else if (state.attack) {
      runAction(ACTION.attack);
    }
    // actions[ACTION.walk]?.play();
  };
}

async function setup() {
  const stat = createFrameStatus();
  createLight();
  createGround();
  createGridFloor();
  const model = await loadModel();
  camera.lookAt(model.position);
  const mixer = new THREE.AnimationMixer(model);
  const updateRole = addRoleController(model, mixer);
  loadActions().then((res) => {
    res.forEach((item) => {
      actions[item.name] = mixer.clipAction(item);
    });
    actions[ACTION.idle]?.play();
  });

  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    stat.begin();

    const delta = clock.getDelta();

    updateRole();
    if (mixer) {
      mixer.update(delta);
    }
    renderer.render(scene, camera);

    stat.end();
  }
  render();
}

setup();

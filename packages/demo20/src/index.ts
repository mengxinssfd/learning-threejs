import { init } from '../../base/pointerLock';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import dat from 'dat.gui';
import { ACTION, ActionEvents, useActionMachine } from './useActionMachine';

const { camera, renderer, scene, controls } = init();
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
    'sword and shield power jump.fbx',
    'sword and shield attack.fbx',
    'sword and shield block.fbx',
    'sword and shield crouch idle.fbx',
    'sword and shield crouch block.fbx',
    'sword and shield turn left.fbx',
    'sword and shield turn right.fbx',
    'sword and shield crouch attack.fbx',
    'sword and shield run.fbx',
    'sword and shield run back.fbx',
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

const actions: Partial<Record<ACTION, THREE.AnimationAction>> = {};
function addRoleController(model: THREE.Object3D, mixer: THREE.AnimationMixer) {
  const actionService = useActionMachine(actions, mixer);
  const state = {
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    attack: false,
    shift: false,
    block: false,
    crouch: false,
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
      case 'KeyQ':
        state.block = bool;
        break;
      case 'KeyC':
        state.crouch = bool;
        break;
      case 'ShiftLeft':
        state.shift = bool;
        break;
    }
  }

  window.addEventListener('keydown', (e) => {
    console.log('keydown', e.code);
    setState(e, true);
  });
  window.addEventListener('keyup', (e) => {
    console.log('keyup', e.code);
    setState(e, false);
  });

  actionService.start();
  return {
    state,
    update() {
      if (state.shift) {
        if (state.forward) {
          actionService.send(ActionEvents.run);
        } else if (state.back) {
          actionService.send(ActionEvents.runBack);
        } else if (state.left) {
          actionService.send(ActionEvents.turnLeft);
        } else if (state.right) {
          actionService.send(ActionEvents.turnRight);
        }
        if (state.jump) {
          actionService.send(ActionEvents.jump);
        }

        return;
      }
      if (state.block) {
        if (actionService.getSnapshot().matches('jumping')) {
          actionService.send('stop');
        }
        if (state.crouch) {
          if (state.attack) {
            actionService.send(ActionEvents.crouchAttack);
          } else {
            actionService.send(ActionEvents.crouchBlock);
          }
        } else {
          actionService.send('block');
        }
      } else if (state.attack) {
        actionService.send('attack');
      } else if (state.forward) {
        actionService.send(ActionEvents.walk);
        if (state.jump) {
          actionService.send(ActionEvents.jump);
        }
      } else if (state.back) {
        actionService.send(ActionEvents.walkBack);
      } else if (state.left) {
        actionService.send(ActionEvents.turnLeft);
      } else if (state.right) {
        actionService.send(ActionEvents.turnRight);
      } else if (state.jump) {
        actionService.send('jump');
      } else if (state.crouch) {
        actionService.send('crouch');
        if (state.attack) {
          actionService.send(ActionEvents.attack);
        }
      } else {
        // if (!actionMachine.getSnapshot().matches('attacking')) {
        actionService.send('stop');
        // }
      }
    },
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
  await loadActions().then((res) => {
    res.forEach((item) => {
      actions[item.name] = mixer.clipAction(item);
    });
  });

  const { update: updateRole, state } = addRoleController(model, mixer);

  let prevTime = performance.now();
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  let canJump = false;
  const objects = [];

  function render() {
    requestAnimationFrame(render);
    stat.begin();

    const delta = clock.getDelta();

    const time = performance.now();

    if (controls.isLocked === true) {
      raycaster.ray.origin.copy(controls.getObject().position);
      raycaster.ray.origin.y -= 10;

      const intersections = raycaster.intersectObjects(objects, false);

      const onObject = intersections.length > 0;

      const delta = (time - prevTime) / 1000;

      velocity.x -= velocity.x * 10 * delta;
      velocity.z -= velocity.z * 10 * delta;

      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

      direction.z = Number(state.forward) - Number(state.back);
      direction.x = Number(state.right) - Number(state.left);
      direction.normalize(); // this ensures consistent movements in all directions

      if (state.forward || state.back) velocity.z -= direction.z * 10.0 * delta;
      if (state.left || state.right) velocity.x -= direction.x * 10.0 * delta;

      if (onObject) {
        velocity.y = Math.max(0, velocity.y);
        canJump = true;
      }

      const x = -velocity.x * delta;
      const z = -velocity.z * delta;
      controls.moveRight(x);
      controls.moveForward(z);
      model.position.x += x;
      model.position.z += z;

      // controls.getObject().position.y += velocity.y * delta; // new behavior

      // if (controls.getObject().position.y < 10) {
      //   velocity.y = 0;
      //   controls.getObject().position.y = 10;
      //
      //   canJump = true;
      // }
    }

    prevTime = time;

    updateRole?.();
    if (mixer) {
      mixer.update(delta);
    }
    renderer.render(scene, camera);

    stat.end();
  }
  render();
}

setup();

import { init } from '../../base/base';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module';

const { camera, renderer, scene, controls } = init();
// 编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 摄像机位置
camera.position.set(-3, 5, -2);

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

function createGround() {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.name = 'ground';
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

// 监听鼠标移动
function addMoveEvent() {
  const mouse = new THREE.Vector2(1, 1);
  const raycaster = new THREE.Raycaster();

  let lastActive: THREE.Object3D | null = null;
  let active: THREE.Object3D | null = null;
  function onMouseMove(event: MouseEvent) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const find = scene.children.find((item) => {
      if (!(item as THREE.Mesh).isMesh || item.name === 'ground') return;
      return raycaster.intersectObject(item).length;
    });

    if (find) {
      if (find !== active) {
        lastActive = active;
        active = find;
        find.dispatchEvent({ type: 'mouseenter' });
      } else {
        lastActive = null;
      }
    } else {
      lastActive = active;
      active = null;
    }
    if (lastActive) lastActive.dispatchEvent({ type: 'mouseout' });
  }
  document.addEventListener('mousemove', onMouseMove);
}

function createCube() {
  const colorMap = new Map<THREE.Mesh, string>();
  const material = new THREE.MeshBasicMaterial({
    color: 'lime',
  });
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);

  const cube = new THREE.Mesh(geometry, material);

  function mouseenterHandler(this: THREE.Mesh) {
    console.log('mouseenter');
    const material = this.material as THREE.MeshBasicMaterial;
    if (!colorMap.has(this)) {
      colorMap.set(this, material.color.getStyle());
    }
    material.color.setColorName('red');
  }
  function mouseoutHandler(this: THREE.Mesh) {
    console.log('mouseout');
    const material = this.material as THREE.MeshBasicMaterial;
    colorMap.has(this) && material.color.setStyle(colorMap.get(this) as string);
  }

  cube.position.set(2, 0.5, 0);
  cube.castShadow = true;

  scene.add(cube);

  const cube1 = cube.clone(true);
  cube1.material = new THREE.MeshBasicMaterial({
    color: 'pink',
  });
  cube1.position.set(-2, 0.5, 0);
  scene.add(cube1);

  const cube2 = cube.clone(true);
  cube2.material = new THREE.MeshBasicMaterial({
    color: 'yellow',
  });
  cube2.position.set(0, 0.5, 2);
  scene.add(cube2);

  const cube3 = cube.clone(true);
  cube3.material = new THREE.MeshBasicMaterial({
    color: 'blue',
  });
  cube3.position.set(0, 0.5, -2);
  scene.add(cube3);

  cube.addEventListener('mouseenter', mouseenterHandler);
  cube.addEventListener('mouseout', mouseoutHandler);
  cube1.addEventListener('mouseenter', mouseenterHandler);
  cube1.addEventListener('mouseout', mouseoutHandler);
  cube2.addEventListener('mouseenter', mouseenterHandler);
  cube2.addEventListener('mouseout', mouseoutHandler);
  cube3.addEventListener('mouseenter', mouseenterHandler);
  cube3.addEventListener('mouseout', mouseoutHandler);
}

/**
 * 添加网格地面
 */
function createGridFloor() {
  const grid = new THREE.GridHelper(20, 40, 'gray');
  scene.add(grid);
  return grid;
}

async function setup() {
  addMoveEvent();
  const stat = createFrameStatus();
  createLight();
  createGround();
  createGridFloor();
  createCube();

  function render() {
    requestAnimationFrame(render);
    stat.begin();

    controls.update();
    renderer.render(scene, camera);

    stat.end();
  }
  render();
}

setup();

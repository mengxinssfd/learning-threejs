import { camera, renderer, scene, controls } from '../../base';
import * as THREE from 'three';
import * as dat from 'dat.gui';

const loading = document.querySelector('.loading') as HTMLDivElement;

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  loading.innerText = '100%';
  setTimeout(() => {
    loading.style.display = 'none';
    renderer.domElement.style.position = 'static';
  }, 500);

  console.log('on loaded');
};
loadingManager.onProgress = function (url, loaded, total) {
  console.log('on progress', url, loaded, total);
  loading.innerText = ((loaded / total) * 100).toFixed(2) + '%';
};
loadingManager.onError = function (e) {
  console.log('on error', e);
};

loadingManager.onStart = function (url: string, loaded: number, total: number) {
  console.log('on start', url, loaded, total);
};

scene.background = new THREE.CubeTextureLoader(loadingManager)
  .setPath('/assets/images/')
  .load(['bg.jpg', 'bg.jpg', 'bg.jpg', 'bg.jpg', 'bg.jpg', 'bg.jpg']);

// 导入纹理
const textureLoader = new THREE.TextureLoader(loadingManager);
// 基础图
const colorTexture = textureLoader.load('/assets/images/stylized/Stylized_Crate_002_basecolor.jpg');
// ao烘培
const aoColorTexture = textureLoader.load(
  '/assets/images/stylized/Stylized_Crate_002_ambientOcclusion.jpg',
);
const roughnessColorTexture = textureLoader.load(
  '/assets/images/stylized/Stylized_Crate_002_roughness.jpg',
);
const heightColorTexture = textureLoader.load(
  '/assets/images/stylized/Stylized_Crate_002_height.png',
);
const metallicColorTexture = textureLoader.load(
  '/assets/images/stylized/Stylized_Crate_002_metallic.jpg',
);
const nomalColorTexture = textureLoader.load(
  '/assets/images/stylized/Stylized_Crate_002_normal.jpg',
);

// 旋转
// colorTexture.rotation = Math.PI / 4;
// 旋转中心点
// colorTexture.center.set(0.5, 0.5);
// 重复次数
colorTexture.repeat.set(1, 1);
// 镜像重复
colorTexture.wrapS = THREE.MirroredRepeatWrapping;
// 普通重复
// colorTexture.wrapT = THREE.RepeatWrapping;
colorTexture.wrapT = THREE.MirroredRepeatWrapping;

// 当一个纹素覆盖大于一个像素时，贴图将如何采样。默认值为THREE.LinearFilter， 它将获取四个最接近的纹素，并在他们之间进行双线性插值。
// 另一个选项是THREE.NearestFilter，它将使用最接近的纹素的值。
// colorTexture.magFilter = THREE.NearestFilter;
// 当一个纹素覆盖小于一个像素时，贴图将如何采样。默认值为THREE.LinearMipmapLinearFilter， 它将使用mipmapping以及三次线性滤镜。
// colorTexture.minFilter = THREE.NearestFilter;

// 几何体
const geometry = new THREE.BoxBufferGeometry(5, 5, 5, 100, 100, 100);
// 材质 MeshStandardMaterial必须添加光照，否则会是黑色的
const material = new THREE.MeshStandardMaterial({
  map: colorTexture,
  side: THREE.DoubleSide, // 渲染两面，默认看不到背面
  aoMap: aoColorTexture,
  aoMapIntensity: 0.5,
  roughnessMap: roughnessColorTexture,
  // 材质的粗糙程度。0.0表示平滑的镜面反射，1.0表示完全漫反射。默认值为1.0。如果还提供roughnessMap，则两个值相乘。
  roughness: 0.8, // 粗糙度，数值大时不会反光,反之不应该反光的也会反光
  displacementMap: heightColorTexture,
  // displacementScale: 0.05,
  metalnessMap: metallicColorTexture,
  metalness: 0.3,
  // 法线
  normalMap: nomalColorTexture,
  // normalScale: new THREE.Vector2(0, 1),
});
const cube = new THREE.Mesh(geometry, material);
geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

scene.add(cube);

const planeGeometry = new THREE.PlaneGeometry(5, 5, 20, 20);

const plane = new THREE.Mesh(planeGeometry, material);

plane.position.x = 5;
planeGeometry.setAttribute('uv2', new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2));

scene.add(plane);

const gui = new dat.GUI();
// 添加光源

// 环境光源
const ambientLight = new THREE.AmbientLight('white', 1);
ambientLight.position.set(-10, -10, -10);
scene.add(ambientLight);

gui.add(ambientLight, 'intensity').min(0).max(1).name('ambientLight');

// 直线光源
const directionalLight = new THREE.DirectionalLight('white', 1);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);
gui.add(directionalLight, 'intensity').min(0).max(1).name('directionalLight');

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

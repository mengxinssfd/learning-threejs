import { camera, renderer, scene, controls } from '../../base';
import * as THREE from 'three';

// 导入纹理
const textureLoader = new THREE.TextureLoader();
// 基础图
// const colorTexture = textureLoader.load('/assets/images/img.jpeg');
const colorTexture = textureLoader.load('/assets/images/Substance_Graph_basecolor.jpg');
// 透明
const alphaColorTexture = textureLoader.load('/assets/images/Substance_Graph_opacity.jpg');
// ao烘培
const aoColorTexture = textureLoader.load('/assets/images/Substance_Graph_ambientOcclusion.jpg');

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
const geometry = new THREE.BoxBufferGeometry(5, 5, 5);
// 材质
const material = new THREE.MeshBasicMaterial({
  map: colorTexture,
  alphaMap: alphaColorTexture,
  transparent: true,
  side: THREE.DoubleSide, // 渲染两面，默认看不到背面
  aoMap: aoColorTexture,
  aoMapIntensity: 0.5,
});
const cube = new THREE.Mesh(geometry, material);
geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));

scene.add(cube);

const planeGeometry = new THREE.PlaneGeometry(5, 5);

const plane = new THREE.Mesh(planeGeometry, material);

plane.position.x = 5;
planeGeometry.setAttribute('uv2', new THREE.BufferAttribute(planeGeometry.attributes.uv.array, 2));

scene.add(plane);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

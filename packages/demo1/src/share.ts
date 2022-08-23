import * as THREE from 'three';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 5;
camera.position.set(0, 0, 5);

// 创建一个几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);
// 创建材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// 根据几何体和材质创建物体
const cube = new THREE.Mesh(geometry, material);

// 添加到场景中
scene.add(cube);

// new一个renderer并生成一个canvas，也可以使用现有的canvas
const renderer = new THREE.WebGLRenderer();
// 设置canvas大小
renderer.setSize(window.innerWidth, window.innerHeight);
// 挂载canvas到body节点上
document.body.appendChild(renderer.domElement);

// 使用渲染器将场景和摄像机渲染出来
renderer.render(scene, camera);

export { renderer, cube, camera, scene };

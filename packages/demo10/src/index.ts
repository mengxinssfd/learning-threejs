import { camera, renderer, scene, controls } from '../../base';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import dat from 'dat.gui';

// 加载hdr文件
// const loader = new RGBELoader()

// 加载exr文件
const loader = new EXRLoader();
// 导入纹理 2k的有点模糊  8k的很清晰 18k(1g多)的加载不出来
loader
  .loadAsync('/assets/images/hdr/HdrOutdoorBeachBlueHourCloudy002_HDR_2K.exr')
  .then((texture) => {
    // 贴成环状
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // 给场景添加背景
    scene.background = texture;
    // 给场景添加环境
    // 若该值不为null，则该纹理贴图将会被设为场景中所有物理材质的环境贴图。
    // 然而，该属性不能够覆盖已存在的、已分配给 MeshStandardMaterial.envMap 的贴图。默认为null。
    scene.environment = texture;

    // 几何体
    const geometry = new THREE.SphereBufferGeometry(1, 20, 20);
    // 材质 MeshStandardMaterial必须添加光照，否则会是黑色的
    const material = new THREE.MeshStandardMaterial({
      // envMap: texture, // 默认为scene.environment
      metalness: 1,
      roughness: 0.001,
    });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);
  });

const params = {
  exposure: 16,
};

const gui = new dat.GUI();
gui.add(params, 'exposure', 0, 50, 0.01);
// 色调映射 设置了这个才可以调节曝光
renderer.toneMapping = THREE.ReinhardToneMapping;
function animate() {
  controls.update();
  renderer.render(scene, camera);
  // 设置曝光
  renderer.toneMappingExposure = params.exposure;
  requestAnimationFrame(animate);
}
animate();

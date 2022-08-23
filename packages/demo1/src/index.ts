import { cube, renderer, scene, camera } from './share';

// 让几何体动起来
function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

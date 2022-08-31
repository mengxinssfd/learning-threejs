# demo15：地月环绕

## 做了什么

- 聚光灯光源
- `WebGLRenderer` `canvas` 背景透明
- 阴影(注意：物体太大不会渲染阴影，如半径为 100 的球体)
- 贴图
- `MeshPhongMaterial` 材质（一种用于具有镜面高光的光泽表面的材质，例如涂漆木材）
  - `shininess`：光泽度
  - `specularMap`：高光贴图
  - `normalMap`： 法线贴图
  - `lightMap`：光照贴图
- 圆周运动
- `rotateOnAxis`：沿轴转
- `Stats`：帧数显示
- `CSS2DRenderer` + `CSS2DObject` 实现 3d + 2d html 的组合

## 总结

了解了 `MeshPhongMaterial` 材质及各种贴图类型，以及太大的物体不会渲染阴影的问题，沿轴转，使用`Stats`作为帧数显示，如何使`WebGLRenderer`的`canvas` 背景透明等。

学习了`CSS2DRenderer` + `CSS2DObject` 实现 3d + 2d html 的组合。

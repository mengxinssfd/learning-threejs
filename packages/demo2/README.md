# demo2

创建轨道控制器: 可以使得相机围绕目标进行轨道运动。

例如3d角色扮演游戏中控制镜头角度以及缩放比例，并且只能绕着一个物体转动。

[文档](https://threejs.org/docs/index.html?q=orbit#examples/zh/controls/OrbitControls.enableDamping)

## 做了什么

在`demo1`的基础上移除几何体动画，并创建轨道控制器:
- 自动旋转
- 启用惯性
- 按`Enter`键恢复角度
- 方向键控制角度(暂时不起作用)

## 总结

明白了什么是轨道控制器以及使用方法
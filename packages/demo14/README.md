# demo14： 水天一色小岛


## 做了什么

- 开启抗锯齿
- 模型加载
- 天空球
- 水纹理
- 使用视频做纹理
- 灯光
- hdr
- 减少模型闪烁

## 总结
如何使用视频做纹理，水纹理，
减少模型闪烁：WebGLRenderer开启logarithmicDepthBuffer对数深度缓冲区，以及摄像机的near值加大


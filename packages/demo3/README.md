# demo3

使用`CLock`对象：该对象用于跟踪时间。如果performance.now可用，则 Clock 对象通过该方法实现，否则回落到使用略欠精准的Date.now来实现。
[文档](https://threejs.org/docs/index.html?q=clock#api/zh/core/Clock)

## 做了什么

在`demo1`的基础上:
- 使用`CLock`对象
- 获取运行总时长
- 获取上次调用时间间隔

## 总结

明白了什么是`CLock`对象及其使用方法，`Clock`对象可以自己实现
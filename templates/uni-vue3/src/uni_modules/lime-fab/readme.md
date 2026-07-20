# lime-fab 悬浮按钮组件

一个功能丰富的悬浮操作按钮组件，支持多种展开方式和自定义样式。可用于页面快捷操作、导航跳转等场景。组件提供了丰富的自定义选项，可以满足各种复杂的交互需求。

> 插件依赖：`lime-shared`、`lime-style`

## 文档链接
📚 组件详细文档请访问以下站点：
- [悬浮按钮文档 - 站点1](https://limex.qcoon.cn/components/fab.html)
- [悬浮按钮文档 - 站点2](https://limeui.netlify.app/components/fab.html)
- [悬浮按钮文档 - 站点3](https://limeui.familyzone.top/components/fab.html)

## 安装方法
1. 在uni-app插件市场中搜索并导入`lime-fab`
2. 导入后可能需要重新编译项目
3. 在页面中使用`l-fab`组件

## 代码演示

### 基础用法

浮动气泡默认展示在右下角，并允许在 y 轴方向上下拖拽。

```html
<l-fab @click="onClick" />
```

```js
const onClick = () => {
    console.log('点击气泡')
};
```

### 自由拖拽和磁吸

允许 x 和 y 轴方向拖拽，吸附到 x 轴方向最近一边。

```html
<l-fab
  axis="xy"
  magnetic="x"
  @change="onOffsetChange"
/>
```

```js
const onOffsetChange = (offset) => {
    uni.showToast(offset[0] + '__' + offset[1]);
};
```

### 使用 v-model
- offset为数值数组，`offset[0]`为x，`offset[1]`为y
- vue3 使用 `v-model:offset` 控制位置。
- vue2 使用 `:offset.sync` 控制位置。

```html
// vue3
<l-fab v-model:offset="offset" axis="xy" />
// vue2
<l-fab :offset.sync="offset" axis="xy" />
```

```js
 data() {
	 return {
		 // [x, y]
		 offset: [200, 400]
	 }
 }
```

## Vue2使用说明
main.js中添加以下代码：
```js
// vue2项目中使用
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
```

详细配置请参考官方文档：[Vue Composition API](https://uniapp.dcloud.net.cn/tutorial/vue-composition-api.html)

## 插件标签说明
`l-fab` 为组件标签   
`lime-fab` 为演示标签

## API文档

### Props 属性说明


| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model:offset | 控制气泡位置 | _number[]_ | `默认右下角坐标` |
| axis | 拖拽的方向，`xy` 代表自由拖拽，`lock` 代表禁止拖拽 | _'x' \| 'y' \| 'xy' \| 'lock'_ | `y` |
| magnetic | 自动磁吸的方向 | _'x' \| 'y'_ | - |
| gap | 气泡与窗口的最小间距，单位为 `px` | _'number' \| 'string'_| `24` |



### Events 事件

| 事件          | 说明                         | 回调参数                 |
| ------------- | ---------------------------- | ------------------------ |
| custom-click         | 点击组件时触发               | _UniTouchEvent_             |
| offset-change | 由用户拖拽导致位置改变后触发 | _[x: number, y: number]_ |

### Slots 插槽

| 名称    | 说明               |
| ------- | ------------------ |
| default | 自定义气泡显示内容 |

## 主题定制

组件提供了以下CSS变量，可用于自定义主题：

| 变量名称 | 默认值 | 描述 |
|---------|--------|------|
| `--l-fab-width` | `48px` | 按钮宽度尺寸 |
| `--l-fab-height` | `48px` | 按钮宽度尺寸 |
| `--l-fab-initial-gap` | `24px` | 初始位置边距（距离右下角） |
| `--l-fab-icon-size` | `28px` | 图标大小 |
| `--l-fab-bg-color` | `$primary-color` | 按钮背景色 |
| `--l-fab-color` | `white` | 图标/文本颜色 |
| `--l-fab-z-index` | `999` | 层级高度 |
| `--l-fab-border-radius` | `999px` | 圆角半径（圆形） |

## 支持与赞赏

如果你觉得本插件解决了你的问题，可以考虑支持作者：

| 支付宝赞助 | 微信赞助 |
|------------|------------|
| ![支付宝赞赏码](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/alipay.png) | ![微信赞赏码](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/wpay.png) |
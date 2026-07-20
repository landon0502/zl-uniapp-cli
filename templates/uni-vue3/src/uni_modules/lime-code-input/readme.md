# lime-code-input 验证码输入框
一个验证码输入框组件，也可用作密码输入框，支持明文和密文显示，可自定义长度、间距和样式。

> 插件依赖：`lime-shared`、`lime-style`

## 文档链接
📚 组件详细文档请访问以下站点：
- [验证码输入框文档 - 站点1](https://limex.qcoon.cn/components/code-input.html)
- [验证码输入框文档 - 站点2](https://limeui.netlify.app/components/code-input.html)
- [验证码输入框文档 - 站点3](https://limeui.familyzone.top/components/code-input.html)

## 安装方法
1. 在uni-app插件市场中搜索并导入`lime-code-input`
2. 首次导入可能需要重新编译


## 代码演示
### 基础使用
通过`v-model`双向绑定值
```html
<l-code-input v-model="value"></l-code-input>
```
```js
const value = ref('')
```

### 自定义长度
通过`length`属性来设置码长度
```html
<l-code-input v-model="value"></l-code-input>
```
```js
const value = ref('')
```

### 明文展示
将 `mask` 设置为 false 可以明文展示输入的内容，适用于短信验证码等场景。
```html
<l-code-input v-model="value" :mask="false"></l-code-input>
```
```js
const value = ref('')
```

### 提示信息
通过 `info` 属性设置提示信息，通过 `error-info` 属性设置错误提示，例如当输入六位时提示密码错误。
```html
<l-code-input v-model="value" info="请输入验证码" :error-info="errorInfo"></l-code-input>
```
```js
const value = ref('')
const errorInfo = ref('')

watch(value, (newVal) => {
    if (newVal.length == 6 && newVal != '123456') {
        errorInfo.value = '密码错误';
    } else {
        errorInfo.value = '';
    }
});
```

## Vue2使用说明
本插件使用了`composition-api`，请按照[官方教程](https://uniapp.dcloud.net.cn/tutorial/vue-composition-api.html)配置。

关键配置代码（在main.js中添加）：
```js
// main.js
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
```


## 快速预览
导入插件后，可以直接使用以下标签查看演示效果：

```html
<!-- 代码位于 uni_modules/lime-code-input/components/lime-code-input -->
<lime-code-input />
```

## 插件标签说明
- `l-code-input`：验证码输入框组件
- `lime-code-input`：演示标签

## API文档

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| v-model | 密码值 | string | - |
| value | 密码值 | string | - |
| info | 输入框下方文字提示 | string | - |
| errorInfo | 输入框下方错误提示 | string | - |
| length | 密码最大长度 | number | `6` |
| gutter | 输入框格子之间的间距，如 20px 20rpx，默认单位为px | string | `20rpx` |
| mask | 是否隐藏密码内容 | boolean | `true` |
| focused | 是否已聚焦，聚焦时会显示光标 | boolean | `false` |
| line | 是否使用下划线模式 | boolean | `false` |
| borderColor | 描边色 | string | - |
| width | 格子宽度 | string | - |
| height | 格子高度 | string | - |
| radius | 格子圆角 | string | - |
| fontSize | 字体大小 | string | - |
| activeBgColor | 激活格子背景色 | string | - |
| activeBorderColor | 激活格子描边色 | string | - |
| color | 文本色 | string | - |
| bgColor | 格子背景色 | string | - |
| cursorColor | 光标色 | string | - |
| disabledKeyboard | 禁用系统键盘 | boolean | `false` |
| disabledDot | 禁输入. | boolean | `true` |
| insertAt | 指定位置插入符号,`{index:2, symbol:'*'}` | object | - |
| lastElementStyle | 最后一个元素样式 | string | - |
| lastElementPlaceholder | 最后一个元素占位提示 | string | - |
| lastElementPlaceholderStyle | 最后一个元素占位提示样式 | string | - |
| type | input的类型，参考[input组件](https://doc.dcloud.net.cn/uni-app-x/component/input.html) | string | - |

### Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 值变化时触发 | event: string |
| focus | 聚焦时触发 | - |
| finish | 完成时 | event: string |

### Slots

| 插槽名 | 说明 | 回调参数 |
| --- | --- | --- |
| line | 线条 | active: boolean |

## 主题定制

组件提供了下列CSS变量，可用于自定义样式。

| 变量名称 | 默认值 | 说明 |
|---------|--------|------|
| `code-input-height` | `50px` | 输入框整体高度 |
| `code-input-font-size` | `20px` | 输入文字大小 |
| `code-input-radius` | `$spacer-tn` | 输入框圆角半径 |
| `code-input-bg-color` | `$gray-1` | 输入框背景色 |
| `code-input-text-color` | `$text-color-1` | 输入文字颜色 |
| `code-input-info-color` | `$text-color-3` | 提示文字颜色 |
| `code-input-error-info-color` | `$error-color` | 错误提示颜色 |
| `code-input-dot-color` | `$text-color-1` | 密码点颜色 |
| `code-input-cursor-color` | `$text-color-1` | 光标颜色 |
| `code-input-dot-size` | `10px` | 密码点大小 |
| `code-input-info-font-size` | `$font-size` | 提示文字大小 |
| `code-input-cursor-width` | `1px` | 光标宽度 |
| `code-input-cursor-height` | `40%` | 光标高度比例 |
| `code-input-cursor-duration` | `1s` | 光标闪烁速度 |

## 支持与赞赏

如果你觉得本插件解决了你的问题，可以考虑支持作者：
| 支付宝赞助 | 微信赞助 |
|------------|------------|
| ![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/alipay.png) | ![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/wpay.png) |
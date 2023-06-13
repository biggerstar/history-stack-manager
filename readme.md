### 简介

原本的浏览器不支持直接查看和操作历史记录栈， 而该模块实现了浏览器记录栈的映射管理控制与功能拓展。   
size: `3.75kb`   
gzip:: `1.56kb`

### 安装

使用 npm:

```shell
$ npm install history-stack-manager
```

使用 yarn:

```shell
$ yarn add history-stack-manager
```

使用 pnpm:

```shell
$ pnpm add history-stack-manager
```

---

### 快速上手

导入创建函数

```javascript
import {createHistoryManager} from 'history-stack-manager';
```

创建一个history管理器

```javascript
const history = createHistoryManager()
// 你也可以指定一个即将被接管window对象,比如iframe的window
// const history = createHistoryManager(window)
history.mount()
console.log(history)
```

Type类型定义

```javascript
export type HistoryOptions = {
  /** 该管理器历史记录类型标识 */
  type: '__HISTORY_DATA__' | string
  /** 非必要，浏览器的历史原因，传入空字符串就行了 */
  title: string
  /** 要持久化记录的state */
  state: any
  /** 要添加记录的对应url */
  url: string
  /** 要添加记录的滚动位置  */
  scrollY: number
  /** 当前记录的唯一id  */
  id: number
}
```


### History API

**mount**

- desc  `挂载并接管浏览器内置的history对象`
- type `Function`
- args `empty`
- return `void`

```javascript
history.mount()  // 进行接管
```

**unmount**

- desc  `将控制权交还浏览器内置对象`
- type `Function`
- args `empty`
- return `void`

```javascript
history.unmount()  // 交还控制权
```

**back**

- desc  `后退`
- type `Function`
- args `empty`
- return `void`  
  返回上一个页面，和原本浏览器内置管理器操作无任何差别

```javascript
history.back()   // 后退
```

**forward**

- desc  `前进`
- type `Function`
- args `empty`
- return `void`  
  前往下一个页面，和原本浏览器内置管理器操作无任何差别

```javascript
history.forward()   // 前进
```

**go**

- desc  `前往当前页指定偏移记录`
- type `Function`
- args `[offset: number]`
- return `void`  
  前往相对当前页指定偏移历史记录位置，和原本浏览器内置管理器操作无任何差别

```javascript
history.go(-1)  // 相当于history.back()  
```

**pushState**

- desc  `添加一条历史记录`
- type `Function`
- args `[state: any, title:string, url:string]`
- return `void`  
  针对浏览器内置管理器替换记录，和原本浏览器内置管理器操作无任何差别

```javascript
history.pushState({state:'data'},'','url') 
```

**replaceState**

- desc  `替换一条历史记录`
- type `Function`
- args `[state: any, title:string, url:string]`
- return `void`  
  针对浏览器内置管理器添加记录，和原本浏览器内置管理器操作无任何差别

```javascript
history.replaceState({state:'data'},'','url') 
```

**replace**

- desc  `手动替换一条虚拟管理器的历史记录`
- type `Function`
- args `[history:HistoryOptions]`
- return `void`    
  针对虚拟管理器替换记录，对内置管理器毫无影响

```javascript
const item = history.createHistory({state:'data'},'','url')
history.replace(item)
```

**push**

- desc  `手动添加一条虚拟管理器的历史记录`
- type `Function`
- args `[history:HistoryOptions]`
- return `void`  
  针对虚拟管理器添加记录，对内置管理器毫无影响

```javascript
const item = history.createHistory({state:'data'},'','url')
history.push(item)
```

**index**

- desc  `直接跳转到id值对应历史记录`
- type `Function`
- args `[id:number]`
- return `void`  
  直接跳转到id值对应历史记录，内部使用内置管理器的go函数实现，影响虚拟管理器和内置管理器

```javascript
const item = history.stack[10]
history.index(item.id) 
```

**onBack**

- desc  `浏览器页面后退时回调，可添加多个 `
- type `Function`
- args `[callback:(state:any):void]`
- return `void`  
state是pushState或replaceState方式的参数1添加进历史记录数据,默认为`null

```javascript
history.onBack((state)=>{
   console.log('后退了',state)
})) 
```

**onForward**

- desc  `浏览器页面前进时回调，可添加多个 `
- type `Function`
- args `[callback:(state:any):void]`
- return `void`  
state是pushState或replaceState方式的参数1添加进历史记录数据,默认为`null`
```javascript
history.onForward((state)=>{
   console.log('前进了',state)
})) 
```

**createHistory**

- desc  `创建一个虚拟管理器专用的历史记录`
- type `Function`
- args `[state: any, title:string, url:string]`
- return `void`
  创建一个虚拟管理器专用的历史记录，该history可以通过push函数或者replace函数加入虚拟管理器

```javascript
const item = history.createHistory({state:'data'},'','url')
history.push(item)
```

**stack**

- desc  `映射后的浏览器历史记录栈数组`
- type `Array<HistoryOptions>`

**point**

- desc  `当前页面在历史记录中的游标位置，最低0，最高49，和stack数组的最大值有关，默认支持记录50条 `
- type `number`

**length**

- desc  `当前历史记录的条数`
- type `number`

**scrollRestoration**

- desc  `是否保持上次滚动位置`
- type `'auto' | 'manual'`

**history**

- desc  `当前虚拟管理器正在操控的历史记录`
- type `HistoryOptions`

**state**

- desc  `pushState 或 replaceState 添加进的state`
- type `any`

**rowHistory**

- desc  `原本的内置浏览器历史记录管理器`
- type `History`

### 解释：

1. 内置管理器: 平常使用的`window.history`对象
2. 虚拟管理器: 该模块创建的history对象，模块实现了所有原本内置管理器的功能，通过`Object.defineProperty`
   重新定义替代原本window.history位置，`接管原来内置history的功能和操作`，
   内置管理器内部的历史记录栈记录着上方类型定义中的HistoryOptions类型，
   内置管理器和虚拟管理器的操作和历史记录保持着完全同步

### 原理：
不去改变内置管理器的任何api，只是通过各种浏览器操作将所有产生的新地址记录到历史栈中，
通过创建一个虚拟的影子history管理器实时同步内置管理器的状态，并提供相关api便于管理和操作

### 内置浏览器添加历史记录的几种情况,当前已全部实现监听
- 1.点击a链接
- 2.在地址栏中输入加载URL或者打开新界面
- 3.提交表单
- 4.history对象的`pushState`和`replaceState`
- 5.location对象的`replace`和`assign`  

  唯一不完美实现:  原因是location的replace和assign不可重定义,
  assign和replace在虚拟管理器中都会添加新纪录；但是内置管理器是正常的，
  内置管理器执行assign添加一个记录，replace替换当前页记录
### 实现方式:
注: `pathname,protocol,origin,query`等等不变 只有`hash`改变的情况，后面简称"只变hash"，相反称"非只变hash"  
- 浏览器DOMContentLoaded事件: 非只变hash下实现了 `[1] [2] [3] [5] `
- 浏览器hashchange事件: 只变hash下实现了 `[1] [2] [5] ` 
- HistoryManager管理类: 实现了`[4]`

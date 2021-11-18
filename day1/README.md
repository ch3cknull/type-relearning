# 第一天 初识泛型

今天阅读的内容为 TS 官网文档的泛型部分 [链接](https://www.typescriptlang.org/docs/handbook/2/generics.html)

使用方式错误的代码，我会在每行之前使用 `?` 标注，旨在提醒大家不要这么用，如下所示

```ts
function hello<T>(args: T): T {
?    console.log(args.length) // 错误，args不一定拥有 length 属性
}
```

## 我们为什么需要泛型？

在使用泛型之前，我们可能是这么用的（摘自官方文档）

```ts
function identity(arg: number): number {
  return arg
}
```

那么，当我们需要传入新类型的参数时，不免要修改 arg 和返回值的类型，有些时候为了贪图方便，就写成了 `anyScript` 或者 `unknownScript`，如下所示，但是如果这么用，就失去了我们最开始使用 TS 的意义

```ts
function identity(arg: any): any {
  return arg
}
```

而现在，泛型为我们提供了一种更优雅的解决方案, 这里是一个泛型变量的使用案例

```ts
// 这里的 T 其实是一个变量, TS 会根据传入的值自动推导类型
// 这里所有的T都是相同类型的，如果你喜欢也可以换成其他的名字
function identity<T>(arg: T): T {
  return arg
}

// 或者 箭头函数使用泛型
const f = <T>(args: T): T => args

// 这里的类型可以忽略，TS会自动推导你可能使用的类型
// hello 的类型为 'hello' (这里我使用的是4.4.4版本,其他版本可能会有差异)
const hello = identity('hello')
// string 的类型为 string
const string = identity<string>('hello')
```

## 和泛型类型一起工作

使用泛型和 `unknown` 有些类似，`unknown` 需要先使用 `typeof` 判断类型后，才能使用该类型拥有的属性

```ts
function loggingIdentity<Type>(arg: Type): Type {
// Type 上不一定有length属性
// Property 'length' does not exist on type 'Type'.
? console.log(arg.length)
  return arg
}
```

这时候，需要我们先对 arg 的类型进行判断(类型收缩)，之后就能使用这个类型上的属性了

```ts
// Array 拥有 length 属性, 所以下面的代码不会报错
function loggingIdentity<Type>(arg: Type): Type {
  if (Array.isArray(arg)) {
    console.log(arg.length)
  }
  return arg
}

// 官方示例为:将Type修改为Type[],
// Type[] 其实是Array<Type>的语法糖, 二者使用时等价的
function loggingIdentity<Type>(arg: Type[]): Type[] {
  console.log(arg.length)
  return arg
}
```

## 如何在接口或者类型中描述带泛型的函数？

我们已经知道，在当接口或类型不确定时，我们可以用下面的方法来描述

```ts
type NotEnsure = {
  // 这里的 s 换成其他上面任意的都可以
  // 这里接收任意字符串形式的 key, value类型为string
  [s: string]: string
}
```

那么，对于这种泛型的函数,我们可以这样定义，这里的 `=>` 不是箭头函数 而是因为 `:` 在 type 中还有其他用途(组成三目运算符，这就涉及到后面的类型体操部分了)

```ts
type GenericIdentifyFn<T> = (args: T) => T
// 但是每次都要手动指定类型还是有些奇怪
const a: GenericIdentifyFn<string> = (a) => a
```

泛型接口 官方文档示例

```ts
interface GenericIdentityFn<Type> {
  (arg: Type): Type
}

function identity<Type>(arg: Type): Type {
  return arg
}

let myIdentity: GenericIdentityFn<number> = identity
```

## 泛型类

官方示例如下描述，使用泛型类，就算再原本的类名后面，使用形如 `<Type>` 的形式来指定类型

```ts
// class 上的 NumType 和内部的 NumType 是相同的
class GenericNumber<NumType> {
  zeroValue: NumType
  add: (x: NumType, y: NumType) => NumType
}

let myGenericNumber = new GenericNumber<number>()
myGenericNumber.zeroValue = 0
myGenericNumber.add = function (x, y) {
  return x + y
}
```

## 通用约束

我们在文章最开始就知道，Type 由于太宽泛，所以需要先进行类型收缩，才能使用收缩后类型的属性，那么我们能不能在传参的时候就使用约束呢？当然是可以的

```ts
interface HasLength {
  length: number
}

// Type 继承自 HasLength, 那么一定具有length属性
function loggingIdentity<Type extends HasLength>(arg: Type): Type {
  return arg.length
}

// 或者这样
function loggingIdentity<Type extends any[]>(arg: Type): Type {
  return arg.length
}
```

但是约束之后，泛型函数将不再适用于所有的类型（因为被约束了）

以上面继承自 HasLength 的 Type 为例：

在调用该函数时，必须传递一个带有 length 属性的参数，否则在编译检查阶段就会报错

## 其他情况

### keyof 关键字

假如我们有这样一个需求如下，在 JS 中这样就足够了

```js
const getProperty = (obj, key) => obj[key]
```

但是在 TS 里，如果当前对象上不存在这个属性，那么就会报错

```ts
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key]
}

let x = { a: 1, b: 2, c: 3, d: 4 }

getProperty(x, 'a')
// Argument of type '"m"' is not assignable to parameter of type '"a" | "b" | "c" | "d"'.
? getProperty(x, 'm')
```

这里我们使用 keyof 关键字，简单描述一下

```ts
type Instance = {
  a: number
  b: number
}

// 返回值为Instance 中所有 key 的 Union, 当没有key, 返回never
// 'a' | 'b'
type KeyOfInstance = keyof Instance
```

于是，我们可以将上面的代码修改为

```ts
const getProperty = <T, K extends keyof T>(obj: T, key: K) => obj[key]
```

### 使用类作为类型

> When creating factories in TypeScript using generics, it is necessary to refer to class types by their constructor functions.

译文如下

> 当使用泛型在 TypeScript 中创建工厂时，必须通过类的构造函数引用类类型。

```ts
function create<Type>(c: { new (): Type }): Type {
  return new c()
}
```

```ts
class BeeKeeper {
  hasMask: boolean = true
}

class ZooKeeper {
  nametag: string = 'Mikle'
}

class Animal {
  numLegs: number = 4
}

class Bee extends Animal {
  keeper: BeeKeeper = new BeeKeeper()
}

class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper()
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c()
}

createInstance(Lion).keeper.nametag
createInstance(Bee).keeper.hasMask
```

# 读源码环节

今天来看 Vue3 相关的类型体操，看 reactivity 部分，挑几个有意思的类型来看，路径在 `packages/reactivity/src`

## 准备工作

在了解类型编程之前，我们可以先去熟悉一下 TS 类型系统里的关键字，这里我列了个表，可能不全，但是几乎都是大家经常用到的

| 关键字或片段                   | 用法                                                          | 解释                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| typeof                         | `type 某种类型 = typeof 某个变量`                             | 用来将变量转成其对应的类型，<br>不理解的同学可以看昨天的文章                                                                       |
| keyof                          | `type 某种类型 = keyof 某种对象类型`                          | 取对象的所有 key，然后转成 union                                                                                                   |
| infer                          | `type 某种类型<T> = T extends 另外一种类型<infer 我要的类型>` | 主动推导类型                                                                                                                       |
| extends                        | `某种类型 extends 另一种类型`                                 | 两种含义，声明类型时，用于约束类型（传入有问题类型博报错）<br>等号后面 extends 用来判断继承或相等关系，需要配合 ? : 构成三元表达式 |
| in                             |                                                               | 用于遍历                                                                                                                           |
| as                             |                                                               | 用于过滤掉一部分 key ，as 后面可以写 extends 的三元表达式                                                                          |
| \`${某种类型}\`                |                                                               | 模板字符串，和 ES 的差不多，不多谈                                                                                                 |
| &                              | `某种类型 & 另一种类型`                                       | 取两个对象的交集                                                                                                                   |
| \|                             | `某种类型 \| 另一种类型`                                      | 取两个对象的并集，取完并集其实是个 Union                                                                                           |
| [K in keyof 某个对象]          |                                                               | 用于遍历对象                                                                                                                       |
| [K in 某个 Union]              |                                                               | Union 遍历不需要加 keyof，因为其他类型 keyof 完是 union                                                                            |
| [K in 某个 某个数组\[number\]] |                                                               | 大概是上面某个对象的特殊写法，毕竟数组也是对象                                                                                     |
| [-/+]readonly                  |                                                               | 给属性添加 readonly 修饰符                                                                                                         |
| [-/+]?                         |                                                               | 给属性添加可选修饰符                                                                                                               |

看完这些关键字，我们可以来试几个简单的 demo, 都是 type-challenges 的题目

### \#7 readonly

要求是把对象的所有 key 都加上 readonly 修饰符

```ts
// 遍历 T 的 key， 给每个key加上readonly修饰
type MyReadOnly<T> = {
  readonly [K in keyof T]: T[K]
}
```

### \#43 Exclude

```ts
type MyExclude<T, U> = T extends U ? never : T
```

对于 `A | B extends C | D` 的情况，我们可以参考之前的文档

- 如果不是用中括号包裹的，TS 会自动拆分开，变成 `A extends C | A extends D | .... | B extends D`
- 如果是中括号包裹的，那么就是一个整体， 参见 `number[] | string[]` 和 `( number | srting )[]`

如果上面的题目对你来说都是小菜一碟，那么我们就能正式开始阅读源码了，如果存在不懂的，可以回去查一下官方文档

类型编程的话，在我理解的角度看，其实就是手动限制了传参的范围，让其更加安全，所以倒也不需要考虑先后顺序，下面我们来看一个简单的例子

## 正片

惯例，我们可以先看看 README 和 index.ts 确定一下导出了哪些 API

以 ref.ts 为例， 这里有我们熟悉的 ref，unref 函数等，如果之前用过 Vue3 + TS 的同学，对下面的 Ref 等类型也不陌生

```ts
export {
  ref,
  shallowRef,
  isRef,
  toRef,
  toRefs,
  unref,
  proxyRefs,
  customRef,
  triggerRef,
  Ref,
  ToRef,
  ToRefs,
  UnwrapRef,
  ShallowUnwrapRef,
  RefUnwrapBailTypes,
} from './ref'
```

俗话都说，柿子挑软的捏，那么我们可以先找一个看起来比较简单的类型

这个类型位于 `src/collectionHandlers.ts`, 看上去很简单的样子，就是把好多类型 Union 了一下

```ts
export type CollectionTypes = IterableCollections | WeakCollections

type IterableCollections = Map<any, any> | Set<any>
type WeakCollections = WeakMap<any, any> | WeakSet<any>
```

这里的主要目的是能在函数中定义类型的时候复用，这样就不用每次都写冗长的联合类型，也能避免出错，比如下面这个用法

```ts
function size(target: IterableCollections, isReadonly = false) {
  target = (target as any)[ReactiveFlags.RAW]
  !isReadonly && track(toRaw(target), TrackOpTypes.ITERATE, ITERATE_KEY)
  return Reflect.get(target, 'size', target)
}
```

现在我们看点更复杂的东西, computed 对应的 Type

现在我们只看这个结构，Ref 和 ReactiveEffect 来自其他文件，我们稍后会看

按照我们之前的经验，大概就算继承了好多次

```ts
declare const ComputedRefSymbol: unique symbol

// 只读不写的computed ref, 就是加了个只读的value
export interface ComputedRef<T = any> extends WritableComputedRef<T> {
  readonly value: T
  [ComputedRefSymbol]: true
}

// 可读可写的 computed， 继承自 ref
export interface WritableComputedRef<T> extends Ref<T> {
  readonly effect: ReactiveEffect<T>
}

export type ComputedGetter<T> = (...args: any[]) => T
export type ComputedSetter<T> = (v: T) => void

export interface WritableComputedOptions<T> {
  get: ComputedGetter<T>
  set: ComputedSetter<T>
}
```

这里定义了两种 ComputedRef，只读不写的和可读可写的

这里最好结合实际逻辑来看，看下面的类型声明，computed 有以下几种使用方式, 这里使用了函数重载，支持以下三种方式

- 传 getter，这种情况获得只读不写的 computed
- 传 options，这种情况获得可读可写的 computed
- 传 getter 或 options，根据传值是否为函数自行判断，但是由于是以 any 返回的，势必会有些缺点

```ts
// 函数重载
export function computed<T>(
  getter: ComputedGetter<T>, // 只传递一个函数的情况
  debugOptions?: DebuggerOptions
): ComputedRef<T>
export function computed<T>(
  options: WritableComputedOptions<T>, // 传递 {get， set} 对象的情况
  debugOptions?: DebuggerOptions
): WritableComputedRef<T>
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>,
  debugOptions?: DebuggerOptions
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
    setter = __DEV__
      ? () => {
          console.warn('Write operation failed: computed value is readonly')
        }
      : NOOP
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter)

  if (__DEV__ && debugOptions) {
    cRef.effect.onTrack = debugOptions.onTrack
    cRef.effect.onTrigger = debugOptions.onTrigger
  }

  return cRef as any
}
```

现在可以更复杂点，看 DeepReadonly，位于 `reactive.ts`

虽然看上去特别长，但其实和那种爬楼梯的 If-Else 语句差不多

我们分解开来看，前两行先声明了两个 Union，主要是方便在下面的类型中使用
声明了基本类型和内置类型

```ts
type Primitive = string | number | boolean | bigint | symbol | undefined | null
type Builtin = Primitive | Function | Date | Error | RegExp
export type DeepReadonly<T> = T extends Builtin // T 继承自 Builtin 就 直接返回 T ，否则继续判断
  ? T
  : T extends Map<infer K, infer V> // 如果是Map 或者 ReadonlyMap，递归把Map的key和value都Readonly
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
  : // 如果是Set， ReadonlySet， WeakSet，Promise，Ref这样的类型，就取出类型里的类型，继续递归
  T extends Set<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepReadonly<U>>
  : T extends Promise<infer U>
  ? Promise<DeepReadonly<U>>
  : T extends Ref<infer U>
  ? Ref<DeepReadonly<U>>
  : // 如果 T是对象，就依次遍历对象的值，然后递归
  T extends {}
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : // 如果都不匹配的情况，就直接使用内置的Readonly
    Readonly<T>
```

最后来看看 Ref 和 UnwrappedRef

在传给 ref 函数时，ref 函数会判断当前传值是否已经是 ref，如果是 ref，直接返回当前对象，否则就先解包，再做 ref

类型体操的部分在 UnwrapedRef 里

```ts
export interface Ref<T = any> {
  value: T
  /**
   * Type differentiator only.
   * We need this to be in public d.ts but don't want it to show up in IDE
   * autocomplete, so we use a private Symbol instead.
   */
  [RefSymbol]: true
  /**
   * @internal
   */
  _shallow?: boolean
}

export type ShallowUnwrapRef<T> = {
  [K in keyof T]: T[K] extends Ref<infer V>
    ? V
    : // if `V` is `unknown` that means it does not extend `Ref` and is undefined
    T[K] extends Ref<infer V> | undefined
    ? unknown extends V
      ? undefined
      : V | undefined
    : T[K]
}

export interface RefUnwrapBailTypes {}

export type UnwrapRef<T> = T extends ShallowRef<infer V> // 如果是shallowRef 直接返回shallowRef.value 的类型
  ? V
  : T extends Ref<infer V> // 如果是Ref 用unwrapsimple继续解包T.value 否则 解包 T
  ? UnwrapRefSimple<V>
  : UnwrapRefSimple<T>

export type UnwrapRefSimple<T> = T extends  // 如果是不能解包的类型 返回 T
  | Function
  | CollectionTypes
  | BaseTypes
  | Ref
  | RefUnwrapBailTypes[keyof RefUnwrapBailTypes]
  ? T
  : T extends Array<any> // 如果 T 是任意数组，对数组的每个元素递归执行unwrapsimple
  ? { [K in keyof T]: UnwrapRefSimple<T[K]> }
  : T extends object & { [ShallowReactiveMarker]?: never } // 这里的ShallowReactiveMaker是一个在 reactive.ts 里定义的symbol
  ? // 如果这项不存在的话，说明不是ShallowReactive类型，就继续解包
    {
      [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>
    }
  : T // 上述情况都不匹配，直接返回 T
```

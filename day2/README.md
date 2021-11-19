# 每日一题

题目 [\# 4499 Medium Chunk](https://github.com/type-challenges/type-challenges/tree/master/questions/4499-medium-chunk)

题目原意是N个一组做分割

解题思路，递归的时候设置一个Swap，

每次递归向后移动一个单位，

如果Swap长度等于规定长度，就添加到最前面，并清空Swap

特殊情况处理，在递归结束后，如果Swap为空，那么不添加，

如果Swap不为空，重新包裹一下，添加到最后

```ts
type Chunk<T extends any[], N extends number, Swap extends any[] = []> =
  Swap['length'] extends N
    ? [Swap, ...Chunk<T, N>]
    : T extends [infer K, ...infer L]
    ? Chunk<L, N, [...Swap, K]>
    : Swap extends []
    ? Swap
    : [Swap]
```

# 类型操作符

## keyof

昨天的文章简单讲解了一下 keyof 的使用方法，但是并不全面

普通情况下

```ts
type Point = {
  x: number
  y: number
}

// P = 'x' | 'y'
type P = keyof Point
```

当类型中存在 string 或者 string 的索引签名时，情况可能不太好理解

```ts
type Arrayish = { [n: number]: unknown }
// A = number
type A = keyof Arrayish

type Mapish = { [k: string]: boolean }
// M = string | number
type M = keyof Mapish
```

1. 当使用 `number` 作为索引签名时，返回的类型为 `number`
2. 当使用 `string` 作为索引签名时，返回的类型为 `number | string`

### 解释

对于第一种情况， 由于索引的类型为 number，所以任意的 number 都可以作为 Arrayish 的 key

对于第二种情况，由于在 JavaScript 中， `a[0]` 和 `a['0']` 是等价的，所以 number 和 string 都可以作为 Mapish 的 key

## typeof 运算符 和 ReturnType

这里的 typeof 和 JavaScript 中的并不是同一个，用法如下

我个人的理解是，typeof 是类型声明空间和值声明空间之间的桥梁，如下所示

```ts
let a = 'Hello'
let b: typeof a
```

### ReturnType

但是 typeof 在面对一些类型时，不能很好的表现

在下面这种场景中

```ts
type Predicate = (x: unknown) => boolean
// ReturnType 用于获取函数的返回值，后面会详细讲工具类型
type K = ReturnType<Predicate> // boolean

function f() {
  return { x: 10, y: 3 }
}

// 正确 传值是type
// R = {x: number, y: number}
type R = ReturnType<typeof f>

// 错误 Return Type只能接受 type, 这里传的是具体值
? type P = ReturnType<f>
```

## 索引访问类型

```ts
type Person = {
  age: number
  name: string
  alive: boolean
}
type Age = Person['age'] // 正确 Person 类型有 age 属性
? type Age = Person['gender'] // 错误 Person 类型没有 gender 属性
```

因为索引也是一种类型，那么我们也可以使用联合类型或者键类型

```ts
// type T = string | number
type T = Person['age' | 'name']

// 甚至可以这么传值
// type T = string | number | boolean
type All = Person[keyof Person]
```

## 条件类型

TypeScript 为我们提供了 extends 关键字，现在我们可以通过 extends 来构建三目运算

```ts
// number
type Example = true extends boolean ? number : string
// never
type AnotherExample = number extends boolean ? number : never
```

### 和 infer 关键词一起使用

infer 关键词用于推导类型

例如，这里我们手写上面使用过的 ReturnType (type-challenge #9 难度中)

```ts
// type-challenge #9 - My Return Type
type MyReturnType<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => infer R
  ? R
  : any
```

## 分配条件类型

```ts
type ToArray<Type> = Type extends any ? Type[] : never

// 执行过程
// type StrArrOrNumArr
// = ToArray<string | number>
// = ToArray<string> | ToArray<number>
// = string[] | number[]
type StrArrOrNumArr = ToArray<string | number>
// string[] | number[]
```

但是某些情况下，我们需要给每个元素指定 `string | number` 类型

```ts
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never

type StrArrOrNumArrNonDist = ToArrayNonDist<string | number>
// (string | number)[]
```

## 映射类型

映射类型建立在索引签名的语法之上，通常使用 `keyof` 创建迭代键

例如 `ReadOnly<T>` 和 `Pick<T>`

```ts
type ReadOnly<T> = {
  readonly [K in keyof T]: T<K>
}

type Pick<T, K extends keyof T> = {
  [P in K]: T[K]
}
```

### 映射修饰符

在映射类型中 可以使用 `readonly` 和 `?` 修饰符，可以使用 `+` 来添加修饰符，或者 `-` 来去除修饰符， 如果没有 `+/-`，则默认为 `+`

语法大致如下

```ts
type Show = {
  readonly readOnlyProperty: number
  optionalProperty?: number
}

type MyRequired<T> = {
  [P in keyof T]-?: T[P]
}
```

### 类型重映射

类似于 Array.prototype.map()

下面是筛选 T 中 R 类型的键的工具类型

```ts
type Person = {
  age: number
  name: string
  alive: boolean
}

type FilterByType<T, R> = {
  [K in keyof T as T[K] extends R ? K : never]: T[K]
}

// { age: number }
type filterPerson = FilterByType<Person, number>
```

官方示例，用于创建新的属性名

```ts
type Getters<Type> = {
  // Capitalize 为 首字母大写 的工具类型
  [P in keyof Type as `get${Capitalize<string & P>}`]: () => Type[P]
}

interface Person {
  name: string
  age: number
  location: string
}

// type LazyPerson = {
//     getName: () => string;
//     getAge: () => number;
//     getLocation: () => string;
// }
type LazyPerson = Getters<Person>
```

官方示例，用于过滤指定名称的键

```ts
type RemoveKindField<Type> = {
  [Property in keyof Type as Exclude<Property, 'kind'>]: Type[Property]
}

interface Circle {
  kind: 'circle'
  radius: number
}

type KindlessCircle = RemoveKindField<Circle>
```

## 模板字符串类型

模板字符串和 ES6 中的模板字符串语法一致的，但是 `${}` 里写的是类型

```ts
type world = 'world'

// 等同于 'Hello world'
type HelloWorld = `Hello ${world}`
```

同样里面也可以使用联合类型等，ts 会根据类型自动分配

### 模板字符串使用

如果有下面这种情况

```ts
const person = makeWatchedObject({
  firstName: 'Saoirse',
  lastName: 'Ronan',
  age: 26,
})

person.on('firstNameChanged', (newValue) => {
  console.log(`firstName was changed to ${newValue}!`)
})

// 使用这个工具类，可以在使用错误的属性时，给予提示
type PropEventSource<Type> = {
  on(
    eventName: `${string & keyof Type}Changed`,
    callback: (newValue: any) => void
  ): void
}

/// Create a "watched object" with an 'on' method
/// so that you can watch for changes to properties.
declare function makeWatchedObject<Type>(
  obj: Type
): Type & PropEventSource<Type>
```

### 字符串操作类型

```ts
// 字母转换为大写 HELLO
type upperCase = Uppercase<'Hello'>

// 字母转换为小写 hello
type lowerCase = Lowercase<'Hello'>

// 字母转换为首字母大写 Hello
type capitalize = Capitalize<'hello'>

// 首字母取消大写
type uncapitalize = Uncapitalize<'hello'>
```

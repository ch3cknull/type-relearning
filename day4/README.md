# 刷几个题

## String to Number

题目要求：将 string 转换成 number， 实现类似 parseInt 的功能

### 解题思路

如果是比较小的数字，我们可以直接使用数组和递归来实现

```ts
type toNumber<T extends string, R extends any[] = []> =
  `${T}` extends `${R['length']}` ? R['length'] : toNumber<T, [...R, 0]>
```

但是 Ts 存在递归层数限制，那么我们就不能这么来做了，因为在这种情况下，大概 20 几层就无法继续递归了

也就是说，上面的这种方式只是对比较小的数适用

现在我们修改一下新的思路

0. 如果字符串为空或单个数字，直接使用 toNumber 返回对应的元素
1. 从字符串中取出首位，然后向数组中添加对应数量的元素
2. 如果之前结果数组有元素，表示高位上有数字，就将原数组复制十份再加上当前元素的个数
3. 将字符串剩余的位置带入这里，如果存在后续，则继续带入

那么 大概就是这样

```ts
type 字符串转数字<字符串 extends string, 结果数组 extends any[] = []> =
  字符串 extends `${infer 第一个字符}${infer 剩下的字符}`
    ? 字符串转数字<
        剩下的字符,
        [...复制十份<结果数组>, ...普通的转数字<第一个字符>]
      >
    : 结果数组['length'] // 结果数组的长度
```

很轻易就能写出答案了

<details>
<summary>
展开查看答案
</summary>

```ts
type Make10<T extends any[]> = [
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T,
  ...T
]

type toTuple<T extends number | string, R extends any[] = []> =
  `${T}` extends `${R['length']}` ? R : toTuple<T, [...R, 0]>

type ToNumber<T extends string, Res extends any[] = []> =
  `${T}` extends `${infer L}${infer R}`
    ? ToNumber<R, [...Make10<Res>, ...toTuple<L>]>
    : Res['length']
```

</details>

## Integers Comparator

设计一个整数比较器 `Comparator<A, B>`, 需要支持正数，负数，和 0

如果 A == B, 返回 Comparison.Equal
如果 A > B, 返回 Comparison.Greater
如果 A < B, 返回 Comparison.Less

### 解题思路

1. 设计一个只能比较正数的比较器
2. 在只能比较正数的比较器上做修改，能比较大数
3. 特殊情况处理

- 如果都是正数，直接对比
- 如果有一个是负数，直接根据正负数情况返回
- 如果两个都是负数，先取绝对值再交换顺序再对比

<details>
<summary>
展开查看答案
</summary>

```ts
enum Comparison {
  Greater,
  Equal,
  Lower,
}

type NumberType = string | number

type NumberToArray<T extends NumberType, R extends any[] = []> =
  `${T}` extends `${R['length']}` ? R : NumberToArray<T, [0, ...R]>

type Comparator<A extends number, B extends number> = A extends B
  ? Comparison.Equal
  : `${A}` extends `-${infer K}`
  ? `${B}` extends `-${infer T}`
    ? BaseComparator<NumberToArray<T>, NumberToArray<K>>
    : Comparison.Lower
  : `${B}` extends `-${infer _}`
  ? Comparison.Greater
  : BaseComparator<NumberToArray<A>, NumberToArray<B>>

type BaseComparator<A extends any[], B extends any[]> = A extends [
  infer _,
  infer _,
  infer _,
  ...infer R
]
  ? B extends [infer _, infer _, infer _, ...infer K]
    ? BaseComparator<R, K>
    : Comparison.Greater
  : A extends [infer _, ...infer R]
  ? B extends [infer _, ...infer K]
    ? BaseComparator<R, K>
    : Comparison.Greater
  : Comparison.Lower
```

</details>

// 这里的 T 其实类似一个变量, TS 会根据传入的值自动推导类型
// 这里所有的T都是相同类型的，如果你喜欢也可以换成其他的名字
function identity<T>(arg: T): T {
  return arg
}

// hello 的类型为 'hello'
const hello = identity('hello')
// string 的类型为 string
const string = identity<string>('hello')

function loggingIdentity<Type>(arg: Type): Type {
  if (Array.isArray(arg)) {
    console.log(arg.length)
  }
  return arg
}

const f = <T>(args: T): T => args

type NotEnsure = {
  [s: string]: string
}

type GenericIdentifyFn<T> = (args: T) => T

const a: GenericIdentifyFn<string> = (a) => a

const getProperty = <T, K extends keyof T>(obj: T, key: K) => obj[key]

const obj = {
  a: 1,
  b: 2,
}

getProperty(obj, 'b')

type Chunk<T extends any[], N extends number, Swap extends any[] = []> =
Swap['length'] extends N
? [Swap, ...Chunk<T, N>]
: T extends [infer L, ...infer R]
  ? Chunk<R, N, [...Swap, L]>
  : Swap extends [] ? Swap : [Swap]
type Arrayish = { [n: number]: unknown }
type A = keyof Arrayish

type Mapish = { [k: string]: boolean }
type M = keyof Mapish

type Predicate = (x: unknown) => boolean
type K = ReturnType<Predicate>

function ff() {
  return { x: 10, y: 3 }
}

// 正确 传值是type
type R = ReturnType<typeof ff>

type Person = {
  age: number
  name: string
  alive: boolean
}
type Age = Person['age'] // 正确 Person 类型有 age 属性

type All = Person[keyof Person]

// number
type Example = true extends boolean ? number : string
// never
type AnotherExample = number extends boolean ? number : never

type ToArray<Type> = Type extends any ? Type[] : never

// 执行过程
// type StrArrOrNumArr
// = ToArray<string | number>
// = ToArray<string> | ToArray<number>
// = string[] | number[]
type StrArrOrNumArr = ToArray<string | number>

type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never

type StrArrOrNumArrNonDist = ToArrayNonDist<string | number>

type MyRequired<T> = {
  [P in keyof T]-?: T[P]
}

type a = { a?: 1 }

type MyRequiredA = MyRequired<Partial<a>>

type FilterByType<T, R> = {
  [K in keyof T as T[K] extends R ? K : never]: T[K]
}

type filterPerson = FilterByType<Person, number>

type RemoveKindField<Type> = {
  [Property in keyof Type as Exclude<Property, 'kind'>]: Type[Property]
}

interface Circle {
  kind: 'circle'
  radius: number
}

type KindlessCircle = RemoveKindField<Circle>

type EventConfig<Events extends { kind: string }> = {
  [E in Events as E['kind']]: (event: E) => void
}

type SquareEvent = { kind: 'square'; x: number; y: number }
type CircleEvent = { kind: 'circle'; radius: number }

type Config = EventConfig<SquareEvent | CircleEvent>

type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false
}

type DBFields = {
  id: { format: 'incrementing' }
  name: {
    type: string
    pii: true
  }
}

type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>

type Map<T> = {
  [P in keyof T]: T[P]
}

type RequireOnlyOne<T, K extends keyof T> = Map<
  {
    [R in keyof T as `${R & string}` extends K ? never : R]?: T[R]
  } &
    {
      [R in K]-?: T[R]
    }
>

type RequireOnlyOne2<T, K extends keyof T> = Map<
  Exclude<T, K> & Required<Pick<T, K>>
>

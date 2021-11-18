# 重学 TypeScript

之前的 TS 知识都是乱啃的，没有系统的看过文档，这次回来

这次很高兴参与了瑞哥 [@cuixiaorui](https://github.com/cuixiaorui) 的对赌学习

这次对赌学习从 11 月 18 日 到 11 月 21 日，每天晚九点到十点半，[直播间地址](https://live.bilibili.com/21877310)

欢迎加入我们，一起学习，这里是[项目链接](https://github.com/cuixiaorui/study-every-day/tree/main/bet)

以下是个人进度(待施工)

进度：第一天内容已更新

## 文档阅读产出

| 时间   | 产出                       |
| ------ | -------------------------- |
| 第一天 | [初识泛型](day1/README.md) |
| ...    | ...                        |

 <!--   | 第二天(WIP)                | [day2/README.md](day2/README.md) | -->
 <!--   | 第三天(WIP)                | [day3/README.md](day3/README.md) | -->
 <!--   | 第四天(WIP)                | [day4/README.md](day4/README.md) | -->

## Challenge Writeup

[项目地址](https://github.com/ch3cknull/tsChallengeWriteup)

记录自己刷 type-challenge 的过程

前两天给 type-challenge 提了一个[新题目 Greater Than](https://github.com/type-challenges/type-challenges/blob/master/questions/4425-medium-greater-than/README.md)

在设计题目的时候，有些之前学不明白的东西一下就通了

刷题大概就是先看每个关键词的用法，

- infer： 推导类型
- extends： 判断类型继承关系
- keyof： 提取对象的 key，和 in 一起使用来遍历对象
- in
- is 用于类型保护
- as 遍历对象时使用，用于改变 key
- 模板字符串类型 很常用
- & 两个对象取并集
- | 或
- 工具类型 Partial，Exclude，Omit 以及其他，后面会有自己实现这些工具类的题目

看完上面这些关键字或者工具类型的用法之后，就可以开始刷题了

刷题可以按照简单题到中等题，有些中等题的难度比困难还要高，如果实在看不懂先试试别的题目

如果看题解看不明白，不要照抄，慢慢分解开，看实现的思路

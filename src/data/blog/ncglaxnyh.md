---
title: "内存管理和性能优化"
description: "前言： 本文主要介绍了自动内存管理中的常见GC算法和思想、Go的内存分配及字节的优化策略、编译器及其优化方法。 分析问题的方法与解决问题的思路，不仅适用于Go语言，其它语言优化也同样适用。 相关术语： 自动内存管理 Auto memory"
pubDatetime: 2023-01-19T06:28:57Z
tags:
  - Golang
draft: false
---

# 前言：

本文主要介绍了自动内存管理中的常见GC算法和思想、Go的内存分配及字节的优化策略、编译器及其优化方法。

分析问题的方法与解决问题的思路，不仅适用于Go语言，其它语言优化也同样适用。

## 相关术语：

### 自动内存管理

- Auto memory management: 自动内存管理
- Grabage collction: 垃圾回收
- Mutator: 业务线程
- Collector: GC 线程
- Concurrent GC: 并发 GC
- Parallel GC: 并行 GC
- Tracing garbage collection: 追踪垃圾回收 Copying GC: 复制对象 GC Mark-sweep GC: 标记-清理 GC Mark-compact GC:
  标记-压缩 GC
- Reference counting: 引用计数
- Generational GC: 分代 GC Young generation: 年轻代 Old generation: 老年代

### Go 内存管理及优化

- TCMalloc
- mmap() 系统调用
- scan object 和 noscan object
- mspan, mcache, mentral
- Bump-pointer object allocation: 指针碰撞风格的对象分配

### 编译器和静态分析

- 词法分析
- 语法分析
- 语义分析
- Intermediate representation (IR) 中间表示
- 代码优化
- 代码生成
- Control flow: 控制流
- Data flow: 数据流
- Intra-procedural analysis 过程内分析
- Inter-procedural analysis: 过程间分析

### Go 编译器优化

- Function inlining: 函数内联
- Escape analysis: 逃逸分析

# 自动内存管理(GC)

## 背景：

- 动态内存 程序在运行时根据需求动态分配的内存
- 自动内存管理：由程序语言的运行时系统回收动态内存 避免手动管理 保证正确性和安全性
- 任务 为新对象分配空间 找到存活对象 回收死亡对象的内存空间

## GC 算法：

### Serial GC：

Serial GC ,是新生代的垃圾回收器， Serial 体现在其收集工作是单线程的，并且在垃圾收集过程中，其他线程阻塞，进入 Stop Thre
World 状态。新生代使用的 Serial 垃圾回收器，是基于复制算法的。

### Parallel GC：

并行垃圾收集器：在young generation使用mark-copy，在Old Generation使用mark-sweep-compact；且在Young Generation和Old
Generation 都会stop-the-world；收集器都使用多线程进行标记-复制和标记-压缩。

### Concurrenty GC：

可以同时执行mutator和collector。

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-19_11-04-02.webp)

## GC技术：

### 追踪垃圾回收：

追踪垃圾回收一般可分为三个步骤：

- 标记根对象（静态变量、全局变量、常量、线程栈等）
- 找到可达对象 求指针指向关系的传递闭包：从根对象出发，找到所有可达对象
- 清理所有不可达对象

清理所有不可达对象清理策略，常见的有以下三种：

Copying GC：将对像复制到另外的内存空间

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-19_11-13-30.webp)

Mark-sweep GC：将死亡对象的内存标记为可分配，使用free list管理空闲内存

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-19_11-15-27.webp)

Mark-compact GC：移动并整理存活内存

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-19_11-19-36.webp)

### 分代GC（Generational GC）：

我们看到有上述三种内存清理方法，那么我们应该如何去选择呢。这时就提出了一种思想：根据对象的生命周期，使用不同的标记和清理策略。

分代GC是一种常见的内存管理方式，基于这样一个假设：大部分新分配的对象存活周期较短，在分配后的第一轮GC中就会被回收掉。.
如果这个假设成立，那么GC期间只去扫描和清扫新分配的对象就可以清扫掉大部分需要回收的对象，这样就可以节省GC的时间。

分代GC认为，每个对象都有年龄（经历过的GC次数），不同年龄的对象处于heap的不同区域，这样做的目的可以针对年轻和老年对象，制定不同的GC策略，降低整体的内存管理开销。

- Young generation 常规的对象分配，由于存活对象少，可以采用copying GC GC吞吐率很高
- Old generation 对象趋向于一直活着，反复复制开销较大 可以采用Mark-sweep GC

### 引用计数：

引用计数 是计算机 编程语言 中的一种 内存管理 技术 ，是指将资源（可以是 对象 、 内存 或 磁盘 空间等等）的被 引用
次数保存起来，当被引用次数变为零时就将其释放的过程。

- 优点 内存管理的操作被平摊到程序执行过程中 内存管理不需要runtime都实现细节
- 缺点 维护引用的计数开销较大；通过原子操作保证对引用计数操作的原子性和可见性 无法回收环形数据结构 内存开销
  回收内存时依然可能引发暂停

# Go内存管理及优化：

## Go内存分配：

### 分块：

为对象在heap上分配内存，根据对象的大小，选择最合适的快返回

分配步骤：

- 调用系统调用mmap()向OS申请一大块内存
- 先将内存划分为大块，称作mspan
- 再将大块继续划分为特定大小的小块，用于对象分配
- noscan mspan：分配不包含指针的对象
- scan mspan：分配包含指针的对象

### 缓存：

- 每个p包含mcache用于快速分配，用于绑定于p上的g分配对象
- 当mcache中的mspan分配完毕后，向mcentral申请带有未分配块的mspan
- 当mspan中没有分配对象，mspan会被缓存在mcentarl中，而不是立刻释放并归还给OS

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-19_12-49-29.webp)

通过上图可以看出，分配的路径长为：g-->m-->p-->mcache-->mspan-->memory block-->return
pointer。对象的分配是非常高频的操作（GB/s），同时也非常耗时，从而导致cpu的消耗较高。

## 字节优化策略（Balanced GC）：

- 每个g都绑定一大块内存（1kb），称作GAB
- GAB使用noscan类型的小对象分配
- 使用三个指针维护GAB：base、end、top
- Bump pointer风格对象分配 分配动作简单高效 无须和其它分配请求互斥

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-19_12-58-14.webp)

Balanced GC的本质是一个对象，将多个小对象的分配合并一次达到对象的分配。同时就出现了弊端，此方式分配会导致内存被延迟释放(
在一个1K的GAB中只有一个8KB的使用，但此时这个空间也会被标记为活的)。此问题借鉴copying GC的算法解决，将存活的对象复制到另外的GAB中，然后释放原来的GAB。

个人思考：
当GAB总大小超过一定阈值时, 将GAB中存活的对象复制到另外分配的GAB中. 这里不太明白, GAB大小是否是固定的? 总大小超过阈值说明在使用中,
为什么还要拷贝? 复制到另外分配的GAB中, 新分配的GAB是否还是当前g独占, 一个g可以有多个GAB? 仔细想想这个GAB也没有那么简单。难，太难了。

# 编译器和静态分析：

## 编译器结结构：

编译器是系统软件，用于识别符合语法和非法程序，生成正确且高效的代码。

- 分析部分（front end） 词法分析，生成词数 词法分析，生成语法树 语义分析，收集类型信息，进行语义检查 中间代码生成，生成IR
- 综合部分（back end） 代码优化，机器无关优化，生成优化后的IR 代码生成，生成目标代码

  ![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-19_13-14-45.webp)


## 静态分析：

不执行程序代码，推导程序的行为，分析程序的性质。通过分析控制流和数据流，我们可以知道更多关于程序的性质，并根据这些性质优化代码。

- 控制流：程序执行的流程
- 数据流：数据在控制流上的传递

  ![](https://pic.lamper.top/wp/2023/01/d0a30083-ec8a-4242-af50-7faffe5f7d92.webp)

## 过程内分析和过程间分析：

过程内分析：仅在函数内部进行数据流和控制流的分析

不考虑任何的过程/函数间调用的分析算法。 总的来说，这是最基础也是最简单的一类程序分析算法， 但是其实还是比较有用，
特别是在二进制分析的实际应用中这还算是比较常用的。

过程间分析：考虑函数调用时参数传递和返回值的数据流和控制流

- 对不同过程采用不同抽象域
- 在调用和返回的时候添加结点来转换信息
- 全局变量需要加到所有使用的过程和这些过程的直接和间接调用者中

动机1：在数据流分析中，很多转换函数的效果可以互相抵消，但我们还是要针对每一个进行计算。
动机2：程序分析中大量代码是库代码，往往分析一个很小的程序就要分析大量库代码。

# Go编译器优化：

## 函数内联（Inlning）：

将被调用函数的函数体的副本替换到调用位置上，同时重写代码以反映参数的绑定

- 优点 消除函数调用开销，例如参数传递 将过程间分析转化为过程内分析(没有了函数调用，就变为了一整个函数)，帮助其它优化，例如逃逸分析
- 缺点 函数体变大，icache不友好 编译生成的Go镜像变大

虽然有缺点，但是内联对于性能的影响还是很大的，以下代码可以使用micro-benchmark验证。

```go
func BenchmarkInline(b *testing.B) {
	x := genIntegers()
	y := genIntegers()
	for i := 0; i < b.N; i++ {
		addInline(x, y)
	}
}
func addInline(x, y int) int {
	return x + y
}
```

```go
func BenchmarkInlineDisabled(b *testing.B) {
 x := genIntegers()
 y := genIntegers()
for i := 0; i < b.N; i++ {
  addNoInline(x, y)
}
}
//go:noinline，强制要求不Inline
func addNoInline(x, y int) int {
  return x + y
}

```

## Beast Mode：

函数内联受到的限制较多，因为Go的语言特性（defer），限制了函数的内联。

使用Beast Mode调整函数内联的策略，使更多函数被内联，降低了函数调用的开销，增加了其它优化机会（逃逸分析）

## 逃逸分析：

分析代码中指针的动态作用域（指针在何处可以被访问）

大致思路：

- 从对象分配处出发，沿着控制流，观察对象的数据流
- 若发现指针p在当前作用域s： 作为参数传递给其它函数 转递给全局变量 传递给其它的goroutine 传递给以逃逸的指针指向的对象
- 则指针p指向的对象逃逸出s，反之则没有
- Beast Mode：函数内联扩展了函数边界，更多对象不逃逸
- 优化：未逃逸对象可以在栈上分配 对象在栈上分配和回收很快 减少在heap上的分配，降低GC负担

# 引用：

[过程间分析](https://blog.csdn.net/sinat_38816924/article/details/121889543)

[Java 常见的垃圾回收器-阿里云开发者社区 \(aliyun.com\)](https://developer.aliyun.com/article/935230)

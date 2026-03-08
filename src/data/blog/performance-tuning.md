---
title: "高质量编程-性能调优"
description: "前言： 高质量的代码可以完成功能，但我们还需要考虑尽可能的提升性能，节省资源成本。本文结合Go语言展开。 性能优化建议 介绍： 性能表现需要实际的数据来支持衡量 性能优化是综合的，有时候时间和空间是不能兼顾的，所谓的时间换空间or空间换时间"
pubDatetime: 2023-01-18T15:45:02Z
tags:
  - Golang
draft: false
---

# 前言：

高质量的代码可以完成功能，但我们还需要考虑尽可能的提升性能，节省资源成本。本文结合Go语言展开。

# 性能优化建议

介绍：

- 性能表现需要实际的数据来支持衡量
- 性能优化是综合的，有时候时间和空间是不能兼顾的，所谓的时间换空间or空间换时间

## Benchmark

性能的表现需要数据来说话，Go语言提供了支持基准性能测试的benchmark工具。

使用go test -bench=, -benchmem命名即可调用

```go
// 一个例子
// from fib.go
func Fib(n int) int {
    if n < 2 {
        return n
    }
    return Fib(n - 1) + Fib(n - 2)
}

// from fib_test.go
func BenchmarkFib10(b *testing.B) {
    // run the Fib funciton b.N times
    for n := 0; n < b.N; n++ {
        Fib(10
    }
}
```

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-18_22-18-58.webp)

## Slice：

尽可能在使用make()初始化的时候就提供容量信息，获得更好的性能。

当append之后的len<=cap,将会直接利用底层数组剩余的容量空间。但当len>cap时，则会分配一块更大的区域来容纳新的底层数组。因此，为了避免内存发生拷贝，最好预先设置cap。

究其原因：

- 切片本质是一个数组片段的描述包括数字指针、片段的长度以及片段的容量
- 切片操作并不复制切片指向的元素
- 创建一个新的切片会复用原来切片的底层数组

另一个陷阱--大内存未释放：

有一种情况，原切片由大量元素构成，但是我们在原切片的基础上切片，虽然只使用了很小一段，但底层数组在内存中仍然占据了大量的空间，得不到释放。我们可以使用copy代替re-slice

```go
//re-slice
func GetLastSlice(origin []int) []int {
    return origin[len(origin)-2:]
}
//copy
func GetLastCopy(origin []int) []int {
    result := make([]int,2)
    copy(result,origin[len(origin)-2:])
    return
}
```

可以使用go test -run=. -v来查看性能

## Map预分配内存：

与slice一样，建议根据实际需求提前预估好需要的空间

原因：

- 不断向map中添加元素的操作会触发map扩容
- 提前分配好空间可以减少内存拷贝和Rehash(重新的分配并加入新的桶内)的消耗

## 字符串处理：

字符产拼接建议使用strings.Builder，使用+的拼接性能最差。分析：

- 字符串在Go语言中是不可变类型，占用内存大小是固定的
- 使用+每次都会重新分配内存
- strings.Builder, bytes.Buffer底层都是[]byte数组
- 内存扩容策略，不需要每次拼接重新分配内存

```go
// 例子
func StrBuilder(n int, str string) string {
    var builder strings.Builder
    for i := 0; i < n; i++ {
        builder.WriteString(str)
    }
    return builder.String()
}
```

## 空结构体：

空结构体是节省内存空间的一个手段。

- 空结构体struct{}实例不占据任何的内存空间
- 可作为各种场景下的占位符使用 节省资源 空结构体本身具备很强的语义，不需要任何值，仅作为占位符

```go
// 一个例子
func EmptyStructMap(n int) {
    m := make(map[int]struct{})
    for i := 0; i < n; i++ {
        m[i] = struct{}{}
    }
}

func BoolMap(n int){
    m := make(map[int]bool)
    for i := 0; i < n; i++ {
        m[i] = false
    }
}
```

## atomic包：

原子性：一个或多个操作在CPU的执行过程中不被中断的特性，称为原子性。这些操作对外表现成一个不可分割的整体，他们要么都执行，要么都不执行，外界不会看到他们只执行到一半的状态。

原子操作：进行过程中不能被中断的操作，原子操作由底层硬件支持，而锁则是由操作系统提供的API实现，若实现相同的功能，前者通常会更有效率

Go语言提供的原子操作都是非入侵式的，由标准库中sync/aotomic中的众多函数代表。

提供了 AddXXX、CompareAndSwapXXX、SwapXXX、LoadXXX、StoreXXX 等方法。

# 性能调优实战：

调优原则：

- 依靠数据而非猜测
- 找到决速反应，而非细枝末节
- 不要过早和过度的优化

## 性能分析工具pprof：

炸弹程序：[wolfogre/go-pprof-practice: go pprof practice. \(github.com\)](https://github.com/wolfogre/go-pprof-practice)

### 功能简介

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-18_23-00-21.webp)

### 实战排查

运行炸弹程序后打开浏览器访问 http://localhost:6060/debug/pprof/即可查看数据。

排查实战：

详细文档：[golang pprof 实战 | Wolfogre's Blog](https://blog.wolfogre.com/posts/go-ppof-practice/)
（已经写的很好了，我又何必画蛇添足，实际操作一遍，自然就会了）

# 性能调优案例

## 业务服务优化：

业务服务一般指直接提供功能的程序。

### 基本概念：

- 服务：能单独部署，承载一定功能的程序
- 依赖：Service A的功能实现依赖，Service B的响应结果，称为Service A依赖Service B
- 调用链路：能支持一个接口请求的相关服务集合及其相互之间的依赖关系
- 基础库：公共的工具包、中间件

### 流程：

通用的流程，也可以适用其它场景

- 建立服务性能评估手段
- 分析性能数据，定位性能瓶颈（Go中主要使用pprof） 使用库不规范 高并发场景优化不足
- 重点优化项改造 正确性是基础
- 优化效果验证 重复测压验证 上线评估优化效果

永不满足，未完待续..

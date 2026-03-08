---
title: "高质量编程-编码规范"
description: "前言： 实际应用场景千变万化，各种语言的特性和语法各不相同，但是高质量编程遵循的原则是相通的 Dave Cheney 编写的代码能够达到正确可靠，简洁清晰的目标可称之为高质量代码。应该具备一下三点。 各种边界条件是否考虑完备 异常处理 易读"
pubDatetime: 2023-01-18T05:34:31Z
tags:
  - Golang
draft: false
---

# 前言：

实际应用场景千变万化，各种语言的特性和语法各不相同，但是高质量编程遵循的原则是相通的
Dave Cheney

编写的代码能够达到正确可靠，简洁清晰的目标可称之为高质量代码。应该具备一下三点。

- 各种边界条件是否考虑完备
- 异常处理
- 易读易维护

## 代码格式：

代码格式化一般coder不需要特别注意。

在Java中，可以使用插件Save Actions，在保存或者切换窗口时便会自动格式化。

Go语言官方提供了gofmt自动格式化工具，在常见的ide中均可配置。同时也可以安装goimports，实际上等于gofmt加上依赖包管理，自动增删依赖包的管理。[goimports安装及配置教程](https://blog.csdn.net/qq_45812369/article/details/117394275)

## 注释：

Good code has lots of comments,bad code requires lots of comments
Dave Thomas and Andrew Hunt

### 解释代码作用

说明公共符号，比如提供对外的函数注释描述它的功能和用途，只有在函数的功能简单而明显时才可以省略这些注释，但同时也要避免过于啰嗦，通过方法名就很容易知道作用的就没有必要加上。

```go
// Open opens the named file for reading. If successful, methods on
// the returned file can be used for reading; the associated file
// descriptor has mode O_RDONLY.
// If there is an error, it will be of type *PathError.
func Open(name string) (*File, error) {
	return OpenFile(name, O_RDONLY, 0)
}
```

### 解释代码如和做的

对代码中复杂的，并不明显的逻辑进行说明，适合注释实现过程。

下面这段代码中。显而易见的就可以看出流程，就可以不必使用注释。

```go
//Process every element in the list
for e := range elements{
    process(e)
}
```

### 解释代码实现原因

解释代码的外部因素，提供额外的上下文。比如下面代码中的shouldRedirect = false,如果没有注释，便无法搞清楚为什么设置值为false。

```go
if ireq.GetBody == nil && ireq.outgoingLength() != 0 {
	// We had a request body, and 307/308 require
	// re-sending it, but GetBody is not defined. So just
	// return this response to the user instead of an
	// error, like we did in Go 1.7 and earlier.
	shouldRedirect = false
}
```

### 解释代码什么情况下会出错

注释应该提醒使用者代码中存在的一些潜在的限制条件或者无法处理的情况。

```go
// parseTimeZone parses a time zone string and returns its length. Time zones
// are human-generated and unpredictable. We can't do precise error checking.
// On the other hand, for a correct parse there must be a time zone at the
// beginning of the string, so it's almost always true that there's one
// there. We look at the beginning of the string for a run of upper-case letters.
// If there are more than 5, it's an error.
// If there are 4 or 5 and the last is a T, it's a time zone.
// If there are 3, it's a time zone.
// Otherwise, other than special cases, it's not a time zone.
// GMT is special because it can have an hour offset.
func parseTimeZone(value string) (length int, ok bool)
```

### 公共符号始终要注释

1.包中声明的每一个公共符号：变量、常量、函数以及结构体

2.任何进既不明显也不简短的公共功能必须注释

3.无论长度or复杂程度如和，对库中的函数必须注释

4.不需要注释实现接口的方法

## 命名规范

Good naming is like a good joke.If you have to explain it,it's not funny.
Dave Cheney

### variable:

- 简洁
- 缩略词全部大写，但其位于变量开头时且不需要导出时，全部使用小写
- 变量距离其被使用的地方越远，则命名需要携带更多的上下文信息（全局变量）

在我们写for循环的时候，对于变量i仅在for循环的内部使用，就可以适当的缩写。

```go
//Bad
for index := 1;index < 10;index++{}
//Good
for i :=i;i < 10;i++{}
```

但是对于有特殊含义的，就必须要写清楚。如下代码，将deadline换为t就减少了变量名所携带的信息。

```go
func (c *Client) send (req *Request,deadLine time.Time)
//Bad
func (c *Client) send (req *Request,t time.Time)
```

### function:

- 函数名不携带包的上下文信息
- 尽量简短
- 当名为foo的包某个函数返回的类型为Foo时，可以省略类型信息而不导致歧义
- 当名为foo的包某个函数返回的类型为T时，可以在函数名中加入类型信息

思考：以下哪种命名更好(在http包下)

```go
//1.
func Serve() error
//2.func DerveHTTP() error
```

### package：

- 只有小写字母构成。不包含大写字母和下划线等字符
- 简短并包含一定上下文信息
- 不要与标准库同名
- 不使用常量名作为包名
- 使用单数而非复数
- 谨慎的使用缩写

## 控制流程：

- 处理逻辑尽量走直线，避免复杂的嵌套分支
- 代码的流程应该沿着屏幕向下移动
- 提升代码的可维护性和可读性
- 故障问题大多出现在复杂的条件语句or循环语句中

### 避免嵌套：

常见的就是if else语句，当两个分支都有return语句时，根据if的执行特点，就可以去掉多余的else

```go
//Bad
if foo {
   return x
}else {
   return nil
}
//Good
if foo {
   return x
}
return nil
```

### 保持正常代码路径为最小缩进：

先给出代码，可以观察区别。哪一种更直观不言而喻了吧

```go
//Bad
func OneFunc() error {
	if err != doSomething()
	if err == nil{
		err := doSomethingElse()
		if err == nil {
			return nil
		}
		return err
	}
	return err
}
//Good
func OneFunc() error {
	if err := doSomething();err != nil {
		return err
	}
	if err := doSomethingElse();err != nil {
		return err
	}
	return nil
}
```

## 错误及异常处理

### 简单错误：

- 简单错误：指仅出现一次的错误，且在其他地方不需要捕获该错误
- 优先使用errors.New来创建匿名变量来直接表示简单错误
- 如果有格式化需求，请使用fmt.Errorf

```go
// 一个例子
func defaultCheckRedirect(req *Request, via []*Request) error {
    if len(via) >= 10 {
        // 使用errors.New
        return errors.New("stopped after 10 redirects.")
    }
    return nil  // 去掉不必要的else
}
```

### 错误判定：

判定一个错误是否为特定错误，用errors.ls，不同于使用==，该方法可以判定错误链上的所有错误是否含有特定的错误

```go
// 一个例子
data, err = lockedfile.Read(targ)
if errors.Is(err, fs.ErrNotExist) {
    return []byte{}, nil
}
return data, err
```

在错误链上获取特定种类的错误，使用errors.As

```go
// 一个例子
if _, err := os.Open("non-existing"); err != nil {
    var pathError *fs.PathError
    if errors.As(err, &pathError) {
        fmt.Println("Failed at path:", pathError.Path)
    } else {
        fmt.Println(err)
    }
}
```

### Warp和Unwarp：

- 错误的Wrap实际上是提供了一个error嵌套另一个error的能力，从而生成一个error跟踪链
- 在fmt.Errorf中使用%w关键字来将一个错误关联至错误链中

好处是每一层调用方法可以补充自己对应的上下文，方便跟踪排查问题。

```go
// 一个例子
list, _, err := c.GetBytes(cache.Subkey(a.actionID, "srcfiles"))
if err != nil {
    return fmt.Errorf("reading srcfiles list: %w", err)
}
```

### panic：

panic比错误更严重，不建议在业务代码中使用，就不详细展开。

### recover：

- 只能在被defer的函数中使
- 嵌套无法生效
- 只在当前goroutine生效
- 注意defer是一个栈（后进先出）

如果需要更多的上下文信息可以在recover后在log中记录当前的调用栈

### 多defer语句输出（补）

```go
func main()  {
	if true {
		defer fmt.Println("1")
	}else {
		defer fmt.Println("2")
	}
	defer fmt.Println("3")
}
```

输出31

# 引用：

部分代码来自：

[https://github.com/golang/go/blob/master/](https://github.com/golang/go/blob/master/)

永不满足，未完待续...

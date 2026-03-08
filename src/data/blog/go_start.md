---
title: "Go语言初探"
description: "前言： 学习一门语言，先来一个小小的仪式感 package main import ( \"fmt\" ) func main() { fmt.Println(\"hello world\") } 基础语法： var package main im"
pubDatetime: 2023-01-15T05:51:59Z
tags:
  - Golang
draft: false
---

![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-15_14-35-53.webp)   ![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-15_14-36-16.webp)   ![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-15_14-32-27.webp)

# 前言：

学习一门语言，先来一个小小的仪式感

```go
package main

import (
	"fmt"
)

func main() {
	fmt.Println("hello world")
}
```

# 基础语法：

## var

```go
package main

import (
	"fmt"
	"math"
)

func main() {

	var a = "initial"

	var b, c int = 1, 2 //定义类型为int并直接赋值

	var d = true

	var e float64

	f := float32(e)

	// := 是声明和初始化变量的简写,会根据右边的值自动推断变量的类型
	g := a + "foo"
	fmt.Println(a, b, c, d, e, f) // initial 1 2 true 0 0
	fmt.Println(g)                // initialapple

	// 常量
	const s string = "constant"
	const h = 500000000
	const i = 3e20 / h
	fmt.Println(s, h, i, math.Sin(h), math.Sin(i))
}
```

- 变量在使用前必须先声明。
- 变量名不能重复定义。
- 如果是简短定义方式，左边至少有一个是新的变量。
- 如果定义了变量，必须得使用，否则编译无法通过。
- 全局变量可以不使用也能编译通过，定义的全局变量和局部变量名称如果相同，则会优先使用局部变量。
- 简短定义方式不能定义全局变量，也就是不能声明在函数外部。

- 常量数值不能修改。
- 常量定义后可以不使用。
- 常量定义不能使用简短定义方式。
- 常量中使用的数据类型只能是 整型、布尔、浮点、复数类型、字符串类型。
  ![](https://pic.lamper.top/wp/2023/01/Snipaste_2023-01-15_14-25-03.webp)

## for

在Go语言中，只有一个循环语句for。在Java中，for循环的条件需要用()，但是在Go中就可以省略。

以下代码分别用for表示了其它Java中的死循环、普通for循环和while循环。

```go
package main

import "fmt"

func main() {

	i := 1
	for {
		fmt.Println("loop")
		break
	}
	for j := 7; j < 9; j++ {
		fmt.Println(j)
	}

	for n := 0; n < 5; n++ {
		if n%2 == 0 {
			continue
		}
		fmt.Println(n)
	}
	for i <= 3 {
		fmt.Println(i)
		i += 1
	}
}
```

## if

```go
package main

import "fmt"

func main() {

	if 7%2 == 0 {
		fmt.Println("7 is even")
	} else {
		fmt.Println("7 is odd")
	}

	if 8%4 == 0 {
		fmt.Println("8 is divisible by 4")
	}

	if num := 9; num < 0 {
		fmt.Println(num, "is negative")
	} else if num < 10 {
		fmt.Println(num, "has 1 digit")
	} else {
		fmt.Println(num, "has multiple digits")
	}
}
```

## switch

Go 的 switch 语句类似于其它语言中的 case 语句，不过 Go 只运行选定的 case，而非之后所有的 case。自动提供了 break 语句。要想跳转到下一个
case，则应该使用 fallthrough 关键字，fallthrough 语句会强制执行后面的case语句，不论case表达式是否匹配。

switch语句可以在case后可以使用条件判断，从而代替if else

```go
package main

import (
	"fmt"
	"time"
)

// Go 的 switch 语句类似于其它语言中的 case 语句，不过 Go 只运行选定的 case，而非之后所有的 case。自动提供了 break 语句，
// 除非以 fallthrough 语句结束。
func main() {

	a := 2
	switch a {
	case 1:
		fmt.Println("one")
	case 2:
		fmt.Println("two")
	case 3:
		fmt.Println("three")
	case 4, 5: //  可以写多个值
		fmt.Println("four or five")
	default:
		fmt.Println("other")
	}

	t := time.Now() //获取当前时间
	switch {
	case t.Hour() < 12: //可以取代if else
		fmt.Println("It's before noon")
	default:
		fmt.Println("It's after noon")
	}
}
```

## Array

数组的长度是其类型的一部分，因此数组不能改变大小。这看起来是一个制约，但是请不要担心；Go 提供了更加便利的方式来使用数组。

```go
package main

import "fmt"

func main() {

	// 数组的长度是其类型的一部分，因此数组不能改变大小。这看起来是一个制约，但是请不要担心；Go 提供了更加便利的方式来使用数组。
	var a [5]int
	a[4] = 100 //定义下标4的值为100
	fmt.Println("get:", a[2])
	fmt.Println("len:", len(a)) //len获取数组长度

	b := [5]int{1, 2, 3, 4, 5}
	fmt.Println(b)

	// 二维数组
	var twoD [2][3]int
	for i := 0; i < 2; i++ {
		for j := 0; j < 3; j++ {
			twoD[i][j] = i + j
		}
	}
	//Go可直接输出数组
	fmt.Println("2d: ", twoD) // 2d:  [[0 1 2] [1 2 3]]
}
```

## slice

Go 的切片比数组更加强大。使用也更多。是一个可变长度的数组。其工作原理类似于Java中的ArrayList，会自动扩容。

需要注意的是，切片的 长度(length) 和 容量(capacity) 是两个完全不同的东西，前者才是切片实际的长度，后者则是一个阈值，当切片长度达到该阈值时才会对切片进行扩容。

```go
package main

import "fmt"

// Go 的切片比数组更加强大。使用也更多。是一个可变长度的数组
func main() {

	//Go中使用make函数创建切片,创建了一个长度为3，容量为10的切片
	s := make([]string, 3,10)
	s[0] = "a"
	s[1] = "b"
	s[2] = "c"
	fmt.Println("get:", s[2])   // c
	fmt.Println("len:", len(s)) // 3

	// append函数向切片中添加元素
	s = append(s, "d")
	s = append(s, "e", "f")
	fmt.Println(s) // [a b c d e f]

	c := make([]string, len(s))
	copy(c, s)     // copy函数将一个切片复制到另一个切片中
	fmt.Println(c) // [a b c d e f]

	fmt.Println(s[2:5]) // [c d e]  从下标2开始，到下标5结束，不包含下标5 [2,5)
	fmt.Println(s[:5])  // [a b c d e]
	fmt.Println(s[2:])  // [c d e f]

	good := []string{"g", "o", "o", "d"} // 直接创建切片
	fmt.Println(good)                    // [g o o d]
}
```

## map

```go
package main

import "fmt"

func main() {
	//Go中的map是一种无序的基于key-value的数据结构，Go中的map是引用类型，必须初始化才能使用
	m := make(map[string]int) //key为string类型，value为int类型
	m["one"] = 1
	m["two"] = 2
	fmt.Println(m)           // map[one:1 two:2]
	fmt.Println(len(m))      // 2
	fmt.Println(m["one"])    // 1
	fmt.Println(m["unknow"]) // 0 如果key不存在，返回value类型的零值

	//ok为bool类型，如果key存在，ok为true，否则为false
	r, ok := m["unknow"]
	fmt.Println(r, ok) // 0 false

	delete(m, "one")

	m2 := map[string]int{"one": 1, "two": 2}
	var m3 = map[string]int{"one": 1, "two": 2}
	fmt.Println(m2, m3)
}
```

## range

```go
package main

import "fmt"

// range快速遍历map或slice
func main() {
	nums := []int{2, 3, 4}
	sum := 0
	for i, num := range nums {
		sum += num
		if num == 2 {
			fmt.Println("index:", i, "num:", num) // index: 0 num: 2
		}
	}
	fmt.Println(sum) // 9

	m := map[string]string{"a": "A", "b": "B"}
	for k, v := range m {
		fmt.Println(k, v) // b 8; a A
	}
	for k := range m {
		fmt.Println("key", k) // key a; key b
	}
}
```

## func

```go
package main

import "fmt"

func add(a int, b int) int {
	return a + b
}

func add2(a, b int) int {
	return a + b
}

// ok判断m[k]是否存在
func exists(m map[string]string, k string) (v string, ok bool) {
	v, ok = m[k]
	return v, ok
}

func main() {
	res := add(1, 2)
	fmt.Println(res) // 3

	v, ok := exists(map[string]string{"a": "A"}, "a")
	fmt.Println(v, ok) // A True
}
```

## point

```text
指针，指针是一个值，它的值是另一个变量的地址。指针的零值是nil。
作用是对传入的参数进行修改，而不是拷贝一份新的参数
```

```go
package main

import "fmt"

// 此写法无效
func add2(n int) {
	n += 2
}

func add2ptr(n *int) {
	*n += 2
}

func main() {
	n := 5
	add2(n)
	fmt.Println(n) // 5
	add2ptr(&n)    //为了类型匹配，调用的时候需要加上&符号，使编译通过
	fmt.Println(n) // 7
}
```

## struct

```text
结构体是带类型的字段的集合。它们的语法与C语言中的结构体相似，但是没有任何限制，字段的数量可以是任意的。
```

```go
package main

import "fmt"

type user struct {
	name     string
	password string
}

func main() {
	//结构体名称初始化结构体变量
	a := user{name: "wang", password: "102a"}
	b := user{"wang", "102b"}
	c := user{name: "wang"} // 只初始化了name字段，password字段为默认值""（空置）
	c.password = "102c"
	var d user
	d.name = "wang"
	d.password = "102d"

	fmt.Println(a, b, c, d)                 // {wang 1024} {wang 1024} {wang 1024} {wang 1024}
	fmt.Println(checkPassword(a, "haha"))   // false
	fmt.Println(checkPassword2(&a, "haha")) // false
}

func checkPassword(u user, password string) bool {
	return u.password == password
}

// 通过指针传递结构体，可以实现对结构体的修改，也可以避免大结构体拷贝的性能问题
func checkPassword2(u *user, password string) bool {
	return u.password == password
}
```

## struct-method

```go
package main

import "fmt"

type user struct {
	name     string
	password string
}

func (u user) checkPassword(password string) bool {
	return u.password == password
}

// (u *user)写在这里，相对于12，就从一个普通函数变为了类成员函数，直接可以通过a.方法名调用，这里的u就是类的实例，*user就是类的类型
func (u *user) resetPassword(password string) {
	u.password = password
}

func main() {
	a := user{name: "wang", password: "1024"}
	a.resetPassword("2048")              //重置密码
	fmt.Println(a.checkPassword("2048")) // true
}
```

## error

```text
Go的error类型实现了error接口，该接口定义了一个Error()方法，返回一个string类型的错误信息。相较于Java中的异常处理，操作更为简单。
```

```go
package main

import (
	"errors"
	"fmt"
)

type user struct {
	name     string
	password string
}

func findUser(users []user, name string) (v *user, err error) {
	for _, u := range users {
		if u.name == name {
			//没有错误
			return &u, nil
		}
	}
	//出现错误
	return nil, errors.New("not found")
}

func main() {
	u, err := findUser([]user{{"wang", "1024"}}, "wang")
	//判断err是否为nil（是否存在）
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println(u.name) // wang

	if u, err := findUser([]user{{"wang", "1024"}}, "li"); err != nil {
		fmt.Println(err) // not found
		return
	} else {
		fmt.Println(u.name)
	}
}
```

## String

```go
package main

import (
	"fmt"
	"strings"
)

func main() {
	a := "hello"
	fmt.Println(strings.Contains(a, "ll"))                // true   包含
	fmt.Println(strings.Count(a, "l"))                    // 2      计数
	fmt.Println(strings.HasPrefix(a, "he"))               // true    前缀
	fmt.Println(strings.HasSuffix(a, "llo"))              // true    后缀
	fmt.Println(strings.Index(a, "ll"))                   // 2       查找
	fmt.Println(strings.Join([]string{"he", "llo"}, "-")) // he-llo    连接
	fmt.Println(strings.Repeat(a, 2))                     // hellohello  重复
	fmt.Println(strings.Replace(a, "e", "E", -1))         // hEllo    替换
	fmt.Println(strings.Split("a-b-c", "-"))              // [a b c]  分割
	fmt.Println(strings.ToLower(a))                       // hello  	 转小写
	fmt.Println(strings.ToUpper(a))                       // HELLO   转大写
	fmt.Println(len(a))                                   // 5      长度
	b := "你好"
	fmt.Println(len(b)) // 6
}
```

## fmt

与Java和C++不同，Go中使用%v即可代表所有类型。

```go
package main

import "fmt"

// 格式化输出
type point struct {
	x, y int
}

func main() {
	s := "hello"
	n := 123
	p := point{1, 2}
	fmt.Println(s, n) // hello 123
	fmt.Println(p)    // {1 2}

	fmt.Printf("s=%v\n", s)  // s=hello
	fmt.Printf("n=%v\n", n)  // n=123
	fmt.Printf("p=%v\n", p)  // p={1 2}
	fmt.Printf("p=%+v\n", p) // p={x:1 y:2}
	fmt.Printf("p=%#v\n", p) // p=main.point{x:1, y:2}

	f := 3.141592653
	fmt.Println(f)          // 3.141592653
	fmt.Printf("%.2f\n", f) // 3.14
}
```

## Json

```go
package main

import (
	"encoding/json"
	"fmt"
)

type userInfo struct {
	//字段名首字母大写，那么结构体就可以用json.Marshal()于json的序列化和反序列化
	Name string
	//默认输出的json中，为大写。要改为小写，可json:"age"`
	Age   int `json:"age"`
	Hobby []string
}

func main() {
	a := userInfo{Name: "wang", Age: 18, Hobby: []string{"Golang", "TypeScript"}}
	buf, err := json.Marshal(a)
	if err != nil {
		panic(err)
	}
	fmt.Println(buf)         // [123 34 78 97...]
	fmt.Println(string(buf)) // {"Name":"wang","age":18,"Hobby":["Golang","TypeScript"]}

	buf, err = json.MarshalIndent(a, "", "\t")
	if err != nil {
		panic(err)
	}
	fmt.Println(string(buf))

	var b userInfo
	//反序列化到空的变量
	err = json.Unmarshal(buf, &b)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%#v\n", b) // main.userInfo{Name:"wang", Age:18, Hobby:[]string{"Golang", "TypeScript"}}
}
```

## Time

在Go中格式化时间不是使用的yyyy-MM-dd hh:mm:ss这种，而是使用2006-01-02 15:04:05。

```go
package main

import (
	"fmt"
	"time"
)

func main() {
	now := time.Now()
	fmt.Println(now) // 2022-03-27 18:04:59.433297 +0800 CST m=+0.000087933
	t := time.Date(2022, 3, 27, 1, 25, 36, 0, time.UTC)
	t2 := time.Date(2022, 3, 27, 2, 30, 36, 0, time.UTC)
	fmt.Println(t)                                                  // 2022-03-27 01:25:36 +0000 UTC
	fmt.Println(t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute()) // 2022 March 27 1 25

	// Format格式化时间
	fmt.Println(t.Format("2006-01-02 15:04:05")) // 2022-03-27 01:25:36

	// Sub计算两个时间的差值
	diff := t2.Sub(t)
	fmt.Println(diff)                           // 1h5m0s
	fmt.Println(diff.Minutes(), diff.Seconds()) // 65 3900

	t3, err := time.Parse("2006-01-02 15:04:05", "2022-03-27 01:25:36")
	if err != nil {
		panic(err)
	}
	fmt.Println(t3 == t) // true
	//时间戳
	fmt.Println(now.Unix()) // 1648738080
}
```

## strconv

```text
strconv包实现了基本数据类型和其字符串表示的相互转换。
```

```go
package main

import (
	"fmt"
	"strconv"
)

// strconv包实现了基本数据类型和其字符串表示的相互转换。
func main() {
	f, _ := strconv.ParseFloat("1.234", 64)
	fmt.Println(f) // 1.234

	n, _ := strconv.ParseInt("111", 10, 64) // 111是10进制，64是int64
	fmt.Println(n)                          // 111

	n, _ = strconv.ParseInt("0x1000", 0, 64)
	fmt.Println(n) // 4096

	n2, _ := strconv.Atoi("123")
	fmt.Println(n2) // 123

	n2, err := strconv.Atoi("AAA")
	fmt.Println(n2, err) // 0 strconv.Atoi: parsing "AAA": invalid syntax
}
```

## env

```go
package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	// go run example/20-env/main.go a b c d
	fmt.Println(os.Args)           // [/var/folders/8p/n34xxfnx38dg8bv_x8l62t_m0000gn/T/go-build3406981276/b001/exe/main a b c d]
	fmt.Println(os.Getenv("PATH")) // /usr/local/go/bin...
	fmt.Println(os.Setenv("AA", "BB"))

	//exec.Command函数返回一个*Cmd，用于使用给出的参数执行name指定的程序
	buf, err := exec.Command("grep", "127.0.0.1", "/etc/hosts").CombinedOutput()
	if err != nil {
		panic(err)
	}
	fmt.Println(string(buf)) // 127.0.0.1       localhost
}
```

# 语法实战：

## 猜数字小游戏

```go
package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	maxNum := 100                     //定义范围0-100之间
	rand.Seed(time.Now().UnixNano())  //用时间戳生成随机数种子（惯例用时间戳），不然每次都会生成相同的数
	secretNumber := rand.Intn(maxNum) //生成随机数
	// fmt.Println("The secret number is ", secretNumber)

	fmt.Println("Please input your guess")
	//读取输入  bufio.NewReader(os.Stdin) 从标准输入读取内容。转成只读的流这样就拥有很多方式去操作
	reader := bufio.NewReader(os.Stdin)
	for {
		input, err := reader.ReadString('\n') //读取输入的字符串
		if err != nil {
			fmt.Println("An error occured while reading input. Please try again", err)
			continue
		}
		//去掉字符串中的换行符
		input = strings.Trim(input, "\r\n")

		//将字符串转换成整数
		guess, err := strconv.Atoi(input)
		if err != nil {
			//转换失败统一打印错误
			fmt.Println("Invalid input. Please enter an integer value")
			continue //出错了跳出本次循环，继续下一次循环
		}
		fmt.Println("You guess is", guess)
		if guess > secretNumber {
			fmt.Println("Your guess is bigger than the secret number. Please try again")
		} else if guess < secretNumber {
			fmt.Println("Your guess is smaller than the secret number. Please try again")
		} else {
			fmt.Println("Correct, you Legend!")
			break //猜对了就退出for循环
		}
	}
}
```

# 引用：

以上内容部分来自：

- 字节内部课：Go 语言上手 - 基础语法
- Go语言教程 | 菜鸟教程

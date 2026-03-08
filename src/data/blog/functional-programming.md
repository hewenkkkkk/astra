---
title: "函数式编程-Java"
description: "Lambda表达式 规范 明确指明参数类型 代码多于一行，不能省略{}以及最后一行的return 可以根据上下文推断出参数类型是，可以省略参数类型 只有一个参数时，可以省略（） 1.(int a, int b) -> a + b; // 两"
pubDatetime: 2024-04-25T09:49:03Z
tags: 
   - java
draft: false
---

# Lambda表达式

规范

- 明确指明参数类型
- 代码多于一行，不能省略{}以及最后一行的return
- 可以根据上下文推断出参数类型是，可以省略参数类型
- 只有一个参数时，可以省略（）

```java
1.(int a, int b) -> a + b;   //  两个参数的int，要不都不加，要么都要加
2.(int a, int b) -> {int c = a =b; return c;};
3.Lambda1  lambda1= (a,b) -> a + b;
  interface Lambda1 {
    int sum(int a, int b);
  }
4.a->a;
```

# 方法引用

在IDEA中写(int a, int b) -> a + b;这段代码，会提示可以转化为方法引用。

下面代码可以Integer可以看为a，b参数，返回的是sum的求和的返回结果。

```java
(int a, int b) -> a+b;   =====>   Integer::sum;
```

## 函数接口定义

使用interface定义，参数和返回结果要求对应。（参数数量、参数类型、返回值类型）

```java
(int a, int b) -> a+b;
@FunctionalInterface  //检查是否只有一个抽象方法
interface Lambda1 {
    int sum(int a, int b);
}

@FunctionalInterface
//加上泛型后可以使扩展性更加好
interface Lambda1<T> {
    T sum(int a, int b);
}
```

例子：将下面普通方法改为函数接口

```java
public class Lam {
    public static void main(String[] args) {
    }

    static List<String> AtoB(List<Integer> list){
        List<String > res = new ArrayList<>();
        for (Integer s : list) {
            res.add(String.valueOf(s));
        }
        return res;
    }
}
```

思路：

- 函数对象为(Integer str)->String.valueOf(str) 。
- 分析参数和返回值（一个参数和一个返回值），就可以使用Java中的Function接口中的apply方法。

```java
public class Lam {
    public static void main(String[] args) {
        List<String> res = AtoB(List.of(4,5,9,3,7), (Integer str)->String.valueOf(str));
        System.out.println(res);
    }

    static List<String> AtoB(List<Integer> list, Function<Integer,String> func){
        List<String> res = new ArrayList<>();
        for (Integer s : list) {
            res.add(func.apply(s));
        }
        return res;
    }
}
```

常见的函数式接口：

Function<T, R>接收类型为T的参数并返回类型为R的结果的函数Predicate<T>接收类型为T的参数并返回一个布尔值的函数Consumer<T>
接收类型为T的参数并且不返回结果的函数Supplier<T>不接收参数但返回类型为T的结果的函数

## 闭包

函数对象（() -> num + 5）和外部的变量（num）成为一个整体，称为闭包。

```java
public class ClosureExample {
    public static void main(String[] args) {
        final int num = 10;
        IntSupplier closureLike = () -> num + 5;

        System.out.println(closureLike.getAsInt());  // 输出 15
    }
}
```

- 闭包只能捕获 final 或 effectively final 的局部变量。effectively final 是指在代码中没有被重新赋值的变量。如果尝试修改这些变量，编译器会报错。
- 一旦一个变量被闭包捕获，它就不能在外部被修改。

## 柯里化

将多参数的函数转换成一系列使用一个参数的函数来实现。

```java
public class CurryingExample {
    public static void main(String[] args) {
        // 柯里化函数：接受一个整数，返回一个函数，该函数接受另一个整数，返回这两个整数的和
        Function<Integer, Function<Integer, Integer>> add = a -> b -> a + b;

        // 创建一个新的函数，预设第一个参数为5
        Function<Integer, Integer>  add5 = add.apply(5);

        // 使用新的函数，传入第二个参数10
        System.out.println(add5.apply(10));  // 输出 15
    }
}
```

## 高阶函数

自定义实现Stream流可以参考，下面的代码为自实现的reduce操作。

```java
public class CustomStream<T> {
    private final List<T> elements;

    public CustomStream(List<T> elements) {
        this.elements = elements;
    }

    public T reduce(T o, BinaryOperator<T> accumulator) {
        T result = o;
        for (T element : elements) {
            result = accumulator.apply(result, element);
        }
        return result;
    }

    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
        CustomStream<Integer> customStream = new CustomStream<>(numbers);
        int sum = customStream.reduce(0, Integer::sum);
        System.out.println(sum); // Prints: 15
    }
}
```

# Stream流

集合集合.stream()数组Arrays.stream(数组)对象Stream.of(对象……)Stream创建

Stream流就是JDK封装的一组高阶函数。

## 过滤-filter

```java
//给定一个字符串列表，过滤掉长度大于等于 5 的字符串，并将剩余的字符串转换为大写形式。
List<String> list = Arrays.asList("Apple", "Banana", "Cherry", "Date", "Elderberry");
//将流中的每个元素转换为另一种形式。map方法接收一个函数作为参数，这个函数会被应用到每个元素上，并将其映射成一个新的元素。
list.stream().filter(s->s.length()<5).map(String::toUpperCase).forEach(System.out::println);
```

## 映射-map

将一个对象转换为一个新的对象。

```java
List<String> list = Arrays.asList("Apple", "Banana", "Cherry", "Date", "Elderberry");

        List<String> upperCaseList = list.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList());

        System.out.println(upperCaseList);
       //[APPLE, BANANA, CHERRY, DATE, ELDERBERRY]
```

## 降维-flatMap

将所有这些流连接成一个流。

```java
public class Main {
    public static void main(String[] args) {
        List<List<String>> listOfLists = Arrays.asList(
            Arrays.asList("Apple", "Banana"),
            Arrays.asList("Cherry", "Date"),
            Arrays.asList("Elderberry", "Fig")
        );

        List<String> flatList = listOfLists.stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());

        System.out.println(flatList);

        //[Apple, Banana, Cherry, Date, Elderberry, Fig]
    }
}
```

## 合并-concat

将两个流合并为一个流。

```java
Stream<String> stream1 = Stream.of("Apple", "Banana");
Stream<String> stream2 = Stream.of("Cherry", "Date");

Stream<String> concatStream = Stream.concat(stream1, stream2);

concatStream.forEach(System.out::println);  //Apple, Banana, Cherry, Date
```

flatMap方法用于将流的每个元素转换为另一个流，然后将所有这些流连接成一个流。 concat方法用于将两个流连接成一个流。这通常用于将两个独立的流合并为一个流

## 截取

skip(long n)跳过n个数据，保留剩下的limit(long n)保留n个数据。剩下的不要takeWhile(Predicate p)
接收一个断言作为参数，从流中的第一个元素开始，一直获取满足断言的元素，直到遇到一个不满足断言的元素，然后停止dropWhile(
Predicate p)接收一个断言作为参数，从流中的第一个元素开始，一直跳过满足断言的元素，直到遇到一个不满足断言的元素，然后返回剩余的元素。

```java
List<String> list = Arrays.asList("Apple", "Banana", "Cherry", "Date", "Elderberry");

List<String> skippedList = list.stream()
    .skip(2)
    .collect(Collectors.toList());

System.out.println(skippedList);  //[Cherry, Date, Elderberry]

List<String> limitedList = list.stream()
     .limit(3)
     .collect(Collectors.toList());

System.out.println(limitedList);  //[Apple, Banana, Cherry]

List<Integer> list = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

List<Integer> takenList = list.stream()
     .takeWhile(n -> n < 5)
     .collect(Collectors.toList());

System.out.println(takenList);  //[1, 2, 3, 4]

List<Integer> droppedList = list.stream()
     .dropWhile(n -> n < 5)
     .collect(Collectors.toList());

System.out.println(droppedList);  //[5, 6, 7, 8, 9, 10]
```

## 判断

findFirst返回列表中的第一个元素findAny回列表中的任意一个元素（并行流中，能会返回任何一个元素，而不一定是第一个）

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

Optional<Integer> firstNumber = numbers.stream().findFirst();
firstNumber.ifPresent(System.out::println); //  1

Optional<Integer> anyNumber = numbers.stream().findAny();
anyNumber.ifPresent(System.out::println);
```

Optional可以使用 .orElse() 设置默认值

## 查找

anyMatch()有一个满足条件就返回trueallMatch所有都满足条件返回truenoneMatch所有都不满足条件返回true

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

Predicate<Integer> isEven = n -> n % 2 == 0;//偶数

boolean anyMatch = numbers.stream().anyMatch(isEven);
System.out.println(anyMatch); // true

boolean allMatch = numbers.stream().allMatch(isEven);
System.out.println(allMatch); //  false

boolean noneMatch = numbers.stream().noneMatch(isEven);
System.out.println(noneMatch); // false
```

## 去重-distinct

```java
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 4, 4, 5, 5);
List<Integer> distinctNumbers = numbers.stream().distinct().collect(Collectors.toList());
System.out.println(distinctNumbers); // [1, 2, 3, 4, 5]
```

## 排序

 ```java
List<Person> people = Arrays.asList(
     new Person("Alice", 20),
     new Person("Bob", 30),
      new Person("Charlie", 25)
);

List<Person> sortedPeople = people.stream()
.sorted(Comparator.comparingInt(Person::getAge))
//.sorted(Comparator.comparingInt(Person::getAge).reversed())   降序
// 成绩降序,成绩相等的按满足长度排名
//.sorted(Comparator.comparingInt(Person::getAge).reversed().thenComparingInt(h->h.name().length()))
.collect(Collectors.toList());

System.out.println(sortedPeople); // [Alice: 20, Charlie: 25, Bob: 30]
```

## 化简-reduce

将流中的所有元素组合成一个单一的结果,比如求和,最大值等

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.stream().reduce(0, Integer::sum);
System.out.println(sum); //  15
```

## 收集器-collect

collect()有三个参数,第一个是创建要返回的什么容器,第二个为将元素加入创建的容器中,第三个参数是一个合并函数（combiner）。它用于处理并行流中的结果合并。

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

List<Integer> evenNumbers = numbers.stream()
      .filter(n -> n % 2 == 0)
      .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
```

每次使用的时候都要添加三个参数,实在麻烦,可以使用收集器来使代码代码更加简洁

常用收集器方法：

| 方法名 | 描述 | 示例用法 |
|---|---|---|
| toList() | 收集流中的所有元素到一个 List | `stream.collect(Collectors.toList())` |
| toSet() | 收集流中的所有元素到一个 Set，自动去重 | `stream.collect(Collectors.toSet())` |
| toMap() | 收集元素到一个 Map，需要指定键和值的映射函数 | `stream.collect(Collectors.toMap(keyMapper, valueMapper))` |
| joining() | 连接流中的字符串元素 | `stream.collect(Collectors.joining(", "))` |
| groupingBy() | 根据某个函数的结果对元素分组，返回一个 Map | `stream.collect(Collectors.groupingBy(classifier))` |
| partitioningBy() | 根据布尔条件将元素分为两部分 | `stream.collect(Collectors.partitioningBy(predicate))` |
| counting() | 计算流中的元素总数 | `stream.collect(Collectors.counting())` |
| summarizingInt() | 为流中的整数元素提供摘要统计（count/sum/min/max/avg） | `stream.collect(Collectors.summarizingInt(toIntFunction))` |
| averagingInt() | 计算流中整数元素的平均值 | `stream.collect(Collectors.averagingInt(toIntFunction))` |
| summingInt() | 对流中的整数元素求和 | `stream.collect(Collectors.summingInt(toIntFunction))` |
| maxBy() | 根据比较器选出最大元素 | `stream.collect(Collectors.maxBy(comparator))` |
| minBy() | 根据比较器选出最小元素 | `stream.collect(Collectors.minBy(comparator))` |
| reducing() | 通过结合函数（binaryOperator）从流中归约生成一个值 | `stream.collect(Collectors.reducing(binaryOperator))` |

# 实战

## 题目

[文件资料--百度网盘](https://pan.baidu.com/s/1-ULU4vqp8HfspSnt3-dRSw?pwd=o0ud)

- 统计每月的销售量
- 统计销售量最高的月份
- 统计销售量最高的商品
- 下单最多的前10用户
- 每个地区下单最多的用户
- 每个地区下单最多的前三用户

## 答案

```java
统计每月的销售量
private static void case1() {
        try (Stream<String> lines = Files.lines(Path.of("./data.txt"))) {
            Map<YearMonth, Long> collect = lines.skip(1)
                    .map(line -> line.split(","))
                    .collect(groupingBy(array -> YearMonth.from(formatter.parse(array[TIME])), TreeMap::new, counting()));
            for (Map.Entry<YearMonth, Long> e : collect.entrySet()) {
                System.out.println(e);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
```

YearMonth.from() 获取日期格式中指定的数据

```java
统计销售量最高的月份
private static void case2() {
        try (Stream<String> lines = Files.lines(Path.of("./data.txt"))) {
            Map<YearMonth, Long> collect = lines.skip(1)
                    .map(line -> line.split(","))
                    .collect(groupingBy(array -> YearMonth.from(formatter.parse(array[TIME])), TreeMap::new, counting()));

            final Optional<Map.Entry<YearMonth, Long>> max = collect.entrySet().stream().max(Comparator.comparingLong(e -> e.getValue()));
            System.out.println(max.get());
            for (Map.Entry<YearMonth, Long> e : collect.entrySet()) {
                System.out.println(e);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
```

```java
统计销售量最高的商品
private static void case3() {
        try (Stream<String> lines = Files.lines(Paths.get("./data.txt"))) {
            lines.skip(1).map(line ->line.split(","))
                    .collect(groupingBy(array -> array[PRODUCT_ID], TreeMap::new, counting()))
                    .entrySet().stream().max(Map.Entry.comparingByValue()).ifPresent(System.out::println);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
}
```

```java
下单最多的前10用户
    private static void case41() {
        try (Stream<String> lines = Files.lines(Path.of("./data.txt"))) {
            Map<String, Long> collect = lines.skip(1)
                    .map(line -> line.split(","))
                    .collect(groupingBy(array -> array[USER_ID], counting()));
//            for (Map.Entry<String, Long> e : collect.entrySet()) {
//                System.out.println(e);
//            }
            collect.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(10)
                    .forEach(System.out::println);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
```

Map.Entry.<String, Long>comparingByValue().reversed() 在使用comparingByValue()
方法时，如果你不指定泛型类型，编译器将尝试根据上下文推断泛型类型。但在某些情况下，编译器可能无法准确地推断出泛型类型，因此会导致编译错误。
所以需要在Map.Entry.<String, Long>中指定泛型类型。

```java
每个地区下单最多的用户
    private static void case51() {
        try (Stream<String> lines = Files.lines(Path.of("./data.txt"))) {
            final Stream<Map.Entry<String, Map.Entry<String, Long>>> entryStream = lines.skip(1)
                    .map(line -> line.split(","))
                    .collect(groupingBy(array -> array[USER_REGION], groupingBy(array -> array[USER_ID], counting())))
                    .entrySet().stream()
                    .map(e -> Map.entry(
                            e.getKey(),
                            e.getValue().entrySet().stream()
                                    .max(Map.Entry.comparingByValue())
                                    .get()
                    ));

            entryStream.forEach(System.out::println);

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
```

```java
每个地区下单最多的前三用户
private static void case52() {
        try (Stream<String> lines = Files.lines(Path.of("./data.txt"))) {
            final Stream<Map.Entry<String, List<Map.Entry<String, Long>>>> entryStream = lines.skip(1)
                    .map(line -> line.split(","))
                    .collect(groupingBy(array -> array[USER_REGION], groupingBy(array -> array[USER_ID], counting())))
                    .entrySet().stream()
                    .map(e -> Map.entry(
                            e.getKey(),
                            e.getValue().entrySet().stream()
                                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                                    .limit(3)
                                    .collect(toList())
                    ));

            entryStream.forEach(System.out::println);

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
```

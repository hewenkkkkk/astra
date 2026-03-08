---
title: "JavaStream流"
description: "什么是Stream流用于简化集合和数组操作的API"
pubDatetime: 2022-11-27T06:55:15Z
tags: 
   - java
draft: false
---

# 一、什么是Stream流

用于简化集合和数组操作的API。

# 二、Stream流的思想和使用步骤

1. 先得到集合或者数组的Stream流（就是一根传送带）。 
2. 把元素放上去。 
3. 然后就用这个Stream流简化的API来方便的操作元素。

# 三、Stream流的好处，和普通写法进行对比

代码如下（示例）：

```java
package Stream;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

//初步认识Stream流的好处，和普通写法进行对比
//需求：将名字中姓张的取出，再取出只有3个字的
public class Stream_test {
    public static void main(String[] args) {
        //普通写法
        List<String> names = new ArrayList<>();
        Collections.addAll(names,"张三丰","张无极","效率","张力","函数");

        List<String> zhang = new ArrayList<>();//创建集合放姓张的名字
        for (String zh:names){
            if (zh.startsWith("张")){ //  startsWith()判断字符串以什么开头，是返回true
                zhang.add(zh);
            }
        }

        List<String> z = new ArrayList<>();//将3个子的姓张的集合
        for (String zs:zhang){
            if (zs.length()==3){
                z.add(zs);
            }
        }
        System.out.println(z);

        //Stream流写法
        names.stream().filter(s -> s.startsWith("张")).filter(s -> s.length()==3).forEach(s -> System.out.println(s));
    }
}
```

# 四、Stream流的获取

集合获取Stream的方式是通过调用stream()方法实现

代码如下（示例）：

```java
package Stream;

import java.util.*;
import java.util.stream.Stream;

/**
 Stream流的三类方法:
 1.获取Stream流
 2.中间方法
 3.终结方法
 */
public class get_Stream {
    public static void main(String[] args) {
        /**-----------------------Collection集合获取Stream流-----------------------*/
        Collection<String> s = new ArrayList<>();
        Stream<String> st = s.stream();

        /**----------------------Map集合获取Stream流-------------------------------*/
        Map<String,Integer> map = new HashMap<>();
        //键流
        Stream<String> keyStream = map.keySet().stream();
        //值流
        Stream<Integer> valueStream = map.values().stream();
        //键值流
        Stream<Map.Entry<String, Integer>> stream = map.entrySet().stream();

        /**--------------------数组获取Stream流------------------------------------*/
        String[] sc = {"是","看","加法","火车"};
        //方法一
        Stream<String> cv = Arrays.stream(sc);
        //方法二
        Stream<String> cv2 = Stream.of(sc);
    }
}
```

# 五、Stream流常用API

中间操作方法 (非终结方法，调用完成后返回新的Stream流可以继续使用，支持链式编程)：

- filter : 过滤元素 -- Stream filter(Predicate predicate)
- limit : 取前几个元素
- skip : 跳过前几个
- map : 加工方法
- concat : 合并流。 终结操作方法 (调用完成后流就无法继续使用了)：
- void forEach(Consumer action) 对此流的每个元素执行遍历操作
- long count() 返回此流中的元素数 代码如下： Student类

```java
package Stream;

public class Student {
    private String name;

    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                '}';
    }
}
```

API:

```java
package Stream;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

/**
 *          forEach : 逐一处理(遍历)
 *          count：统计个数
 *             -- long count();
 *          filter : 过滤元素
 *             -- Stream<T> filter(Predicate<? super T> predicate)
 *          limit : 取前几个元素
 *          skip : 跳过前几个
 *          map : 加工方法
 *          concat : 合并流。
 */
//Stream_API(中间操作方法)
public class Stream_API_Student {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("张卡车");
        list.add("周新华");
        list.add("赵敏");
        list.add("张可");
        list.add("张思米");
        list.add("张三");

        // Stream<T> filter(Predicate<? super T> predicate)
        list.stream().filter(s -> s.startsWith("张")).forEach(s -> System.out.println(s));

        long size = list.stream().filter(s -> s.length() == 3).count();
        System.out.println(size);

        // list.stream().filter(s -> s.startsWith("张")).limit(2).forEach(s -> System.out.println(s));
        list.stream().filter(s -> s.startsWith("张")).limit(2).forEach(System.out::println);

        list.stream().filter(s -> s.startsWith("张")).skip(2).forEach(System.out::println);

        // map加工方法: 第一个参数原材料  -> 第二个参数是加工后的结果。
        // 给集合元素的前面都加上一个：报导：
        list.stream().map(s -> "报导：" + s).forEach(a -> System.out.println(a));

        // 需求：把所有的名称 都加工成一个学生对象。
        list.stream().map(s -> new Student(s)).forEach(s -> System.out.println(s));
//        list.stream().map(Student::new).forEach(System.out::println); // 构造器引用  方法引用

        // 合并流。
        Stream<String> s1 = list.stream().filter(s -> s.startsWith("张"));
        Stream<String> s2 = Stream.of("java1", "java2");
        // public static <T> Stream<T> concat(Stream<? extends T> a, Stream<? extends T> b)
        Stream<String> s3 = Stream.concat(s1 , s2);
        s3.distinct().forEach(s -> System.out.println(s));
    }
}
```

# 六、收集Stream流

```
收集Stream流： 就是把Stream流操作后的结果数据转回到集合或者数组中去。
Stream流的收集方法： R collect(Collector collector) 开始收集Stream流，指定收集器
Collectors工具类提供了具体的收集方式: public staticCollector toList() 把元素收集到List集合中 public staticCollector
toSet() 把元素收集到Set集合中 public static Collector toMap(Function keyMapper , Function valueMapper) 把元素收集到Map集合中
```

代码如下

```java
package Stream;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 *
 收集Stream流的含义：就是把Stream流操作后的结果数据转回到集合或者数组中去。

 Stream流的收集方法：
 R collect(Collector collector) 开始收集Stream流，指定收集器

 Collectors工具类提供了具体的收集方式:
 public static <T> Collector toList()   把元素收集到List集合中
 public static <T> Collector toSet()    把元素收集到Set集合中
 public static  Collector toMap(Function keyMapper , Function valueMapper)  把元素收集到Map集合中

 */
public class Stream_collect {
    public static void main(String[] args){
        List<String> list = new ArrayList<>();
        list.add("张卡车");
        list.add("周新华");
        list.add("赵敏");
        list.add("张可");
        list.add("张思米");
        list.add("张三");
        Stream<String> z =list.stream().filter(s->s.startsWith("张"));
        List<String> z1 = z.collect(Collectors.toList());
        System.out.println(z1);
//        Set<String> z2 = z.collect(Collectors.toSet());
//        System.out.println(z2);

        //放入数组
        Stream<String> k =list.stream().filter(s->s.startsWith("张"));
        Object[] k1 = k.toArray();
        System.out.println(Arrays.toString(k1));
    }
}
```

# 综合案例

Employee类 下面展示一些 内联代码片。

```java
package Stream;

public class Employee {
    private String name;
    private char sex;
    private int monry;
    private int salary;
    private String zuo;

    public Employee(String name, char sex, int monry, int salary, String zuo) {
        this.name = name;
        this.sex = sex;
        this.monry = monry;
        this.salary = salary;
        this.zuo = zuo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public char getSex() {
        return sex;
    }

    public void setSex(char sex) {
        this.sex = sex;
    }

    public int getMonry() {
        return monry;
    }

    public void setMonry(int monry) {
        this.monry = monry;
    }

    public int getSalary() {
        return salary;
    }

    public void setSalary(int salary) {
        this.salary = salary;
    }

    public String getZuo() {
        return zuo;
    }

    public void setZuo(String zuo) {
        this.zuo = zuo;
    }

    @Override
    public String toString() {
        return "Employee{" +
                "name='" + name + '\'' +
                ", sex=" + sex +
                ", monry=" + monry +
                ", salary=" + salary +
                ", zuo='" + zuo + '\'' +
                '}';
    }
}
```

toppeople类：

```java
package Stream;

public class toppeople {
    private String name;
    private char sex;

    public toppeople(String name, char sex) {
        this.name = name;
        this.sex = sex;
    }

    public String setName(){
        return this.name;
    }
    public  void getName(String name){
        this.name=name;
    }

    public char setSex(){
        return sex;
    }
    public void getSex(char sex){
        this.sex=sex;
    }

    @Override
    public String toString() {
        return "toppeople{" +
                "name='" + name + '\'' +
                ", sex=" + sex +
                '}';
    }
}
```

test类：

```java
package Stream;

import java.util.ArrayList;
import java.util.List;

public class Stream_example_toppeople_Employyee {
    public static double sum;//定义全局变量，具体用法见36行
    public static void main(String[] args) {
        List<Employee> one = new ArrayList<>();
        one.add(new Employee("猪八戒",'男',30000 , 25000, null));
        one.add(new Employee("孙悟空",'男',25000 , 1000, "顶撞上司"));
        one.add(new Employee("沙僧",'男',20000 , 20000, null));
        one.add(new Employee("小白龙",'男',20000 , 25000, null));

        List<Employee> two = new ArrayList<>();
        two.add(new Employee("武松",'男',15000 , 9000, null));
        two.add(new Employee("李逵",'男',20000 , 10000, null));
        two.add(new Employee("西门庆",'男',50000 , 100000, "被打"));
        two.add(new Employee("潘金莲",'女',3500 , 1000, "被打"));
        two.add(new Employee("武大郎",'女',20000 , 0, "下毒"));

        //取出monry+salary最高的员工
        Employee employee=one.stream().max((s1,s2)->Double.compare(s1.getMonry()+ s1.getSalary(),s2.getMonry()+s2.getSalary()))
                .get();//因为只有一个对象，所以用不着遍历，直接用.get()即可
        System.out.println(employee);

        //将monry+salary最高的员工封装到优秀员工类中（toppeople）
        toppeople Good=one.stream().max((s1,s2)->Double.compare(s1.getMonry()+ s1.getSalary(),s2.getMonry()+s2.getSalary()))
                .map(e->new toppeople(e.getName(), e.getSex())).get();
        System.out.println(Good);

        //分别统计两个部门的平均月收入（去掉最高和最低）
        //一部平均工资
        /**
            灰色部分是排序的规则，sorted()是排序的方法，
            应该它是原本有一个排序规则，但是我们要自定义规则，
            所以就直接把灰色的自定义排序规则放进去
         */
        one.stream().sorted((s1,s2)->Double.compare(s1.getMonry()+ s1.getSalary(),s2.getMonry()+s2.getSalary()))
                .skip(1).limit(one.size()-2).forEach(e->{
                    sum += (e.getMonry()+e.getSalary());//{}里面也算是一个方法，变量只能再一个方法里面使用，所以全局变量要定义在main方法外
                });
        System.out.println("部门一的平均工资："+sum/(one.size()-2));
    }
}
```

# 总结

Stream流是操作集合/数组的手段。 操作的结果数据最终要恢复到集合或者数组中去。 在Stream流中无法直接修改集合、数组中的数据。

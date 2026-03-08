---
title: "SpringMVC参数传递"
description: "前言 本文get/post请求使用postman进行完成，具体使用方法可看此文--->Postman 提示：User类和Address将会放在文章末尾处 一、请求类型参数 1.普通参数 1.参数名与形参名相同 postman页面： 代码："
pubDatetime: 2022-12-27T06:52:51Z
tags:
  - SpringMVC
draft: false
---

# 前言

本文get/post请求使用postman进行完成，具体使用方法可看此文--->[Postman](https://blog.csdn.net/zbj18314469395/article/details/106693615)
提示：User类和Address将会放在文章末尾处

# 一、请求类型参数

## 1.普通参数

### 1.参数名与形参名相同

postman页面：

![](https://images.xcnv.com/2022/11/02/63614b151c852.jpg)

代码：

```java
//普通参数：请求参数与形参名称对应即可完成参数传递
    @RequestMapping("/commonParam")
    @ResponseBody
    public String commonParam(String name ,int age){
        System.out.println("普通参数传递 name ==> "+name);
        System.out.println("普通参数传递 age ==> "+age);
        return "{'module':'common param'}";
    }
```

运行结果：

![](https://images.xcnv.com/2022/11/02/63614b264705d.jpg)

### 2.参数名与形参名不同

当请求参数名与形参名不同时，使用 @RequestParam注解关联请求参数名称与形参名称之间的关系

```java
@RequestMapping("/commonParamDifferentName")
    @ResponseBody
    public String commonParamDifferentName(@RequestParam("name") String userName , int age){
        System.out.println("普通参数传递 userName ==> "+userName);
        System.out.println("普通参数传递 age ==> "+age);
        return "{'module':'common param different name'}";
    }
```

## 2.POJO类型参数

提示：User类中有name和age两个属性

postman：

![](https://images.xcnv.com/2022/11/02/63614b3174b55.jpg)

代码：

```java
//POJO参数：请求参数与形参对象中的属性对应即可完成参数传递
    @RequestMapping("/pojoParam")
    @ResponseBody
    public String pojoParam(User user){
        System.out.println("pojo参数传递 user ==> "+user);
        return "{'module':'pojo param'}";
    }
```

运行结果：

![](https://images.xcnv.com/2022/11/02/63614b4195d39.jpg)

## 3.嵌套POJO类型参数

提示：User类中嵌套Address类

postman：

![](https://images.xcnv.com/2022/11/02/63614b4e9f65c.jpg)

代码：

```java
//嵌套POJO参数：嵌套属性按照层次结构设定名称即可完成参数传递
    @RequestMapping("/pojoContainPojoParam")
    @ResponseBody
    public String pojoContainPojoParam(User user){
        System.out.println("pojo嵌套pojo参数传递 user ==> "+user);
        return "{'module':'pojo contain pojo param'}";
    }
```

运行结果：

![](https://images.xcnv.com/2022/11/02/63614b631405b.jpg)

## 4. 数组类型参数

postman：

![](https://images.xcnv.com/2022/11/02/63614b6c421f5.jpg)

代码：

```java
//数组参数：同名请求参数可以直接映射到对应名称的形参数组对象中
    @RequestMapping("/arrayParam")
    @ResponseBody
    public String arrayParam(String[] likes){
        System.out.println("数组参数传递 likes ==> "+ Arrays.toString(likes));
        return "{'module':'array param'}";
    }
```

运行结果：

![](https://images.xcnv.com/2022/11/02/63614b7b9eb08.jpg)

## 5.集合类型参数

集合类型参数同名请求参数可以使用 @RequestParam注解映射到对应名称的集合对象中作为数据。 没有加@RequestParam，会尝试造List<
String>类型(引用类型)的对象，报错java.lang.NoSuchMethodException: java.util.List.<init>()，

```java
//集合参数：同名请求参数可以使用@RequestParam注解映射到对应名称的集合对象中作为数据
    @RequestMapping("/listParam")
    @ResponseBody
    public String listParam(@RequestParam List<String> likes){
        System.out.println("集合参数传递 likes ==> "+ likes);
        return "{'module':'list param'}";
    }
```

# 二、json数据

1.加入json的坐标

```xml

<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.0</version>
</dependency>
```

2.SpringMVC配置类加上注解 @EnableWebMvc开启json数据类型自动转换

```java
package com.hewen.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@ComponentScan("com.hewen.controller")
//开启json数据类型自动转换
@EnableWebMvc
public class SpringMvcConfig {
}
```

## 1.json数组

postman：

![](https://images.xcnv.com/2022/11/02/63614b88c46af.jpg)

使用 @RequestBody注解将外部传递的json数组数据映射到形参的集合对象中作为数据

代码：

```java
//集合参数：json格式
    //1.开启json数据格式的自动转换，在配置类中开启@EnableWebMvc
    //2.使用@RequestBody注解将外部传递的json数组数据映射到形参的集合对象中作为数据
    @RequestMapping("/listParamForJson")
    @ResponseBody
    public String listParamForJson(@RequestBody List<String> likes){
        System.out.println("list common(json)参数传递 list ==> "+likes);
        return "{'module':'list common for json param'}";
    }
```

运行结果：

![](https://images.xcnv.com/2022/11/02/63614b93d531e.jpg)

## 2.json对象(POJO)

postman：

![](https://images.xcnv.com/2022/11/02/63614ba080363.jpg)

代码：

```java
//POJO参数：json格式
    //1.开启json数据格式的自动转换，在配置类中开启@EnableWebMvc
    //2.使用@RequestBody注解将外部传递的json数据映射到形参的实体类对象中，要求属性名称一一对应
    @RequestMapping("/pojoParamForJson")
    @ResponseBody
    public String pojoParamForJson(@RequestBody User user){
        System.out.println("pojo(json)参数传递 user ==> "+user);
        return "{'module':'pojo for json param'}";
    }
```

运行结果：

![](https://images.xcnv.com/2022/11/02/63614bad43e48.jpg)

## 3.json数组(POJO)

```java
//集合参数：json格式
    //1.开启json数据格式的自动转换，在配置类中开启@EnableWebMvc
    //2.使用@RequestBody注解将外部传递的json数组数据映射到形参的保存实体类对象的集合对象中，要求属性名称一一对应
    @RequestMapping("/listPojoParamForJson")
    @ResponseBody
    public String listPojoParamForJson(@RequestBody List<User> list){
        System.out.println("list pojo(json)参数传递 list ==> "+list);
        return "{'module':'list pojo for json param'}";
    }
```

运行结果：

![](https://images.xcnv.com/2022/11/02/63614bbf7dd0f.jpg)

# 三、日期型参数

使用 @DateTimeFormat注解设置日期类型数据格式，默认格式yyyy/MM/dd

```java
//日期参数
    //使用@DateTimeFormat注解设置日期类型数据格式，默认格式yyyy/MM/dd
    @RequestMapping("/dataParam")
    @ResponseBody
    public String dataParam(Date date,
                            @DateTimeFormat(pattern="yyyy-MM-dd") Date date1,
                            @DateTimeFormat(pattern="yyyy/MM/dd HH:mm:ss") Date date2){
        System.out.println("参数传递 date ==> "+date);
        System.out.println("参数传递 date1(yyyy-MM-dd) ==> "+date1);
        System.out.println("参数传递 date2(yyyy/MM/dd HH:mm:ss) ==> "+date2);
        return "{'module':'data param'}";
    }
```

# 四、源码

结构：

![](https://images.xcnv.com/2022/11/02/63614bd276298.jpg)

User类：

```java
package com.hewen.domain;

public class User {
    private String name;
    private int age;

    private Address address;

    @Override
    public String toString() {
        return "User{" +
                "name='" + name + '\'' +
                ", age=" + age +
                ", address=" + address +
                '}';
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

//    @Override
//    public String toString() {
//        return "User{" +
//                "name='" + name + '\'' +
//                ", age=" + age +
//                '}';
//    }
}
```

Address类：

```java
package com.hewen.domain;

public class Address {
    private String province;
    private String city;

    @Override
    public String toString() {
        return "Address{" +
                "province='" + province + '\'' +
                ", city='" + city + '\'' +
                '}';
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}
```

# 五、总结

本文注解：

- @RequestParam注解关联请求参数名称与形参名称之间的关系
- @RequestBody注解将外部传递的json数组数据映射到形参的集合对象中作为数据
- @EnableWebMvc开启json数据类型自动转换
- @DateTimeFormat注解设置日期类型数据格式
